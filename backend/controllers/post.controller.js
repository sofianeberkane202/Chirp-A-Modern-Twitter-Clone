import mongoose from "mongoose";
import Post from "../models/post.model.js";
import Comment from "../models/comment.model.js";
import { asyncCatch } from "../utils/asyncCatch.js";
import { uploadToCloudinary, getPublicId } from "../utils/handleUploadImage.js";
import cloudinary from "../config/cloudinary.js";
import Notification from "../models/notification.model.js";
import User from "../models/user.model.js";
import APIFeatures from "../utils/APIFeatuers.js";

export const createPost = asyncCatch(async (req, res, next) => {
  const { text } = req.body;
  let { img } = req.files;
  const currentUserId = req.user.id;

  if (!img || !text) {
    return res.status(400).json({
      status: "fail",
      message: "Missing required fields",
    });
  }

  img = await uploadToCloudinary(img[0]);

  const post = await Post.create({ user: currentUserId, text, img });

  res.status(200).json({
    status: "success",
    message: "post created successfully",
  });
});

export const deletePost = asyncCatch(async (req, res, next) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      status: "fail",
      message: "Invalid post id",
    });
  }

  const post = await Post.findByIdAndDelete(id, { new: true });
  if (!post) {
    return res.status(404).json({
      status: "fail",
      message: "Post not found",
    });
  }

  if (post.img) {
    const publicId = getPublicId(post.img);
    try {
      const result = await cloudinary.uploader.destroy(publicId);
      // console.log("Cloudinary destroy result:", result);
    } catch (error) {
      console.error("Cloudinary delete error:", error);
    }
  }

  res.status(200).json({
    status: "success",
    message: "Post deleted successfully",
    data: {
      post,
    },
  });
});

export const commentOnPost = asyncCatch(async (req, res, next) => {
  const { id } = req.params;
  const { text } = req.body;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      status: "fail",
      message: "Invalid post id",
    });
  }

  if (text.trim() === "") {
    return res.status(400).json({
      status: "fail",
      message: "Comment cannot be empty",
    });
  }

  const post = await Post.findById(id);

  if (!post) {
    return res.status(404).json({
      status: "fail",
      message: "Post not found",
    });
  }

  const comment = await Comment.create({ user: req.user.id, text });

  post.comments.push(comment._id);
  await post.save();

  // create notification
  const notification = await Notification.create({
    from: req.user.id,
    to: post.user,
    type: "comment",
  });

  res.status(200).json({
    status: "success",
    message: "comment created successfully",
  });
});

export const likeUnlikePost = asyncCatch(async (req, res, next) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      status: "fail",
      message: "Invalid post id",
    });
  }

  const post = await Post.findById(id);

  if (!post) {
    return res.status(404).json({
      status: "fail",
      message: "Post not found",
    });
  }

  if (post.likes.includes(req.user.id)) {
    post.likes = post.likes.filter((like) => like.toString() !== req.user.id);
    await User.updateOne({ _id: req.user.id }, { $pull: { likePosts: id } });
    await post.save();

    return res.status(200).json({
      status: "success",
      message: "Post unliked successfully",
    });
  } else {
    post.likes.push(req.user.id);
    await User.updateOne({ _id: req.user.id }, { $push: { likePosts: id } });
    await post.save();

    const notification = await Notification.create({
      from: req.user.id,
      to: post.user,
      type: "like",
    });

    return res.status(200).json({
      status: "success",
      message: "Post liked successfully",
    });
  }
});

const populatePostQuery = (query) =>
  query
    .populate("user", "username fullName profileImg createdAt")
    .populate({
      path: "comments",
      select: "text",
      populate: {
        path: "user",
        select: "profileImg username",
      },
    })
    .sort({ createdAt: -1 })
    .lean();

export const getAllPosts = asyncCatch(async (req, res, next) => {
  const query = populatePostQuery(Post.find());
  const feature = new APIFeatures(query, req.query);
  feature.pagination();

  const posts = await feature.query;
  const hasMore = posts.length > 0;

  res.status(200).json({
    status: "success",
    length: posts.length,
    page: Number(req.query.page) || 1,
    hasMore,
    data: { posts },
  });
});

export const getLikedPosts = asyncCatch(async (req, res, next) => {
  const userId = req.params.id;

  const user = await User.findById(userId);

  if (!user) {
    return res.status(404).json({
      status: "fail",
      message: "User not found",
    });
  }

  const query = Post.find({ _id: { $in: user.likePosts } })
    .populate("user", "username fullName profileImg createdAt")
    .populate({
      path: "comments",
      select: "text",
      populate: {
        path: "user",
        select: "profileImg username",
      },
    })
    .sort({ createdAt: -1 })
    .lean();

  const feature = new APIFeatures(query, req.query);
  feature.pagination();
  const likedPosts = await feature.query;

  const hasMore = likedPosts.length > 0;

  res.status(200).json({
    status: "success",
    page: Number(req.query.page) || 1,
    hasMore,
    data: {
      likedPosts,
    },
  });
});

export const getAllFollowingPosts = asyncCatch(async (req, res, next) => {
  const currentUserId = req.user.id;
  const user = await User.findById(currentUserId);

  if (!user) {
    return next(new AppError("User not found", 404));
  }

  const query = populatePostQuery(Post.find({ user: { $in: user.following } }));
  const feature = new APIFeatures(query, req.query);
  feature.pagination();

  const followingPosts = await feature.query;
  const hasMore = followingPosts.length > 0;

  res.status(200).json({
    status: "success",
    page: Number(req.query.page) || 1,
    hasMore,
    data: { posts: followingPosts },
  });
});

export const getAllUserPosts = asyncCatch(async (req, res, next) => {
  const { username } = req.params;
  const user = await User.findOne({ username });

  if (!user) {
    return next(new AppError("User not found", 404));
  }

  const query = populatePostQuery(Post.find({ user: user._id }));
  const feature = new APIFeatures(query, req.query);
  feature.pagination();

  const posts = await feature.query;
  const hasMore = posts.length > 0;

  res.status(200).json({
    status: "success",
    page: Number(req.query.page) || 1,
    hasMore,
    data: { posts },
  });
});
