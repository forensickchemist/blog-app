<template>
  <nav class="app-navbar sticky-top">
    <div class="app-container app-navbar__container">

      <!-- ==========================================================
           NAVBAR HEADER
           ========================================================== -->
      <div class="app-navbar__header">

        <!-- Brand -->
        <router-link
          class="app-navbar__brand"
          to="/"
          @click="closeMenu"
        >
          <i class="bi bi-journals app-navbar__brand-icon"></i>

          <span>
            Open<span class="app-navbar__brand-accent">Notebook</span>
          </span>
        </router-link>


        <!-- Mobile Toggle -->
        <button
          type="button"
          class="app-navbar__toggle"
          :aria-expanded="isOpen"
          aria-controls="app-navbar-navigation"
          aria-label="Toggle navigation"
          @click="toggleMenu"
        >
          <i
            class="bi"
            :class="isOpen ? 'bi-x-lg' : 'bi-list'"
          ></i>
        </button>

      </div>


      <!-- ==========================================================
           NAVIGATION
           ========================================================== -->
      <div
        id="app-navbar-navigation"
        class="app-navbar__navigation"
        :class="{ 'is-open': isOpen }"
      >
        <ul class="app-navbar__links">

          <!-- Home -->
          <li class="app-navbar__item">
            <router-link
              class="app-navbar__link"
              to="/"
              @click="closeMenu"
            >
              Home
            </router-link>
          </li>


          <!-- ======================================================
               AUTHENTICATED NAVIGATION
               ====================================================== -->
          <template v-if="auth.isAuthenticated">

            <!-- New Post -->
            <li class="app-navbar__item">
              <router-link
                class="app-navbar__link"
                to="/posts/new"
                @click="closeMenu"
              >
                <i class="bi bi-plus-circle"></i>
                <span>New Note</span>
              </router-link>
            </li>


            <!-- My Posts -->
            <li class="app-navbar__item">
              <router-link
                class="app-navbar__link"
                to="/dashboard"
                @click="closeMenu"
              >
                <i class="bi bi-journal-bookmark"></i>
                My Notebook
              </router-link>
            </li>


            <!-- ====================================================
                 ADMIN
                 ==================================================== -->
            <li
              v-if="auth.isAdmin"
              class="app-navbar__item"
            >
              <router-link
                class="app-navbar__link"
                to="/admin"
                @click="closeMenu"
              >
                <i class="bi bi-shield-check"></i>
                <span>Admin</span>
              </router-link>
            </li>


            <!-- Profile -->
            <li class="app-navbar__item">
              <router-link
                class="app-navbar__link"
                :to="`/profile/${auth.user.username}`"
                @click="closeMenu"
              >
                <i class="bi bi-person-circle"></i>
                <span>Profile</span>
              </router-link>
            </li>


            <!-- Logout -->
            <li class="app-navbar__item">
              <button
                type="button"
                class="app-navbar__link app-navbar__logout"
                @click="handleLogout"
              >
                <i class="bi bi-box-arrow-right"></i>
                <span>Logout</span>
              </button>
            </li>

          </template>


          <!-- ======================================================
               GUEST NAVIGATION
               ====================================================== -->
          <template v-else>

            <!-- Login -->
            <li class="app-navbar__item">
              <router-link
                class="app-navbar__link"
                to="/login"
                @click="closeMenu"
              >
                Login
              </router-link>
            </li>


            <!-- Sign Up -->
            <li class="app-navbar__item">
              <router-link
                class="btn btn-app-primary btn-sm app-navbar__signup"
                to="/register"
                @click="closeMenu"
              >
                Sign Up
              </router-link>
            </li>

          </template>


          <!-- ======================================================
               THEME TOGGLE
               ====================================================== -->
          <li class="app-navbar__item">
            <button
              type="button"
              class="app-navbar__theme-toggle"
              :aria-label="
                theme === 'dark'
                  ? 'Switch to light mode'
                  : 'Switch to dark mode'
              "
              :title="
                theme === 'dark'
                  ? 'Switch to light mode'
                  : 'Switch to dark mode'
              "
              @click="toggleTheme"
            >
              <i
                class="bi"
                :class="
                  theme === 'dark'
                    ? 'bi-sun-fill'
                    : 'bi-moon-fill'
                "
              ></i>

              <span>
                {{ theme === "dark" ? "Light" : "Dark" }}
              </span>
            </button>
          </li>

        </ul>
      </div>

    </div>
  </nav>
</template>


<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "../../store/auth";
import { useTheme } from "../../composables/useTheme";


const auth = useAuthStore();
const router = useRouter();

const isOpen = ref(false);

const {
  theme,
  toggleTheme,
} = useTheme();


const toggleMenu = () => {
  isOpen.value = !isOpen.value;
};


const closeMenu = () => {
  isOpen.value = false;
};


const handleLogout = async () => {
  await auth.logout();

  closeMenu();

  router.push({ name: "home" });
};
</script>


<style scoped>
/* ================================================================
   NAVBAR
   ================================================================ */

.app-navbar {
  background-color: var(--color-surface);
  border-bottom: 1px solid var(--color-border);
  box-shadow: var(--shadow-sm);

  transition:
    background-color var(--transition-normal),
    border-color var(--transition-normal),
    box-shadow var(--transition-normal);
}


/* ================================================================
   CONTAINER
   ================================================================ */

.app-navbar__container {
  min-height: 4.25rem;

  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
}


/* ================================================================
   HEADER
   ================================================================ */

.app-navbar__header {
  display: flex;
  align-items: center;
  justify-content: space-between;

  width: 100%;
}


/* ================================================================
   BRAND
   ================================================================ */

.app-navbar__brand {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;

  color: var(--color-text);

  font-size: 1.1rem;
  font-weight: var(--fw-bold);
  line-height: 1;

  text-decoration: none;

  transition: color var(--transition-fast);
}

.app-navbar__brand:hover {
  color: var(--color-text);
}

.app-navbar__brand-icon {
  color: var(--color-primary);
  font-size: 1.25rem;
}

.app-navbar__brand-accent {
  color: var(--color-accent);
}


/* ================================================================
   MOBILE TOGGLE
   ================================================================ */

.app-navbar__toggle {
  display: inline-flex;
  align-items: center;
  justify-content: center;

  width: 2.5rem;
  height: 2.5rem;

  padding: 0;

  border: var(--border-width) solid var(--color-border);
  border-radius: var(--radius-md);

  background-color: transparent;
  color: var(--color-text);

  font-size: 1.25rem;

  cursor: pointer;

  transition:
    background-color var(--transition-fast),
    border-color var(--transition-fast),
    color var(--transition-fast);
}

.app-navbar__toggle:hover {
  background-color: var(--color-bg-hover);
  border-color: var(--color-border-dark);
  color: var(--color-text);
}

.app-navbar__toggle:focus-visible {
  outline: none;
  box-shadow: var(--input-focus-ring);
}


/* ================================================================
   NAVIGATION
   ================================================================ */

.app-navbar__navigation {
  display: none;

  flex-basis: 100%;
  width: 100%;
}

.app-navbar__navigation.is-open {
  display: block;
}


/* ================================================================
   NAVIGATION LINKS
   ================================================================ */

.app-navbar__links {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;

  margin: 0;
  padding: 0.75rem 0;

  list-style: none;
}

.app-navbar__link {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;

  width: 100%;

  padding: 0.6rem 0.75rem;

  border: 0;
  border-radius: var(--radius-md);

  background: transparent;
  color: var(--color-text-muted);

  font: inherit;
  font-size: var(--fs-sm);
  font-weight: var(--fw-medium);
  line-height: var(--lh-normal);

  text-align: left;
  text-decoration: none;

  cursor: pointer;

  transition:
    background-color var(--transition-fast),
    color var(--transition-fast);
}

.app-navbar__link:hover {
  background-color: var(--color-bg-hover);
  color: var(--color-text);
}

.app-navbar__link.router-link-active {
  background-color: var(--color-primary-lighter);
  color: var(--color-primary);
}

.app-navbar__link:focus-visible {
  outline: none;
  box-shadow: var(--input-focus-ring);
}


/* ================================================================
   LOGOUT
   ================================================================ */

.app-navbar__logout {
  appearance: none;
}


/* ================================================================
   THEME TOGGLE
   ================================================================ */

.app-navbar__theme-toggle {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;

  width: 100%;

  padding: 0.6rem 0.75rem;

  border: 0;
  border-radius: var(--radius-md);

  background: transparent;
  color: var(--color-text-muted);

  font: inherit;
  font-size: var(--fs-sm);
  font-weight: var(--fw-medium);
  line-height: var(--lh-normal);

  text-align: left;

  cursor: pointer;

  transition:
    background-color var(--transition-fast),
    color var(--transition-fast);
}

.app-navbar__theme-toggle:hover {
  background-color: var(--color-bg-hover);
  color: var(--color-text);
}

.app-navbar__theme-toggle:focus-visible {
  outline: none;
  box-shadow: var(--input-focus-ring);
}

.app-navbar__theme-toggle i {
  width: 1.1rem;

  color: var(--color-secondary);
  text-align: center;
}


/* ================================================================
   SIGN UP
   Matches BaseButton primary styling
   ================================================================ */

.app-navbar__signup {
  display: inline-flex;
  align-items: center;
  justify-content: center;

  min-width: max-content;
  height: var(--button-height);

  padding: 0 var(--button-padding-x);

  border: var(--border-width) solid var(--color-primary);
  border-radius: var(--radius-md);

  background: var(--color-primary);
  color: var(--color-text-inverse);

  font-family: var(--font-body);
  font-size: var(--fs-sm);
  font-weight: var(--fw-semibold);
  line-height: 1;

  text-decoration: none;
  white-space: nowrap;

  cursor: pointer;

  transition:
    background-color var(--transition-fast),
    border-color var(--transition-fast),
    color var(--transition-fast),
    box-shadow var(--transition-fast),
    transform var(--transition-fast);
}

.app-navbar__signup:hover {
  background: var(--color-primary-dark);
  border-color: var(--color-primary-dark);
  color: var(--color-text-inverse);

  transform: translateY(-1px);
}

.app-navbar__signup:active {
  transform: translateY(0);
}

.app-navbar__signup:focus-visible {
  outline: none;
  box-shadow: var(--input-focus-ring);
}


/* ================================================================
   DESKTOP
   ================================================================ */

@media (min-width: 992px) {

  .app-navbar__container {
    min-height: 4.5rem;
    flex-wrap: nowrap;
  }

  .app-navbar__header {
    width: auto;
  }

  .app-navbar__toggle {
    display: none;
  }

  .app-navbar__navigation {
    display: block;

    flex-basis: auto;
    width: auto;
  }

  .app-navbar__links {
    flex-direction: row;
    align-items: center;

    gap: 0.25rem;

    padding: 0;
  }

  .app-navbar__link {
    width: auto;

    padding: 0.5rem 0.7rem;
  }

  .app-navbar__theme-toggle {
    width: auto;

    padding: 0.5rem 0.7rem;
  }

  .app-navbar__theme-toggle span {
    display: none;
  }

  .app-navbar__signup {
    margin-left: 0.25rem;
  }
}
</style>