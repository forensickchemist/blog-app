<template>
  <footer class="app-footer">
    <div class="app-container app-footer__container">

      <p class="app-footer__copyright">
        &copy; {{ year }} Open Notebook.
      </p>

      <div class="app-footer__socials">
        <a
          href="#"
          class="app-footer__social-link"
          aria-label="GitHub"
        >
          <i class="bi bi-github"></i>
        </a>

        <a
          href="#"
          class="app-footer__social-link"
          aria-label="Twitter / X"
        >
          <i class="bi bi-twitter-x"></i>
        </a>

        <a
          href="#"
          class="app-footer__social-link"
          aria-label="LinkedIn"
        >
          <i class="bi bi-linkedin"></i>
        </a>
      </div>

    </div>
  </footer>
</template>


<script setup>
const year = new Date().getFullYear();
</script>


<style scoped>
/* ================================================================
   FOOTER
   ================================================================ */

.app-footer {
  margin-top: auto;
  padding: var(--space-6) 0;

  background-color: var(--color-surface);
  border-top: var(--border-width) solid var(--color-border);
}


/* ================================================================
   CONTAINER
   ================================================================ */

.app-footer__container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;

  gap: var(--space-3);
}


/* ================================================================
   COPYRIGHT
   ================================================================ */

.app-footer__copyright {
  margin: 0;

  color: var(--color-text-muted);

  font-size: var(--fs-sm);
  line-height: var(--lh-normal);
}


/* ================================================================
   SOCIAL LINKS
   ================================================================ */

.app-footer__socials {
  display: flex;
  align-items: center;
  gap: var(--space-3);
}

.app-footer__social-link {
  display: inline-flex;
  align-items: center;
  justify-content: center;

  width: 2rem;
  height: 2rem;

  border-radius: var(--radius-md);

  color: var(--color-text-muted);

  font-size: var(--icon-size-sm);
  text-decoration: none;

  transition:
    background-color var(--transition-fast),
    color var(--transition-fast);
}

.app-footer__social-link:hover {
  background-color: var(--color-surface-muted);
  color: var(--color-text);
}

.app-footer__social-link:focus-visible {
  outline: none;
  box-shadow: var(--input-focus-ring);
}


/* ================================================================
   DESKTOP
   ================================================================ */

@media (min-width: 768px) {

  .app-footer__container {
    flex-direction: row;
  }

}
</style>