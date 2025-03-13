import express from "express";
import {
  getUserProfile,
  followUnfollowUser,
  getSuggestedUsers,
  updateUserProfile,
} from "../controllers/user.controller.js";
import { protect } from "../controllers/auth.controller.js";
import upload from "../config/multer.js";
import compressImage from "../config/compressImage.js";

// console.log(upload);

const router = express.Router();

router.get("/profile/:username", protect, getUserProfile);
router.get("/suggested", protect, getSuggestedUsers);
router.post("/follow/:id", protect, followUnfollowUser);
router.put(
  "/update",
  protect,
  upload.fields([
    { name: "profileImg", maxCount: 1 },
    { name: "coverImg", maxCount: 1 },
  ]),
  compressImage,
  updateUserProfile
);

export default router;
