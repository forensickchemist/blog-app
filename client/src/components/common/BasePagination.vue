<template>
  <nav
    v-if="totalPages > 1"
    class="base-pagination"
    aria-label="Pagination"
  >
    <button
      type="button"
      class="base-pagination__button"
      :class="{ 'base-pagination__button--disabled': page <= 1 }"
      :disabled="page <= 1"
      aria-label="Previous page"
      @click="$emit('change', page - 1)"
    >
      <i class="bi bi-chevron-left" aria-hidden="true"></i>
    </button>

    <button
      v-for="p in totalPages"
      :key="p"
      type="button"
      class="base-pagination__button"
      :class="{ 'base-pagination__button--active': p === page }"
      :aria-current="p === page ? 'page' : undefined"
      :aria-label="`Go to page ${p}`"
      @click="$emit('change', p)"
    >
      {{ p }}
    </button>

    <button
      type="button"
      class="base-pagination__button"
      :class="{ 'base-pagination__button--disabled': page >= totalPages }"
      :disabled="page >= totalPages"
      aria-label="Next page"
      @click="$emit('change', page + 1)"
    >
      <i class="bi bi-chevron-right" aria-hidden="true"></i>
    </button>
  </nav>
</template>

<script setup>
defineProps({
  page: {
    type: Number,
    required: true,
  },
  totalPages: {
    type: Number,
    required: true,
  },
});

defineEmits(["change"]);
</script>

<style scoped>
.base-pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-1);
}

.base-pagination__button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 2.5rem;
  height: 2.5rem;
  padding: 0 var(--space-2);
  color: var(--color-primary);
  font-family: var(--font-body);
  font-size: var(--fs-sm);
  font-weight: var(--fw-medium);
  line-height: 1;
  background: var(--color-surface);
  border: var(--border-width) solid var(--color-border);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition:
    color var(--transition-fast),
    background-color var(--transition-fast),
    border-color var(--transition-fast),
    transform var(--transition-fast);
}

.base-pagination__button:hover:not(:disabled):not(
    .base-pagination__button--active
  ) {
  background: var(--color-surface-alt);
  border-color: var(--color-border-dark);
}

.base-pagination__button:active:not(:disabled) {
  transform: translateY(1px);
}

.base-pagination__button:focus-visible {
  outline: none;
  box-shadow: var(--input-focus-ring);
}

.base-pagination__button--active {
  color: var(--color-text-primary);
  background: var(--color-secondary);
  border-color: var(--color-secondary);
  font-weight: var(--fw-semibold);
}

.base-pagination__button--disabled,
.base-pagination__button:disabled {
  color: var(--color-text-muted);
  background: var(--color-surface-alt);
  cursor: not-allowed;
  opacity: 0.6;
}

@media (max-width: 575.98px) {
  .base-pagination {
    gap: var(--space-1);
  }

  .base-pagination__button {
    min-width: 2.25rem;
    height: 2.25rem;
  }
}
</style>