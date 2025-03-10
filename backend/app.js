import express from "express";
import authRoutes from "./routes/auth.routes.js";
import generateError from "./utils/generateError.js";

const app = express();

app.use(express.json());

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.use((req, res, next) => {
  req.requestedAt = new Date().toISOString();
  next();
});

app.use("/api/v1/auth", authRoutes);

app.use(generateError);

export default app;
