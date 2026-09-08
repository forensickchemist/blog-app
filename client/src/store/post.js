
import { defineStore } from "pinia";
import { postService } from "../services/post";

export const usePostStore = defineStore("post", {
  state: () => ({
    posts: [],
    currentPost: null,
    pagination: { total: 0, page: 1, limit: 10, totalPages: 1 },
    isLoading: false,
    error: null,
  }),

  actions: {
    async fetchPosts(params = {}) {
      this.isLoading = true;
      this.error = null;
      try {
        const res = await postService.getAll(params);
        this.posts = res.data.posts;
        this.pagination = res.data.pagination;
      } catch (err) {
        this.error = err.message;
      } finally {
        this.isLoading = false;
      }
    },

    async fetchPostBySlug(slug) {
      this.isLoading = true;
      this.error = null;
      this.currentPost = null;
      try {
        const res = await postService.getBySlug(slug);
        this.currentPost = res.data.post;
        return res.data.post;
      } catch (err) {
        this.error = err.message;
        throw err;
      } finally {
        this.isLoading = false;
      }
    },

    async createPost(formData) {
      const res = await postService.create(formData);
      return res.data.post;
    },

    async updatePost(slug, formData) {
      const res = await postService.update(slug, formData);
      return res.data.post;
    },

    async deletePost(slug) {
      await postService.remove(slug);
      this.posts = this.posts.filter((p) => p.slug !== slug);
    },
  },
});
