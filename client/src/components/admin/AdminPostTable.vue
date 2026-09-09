<template>
  <EmptyState
    v-if="!posts.length"
    icon="bi-journal"
    title="No posts found"
    description="There are currently no posts to display."
  />

  <div
    v-else
    class="admin-post-table"
  >
    <div class="admin-post-table__responsive">
      <table class="admin-post-table__table">
        <thead class="admin-post-table__head">
          <tr>
            <th>Title</th>
            <th>Author</th>
            <th>Status</th>
            <th>Created</th>
            <th class="admin-post-table__actions-heading">
              Actions
            </th>
          </tr>
        </thead>

        <tbody>
          <tr
            v-for="post in posts"
            :key="post._id"
            class="admin-post-table__row"
          >
            <td class="admin-post-table__title">
              {{ post.title }}
            </td>

            <td class="admin-post-table__author">
              {{ post.author?.username || "Unknown" }}
            </td>

            <td>
              <span
                v-if="post.status === 'published'"
                class="app-badge app-badge--published"
              >
                Published
              </span>

              <span
                v-else
                class="app-badge app-badge--draft"
              >
                Draft
              </span>
            </td>

            <td class="admin-post-table__date">
              {{ formatDate(post.createdAt) }}
            </td>

            <td class="admin-post-table__actions">
              <BaseButton
                variant="danger"
                size="sm"
                @click="emit('delete', post)"
              >
                Delete
              </BaseButton>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import EmptyState from "../common/EmptyState.vue";
import BaseButton from "../common/BaseButton.vue";

defineProps({
  posts: {
    type: Array,
    default: () => [],
  },
});

const emit = defineEmits(["delete"]);

const formatDate = (date) => {
  return new Date(date).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};
</script>

<style scoped>
.admin-post-table {
  width: 100%;
  overflow: hidden;
  background: var(--color-surface);
  border: var(--border-width) solid var(--color-border);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
}

.admin-post-table__responsive {
  width: 100%;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}

.admin-post-table__table {
  width: 100%;
  min-width: 700px;
  margin: 0;
  border-collapse: collapse;
  color: var(--color-text);
  font-size: var(--fs-sm);
}

.admin-post-table__head {
  background: var(--color-surface-alt);
}

.admin-post-table__head th {
  padding: var(--space-3) var(--space-4);
  color: var(--color-text-muted);
  font-size: var(--fs-xs);
  font-weight: var(--fw-semibold);
  line-height: var(--lh-normal);
  text-align: left;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  white-space: nowrap;
  border-bottom: var(--border-width) solid var(--color-border);
}

.admin-post-table__row {
  transition: background-color var(--transition-fast);
}

.admin-post-table__row:not(:last-child) td {
  border-bottom: var(--border-width) solid var(--color-border);
}

.admin-post-table__row:hover {
  background: var(--color-bg-hover);
}

.admin-post-table__table td {
  padding: var(--space-4);
  vertical-align: middle;
}

.admin-post-table__title {
  min-width: 220px;
  font-weight: var(--fw-medium);
}

.admin-post-table__author {
  color: var(--color-text-muted);
}

.admin-post-table__date {
  color: var(--color-text-muted);
  font-size: var(--fs-sm);
  white-space: nowrap;
}

.admin-post-table__actions-heading,
.admin-post-table__actions {
  text-align: right;
}

.admin-post-table__actions {
  white-space: nowrap;
}

@media (max-width: 767.98px) {
  .admin-post-table {
    border-radius: var(--radius-md);
  }

  .admin-post-table__table {
    min-width: 650px;
  }

  .admin-post-table__table td,
  .admin-post-table__head th {
    padding: var(--space-3);
  }
}
</style>