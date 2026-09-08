import User from "../models/User.js";
import Post from "../models/Post.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import cloudinary from "../config/cloudinary.js";
import { updateUserBio } from "../services/user.js";

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
  const user = await updateUserBio(
    req.user._id,
    req.body.bio
  );

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { user: user.toSafeObject() },
        "Bio updated"
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
// Supports: ?page ?limit ?search
export const listUsers = asyncHandler(async (req, res) => {
  const page = Math.max(
    parseInt(req.query.page, 10) || 1,
    1
  );

  const limit = Math.min(
    parseInt(req.query.limit, 10) || 10,
    50
  );

  const skip = (page - 1) * limit;

  const filter = {};

  if (req.query.search?.trim()) {
    filter.username = {
      $regex: req.query.search.trim(),
      $options: "i",
    };
  }

  const [users, total] = await Promise.all([
    User.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),

    User.countDocuments(filter),
  ]);

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        {
          users,
          count: total,
          pagination: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
          },
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

export const updateBio = asyncHandler(async (req, res) => {
  const user = await updateUserBio(req.user._id, req.body.bio);

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { user },
        "Bio updated"
      )
    );
});