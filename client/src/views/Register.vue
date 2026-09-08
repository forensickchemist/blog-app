<template>
  <div class="app-container page-section register-page">
    <BaseCard>
      <h1 class="text-center mb-1">
        Create your account
      </h1>

      <p class="text-muted-app text-center mb-4">
        Join the community and start writing.
      </p>

      <BaseAlert
        :message="error"
        variant="danger"
        dismissible
        @dismiss="error = ''"
      />

      <form @submit.prevent="handleSubmit">
        <BaseInput
          id="email"
          v-model="form.email"
          type="email"
          label="Email"
          icon="bi-envelope"
        />

        <BaseInput
          id="username"
          v-model="form.username"
          label="Username"
          icon="bi-person"
        />

        <BaseInput
          id="password"
          v-model="form.password"
          type="password"
          label="Password"
          icon="bi-lock"
          hint="At least 8 characters."
        />

        <BaseInput
          id="confirmPassword"
          v-model="form.confirmPassword"
          type="password"
          label="Confirm Password"
          icon="bi-lock"
        />

        <BaseButton
          type="submit"
          class="w-100"
          :loading="auth.isLoading"
        >
          Sign Up
        </BaseButton>
      </form>

      <p class="text-center mt-4 mb-0 register-page__login">
        Already have an account?
        <router-link to="/login">
          Log in
        </router-link>
      </p>
    </BaseCard>
  </div>
</template>

<script setup>
import { reactive, ref } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "../store/auth";

import BaseCard from "../components/common/BaseCard.vue";
import BaseInput from "../components/common/BaseInput.vue";
import BaseButton from "../components/common/BaseButton.vue";
import BaseAlert from "../components/common/BaseAlert.vue";

const auth = useAuthStore();
const router = useRouter();

const form = reactive({
  email: "",
  username: "",
  password: "",
  confirmPassword: "",
});

const error = ref("");

const handleSubmit = async () => {
  error.value = "";

  if (form.password !== form.confirmPassword) {
    error.value = "Passwords do not match.";
    return;
  }

  try {
    await auth.register({
      email: form.email,
      username: form.username,
      password: form.password,
    });

    router.push({ name: "login" });
  } catch (err) {
    error.value = err.errors?.length
      ? err.errors.map((e) => e.message).join(" ")
      : err.message;
  }
};
</script>

<style scoped>
.register-page {
  max-width: 440px;
}
</style>