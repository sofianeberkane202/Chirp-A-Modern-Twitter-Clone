import express from "express";
import {
  createPost,
  deletePost,
  commentOnPost,
  likeUnlikePost,
  getAllPosts,
  getLikedPosts,
  getAllFollowingPosts,
  getAllUserPosts,
} from "../controllers/post.controller.js";
import { protect } from "../controllers/auth.controller.js";
import upload from "../config/multer.js";
import compressImage from "../config/compressImage.js";

const router = express.Router();

router.get("/", protect, getAllPosts);
router.get("/following", protect, getAllFollowingPosts);
router.get("/user/:username", protect, getAllUserPosts);

router.post(
  "/create",
  protect,
  upload.fields([{ name: "img", maxCount: 1 }]),
  compressImage,
  createPost
);

router.delete("/delete-post/:id", protect, deletePost);
router.post("/comment/:id", protect, commentOnPost);
router.post("/like/:id", protect, likeUnlikePost);
router.get("/user-liked-posts/:id", protect, getLikedPosts);

// router.post("/update-post/:id", updatePost);

// router.post("/delete-comment/:id", deleteComment);

// router.post("/update-comment/:id", updateComment);

// router.post("/delete-like/:id", deleteLike);

// router.post("/update-like/:id", updateLike);

export default router;
