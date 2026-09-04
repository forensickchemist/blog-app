import Post from "../models/Post.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import cloudinary from "../config/cloudinary.js";

// GET /api/posts
// Public — published posts only
// Supports: ?page ?limit ?search ?tag ?author
export const getAllPosts = asyncHandler(async (req, res) => {
  const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
  const limit = Math.min(parseInt(req.query.limit, 10) || 10, 50);
  const skip = (page - 1) * limit;

  const filter = {
    status: "published",
  };

  if (req.query.search) {
    filter.$text = {
      $search: req.query.search,
    };
  }

  if (req.query.tag) {
    filter.tags = req.query.tag.toLowerCase();
  }

  if (req.query.author) {
    filter.author = req.query.author;
  }

  const [posts, total] = await Promise.all([
    Post.find(filter)
      .populate("author", "username avatarUrl")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),

    Post.countDocuments(filter),
  ]);

  res.status(200).json(
    new ApiResponse(
      200,
      {
        posts,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      },
      "Posts fetched"
    )
  );
});


// GET /api/posts/:slug
// Public
export const getPostBySlug = asyncHandler(async (req, res) => {
  const post = await Post.findOne({
    slug: req.params.slug,
  }).populate("author", "username avatarUrl bio");

  if (!post) {
    throw new ApiError(404, "Post not found");
  }

  res.status(200).json(
    new ApiResponse(
      200,
      { post },
      "Post fetched"
    )
  );
});


// GET /api/posts/me
// Authenticated user — own published + draft posts
export const getMyPosts = asyncHandler(async (req, res) => {
  const posts = await Post.find({
    author: req.user._id,
  })
    .populate("author", "username avatarUrl")
    .sort({ createdAt: -1 });

  res.status(200).json(
    new ApiResponse(
      200,
      { posts },
      "Your posts fetched"
    )
  );
});


// POST /api/posts
// Authenticated users
export const createPost = asyncHandler(async (req, res) => {
  const {
    title,
    content,
    tags,
    status,
  } = req.body;

  const postData = {
    title,
    content,
    author: req.user._id,
    status: status || "published",
  };

  if (tags) {
    postData.tags = Array.isArray(tags)
      ? tags
      : tags
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean);
  }

  if (req.file) {
    postData.coverImage = {
      url: req.file.path,
      publicId: req.file.filename,
    };
  }

  // Post.create() triggers the Post schema pre-validate hook,
  // which automatically generates the excerpt from content.
  const post = await Post.create(postData);

  await post.populate("author", "username avatarUrl");

  res.status(201).json(
    new ApiResponse(
      201,
      { post },
      "Post created"
    )
  );
});


// Find a post owned by the current user.
// Admins are allowed to access any post.
const findOwnedPost = async (req) => {
  const post = await Post.findOne({
    slug: req.params.slug,
  });

  if (!post) {
    throw new ApiError(404, "Post not found");
  }

  const isOwner =
    post.author.toString() === req.user._id.toString();

  const isAdmin = req.user.role === "admin";

  if (!isOwner && !isAdmin) {
    throw new ApiError(
      403,
      "You do not have permission to modify this post"
    );
  }

  return post;
};


// PUT /api/posts/:slug
// Owner or admin
export const updatePost = asyncHandler(async (req, res) => {
  const post = await findOwnedPost(req);

  const {
    title,
    content,
    tags,
    status,
  } = req.body;

  if (title !== undefined) {
    post.title = title;
  }

  if (content !== undefined) {
    post.content = content;
  }

  if (status !== undefined) {
    post.status = status;
  }

  if (tags !== undefined) {
    post.tags = Array.isArray(tags)
      ? tags
      : tags
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean);
  }

  if (req.file) {
    if (post.coverImage?.publicId) {
      await cloudinary.uploader
        .destroy(post.coverImage.publicId)
        .catch(() => {});
    }

    post.coverImage = {
      url: req.file.path,
      publicId: req.file.filename,
    };
  }

  // Saving the document triggers the Post schema pre-validate hook.
  // If content changed, the excerpt will automatically be regenerated.
  await post.save();

  await post.populate("author", "username avatarUrl");

  res.status(200).json(
    new ApiResponse(
      200,
      { post },
      "Post updated"
    )
  );
});


// DELETE /api/posts/:slug
// Owner or admin
// Admins can delete any post.
export const deletePost = asyncHandler(async (req, res) => {
  const post = await findOwnedPost(req);

  if (post.coverImage?.publicId) {
    await cloudinary.uploader
      .destroy(post.coverImage.publicId)
      .catch(() => {});
  }

  await post.deleteOne();

  res.status(200).json(
    new ApiResponse(
      200,
      null,
      "Post deleted"
    )
  );
});


// GET /api/posts/user/:username
// Public — published posts only
export const getPostsByUser = asyncHandler(async (req, res) => {
  const posts = await Post.find({
    status: "published",
  })
    .populate({
      path: "author",
      select: "username avatarUrl",
      match: {
        username: req.params.username,
      },
    })
    .sort({ createdAt: -1 });

  const filtered = posts.filter((post) => post.author);

  res.status(200).json(
    new ApiResponse(
      200,
      { posts: filtered },
      "Posts fetched"
    )
  );
});