import mongoose from "mongoose";
import Post from "../models/post.model.js";
import Comment from "../models/comment.model.js";
import { asyncCatch } from "../utils/asyncCatch.js";
import { uploadToCloudinary, getPublicId } from "../utils/handleUploadImage.js";
import cloudinary from "../config/cloudinary.js";
import Notification from "../models/notification.model.js";
import User from "../models/user.model.js";

export const createPost = asyncCatch(async (req, res, next) => {
  const { text } = req.body;
  let { img } = req.files;
  const currentUserId = req.user.id;
  console.log(currentUserId);

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
    data: {
      post,
    },
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
      console.log("Cloudinary destroy result:", result);
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

  res.status(200).json({
    status: "success",
    data: {
      post,
    },
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
      data: { post },
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
      data: { post, notification },
    });
  }
});

export const getAllPosts = asyncCatch(async (req, res, next) => {
  const posts = await Post.find()
    .populate("user")
    .populate("comments")
    .populate({
      path: "comments",
      populate: {
        path: "user",
      },
    })
    .sort({ createdAt: -1 });

  res.status(200).json({
    status: "success",
    length: posts.length,

    data: {
      posts,
    },
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

  const likedPosts = await Post.find({ _id: { $in: user.likePosts } })
    .populate({
      path: "user",
    })
    .populate({
      path: "comments",
      populate: {
        path: "user",
      },
    });

  res.status(200).json({
    status: "success",
    data: {
      likedPosts,
    },
  });
});

export const getAllFollowingPosts = asyncCatch(async (req, res, next) => {
  const currentUserId = req.user.id;
  const user = await User.findById(currentUserId);

  if (!user) {
    return res.status(404).json({
      status: "fail",
      message: "user not found",
    });
  }

  const followingPosts = await Post.find({
    user: { $in: user.following },
  }).sort({ createdAt: -1 });

  res.status(200).json({
    status: "success",
    data: {
      posts: followingPosts,
    },
  });
});

export const getAllUserPosts = asyncCatch(async (req, res, next) => {
  const { username } = req.params;

  const user = await User.findOne({ username: username });

  if (!user) {
    return res.status(404).json({
      status: "fail",
      message: "user not found",
    });
  }

  const posts = await Post.find({ user: user._id })
    .sort({ createdAt: -1 })
    .populate({
      path: "user",
    })
    .populate({
      path: "comments",
      populate: {
        path: "user",
      },
    });

  res.status(200).json({
    status: "success",
    data: {
      posts,
    },
  });
});
