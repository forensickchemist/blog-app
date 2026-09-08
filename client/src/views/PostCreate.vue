<template>
  <div class="app-container page-section" style="max-width: 720px">
    <h1 class="fs-3 mb-4">Write a New Note</h1>
    <PostForm
      submit-label="Publish Post"
      :submitting="submitting"
      :server-error="error"
      @submit="handleSubmit"
      @cancel="router.back()"
    />
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { usePostStore } from "../store/post";
import PostForm from "../components/blog/PostForm.vue";

const store = usePostStore();
const router = useRouter();
const submitting = ref(false);
const error = ref("");

const handleSubmit = async (formData) => {
  submitting.value = true;
  error.value = "";
  try {
    const post = await store.createPost(formData);
    router.push(`/posts/${post.slug}`);
  } catch (err) {
    error.value = err.message;
  } finally {
    submitting.value = false;
  }
};
</script>
