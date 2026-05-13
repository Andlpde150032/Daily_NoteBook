/* ============================================
   Theme Manager — Auto + Manual Toggle
   ============================================ */

const ThemeManager = (() => {
  const STORAGE_KEY = 'daily-notebook-theme';
  const STORAGE_OVERRIDE_KEY = 'daily-notebook-theme-override';

  function getAutoTheme() {
    const hour = new Date().getHours();
    return (hour >= 18 || hour < 6) ? 'dark' : 'light';
  }

  function getSavedTheme() {
    const override = localStorage.getItem(STORAGE_OVERRIDE_KEY);
    if (override === 'true') {
      return localStorage.getItem(STORAGE_KEY) || getAutoTheme();
    }
    return getAutoTheme();
  }

  function apply(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    updateToggleIcon(theme);
  }

  function updateToggleIcon(theme) {
    const slider = document.querySelector('.theme-toggle__slider');
    if (slider) {
      slider.textContent = theme === 'dark' ? '🌙' : '☀️';
    }
  }

  function toggle() {
    const current = document.documentElement.getAttribute('data-theme');
    const next = current === 'dark' ? 'light' : 'dark';
    localStorage.setItem(STORAGE_KEY, next);
    localStorage.setItem(STORAGE_OVERRIDE_KEY, 'true');
    apply(next);
  }

  function init() {
    const theme = getSavedTheme();
    apply(theme);

    const toggleBtn = document.getElementById('theme-toggle');
    if (toggleBtn) {
      toggleBtn.addEventListener('click', toggle);
    }

    // Check auto theme every minute if no override
    setInterval(() => {
      const override = localStorage.getItem(STORAGE_OVERRIDE_KEY);
      if (override !== 'true') {
        apply(getAutoTheme());
      }
    }, 60000);
  }

  return { init, toggle, getAutoTheme };
})();
