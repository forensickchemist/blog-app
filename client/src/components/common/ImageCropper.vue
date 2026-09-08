<template>
  <div class="image-cropper">
    <input
      ref="fileInput"
      type="file"
      accept="image/*"
      class="image-cropper__file-input"
      @change="handleFileSelect"
    />

    <BaseButton
      variant="outline"
      size="sm"
      icon="bi-image"
      @click="openPicker"
    >
      {{ buttonText }}
    </BaseButton>

    <div
      v-if="imageSrc"
      class="cropper-modal"
      @click.self="cancel"
    >
      <div class="cropper-dialog">
        <div class="cropper-header">
          <h2 class="cropper-title">
            Crop Image
          </h2>

          <button
            type="button"
            class="cropper-close"
            aria-label="Close"
            @click="cancel"
          >
            <i class="bi bi-x-lg" aria-hidden="true"></i>
          </button>
        </div>

        <div class="cropper-body">
          <div
            class="crop-area"
            :style="cropAreaStyle"
            @pointerdown="startDrag"
            @pointermove="drag"
            @pointerup="stopDrag"
            @pointercancel="stopDrag"
            @pointerleave="stopDrag"
            @wheel.prevent="handleWheel"
          >
            <img
              ref="imageElement"
              :src="imageSrc"
              alt="Image crop preview"
              class="crop-image"
              :style="imageStyle"
              draggable="false"
              @load="handleImageLoad"
            />

            <div class="crop-overlay"></div>
          </div>

          <div class="crop-controls">
            <button
              type="button"
              class="crop-control-button"
              :disabled="scale <= minScale"
              aria-label="Zoom out"
              @click="zoomOut"
            >
              <i class="bi bi-dash-lg" aria-hidden="true"></i>
            </button>

            <input
              v-model.number="scale"
              type="range"
              class="crop-range"
              :min="minScale"
              :max="maxScale"
              step="0.01"
              aria-label="Zoom"
            />

            <button
              type="button"
              class="crop-control-button"
              :disabled="scale >= maxScale"
              aria-label="Zoom in"
              @click="zoomIn"
            >
              <i class="bi bi-plus-lg" aria-hidden="true"></i>
            </button>
          </div>

          <p class="cropper-hint">
            Drag the image to choose which part appears in the crop.
          </p>
        </div>

        <div class="cropper-footer">
          <BaseButton
            variant="outline"
            :disabled="cropping"
            @click="cancel"
          >
            Cancel
          </BaseButton>

          <BaseButton
            variant="primary"
            icon="bi-check-lg"
            :loading="cropping"
            @click="confirmCrop"
          >
            Use Image
          </BaseButton>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import {
  computed,
  nextTick,
  ref,
} from "vue";
import BaseButton from "./BaseButton.vue";

const props = defineProps({
  aspectRatio: {
    type: Number,
    default: 1,
  },

  outputWidth: {
    type: Number,
    default: 800,
  },

  outputHeight: {
    type: Number,
    default: 800,
  },

  buttonText: {
    type: String,
    default: "Choose Image",
  },

  maxFileSize: {
    type: Number,
    default: 10 * 1024 * 1024,
  },
});

const emit = defineEmits([
  "cropped",
  "error",
  "cancel",
]);

const fileInput = ref(null);
const imageElement = ref(null);
const imageSrc = ref("");
const selectedFile = ref(null);
const imageLoaded = ref(false);

const scale = ref(1);
const minScale = ref(1);
const maxScale = ref(3);

const positionX = ref(0);
const positionY = ref(0);

const dragging = ref(false);
const dragStartX = ref(0);
const dragStartY = ref(0);
const startPositionX = ref(0);
const startPositionY = ref(0);

const cropping = ref(false);

const cropWidth = 320;

const cropHeight = computed(() => {
  return cropWidth / props.aspectRatio;
});

const cropAreaStyle = computed(() => ({
  width: `${cropWidth}px`,
  height: `${cropHeight.value}px`,
}));

const imageStyle = computed(() => ({
  transform: `translate(${positionX.value}px, ${positionY.value}px) scale(${scale.value})`,
}));

const openPicker = () => {
  fileInput.value?.click();
};

const handleFileSelect = async (event) => {
  const file = event.target.files?.[0];

  if (!file) {
    return;
  }

  if (!file.type.startsWith("image/")) {
    emit("error", "Please select a valid image file.");
    event.target.value = "";
    return;
  }

  if (file.size > props.maxFileSize) {
    emit("error", "The selected image is too large.");
    event.target.value = "";
    return;
  }

  if (imageSrc.value) {
    URL.revokeObjectURL(imageSrc.value);
  }

  selectedFile.value = file;
  imageSrc.value = URL.createObjectURL(file);

  imageLoaded.value = false;
  scale.value = 1;
  positionX.value = 0;
  positionY.value = 0;

  await nextTick();

  event.target.value = "";
};

const handleImageLoad = () => {
  imageLoaded.value = true;

  const image = imageElement.value;

  if (!image) {
    return;
  }

  const imageAspect =
    image.naturalWidth / image.naturalHeight;

  let initialWidth;
  let initialHeight;

  if (imageAspect > props.aspectRatio) {
    initialHeight = cropHeight.value;
    initialWidth = initialHeight * imageAspect;
  } else {
    initialWidth = cropWidth;
    initialHeight = initialWidth / imageAspect;
  }

  const scaleX =
    initialWidth / image.naturalWidth;

  const scaleY =
    initialHeight / image.naturalHeight;

  minScale.value = Math.max(
    scaleX,
    scaleY
  );

  scale.value = minScale.value;

  positionX.value =
    (cropWidth - initialWidth) / 2;

  positionY.value =
    (cropHeight.value - initialHeight) / 2;
};

const startDrag = (event) => {
  if (!imageLoaded.value) {
    return;
  }

  dragging.value = true;

  event.currentTarget.setPointerCapture?.(
    event.pointerId
  );

  dragStartX.value = event.clientX;
  dragStartY.value = event.clientY;

  startPositionX.value = positionX.value;
  startPositionY.value = positionY.value;
};

const drag = (event) => {
  if (!dragging.value) {
    return;
  }

  const deltaX =
    event.clientX - dragStartX.value;

  const deltaY =
    event.clientY - dragStartY.value;

  positionX.value =
    startPositionX.value + deltaX;

  positionY.value =
    startPositionY.value + deltaY;

  constrainPosition();
};

const stopDrag = () => {
  dragging.value = false;
};

const handleWheel = (event) => {
  if (!imageLoaded.value) {
    return;
  }

  const direction =
    event.deltaY < 0 ? 0.05 : -0.05;

  scale.value = Math.min(
    maxScale.value,
    Math.max(
      minScale.value,
      scale.value + direction
    )
  );

  constrainPosition();
};

const zoomIn = () => {
  scale.value = Math.min(
    maxScale.value,
    scale.value + 0.1
  );

  constrainPosition();
};

const zoomOut = () => {
  scale.value = Math.max(
    minScale.value,
    scale.value - 0.1
  );

  constrainPosition();
};

const constrainPosition = () => {
  const image = imageElement.value;

  if (!image) {
    return;
  }

  const width =
    image.naturalWidth * scale.value;

  const height =
    image.naturalHeight * scale.value;

  const minX = cropWidth - width;
  const maxX = 0;

  const minY = cropHeight.value - height;
  const maxY = 0;

  positionX.value = Math.min(
    maxX,
    Math.max(minX, positionX.value)
  );

  positionY.value = Math.min(
    maxY,
    Math.max(minY, positionY.value)
  );
};

const confirmCrop = async () => {
  if (
    !imageLoaded.value ||
    !selectedFile.value
  ) {
    return;
  }

  const image = imageElement.value;

  if (!image) {
    return;
  }

  cropping.value = true;

  try {
    const sourceX =
      -positionX.value / scale.value;

    const sourceY =
      -positionY.value / scale.value;

    const sourceWidth =
      cropWidth / scale.value;

    const sourceHeight =
      cropHeight.value / scale.value;

    const canvas =
      document.createElement("canvas");

    canvas.width = props.outputWidth;
    canvas.height = props.outputHeight;

    const context =
      canvas.getContext("2d");

    if (!context) {
      throw new Error(
        "Unable to create image canvas."
      );
    }

    context.drawImage(
      image,
      sourceX,
      sourceY,
      sourceWidth,
      sourceHeight,
      0,
      0,
      props.outputWidth,
      props.outputHeight
    );

    const blob = await new Promise(
      (resolve, reject) => {
        canvas.toBlob(
          (result) => {
            if (result) {
              resolve(result);
            } else {
              reject(
                new Error(
                  "Failed to create cropped image."
                )
              );
            }
          },
          "image/jpeg",
          0.92
        );
      }
    );

    const originalName =
      selectedFile.value.name.replace(
        /\.[^/.]+$/,
        ""
      );

    const croppedFile = new File(
      [blob],
      `${originalName}-cropped.jpg`,
      {
        type: "image/jpeg",
      }
    );

    emit("cropped", croppedFile);

    closeCropper();
  } catch (err) {
    emit(
      "error",
      err.message ||
        "Failed to crop the image."
    );
  } finally {
    cropping.value = false;
  }
};

const cancel = () => {
  emit("cancel");
  closeCropper();
};

const closeCropper = () => {
  if (imageSrc.value) {
    URL.revokeObjectURL(imageSrc.value);
  }

  imageSrc.value = "";
  selectedFile.value = null;
  imageLoaded.value = false;
  scale.value = 1;
  positionX.value = 0;
  positionY.value = 0;
};
</script>

<style scoped>
.image-cropper {
  width: 100%;
}

.image-cropper__file-input {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

.cropper-modal {
  position: fixed;
  inset: 0;
  z-index: var(--z-modal);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-4);
  background: var(--color-overlay);
}

.cropper-dialog {
  width: min(100%, 560px);
  max-height: calc(100vh - 2rem);
  overflow: auto;
  background: var(--color-surface);
  border: var(--border-width) solid var(--color-border);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);
}

.cropper-header,
.cropper-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-4);
  padding: var(--space-4) var(--space-5);
}

.cropper-header {
  border-bottom: var(--border-width) solid var(--color-border);
}

.cropper-footer {
  border-top: var(--border-width) solid var(--color-border);
}

.cropper-title {
  margin: 0;
  color: var(--color-text-primary);
  font-family: var(--font-heading);
  font-size: var(--fs-lg);
  font-weight: var(--fw-semibold);
  line-height: var(--lh-tight);
}

.cropper-close {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 auto;
  width: 2rem;
  height: 2rem;
  padding: 0;
  color: var(--color-text-muted);
  background: transparent;
  border: 0;
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition:
    color var(--transition-fast),
    background-color var(--transition-fast);
}

.cropper-close:hover {
  color: var(--color-text-primary);
  background: var(--color-surface-alt);
}

.cropper-close:focus-visible {
  outline: none;
  box-shadow: var(--input-focus-ring);
}

.cropper-body {
  padding: var(--space-4) var(--space-5);
}

.crop-area {
  position: relative;
  margin: 0 auto;
  overflow: hidden;
  background: #111;
  cursor: grab;
  touch-action: none;
  user-select: none;
}

.crop-area:active {
  cursor: grabbing;
}

.crop-image {
  position: absolute;
  top: 0;
  left: 0;
  max-width: none;
  transform-origin: top left;
  pointer-events: none;
  user-select: none;
}

.crop-overlay {
  position: absolute;
  inset: 0;
  pointer-events: none;
  box-shadow:
    inset 0 0 0 2px rgba(255, 255, 255, 0.9);
}

.crop-controls {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  max-width: 420px;
  margin: var(--space-4) auto 0;
}

.crop-control-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 auto;
  width: 2rem;
  height: 2rem;
  padding: 0;
  color: var(--color-primary);
  background: var(--color-surface);
  border: var(--border-width) solid var(--color-primary);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition:
    color var(--transition-fast),
    background-color var(--transition-fast),
    opacity var(--transition-fast);
}

.crop-control-button:hover:not(:disabled) {
  color: var(--color-text-inverse);
  background: var(--color-primary);
}

.crop-control-button:focus-visible {
  outline: none;
  box-shadow: var(--input-focus-ring);
}

.crop-control-button:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

.crop-range {
  flex: 1;
  min-width: 0;
  height: 0.5rem;
  margin: 0;
  accent-color: var(--color-primary);
  cursor: pointer;
}

.crop-range:focus-visible {
  outline: none;
  box-shadow: var(--input-focus-ring);
}

.cropper-hint {
  margin: var(--space-3) 0 0;
  color: var(--color-text-muted);
  font-size: var(--fs-sm);
  line-height: var(--lh-normal);
  text-align: center;
}

@media (max-width: 576px) {
  .cropper-modal {
    padding: var(--space-2);
  }

  .cropper-dialog {
    max-height: calc(100vh - 1rem);
  }

  .cropper-header,
  .cropper-footer,
  .cropper-body {
    padding-left: var(--space-4);
    padding-right: var(--space-4);
  }

  .cropper-footer {
    flex-direction: column-reverse;
  }

  .cropper-footer :deep(.base-button) {
    width: 100%;
  }
}
</style>