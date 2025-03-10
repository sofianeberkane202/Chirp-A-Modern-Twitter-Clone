import User from "../models/user.model.js";
import { asyncCatch } from "../utils/asyncCatch.js";
import jwt from "jsonwebtoken";

const generateToken = (userId, res) => {
  const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

  // send response in cookie
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true, // prevent XSS attacks cross-site scripting attacks
    sameSite: "strict", // CSRF attack cross-site request forgery attack
    secure: process.env.NODE_ENV === "production",
  };
  res.cookie("jwt", token, cookieOptions);

  return token;
};

export const signup = asyncCatch(async (req, res) => {
  const { fullName, username, email, password, confirmPassword } = req.body;

  // verify if user's username exists
  const usernameExists = await User.findOne({ username });
  if (usernameExists) {
    return res.status(400).json({
      status: "fail",
      message: "Username is already taken",
    });
  }

  // verify if user's email exists
  const userEmailExists = await User.findOne({ email });
  if (userEmailExists) {
    return res.status(400).json({
      status: "fail",
      message: "User already exists",
    });
  }

  // create user
  const user = await User.create({
    fullName,
    username,
    email,
    password,
    confirmPassword,
  });

  // generate token
  const token = generateToken({ id: user._id }, res);

  // send response
  res.status(201).json({
    status: "success",
    message: "User created successfully",
    data: {
      user,
    },
  });
});

export const login = asyncCatch(async (req, res) => {
  const { email, password } = req.body;

  // 1️⃣ Validate input
  if (!email || !password) {
    return res.status(400).json({
      status: "fail",
      message: "Please provide email and password",
    });
  }

  // 2️⃣ Check if user exists & include password field
  const user = await User.findOne({ email }).select("+password");

  // 3️⃣ Validate credentials (Prevent enumeration attacks)
  if (!user || !(await user.comparePassword(password))) {
    return res.status(401).json({
      status: "fail",
      message: "Invalid email or password", // Generic error for security
    });
  }

  // 4️⃣ Generate token & remove password from response
  const token = generateToken({ id: user._id }, res);
  user.password = undefined; // Hide password

  // 5️⃣ Send response with token
  res.status(200).json({
    status: "success",
    message: "User logged in successfully",
    token,
    data: { user },
  });
});

export const logout = asyncCatch(async (req, res) => {
  // Check if Authorization header exists
  if (
    !req.headers.authorization ||
    !req.headers.authorization.startsWith("Bearer")
  ) {
    return res.status(401).json({
      status: "fail",
      message: "You are not logged in",
    });
  }

  // Clear JWT cookie
  res.cookie("jwt", "", {
    httpOnly: true,
    expires: new Date(0), // Expire immediately
    sameSite: "strict", // CSRF protection
    secure: process.env.NODE_ENV === "production", // HTTPS in production
  });

  res.status(200).json({
    status: "success",
    message: "User logged out successfully",
  });
});
