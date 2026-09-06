import jwt from "jsonwebtoken";
import User from "../models/User.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

const sendAuthResponse = (user, statusCode, res, message) => {
  const token = signToken(user._id);
  res.cookie(process.env.COOKIE_NAME || "token", token, cookieOptions);
  return res.status(statusCode).json(
    new ApiResponse(
      statusCode,
      { user: user.toSafeObject() },
      message
    )
  );
};

export const register = asyncHandler(async (req, res) => {
  const { email, username, password } = req.body;

  const existing = await User.findOne({ $or: [{ email }, { username }] });
  if (existing) {
    throw new ApiError(409, "Email or username is already in use");
  }

  const user = await User.create({ email, username, password });
  sendAuthResponse(user, 201, res, "Registration successful");
});

export const login = asyncHandler(async (req, res) => {
  const { emailOrUsername, password } = req.body;

  const user = await User.findOne({
    $or: [{ email: emailOrUsername }, { username: emailOrUsername }],
  }).select("+password");

  if (!user || !(await user.comparePassword(password))) {
    throw new ApiError(401, "Invalid credentials");
  }

  sendAuthResponse(user, 200, res, "Login successful");
});

export const logout = asyncHandler(async (req, res) => {
  res.clearCookie(process.env.COOKIE_NAME || "token", cookieOptions);
  res.status(200).json(new ApiResponse(200, null, "Logged out successfully"));
});

export const getMe = asyncHandler(async (req, res) => {
  res.status(200).json(new ApiResponse(200, { user: req.user }, "Current user"));
});
