<template>
  <BaseCard>
    <div class="admin-stat-card">
      <div class="admin-stat-card__label">
        {{ label }}
      </div>

      <div class="admin-stat-card__value">
        {{ value }}
      </div>
    </div>
  </BaseCard>
</template>

<script setup>
import BaseCard from "../common/BaseCard.vue";

defineProps({
  label: {
    type: String,
    required: true,
  },

  value: {
    type: [String, Number],
    required: true,
  },
});
</script>

<style scoped>
.admin-stat-card {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.admin-stat-card__label {
  color: var(--color-text-muted);
  font-size: var(--fs-sm);
  font-weight: var(--fw-medium);
  line-height: var(--lh-normal);
}

.admin-stat-card__value {
  color: var(--color-text-primary);
  font-size: var(--fs-3xl);
  font-weight: var(--fw-semibold);
  line-height: var(--lh-tight);
}
</style>


