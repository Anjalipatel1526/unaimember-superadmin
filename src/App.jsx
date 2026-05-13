import React from 'react';
import { Routes, Route } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import Dashboard    from './super-admin/dashboard/Dashboard';
import Companies    from './super-admin/companies/Companies';
import Calendar     from './super-admin/calendar/Calendar';
import Billing      from './super-admin/billing/Billing';
import Support      from './super-admin/support/Support';
import Features     from './super-admin/features/Features';
import Monitoring   from './super-admin/monitoring/Monitoring';
import Permissions  from './super-admin/permissions/Permissions';
import AuditLogs    from './super-admin/logs/AuditLogs';
import Settings     from './super-admin/settings/Settings';

/* ── Analytics (inline) ─────────────────────────────────────── */
function Analytics() {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-bold text-[#111827] tracking-tight">Employee Analytics</h1>
        <p className="text-sm text-[#6B7280] mt-1">Aggregated workforce insights across all client organizations.</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {[
          { label: 'Total Employees',    value: '—' },
          { label: 'Active Employees',   value: '—' },
          { label: 'Employees on Leave', value: '—' },
          { label: 'Attrition Rate',     value: '—' },
        ].map(({ label, value }) => (
          <div key={label} className="card-hover">
            <p className="text-xs font-semibold text-[#6B7280] uppercase tracking-wider">{label}</p>
            <p className="text-3xl font-bold text-[#111827] tracking-tight mt-2">{value}</p>
          </div>
        ))}
      </div>
      <div className="card flex items-center justify-center h-80 border-2 border-dashed border-[#E5E7EB] bg-[#F9FAFB]">
        <p className="text-sm text-[#6B7280] italic">Department & Attendance Charts — Connect data source to render</p>
      </div>
    </div>
  );
}

/* ── Notifications (inline) ─────────────────────────────────── */
const NOTIFS = [];

function Notifications() {
  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#111827] tracking-tight">Notifications</h1>
          <p className="text-sm text-[#6B7280] mt-1">Critical alerts and system events across the platform.</p>
        </div>
        <button className="btn-secondary text-sm">Mark all as read</button>
      </div>

      <div className="flex flex-col gap-3">
        {NOTIFS.map((n, i) => (
          <div key={i} className="card py-4 flex items-center justify-between gap-4 group cursor-pointer hover:border-[#3d45e8] transition-colors">
            <div className="flex items-center gap-4">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-xs font-bold ${n.color}`}>
                {n.type[0]}
              </div>
              <div>
                <p className="text-sm font-semibold text-[#111827]">{n.title}</p>
                <p className="text-xs text-[#6B7280] mt-0.5">{n.company} · {n.date}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${n.color}`}>{n.type.toUpperCase()}</span>
              <button className="text-xs font-medium text-[#4c58fa] opacity-0 group-hover:opacity-100 transition-opacity">
                Dismiss
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── App ─────────────────────────────────────────────────────── */
export default function App() {
  return (
    <MainLayout>
      <Routes>
        <Route path="/"              element={<Dashboard />}    />
        <Route path="/companies"     element={<Companies />}    />
        <Route path="/calendar"      element={<Calendar />}     />
        <Route path="/billing"       element={<Billing />}      />
        <Route path="/analytics"     element={<Analytics />}    />
        <Route path="/support"       element={<Support />}      />
        <Route path="/features"      element={<Features />}     />
        <Route path="/monitoring"    element={<Monitoring />}   />
        <Route path="/permissions"   element={<Permissions />}  />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/logs"          element={<AuditLogs />}    />
        <Route path="/settings"      element={<Settings />}     />
      </Routes>
    </MainLayout>
  );
}
