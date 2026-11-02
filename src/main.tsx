import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from '@/app/App';
import { Providers } from '@/app/providers';
import '@/styles/index.css';

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Root element #root not found in document.');
}

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <Providers>
      <App />
    </Providers>
  </React.StrictMode>
);
