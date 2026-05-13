import React, { useEffect, useState } from 'react';
import {
  Building2, CreditCard, TrendingUp, Users, Clock, UserPlus,
  ArrowUpRight, ArrowDownRight, MoreVertical
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar
} from 'recharts';
import { getCompanies, getCompanyStats } from '../../services/companies';
import { getBillingStats, getRevenueSnapshots } from '../../services/billing';
import { getActiveSubscriptionCount } from '../../services/subscriptions';

/* ── KPI Card ───────────────────────────────────────────────── */
function KPICard({ title, value, icon: Icon, trend, trendValue, loading }) {
  return (
    <div className="card-hover flex flex-col gap-5">
      <div className="flex items-start justify-between">
        <div className="w-11 h-11 rounded-xl bg-[#EEF0FF] flex items-center justify-center">
          <Icon size={20} className="text-[#4c58fa]" />
        </div>
        {trendValue !== null && (
          <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full ${
            trend === 'up' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600'
          }`}>
            {trend === 'up' ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
            {trendValue}%
          </span>
        )}
      </div>
      <div>
        <p className="text-sm text-[#6B7280] font-medium">{title}</p>
        {loading
          ? <div className="h-8 w-24 bg-[#E5E7EB] rounded-lg animate-pulse mt-1" />
          : <p className="text-3xl font-bold text-[#111827] mt-1 tracking-tight">{value}</p>
        }
      </div>
    </div>
  );
}

const tooltipStyle = {
  backgroundColor: '#fff',
  border: '1px solid #E5E7EB',
  borderRadius: '12px',
  boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
  fontSize: '12px',
};

function EmptyState({ label }) {
  return (
    <div className="flex items-center justify-center h-full text-sm text-[#6B7280] italic">
      {label}
    </div>
  );
}

/* ── Dashboard ──────────────────────────────────────────────── */
export default function Dashboard() {
  const [stats,      setStats]      = useState(null);
  const [billing,    setBilling]    = useState(null);
  const [subs,       setSubs]       = useState(0);
  const [companies,  setCompanies]  = useState([]);
  const [chartData,  setChartData]  = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState(null);

  useEffect(() => {
    async function load() {
      try {
        const [compStats, billingStats, activeSubs, recentCos, snapshots] = await Promise.all([
          getCompanyStats(),
          getBillingStats(),
          getActiveSubscriptionCount(),
          getCompanies(),
          getRevenueSnapshots(),
        ]);

        setStats(compStats);
        setBilling(billingStats);
        setSubs(activeSubs);
        setCompanies(recentCos.slice(0, 5));
        setChartData(
          snapshots.map(s => ({
            name:      new Date(s.month).toLocaleString('default', { month: 'short' }),
            revenue:   +(s.mrr / 1000).toFixed(1),
            companies: s.new_companies,
          }))
        );
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const fmt = (n) => (n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n));

  const kpis = [
    { title: 'Total Companies',      value: stats   ? stats.total            : '—', icon: Building2,  trend: 'up',   trendValue: null },
    { title: 'Active Subscriptions', value: subs    ? subs                   : '—', icon: CreditCard, trend: 'up',   trendValue: null },
    { title: 'Monthly Revenue',      value: billing ? `$${fmt(billing.mrr)}` : '—', icon: TrendingUp, trend: 'up',   trendValue: null },
    { title: 'Total Employees',      value: stats   ? fmt(stats.totalEmployees) : '—', icon: Users,   trend: 'up',   trendValue: null },
    { title: 'Pending Renewals',     value: billing ? billing.pending        : '—', icon: Clock,      trend: 'down', trendValue: null },
    { title: 'Trial Accounts',       value: stats   ? stats.trials           : '—', icon: UserPlus,   trend: 'up',   trendValue: null },
  ];

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-bold text-[#111827] tracking-tight">Dashboard Overview</h1>
        <p className="text-sm text-[#6B7280] mt-1">Welcome back, Alex. Here's what's happening on the platform.</p>
      </div>

      {error && (
        <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-2xl px-5 py-3">
          <span className="text-sm text-red-700">⚠ Supabase error: {error}. Check your .env credentials.</span>
        </div>
      )}

      {/* KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
        {kpis.map((k, i) => <KPICard key={i} {...k} loading={loading} />)}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="section-title">Revenue Analytics</h2>
              <p className="section-subtitle">Monthly recurring revenue trend</p>
            </div>
          </div>
          <div className="h-64">
            {loading ? (
              <div className="h-full bg-[#F9FAFB] rounded-xl animate-pulse" />
            ) : chartData.length === 0 ? (
              <EmptyState label="No revenue snapshots yet" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#3d45e8" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="#3d45e8" stopOpacity={0}    />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F0EBE5" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 11 }} dy={8} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 11 }} dx={-8} tickFormatter={v => `$${v}k`} />
                  <Tooltip contentStyle={tooltipStyle} formatter={v => [`$${v}k`, 'Revenue']} />
                  <Area type="monotone" dataKey="revenue" stroke="#4c58fa" strokeWidth={2.5} fill="url(#rev)" dot={false} activeDot={{ r: 5, fill: '#4c58fa' }} />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="section-title">Company Growth</h2>
              <p className="section-subtitle">New registrations per month</p>
            </div>
          </div>
          <div className="h-64">
            {loading ? (
              <div className="h-full bg-[#F9FAFB] rounded-xl animate-pulse" />
            ) : chartData.length === 0 ? (
              <EmptyState label="No growth data yet" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F0EBE5" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 11 }} dy={8} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 11 }} dx={-8} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Bar dataKey="companies" fill="#3d45e8" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* Recent Clients Table */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="section-title">Recent Client Registrations</h2>
            <p className="section-subtitle">Latest companies onboarded to the platform</p>
          </div>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-14 bg-[#F9FAFB] rounded-xl animate-pulse" />
            ))}
          </div>
        ) : companies.length === 0 ? (
          <div className="text-center py-16 text-sm text-[#6B7280]">No companies registered yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-[#E5E7EB]">
                  {['Company', 'Plan', 'Employees', 'Status', 'Date', ''].map(h => (
                    <th key={h} className="pb-3 text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wider pr-4 last:pr-0">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {companies.map(c => {
                  const planName = c.subscription_plans?.name ?? '—';
                  return (
                    <tr key={c.id} className="table-row border-b border-[#E5E7EB] last:border-0">
                      <td className="py-4 pr-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg bg-[#E8EAFD] flex items-center justify-center shrink-0">
                            <span className="text-sm font-bold text-[#4c58fa]">{c.name[0]}</span>
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-[#111827]">{c.name}</p>
                            <p className="text-xs text-[#6B7280]">{c.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 pr-4"><span className="badge-sand">{planName}</span></td>
                      <td className="py-4 pr-4">
                        <div className="flex flex-col gap-1.5 w-28">
                          <div className="flex justify-between text-[11px] text-[#6B7280] font-medium">
                            <span>{c.employee_count}</span><span>{c.employee_limit}</span>
                          </div>
                          <div className="h-1.5 bg-[#E5E7EB] rounded-full overflow-hidden">
                            <div className="h-full bg-[#3d45e8] rounded-full" style={{ width: `${Math.min((c.employee_count / c.employee_limit) * 100, 100)}%` }} />
                          </div>
                        </div>
                      </td>
                      <td className="py-4 pr-4">
                        {c.status === 'Active'    && <span className="badge-green">Active</span>}
                        {c.status === 'Trial'     && <span className="badge-orange">Trial</span>}
                        {c.status === 'Suspended' && <span className="badge-red">Suspended</span>}
                      </td>
                      <td className="py-4 pr-4 text-sm text-[#6B7280]">{new Date(c.created_at).toLocaleDateString()}</td>
                      <td className="py-4">
                        <button className="btn-ghost w-8 h-8 flex items-center justify-center p-0 text-[#6B7280]">
                          <MoreVertical size={16} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
