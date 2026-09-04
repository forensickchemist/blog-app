import User from "../models/User.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import cloudinary from "../config/cloudinary.js";

export const getUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findOne({ username: req.params.username });
  if (!user) throw new ApiError(404, "User not found");
  res.status(200).json(new ApiResponse(200, { user: user.toSafeObject() }, "User found"));
});

export const updateProfile = asyncHandler(async (req, res) => {
  const allowedFields = ["username", "bio"];
  const updates = {};
  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) updates[field] = req.body[field];
  });

  const user = await User.findByIdAndUpdate(req.user._id, updates, {
    new: true,
    runValidators: true,
  });

  res.status(200).json(new ApiResponse(200, { user }, "Profile updated"));
});

export const updateAvatar = asyncHandler(async (req, res) => {
  if (!req.file) throw new ApiError(400, "No image file provided");

  const user = await User.findByIdAndUpdate(
    req.user._id,
    { avatarUrl: req.file.path },
    { new: true }
  );

  res.status(200).json(new ApiResponse(200, { user }, "Avatar updated"));
});

// Admin-only: list all users
export const listUsers = asyncHandler(async (req, res) => {
  const users = await User.find().sort({ createdAt: -1 });
  res.status(200).json(new ApiResponse(200, { users, count: users.length }, "Users fetched"));
});
