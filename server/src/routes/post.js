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


// PUBLIC ROUTES
// All published posts
router.get("/", getAllPosts);

// Published posts by author
router.get("/user/:username", getPostsByUser);

// AUTHENTICATED USER ROUTES
// Current user's published + draft posts
router.get("/me", protect, getMyPosts);

// SINGLE POST
router.get("/:slug", getPostBySlug);


// CREATE / UPDATE / DELETE

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