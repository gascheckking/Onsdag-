import React from 'react';

import ReactDOM from 'react-dom/client';

// Importera den nya huvudkomponenten

import ProjectDashboard from './ProjectDashboard.jsx';

import './index.css'; // Antar att Tailwind CSS importeras här



ReactDOM.createRoot(document.getElementById('root')).render(

  <React.StrictMode>

    <ProjectDashboard />

  </React.StrictMode>,

);
