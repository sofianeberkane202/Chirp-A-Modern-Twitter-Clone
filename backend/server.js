import dontenv from "dotenv/config";
import app from "./app.js";
import connectMongoDB from "./db/connectMongoDB.js";

const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  connectMongoDB();
});
