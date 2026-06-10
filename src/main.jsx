import React from 'react'
import ReactDOM from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import App from './App.jsx'
import './index.css'

// Redirect /admin to /#/admin for HashRouter support
if (window.location.pathname === '/admin' || window.location.pathname === '/admin/') {
  window.location.replace(window.location.origin + '/#/admin');
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* HashRouter is required for Electron (file:// protocol doesn't support history API) */}
    <HashRouter>
      <App />
    </HashRouter>
  </React.StrictMode>,
)
