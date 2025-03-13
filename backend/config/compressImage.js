import sharp from "sharp";
// Middleware to compress images
const compressImage = async (req, res, next) => {
  if (!req.files) return next();

  try {
    if (req.files.profileImg) {
      req.files.profileImg[0].buffer = await sharp(
        req.files.profileImg[0].buffer
      )
        .resize({ width: 500, height: 500 }) // Resize to 500x500
        .jpeg({ quality: 80 }) // Compress JPEG quality to 80%
        .toBuffer();
    }

    if (req.files.coverImg) {
      req.files.coverImg[0].buffer = await sharp(req.files.coverImg[0].buffer)
        .resize({ width: 1200, height: 600 }) // Resize to 1200x600
        .jpeg({ quality: 80 }) // Compress JPEG quality to 80%
        .toBuffer();
    }

    //post img
    if (req.files.img) {
      req.files.img[0].buffer = await sharp(req.files.img[0].buffer)
        .resize({ width: 1200, height: 600 }) // Resize to 1200x600
        .jpeg({ quality: 80 }) // Compress JPEG quality to 80%
        .toBuffer();
    }

    next();
  } catch (error) {
    console.error("Image processing error:", error);
    return res
      .status(500)
      .json({ status: "error", message: "Image processing failed" });
  }
};

export default compressImage;
