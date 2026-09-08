```vue
<template>
  <component
    :is="to ? RouterLink : 'button'"
    :to="to || undefined"
    :type="to ? undefined : type"
    class="base-button"
    :class="[
      `base-button--${variant}`,
      sizeClass,
      {
        'base-button--loading': loading,
      },
    ]"
    :disabled="to ? undefined : disabled || loading"
    v-bind="$attrs"
  >
    <span
      v-if="loading"
      class="base-button__spinner"
      aria-hidden="true"
    ></span>

    <i
      v-else-if="icon"
      class="base-button__icon bi"
      :class="icon"
      aria-hidden="true"
    ></i>

    <span class="base-button__label">
      <slot />
    </span>
  </component>
</template>

<script setup>
import { computed } from "vue";
import { RouterLink } from "vue-router";

const props = defineProps({
  type: {
    type: String,
    default: "button",
  },

  variant: {
    type: String,
    default: "primary",
    validator: (value) =>
      ["primary", "outline", "secondary", "danger", "link"].includes(
        value
      ),
  },

  size: {
    type: String,
    default: "",
    validator: (value) =>
      ["", "sm", "lg"].includes(value),
  },

  icon: {
    type: String,
    default: "",
  },

  loading: {
    type: Boolean,
    default: false,
  },

  disabled: {
    type: Boolean,
    default: false,
  },

  to: {
    type: [String, Object],
    default: null,
  },
});

const sizeClass = computed(() =>
  props.size
    ? `base-button--${props.size}`
    : ""
);
</script>

<style scoped>
.base-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);

  min-width: max-content;
  height: var(--button-height);

  padding: 0 var(--button-padding-x);

  border: var(--border-width) solid transparent;
  border-radius: var(--radius-md);

  font-family: var(--font-body);
  font-size: var(--fs-sm);
  font-weight: var(--fw-semibold);
  line-height: 1;

  text-decoration: none;
  white-space: nowrap;

  cursor: pointer;

  transition:
    background-color var(--transition-fast),
    border-color var(--transition-fast),
    color var(--transition-fast),
    box-shadow var(--transition-fast),
    opacity var(--transition-fast),
    transform var(--transition-fast);
}

.base-button:hover:not(:disabled) {
  transform: translateY(-1px);
}

.base-button:active:not(:disabled) {
  transform: translateY(0);
}

.base-button:focus-visible {
  outline: none;
  box-shadow: var(--input-focus-ring);
}

.base-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.base-button__label {
  display: inline-flex;
  align-items: center;
}

.base-button__icon {
  flex: 0 0 auto;
  font-size: var(--icon-size-sm);
}

.base-button__spinner {
  width: var(--icon-size-sm);
  height: var(--icon-size-sm);

  border: 2px solid currentColor;
  border-right-color: transparent;
  border-radius: var(--radius-pill);

  animation: base-button-spin 0.7s linear infinite;
}


/* =========================================================
   SIZES
   ========================================================= */

.base-button--sm {
  height: var(--button-height-sm);
  padding-inline: var(--button-padding-x-sm);
  font-size: var(--fs-xs);
}

.base-button--lg {
  height: var(--button-height-lg);
  padding-inline: var(--button-padding-x-lg);
  font-size: var(--fs-md);
}


/* =========================================================
   PRIMARY
   ========================================================= */

.base-button--primary {
  background: var(--color-primary);
  border-color: var(--color-primary);
  color: var(--color-text-inverse);
}

.base-button--primary:hover:not(:disabled) {
  background: var(--color-primary-dark);
  border-color: var(--color-primary-dark);
}


/* =========================================================
   OUTLINE
   ========================================================= */

.base-button--outline {
  background: transparent;
  border-color: var(--color-primary);
  color: var(--color-primary);
}

.base-button--outline:hover:not(:disabled) {
  background: var(--color-primary-lighter);
}


/* =========================================================
   SECONDARY
   ========================================================= */

.base-button--secondary {
  background: var(--color-secondary);
  border-color: var(--color-secondary);
  color: var(--color-primary-dark);
}

.base-button--secondary:hover:not(:disabled) {
  background: var(--color-secondary-dark);
  border-color: var(--color-secondary-dark);
}


/* =========================================================
   DANGER
   ========================================================= */

.base-button--danger {
  background: var(--color-danger);
  border-color: var(--color-danger);
  color: var(--color-text-inverse);
}

.base-button--danger:hover:not(:disabled) {
  background: var(--color-danger-dark);
  border-color: var(--color-danger-dark);
}


/* =========================================================
   LINK
   ========================================================= */

.base-button--link {
  height: auto;

  padding: 0;

  border-color: transparent;
  border-radius: 0;

  background: transparent;
  color: var(--color-primary);

  font-weight: var(--fw-medium);
}

.base-button--link:hover:not(:disabled) {
  background: transparent;
  border-color: transparent;
  color: var(--color-primary-dark);

  text-decoration: underline;
  transform: none;
}

.base-button--link:focus-visible {
  box-shadow: none;
  outline: 2px solid var(--color-primary);
  outline-offset: 3px;
}


/* =========================================================
   LOADING
   ========================================================= */

.base-button--loading {
  pointer-events: none;
}


/* =========================================================
   ANIMATION
   ========================================================= */

@keyframes base-button-spin {
  to {
    transform: rotate(360deg);
  }
}
</style>