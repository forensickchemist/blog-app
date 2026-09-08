<template>
  <div class="base-loader" role="status" aria-live="polite">
    <span class="base-loader__spinner" aria-hidden="true"></span>

    <span
      v-if="label"
      class="base-loader__label"
    >
      {{ label }}
    </span>

    <span class="visually-hidden">
      {{ label || "Loading..." }}
    </span>
  </div>
</template>

<script setup>
defineProps({
  label: {
    type: String,
    default: "",
  },
});
</script>

<style scoped>
.base-loader {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-3);
  color: var(--color-text-muted);
}

.base-loader__spinner {
  width: 1.5rem;
  height: 1.5rem;
  border: 0.2rem solid var(--color-primary-lighter);
  border-top-color: var(--color-primary);
  border-radius: var(--radius-pill);
  animation: base-loader-spin 0.75s linear infinite;
}

.base-loader__label {
  font-size: var(--fs-sm);
  line-height: var(--lh-normal);
}

@keyframes base-loader-spin {
  to {
    transform: rotate(360deg);
  }
}

@media (prefers-reduced-motion: reduce) {
  .base-loader__spinner {
    animation-duration: 1.5s;
  }
}
</style>