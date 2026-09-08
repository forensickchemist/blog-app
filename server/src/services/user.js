import User from "../models/User.js";
import ApiError from "../utils/ApiError.js";

export const updateUserBio = async (userId, bio) => {
  if (typeof bio !== "string") {
    throw new ApiError(400, "Bio must be a string");
  }

  const trimmedBio = bio.trim();

  if (trimmedBio.length > 280) {
    throw new ApiError(400, "Bio cannot exceed 280 characters");
  }

  const user = await User.findById(userId);

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  user.bio = trimmedBio;

  await user.save();

  return user;
};