import { Router } from "express";
import { body } from "express-validator";

import {
  getComments,
  createComment,
  deleteComment,
} from "../controllers/comment.js";

import {
  protect,
  optionalAuth,
} from "../middlewares/auth.js";

import validate from "../middlewares/validate.js";

const router = Router();

const commentValidation = [
  body("content")
    .trim()
    .notEmpty()
    .withMessage("Comment content is required")
    .isLength({ max: 1000 })
    .withMessage(
      "Comment cannot exceed 1000 characters"
    ),

  body("parentComment")
    .optional()
    .isMongoId()
    .withMessage("Invalid parent comment"),

  body("mentionedUsername")
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage(
      "Invalid mentioned username"
    ),
];

// PUBLIC / OPTIONAL AUTH

router.get(
  "/posts/:postId/comments",
  optionalAuth,
  getComments
);

// AUTHENTICATED USERS

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