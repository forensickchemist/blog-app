import Comment from "../models/Comment.js";
import Post from "../models/Post.js";

import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

// Check whether the current user is allowed to access a post.
// Published posts are public.
// Drafts are only accessible by the owner or an admin.
const findAccessiblePost = async (req) => {
  const post = await Post.findById(req.params.postId);

  if (!post) {
    throw new ApiError(404, "Post not found");
  }

  // Published posts are publicly accessible.
  if (post.status === "published") {
    return post;
  }

  // Drafts require authentication.
  if (!req.user) {
    throw new ApiError(404, "Post not found");
  }

  const isOwner =
    post.author.toString() === req.user._id.toString();

  const isAdmin = req.user.role === "admin";

  if (!isOwner && !isAdmin) {
    throw new ApiError(404, "Post not found");
  }

  return post;
};

// GET /posts/:postId/comments
// Public for published posts.
// Owner/admin can access comments on their accessible drafts.
export const getComments = asyncHandler(async (req, res) => {
  await findAccessiblePost(req);

  const comments = await Comment.find({
    post: req.params.postId,
  })
    .populate("author", "username avatarUrl")
    .sort({ createdAt: 1 });

  res.status(200).json(
    new ApiResponse(
      200,
      { comments },
      "Comments fetched"
    )
  );
});

// POST /posts/:postId/comments
// Authenticated users only.
export const createComment = asyncHandler(async (req, res) => {
  const post = await findAccessiblePost(req);

  const content = req.body.content?.trim();

  if (!content) {
    throw new ApiError(400, "Comment content is required");
  }

  if (content.length > 1000) {
    throw new ApiError(
      400,
      "Comment cannot exceed 1000 characters"
    );
  }

  const comment = await Comment.create({
    post: post._id,
    author: req.user._id,
    content,
  });

  await comment.populate("author", "username avatarUrl");

  res.status(201).json(
    new ApiResponse(
      201,
      { comment },
      "Comment created"
    )
  );
});

// DELETE /comments/:commentId
// Comment owner or admin.
export const deleteComment = asyncHandler(async (req, res) => {
  const comment = await Comment.findById(req.params.commentId);

  if (!comment) {
    throw new ApiError(404, "Comment not found");
  }

  const isOwner =
    comment.author.toString() === req.user._id.toString();

  const isAdmin = req.user.role === "admin";

  if (!isOwner && !isAdmin) {
    throw new ApiError(
      403,
      "You do not have permission to delete this comment"
    );
  }

  await comment.deleteOne();

  res.status(200).json(
    new ApiResponse(
      200,
      null,
      "Comment deleted"
    )
  );
});