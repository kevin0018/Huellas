import { installClientErrorReporting } from './shared/observability/clientReports';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.tsx';
import './index.css';

const disposeErrorReporting = installClientErrorReporting();
if (import.meta.hot) import.meta.hot.dispose(disposeErrorReporting);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);