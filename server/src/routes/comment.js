import { Router } from "express";
import { body } from "express-validator";

import {
  getComments,
  createComment,
  deleteComment,
} from "../controllers/comment.js";

import { protect, optionalAuth } from "../middlewares/auth.js";
import validate from "../middlewares/validate.js";

const router = Router();

const commentValidation = [
  body("content")
    .trim()
    .notEmpty()
    .withMessage("Comment content is required")
    .isLength({ max: 1000 })
    .withMessage("Comment cannot exceed 1000 characters"),
];

// PUBLIC / OPTIONAL AUTH
// Guests can read comments on published posts.
// Owners/admins can read comments on accessible drafts.
router.get(
  "/posts/:postId/comments",
  optionalAuth,
  getComments
);

// AUTHENTICATED USERS
// Users can comment on posts they are allowed to access.
router.post(
  "/posts/:postId/comments",
  protect,
  commentValidation,
  validate,
  createComment
);

// COMMENT OWNER OR ADMIN
router.delete(
  "/comments/:commentId",
  protect,
  deleteComment
);

export default router;