<template>
  <div class="base-input">
    <label
      v-if="label"
      :for="id"
      class="base-input__label"
    >
      {{ label }}
    </label>

    <div
      class="base-input__control"
      :class="{ 'base-input__control--with-icon': !!icon }"
    >
      <span
        v-if="icon"
        class="base-input__icon"
        aria-hidden="true"
      >
        <i class="bi" :class="icon"></i>
      </span>

      <textarea
        v-if="type === 'textarea'"
        :id="id"
        class="base-input__field"
        :class="{ 'base-input__field--error': error }"
        :rows="rows"
        :placeholder="placeholder"
        :value="modelValue"
        @input="$emit('update:modelValue', $event.target.value)"
      />

      <input
        v-else
        :id="id"
        class="base-input__field"
        :class="{ 'base-input__field--error': error }"
        :type="type"
        :placeholder="placeholder"
        :value="modelValue"
        @input="$emit('update:modelValue', $event.target.value)"
      />
    </div>

    <div
      v-if="error"
      class="base-input__feedback base-input__feedback--error"
    >
      {{ error }}
    </div>

    <div
      v-else-if="hint"
      class="base-input__feedback"
    >
      {{ hint }}
    </div>
  </div>
</template>

<script setup>
defineProps({
  id: {
    type: String,
    required: true,
  },
  modelValue: {
    type: String,
    default: "",
  },
  label: {
    type: String,
    default: "",
  },
  type: {
    type: String,
    default: "text",
  },
  placeholder: {
    type: String,
    default: "",
  },
  error: {
    type: String,
    default: "",
  },
  hint: {
    type: String,
    default: "",
  },
  icon: {
    type: String,
    default: "",
  },
  rows: {
    type: Number,
    default: 4,
  },
});

defineEmits(["update:modelValue"]);
</script>

 
<style scoped>
.base-input {
  width: 100%;
  margin-bottom: var(--space-3);
}

.base-input__label {
  display: block;
  margin-bottom: var(--space-2);
  color: var(--color-text-primary);
  font-size: var(--fs-sm);
  font-weight: var(--fw-medium);
  line-height: var(--lh-normal);
}

.base-input__control {
  position: relative;
  display: flex;
  width: 100%;
}

.base-input__icon {
  position: absolute;
  top: 50%;
  left: var(--space-3);
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  width: var(--icon-size-sm);
  height: var(--icon-size-sm);
  color: var(--color-text-muted);
  font-size: var(--icon-size-sm);
  line-height: 1;
  pointer-events: none;
  transform: translateY(-50%);
}

.base-input__field {
  width: 100%;
  min-height: var(--input-height);
  padding: 0 var(--space-3);
  color: var(--color-text-primary);
  font-family: var(--font-body);
  font-size: var(--fs-base);
  line-height: var(--lh-normal);
  background: var(--color-surface);
  border: var(--border-width) solid var(--color-border);
  border-radius: var(--radius-md);
  outline: none;
  transition:
    border-color var(--transition-fast),
    box-shadow var(--transition-fast),
    background-color var(--transition-fast);
}

textarea.base-input__field {
  min-height: auto;
  padding-top: var(--space-3);
  padding-bottom: var(--space-3);
  resize: vertical;
}

.base-input__control--with-icon .base-input__field {
  padding-left: calc(
    var(--space-3) +
    var(--icon-size-sm) +
    var(--space-3)
  );
}

.base-input__field::placeholder {
  color: var(--color-text-muted);
  opacity: 1;
}

.base-input__field:hover:not(:disabled) {
  border-color: var(--color-border-dark);
}

.base-input__field:focus {
  border-color: var(--color-primary-light);
  box-shadow: var(--input-focus-ring);
}

.base-input__field:disabled {
  cursor: not-allowed;
  background: var(--color-surface-alt);
  opacity: 0.7;
}

.base-input__field--error {
  border-color: var(--color-danger);
}

.base-input__field--error:focus {
  border-color: var(--color-danger);
  box-shadow: 0 0 0 0.2rem var(--color-danger-light);
}

.base-input__feedback {
  margin-top: var(--space-1);
  color: var(--color-text-muted);
  font-size: var(--fs-sm);
  line-height: var(--lh-normal);
}

.base-input__feedback--error {
  color: var(--color-danger-dark);
}

[data-theme="dark"] .base-input__field {
  background: var(--color-surface);
}

[data-theme="dark"] .base-input__feedback--error {
  color: var(--color-danger);
}
</style>