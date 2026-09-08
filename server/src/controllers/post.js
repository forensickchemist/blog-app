import Post from "../models/Post.js";
import User from "../models/User.js";
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
      .slice(0, 280)
      .trim();
  }

  return sanitizedContent
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/gi, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 280);
};

const getSearchPostIds = async (search) => {
  if (!search?.trim()) {
    return null;
  }

  const searchTerm = search.trim();

  const [textPosts, users] = await Promise.all([
    Post.find({
      $text: {
        $search: searchTerm,
      },
    }).select("_id"),

    User.find({
      username: {
        $regex: searchTerm,
        $options: "i",
      },
    }).select("_id"),
  ]);

  const textPostIds = textPosts.map((post) =>
    post._id.toString()
  );

  const authorIds = users.map((user) =>
    user._id.toString()
  );

  const authorPosts = authorIds.length
    ? await Post.find({
        author: {
          $in: authorIds,
        },
      }).select("_id")
    : [];

  const authorPostIds = authorPosts.map((post) =>
    post._id.toString()
  );

  return [
    ...new Set([
      ...textPostIds,
      ...authorPostIds,
    ]),
  ];
};

// GET /api/posts
// Public — published posts only
// Supports: ?page ?limit ?search ?tag ?author
export const getAllPosts = asyncHandler(async (req, res) => {
  const page = Math.max(
    parseInt(req.query.page, 10) || 1,
    1
  );

  const limit = Math.min(
    parseInt(req.query.limit, 10) || 10,
    50
  );

  const skip = (page - 1) * limit;

  const filter = {
    status: "published",
  };

  if (req.query.search) {
    const searchPostIds = await getSearchPostIds(
      req.query.search
    );

    filter._id = {
      $in: searchPostIds,
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
      .populate(
        "author",
        "username avatarUrl role"
      )
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
// Supports: ?page ?limit ?search
export const getMyPosts = asyncHandler(async (req, res) => {
  const page = Math.max(
    parseInt(req.query.page, 10) || 1,
    1
  );

  const limit = Math.min(
    parseInt(req.query.limit, 10) || 10,
    50
  );

  const skip = (page - 1) * limit;

  const filter = {
    author: req.user._id,
  };

  if (req.query.search?.trim()) {
    const searchTerm = req.query.search.trim();

    const matchingPosts = await Post.find({
      $text: {
        $search: searchTerm,
      },
    }).select("_id");

    const matchingPostIds = matchingPosts.map(
      (post) => post._id
    );

    filter._id = {
      $in: matchingPostIds,
    };
  }

  const [posts, total] = await Promise.all([
    Post.find(filter)
      .populate(
        "author",
        "username avatarUrl role"
      )
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
      "Your posts fetched"
    )
  );
});

// GET /api/posts/admin
// Admin-only — all posts, including drafts
// Supports: ?page ?limit ?search ?status
export const getAdminPosts = asyncHandler(async (req, res) => {
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

  if (req.query.status) {
    filter.status = req.query.status;
  }

  if (req.query.search?.trim()) {
    const searchPostIds = await getSearchPostIds(
      req.query.search
    );

    filter._id = {
      $in: searchPostIds,
    };
  }

  const [
    posts,
    total,
    totalPostCount,
    publishedCount,
    draftCount,
  ] = await Promise.all([
    Post.find(filter)
      .populate(
        "author",
        "username avatarUrl role"
      )
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),

    Post.countDocuments(filter),

    Post.countDocuments({}),

    Post.countDocuments({
      status: "published",
    }),

    Post.countDocuments({
      status: "draft",
    }),
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
          total: totalPostCount,
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

  await post.populate("author", "username avatarUrl role");

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

  await post.populate("author", "username avatarUrl role");

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
  const page = Math.max(
    parseInt(req.query.page, 10) || 1,
    1
  );

  const limit = Math.min(
    parseInt(req.query.limit, 10) || 9,
    50
  );

  const skip = (page - 1) * limit;

  const author = await User.findOne({
    username: req.params.username,
  }).select("_id");

  if (!author) {
    return res.status(200).json(
      new ApiResponse(
        200,
        {
          posts: [],
          pagination: {
            total: 0,
            page,
            limit,
            totalPages: 0,
          },
        },
        "Posts fetched"
      )
    );
  }

  const filter = {
    status: "published",
    author: author._id,
  };

  const [posts, total] = await Promise.all([
    Post.find(filter)
      .populate({
        path: "author",
        select: "username avatarUrl role",
      })
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