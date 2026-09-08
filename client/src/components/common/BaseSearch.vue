<template>
  <form
    class="base-search"
    @submit.prevent="handleSubmit"
  >
    <input
      v-model="model"
      type="search"
      class="base-search__input"
      :placeholder="placeholder"
      :aria-label="placeholder"
    />

    <BaseButton
      type="submit"
      icon="bi-search"
    >
      Search
    </BaseButton>
  </form>
</template>

<script setup>
import { computed } from "vue";
import BaseButton from "./BaseButton.vue";

const props = defineProps({
  modelValue: {
    type: String,
    default: "",
  },

  placeholder: {
    type: String,
    default: "Search...",
  },
});

const emit = defineEmits([
  "update:modelValue",
  "search",
]);

const model = computed({
  get: () => props.modelValue,
  set: (value) => emit("update:modelValue", value),
});

const handleSubmit = () => {
  emit("search", model.value);
};
</script>

<style scoped>
.base-search {
  display: flex;
  align-items: stretch;
  gap: var(--space-2);
  width: 100%;
  max-width: 420px;
}

.base-search__input {
  flex: 1;
  min-width: 0;
  height: var(--input-height);
  padding: 0 var(--space-3);
  color: var(--color-text-primary);
  font-family: var(--font-body);
  font-size: var(--fs-base);
  line-height: 1;
  background: var(--color-surface);
  border: var(--border-width) solid var(--color-border);
  border-radius: var(--radius-md);
  outline: none;
  transition:
    border-color var(--transition-fast),
    box-shadow var(--transition-fast);
}

.base-search__input::placeholder {
  color: var(--color-text-muted);
  opacity: 1;
}

.base-search__input:hover {
  border-color: var(--color-border-dark);
}

.base-search__input:focus {
  border-color: var(--color-primary-light);
  box-shadow: var(--input-focus-ring);
}

.base-search :deep(.base-button__label) {
  white-space: nowrap;
}

@media (max-width: 575.98px) {
  .base-search {
    max-width: none;
  }
}
</style>