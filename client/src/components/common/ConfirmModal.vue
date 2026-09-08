<template>
  <div
    :id="id"
    ref="modalEl"
    class="modal fade confirm-modal"
    tabindex="-1"
    :aria-labelledby="`${id}-title`"
    aria-hidden="true"
  >
    <div class="modal-dialog confirm-modal__dialog">
      <div class="modal-content confirm-modal__content">

        <div class="modal-header confirm-modal__header">
          <h2
            :id="`${id}-title`"
            class="modal-title confirm-modal__title"
          >
            {{ title }}
          </h2>

          <button
            type="button"
            class="btn-close confirm-modal__close"
            aria-label="Close"
            @click="hide"
          ></button>
        </div>

        <div class="modal-body confirm-modal__body">
          <p class="confirm-modal__message">
            {{ message }}
          </p>
        </div>

        <div class="modal-footer confirm-modal__footer">
          <BaseButton
            variant="secondary"
            @click="hide"
          >
            {{ cancelText }}
          </BaseButton>

          <BaseButton
            variant="danger"
            @click="confirm"
          >
            {{ confirmText }}
          </BaseButton>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, onBeforeUnmount, ref } from "vue";
import { Modal } from "bootstrap";

import BaseButton from "./BaseButton.vue";

const props = defineProps({
  id: {
    type: String,
    required: true,
  },

  title: {
    type: String,
    default: "Are you sure?",
  },

  message: {
    type: String,
    default: "This action cannot be undone.",
  },

  confirmText: {
    type: String,
    default: "Confirm",
  },

  cancelText: {
    type: String,
    default: "Cancel",
  },
});

const emit = defineEmits(["confirm"]);

const modalEl = ref(null);
let modalInstance = null;

onMounted(() => {
  modalInstance = new Modal(modalEl.value);
});

onBeforeUnmount(() => {
  modalInstance?.dispose();
  modalInstance = null;
});

const show = () => {
  modalInstance?.show();
};

const hide = () => {
  modalInstance?.hide();
};

const confirm = () => {
  hide();
  emit("confirm");
};

defineExpose({
  show,
  hide,
});
</script>

<style scoped>
.confirm-modal__dialog {
  display: flex;
  align-items: center;
  min-height: calc(100% - 2rem);
}

.confirm-modal__content {
  color: var(--color-text-primary);
  background: var(--color-surface);
  border: var(--border-width) solid var(--color-border);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);
}

.confirm-modal__header {
  gap: var(--space-4);
  padding: var(--space-4) var(--space-5);
  border-bottom: var(--border-width) solid var(--color-border);
}

.confirm-modal__title {
  margin: 0;
  color: var(--color-text-primary);
  font-family: var(--font-heading);
  font-size: var(--fs-lg);
  font-weight: var(--fw-semibold);
  line-height: var(--lh-tight);
}

.confirm-modal__close {
  flex: 0 0 auto;
  margin: 0;
  border-radius: var(--radius-sm);
}

.confirm-modal__close:focus {
  box-shadow: var(--input-focus-ring);
}

.confirm-modal__body {
  padding: var(--space-5);
}

.confirm-modal__message {
  margin: 0;
  color: var(--color-text-muted);
  line-height: var(--lh-relaxed);
}

.confirm-modal__footer {
  display: flex;
  justify-content: flex-end;
  gap: var(--space-2);
  padding: var(--space-4) var(--space-5);
  border-top: var(--border-width) solid var(--color-border);
}

@media (max-width: 575.98px) {
  .confirm-modal__dialog {
    min-height: calc(100% - 1rem);
    margin-top: 0.5rem;
    margin-bottom: 0.5rem;
  }

  .confirm-modal__header,
  .confirm-modal__body,
  .confirm-modal__footer {
    padding-left: var(--space-4);
    padding-right: var(--space-4);
  }

  .confirm-modal__footer {
    flex-direction: column-reverse;
  }

  .confirm-modal__footer :deep(.base-button) {
    width: 100%;
  }
}
</style>