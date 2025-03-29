import cloudinary from "../config/cloudinary.js";
import { asyncCatch } from "../utils/asyncCatch.js";
// models
import User from "../models/user.model.js";
import Notification from "../models/notification.model.js";
import { uploadToCloudinary, getPublicId } from "../utils/handleUploadImage.js";

export const getAllUsers = asyncCatch(async (req, res) => {
  const users = await User.find().limit(10);

  res.status(200).json({
    status: "success",
    data: {
      users,
    },
  });
});

export const getUserProfile = asyncCatch(async (req, res) => {
  const { username } = req.params;

  const user = await User.findOne({ username });

  if (!user) {
    return res.status(404).json({
      status: "fail",
      message: "User not found",
    });
  }

  res.status(200).json({
    status: "success",
    data: {
      profile: user,
    },
  });
});

export const followUnfollowUser = asyncCatch(async (req, res) => {
  const { id } = req.params;
  const currentUserId = req.user.id;

  if (id === currentUserId) {
    return res.status(400).json({
      status: "fail",
      message: "You cannot follow yourself",
    });
  }
  const currentUser = await User.findById(currentUserId);

  if (!currentUser) {
    return res.status(404).json({
      status: "fail",
      message: "User not found",
    });
  }

  let message;
  if (currentUser.following.includes(id)) {
    // Unfollow user
    await User.updateOne({ _id: currentUserId }, { $pull: { following: id } });
    await User.updateOne({ _id: id }, { $pull: { followers: currentUserId } });
    message = "User unfollowed successfully";
  } else {
    // Follow user
    await User.updateOne({ _id: currentUserId }, { $push: { following: id } });
    await User.updateOne({ _id: id }, { $push: { followers: currentUserId } });
    message = "User followed successfully";

    // send the notification:
    const notification = await Notification.create({
      from: currentUserId,
      to: id,
      type: "follow",
    });
  }
  res.status(200).json({
    status: "success",
    message: message,
  });
});

export const getSuggestedUsers = asyncCatch(async (req, res) => {
  const userId = req.user.id;

  // Get the list of users the current user follows
  const user = await User.findById(userId).select("following");

  // Get 5 random users excluding the current user and users they follow
  const suggestedUsers = await User.aggregate([
    {
      $match: {
        _id: { $ne: user._id }, // Exclude the current user
        _id: { $nin: user.following }, // Exclude users the current user follows
      },
    },
    { $sample: { size: 5 } }, // Get a random selection of 5 users
    {
      $project: {
        _id: 1,
        fullName: 1,
        username: 1,
        profileImg: 1,
      },
    },
  ]);

  res.status(200).json({
    status: "success",
    data: { suggestedUsers },
  });
});

export const updateUserProfile = asyncCatch(async (req, res) => {
  const { username, email, newPassword, currentPassword, fullName, bio, link } =
    req.body;

  // let { profileImg, coverImg } = req.files;
  let profileImg = req.files?.profileImg;
  let coverImg = req.files?.coverImg;

  // Get current user
  const currentUser = await User.findById(req.user.id).select("+password");

  if (!currentUser) {
    return res.status(404).json({ status: "fail", message: "User not found." });
  }

  // Validate username and email (single DB query)
  const existingUser = await User.findOne({
    $or: [{ username }, { email }],
    _id: { $ne: req.user.id }, // Ensure it's not the same user
  });

  if (existingUser) {
    return res.status(400).json({
      status: "fail",
      message: `Username or email already exists.`,
    });
  }

  // Validate current password if password change is requested
  if (
    newPassword &&
    (!currentPassword || !(await currentUser.comparePassword(currentPassword)))
  ) {
    return res.status(400).json({
      status: "fail",
      message: "Incorrect current password.",
    });
  }

  if (profileImg) {
    if (currentUser.profileImg) {
      const publicId = getPublicId(currentUser.profileImg);

      try {
        const result = await cloudinary.uploader.destroy(publicId);
        console.log("Cloudinary destroy result:", result);
      } catch (error) {
        console.error("Cloudinary delete error:", error);
      }
    }
    console.log("profileImg: ", profileImg[0]);
    profileImg = await uploadToCloudinary(profileImg[0]);
  }

  if (coverImg) {
    if (currentUser.coverImg) {
      const publicId = getPublicId(currentUser.coverImg);

      try {
        const result = await cloudinary.uploader.destroy(publicId);
        console.log("Cloudinary destroy result:", result);
      } catch (error) {
        console.error("Cloudinary delete error:", error);
      }
    }
    coverImg = await uploadToCloudinary(coverImg[0]);
  }

  // Update fields
  if (username) currentUser.username = username;
  if (email) currentUser.email = email;
  if (newPassword) currentUser.password = newPassword; // Mongoose `pre("save")` will hash it
  if (fullName) currentUser.fullName = fullName;
  if (bio) currentUser.bio = bio;
  if (profileImg) currentUser.profileImg = profileImg;
  if (coverImg) currentUser.coverImg = coverImg;
  if (link) currentUser.link = link;

  await currentUser.save(); // This triggers `pre("save")` middleware

  res.status(200).json({
    status: "success",
    data: {
      user: {
        username: currentUser.username,
        email: currentUser.email,
        fullName: currentUser.fullName,
        bio: currentUser.bio,
        profileImg: currentUser.profileImg,
        coverImg: currentUser.coverImg,
      },
    },
  });
});
