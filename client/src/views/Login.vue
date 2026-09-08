<template>
  <div class="app-container page-section login-page">
    <BaseCard>
      <h1 class="text-center mb-1">
        Welcome back
      </h1>

      <p class="text-muted-app text-center mb-4">
        Log in to continue.
      </p>

      <BaseAlert
        :message="error"
        variant="danger"
        dismissible
        @dismiss="error = ''"
      />

      <form @submit.prevent="handleSubmit">
        <BaseInput
          id="emailOrUsername"
          v-model="form.emailOrUsername"
          label="Email or Username"
          icon="bi-person"
        />

        <BaseInput
          id="password"
          v-model="form.password"
          type="password"
          label="Password"
          icon="bi-lock"
        />

        <BaseButton
          type="submit"
          class="w-100"
          :loading="auth.isLoading"
        >
          Log In
        </BaseButton>
      </form>

      <p class="text-center mt-4 mb-0 login-page__signup">
        Don't have an account?
        <router-link to="/register">
          Sign up
        </router-link>
      </p>
    </BaseCard>
  </div>
</template>

<script setup>
import { reactive, ref } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useAuthStore } from "../store/auth";

import BaseCard from "../components/common/BaseCard.vue";
import BaseInput from "../components/common/BaseInput.vue";
import BaseButton from "../components/common/BaseButton.vue";
import BaseAlert from "../components/common/BaseAlert.vue";

const auth = useAuthStore();
const router = useRouter();
const route = useRoute();

const form = reactive({
  emailOrUsername: "",
  password: "",
});

const error = ref("");

const handleSubmit = async () => {
  error.value = "";

  try {
    await auth.login(form);
    router.push(route.query.redirect || { name: "home" });
  } catch (err) {
    error.value = err.message;
  }
};
</script>

<style scoped>
.login-page {
  max-width: 440px;
}
</style>