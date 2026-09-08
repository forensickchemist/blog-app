<template>
  <transition name="fade">
    <div
      v-if="message"
      class="base-alert"
      :class="`base-alert--${variant}`"
      role="alert"
    >
      <i
        class="base-alert__icon bi"
        :class="icon"
        aria-hidden="true"
      ></i>

      <div class="base-alert__message">
        {{ message }}
      </div>

      <button
        v-if="dismissible"
        type="button"
        class="base-alert__close"
        aria-label="Close"
        @click="$emit('dismiss')"
      >
        <i
          class="bi bi-x"
          aria-hidden="true"
        ></i>
      </button>
    </div>
  </transition>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
  message: {
    type: String,
    default: "",
  },

  variant: {
    type: String,
    default: "danger",
    validator: (value) =>
      ["danger", "success", "warning", "info"].includes(value),
  },

  dismissible: {
    type: Boolean,
    default: false,
  },
});

defineEmits(["dismiss"]);

const icon = computed(() => {
  const map = {
    danger: "bi-exclamation-triangle-fill",
    success: "bi-check-circle-fill",
    warning: "bi-exclamation-circle-fill",
    info: "bi-info-circle-fill",
  };

  return map[props.variant] || map.info;
});
</script>

<style scoped>
.base-alert {
  display: flex;
  align-items: center;
  gap: var(--space-3);

  width: 100%;
  padding: var(--space-3) var(--space-4);

  border: var(--border-width) solid transparent;
  border-radius: var(--radius-md);

  font-size: var(--fs-sm);
  line-height: var(--lh-normal);
}

.base-alert__icon {
  flex: 0 0 auto;
  font-size: var(--icon-size);
}

.base-alert__message {
  min-width: 0;
  flex: 1;
}

.base-alert__close {
  display: inline-flex;
  align-items: center;
  justify-content: center;

  flex: 0 0 auto;

  width: 2rem;
  height: 2rem;

  padding: 0;
  border: 0;
  border-radius: var(--radius-pill);

  background: transparent;
  color: currentColor;

  font-size: var(--icon-size);
  line-height: 1;

  opacity: 0.7;

  transition:
    background-color var(--transition-fast),
    opacity var(--transition-fast);
}

.base-alert__close:hover {
  background: rgba(0, 0, 0, 0.08);
  opacity: 1;
}

.base-alert__close:focus-visible {
  outline: 2px solid currentColor;
  outline-offset: 2px;
}


/* =========================================================
   VARIANTS
   ========================================================= */

.base-alert--danger {
  border-color: var(--color-danger-light);
  background: var(--color-danger-light);
  color: var(--color-danger-dark);
}

.base-alert--success {
  border-color: var(--color-success-light);
  background: var(--color-success-light);
  color: var(--color-success-dark);
}

.base-alert--warning {
  border-color: var(--color-warning-light);
  background: var(--color-warning-light);
  color: var(--color-warning-dark);
}

.base-alert--info {
  border-color: var(--color-info-light);
  background: var(--color-info-light);
  color: var(--color-info-dark);
}


/* =========================================================
   DARK THEME
   ========================================================= */

[data-theme="dark"] .base-alert__close:hover {
  background: rgba(255, 255, 255, 0.08);
}
</style>