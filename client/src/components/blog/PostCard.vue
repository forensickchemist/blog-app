<template>
  <BaseCard
    hoverable
    class="post-card"
  >
    <!-- Cover -->
    <router-link
      :to="`/posts/${post.slug}`"
      class="post-card__cover-link"
    >
      <img
        v-if="post.coverImage?.url"
        :src="post.coverImage.url"
        :alt="post.title"
        class="post-cover"
      />

      <div
        v-else
        class="post-cover post-cover--placeholder"
      >
        <i
          class="bi bi-journal-text"
          aria-hidden="true"
        ></i>
      </div>
    </router-link>

    <div class="post-card__body">
      <!-- Tags -->
      <div class="post-tags">
        <span
          v-for="tag in post.tags?.slice(0, 3)"
          :key="tag"
          class="post-tag"
        >
          {{ tag }}
        </span>
      </div>

      <!-- Title -->
      <h3 class="post-title">
        <router-link
          :to="`/posts/${post.slug}`"
          class="post-title__link"
        >
          {{ post.title }}
        </router-link>
      </h3>

      <!-- Excerpt -->
      <p class="post-excerpt">
        {{ post.excerpt }}
      </p>

      <!-- Author + Date -->
      <div class="post-meta">
        <router-link
          :to="`/profile/${post.author?.username}`"
          class="post-author"
        >
          <span class="post-author__avatar">
            <img
              v-if="post.author?.avatarUrl"
              :src="post.author.avatarUrl"
              :alt="post.author.username"
            />

            <i
              v-else
              class="bi bi-person-circle"
              aria-hidden="true"
            ></i>
          </span>

          <span class="post-author__name">
            {{ post.author?.username || "Unknown" }}
          </span>

          <span
            v-if="post.author?.role === 'admin'"
            class="post-author__badge"
          >
            Admin
          </span>
        </router-link>

        <span class="post-date">
          {{ formattedDate }}
        </span>
      </div>
    </div>
  </BaseCard>
</template>

<script setup>
import { computed } from "vue";

import BaseCard from "../common/BaseCard.vue";

const props = defineProps({
  post: {
    type: Object,
    required: true,
  },
});

const formattedDate = computed(() =>
  new Date(props.post.createdAt).toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  })
);
</script>

<style scoped>
.post-card {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 0;
  overflow: hidden;
}

.post-card__cover-link {
  display: block;
  color: inherit;
  text-decoration: none;
}

.post-cover {
  display: block;
  width: 100%;
  height: 200px;
  object-fit: cover;
}

.post-cover--placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-bg);
  color: var(--color-text-muted);
}

.post-cover--placeholder .bi {
  font-size: var(--icon-size-xl);
}

.post-card__body {
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  padding: var(--space-4);
}

/* -------------------------------------------------
   Tags
   Fixed area so titles begin at the same position.
   ------------------------------------------------- */

.post-tags {
  display: flex;
  flex-wrap: wrap;
  align-content: flex-start;
  gap: var(--space-2);
  height: 60px;
  overflow: hidden;
}

.post-tag {
  display: inline-flex;
  align-items: center;
  min-height: 1.75rem;
  padding: 0 var(--space-3);
  border-radius: var(--radius-pill);
  background: var(--color-primary-lighter);
  color: var(--color-primary);
  font-size: var(--fs-xs);
  font-weight: var(--fw-medium);
  line-height: 1;
  white-space: nowrap;
}

/* -------------------------------------------------
   Title
   Two-line maximum.
   ------------------------------------------------- */

.post-title {
  min-height: 48px;
  margin: 0 0 var(--space-3);
  overflow: hidden;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  font-size: var(--fs-xl);
  font-weight: var(--fw-semibold);
  line-height: 1.5;
}

.post-title__link {
  color: var(--color-text-primary);
  text-decoration: none;
}

.post-title__link:hover {
  color: var(--color-primary);
}

/* -------------------------------------------------
   Excerpt
   Five-line maximum.
   ------------------------------------------------- */

.post-excerpt {
  height: 85px;
  margin: 0 0 var(--space-4);
  overflow: hidden;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 4;
  color: var(--color-text-muted);
  font-size: var(--fs-sm);
  line-height: 1.5;
  text-overflow: ellipsis;
}

/* -------------------------------------------------
   Author + date
   Always sits at the bottom.
   ------------------------------------------------- */

.post-meta {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: var(--space-1);
  margin-top: auto;
}

.post-author {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  min-width: 0;
  max-width: 100%;
  color: var(--color-text-primary);
  font-size: var(--fs-sm);
  text-decoration: none;
}

.post-author:hover {
  color: var(--color-primary);
}

.post-author__avatar {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 var(--avatar-size-sm);
  width: var(--avatar-size-sm);
  height: var(--avatar-size-sm);
  min-width: var(--avatar-size-sm);
  overflow: hidden;
  border-radius: var(--radius-pill);
  background: var(--color-surface-alt);
  color: var(--color-text-muted);
}

.post-author__avatar img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.post-author__avatar .bi {
  font-size: var(--icon-size-md);
  line-height: 1;
}

.post-author__name {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-weight: var(--fw-medium);
}

.post-author__badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 auto;
  min-height: 1.5rem;
  padding: 0 var(--space-2);
  border-radius: var(--radius-pill);
  background: var(--color-primary);
  color: var(--color-text-inverse);
  font-size: var(--fs-2xs);
  font-weight: var(--fw-semibold);
  line-height: 1;
}

.post-date {
  margin-left: calc(
    var(--avatar-size-sm) + var(--space-2)
  );
  color: var(--color-text-muted);
  font-size: var(--fs-sm);
}
</style>
