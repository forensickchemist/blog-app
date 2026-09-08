<template>
  <EmptyState
    v-if="!users.length"
    icon="bi-people"
    title="No users found"
    description="There are currently no users to display."
  />

  <div
    v-else
    class="admin-user-table"
  >
    <div class="admin-user-table__responsive">
      <table class="admin-user-table__table">
        <thead class="admin-user-table__head">
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
.admin-user-table {
  width: 100%;
  overflow: hidden;
  background: var(--color-surface);
  border: var(--border-width) solid var(--color-border);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
}

.admin-user-table__responsive {
  width: 100%;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}

.admin-user-table__table {
  width: 100%;
  min-width: 700px;
  margin: 0;
  border-collapse: collapse;
  color: var(--color-text-primary);
  font-size: var(--fs-sm);
}

.admin-user-table__head {
  background: var(--color-surface-alt);
}

.admin-user-table__head th {
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

.admin-user-table__row {
  transition: background-color var(--transition-fast);
}

.admin-user-table__row:not(:last-child) td {
  border-bottom: var(--border-width) solid var(--color-border);
}

.admin-user-table__row:hover {
  background: var(--color-surface-alt);
}

.admin-user-table__table td {
  padding: var(--space-4);
  vertical-align: middle;
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
  .admin-user-table {
    border-radius: var(--radius-md);
  }

  .admin-user-table__table {
    min-width: 650px;
  }

  .admin-user-table__table td,
  .admin-user-table__head th {
    padding: var(--space-3);
  }
}
</style>