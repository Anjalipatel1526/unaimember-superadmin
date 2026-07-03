import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, HashRouter } from 'react-router-dom'
import App from './App.jsx'
import './index.css'

// Check if running inside Electron or via file:// protocol
const isElectron = window.navigator.userAgent.toLowerCase().includes('electron') || window.location.protocol === 'file:';

// Redirect to hash equivalents ONLY if running under Electron
if (isElectron) {
  if (window.location.pathname === '/admin' || window.location.pathname === '/admin/') {
    window.location.replace(window.location.origin + '/#/admin');
  }
  if (window.location.pathname === '/sss/admin' || window.location.pathname === '/sss/admin/') {
    window.location.replace(window.location.origin + '/#/sss/admin');
  }

  // Redirect employee detail variations to their hash route counterpart
  const pathLower = decodeURIComponent(window.location.pathname).toLowerCase();
  if (pathLower === '/sss/employee detail' || pathLower === '/sss/employee detail/' ||
      pathLower === '/sss/employee details' || pathLower === '/sss/employee details/' ||
      pathLower === '/sss/employeedetail' || pathLower === '/sss/employeedetail/') {
    window.location.replace(window.location.origin + '/#/sss/Employee Detail');
  }
}

const Router = isElectron ? HashRouter : BrowserRouter;

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Router>
      <App />
    </Router>
  </React.StrictMode>,
)

