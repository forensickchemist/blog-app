import Post from "../models/Post.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import cloudinary from "../config/cloudinary.js";
import { sanitizeHtml } from "../utils/sanitizeHtml.js";

/*
 * Generate an automatic excerpt from rich-text HTML.
 *
 * The first 2-3 paragraphs are preferred.
 * HTML formatting is removed so the excerpt is plain text.
 */
const generateExcerpt = (sanitizedContent) => {
  if (!sanitizedContent) return "";

  const paragraphs = sanitizedContent
    .match(/<p\b[^>]*>[\s\S]*?<\/p>/gi)
    ?.map((paragraph) =>
      paragraph
        .replace(/<[^>]*>/g, "")
        .replace(/&nbsp;/gi, " ")
        .replace(/&amp;/gi, "&")
        .replace(/&quot;/gi, '"')
        .replace(/&#39;/gi, "'")
        .replace(/\s+/g, " ")
        .trim()
    )
    .filter(Boolean);

  if (paragraphs?.length) {
    return paragraphs
      .slice(0, 3)
      .join(" ")
      .slice(0, 220)
      .trim();
  }

  return sanitizedContent
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/gi, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 220);
};


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
// Public for published
export const getPostBySlug = asyncHandler(async (req, res) => {
  const post = await Post.findOne({ slug: req.params.slug })
    .populate("author", "username avatarUrl bio role");

  if (!post) {
    throw new ApiError(404, "Post not found");
  }

  // Published posts are publicly accessible.
  if (post.status === "published") {
    return res
      .status(200)
      .json(new ApiResponse(200, { post }, "Post fetched successfully"));
  }

  // Drafts require authentication and ownership/admin access.
  if (!req.user) {
    throw new ApiError(404, "Post not found");
  }

  const isOwner =
    post.author._id.toString() === req.user._id.toString();

  const isAdmin = req.user.role === "admin";

  if (!isOwner && !isAdmin) {
    throw new ApiError(404, "Post not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, { post }, "Post fetched successfully"));
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

// GET /api/posts/admin
// Admin-only — all posts, including drafts
export const getAdminPosts = asyncHandler(async (req, res) => {
  const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
  const limit = Math.min(parseInt(req.query.limit, 10) || 10, 50);
  const skip = (page - 1) * limit;

  const filter = {};

  if (req.query.status) {
    filter.status = req.query.status;
  }

  if (req.query.search) {
    filter.$text = {
      $search: req.query.search,
    };
  }

  const [posts, total, publishedCount, draftCount] =
    await Promise.all([
      Post.find(filter)
        .populate("author", "username avatarUrl")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),

      Post.countDocuments(filter),

      Post.countDocuments({ status: "published" }),

      Post.countDocuments({ status: "draft" }),
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
        counts: {
          published: publishedCount,
          drafts: draftCount,
        },
      },
      "Admin posts fetched"
    )
  );
});


// POST /api/posts
// Authenticated users
export const createPost = asyncHandler(async (req, res) => {
  const {
    title,
    content,
    excerpt,
    tags,
    status,
  } = req.body;

  const sanitizedContent = sanitizeHtml(content);

  const postData = {
    title,
    content: sanitizedContent,
    author: req.user._id,
    status: status || "published",
  };

  /*
   * If the author provides an excerpt, use it.
   * Otherwise generate one automatically from the content.
   */
  postData.excerpt = excerpt?.trim()
    ? excerpt.trim()
    : generateExcerpt(sanitizedContent);

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
    excerpt,
    tags,
    status,
  } = req.body;

  if (title !== undefined) {
    post.title = title;
  }

  if (content !== undefined) {
    post.content = sanitizeHtml(content);
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

  /*
   * If the excerpt field is explicitly supplied:
   *
   * - Non-empty excerpt = author's custom excerpt
   * - Empty excerpt = automatically generate from content
   *
   * If excerpt is not supplied at all, preserve the existing excerpt.
   */
  if (excerpt !== undefined) {
    post.excerpt = excerpt.trim()
      ? excerpt.trim()
      : generateExcerpt(
          content !== undefined
            ? sanitizeHtml(content)
            : post.content
        );
  }

  /*
   * If the content changed and the post previously had
   * an automatically generated excerpt, there is no reliable
   * way to know whether that excerpt was manually written.
   *
   * Therefore the frontend should always send the excerpt field:
   * - custom excerpt when the author entered one
   * - empty string when the author wants automatic generation
   */
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