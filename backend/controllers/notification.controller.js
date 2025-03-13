import Notification from "../models/notification.model.js";
import { asyncCatch } from "../utils/asyncCatch.js";

export const getNotifications = asyncCatch(async (req, res, next) => {
  const currentUserId = req.user.id;
  const notifications = await Notification.find({ to: currentUserId })
    .populate({
      path: "from",
      select: "username profileImg",
    })
    .sort({ createdAt: -1 });

  await Notification.updateMany({ to: currentUserId }, { read: true });

  res.status(200).json({
    status: "success",
    data: {
      notifications,
    },
  });
});

export const deleteNotifications = asyncCatch(async (req, res, next) => {
  const currentUserId = req.user.id;
  await Notification.deleteMany({ to: currentUserId });
  res.status(200).json({
    status: "success",
    message: "Notifications deleted successfully",
  });
});

export const deleteNotification = asyncCatch(async (req, res, next) => {
  const { id } = req.params;
  const notification = await Notification.findById(id);
  if (!notification) {
    return res.status(404).json({
      status: "fail",
      message: "Notification not found",
    });
  }

  if (notification.to.toString() !== req.user.id) {
    return res.status(401).json({
      status: "fail",
      message: "You are not authorized to delete this notification",
    });
  }

  await notification.remove();

  res.status(200).json({
    status: "success",
    message: "Notification deleted successfully",
  });
});
