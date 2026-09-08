import { createRouter, createWebHistory } from "vue-router";
import { useAuthStore } from "../store/auth";

const routes = [
  // PUBLIC
  {
    path: "/",
    name: "home",
    component: () => import("../views/Home.vue"),
  },

  {
    path: "/posts/:slug",
    name: "post-detail",
    component: () => import("../views/PostDetail.vue"),
    props: true,
  },

  {
    path: "/profile/:username",
    name: "profile",
    component: () => import("../views/Profile.vue"),
    props: true,
  },

  // GUEST
  {
    path: "/login",
    name: "login",
    component: () => import("../views/Login.vue"),
    meta: {
      requiresGuest: true,
    },
  },

  {
    path: "/register",
    name: "register",
    component: () => import("../views/Register.vue"),
    meta: {
      requiresGuest: true,
    },
  },

  // AUTHENTICATED
  {
    path: "/posts/new",
    name: "post-create",
    component: () => import("../views/PostCreate.vue"),
    meta: {
      requiresAuth: true,
    },
  },

  {
    path: "/posts/:slug/edit",
    name: "post-edit",
    component: () => import("../views/PostEdit.vue"),
    props: true,
    meta: {
      requiresAuth: true,
    },
  },

  {
    path: "/dashboard",
    name: "dashboard",
    component: () => import("../views/Dashboard.vue"),
    meta: {
      requiresAuth: true,
    },
  },

  // ADMIN
  {
    path: "/admin",
    name: "admin",
    component: () => import("../views/Admin.vue"),
    meta: {
      requiresAuth: true,
      requiresAdmin: true,
    },
  },

  // FALLBACK
  {
    path: "/:pathMatch(.*)*",
    name: "not-found",
    component: () => import("../views/NotFound.vue"),
  },
];


const router = createRouter({
  history: createWebHistory(),
  routes,

  scrollBehavior() {
    return { top: 0 };
  },
});


router.beforeEach(async (to) => {
  const authStore = useAuthStore();

  // Wait for the initial session check to finish.
  if (!authStore.isInitialized) {
    await authStore.fetchCurrentUser();
  }

  // Authentication check
  if (
    to.meta.requiresAuth &&
    !authStore.isAuthenticated
  ) {
    return {
      name: "login",
      query: {
        redirect: to.fullPath,
      },
    };
  }

  // Guest-only pages
  if (
    to.meta.requiresGuest &&
    authStore.isAuthenticated
  ) {
    return {
      name: "home",
    };
  }

  // Admin-only pages
  if (
    to.meta.requiresAdmin &&
    !authStore.isAdmin
  ) {
    return {
      name: "home",
    };
  }

  return true;
});


export default router;