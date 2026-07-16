/* ============================================================
   ROUTER
   Minimal view-swap router for the single-page flow. No
   history API needed — this is a linear one-shot experience.
   ============================================================ */

const screens = {};

export function registerScreens(map) {
  Object.assign(screens, map);
}

export function showScreen(name) {
  document.querySelectorAll('.screen').forEach((el) => {
    el.classList.remove('active', 'screen-enter');
  });
  const target = document.getElementById(`screen-${name}`);
  if (!target) return;
  target.classList.add('active', 'screen-enter');
  window.scrollTo({ top: 0, behavior: 'instant' in window ? 'instant' : 'auto' });

  if (typeof screens[name] === 'function') {
    screens[name]();
  }
}
