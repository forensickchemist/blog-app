import { defineStore } from "pinia";
import { authService } from "../services/auth";

export const useAuthStore = defineStore("auth", {
  state: () => ({
    user: null,
    isLoading: false,
    isInitialized: false,
  }),

  getters: {
    isAuthenticated: (state) => !!state.user,
    isAdmin: (state) => state.user?.role === "admin",
  },

  actions: {
    async register(payload) {
      this.isLoading = true;

      try {
        const res = await authService.register(payload);
        return res;
      } finally {
        this.isLoading = false;
      }
    },

    async login(payload) {
      this.isLoading = true;

      try {
        const res = await authService.login(payload);
        this._setSession(res.data);
        return res;
      } finally {
        this.isLoading = false;
      }
    },

    async logout() {
      try {
        await authService.logout();
      } finally {
        this.user = null;
      }
    },

    async fetchCurrentUser() {
      this.isLoading = true;

      try {
        const res = await authService.getMe();
        this.user = res.data.user;
      } catch {
        this.user = null;
      } finally {
        this.isLoading = false;
        this.isInitialized = true;
      }
    },

    _setSession(data) {
      this.user = data.user;
    },
  },
});