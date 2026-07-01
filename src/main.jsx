import React from 'react'
import ReactDOM from 'react-dom/client'
import App from '@/App.jsx'
import AppErrorBoundary from '@/components/system/AppErrorBoundary'
import '@/index.css'

// When Base44 OAuth completes, it redirects back with ?access_token=...
// Persist the token and reload cleanly so the SDK boots fully authenticated.
(function handleTokenFromUrl() {
  if (typeof window === 'undefined') return;
  const params = new URLSearchParams(window.location.search);
  const token = params.get('access_token');
  if (!token) return;

  try {
    localStorage.setItem('base44_access_token', token);
    localStorage.setItem('base44_token', token);
  } catch (_) {}

  // Clean the URL without reloading — let React handle the state
  params.delete('access_token');
  const cleanUrl =
    window.location.pathname +
    (params.toString() ? `?${params.toString()}` : '') +
    window.location.hash;

  // Use replaceState without reload to keep app running
  window.history.replaceState({}, document.title, cleanUrl);
})();

(function ensureBootstrapHelpers() {
  if (typeof window === 'undefined') return;

  try {
    if (typeof window.__safeLocationAssign !== 'function') {
      const assign = window.location.assign.bind(window.location);
      window.__safeLocationAssign = (url) => assign(url);
    }

    if (typeof window.__safeLocationReplace !== 'function') {
      const replace = window.location.replace.bind(window.location);
      window.__safeLocationReplace = (url) => replace(url);
    }
  } catch (_) {}
})();

function markBootstrapReady() {
  if (typeof window === 'undefined') return;

  try {
    window.__gpAppMounted = true;
    if (window.__gpBootTimer) {
      clearTimeout(window.__gpBootTimer);
    }
    sessionStorage.removeItem('gp_boot_recovery_attempts');

    const url = new URL(window.location.href);
    if (url.searchParams.has('__boot_reload')) {
      url.searchParams.delete('__boot_reload');
      const cleanUrl = `${url.pathname}${url.search}${url.hash}`;
      window.history.replaceState({}, document.title, cleanUrl);
    }
  } catch (_) {}
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <AppErrorBoundary>
    <App />
  </AppErrorBoundary>
)

if (typeof window !== 'undefined') {
  queueMicrotask(markBootstrapReady);
  setTimeout(markBootstrapReady, 0);
  requestAnimationFrame(markBootstrapReady);
}
