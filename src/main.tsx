import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
// IMPORTEN NEDAN FÖRBEREDER TAILWIND STYLING FÖR HELA APPEN
import './index.css'; 

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
