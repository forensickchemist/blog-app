<template>
  <form class="post-form" @submit.prevent="handleSubmit">
    <BaseAlert
      :message="formError"
      variant="danger"
      dismissible
      @dismiss="formError = ''"
    />

    <!-- Title -->
    <div class="post-form__field">
      <BaseInput
        id="title"
        v-model="form.title"
        label="Title"
        placeholder="Give your post a title"
        :error="fieldErrors.title"
      />
    </div>

    <!-- Excerpt -->
    <div class="post-form__field">
      <label
        for="excerpt"
        class="post-form__label"
      >
        Excerpt
        <span class="post-form__optional">
          (optional)
        </span>
      </label>

      <textarea
        id="excerpt"
        v-model="form.excerpt"
        class="post-form__textarea"
        rows="3"
        maxlength="280"
        placeholder="Write a short excerpt for your post..."
      ></textarea>

      <div class="post-form__helper-row">
        <div class="post-form__hint">
          Leave blank and we'll automatically use the opening of your post.
        </div>

        <small class="post-form__counter">
          {{ form.excerpt.length }}/280
        </small>
      </div>
    </div>

    <!-- Tags -->
    <div class="post-form__field">
      <label
        for="tags"
        class="post-form__label"
      >
        Tags
      </label>

      <input
        id="tags"
        v-model="tagsInput"
        type="text"
        class="post-form__input"
        placeholder="comma, separated, tags"
      />

      <div class="post-form__hint">
        Separate tags with commas.
      </div>
    </div>

    <!-- Cover Image -->
    <div class="post-form__field">
      <label class="post-form__label">
        Cover Image
      </label>

      <div class="post-form__cropper">
        <ImageCropper
          :aspect-ratio="16 / 9"
          :output-width="1600"
          :output-height="900"
          button-text="Choose Cover Image"
          @cropped="handleCoverCropped"
          @error="handleCropError"
        />
      </div>

      <img
        v-if="previewUrl"
        :src="previewUrl"
        alt="Cover preview"
        class="post-form__image-preview"
      />

      <div class="post-form__hint">
        Choose the portion of the image you want to use as your cover.
      </div>
    </div>

    <!-- Content -->
    <div class="post-form__field">
      <label class="post-form__label">
        Content
      </label>

      <div class="editor-wrapper">
        <!-- Toolbar -->
        <div
          v-if="editor"
          class="editor-toolbar"
          role="toolbar"
          aria-label="Text formatting"
        >
          <button
            type="button"
            class="editor-toolbar__button"
            :class="{ 'is-active': editor.isActive('bold') }"
            title="Bold"
            aria-label="Bold"
            @click="editor.chain().focus().toggleBold().run()"
          >
            <i
              class="bi bi-type-bold"
              aria-hidden="true"
            ></i>
          </button>

          <button
            type="button"
            class="editor-toolbar__button"
            :class="{ 'is-active': editor.isActive('italic') }"
            title="Italic"
            aria-label="Italic"
            @click="editor.chain().focus().toggleItalic().run()"
          >
            <i
              class="bi bi-type-italic"
              aria-hidden="true"
            ></i>
          </button>

          <button
            type="button"
            class="editor-toolbar__button"
            :class="{ 'is-active': editor.isActive('strike') }"
            title="Strikethrough"
            aria-label="Strikethrough"
            @click="editor.chain().focus().toggleStrike().run()"
          >
            <i
              class="bi bi-type-strikethrough"
              aria-hidden="true"
            ></i>
          </button>

          <span
            class="editor-toolbar__divider"
            aria-hidden="true"
          ></span>

          <button
            v-for="level in [2, 3]"
            :key="level"
            type="button"
            class="editor-toolbar__button"
            :class="{
              'is-active': editor.isActive('heading', { level }),
            }"
            :title="`Heading ${level}`"
            :aria-label="`Heading ${level}`"
            @click="
              editor
                .chain()
                .focus()
                .toggleHeading({ level })
                .run()
            "
          >
            H{{ level }}
          </button>

          <span
            class="editor-toolbar__divider"
            aria-hidden="true"
          ></span>

          <button
            type="button"
            class="editor-toolbar__button"
            :class="{ 'is-active': editor.isActive('bulletList') }"
            title="Bullet list"
            aria-label="Bullet list"
            @click="editor.chain().focus().toggleBulletList().run()"
          >
            <i
              class="bi bi-list-ul"
              aria-hidden="true"
            ></i>
          </button>

          <button
            type="button"
            class="editor-toolbar__button"
            :class="{ 'is-active': editor.isActive('orderedList') }"
            title="Numbered list"
            aria-label="Numbered list"
            @click="editor.chain().focus().toggleOrderedList().run()"
          >
            <i
              class="bi bi-list-ol"
              aria-hidden="true"
            ></i>
          </button>

          <span
            class="editor-toolbar__divider"
            aria-hidden="true"
          ></span>

          <button
            type="button"
            class="editor-toolbar__button"
            :class="{ 'is-active': editor.isActive('blockquote') }"
            title="Quote"
            aria-label="Quote"
            @click="editor.chain().focus().toggleBlockquote().run()"
          >
            <i
              class="bi bi-quote"
              aria-hidden="true"
            ></i>
          </button>

          <button
            type="button"
            class="editor-toolbar__button"
            :class="{ 'is-active': editor.isActive('codeBlock') }"
            title="Code block"
            aria-label="Code block"
            @click="editor.chain().focus().toggleCodeBlock().run()"
          >
            <i
              class="bi bi-code-slash"
              aria-hidden="true"
            ></i>
          </button>

          <span
            class="editor-toolbar__divider"
            aria-hidden="true"
          ></span>

          <button
            type="button"
            class="editor-toolbar__button"
            title="Undo"
            aria-label="Undo"
            :disabled="!editor.can().undo()"
            @click="editor.chain().focus().undo().run()"
          >
            <i
              class="bi bi-arrow-counterclockwise"
              aria-hidden="true"
            ></i>
          </button>

          <button
            type="button"
            class="editor-toolbar__button"
            title="Redo"
            aria-label="Redo"
            :disabled="!editor.can().redo()"
            @click="editor.chain().focus().redo().run()"
          >
            <i
              class="bi bi-arrow-clockwise"
              aria-hidden="true"
            ></i>
          </button>
        </div>

        <!-- Editor -->
        <EditorContent
          v-if="editor"
          :editor="editor"
          class="editor-content"
        />
      </div>

      <div
        v-if="fieldErrors.content"
        class="post-form__field-error"
      >
        {{ fieldErrors.content }}
      </div>
    </div>

    <!-- Status -->
    <div class="post-form__field">
      <label
        for="status"
        class="post-form__label"
      >
        Status
      </label>

      <select
        id="status"
        v-model="form.status"
        class="post-form__select"
      >
        <option value="published">
          Published
        </option>

        <option value="draft">
          Draft
        </option>
      </select>
    </div>

    <!-- Actions -->
    <div class="post-form__actions">
      <BaseButton
        type="submit"
        :loading="submitting"
      >
        {{ submitLabel }}
      </BaseButton>

      <BaseButton
        type="button"
        variant="outline"
        @click="$emit('cancel')"
      >
        Cancel
      </BaseButton>
    </div>
  </form>
</template>

<script setup>
import {
  reactive,
  ref,
  onBeforeUnmount,
} from "vue";

import { Editor, EditorContent } from "@tiptap/vue-3";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";

import BaseInput from "../common/BaseInput.vue";
import BaseButton from "../common/BaseButton.vue";
import BaseAlert from "../common/BaseAlert.vue";
import ImageCropper from "../common/ImageCropper.vue";

const props = defineProps({
  initialValues: {
    type: Object,
    default: () => ({
      title: "",
      excerpt: "",
      content: "",
      tags: [],
      status: "published",
    }),
  },

  submitLabel: {
    type: String,
    default: "Publish Post",
  },

  submitting: {
    type: Boolean,
    default: false,
  },

  serverError: {
    type: String,
    default: "",
  },
});

const emit = defineEmits([
  "submit",
  "cancel",
]);

const form = reactive({
  title: props.initialValues.title || "",
  excerpt: props.initialValues.excerpt || "",
  content: props.initialValues.content || "",
  status: props.initialValues.status || "published",
});

const tagsInput = ref(
  (props.initialValues.tags || []).join(", ")
);

const file = ref(null);

const previewUrl = ref(
  props.initialValues.coverImage?.url || ""
);

const formError = ref("");

const fieldErrors = reactive({
  title: "",
  content: "",
});

const editor = new Editor({
  content: props.initialValues.content || "",

  extensions: [
    StarterKit.configure({
      link: false,
    }),

    Link.configure({
      openOnClick: false,
      autolink: true,
      linkOnPaste: true,
      protocols: ["http", "https", "mailto"],
      HTMLAttributes: {
        rel: "noopener noreferrer nofollow",
        target: "_blank",
      },
    }),
  ],

  editorProps: {
    attributes: {
      class: "editor-content__area",
      spellcheck: "true",
    },
  },

  onUpdate: ({ editor: currentEditor }) => {
    form.content = currentEditor.getHTML();
  },
});

const updateServerError = (value) => {
  formError.value = value;
};

if (props.serverError) {
  updateServerError(props.serverError);
}

const handleCoverCropped = (croppedFile) => {
  file.value = croppedFile;

  if (previewUrl.value?.startsWith("blob:")) {
    URL.revokeObjectURL(previewUrl.value);
  }

  previewUrl.value =
    URL.createObjectURL(croppedFile);

  formError.value = "";
};

const handleCropError = (message) => {
  formError.value = message;
};

const handleSubmit = () => {
  const plainText = editor.getText().trim();

  fieldErrors.title = form.title.trim()
    ? ""
    : "Title is required";

  fieldErrors.content = plainText
    ? ""
    : "Content is required";

  if (fieldErrors.title || fieldErrors.content) {
    return;
  }

  const fd = new FormData();

  fd.append("title", form.title.trim());
  fd.append("content", form.content);

  /*
   * Always send excerpt.
   *
   * Empty excerpt tells the backend:
   * "Generate one automatically."
   */
  fd.append("excerpt", form.excerpt.trim());

  fd.append("status", form.status);
  fd.append("tags", tagsInput.value);

  if (file.value) {
    fd.append("coverImage", file.value);
  }

  emit("submit", fd);
};

onBeforeUnmount(() => {
  if (previewUrl.value?.startsWith("blob:")) {
    URL.revokeObjectURL(previewUrl.value);
  }

  editor.destroy();
});
</script>

<style scoped>
.post-form {
  width: 100%;
}

.post-form__field {
  margin-bottom: var(--space-5);
}

.post-form__label {
  display: block;
  margin-bottom: var(--space-2);
  color: var(--color-text-primary);
  font-size: var(--fs-sm);
  font-weight: var(--fw-medium);
  line-height: var(--lh-normal);
}

.post-form__optional {
  color: var(--color-text-muted);
  font-weight: var(--fw-normal);
}

.post-form__input,
.post-form__textarea,
.post-form__select {
  display: block;
  width: 100%;
  border: var(--border-width) solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-surface);
  color: var(--color-text-primary);
  font-family: var(--font-body);
  font-size: var(--fs-base);
  line-height: var(--lh-normal);
  outline: none;
  transition:
    border-color var(--transition-fast),
    box-shadow var(--transition-fast),
    background-color var(--transition-fast);
}

.post-form__input,
.post-form__select {
  min-height: var(--input-height);
  padding: 0 var(--space-3);
}

.post-form__textarea {
  min-height: 6rem;
  padding: var(--space-3);
  resize: vertical;
}

.post-form__input::placeholder,
.post-form__textarea::placeholder {
  color: var(--color-text-light);
}

.post-form__input:focus,
.post-form__textarea:focus,
.post-form__select:focus {
  border-color: var(--color-primary-light);
  box-shadow: var(--focus-ring);
}

.post-form__helper-row {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--space-3);
  margin-top: var(--space-1);
}

.post-form__hint {
  color: var(--color-text-muted);
  font-size: var(--fs-sm);
  line-height: var(--lh-normal);
}

.post-form__counter {
  flex: 0 0 auto;
  color: var(--color-text-muted);
  font-size: var(--fs-sm);
  line-height: var(--lh-normal);
}

.post-form__cropper {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--space-3);
}

.post-form__image-preview {
  display: block;
  width: 100%;
  max-height: 220px;
  margin-top: var(--space-3);
  border-radius: var(--radius-md);
  object-fit: cover;
  aspect-ratio: 16 / 9;
}

.editor-wrapper {
  overflow: hidden;
  border: var(--border-width) solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-surface);
}

.editor-toolbar {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: var(--space-1);
  padding: var(--space-2);
  border-bottom: var(--border-width) solid var(--color-border);
  background: var(--color-surface-alt);
}

.editor-toolbar__button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 34px;
  height: 34px;
  padding: 0 var(--space-2);
  border: 0;
  border-radius: var(--radius-sm);
  background: transparent;
  color: var(--color-text-primary);
  font-family: var(--font-body);
  font-size: var(--fs-sm);
  font-weight: var(--fw-semibold);
  line-height: 1;
  cursor: pointer;
  transition:
    background-color var(--transition-fast),
    color var(--transition-fast);
}

.editor-toolbar__button:hover:not(:disabled) {
  background: var(--color-surface-hover);
}

.editor-toolbar__button:focus-visible {
  outline: var(--focus-ring);
  outline-offset: 2px;
}

.editor-toolbar__button.is-active {
  background: var(--color-primary-lighter);
  color: var(--color-primary);
}

.editor-toolbar__button:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.editor-toolbar__divider {
  width: 1px;
  height: 24px;
  margin: 0 var(--space-1);
  background: var(--color-border);
}

.editor-content {
  min-height: 420px;
}

.editor-content__area {
  min-height: 420px;
  padding: var(--space-5);
  outline: none;
  color: var(--color-text-primary);
  line-height: var(--lh-relaxed);
}

.editor-content__area :deep(p) {
  margin-bottom: var(--space-4);
}

.editor-content__area :deep(h2),
.editor-content__area :deep(h3) {
  margin-top: var(--space-6);
  margin-bottom: var(--space-3);
  font-family: var(--font-heading);
  line-height: var(--lh-tight);
}

.editor-content__area :deep(ul),
.editor-content__area :deep(ol) {
  margin-bottom: var(--space-4);
  padding-left: var(--space-6);
}

.editor-content__area :deep(blockquote) {
  margin: var(--space-5) 0;
  padding: var(--space-3) var(--space-5);
  border-left: 4px solid var(--color-primary);
  background: var(--color-surface-alt);
  color: var(--color-text-muted);
}

.editor-content__area :deep(pre) {
  margin: var(--space-5) 0;
  padding: var(--space-4);
  overflow-x: auto;
  border-radius: var(--radius-md);
  background: var(--color-surface-alt);
  font-family: var(--font-mono);
}

.editor-content__area :deep(code) {
  font-family: var(--font-mono);
}

.editor-content__area :deep(a) {
  color: var(--color-primary);
  text-decoration: underline;
}

.post-form__field-error {
  margin-top: var(--space-1);
  color: var(--color-danger);
  font-size: var(--fs-sm);
  line-height: var(--lh-normal);
}

.post-form__actions {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: var(--space-2);
}

@media (max-width: 576px) {
  .post-form__helper-row {
    flex-direction: column;
    gap: var(--space-1);
  }

  .post-form__counter {
    align-self: flex-end;
  }

  .editor-content__area {
    min-height: 360px;
    padding: var(--space-4);
  }
}
</style>