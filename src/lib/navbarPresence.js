// Tiny shared store that tracks whether a page-level AuthNavbar is currently
// mounted. GlobalNavBurger uses this to avoid rendering a second, duplicate
// navbar on pages that already include their own AuthNavbar.
let mountCount = 0;
const listeners = new Set();

function emit() {
  listeners.forEach((fn) => {
    try { fn(mountCount > 0); } catch (_) {}
  });
}

export function registerPageNavbar() {
  mountCount += 1;
  emit();
  return () => {
    mountCount = Math.max(0, mountCount - 1);
    emit();
  };
}

export function isPageNavbarMounted() {
  return mountCount > 0;
}

export function subscribePageNavbar(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}