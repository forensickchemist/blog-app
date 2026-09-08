<template>
  <div class="app-container page-section">

    <div class="mb-4">
      <h1 class="mb-1">
        Admin
      </h1>

      <p class="text-muted-app mb-0">
        Admin dashboard
      </p>
    </div>


    <!-- ==========================================================
         INITIAL LOADING
         ========================================================== -->

    <BaseLoader
      v-if="loading"
      label="Loading admin data..."
    />


    <!-- ==========================================================
         ERROR
         ========================================================== -->

    <BaseAlert
      v-else-if="error"
      :message="error"
      variant="danger"
    />


    <template v-else>

      <!-- ========================================================
           STATS
           ======================================================== -->

      <div class="row g-4 mb-5">

        <div class="col-md-4">
          <AdminStatCard
            label="Users"
            :value="userCount"
          />
        </div>

        <div class="col-md-4">
          <AdminStatCard
            label="Posts"
            :value="postCount"
          />
        </div>

        <div class="col-md-4">
          <AdminStatCard
            label="Drafts"
            :value="draftCount"
          />
        </div>

      </div>


      <!-- ========================================================
           POSTS TABLE
           ======================================================== -->

      <BaseCard class="mb-5">

        <div
          class="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-3 gap-3"
        >
          <h2 class="mb-0">
            Notes
          </h2>

          <BaseSearch
            v-model="postSearch"
            placeholder="Search notes or users..."
            @search="searchPosts"
          />
        </div>

        <AdminPostTable
          :posts="posts"
          @delete="handleDeleteRequest"
        />

        <div class="mt-4">
          <BasePagination
            :page="postPagination.page"
            :total-pages="postPagination.totalPages"
            @change="changePostPage"
          />
        </div>

      </BaseCard>


      <!-- ========================================================
           USERS
           ======================================================== -->

      <BaseCard>

        <div
          class="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-3 gap-3"
        >
          <h2 class="mb-0">
            Users
          </h2>

          <BaseSearch
            v-model="userSearch"
            placeholder="Search users..."
            @search="searchUsers"
          />
        </div>

        <AdminUserTable
          :users="users"
          @change-role="handleRoleChangeRequest"
          @delete="handleUserDeleteRequest"
        />

        <div class="mt-4">
          <BasePagination
            :page="userPagination.page"
            :total-pages="userPagination.totalPages"
            @change="changeUserPage"
          />
        </div>

      </BaseCard>

    </template>


    <!-- ==========================================================
         DELETE POST MODAL
         ========================================================== -->

    <ConfirmModal
      ref="deleteModal"
      id="admin-delete-post-modal"
      title="Delete Post"
      :message="
        selectedPost
          ? `Are you sure you want to delete '${selectedPost.title}'? This action cannot be undone.`
          : 'Are you sure you want to delete this post? This action cannot be undone.'
      "
      confirm-text="Delete"
      @confirm="handleDelete"
    />


    <!-- ==========================================================
         CHANGE ROLE MODAL
         ========================================================== -->

    <ConfirmModal
      ref="roleModal"
      id="admin-change-role-modal"
      :title="
        selectedUser?.role === 'admin'
          ? 'Remove Admin Role'
          : 'Make User Admin'
      "
      :message="
        selectedUser
          ? selectedUser.role === 'admin'
            ? `Are you sure you want to remove admin access from '${selectedUser.username}'?`
            : `Are you sure you want to make '${selectedUser.username}' an admin?`
          : 'Are you sure you want to change this user role?'
      "
      :confirm-text="
        selectedUser?.role === 'admin'
          ? 'Remove Admin'
          : 'Make Admin'
      "
      @confirm="handleRoleChange"
    />


    <!-- ==========================================================
         DELETE USER MODAL
         ========================================================== -->

    <ConfirmModal
      ref="userDeleteModal"
      id="admin-delete-user-modal"
      title="Delete User"
      :message="
        selectedUser
          ? `Are you sure you want to delete '${selectedUser.username}'? Their account and all of their posts will be permanently deleted. This action cannot be undone.`
          : 'Are you sure you want to delete this user? This action cannot be undone.'
      "
      confirm-text="Delete User"
      @confirm="handleUserDelete"
    />

  </div>
</template>


<script setup>
import { onMounted, ref, watch } from "vue";

import { postService } from "../services/post";
import { userService } from "../services/user";

import BaseAlert from "../components/common/BaseAlert.vue";
import BaseCard from "../components/common/BaseCard.vue";
import BaseLoader from "../components/common/BaseLoader.vue";
import BasePagination from "../components/common/BasePagination.vue";
import BaseSearch from "../components/common/BaseSearch.vue";
import ConfirmModal from "../components/common/ConfirmModal.vue";

import AdminStatCard from "../components/admin/AdminStatCard.vue";
import AdminPostTable from "../components/admin/AdminPostTable.vue";
import AdminUserTable from "../components/admin/AdminUserTable.vue";


const loading = ref(true);
const error = ref("");


// ================================================================
// POSTS
// ================================================================

const posts = ref([]);
const postSearch = ref("");

const postPagination = ref({
  total: 0,
  page: 1,
  limit: 10,
  totalPages: 1,
});


// ================================================================
// USERS
// ================================================================

const users = ref([]);
const userSearch = ref("");

const userPagination = ref({
  total: 0,
  page: 1,
  limit: 10,
  totalPages: 1,
});


// ================================================================
// DASHBOARD STATS
// ================================================================

const userCount = ref(0);
const postCount = ref(0);
const draftCount = ref(0);


// ================================================================
// MODALS
// ================================================================

const selectedPost = ref(null);
const deleteModal = ref(null);

const selectedUser = ref(null);
const roleModal = ref(null);
const userDeleteModal = ref(null);


// ================================================================
// LOAD POSTS
// ================================================================

const loadPosts = async (page = 1) => {
  const res = await postService.getAdminPosts({
    page,
    search: postSearch.value.trim() || undefined,
  });

  posts.value = res.data.posts;
  postPagination.value = res.data.pagination;

  // These are intentionally based on the complete dataset,
  // not the current search results.
  postCount.value = res.data.counts.total;
  draftCount.value = res.data.counts.drafts;
};


// ================================================================
// LOAD USERS
// ================================================================

const loadUsers = async (page = 1) => {
  const res = await userService.listUsers({
    page,
    search: userSearch.value.trim() || undefined,
  });

  users.value = res.data.users;
  userPagination.value = res.data.pagination;

  // Always use the complete user count for the dashboard stat.
  userCount.value = res.data.count;
};


// ================================================================
// INITIAL LOAD
// ================================================================

const loadAdminData = async () => {
  loading.value = true;
  error.value = "";

  try {
    await Promise.all([
      loadPosts(),
      loadUsers(),
    ]);
  } catch (err) {
    error.value =
      err.response?.data?.message ||
      "Unable to load admin data.";
  } finally {
    loading.value = false;
  }
};


// ================================================================
// POST SEARCH
// ================================================================

const searchPosts = () => {
  loadPosts(1).catch((err) => {
    error.value =
      err.response?.data?.message ||
      "Unable to load posts.";
  });
};


// Clear search → restore all posts
watch(postSearch, (value) => {
  if (!value.trim()) {
    loadPosts(1).catch((err) => {
      error.value =
        err.response?.data?.message ||
        "Unable to load posts.";
    });
  }
});


// ================================================================
// POST PAGINATION
// ================================================================

const changePostPage = (page) => {
  if (
    page < 1 ||
    page > postPagination.value.totalPages
  ) {
    return;
  }

  loadPosts(page).catch((err) => {
    error.value =
      err.response?.data?.message ||
      "Unable to load posts.";
  });
};


// ================================================================
// USER SEARCH
// ================================================================

const searchUsers = () => {
  loadUsers(1).catch((err) => {
    error.value =
      err.response?.data?.message ||
      "Unable to load users.";
  });
};


// Clear search → restore all users
watch(userSearch, (value) => {
  if (!value.trim()) {
    loadUsers(1).catch((err) => {
      error.value =
        err.response?.data?.message ||
        "Unable to load users.";
    });
  }
});


// ================================================================
// USER PAGINATION
// ================================================================

const changeUserPage = (page) => {
  if (
    page < 1 ||
    page > userPagination.value.totalPages
  ) {
    return;
  }

  loadUsers(page).catch((err) => {
    error.value =
      err.response?.data?.message ||
      "Unable to load users.";
  });
};


// ================================================================
// DELETE POST
// ================================================================

const handleDeleteRequest = (post) => {
  selectedPost.value = post;
  deleteModal.value?.show();
};


const handleDelete = async () => {
  if (!selectedPost.value) {
    return;
  }

  const slug = selectedPost.value.slug;

  try {
    await postService.remove(slug);

    selectedPost.value = null;

    await loadPosts(
      Math.min(
        postPagination.value.page,
        postPagination.value.totalPages
      )
    );
  } catch (err) {
    error.value =
      err.response?.data?.message ||
      "Unable to delete post.";
  }
};


// ================================================================
// CHANGE USER ROLE
// ================================================================

const handleRoleChangeRequest = (user) => {
  selectedUser.value = user;
  roleModal.value?.show();
};


const handleRoleChange = async () => {
  if (!selectedUser.value) {
    return;
  }

  const userId = selectedUser.value._id;

  const newRole =
    selectedUser.value.role === "admin"
      ? "user"
      : "admin";

  try {
    await userService.updateRole(
      userId,
      newRole
    );

    selectedUser.value = null;

    await loadUsers(userPagination.value.page);
  } catch (err) {
    error.value =
      err.response?.data?.message ||
      "Unable to update user role.";
  }
};


// ================================================================
// DELETE USER
// ================================================================

const handleUserDeleteRequest = (user) => {
  selectedUser.value = user;
  userDeleteModal.value?.show();
};


const handleUserDelete = async () => {
  if (!selectedUser.value) {
    return;
  }

  const userId = selectedUser.value._id;

  try {
    await userService.remove(userId);

    selectedUser.value = null;

    await loadUsers(
      Math.min(
        userPagination.value.page,
        userPagination.value.totalPages
      )
    );
  } catch (err) {
    error.value =
      err.response?.data?.message ||
      "Unable to delete user.";
  }
};


onMounted(loadAdminData);
</script>