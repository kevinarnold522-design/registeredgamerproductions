import React from 'react'
import ReactDOM from 'react-dom/client'
import App from '@/App.jsx'
import '@/index.css'

// PERMANENT AUTH FIX:
// When Base44 redirects back after magic link click, the URL contains ?access_token=xxx
// We must store it and do a hard reload so the SDK re-initializes with the fresh token.
// This runs synchronously before React mounts — no race conditions.
(function handleMagicLinkReturn() {
  if (typeof window === 'undefined') return;
  const url = new URL(window.location.href);
  const token = url.searchParams.get('access_token');
  if (token) {
    // Store token in localStorage the same way app-params.js expects it
    localStorage.setItem('base44_access_token', token);
    // Strip the token from the URL cleanly
    url.searchParams.delete('access_token');
    const cleanUrl = url.pathname + (url.search || '') + (url.hash || '');
    // Replace state first, then reload so the clean URL is in history
    window.history.replaceState({}, document.title, cleanUrl);
    // Force a full reload so the SDK client re-initializes with the stored token
    window.location.reload();
    return; // Stop — page will reload and re-run this block (token gone from URL, no loop)
  }
})();

ReactDOM.createRoot(document.getElementById('root')).render(
  <App />
)