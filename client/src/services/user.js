import api from "./api";

export const userService = {
  listUsers(params = {}) {
    return api.get("/users", { params });
  },

  getProfile(username) {
    return api.get(`/users/${username}`);
  },

  updateProfile(bio) {
    return api.put("/users/me", {
      bio,
    });
  },

  updateAvatar(formData) {
    return api.put("/users/me/avatar", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },

  updateRole(userId, role) {
    return api.put(`/users/${userId}/role`, {
      role,
    });
  },

  remove(userId) {
    return api.delete(`/users/${userId}`);
  },
};