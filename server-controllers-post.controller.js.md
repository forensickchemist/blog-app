### `server/controllers/post.controller.js`

```js
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

  const filter = { status: "published" };

  if (req.query.search) {
    filter.$text = { $search: req.query.search };
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
  const post = await Post.findOne({ slug: req.params.slug }).populate(
    "author",
    "username avatarUrl bio"
  );

  if (!post) {
    throw new ApiError(404, "Post not found");
  }

  res.status(200).json(
    new ApiResponse(200, { post }, "Post fetched")
  );
});


// GET /api/posts/me
// Authenticated user — own published + draft posts
export const getMyPosts = asyncHandler(async (req, res) => {
  const posts = await Post.find({ author: req.user._id })
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
  const { title, content, tags, status } = req.body;

  const postData = {
    title,
    content,
    author: req.user._id,
    status: status || "published",
  };

  if (tags) {
    postData.tags = Array.isArray(tags)
      ? tags
      : tags.split(",").map((t) => t.trim());
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
    new ApiResponse(201, { post }, "Post created")
  );
});


// Find a post owned by the current user
// Admins are allowed to access any post.
const findOwnedPost = async (req) => {
  const post = await Post.findOne({ slug: req.params.slug });

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

  const { title, content, tags, status } = req.body;

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
      : tags.split(",").map((t) => t.trim());
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

  await post.save();

  await post.populate("author", "username avatarUrl");

  res.status(200).json(
    new ApiResponse(200, { post }, "Post updated")
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
    new ApiResponse(200, null, "Post deleted")
  );
});


// GET /api/posts/user/:username
// Public — published posts only
export const getPostsByUser = asyncHandler(async (req, res) => {
  const posts = await Post.find({ status: "published" })
    .populate({
      path: "author",
      select: "username avatarUrl",
      match: { username: req.params.username },
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
```

### `server/routes/post.routes.js`

```js
import { Router } from "express";
import { body } from "express-validator";

import {
  getAllPosts,
  getPostBySlug,
  getMyPosts,
  createPost,
  updatePost,
  deletePost,
  getPostsByUser,
} from "../controllers/post.controller.js";

import { protect } from "../middlewares/auth.middleware.js";
import { upload } from "../config/cloudinary.js";
import validate from "../middlewares/validate.middleware.js";

const router = Router();

const postValidation = [
  body("title")
    .trim()
    .notEmpty()
    .withMessage("Title is required"),

  body("content")
    .trim()
    .notEmpty()
    .withMessage("Content is required"),
];


// ================================================================
// PUBLIC ROUTES
// ================================================================

// All published posts
router.get("/", getAllPosts);

// Published posts by author
router.get("/user/:username", getPostsByUser);

// ================================================================
// AUTHENTICATED USER ROUTES
// ================================================================

// Current user's published + draft posts
router.get("/me", protect, getMyPosts);


// ================================================================
// SINGLE POST
// ================================================================

router.get("/:slug", getPostBySlug);


// ================================================================
// CREATE / UPDATE / DELETE
// ================================================================

router.post(
  "/",
  protect,
  upload.single("coverImage"),
  postValidation,
  validate,
  createPost
);

router.put(
  "/:slug",
  protect,
  upload.single("coverImage"),
  updatePost
);

router.delete(
  "/:slug",
  protect,
  deletePost
);

export default router;
```

### `client/src/services/post.service.js`

```js
import api from "./api";

export const postService = {
  getAll(params = {}) {
    return api.get("/posts", { params });
  },

  getBySlug(slug) {
    return api.get(`/posts/${slug}`);
  },

  getByUser(username) {
    return api.get(`/posts/user/${username}`);
  },

  getMyPosts() {
    return api.get("/posts/me");
  },

  create(formData) {
    return api.post("/posts", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },

  update(slug, formData) {
    return api.put(`/posts/${slug}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },

  remove(slug) {
    return api.delete(`/posts/${slug}`);
  },
};
```

### `client/src/views/Dashboard.vue`

```vue
<template>
  <div class="app-container page-section">

    <!-- ==========================================================
         PAGE HEADER
         ========================================================== -->
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h1 class="fs-3 mb-0">My Posts</h1>

      <router-link
        to="/posts/new"
        class="btn btn-app-primary"
      >
        <i class="bi bi-plus-circle me-1"></i>
        New Post
      </router-link>
    </div>


    <!-- ==========================================================
         LOADING
         ========================================================== -->
    <BaseLoader
      v-if="loading"
      label="Loading your posts..."
    />


    <!-- ==========================================================
         EMPTY STATE
         ========================================================== -->
    <EmptyState
      v-else-if="!myPosts.length"
      icon="bi-journal-plus"
      title="You haven't written anything yet"
      description="Your published and draft posts will show up here."
    >
      <router-link
        to="/posts/new"
        class="btn btn-app-primary"
      >
        Write your first post
      </router-link>
    </EmptyState>


    <!-- ==========================================================
         POSTS
         ========================================================== -->
    <div
      v-else
      class="table-responsive"
    >
      <table class="table align-middle">

        <thead>
          <tr>
            <th>Title</th>
            <th>Status</th>
            <th>Created</th>
            <th class="text-end">Actions</th>
          </tr>
        </thead>

        <tbody>

          <tr
            v-for="post in myPosts"
            :key="post._id"
          >

            <!-- Title -->
            <td>
              <router-link
                :to="`/posts/${post.slug}`"
                class="text-reset fw-medium"
              >
                {{ post.title }}
              </router-link>
            </td>


            <!-- Status -->
            <td>
              <span
                class="badge rounded-pill"
                :class="
                  post.status === 'published'
                    ? 'text-bg-success'
                    : 'text-bg-secondary'
                "
              >
                {{ post.status }}
              </span>
            </td>


            <!-- Created -->
            <td class="text-muted-app small">
              {{ formatDate(post.createdAt) }}
            </td>


            <!-- Actions -->
            <td class="text-end">

              <router-link
                :to="`/posts/${post.slug}/edit`"
                class="btn btn-sm btn-app-outline me-2"
                aria-label="Edit post"
              >
                <i class="bi bi-pencil"></i>
              </router-link>

              <button
                type="button"
                class="btn btn-sm btn-outline-danger"
                aria-label="Delete post"
                @click="confirmDelete(post.slug)"
              >
                <i class="bi bi-trash"></i>
              </button>

            </td>

          </tr>

        </tbody>
      </table>
    </div>


    <!-- ==========================================================
         DELETE MODAL
         ========================================================== -->
    <ConfirmModal
      id="dashboardDeleteModal"
      ref="confirmModal"
      title="Delete this post?"
      message="This action is permanent and cannot be undone."
      @confirm="handleDelete"
    />

  </div>
</template>


<script setup>
import { onMounted, ref } from "vue";

import { postService } from "../services/post.service";
import { usePostStore } from "../store/post";

import BaseLoader from "../components/common/BaseLoader.vue";
import EmptyState from "../components/common/EmptyState.vue";
import ConfirmModal from "../components/common/ConfirmModal.vue";


const store = usePostStore();

const myPosts = ref([]);
const loading = ref(true);

const confirmModal = ref(null);
const pendingSlug = ref(null);


const formatDate = (date) => {
  return new Date(date).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};


const load = async () => {
  loading.value = true;

  try {
    const res = await postService.getMyPosts();

    myPosts.value = res.data.posts;
  } finally {
    loading.value = false;
  }
};


const confirmDelete = (slug) => {
  pendingSlug.value = slug;

  confirmModal.value?.show();
};


const handleDelete = async () => {
  if (!pendingSlug.value) {
    return;
  }

  const slug = pendingSlug.value;

  await store.deletePost(slug);

  myPosts.value = myPosts.value.filter(
    (post) => post.slug !== slug
  );

  pendingSlug.value = null;
};


onMounted(load);
</script>
```

### `client/src/components/layout/AppNavbar.vue`

```vue
<template>
  <nav class="navbar navbar-expand-lg sticky-top app-navbar">

    <div class="app-container app-navbar__container">

      <!-- ==========================================================
           NAVBAR HEADER
           ========================================================== -->
      <div class="app-navbar__header">

        <!-- Brand -->
        <router-link
          class="navbar-brand fw-bold d-flex align-items-center gap-2"
          to="/"
          @click="closeMenu"
        >
          <i class="bi bi-journal-richtext text-app-primary"></i>

          <span>
            Open<span class="text-app-accent">Notebook</span>
          </span>
        </router-link>


        <!-- Mobile Toggle -->
        <button
          type="button"
          class="navbar-toggler"
          :aria-expanded="isOpen"
          aria-controls="app-navbar-navigation"
          aria-label="Toggle navigation"
          @click="toggleMenu"
        >
          <i
            class="bi"
            :class="isOpen ? 'bi-x-lg' : 'bi-list'"
          ></i>
        </button>

      </div>


      <!-- ==========================================================
           NAVIGATION
           ========================================================== -->
      <div
        id="app-navbar-navigation"
        class="navbar-collapse"
        :class="{ 'is-open': isOpen }"
      >

        <ul class="navbar-nav ms-auto align-items-lg-center gap-lg-2">

          <!-- Home -->
          <li class="nav-item">
            <router-link
              class="nav-link"
              to="/"
              @click="closeMenu"
            >
              Home
            </router-link>
          </li>


          <!-- ======================================================
               AUTHENTICATED NAVIGATION
               ====================================================== -->
          <template v-if="auth.isAuthenticated">

            <!-- New Post -->
            <li class="nav-item">
              <router-link
                class="nav-link"
                to="/posts/new"
                @click="closeMenu"
              >
                <i class="bi bi-plus-circle me-1"></i>
                New Post
              </router-link>
            </li>


            <!-- My Posts -->
            <li class="nav-item">
              <router-link
                class="nav-link"
                to="/dashboard"
                @click="closeMenu"
              >
                My Posts
              </router-link>
            </li>


            <!-- ====================================================
                 ADMIN
                 ==================================================== -->
            <li
              v-if="auth.isAdmin"
              class="nav-item"
            >
              <router-link
                class="nav-link"
                to="/admin"
                @click="closeMenu"
              >
                <i class="bi bi-shield-check me-1"></i>
                Admin
              </router-link>
            </li>


            <!-- Profile -->
            <li class="nav-item">
              <router-link
                class="nav-link"
                :to="`/profile/${auth.user.username}`"
                @click="closeMenu"
              >
                <i class="bi bi-person-circle me-1"></i>
                Profile
              </router-link>
            </li>


            <!-- Logout -->
            <li class="nav-item">
              <button
                type="button"
                class="nav-link border-0 bg-transparent"
                @click="handleLogout"
              >
                <i class="bi bi-box-arrow-right me-1"></i>
                Logout
              </button>
            </li>

          </template>


          <!-- ======================================================
               GUEST NAVIGATION
               ====================================================== -->
          <template v-else>

            <!-- Login -->
            <li class="nav-item">
              <router-link
                class="nav-link"
                to="/login"
                @click="closeMenu"
              >
                Login
              </router-link>
            </li>


            <!-- Sign Up -->
            <li class="nav-item">
              <router-link
                class="btn btn-app-primary btn-sm"
                to="/register"
                @click="closeMenu"
              >
                Sign Up
              </router-link>
            </li>

          </template>

        </ul>

      </div>

    </div>

  </nav>
</template>


<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "../../store/auth";


const auth = useAuthStore();
const router = useRouter();

const isOpen = ref(false);


const toggleMenu = () => {
  isOpen.value = !isOpen.value;
};


const closeMenu = () => {
  isOpen.value = false;
};


const handleLogout = async () => {
  await auth.logout();

  closeMenu();

  router.push({ name: "home" });
};
</script>
```

### `client/src/router/index.js`

```js
import { createRouter, createWebHistory } from "vue-router";
import { useAuthStore } from "../store/auth";


const routes = [

  // ================================================================
  // PUBLIC
  // ================================================================

  {
    path: "/",
    name: "home",
    component: () => import("../views/Home.vue"),
  },

  {
    path: "/posts/:slug",
    name: "post-detail",
    component: () => import("../views/PostDetail.vue"),
    props: true,
  },

  {
    path: "/profile/:username",
    name: "profile",
    component: () => import("../views/Profile.vue"),
    props: true,
  },


  // ================================================================
  // GUEST
  // ================================================================

  {
    path: "/login",
    name: "login",
    component: () => import("../views/Login.vue"),
    meta: {
      requiresGuest: true,
    },
  },

  {
    path: "/register",
    name: "register",
    component: () => import("../views/Register.vue"),
    meta: {
      requiresGuest: true,
    },
  },


  // ================================================================
  // AUTHENTICATED
  // ================================================================

  {
    path: "/posts/new",
    name: "post-create",
    component: () => import("../views/PostCreate.vue"),
    meta: {
      requiresAuth: true,
    },
  },

  {
    path: "/posts/:slug/edit",
    name: "post-edit",
    component: () => import("../views/PostEdit.vue"),
    props: true,
    meta: {
      requiresAuth: true,
    },
  },

  {
    path: "/dashboard",
    name: "dashboard",
    component: () => import("../views/Dashboard.vue"),
    meta: {
      requiresAuth: true,
    },
  },


  // ================================================================
  // ADMIN
  // ================================================================

  {
    path: "/admin",
    name: "admin",
    component: () => import("../views/Admin.vue"),
    meta: {
      requiresAuth: true,
      requiresAdmin: true,
    },
  },


  // ================================================================
  // FALLBACK
  // ================================================================

  {
    path: "/:pathMatch(.*)*",
    name: "not-found",
    component: () => import("../views/NotFound.vue"),
  },
];


const router = createRouter({
  history: createWebHistory(),
  routes,

  scrollBehavior() {
    return { top: 0 };
  },
});


router.beforeEach((to) => {
  const authStore = useAuthStore();


  // Authentication check
  if (
    to.meta.requiresAuth &&
    !authStore.isAuthenticated
  ) {
    return {
      name: "login",
      query: {
        redirect: to.fullPath,
      },
    };
  }


  // Guest-only pages
  if (
    to.meta.requiresGuest &&
    authStore.isAuthenticated
  ) {
    return {
      name: "home",
    };
  }


  // Admin-only pages
  if (
    to.meta.requiresAdmin &&
    !authStore.isAdmin
  ) {
    return {
      name: "home",
    };
  }


  return true;
});


export default router;
```