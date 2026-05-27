import React from 'react'
import ReactDOM from 'react-dom/client'
import App from '@/App.jsx'
import '@/index.css'

// Handle access_token in URL (e.g. from social OAuth providers like Google/Microsoft).
// Store it, strip the URL, and reload so the SDK re-initializes with the token.
(function handleTokenReturn() {
  if (typeof window === 'undefined') return;
  const url = new URL(window.location.href);
  const token = url.searchParams.get('access_token');
  if (token) {
    localStorage.setItem('base44_access_token', token);
    url.searchParams.delete('access_token');
    window.history.replaceState({}, document.title, url.pathname + (url.search || '') + (url.hash || ''));
    window.location.reload();
    return;
  }
})();

ReactDOM.createRoot(document.getElementById('root')).render(
  <App />
)