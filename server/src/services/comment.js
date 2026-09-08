import Comment from "../models/Comment.js";
import User from "../models/User.js";

import ApiError from "../utils/ApiError.js";

const escapeRegex = (value) => {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};

const resolveParentComment = async ({
  parentCommentId,
  postId,
}) => {
  if (!parentCommentId) {
    return null;
  }

  const parentComment = await Comment.findOne({
    _id: parentCommentId,
    post: postId,
  });

  if (!parentComment) {
    throw new ApiError(
      404,
      "Parent comment not found"
    );
  }

  // Only top-level comments can have replies.
  if (parentComment.parentComment) {
    throw new ApiError(
      400,
      "Replies cannot be made to another reply"
    );
  }

  return parentComment._id;
};

const resolveMentionedUser = async (
  mentionedUsername
) => {
  if (!mentionedUsername) {
    return null;
  }

  // Allow either "username" or "@username".
  const username = mentionedUsername
    .trim()
    .replace(/^@+/, "");

  if (!username) {
    return null;
  }

  const escapedUsername = escapeRegex(username);

  const user = await User.findOne({
    username: {
      $regex: `^${escapedUsername}$`,
      $options: "i",
    },
  }).select("_id username");

  if (!user) {
    throw new ApiError(
      404,
      "Mentioned user not found"
    );
  }

  return user._id;
};

export const createComment = async ({
  postId,
  authorId,
  content,
  parentCommentId = null,
  mentionedUsername = "",
}) => {
  const parentComment = await resolveParentComment({
    parentCommentId,
    postId,
  });

  const mentionedUser =
    await resolveMentionedUser(
      mentionedUsername
    );

  const comment = await Comment.create({
    post: postId,
    author: authorId,
    parentComment,
    mentionedUser,
    content,
  });

  await comment.populate([
    {
      path: "author",
      select: "username avatarUrl",
    },
    {
      path: "mentionedUser",
      select: "username",
    },
  ]);

  return comment;
};

export const getComments = async (postId) => {
  return Comment.find({
    post: postId,
  })
    .populate("author", "username avatarUrl")
    .populate("mentionedUser", "username")
    .sort({ createdAt: 1 });
};

export const deleteComment = async (comment) => {
  /*
   * Deleting a parent also deletes its direct replies.
   *
   * Because the backend only allows one reply level,
   * this is enough to prevent orphaned replies.
   */
  if (!comment.parentComment) {
    await Comment.deleteMany({
      parentComment: comment._id,
    });
  }

  await comment.deleteOne();
};