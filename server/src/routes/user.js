import { Router } from "express";

import { body, param } from "express-validator";

import {
  getUserProfile,
  updateProfile,
  updateAvatar,
  listUsers,
  updateUserRole,
  deleteUser,
} from "../controllers/user.js";

import { protect, authorize } from "../middlewares/auth.js";

import { upload } from "../config/cloudinary.js";

import validate from "../middlewares/validate.js";

const router = Router();

router.get(
  "/",
  protect,
  authorize("admin"),
  listUsers
);

router.get(
  "/:username",
  getUserProfile
);

router.put(
  "/me",
  protect,
  [
    body("username")
      .optional()
      .trim()
      .isLength({ min: 3, max: 30 }),
  ],
  validate,
  updateProfile
);

router.put(
  "/me/avatar",
  protect,
  upload.single("avatar"),
  updateAvatar
);

// Admin-only: update user role
router.put(
  "/:id/role",
  protect,
  authorize("admin"),
  [
    param("id")
      .isMongoId()
      .withMessage("Invalid user ID"),

    body("role")
      .isIn(["user", "admin"])
      .withMessage("Role must be either user or admin"),
  ],
  validate,
  updateUserRole
);

// Admin-only: delete user
router.delete(
  "/:id",
  protect,
  authorize("admin"),
  [
    param("id")
      .isMongoId()
      .withMessage("Invalid user ID"),
  ],
  validate,
  deleteUser
);

export default router;