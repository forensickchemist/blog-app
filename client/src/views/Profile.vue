<template>
  <div class="app-container page-section">
    <BaseLoader
      v-if="loading"
      label="Loading profile..."
    />

    <template v-else-if="profileUser">
      <!-- PROFILE HEADER -->
      <section class="mb-5">
        <div class="d-flex align-items-start gap-3">
          <!-- Avatar -->
          <div class="flex-shrink-0 text-center">
            <img
              v-if="profileUser.avatarUrl"
              :src="profileUser.avatarUrl"
              class="rounded-circle"
              width="100"
              height="100"
              :alt="profileUser.username"
              style="object-fit: cover"
            />

            <i
              v-else
              class="bi bi-person-circle"
              style="font-size: 88px"
              aria-hidden="true"
            ></i>
          </div>

          <!-- Profile information -->
          <div class="flex-grow-1">
            <div
              class="d-flex flex-wrap align-items-center gap-2 mb-1"
            >
              <h1 class="fs-3 mb-0">
                {{ profileUser.username }}
              </h1>

              <span
                v-if="profileUser.role === 'admin'"
                class="badge text-bg-secondary"
              >
                Admin
              </span>
            </div>

            <template v-if="!editingProfile">
              <p class="text-muted-app mb-2">
                {{ profileUser.bio || "Still writing in my head..." }}
              </p>

              <BaseButton
                v-if="isOwnProfile"
                variant="outline"
                size="sm"
                icon="bi-pencil"
                @click="startEditingProfile"
              >
                Edit Profile
              </BaseButton>
            </template>
          </div>
        </div>

        <!-- PROFILE EDITOR -->
        <div
          v-if="editingProfile"
          class="mt-4"
        >
          <BaseAlert
            v-if="error"
            :message="error"
            variant="danger"
            dismissible
            @dismiss="error = ''"
          />

          <!-- Avatar -->
          <div class="mb-4">
            <label class="form-label">
              Avatar
            </label>

            <div class="d-flex align-items-center gap-3 flex-wrap">
              <img
                v-if="avatarPreview || profileUser.avatarUrl"
                :src="
                  avatarPreview ||
                  profileUser.avatarUrl
                "
                class="rounded-circle"
                width="88"
                height="88"
                :alt="profileUser.username"
                style="object-fit: cover"
              />

              <i
                v-else
                class="bi bi-person-circle"
                style="font-size: 88px"
                aria-hidden="true"
              ></i>

              <ImageCropper
                :aspect-ratio="1"
                :output-width="800"
                :output-height="800"
                button-text="Change Avatar"
                @cropped="handleAvatarCropped"
                @error="handleCropError"
              />
            </div>
          </div>

          <!-- Bio -->
          <BaseInput
            id="profile-bio"
            v-model="bioDraft"
            type="textarea"
            label="Bio"
            placeholder="Tell people a little about yourself..."
            :rows="4"
            :error="bioError"
            hint="Maximum 280 characters."
          />

          <!-- Save controls -->
          <div class="d-flex gap-2 flex-wrap">
            <BaseButton
              variant="primary"
              icon="bi-check-lg"
              :loading="savingBio"
              :disabled="
                !!bioError ||
                savingAvatar
              "
              @click="saveBio"
            >
              Save Bio
            </BaseButton>

            <BaseButton
              v-if="selectedAvatar"
              variant="primary"
              icon="bi-image"
              :loading="savingAvatar"
              :disabled="savingBio"
              @click="saveAvatar"
            >
              Save Avatar
            </BaseButton>

            <BaseButton
              variant="outline"
              :disabled="
                savingBio ||
                savingAvatar
              "
              @click="cancelEditingProfile"
            >
              Cancel
            </BaseButton>
          </div>
        </div>
      </section>

      <!-- POSTS -->
      <section>
        <h2 class="fs-5 mb-3">
          Pages from {{ profileUser.username }}'s notebook
        </h2>

        <EmptyState
          v-if="!posts.length"
          icon="bi-journal-x"
          title="No posts yet"
          description="This user hasn't shared their notebook yet."
        />

        <template v-else>
          <div class="row g-4">
            <div
              v-for="post in posts"
              :key="post._id"
              class="col-12 col-sm-6 col-lg-4"
            >
              <PostCard :post="post" />
            </div>
          </div>

          <div class="mt-5">
            <BasePagination
              :page="pagination.page"
              :total-pages="pagination.totalPages"
              @change="changePage"
            />
          </div>
        </template>
      </section>
    </template>

    <EmptyState
      v-else
      icon="bi-person-x"
      title="User not found"
      description="This profile doesn't exist."
    />
  </div>
</template>

<script setup>
import {
  computed,
  onMounted,
  ref,
} from "vue";

import { userService } from "../services/user";
import { postService } from "../services/post";
import { useAuthStore } from "../store/auth";

import PostCard from "../components/blog/PostCard.vue";
import BaseAlert from "../components/common/BaseAlert.vue";
import BaseButton from "../components/common/BaseButton.vue";
import BaseInput from "../components/common/BaseInput.vue";
import BaseLoader from "../components/common/BaseLoader.vue";
import BasePagination from "../components/common/BasePagination.vue";
import EmptyState from "../components/common/EmptyState.vue";
import ImageCropper from "../components/common/ImageCropper.vue";

const props = defineProps({
  username: {
    type: String,
    required: true,
  },
});

const auth = useAuthStore();

const loading = ref(true);

const profileUser = ref(null);
const posts = ref([]);

const pagination = ref({
  total: 0,
  page: 1,
  limit: 9,
  totalPages: 1,
});

// PROFILE EDITING
const editingProfile = ref(false);

const bioDraft = ref("");
const savingBio = ref(false);

const selectedAvatar = ref(null);
const avatarPreview = ref("");
const savingAvatar = ref(false);

const error = ref("");

const isOwnProfile = computed(() => {
  return (
    auth.user?.username &&
    profileUser.value?.username &&
    auth.user.username ===
      profileUser.value.username
  );
});

const bioError = computed(() => {
  if (bioDraft.value.length > 280) {
    return "Bio cannot exceed 280 characters.";
  }

  return "";
});

// PROFILE EDITING
const startEditingProfile = () => {
  bioDraft.value =
    profileUser.value.bio || "";

  selectedAvatar.value = null;
  avatarPreview.value = "";

  error.value = "";
  editingProfile.value = true;
};

const cancelEditingProfile = () => {
  bioDraft.value = "";
  selectedAvatar.value = null;
  avatarPreview.value = "";

  error.value = "";
  editingProfile.value = false;
};

const handleAvatarCropped = (file) => {
  selectedAvatar.value = file;

  if (avatarPreview.value) {
    URL.revokeObjectURL(
      avatarPreview.value
    );
  }

  avatarPreview.value =
    URL.createObjectURL(file);

  error.value = "";
};

const handleCropError = (message) => {
  error.value = message;
};

const saveBio = async () => {
  if (bioError.value) {
    return;
  }

  savingBio.value = true;
  error.value = "";

  try {
    const res =
      await userService.updateProfile(
        bioDraft.value
      );

    profileUser.value =
      res.data.user;

    bioDraft.value = "";
    editingProfile.value = false;
  } catch (err) {
    error.value =
      err.response?.data?.message ||
      "Failed to update your bio.";
  } finally {
    savingBio.value = false;
  }
};

// AVATAR
const saveAvatar = async () => {
  if (!selectedAvatar.value) {
    return;
  }

  savingAvatar.value = true;
  error.value = "";

  try {
    const formData =
      new FormData();

    formData.append(
      "avatar",
      selectedAvatar.value
    );

    const res =
      await userService.updateAvatar(
        formData
      );

    profileUser.value =
      res.data.user;

    selectedAvatar.value = null;

    if (avatarPreview.value) {
      URL.revokeObjectURL(
        avatarPreview.value
      );
    }

    avatarPreview.value = "";
  } catch (err) {
    error.value =
      err.response?.data?.message ||
      "Failed to update your avatar.";
  } finally {
    savingAvatar.value = false;
  }
};

// POSTS
const loadPosts = async (page = 1) => {
  const res =
    await postService.getByUser(
      props.username,
      {
        page,
        limit: 9,
      }
    );

  posts.value =
    res.data.posts;

  pagination.value =
    res.data.pagination;
};

// PROFILE + INITIAL POSTS
const loadProfile = async () => {
  loading.value = true;

  try {
    const userRes =
      await userService.getProfile(
        props.username
      );

    profileUser.value =
      userRes.data.user;

    await loadPosts(1);
  } catch {
    profileUser.value = null;
  } finally {
    loading.value = false;
  }
};

// PAGINATION
const changePage = async (page) => {
  if (
    page < 1 ||
    page >
      pagination.value.totalPages
  ) {
    return;
  }

  try {
    await loadPosts(page);
  } catch {
    error.value =
      "Failed to load posts.";
  }
};

onMounted(loadProfile);
</script>