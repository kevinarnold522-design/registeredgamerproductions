import React, { Suspense } from 'react'
import ReactDOM from 'react-dom/client'
import AppErrorBoundary from '@/components/system/AppErrorBoundary'
import lazyWithRetry from '@/lib/lazyWithRetry'
import '@/index.css'

const App = lazyWithRetry(() => import('@/App.jsx'))

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

function BootFallback() {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#030712',
        color: '#ffffff',
        padding: '24px',
        textAlign: 'center',
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      }}
    >
      <div>
        <p style={{ margin: 0, fontSize: '18px', fontWeight: 800 }}>Loading GAMER.PRODUCTIONS...</p>
        <p style={{ marginTop: '10px', opacity: 0.75, fontSize: '14px' }}>
          Preparing the live gaming hub.
        </p>
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <AppErrorBoundary>
    <Suspense fallback={<BootFallback />}>
      <App />
    </Suspense>
  </AppErrorBoundary>
)
