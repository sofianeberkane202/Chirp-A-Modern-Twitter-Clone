import express from "express";
import generateError from "./utils/generateError.js";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.routes.js";
import cloudinary from "./config/cloudinary.js";

const app = express();

app.use(express.json());
app.use(cookieParser());

app.use((req, res, next) => {
  req.requestedAt = new Date().toISOString();
  next();
});

app.get("/test-cloudinary", async (req, res) => {
  try {
    const result = await cloudinary.uploader.upload(
      "https://upload.wikimedia.org/wikipedia/commons/a/a3/June_odd-eyed-cat.jpg",
      { folder: "test_folder" }
    );
    res.json({ status: "success", url: result.secure_url });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
});

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/users", userRoutes);

app.use(generateError);

export default app;
