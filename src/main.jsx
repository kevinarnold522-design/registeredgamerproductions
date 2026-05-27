import React from 'react'
import ReactDOM from 'react-dom/client'
import App from '@/App.jsx'
import '@/index.css'

(function handleAuthFlow() {
  if (typeof window === 'undefined') return;
  const url = new URL(window.location.href);
  const token = url.searchParams.get('access_token');
  const isVercelRedirect = url.searchParams.get('vercel_redirect') === '1';

  // Case 1: We're on base44.app after OAuth login and need to forward to Vercel.
  // The token will be in localStorage after Base44 sets it on this domain.
  if (isVercelRedirect) {
    // Give the SDK a moment to store the token, then grab it and send to Vercel
    setTimeout(() => {
      const storedToken =
        localStorage.getItem('base44_access_token') ||
        localStorage.getItem('base44_token') ||
        token;
      if (storedToken) {
        window.location.replace(`https://gamerproductions.vercel.app/?access_token=${encodeURIComponent(storedToken)}`);
      } else {
        // No token found — just send them to Vercel homepage
        window.location.replace('https://gamerproductions.vercel.app/');
      }
    }, 800);
    return;
  }

  // Case 2: We're on Vercel and received a token from the base44.app redirect.
  if (token) {
    try {
      localStorage.setItem('base44_access_token', token);
      localStorage.setItem('base44_token', token);
    } catch (_) {}

    // Strip token from URL and hard reload so SDK boots with the token
    url.searchParams.delete('access_token');
    const cleanUrl = url.pathname + (url.search || '') + (url.hash || '');
    window.history.replaceState({}, document.title, cleanUrl);
    window.location.replace(cleanUrl);
    return;
  }
})();

ReactDOM.createRoot(document.getElementById('root')).render(
  <App />
)