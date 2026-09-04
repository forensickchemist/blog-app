import { Router } from "express";
import { body } from "express-validator";
import { register, login, logout, getMe } from "../controllers/auth.js";
import { protect } from "../middlewares/auth.js";
import validate from "../middlewares/validate.js";

const router = Router();

router.post(
  "/register",
  [
    body("email").isEmail().withMessage("A valid email is required"),
    body("username")
      .trim()
      .isLength({ min: 3, max: 30 })
      .withMessage("Username must be 3-30 characters"),
    body("password")
      .isLength({ min: 8 })
      .withMessage("Password must be at least 8 characters"),
  ],
  validate,
  register
);

router.post(
  "/login",
  [
    body("emailOrUsername").notEmpty().withMessage("Email or username is required"),
    body("password").notEmpty().withMessage("Password is required"),
  ],
  validate,
  login
);

router.post("/logout", logout);
router.get("/me", protect, getMe);

export default router;
