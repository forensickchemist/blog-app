import { Router } from "express";
import { body } from "express-validator";
import {
  getUserProfile,
  updateProfile,
  updateAvatar,
  listUsers,
} from "../controllers/user.js";
import { protect, authorize } from "../middlewares/auth.js";
import { upload } from "../config/cloudinary.js";
import validate from "../middlewares/validate.js";

const router = Router();

router.get("/", protect, authorize("admin"), listUsers);
router.get("/:username", getUserProfile);

router.put(
  "/me",
  protect,
  [body("username").optional().trim().isLength({ min: 3, max: 30 })],
  validate,
  updateProfile
);

router.put("/me/avatar", protect, upload.single("avatar"), updateAvatar);

export default router;
