import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:4000/api",
  withCredentials: true, // send the httpOnly auth cookie
  headers: {
    "Content-Type": "application/json",
  },
});

// Normalize errors so callers can just read err.message / err.errors
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const payload = error.response?.data;
    const normalized = {
      statusCode: error.response?.status || 500,
      message: payload?.message || error.message || "Something went wrong",
      errors: payload?.errors || [],
    };
    return Promise.reject(normalized);
  }
);

export default api;
