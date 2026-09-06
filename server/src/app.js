import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";

import errorMiddleware, { notFound } from "./middlewares/error.js";
import ApiResponse from "./utils/ApiResponse.js";

import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/user.js";
import postRoutes from "./routes/post.js";

import { csrfProtection } from "./middlewares/csrf.js";

const app = express();

// ---- Security & parsing ----
app.use(helmet());
app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  })
);
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser());

app.use(csrfProtection);

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// ---- Rate limiting (auth endpoints only, to slow brute force) ----
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  message: "Too many attempts, please try again later.",
});
app.use("/auth", authLimiter);

// ---- Health check ----
app.get("/health", (req, res) => {
  res.status(200).json(new ApiResponse(200, { uptime: process.uptime() }, "Server is healthy"));
});

// ---- Routes (app-specific mounting block) ----
app.use("/auth", authRoutes);
app.use("/users", userRoutes);
app.use("/posts", postRoutes);

// ---- 404 + error handler (must stay last) ----
app.use(notFound);
app.use(errorMiddleware);

export default app;
