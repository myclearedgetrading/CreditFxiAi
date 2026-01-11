
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// NOTE: Service Worker registration has been disabled to prevent "invalid state" errors 
// in preview environments. To enable PWA features later, uncomment this block when 
// running in a standard HTTPS environment.
/*
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js')
      .then(registration => {
        console.log('SW registered: ', registration);
      })
      .catch(registrationError => console.log('SW registration failed: ', registrationError));
  });
}
*/

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
