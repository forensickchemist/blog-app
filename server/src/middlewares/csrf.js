import ApiError from "../utils/ApiError.js";

const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);

export const csrfProtection = (req, res, next) => {
  if (SAFE_METHODS.has(req.method)) {
    return next();
  }

  const expectedOrigin = process.env.CLIENT_URL;

  if (!expectedOrigin) {
    throw new ApiError(500, "CLIENT_URL is not configured");
  }

  const origin = req.headers.origin;

  if (!origin || origin !== expectedOrigin) {
    throw new ApiError(403, "Invalid request origin");
  }

  next();
};