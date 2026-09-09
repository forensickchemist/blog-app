import { ref } from "vue";

const STORAGE_KEY = "theme";
const DARK_THEME = "dark";
const LIGHT_THEME = "light";

const getInitialTheme = () => {
  const savedTheme = localStorage.getItem(STORAGE_KEY);

  if (savedTheme === DARK_THEME || savedTheme === LIGHT_THEME) {
    return savedTheme;
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? DARK_THEME
    : LIGHT_THEME;
};

const theme = ref(getInitialTheme());

const applyTheme = (newTheme) => {
  theme.value = newTheme;

  document.documentElement.setAttribute(
    "data-theme",
    newTheme
  );

  localStorage.setItem(STORAGE_KEY, newTheme);
};

// Apply the initial theme immediately.
applyTheme(theme.value);

const toggleTheme = () => {
  applyTheme(
    theme.value === DARK_THEME
      ? LIGHT_THEME
      : DARK_THEME
  );
};

const isDark = () => theme.value === DARK_THEME;

export function useTheme() {
  return {
    theme,
    toggleTheme,
    applyTheme,
    isDark,
  };
}