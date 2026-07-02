import React from 'react';
import { Routes, Route } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import CompanyPortal from './company/CompanyPortal';
import Dashboard    from './super-admin/dashboard/Dashboard';
import Companies    from './super-admin/companies/Companies';
import CompanyDetail from './super-admin/companies/CompanyDetail';
import Billing      from './super-admin/billing/Billing';
import Support      from './super-admin/support/Support';
import Features     from './super-admin/features/Features';
import Monitoring   from './super-admin/monitoring/Monitoring';
import Permissions  from './super-admin/permissions/Permissions';
import AuditLogs    from './super-admin/logs/AuditLogs';
import Settings     from './super-admin/settings/Settings';

import HRPortal      from './hr/HRPortal';
import SSSPortal     from './sss/SSSPortal';
import SSSEmployeeDashboard from './sss/SSSEmployeeDashboard';
import SSSManagerDashboard  from './sss/SSSManagerDashboard';

/* ── Analytics ─────────────────────────────────────────────── */
function Analytics() {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Employee Analytics</h1>
        <p className="text-sm text-gray-500 mt-1">Aggregated workforce insights across all client organizations.</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {['Total Employees', 'Active Employees', 'Employees on Leave', 'Attrition Rate'].map(l => (
          <div key={l} className="card p-6 rounded-2xl bg-white border border-gray-100 shadow-sm">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{l}</p>
            <p className="text-3xl font-bold text-gray-900 mt-2 tracking-tight">—</p>
          </div>
        ))}
      </div>
      <div className="card flex items-center justify-center h-80 rounded-2xl border-2 border-dashed border-gray-100 bg-white">
        <p className="text-sm text-gray-400 font-medium italic">Data visualization modules pending connection...</p>
      </div>
    </div>
  );
}

/* ── Notifications ──────────────────────────────────────────── */
function Notifications() {
  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">System Notifications</h1>
          <p className="text-sm text-gray-500 mt-1">Critical alerts and platform-wide events.</p>
        </div>
        <button className="btn-secondary text-xs">Mark all as read</button>
      </div>
      <div className="py-20 text-center card bg-white rounded-2xl">
         <p className="text-sm text-gray-400">All caught up! No unread notifications.</p>
      </div>
    </div>
  );
}

/* ── App ─────────────────────────────────────────────────────── */
export default function App() {
  return (
    <Routes>
      {/* Main Admin Dashboard — Nested Routes with Layout */}
      <Route element={<MainLayout />}>
        <Route index                 element={<Dashboard />}    />
        <Route path="companies"         element={<Companies />}      />
        <Route path="companies/:id"      element={<CompanyDetail />}  />
        <Route path="/billing"       element={<Billing />}      />
        <Route path="/analytics"     element={<Analytics />}    />
        <Route path="/support"       element={<Support />}      />
        <Route path="/features"      element={<Features />}     />
        <Route path="/monitoring"    element={<Monitoring />}   />
        <Route path="/permissions"   element={<Permissions />}  />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/logs"          element={<AuditLogs />}    />
        <Route path="/settings"      element={<Settings />}     />
      </Route>

      <Route path="/admin" element={<CompanyPortal />} />
      <Route path="/hr" element={<HRPortal />} />
      <Route path="/sss/admin" element={<SSSPortal />} />
      <Route path="/sss/Employee Details" element={<SSSEmployeeDashboard />} />
      <Route path="/sss/Employee details" element={<SSSEmployeeDashboard />} />
      <Route path="/sss/Employee Detail" element={<SSSEmployeeDashboard />} />
      <Route path="/sss/Employee detail" element={<SSSEmployeeDashboard />} />
      <Route path="/sss/EmployeeDetail" element={<SSSEmployeeDashboard />} />
      <Route path="/sss/Employeedetail" element={<SSSEmployeeDashboard />} />

      <Route path="/sss/manager" element={<SSSManagerDashboard />} />

      <Route path="*" element={<div className="p-20 text-center text-gray-500 font-bold">404 - NOT FOUND</div>} />
    </Routes>
  );
}
