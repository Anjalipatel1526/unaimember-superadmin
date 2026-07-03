import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, HashRouter } from 'react-router-dom'
import App from './App.jsx'
import './index.css'

// Check if running inside Electron or via file:// protocol
const isElectron = window.navigator.userAgent.toLowerCase().includes('electron') || window.location.protocol === 'file:';

// Redirect /admin to /#/admin for HashRouter support under Electron
if (isElectron && (window.location.pathname === '/admin' || window.location.pathname === '/admin/')) {
  window.location.replace(window.location.origin + '/#/admin');
}

const Router = isElectron ? HashRouter : BrowserRouter;

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Router>
      <App />
    </Router>
  </React.StrictMode>,
)

