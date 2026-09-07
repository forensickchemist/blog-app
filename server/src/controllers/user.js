import User from "../models/User.js";

import ApiError from "../utils/ApiError.js";

import ApiResponse from "../utils/ApiResponse.js";

import asyncHandler from "../utils/asyncHandler.js";

import cloudinary from "../config/cloudinary.js";

export const getUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findOne({ username: req.params.username });

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { user: user.toSafeObject() },
        "User found"
      )
    );
});

export const updateProfile = asyncHandler(async (req, res) => {
  const allowedFields = ["username", "bio"];

  const updates = {};

  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) {
      updates[field] = req.body[field];
    }
  });

  const user = await User.findByIdAndUpdate(
    req.user._id,
    updates,
    {
      new: true,
      runValidators: true,
    }
  );

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { user },
        "Profile updated"
      )
    );
});

export const updateAvatar = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw new ApiError(400, "No image file provided");
  }

  const user = await User.findById(req.user._id);

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  // Delete the previous avatar from Cloudinary.
  if (user.avatarPublicId) {
    await cloudinary.uploader
      .destroy(user.avatarPublicId)
      .catch(() => {});
  }

  user.avatarUrl = req.file.path;
  user.avatarPublicId = req.file.filename;

  await user.save();

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { user: user.toSafeObject() },
        "Avatar updated"
      )
    );
});

// Admin-only: list all users
export const listUsers = asyncHandler(async (req, res) => {
  const users = await User.find().sort({ createdAt: -1 });

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        {
          users,
          count: users.length,
        },
        "Users fetched"
      )
    );
});

// Admin-only: update a user's role
export const updateUserRole = asyncHandler(async (req, res) => {
  const { role } = req.body;

  if (!["user", "admin"].includes(role)) {
    throw new ApiError(
      400,
      "Role must be either user or admin"
    );
  }

  const user = await User.findById(req.params.id);

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  // Prevent an admin from removing their own admin access.
  if (user._id.toString() === req.user._id.toString()) {
    throw new ApiError(
      400,
      "You cannot change your own role"
    );
  }

  // If demoting an admin, make sure at least one admin remains.
  if (user.role === "admin" && role === "user") {
    const adminCount = await User.countDocuments({
      role: "admin",
    });

    if (adminCount <= 1) {
      throw new ApiError(
        400,
        "You cannot demote the last admin"
      );
    }
  }

  user.role = role;
  await user.save();

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { user: user.toSafeObject() },
        "User role updated"
      )
    );
});

export const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  if (user._id.toString() === req.user._id.toString()) {
    throw new ApiError(
      400,
      "You cannot delete your own account"
    );
  }

  if (user.role === "admin") {
    const adminCount = await User.countDocuments({
      role: "admin",
    });

    if (adminCount <= 1) {
      throw new ApiError(
        400,
        "You cannot delete the last admin"
      );
    }
  }

  // Delete the user's avatar from Cloudinary.
  if (user.avatarPublicId) {
    await cloudinary.uploader
      .destroy(user.avatarPublicId)
      .catch(() => {});
  }

  // Find all posts belonging to the user.
  const posts = await Post.find({
    author: user._id,
  }).select("coverImage.publicId");

  // Delete all post cover images from Cloudinary.
  await Promise.all(
    posts
      .map((post) => post.coverImage?.publicId)
      .filter(Boolean)
      .map((publicId) =>
        cloudinary.uploader
          .destroy(publicId)
          .catch(() => {})
      )
  );

  // Delete all posts belonging to the user.
  await Post.deleteMany({
    author: user._id,
  });

  // Finally delete the user.
  await user.deleteOne();

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        null,
        "User and all associated content deleted"
      )
    );
});