import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const registerServiceWorker = () => {
  // Use an absolute URL for the service worker to avoid cross-origin issues.
  const swUrl = `${location.origin}/service-worker.js`;
  navigator.serviceWorker.register(swUrl).then(registration => {
    console.log('ServiceWorker registration successful with scope: ', registration.scope);
  }).catch(error => {
    console.log('ServiceWorker registration failed: ', error);
  });
};

if ('serviceWorker' in navigator) {
  // Wait for the page to be fully loaded before registering the service worker.
  // This avoids potential race conditions.
  if (document.readyState === 'complete') {
    registerServiceWorker();
  } else {
    window.addEventListener('load', registerServiceWorker);
  }
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
