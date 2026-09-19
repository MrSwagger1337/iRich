import React from 'react';
import { createRoot } from 'react-dom/client';
import '@irich/react/styles.css';
import '@irich/editorial/styles.css';
import App from './App';
import './index.css';

const rootElement = document.getElementById('root');
if (rootElement) {
  createRoot(rootElement).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  );
}
