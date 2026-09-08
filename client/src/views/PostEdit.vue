<template>
  <div class="app-container page-section" style="max-width: 720px">
    <h1 class="fs-3 mb-4">Edit Note</h1>

    <BaseLoader v-if="loading" label="Loading post..." />

    <PostForm
      v-else-if="initialValues"
      :initial-values="initialValues"
      submit-label="Save Changes"
      :submitting="submitting"
      :server-error="error"
      @submit="handleSubmit"
      @cancel="router.back()"
    />
  </div>
</template>

<script setup>
import { onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import { usePostStore } from "../store/post";
import PostForm from "../components/blog/PostForm.vue";
import BaseLoader from "../components/common/BaseLoader.vue";

const props = defineProps({ slug: { type: String, required: true } });
const store = usePostStore();
const router = useRouter();

const loading = ref(true);
const submitting = ref(false);
const error = ref("");
const initialValues = ref(null);

onMounted(async () => {
  const post = await store.fetchPostBySlug(props.slug);
  initialValues.value = post;
  loading.value = false;
});

const handleSubmit = async (formData) => {
  submitting.value = true;
  error.value = "";
  try {
    const updated = await store.updatePost(props.slug, formData);
    router.push(`/posts/${updated.slug}`);
  } catch (err) {
    error.value = err.message;
  } finally {
    submitting.value = false;
  }
};
</script>
