<template>
  <EmptyState
    v-if="!users.length"
    icon="bi-people"
    title="No users found"
    description="There are currently no users to display."
  />

  <div
    v-else
    class="admin-user-table app-card"
  >
    <div class="app-table-responsive">
      <table class="app-table admin-user-table__table">
        <thead>
          <tr>
            <th>Username</th>
            <th>Role</th>
            <th>Joined</th>
            <th class="admin-user-table__actions-heading">
              Actions
            </th>
          </tr>
        </thead>

        <tbody>
          <tr
            v-for="user in users"
            :key="user._id"
            class="admin-user-table__row"
          >
            <td class="admin-user-table__username">
              {{ user.username }}
            </td>

            <td>
              <span
                class="admin-user-table__role"
                :class="
                  user.role === 'admin'
                    ? 'admin-user-table__role--admin'
                    : 'admin-user-table__role--user'
                "
              >
                {{ user.role }}
              </span>
            </td>

            <td class="admin-user-table__date">
              {{ formatDateTime(user.createdAt) }}
            </td>

            <td class="admin-user-table__actions">
              <div class="admin-user-actions">
                <BaseButton
                  size="sm"
                  :variant="
                    user.role === 'admin'
                      ? 'secondary'
                      : 'primary'
                  "
                  @click="emit('change-role', user)"
                >
                  {{
                    user.role === "admin"
                      ? "Remove Admin"
                      : "Make Admin"
                  }}
                </BaseButton>

                <BaseButton
                  size="sm"
                  variant="danger"
                  @click="emit('delete', user)"
                >
                  Delete
                </BaseButton>
              </div>
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
  users: {
    type: Array,
    default: () => [],
  },
});

const emit = defineEmits([
  "change-role",
  "delete",
]);

const formatDateTime = (date) => {
  return new Date(date).toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
};
</script>

<style scoped>
/*
 * Table/card/responsive styling is provided by global.css.
 * Design values come from variables.css through the global system.
 */

.admin-user-table__table {
  min-width: 700px;
}

.admin-user-table__row {
  transition: background-color var(--transition-fast);
}

.admin-user-table__row:hover {
  background: var(--color-surface-alt);
}

.admin-user-table__username {
  min-width: 180px;
  font-weight: var(--fw-medium);
}

.admin-user-table__date {
  color: var(--color-text-muted);
  font-size: var(--fs-sm);
  white-space: nowrap;
}

.admin-user-table__role {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 1.75rem;
  padding: 0 var(--space-3);
  border-radius: var(--radius-pill);
  font-size: var(--fs-xs);
  font-weight: var(--fw-semibold);
  line-height: 1;
  text-transform: capitalize;
  white-space: nowrap;
}

.admin-user-table__role--admin {
  color: var(--color-primary);
  background: var(--color-primary-lighter);
}

.admin-user-table__role--user {
  color: var(--color-text-muted);
  background: var(--color-surface-alt);
}

.admin-user-table__actions-heading,
.admin-user-table__actions {
  text-align: left;
}

.admin-user-table__actions {
  white-space: nowrap;
}

.admin-user-actions {
  display: inline-flex;
  align-items: center;
  justify-content: flex-end;
  gap: var(--space-2);
}

@media (max-width: 767.98px) {
  .admin-user-table__table {
    min-width: 650px;
  }
}
</style>