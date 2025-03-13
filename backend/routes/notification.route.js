import express from "express";
import { protect } from "../controllers/auth.controller.js";
import {
  deleteNotifications,
  getNotifications,
  deleteNotification,
} from "../controllers/notification.controller.js";

const router = express.Router();

router.get("/", protect, getNotifications);
router.delete("/", protect, deleteNotifications);
router.delete("/:id", protect, deleteNotification);

export default router;
