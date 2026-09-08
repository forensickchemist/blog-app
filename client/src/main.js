import { createApp } from "vue";
import { createPinia } from "pinia";

// Bootstrap + icons (JS bundle includes Popper for dropdowns/modals)
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";

// App design system 
import "./assets/styles/global.css";

import App from "./App.vue";
import router from "./router";
import { useAuthStore } from "./store/auth";

const app = createApp(App);
const pinia = createPinia();

app.use(pinia);
app.use(router);

// Restore session (if a valid cookie/token exists) before mounting
const authStore = useAuthStore();
authStore.fetchCurrentUser().finally(() => {
  app.mount("#app");
});
