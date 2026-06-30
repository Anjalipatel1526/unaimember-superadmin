import React from 'react'
import ReactDOM from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import App from './App.jsx'
import './index.css'

// Redirect /admin and /sss/admin to their hash equivalents for HashRouter support
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

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* HashRouter is required for Electron (file:// protocol doesn't support history API) */}
    <HashRouter>
      <App />
    </HashRouter>
  </React.StrictMode>,
)
