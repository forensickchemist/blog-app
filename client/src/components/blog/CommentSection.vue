<template>
  <section class="comment-section">
    <div class="comment-section__header">
      <h2 class="comment-section__title">
        Comments
      </h2>

      <span
        v-if="comments.length"
        class="comment-section__count"
      >
        {{ comments.length }}
      </span>
    </div>

    <!-- Add Comment -->
    <div
      v-if="authStore.user"
      class="comment-form"
    >
      <form @submit.prevent="handleSubmit">
        <label
          for="comment-content"
          class="comment-form__label"
        >
          Leave a comment
        </label>

        <textarea
          id="comment-content"
          v-model="content"
          class="comment-form__textarea"
          rows="4"
          maxlength="1000"
          placeholder="Write your comment..."
          :disabled="submitting"
        ></textarea>

        <div class="comment-form__footer">
          <small class="comment-form__counter">
            {{ content.length }}/1000
          </small>

          <BaseButton
            type="submit"
            :loading="submitting"
            :disabled="!content.trim()"
          >
            Comment
          </BaseButton>
        </div>
      </form>

      <BaseAlert
        v-if="formError"
        :message="formError"
        variant="danger"
        class="comment-form__alert"
      />
    </div>

    <!-- Guest message -->
    <div
      v-else
      class="comment-login"
    >
      <span>
        <router-link to="/login">
          Log in
        </router-link>
        to leave a comment.
      </span>
    </div>

    <!-- Loading -->
    <BaseLoader
      v-if="loading"
      label="Loading comments..."
    />

    <!-- Error -->
    <BaseAlert
      v-else-if="error"
      :message="error"
      variant="danger"
    />

    <!-- Empty -->
    <EmptyState
      v-else-if="!comments.length"
      title="No comments yet"
      message="Be the first to share your thoughts."
    />

    <!-- Comments -->
    <div
      v-else
      class="comments-list"
    >
      <article
        v-for="comment in parentComments"
        :key="comment._id"
        class="comment-thread"
      >
        <!-- Parent Comment -->
        <div class="comment">
          <div class="comment__avatar">
            <img
              v-if="comment.author?.avatarUrl"
              :src="comment.author.avatarUrl"
              :alt="comment.author.username"
            />

            <i
              v-else
              class="bi bi-person"
              aria-hidden="true"
            ></i>
          </div>

          <div class="comment__body">
            <div class="comment__header">
              <router-link
                v-if="comment.author?.username"
                :to="`/profile/${comment.author.username}`"
                class="comment__author"
              >
                {{ comment.author.username }}
              </router-link>

              <span class="comment__date">
                {{ formatDateTime(comment.createdAt) }}
              </span>
            </div>

            <p class="comment__content">
              {{ comment.content }}
            </p>

            <div class="comment__actions">
              <button
                v-if="authStore.user"
                type="button"
                class="comment__action"
                @click="startReply(comment)"
              >
                Reply
              </button>

              <button
                v-if="canDelete(comment)"
                type="button"
                class="comment__action comment__action--danger"
                :disabled="deletingId === comment._id"
                @click="handleDelete(comment)"
              >
                {{
                  deletingId === comment._id
                    ? "Deleting..."
                    : "Delete"
                }}
              </button>
            </div>
          </div>
        </div>

        <!-- Reply Form -->
        <div
          v-if="replyingTo === comment._id"
          class="reply-form"
        >
          <form @submit.prevent="handleReplySubmit">
            <div class="reply-form__mention">
              <label
                for="reply-mention"
                class="reply-form__label"
              >
                Replying to
              </label>

              <div class="reply-form__mention-input">
                <span
                  class="reply-form__mention-prefix"
                  aria-hidden="true"
                >
                  @
                </span>

                <input
                  id="reply-mention"
                  v-model="replyMention"
                  type="text"
                  class="reply-form__input"
                  maxlength="50"
                  placeholder="username (optional)"
                  :disabled="replySubmitting"
                  autocomplete="off"
                />
              </div>

              <small class="reply-form__hint">
                You can change or remove the mention.
              </small>
            </div>

            <label
              for="reply-content"
              class="reply-form__label"
            >
              Your reply
            </label>

            <textarea
              id="reply-content"
              v-model="replyContent"
              class="reply-form__textarea"
              rows="3"
              maxlength="1000"
              placeholder="Write your reply..."
              :disabled="replySubmitting"
            ></textarea>

            <div class="reply-form__footer">
              <small class="reply-form__counter">
                {{ replyContent.length }}/1000
              </small>

              <div class="reply-form__buttons">
                <BaseButton
                  type="button"
                  variant="outline"
                  :disabled="replySubmitting"
                  @click="cancelReply"
                >
                  Cancel
                </BaseButton>

                <BaseButton
                  type="submit"
                  :loading="replySubmitting"
                  :disabled="!replyContent.trim()"
                >
                  Reply
                </BaseButton>
              </div>
            </div>
          </form>

          <BaseAlert
            v-if="replyError"
            :message="replyError"
            variant="danger"
            class="reply-form__alert"
          />
        </div>

        <!-- Replies -->
        <div
          v-if="repliesFor(comment._id).length"
          class="replies"
        >
          <article
            v-for="reply in repliesFor(comment._id)"
            :key="reply._id"
            class="comment comment--reply"
          >
            <div class="comment__avatar">
              <img
                v-if="reply.author?.avatarUrl"
                :src="reply.author.avatarUrl"
                :alt="reply.author.username"
              />

              <i
                v-else
                class="bi bi-person"
                aria-hidden="true"
              ></i>
            </div>

            <div class="comment__body">
              <div class="comment__header">
                <router-link
                  v-if="reply.author?.username"
                  :to="`/profile/${reply.author.username}`"
                  class="comment__author"
                >
                  {{ reply.author.username }}
                </router-link>

                <span class="comment__date">
                  {{ formatDateTime(reply.createdAt) }}
                </span>
              </div>

              <p class="comment__content">
                <template
                  v-if="reply.mentionedUser?.username"
                >
                  <router-link
                    :to="`/profile/${reply.mentionedUser.username}`"
                    class="comment__mention"
                  >
                    @{{ reply.mentionedUser.username }}
                  </router-link>

                  <span class="comment__mention-space">
                    {{ " " }}
                  </span>
                </template>

                <span>
                  {{ reply.content }}
                </span>
              </p>

              <div
                v-if="canDelete(reply)"
                class="comment__actions"
              >
                <button
                  type="button"
                  class="comment__action comment__action--danger"
                  :disabled="deletingId === reply._id"
                  @click="handleDelete(reply)"
                >
                  {{
                    deletingId === reply._id
                      ? "Deleting..."
                      : "Delete"
                  }}
                </button>
              </div>
            </div>
          </article>
        </div>
      </article>
    </div>
  </section>
</template>

<script setup>
import {
  computed,
  onMounted,
  ref,
} from "vue";

import { useAuthStore } from "../../store/auth";
import { commentService } from "../../services/comment";

import BaseAlert from "../common/BaseAlert.vue";
import BaseButton from "../common/BaseButton.vue";
import BaseLoader from "../common/BaseLoader.vue";
import EmptyState from "../common/EmptyState.vue";

const props = defineProps({
  postId: {
    type: String,
    required: true,
  },
});

const authStore = useAuthStore();

const comments = ref([]);
const content = ref("");

const loading = ref(true);
const submitting = ref(false);
const deletingId = ref(null);

const error = ref("");
const formError = ref("");

const replyingTo = ref(null);
const replyContent = ref("");
const replyMention = ref("");
const replySubmitting = ref(false);
const replyError = ref("");

const parentComments = computed(() => {
  return comments.value.filter(
    (comment) => !comment.parentComment
  );
});

const repliesFor = (parentId) => {
  return comments.value.filter(
    (comment) =>
      comment.parentComment?.toString() ===
      parentId.toString()
  );
};

const formatDateTime = (date) => {
  return new Date(date).toLocaleString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
};

const canDelete = (comment) => {
  if (!authStore.user || !comment.author) {
    return false;
  }

  const isOwner =
    comment.author._id?.toString() ===
    authStore.user._id?.toString();

  const isAdmin =
    authStore.user.role === "admin";

  return isOwner || isAdmin;
};

const loadComments = async () => {
  loading.value = true;
  error.value = "";

  try {
    comments.value =
      await commentService.getComments(
        props.postId
      );
  } catch (err) {
    error.value =
      err.message ||
      "Unable to load comments.";
  } finally {
    loading.value = false;
  }
};

const handleSubmit = async () => {
  const trimmedContent =
    content.value.trim();

  if (!trimmedContent) {
    formError.value =
      "Comment content is required.";
    return;
  }

  formError.value = "";
  submitting.value = true;

  try {
    const comment =
      await commentService.createComment(
        props.postId,
        trimmedContent
      );

    comments.value.push(comment);
    content.value = "";
  } catch (err) {
    formError.value =
      err.message ||
      "Unable to create comment.";
  } finally {
    submitting.value = false;
  }
};

const startReply = (comment) => {
  replyingTo.value = comment._id;

  replyMention.value =
    comment.author?.username || "";

  replyContent.value = "";
  replyError.value = "";
};

const cancelReply = () => {
  replyingTo.value = null;
  replyMention.value = "";
  replyContent.value = "";
  replyError.value = "";
};

const handleReplySubmit = async () => {
  const trimmedContent =
    replyContent.value.trim();

  if (!trimmedContent) {
    replyError.value =
      "Reply content is required.";
    return;
  }

  replyError.value = "";
  replySubmitting.value = true;

  try {
    const reply =
      await commentService.createComment(
        props.postId,
        trimmedContent,
        replyingTo.value,
        replyMention.value
      );

    comments.value.push(reply);

    cancelReply();
  } catch (err) {
    replyError.value =
      err.message ||
      "Unable to create reply.";
  } finally {
    replySubmitting.value = false;
  }
};

const handleDelete = async (comment) => {
  deletingId.value = comment._id;
  error.value = "";

  try {
    await commentService.deleteComment(
      comment._id
    );

    if (!comment.parentComment) {
      comments.value = comments.value.filter(
        (item) =>
          item._id !== comment._id &&
          item.parentComment?.toString() !==
            comment._id.toString()
      );

      if (replyingTo.value === comment._id) {
        cancelReply();
      }
    } else {
      comments.value = comments.value.filter(
        (item) => item._id !== comment._id
      );
    }
  } catch (err) {
    error.value =
      err.message ||
      "Unable to delete comment.";
  } finally {
    deletingId.value = null;
  }
};

onMounted(loadComments);
</script>

<style scoped>
.comment-section {
  width: min(100%, var(--size-lg));
  margin: var(--space-12) auto 0;
  padding-top: var(--space-8);
  border-top: var(--border-width) solid var(--color-border);
}

.comment-section__header {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  margin-bottom: var(--space-6);
}

.comment-section__title {
  margin: 0;
  font-family: var(--font-heading);
  font-size: var(--fs-2xl);
  font-weight: var(--fw-bold);
  line-height: var(--lh-tight);
}

.comment-section__count {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 1.75rem;
  height: 1.75rem;
  padding: 0 var(--space-2);
  border-radius: var(--radius-pill);
  background: var(--color-surface-alt);
  color: var(--color-text-muted);
  font-size: var(--fs-sm);
  font-weight: var(--fw-medium);
  line-height: 1;
}

.comment-form {
  margin-bottom: var(--space-8);
  padding: var(--space-5);
  border: var(--border-width) solid var(--color-border);
  border-radius: var(--radius-lg);
  background: var(--color-surface);
}

.comment-form__label,
.reply-form__label {
  display: block;
  margin-bottom: var(--space-2);
  color: var(--color-text-primary);
  font-size: var(--fs-sm);
  font-weight: var(--fw-medium);
  line-height: var(--lh-normal);
}

.comment-form__textarea,
.reply-form__textarea,
.reply-form__input {
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

.comment-form__textarea,
.reply-form__textarea {
  min-height: 6rem;
  padding: var(--space-3);
  resize: vertical;
}

.comment-form__textarea::placeholder,
.reply-form__textarea::placeholder,
.reply-form__input::placeholder {
  color: var(--color-text-light);
}

.comment-form__textarea:focus,
.reply-form__textarea:focus,
.reply-form__input:focus {
  border-color: var(--color-primary-light);
  box-shadow: var(--focus-ring);
}

.comment-form__textarea:disabled,
.reply-form__textarea:disabled,
.reply-form__input:disabled {
  background: var(--color-surface-alt);
  opacity: 0.7;
  cursor: not-allowed;
}

.comment-form__footer,
.reply-form__footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-3);
  margin-top: var(--space-3);
}

.comment-form__counter,
.reply-form__counter,
.reply-form__hint {
  color: var(--color-text-muted);
  font-size: var(--fs-sm);
  line-height: var(--lh-normal);
}

.comment-form__alert,
.reply-form__alert {
  margin-top: var(--space-3);
}

.comment-login {
  margin-bottom: var(--space-8);
  padding: var(--space-4);
  border-radius: var(--radius-md);
  background: var(--color-surface-alt);
  color: var(--color-text-muted);
}

.comment-login a {
  color: var(--color-primary);
  font-weight: var(--fw-semibold);
}

.comments-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
}

.comment-thread {
  display: flex;
  flex-direction: column;
}

.comment {
  display: flex;
  gap: var(--space-3);
}

.comment--reply {
  padding-top: var(--space-4);
}

.comment__avatar {
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 var(--avatar-size);
  width: var(--avatar-size);
  height: var(--avatar-size);
  min-width: var(--avatar-size);
  overflow: hidden;
  border-radius: var(--radius-pill);
  background: var(--color-surface-alt);
  color: var(--color-text-muted);
}

.comment__avatar img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.comment__avatar .bi {
  font-size: var(--icon-size-md);
  line-height: 1;
}

.comment__body {
  min-width: 0;
  flex: 1;
}

.comment__header {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: var(--space-2);
  margin-bottom: var(--space-1);
}

.comment__author {
  color: var(--color-text-primary);
  font-weight: var(--fw-semibold);
  text-decoration: none;
}

.comment__author:hover {
  text-decoration: underline;
}

.comment__date {
  color: var(--color-text-muted);
  font-size: var(--fs-sm);
}

.comment__content {
  margin: 0;
  color: var(--color-text-primary);
  line-height: var(--lh-relaxed);
  white-space: pre-wrap;
  overflow-wrap: anywhere;
}

.comment__mention {
  color: var(--color-primary);
  font-weight: var(--fw-semibold);
  text-decoration: none;
}

.comment__mention:hover {
  text-decoration: underline;
}

.comment__mention-space {
  white-space: pre;
}

.comment__actions {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  margin-top: var(--space-2);
}

.comment__action {
  padding: 0;
  border: 0;
  background: transparent;
  color: var(--color-text-muted);
  font-family: var(--font-body);
  font-size: var(--fs-sm);
  cursor: pointer;
}

.comment__action:hover {
  color: var(--color-text-primary);
  text-decoration: underline;
}

.comment__action:focus-visible {
  border-radius: var(--radius-sm);
  outline: var(--focus-ring);
  outline-offset: 2px;
}

.comment__action:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.comment__action--danger {
  color: var(--color-danger);
}

.reply-form {
  margin-top: var(--space-4);
  margin-left: calc(
    var(--avatar-size) + var(--space-3)
  );
  padding: var(--space-4);
  border: var(--border-width) solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-surface-alt);
}

.reply-form__mention {
  margin-bottom: var(--space-3);
}

.reply-form__mention-input {
  position: relative;
  display: flex;
  align-items: center;
}

.reply-form__mention-prefix {
  position: absolute;
  left: var(--space-3);
  z-index: 1;
  color: var(--color-text-muted);
  pointer-events: none;
}

.reply-form__input {
  min-height: var(--input-height);
  padding: 0 var(--space-3);
  padding-left: calc(
    var(--space-3) + 1rem
  );
}

.reply-form__hint {
  display: block;
  margin-top: var(--space-2);
}

.reply-form__textarea {
  min-height: 4.5rem;
  padding: var(--space-3);
  resize: vertical;
}

.reply-form__buttons {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.replies {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  margin-top: var(--space-4);
  margin-left: calc(
    var(--avatar-size) + var(--space-3)
  );
  padding-left: var(--space-5);
  border-left: var(--border-width) solid var(--color-border);
}

@media (max-width: 576px) {
  .reply-form,
  .replies {
    margin-left: 0;
  }

  .replies {
    padding-left: var(--space-4);
  }

  .reply-form__footer {
    align-items: flex-end;
  }
}
</style>