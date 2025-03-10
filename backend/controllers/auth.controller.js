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

export const login = async (req, res) => {
  res.json({ message: "You hit the login endpoint" });
};

export const logout = async (req, res) => {
  res.json({ message: "You hit the logout endpoint" });
};
