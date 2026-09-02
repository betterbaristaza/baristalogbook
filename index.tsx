import React from 'react';
import ReactDOM from 'react-dom/client';
import { registerSW } from 'virtual:pwa-register';

import App from './App';
import './index.css';

import { AuthProvider } from './context/AuthContext';
import { EntitlementProvider } from './context/EntitlementContext';

// Register service worker for PWA.
registerSW({ immediate: true });

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error(
    'Could not find root element to mount to'
  );
}

const root = ReactDOM.createRoot(rootElement);

root.render(
  <React.StrictMode>
    <AuthProvider>
      <EntitlementProvider>
        <App />
      </EntitlementProvider>
    </AuthProvider>
  </React.StrictMode>
);