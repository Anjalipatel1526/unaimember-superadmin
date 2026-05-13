import React, { useEffect, useState } from 'react';
import { TrendingUp, Clock, AlertCircle, CheckCircle2, Download, Search, MoreHorizontal, Mail } from 'lucide-react';
import { getInvoices, getBillingStats, updateInvoiceStatus } from '../../services/billing';

function KPICard({ icon: Icon, title, value, sub, iconColor }) {
  return (
    <div className="card-hover flex flex-col gap-4">
      <div className="w-11 h-11 rounded-xl bg-[#EEF0FF] flex items-center justify-center">
        <Icon size={20} style={{ color: iconColor || '#4c58fa' }} />
      </div>
      <div>
        <p className="text-sm text-[#6B7280] font-medium">{title}</p>
        <p className="text-2xl font-bold text-[#111827] tracking-tight mt-1">{value}</p>
        {sub && <p className="text-xs text-[#6B7280] mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

const fmt = n => n >= 1000000
  ? `$${(n / 1000000).toFixed(2)}M`
  : n >= 1000
    ? `$${(n / 1000).toFixed(1)}k`
    : `$${n}`;

export default function Billing() {
  const [invoices, setInvoices] = useState([]);
  const [stats,    setStats]    = useState(null);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState(null);
  const [search,   setSearch]   = useState('');

  useEffect(() => {
    async function load() {
      try {
        const [invs, s] = await Promise.all([getInvoices(), getBillingStats()]);
        setInvoices(invs);
        setStats(s);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const filtered = invoices.filter(inv =>
    inv.invoice_number.toLowerCase().includes(search.toLowerCase()) ||
    inv.companies?.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleRemind = async (inv) => {
    alert(`Reminder sent to ${inv.companies?.name ?? 'client'} for ${inv.invoice_number}`);
  };

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-bold text-[#111827] tracking-tight">Revenue & Billing</h1>
        <p className="text-sm text-[#6B7280] mt-1">Track financial performance and manage client invoices.</p>
      </div>

      {error && <div className="bg-red-50 border border-red-200 rounded-2xl px-5 py-3 text-sm text-red-700">⚠ {error}</div>}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {loading ? (
          [...Array(4)].map((_, i) => <div key={i} className="card h-32 animate-pulse bg-[#F9FAFB]" />)
        ) : (
          <>
            <KPICard icon={TrendingUp}   title="Total Revenue"       value={stats ? fmt(stats.totalRevenue) : '—'} sub="All paid invoices" />
            <KPICard icon={CheckCircle2} title="Monthly Recurring"   value={stats ? fmt(stats.mrr)          : '—'} sub="MRR this month" />
            <KPICard icon={Clock}        title="Pending Invoices"    value={stats ? stats.pending            : '—'} sub="Awaiting payment" />
            <KPICard icon={AlertCircle}  title="Failed Transactions" value={stats ? stats.failed             : '—'} sub="Requires attention" iconColor="#ef4444" />
          </>
        )}
      </div>

      <div className="card p-0 overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 px-6 py-4 border-b border-[#E5E7EB]">
          <div className="relative flex-1 max-w-sm">
            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6B7280]" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search invoices…" className="input pl-9 h-10" />
          </div>
          <button className="btn-secondary ml-auto"><Download size={14} />Download Reports</button>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-6 space-y-3">{[...Array(4)].map((_, i) => <div key={i} className="h-12 bg-[#F9FAFB] rounded-xl animate-pulse" />)}</div>
          ) : (
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-[#E5E7EB] bg-[#F9FAFB]">
                  {['Invoice ID', 'Company', 'Amount', 'Due Date', 'Status', ''].map(h => (
                    <th key={h} className="px-6 py-3 text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(inv => (
                  <tr key={inv.id} className="table-row border-b border-[#E5E7EB] last:border-0">
                    <td className="px-6 py-4 text-sm font-mono font-semibold text-[#4c58fa]">{inv.invoice_number}</td>
                    <td className="px-6 py-4 text-sm font-semibold text-[#111827]">{inv.companies?.name ?? '—'}</td>
                    <td className="px-6 py-4 text-sm font-bold text-[#111827]">${Number(inv.amount).toLocaleString()}</td>
                    <td className="px-6 py-4 text-sm text-[#6B7280] whitespace-nowrap">{inv.due_date}</td>
                    <td className="px-6 py-4">
                      {inv.status === 'Paid'    && <span className="badge-green">Paid</span>}
                      {inv.status === 'Pending' && <span className="badge-orange">Pending</span>}
                      {inv.status === 'Failed'  && <span className="badge-red">Failed</span>}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 justify-end">
                        {inv.status !== 'Paid' && (
                          <button onClick={() => handleRemind(inv)} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#EEF0FF] text-[#4c58fa] text-xs font-semibold hover:bg-[#E8EAFD] transition-colors">
                            <Mail size={12} />Send Reminder
                          </button>
                        )}
                        <button className="btn-ghost w-8 h-8 flex items-center justify-center p-0 text-[#6B7280]">
                          <MoreHorizontal size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && !loading && (
                  <tr><td colSpan={6} className="text-center py-16 text-sm text-[#6B7280]">No invoices found.</td></tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
