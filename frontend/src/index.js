import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Performance reporting is disabled for the demo frontend. If you later want to
// enable web-vitals reporting, restore the import above and call reportWebVitals(fn).
