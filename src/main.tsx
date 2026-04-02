// src/index.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import LaunchGate from './LaunchGate';
import './styles/a11y.css';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <LaunchGate>
      <App />
    </LaunchGate>
  </React.StrictMode>
);
