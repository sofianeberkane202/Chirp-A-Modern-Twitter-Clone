import express from "express";
import {
  login,
  logout,
  signup,
  getMe,
  protect,
} from "../controllers/auth.controller.js";

const router = express.Router();

router.get("/me", protect, getMe);

router.post("/signup", signup);

router.post("/login", login);

router.post("/logout", logout);

export default router;
