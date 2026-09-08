<template>
  <div
    class="base-card"
    :class="{ 'base-card--hoverable': hoverable }"
  >
    <slot />
  </div>
</template>

<script setup>
defineProps({
  hoverable: {
    type: Boolean,
    default: false,
  },
});
</script>

<style scoped>
.base-card {
  width: 100%;
  padding: var(--space-4);
  background: var(--color-surface);
  border: var(--border-width) solid var(--color-border);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
}

.base-card--hoverable {
  transition:
    transform var(--transition-base),
    box-shadow var(--transition-base);
}

.base-card--hoverable:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}
</style>