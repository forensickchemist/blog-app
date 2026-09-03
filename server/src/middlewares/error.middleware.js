import ApiError from "../utils/ApiError.js";

// eslint-disable-next-line no-unused-vars
const errorMiddleware = (err, req, res, next) => {
  let error = err;

  // Normalize known Mongoose errors into ApiError
  if (error.name === "CastError") {
    error = new ApiError(400, `Invalid ${error.path}: ${error.value}`);
  }
  if (error.code === 11000) {
    const field = Object.keys(error.keyValue || {})[0];
    error = new ApiError(409, `${field} already in use`);
  }
  if (error.name === "ValidationError") {
    const messages = Object.values(error.errors).map((val) => val.message);
    error = new ApiError(400, messages.join(", "));
  }
  if (error.name === "JsonWebTokenError") {
    error = new ApiError(401, "Invalid token, please log in again");
  }
  if (error.name === "TokenExpiredError") {
    error = new ApiError(401, "Session expired, please log in again");
  }

  if (!(error instanceof ApiError)) {
    const statusCode = error.statusCode || 500;
    const message = error.message || "Internal server error";
    error = new ApiError(statusCode, message);
  }

  const response = {
    success: false,
    statusCode: error.statusCode,
    message: error.message,
    errors: error.errors,
    ...(process.env.NODE_ENV === "development" && { stack: error.stack }),
  };

  return res.status(error.statusCode).json(response);
};

export const notFound = (req, res, next) => {
  next(new ApiError(404, `Route not found: ${req.originalUrl}`));
};

export default errorMiddleware;
