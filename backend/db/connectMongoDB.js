import mongoose from "mongoose";

const MONGO_URI = process.env.MONGO_URI.replaceAll(
  "<PASSWORD>",
  process.env.MONGO_PASSWORD
);

const connectMongoDB = async () => {
  try {
    const conn = await mongoose.connect(MONGO_URI);
    console.log(`MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.log("Error connecting to MongoDB:", error);
  }
};

export default connectMongoDB;
