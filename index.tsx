
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles.css';

const isProd = Boolean((import.meta as any).env?.PROD);

// PWA: cache shell + offline fallback. Disable in dev to avoid stale local caches blanking the app.
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    if (!isProd) {
      navigator.serviceWorker.getRegistrations()
        .then((registrations) => Promise.all(registrations.map((registration) => registration.unregister())))
        .then((results) => {
          if (results.some(Boolean)) {
            console.log('Dev mode: unregistered existing service worker(s).');
          }
        })
        .catch((registrationError) => {
          console.warn('Dev mode service worker cleanup failed:', registrationError);
        });
      return;
    }

    navigator.serviceWorker
      .register('/service-worker.js', { scope: '/' })
      .then((registration) => {
        console.log('SW registered:', registration.scope);
      })
      .catch((registrationError) => {
        console.warn('SW registration failed:', registrationError);
      });
  });
}

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
