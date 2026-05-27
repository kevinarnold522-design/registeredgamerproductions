import React from 'react'
import ReactDOM from 'react-dom/client'
import App from '@/App.jsx'
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

  // Clean the URL and reload without the token in the address bar
  params.delete('access_token');
  const cleanUrl =
    window.location.pathname +
    (params.toString() ? `?${params.toString()}` : '') +
    window.location.hash;

  window.history.replaceState({}, document.title, cleanUrl);
  // Force a clean reload so the SDK picks up the token from localStorage
  window.location.replace(cleanUrl);
})();

ReactDOM.createRoot(document.getElementById('root')).render(
  <App />
)