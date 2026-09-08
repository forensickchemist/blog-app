import api from "./api";

export const postService = {
  getAll(params = {}) {
    return api.get("/posts", { params });
  },

  getBySlug(slug) {
    return api.get(`/posts/${slug}`);
  },

  getByUser(username, params = {}) {
    return api.get(`/posts/user/${username}`, {
      params,
    });
  },

  getMyPosts() {
    return api.get("/posts/me");
  },

  getAdminPosts(params = {}) {
    return api.get("/posts/admin", { params });
  },

  create(formData) {
    return api.post("/posts", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },

  update(slug, formData) {
    return api.put(`/posts/${slug}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },

  remove(slug) {
    return api.delete(`/posts/${slug}`);
  },
};