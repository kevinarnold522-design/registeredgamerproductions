import React from 'react'
import ReactDOM from 'react-dom/client'
import App from '@/App.jsx'
import '@/index.css'

// If Base44 returns an access_token in the URL (after OAuth login),
// persist it to localStorage and reload cleanly so the SDK boots authenticated.
(function handleTokenFromUrl() {
  if (typeof window === 'undefined') return;
  const params = new URLSearchParams(window.location.search);
  const token = params.get('access_token');
  if (!token) return;

  try {
    localStorage.setItem('base44_access_token', token);
    localStorage.setItem('base44_token', token);
  } catch (_) {}

  params.delete('access_token');
  const cleanUrl = window.location.pathname + (params.toString() ? `?${params.toString()}` : '') + window.location.hash;
  window.history.replaceState({}, document.title, cleanUrl);
  window.location.replace(cleanUrl);
})();

ReactDOM.createRoot(document.getElementById('root')).render(
  <App />
)