import multer from "multer";

// Store image in memory (buffer) instead of disk
const storage = multer.memoryStorage();
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });

export default upload;
