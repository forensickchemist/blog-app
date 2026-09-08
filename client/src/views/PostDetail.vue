<template>
  <div class="app-container page-section">
    <BaseLoader
      v-if="loading"
      label="Loading post..."
    />

    <BaseAlert
      v-else-if="error"
      :message="error"
      variant="danger"
    />

    <template v-else-if="post">
      <article class="post-detail">
        <!-- Cover Image -->
        <img
          v-if="post.coverImage?.url"
          :src="post.coverImage.url"
          :alt="post.title"
          class="post-detail__cover"
        />

        <!-- Header -->
        <header class="post-detail__header">
          <div class="post-detail__meta">
            <span
              v-if="post.status === 'draft'"
              class="badge rounded-pill text-bg-secondary"
            >
              Draft
            </span>

            <span>
              {{ formatDateTime(post.createdAt) }}
            </span>

            <span
              v-if="post.author"
              class="post-detail__author-meta"
            >
              ·

              <router-link
                :to="`/profile/${post.author.username}`"
                class="text-reset"
              >
                {{ post.author.username }}
              </router-link>

              <span
                v-if="post.author.role === 'admin'"
                class="badge rounded-pill text-bg-primary"
              >
                Admin
              </span>
            </span>
          </div>

          <h1 class="post-detail__title">
            {{ post.title }}
          </h1>

          <!-- Tags -->
          <div
            v-if="post.tags?.length"
            class="post-detail__tags"
          >
            <span
              v-for="tag in post.tags"
              :key="tag"
              class="badge rounded-pill text-bg-light"
            >
              #{{ tag }}
            </span>
          </div>
        </header>

        <!-- Content -->
        <div
          class="post-detail__content"
          v-html="post.content"
        ></div>

        <!-- Author -->
        <footer
          v-if="post.author"
          class="post-detail__author"
        >
          <div class="post-detail__author-avatar">
            <img
              v-if="post.author.avatarUrl"
              :src="post.author.avatarUrl"
              :alt="post.author.username"
            />

            <i
              v-else
              class="bi bi-person"
            ></i>
          </div>

          <div>
            <div class="small text-muted-app">
              Written by
            </div>

            <router-link
              :to="`/profile/${post.author.username}`"
              class="fw-semibold text-reset"
            >
              {{ post.author.username }}
            </router-link>

            <p
              v-if="post.author.bio"
              class="small text-muted-app mb-0 mt-1"
            >
              {{ post.author.bio }}
            </p>
          </div>
        </footer>
      </article>

      <!-- Comments -->
      <CommentSection
        :post-id="post._id"
      />
    </template>
  </div>
</template>

<script setup>
import {
  onMounted,
  ref,
} from "vue";

import { useRoute } from "vue-router";
import { usePostStore } from "../store/post";

import BaseLoader from "../components/common/BaseLoader.vue";
import BaseAlert from "../components/common/BaseAlert.vue";
import CommentSection from "../components/blog/CommentSection.vue";

const route = useRoute();
const store = usePostStore();

const post = ref(null);
const loading = ref(true);
const error = ref("");

const formatDateTime = (date) => {
  return new Date(date).toLocaleString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
};

const loadPost = async () => {
  loading.value = true;
  error.value = "";

  try {
    post.value = await store.fetchPostBySlug(route.params.slug);
  } catch (err) {
    error.value =
      err.response?.data?.message ||
      err.message ||
      "Unable to load this post.";
  } finally {
    loading.value = false;
  }
};

onMounted(loadPost);
</script>

<style scoped>
.post-detail {
  width: min(100%, var(--size-lg));
  margin: 0 auto;
}

.post-detail__cover {
  display: block;
  width: 100%;
  max-height: 16/9;
  margin-bottom: var(--space-8);
  object-fit: cover;
  border-radius: var(--radius-xl);
}

.post-detail__header {
  margin-bottom: var(--space-8);
}

.post-detail__meta {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--space-2);
  margin-bottom: var(--space-3);
  color: var(--color-text-muted);
  font-size: var(--fs-sm);
}

.post-detail__title {
  margin: 0 0 var(--space-4);
  font-family: var(--font-heading);
  font-size: clamp(
    var(--fs-3xl),
    6vw,
    var(--fs-5xl)
  );
  font-weight: var(--fw-bold);
  line-height: var(--lh-tight);
  letter-spacing: -0.02em;
}

.post-detail__tags {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
  margin-top: var(--space-2);
}

.post-detail__content {
  color: var(--color-text);
  font-size: var(--fs-lg);
  line-height: var(--lh-relaxed);
}

.post-detail__content :deep(p) {
  margin-top: 0;
  margin-bottom: var(--space-5);
}

.post-detail__content :deep(h2) {
  margin-top: var(--space-10);
  margin-bottom: var(--space-4);
  font-family: var(--font-heading);
  font-size: var(--fs-2xl);
  line-height: var(--lh-tight);
}

.post-detail__content :deep(h3) {
  margin-top: var(--space-8);
  margin-bottom: var(--space-3);
  font-family: var(--font-heading);
  font-size: var(--fs-xl);
  line-height: var(--lh-tight);
}

.post-detail__content :deep(ul),
.post-detail__content :deep(ol) {
  margin-bottom: var(--space-5);
  padding-left: var(--space-8);
}

.post-detail__content :deep(li) {
  margin-bottom: var(--space-2);
}

.post-detail__content :deep(blockquote) {
  margin: var(--space-6) 0;
  padding: var(--space-4) var(--space-6);
  border-left: 4px solid var(--color-primary);
  background: var(--color-surface-alt);
  color: var(--color-text-muted);
  font-size: var(--fs-lg);
}

.post-detail__content :deep(pre) {
  margin: var(--space-6) 0;
  padding: var(--space-5);
  overflow-x: auto;
  border-radius: var(--radius-md);
  background: var(--color-surface-alt);
  font-family: var(--font-mono);
  font-size: var(--fs-sm);
  line-height: var(--lh-normal);
}

.post-detail__content :deep(code) {
  font-family: var(--font-mono);
}

.post-detail__content :deep(a) {
  color: var(--color-primary);
  text-decoration: underline;
}

.post-detail__content :deep(img) {
  display: block;
  max-width: 100%;
  height: auto;
  margin: var(--space-6) auto;
  border-radius: var(--radius-lg);
}

.post-detail__author {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  margin-top: var(--space-10);
  padding-top: var(--space-6);
  border-top: var(--border-width) solid var(--color-border);
}

.post-detail__author-meta {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
}

.post-detail__author-avatar {
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 auto;
  width: var(--avatar-size-lg);
  height: var(--avatar-size-lg);
  overflow: hidden;
  border-radius: var(--radius-pill);
  background: var(--color-surface-alt);
  color: var(--color-text-muted);
}

.post-detail__author-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
</style>