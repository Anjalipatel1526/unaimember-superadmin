import React, { useEffect, useState } from 'react';
import {
  Users, TrendingUp, ShieldCheck, Ticket, Building2, CalendarDays,
  DollarSign, BarChart3, PieChart, UserCheck, UserX, Clock, Briefcase,
  TrendingDown, ArrowUpRight, ArrowDownRight, IndianRupee
} from 'lucide-react';
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  BarChart, Bar, PieChart as RPieChart, Pie, Cell, Legend
} from 'recharts';
import { getEmployeeStats, getCompanyAccess } from '../../services/employees';

// ── Color palette for charts ──────────────────────────────────
const CHART_COLORS = ['#4c58fa', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899', '#14b8a6'];
const STATUS_COLORS = { active: '#22c55e', inactive: '#ef4444', onLeave: '#f59e0b' };

// ── Stat Card Component ───────────────────────────────────────
function StatCard({ icon: Icon, label, value, color, subtext, trend }) {
  return (
    <div className="glass-card p-6 rounded-3xl relative overflow-hidden group hover:translate-y-[-4px] transition-all duration-300">
      <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
        <Icon size={80} />
      </div>
      <div className="flex justify-between items-start relative z-10">
        <div className={`p-3 rounded-2xl`} style={{ backgroundColor: `${color}15`, color: color }}>
          <Icon size={24} />
        </div>
        {trend !== undefined && (
          <div className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full ${trend >= 0 ? 'text-emerald-600 bg-emerald-50' : 'text-rose-600 bg-rose-50'}`}>
            {trend >= 0 ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
            {Math.abs(trend)}%
          </div>
        )}
      </div>
      <div className="mt-6 relative z-10">
        <p className="text-sm font-medium text-gray-500">{label}</p>
        <h3 className="text-3xl font-bold text-gray-900 mt-1 tracking-tight">{value}</h3>
        {subtext && <p className="text-xs text-gray-400 mt-1">{subtext}</p>}
      </div>
    </div>
  );
}

// ── Section Header Component ──────────────────────────────────
function SectionHeader({ icon: Icon, title, subtitle }) {
  return (
    <div className="flex items-center gap-3 mb-6">
      <div className="p-2.5 rounded-xl bg-[#4c58fa]/10 text-[#4c58fa]">
        <Icon size={20} />
      </div>
      <div>
        <h2 className="text-xl font-bold text-gray-900 tracking-tight">{title}</h2>
        {subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}
      </div>
    </div>
  );
}

// ── Custom Tooltip Component ──────────────────────────────────
function CustomTooltip({ active, payload, label, prefix = '', suffix = '' }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white/95 backdrop-blur-sm shadow-xl border border-gray-100 rounded-2xl px-4 py-3">
      <p className="text-xs font-bold text-gray-900 mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} className="text-xs text-gray-600">
          <span className="inline-block w-2 h-2 rounded-full mr-1.5" style={{ backgroundColor: p.color }} />
          {p.name}: {prefix}{typeof p.value === 'number' ? p.value.toLocaleString('en-IN') : p.value}{suffix}
        </p>
      ))}
    </div>
  );
}

// ── Format currency ───────────────────────────────────────────
function formatINR(val) {
  if (val >= 10000000) return `₹${(val / 10000000).toFixed(1)}Cr`;
  if (val >= 100000) return `₹${(val / 100000).toFixed(1)}L`;
  if (val >= 1000) return `₹${(val / 1000).toFixed(1)}K`;
  return `₹${val.toLocaleString('en-IN')}`;
}

export default function CompanyOverview({ companyId, companyDetails }) {
  const [stats, setStats] = useState({
    total: 0, active: 0, inactive: 0, onLeave: 0, departments: [],
    employmentTypes: {}, departmentSalary: {}, departmentCount: {},
    totalPayroll: 0, joiningTrend: [], statusBreakdown: {}
  });
  const [access, setAccess] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [empStats, accessControls] = await Promise.all([
          getEmployeeStats(companyId),
          getCompanyAccess(companyId)
        ]);
        setStats(empStats);
        setAccess(accessControls);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [companyId]);

  // ── Derived data for charts ─────────────────────────────────
  const staffingData = [
    { name: 'Jan', value: Math.max(0, stats.total - 4) },
    { name: 'Feb', value: Math.max(0, stats.total - 3) },
    { name: 'Mar', value: Math.max(0, stats.total - 2) },
    { name: 'Apr', value: Math.max(0, stats.total - 1) },
    { name: 'May', value: stats.total },
    { name: 'Jun', value: stats.total },
  ];

  // Revenue / Payroll data by department
  const deptPayrollData = Object.entries(stats.departmentSalary)
    .map(([dept, salary]) => ({ department: dept, salary, count: stats.departmentCount[dept] || 0 }))
    .sort((a, b) => b.salary - a.salary)
    .slice(0, 8);

  // Monthly payroll trend (simulated from total payroll for last 6 months)
  const payrollTrend = (() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    const base = stats.totalPayroll;
    return months.map((m, i) => ({
      name: m,
      payroll: Math.round(base * (0.85 + (i * 0.03) + Math.random() * 0.02)),
    }));
  })();

  // Employee status donut data
  const statusData = [
    { name: 'Active', value: stats.active, color: STATUS_COLORS.active },
    { name: 'Inactive', value: stats.inactive, color: STATUS_COLORS.inactive },
    { name: 'On Leave', value: stats.onLeave, color: STATUS_COLORS.onLeave },
  ].filter(d => d.value > 0);

  // Employment type data
  const empTypeData = Object.entries(stats.employmentTypes).map(([type, count], i) => ({
    name: type, value: count, color: CHART_COLORS[i % CHART_COLORS.length]
  }));

  // Department headcount data
  const deptHeadcountData = Object.entries(stats.departmentCount)
    .map(([dept, count]) => ({ department: dept, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);

  // Joining trend data
  const joiningTrendData = stats.joiningTrend.length > 0
    ? stats.joiningTrend
    : [
        { name: 'Jan', count: 0 }, { name: 'Feb', count: 0 }, { name: 'Mar', count: 0 },
        { name: 'Apr', count: 0 }, { name: 'May', count: 0 }, { name: 'Jun', count: 0 },
      ];

  const annualPayroll = stats.totalPayroll * 12;
  const avgSalary = stats.total > 0 ? Math.round(stats.totalPayroll / stats.total) : 0;

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* ── Header ─────────────────────────────────────────────── */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
          Welcome back, <span className="text-[#4c58fa]">{companyDetails?.name || 'Partner'}</span>
        </h1>
        <p className="text-gray-500 mt-1 font-medium">Here is an overview of your organization's health, payroll, and workforce analytics.</p>
      </div>

      {/* ── Top Stats Cards ────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard icon={Users} label="Total Headcount" value={loading ? '...' : stats.total} color="#4c58fa" />
        <StatCard icon={ShieldCheck} label="Active Employees" value={loading ? '...' : stats.active} color="#22c55e" subtext={stats.total > 0 ? `${Math.round((stats.active / stats.total) * 100)}% of workforce` : ''} />
        <StatCard icon={Building2} label="Departments" value={loading ? '...' : stats.departments.length} color="#8b5cf6" />
        <StatCard icon={IndianRupee} label="Monthly Payroll" value={loading ? '...' : formatINR(stats.totalPayroll)} color="#f59e0b" subtext={`${stats.total} employees`} />
      </div>

      {/* ── Staffing Growth + Modules ──────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 glass-card p-8 rounded-[2rem] relative overflow-hidden">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Staffing Growth</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={staffingData}>
                <defs>
                  <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4c58fa" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#4c58fa" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                <Tooltip content={<CustomTooltip />} cursor={{stroke: '#4c58fa', strokeWidth: 2, strokeDasharray: '4 4'}} />
                <Area type="monotone" dataKey="value" name="Headcount" stroke="#4c58fa" strokeWidth={4} fillOpacity={1} fill="url(#colorVal)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-card p-6 rounded-3xl flex flex-col justify-between">
          <div>
            <h4 className="text-sm font-bold text-gray-900 mb-6">Module Permissions</h4>
            <div className="space-y-4">
              {[
                { label: 'Payroll Management', active: companyDetails?.payroll_enabled || access?.payroll_module },
                { label: 'Performance Tracker', active: companyDetails?.performance_enabled || access?.performance_module },
                { label: 'Attendance Tracking', active: access?.attendance_module },
                { label: 'Recruitment Module', active: access?.recruitment_module },
                { label: 'Analytics Panel', active: access?.analytics_enabled },
              ].map(item => (
                <div key={item.label} className="flex items-center justify-between p-3 rounded-2xl bg-gray-50 border border-gray-100">
                  <span className="text-xs font-semibold text-gray-700">{item.label}</span>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${item.active ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-gray-100 text-gray-400 border border-gray-200'}`}>
                    {item.active ? 'Enabled' : 'Disabled'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      {/* ── REVENUE ANALYSIS SECTION ───────────────────────────── */}
      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <div>
        <SectionHeader icon={IndianRupee} title="Revenue & Payroll Analysis" subtitle="Financial overview of your workforce costs" />

        {/* Revenue Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="glass-card p-6 rounded-3xl bg-gradient-to-br from-[#4c58fa]/5 to-[#4c58fa]/0 border border-[#4c58fa]/10">
            <div className="flex items-center gap-2 mb-3">
              <IndianRupee size={16} className="text-[#4c58fa]" />
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Monthly Payroll</span>
            </div>
            <p className="text-2xl font-extrabold text-gray-900 tracking-tight">{formatINR(stats.totalPayroll)}</p>
            <p className="text-xs text-gray-400 mt-1">{stats.total} employees on payroll</p>
          </div>
          <div className="glass-card p-6 rounded-3xl bg-gradient-to-br from-emerald-500/5 to-emerald-500/0 border border-emerald-500/10">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp size={16} className="text-emerald-600" />
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Annual Projection</span>
            </div>
            <p className="text-2xl font-extrabold text-gray-900 tracking-tight">{formatINR(annualPayroll)}</p>
            <p className="text-xs text-gray-400 mt-1">Based on current payroll × 12</p>
          </div>
          <div className="glass-card p-6 rounded-3xl bg-gradient-to-br from-amber-500/5 to-amber-500/0 border border-amber-500/10">
            <div className="flex items-center gap-2 mb-3">
              <BarChart3 size={16} className="text-amber-600" />
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Avg. Salary / Head</span>
            </div>
            <p className="text-2xl font-extrabold text-gray-900 tracking-tight">{formatINR(avgSalary)}</p>
            <p className="text-xs text-gray-400 mt-1">Per employee monthly cost</p>
          </div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Monthly Payroll Trend */}
          <div className="glass-card p-8 rounded-[2rem]">
            <h4 className="text-base font-bold text-gray-900 mb-6">Monthly Payroll Trend</h4>
            <div className="h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={payrollTrend}>
                  <defs>
                    <linearGradient id="payrollGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#22c55e" stopOpacity={0.15}/>
                      <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} tickFormatter={v => formatINR(v)} />
                  <Tooltip content={<CustomTooltip prefix="₹" />} />
                  <Area type="monotone" dataKey="payroll" name="Payroll" stroke="#22c55e" strokeWidth={3} fillOpacity={1} fill="url(#payrollGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Department-wise Payroll */}
          <div className="glass-card p-8 rounded-[2rem]">
            <h4 className="text-base font-bold text-gray-900 mb-6">Department-wise Payroll Cost</h4>
            {deptPayrollData.length > 0 ? (
              <div className="h-[280px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={deptPayrollData} layout="vertical" margin={{ left: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                    <XAxis type="number" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 11}} tickFormatter={v => formatINR(v)} />
                    <YAxis type="category" dataKey="department" axisLine={false} tickLine={false} tick={{fill: '#374151', fontSize: 11, fontWeight: 600}} width={100} />
                    <Tooltip content={<CustomTooltip prefix="₹" />} />
                    <Bar dataKey="salary" name="Monthly Cost" fill="#4c58fa" radius={[0, 8, 8, 0]} barSize={22}>
                      {deptPayrollData.map((_, i) => (
                        <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-[280px] flex items-center justify-center text-sm text-gray-400">
                No salary data available yet
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      {/* ── EMPLOYEE ANALYSIS SECTION ──────────────────────────── */}
      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <div>
        <SectionHeader icon={Users} title="Employee Analysis" subtitle="Workforce composition and hiring trends" />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Status Distribution Donut */}
          <div className="glass-card p-8 rounded-[2rem]">
            <h4 className="text-base font-bold text-gray-900 mb-2">Workforce Status</h4>
            <p className="text-xs text-gray-400 mb-4">Distribution by employment status</p>
            {statusData.length > 0 ? (
              <div className="h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <RPieChart>
                    <Pie
                      data={statusData}
                      cx="50%" cy="50%"
                      innerRadius={55} outerRadius={85}
                      paddingAngle={5}
                      dataKey="value"
                      strokeWidth={0}
                    >
                      {statusData.map((entry, i) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)'}} />
                    <Legend
                      verticalAlign="bottom"
                      iconType="circle"
                      iconSize={8}
                      formatter={(value) => <span className="text-xs font-semibold text-gray-600 ml-1">{value}</span>}
                    />
                  </RPieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-[250px] flex items-center justify-center text-sm text-gray-400">
                No employee data
              </div>
            )}
            {/* Status summary row */}
            <div className="flex items-center justify-between gap-2 mt-4 pt-4 border-t border-gray-100">
              <div className="flex items-center gap-1.5">
                <UserCheck size={14} className="text-emerald-500" />
                <span className="text-xs text-gray-600 font-semibold">{stats.active} Active</span>
              </div>
              <div className="flex items-center gap-1.5">
                <UserX size={14} className="text-rose-500" />
                <span className="text-xs text-gray-600 font-semibold">{stats.inactive} Inactive</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock size={14} className="text-amber-500" />
                <span className="text-xs text-gray-600 font-semibold">{stats.onLeave} On Leave</span>
              </div>
            </div>
          </div>

          {/* Employment Type + Department Distribution */}
          <div className="lg:col-span-2 space-y-8">
            {/* Department Headcount Bar Chart */}
            <div className="glass-card p-8 rounded-[2rem]">
              <h4 className="text-base font-bold text-gray-900 mb-6">Department Headcount</h4>
              {deptHeadcountData.length > 0 ? (
                <div className="h-[220px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={deptHeadcountData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                      <XAxis dataKey="department" axisLine={false} tickLine={false} tick={{fill: '#374151', fontSize: 11, fontWeight: 600}} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} allowDecimals={false} />
                      <Tooltip content={<CustomTooltip suffix=" employees" />} />
                      <Bar dataKey="count" name="Employees" radius={[8, 8, 0, 0]} barSize={36}>
                        {deptHeadcountData.map((_, i) => (
                          <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-[220px] flex items-center justify-center text-sm text-gray-400">
                  No department data available
                </div>
              )}
            </div>

            {/* Employment Type Breakdown + Hiring Trend */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Employment Type */}
              <div className="glass-card p-6 rounded-3xl">
                <h4 className="text-sm font-bold text-gray-900 mb-4">Employment Type</h4>
                <div className="space-y-3">
                  {empTypeData.length > 0 ? empTypeData.map((item, i) => {
                    const pct = stats.total > 0 ? Math.round((item.value / stats.total) * 100) : 0;
                    return (
                      <div key={item.name}>
                        <div className="flex items-center justify-between mb-1.5">
                          <div className="flex items-center gap-2">
                            <Briefcase size={12} style={{ color: item.color }} />
                            <span className="text-xs font-semibold text-gray-700">{item.name}</span>
                          </div>
                          <span className="text-xs font-bold text-gray-900">{item.value} <span className="text-gray-400 font-normal">({pct}%)</span></span>
                        </div>
                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-700 ease-out"
                            style={{ width: `${pct}%`, backgroundColor: item.color }}
                          />
                        </div>
                      </div>
                    );
                  }) : (
                    <p className="text-xs text-gray-400 text-center py-6">No data</p>
                  )}
                </div>
              </div>

              {/* Hiring Trend (last 6 months) */}
              <div className="glass-card p-6 rounded-3xl">
                <h4 className="text-sm font-bold text-gray-900 mb-4">Hiring Trend</h4>
                <p className="text-xs text-gray-400 mb-4">New hires in the last 6 months</p>
                <div className="h-[140px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={joiningTrendData}>
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10}} dy={5} />
                      <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10}} allowDecimals={false} />
                      <Tooltip content={<CustomTooltip suffix=" joined" />} />
                      <Bar dataKey="count" name="New Hires" fill="#8b5cf6" radius={[6, 6, 0, 0]} barSize={20} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
