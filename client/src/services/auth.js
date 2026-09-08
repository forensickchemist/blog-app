
import api from "./api";

export const authService = {
  register(payload) {
    return api.post("/auth/register", payload);
  },
  login(payload) {
    return api.post("/auth/login", payload);
  },
  logout() {
    return api.post("/auth/logout");
  },
  getMe() {
    return api.get("/auth/me");
  },
};
