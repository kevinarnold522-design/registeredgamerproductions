import React from 'react'
import ReactDOM from 'react-dom/client'
import App from '@/App.jsx'
import '@/index.css'

// Handle access_token returned in URL after OAuth login (e.g. Google/Microsoft via Base44).
// app-params.js already reads & stores it via getAppParamValue("access_token", { removeFromUrl: true }).
// We just need to ensure the page does a hard reload ONCE so the SDK re-initializes with the stored token.
(function handleTokenReturn() {
  if (typeof window === 'undefined') return;
  const url = new URL(window.location.href);
  const token = url.searchParams.get('access_token');
  if (!token) return;

  // Store under BOTH keys the SDK may check
  try {
    localStorage.setItem('base44_access_token', token);
    localStorage.setItem('base44_token', token);
  } catch (_) {}

  // Clean the token from URL
  url.searchParams.delete('access_token');
  const cleanUrl = url.pathname + (url.search || '') + (url.hash || '');
  window.history.replaceState({}, document.title, cleanUrl);

  // Hard reload so the SDK boots fresh with the stored token
  window.location.replace(cleanUrl);
})();

ReactDOM.createRoot(document.getElementById('root')).render(
  <App />
)