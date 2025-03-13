import cloudinary from "../config/cloudinary.js";
export async function uploadToCloudinary(file) {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder: "user_profiles" },
      (error, result) => {
        if (error) reject(error);
        else resolve(result.secure_url);
      }
    );

    uploadStream.end(file.buffer); // Upload file buffer
  });
}

export const getPublicId = (url) => {
  return url
    .split("/")
    .slice(-2) // Extracts last two parts (folder + filename)
    .join("/")
    .split(".")[0]; // Removes file extension
};
