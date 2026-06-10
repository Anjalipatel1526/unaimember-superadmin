import React, { useEffect, useState } from 'react';
import {
  Users, UserCheck, UserX, Clock, CalendarDays, TrendingUp,
  BriefcaseBusiness, Award, Target, ArrowUpRight, ArrowDownRight,
  Building2, PieChart as PieChartIcon, IndianRupee
} from 'lucide-react';
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  BarChart, Bar, PieChart as RPieChart, Pie, Cell, Legend
} from 'recharts';
import { getEmployeeStats, getCompanyAccess } from '../../services/employees';

const CHART_COLORS = ['#4c58fa', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];
const STATUS_COLORS = { Active: '#22c55e', Inactive: '#ef4444', 'On Leave': '#f59e0b' };

function StatCard({ icon: Icon, label, value, color, subtext, trend }) {
  return (
    <div className="glass-card p-6 rounded-3xl relative overflow-hidden group hover:translate-y-[-4px] transition-all duration-300">
      <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
        <Icon size={80} />
      </div>
      <div className="flex justify-between items-start relative z-10">
        <div className="p-3 rounded-2xl" style={{ backgroundColor: `${color}15`, color }}>
          <Icon size={22} />
        </div>
        {trend !== undefined && (
          <div className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full ${trend >= 0 ? 'text-emerald-600 bg-emerald-50' : 'text-rose-600 bg-rose-50'}`}>
            {trend >= 0 ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
            {Math.abs(trend)}%
          </div>
        )}
      </div>
      <div className="mt-5 relative z-10">
        <p className="text-sm font-medium text-gray-500">{label}</p>
        <h3 className="text-3xl font-bold text-gray-900 mt-1 tracking-tight">{value}</h3>
        {subtext && <p className="text-xs text-gray-400 mt-1">{subtext}</p>}
      </div>
    </div>
  );
}

function QuickAction({ icon: Icon, label, desc, onClick }) {
  return (
    <button onClick={onClick} className="flex items-center gap-4 p-4 rounded-2xl bg-white border border-gray-100 hover:border-[#4c58fa]/20 hover:shadow-md transition-all group text-left w-full">
      <div className="p-3 rounded-xl bg-[#EEF0FF] text-[#4c58fa] group-hover:bg-[#4c58fa] group-hover:text-white transition-colors shrink-0">
        <Icon size={20} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-gray-900">{label}</p>
        <p className="text-xs text-gray-400 mt-0.5">{desc}</p>
      </div>
      <ArrowUpRight size={16} className="text-gray-300 group-hover:text-[#4c58fa] transition-colors shrink-0" />
    </button>
  );
}

export default function HROverview({ companyId, companyDetails }) {
  const [stats, setStats] = useState({
    total: 0, active: 0, inactive: 0, onLeave: 0, departments: [],
    employmentTypes: {}, departmentSalary: {}, departmentCount: {},
    totalPayroll: 0, joiningTrend: [], statusBreakdown: {}
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const empStats = await getEmployeeStats(companyId);
        setStats(empStats);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [companyId]);

  // Status donut data
  const statusData = [
    { name: 'Active', value: stats.active, color: STATUS_COLORS.Active },
    { name: 'Inactive', value: stats.inactive, color: STATUS_COLORS.Inactive },
    { name: 'On Leave', value: stats.onLeave, color: STATUS_COLORS['On Leave'] },
  ].filter(d => d.value > 0);

  // Department headcount
  const deptData = Object.entries(stats.departmentCount)
    .map(([dept, count]) => ({ department: dept, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 6);

  // Employment type
  const empTypeData = Object.entries(stats.employmentTypes).map(([type, count], i) => ({
    name: type, value: count, color: CHART_COLORS[i % CHART_COLORS.length]
  }));

  // Joining trend
  const joiningData = stats.joiningTrend.length > 0
    ? stats.joiningTrend
    : [{ name: 'Jan', count: 0 }, { name: 'Feb', count: 0 }, { name: 'Mar', count: 0 },
       { name: 'Apr', count: 0 }, { name: 'May', count: 0 }, { name: 'Jun', count: 0 }];

  const retentionRate = stats.total > 0 ? Math.round((stats.active / stats.total) * 100) : 0;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
          HR Dashboard
        </h1>
        <p className="text-gray-500 mt-1 font-medium">
          Welcome back. Here's your workforce health overview for <span className="text-[#4c58fa] font-bold">{companyDetails?.name || 'your organization'}</span>.
        </p>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard icon={Users} label="Total Employees" value={loading ? '...' : stats.total} color="#4c58fa" trend={5} />
        <StatCard icon={UserCheck} label="Active Workforce" value={loading ? '...' : stats.active} color="#22c55e" subtext={`${retentionRate}% retention rate`} />
        <StatCard icon={Clock} label="On Leave Today" value={loading ? '...' : stats.onLeave} color="#f59e0b" />
        <StatCard icon={Building2} label="Departments" value={loading ? '...' : stats.departments.length} color="#8b5cf6" subtext={`${stats.total} staff across all`} />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Hiring Trend */}
        <div className="lg:col-span-2 glass-card p-8 rounded-[2rem]">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-gray-900">Hiring Trend</h3>
              <p className="text-xs text-gray-400 mt-0.5">New hires over the last 6 months</p>
            </div>
            <div className="flex items-center gap-2 bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold">
              <TrendingUp size={12} />
              Active
            </div>
          </div>
          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={joiningData}>
                <defs>
                  <linearGradient id="hrHiringGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4c58fa" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#4c58fa" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} allowDecimals={false} />
                <Tooltip contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)'}} />
                <Area type="monotone" dataKey="count" name="New Hires" stroke="#4c58fa" strokeWidth={3} fillOpacity={1} fill="url(#hrHiringGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Employee Status Donut */}
        <div className="glass-card p-8 rounded-[2rem]">
          <h3 className="text-lg font-bold text-gray-900 mb-1">Workforce Status</h3>
          <p className="text-xs text-gray-400 mb-4">Current employee distribution</p>
          {statusData.length > 0 ? (
            <div className="h-[200px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <RPieChart>
                  <Pie data={statusData} cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={5} dataKey="value" strokeWidth={0}>
                    {statusData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                  </Pie>
                  <Tooltip contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)'}} />
                  <Legend verticalAlign="bottom" iconType="circle" iconSize={8}
                    formatter={(value) => <span className="text-xs font-semibold text-gray-600 ml-1">{value}</span>}
                  />
                </RPieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-[200px] flex items-center justify-center text-sm text-gray-400">No data yet</div>
          )}
          {/* Mini stats */}
          <div className="flex items-center justify-between gap-2 mt-4 pt-4 border-t border-gray-100">
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="text-xs text-gray-600 font-semibold">{stats.active} Active</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-amber-500" />
              <span className="text-xs text-gray-600 font-semibold">{stats.onLeave} Leave</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-rose-500" />
              <span className="text-xs text-gray-600 font-semibold">{stats.inactive} Inactive</span>
            </div>
          </div>
        </div>
      </div>

      {/* Department + Quick Actions Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Department Distribution */}
        <div className="glass-card p-8 rounded-[2rem]">
          <h3 className="text-lg font-bold text-gray-900 mb-6">Department Distribution</h3>
          {deptData.length > 0 ? (
            <div className="h-[240px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={deptData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="department" axisLine={false} tickLine={false} tick={{fill: '#374151', fontSize: 11, fontWeight: 600}} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} allowDecimals={false} />
                  <Tooltip contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)'}} />
                  <Bar dataKey="count" name="Employees" radius={[8, 8, 0, 0]} barSize={36}>
                    {deptData.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-[240px] flex items-center justify-center text-sm text-gray-400">No department data</div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-gray-900">Quick Actions</h3>
          <div className="space-y-3">
            <QuickAction icon={UserCheck} label="Mark Attendance" desc="Record today's employee attendance" />
            <QuickAction icon={CalendarDays} label="Approve Leave Requests" desc="Review pending leave applications" />
            <QuickAction icon={BriefcaseBusiness} label="Post New Position" desc="Create a job opening in recruitment" />
            <QuickAction icon={Award} label="Schedule Review" desc="Set up quarterly performance reviews" />
          </div>
        </div>
      </div>

      {/* Employment Type Breakdown */}
      <div className="glass-card p-8 rounded-[2rem]">
        <h3 className="text-lg font-bold text-gray-900 mb-6">Employment Type Breakdown</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {empTypeData.length > 0 ? empTypeData.map((item) => {
            const pct = stats.total > 0 ? Math.round((item.value / stats.total) * 100) : 0;
            return (
              <div key={item.name} className="p-5 rounded-2xl bg-gray-50 border border-gray-100">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">{item.name}</span>
                  <span className="text-lg font-extrabold text-gray-900">{item.value}</span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all duration-700 ease-out" style={{ width: `${pct}%`, backgroundColor: item.color }} />
                </div>
                <p className="text-xs text-gray-400 mt-2">{pct}% of workforce</p>
              </div>
            );
          }) : (
            <div className="col-span-4 py-12 text-center text-sm text-gray-400">No data available</div>
          )}
        </div>
      </div>
    </div>
  );
}
