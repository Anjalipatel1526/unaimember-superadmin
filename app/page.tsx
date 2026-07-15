"use client";

import React, { useState } from 'react';
import MainLayout from '@/components/layouts/MainLayout';
import DashboardView from '@/components/views/DashboardView';
import Companies from '@/components/super-admin/companies/Companies';
import CompanyDetail from '@/components/super-admin/companies/CompanyDetail';
import Billing from '@/components/super-admin/billing/Billing';
import Support from '@/components/super-admin/support/Support';
import Features from '@/components/super-admin/features/Features';
import Monitoring from '@/components/super-admin/monitoring/Monitoring';
import Permissions from '@/components/super-admin/permissions/Permissions';
import AuditLogs from '@/components/super-admin/logs/AuditLogs';
import Settings from '@/components/super-admin/settings/Settings';
import Hub from '@/components/super-admin/hub/Hub';

/* ── Analytics ─────────────────────────────────────────────── */
function AnalyticsView() {
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
function NotificationsView() {
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

export default function Home() {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(null);

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const tab = params.get('tab');
      if (tab) {
        setActiveTab(tab);
      }
    }
  }, []);

  // Custom navigate function to transition between tabs and detail views
  const navigate = (path: string) => {
    if (path.startsWith('/companies/')) {
      const id = path.replace('/companies/', '');
      setSelectedCompanyId(id);
      setActiveTab('company-detail');
    } else if (path === '/companies') {
      setSelectedCompanyId(null);
      setActiveTab('companies');
    } else if (path === '/') {
      setActiveTab('dashboard');
    }
  };

  const renderActiveView = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardView />;
      case 'companies':
        return <Companies navigate={navigate} />;
      case 'company-detail':
        return selectedCompanyId ? (
          <CompanyDetail companyId={selectedCompanyId} navigate={navigate} />
        ) : (
          <Companies navigate={navigate} />
        );
      case 'billing':
        return <Billing />;
      case 'analytics':
        return <AnalyticsView />;
      case 'support':
        return <Support />;
      case 'features':
        return <Features />;
      case 'monitoring':
        return <Monitoring />;
      case 'permissions':
        return <Permissions />;
      case 'notifications':
        return <NotificationsView />;
      case 'logs':
        return <AuditLogs />;
      case 'settings':
        return <Settings />;
      default:
        return <DashboardView />;
    }
  };

  return (
    <MainLayout activeTab={activeTab} setActiveTab={setActiveTab}>
      {renderActiveView()}
    </MainLayout>
  );
}
