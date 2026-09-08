<template>
  <div class="empty-state">
    <div class="empty-state__icon" aria-hidden="true">
      <i class="bi" :class="icon"></i>
    </div>

    <h2 class="empty-state__title">
      {{ title }}
    </h2>

    <p
      v-if="description"
      class="empty-state__description"
    >
      {{ description }}
    </p>

    <div class="empty-state__actions">
      <slot />
    </div>
  </div>
</template>

<script setup>
defineProps({
  icon: {
    type: String,
    default: "bi-inbox",
  },
  title: {
    type: String,
    default: "Nothing here yet",
  },
  description: {
    type: String,
    default: "",
  },
});
</script>

<style scoped>
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  padding: var(--space-12) var(--space-4);
  text-align: center;
}

.empty-state__icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 4rem;
  height: 4rem;
  margin-bottom: var(--space-4);
  color: var(--color-primary-light);
  font-size: var(--fs-3xl);
  background: var(--color-primary-lighter);
  border-radius: var(--radius-pill);
}

.empty-state__title {
  margin: 0 0 var(--space-2);
  color: var(--color-text-primary);
  font-family: var(--font-heading);
  font-size: var(--fs-lg);
  font-weight: var(--fw-semibold);
  line-height: var(--lh-tight);
}

.empty-state__description {
  max-width: 480px;
  margin: 0 0 var(--space-4);
  color: var(--color-text-muted);
  font-size: var(--fs-sm);
  line-height: var(--lh-relaxed);
}

.empty-state__actions {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
}
</style>