import React, { useEffect, useState } from 'react';
import { 
  Users, Building2, CreditCard, Ticket, 
  TrendingUp, ArrowUpRight, Activity, Zap,
  MousePointer2, Clock, Globe, Shield
} from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { getCompanyStats } from '../../services/companies';
import { getBillingStats } from '../../services/billing';

function StatCard({ icon: Icon, label, value, trend, trendUp, color }) {
  return (
    <div className="glass-card p-6 rounded-3xl relative overflow-hidden group hover:translate-y-[-4px] transition-all duration-300">
      <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
        <Icon size={80} />
      </div>
      <div className="flex justify-between items-start relative z-10">
        <div className={`p-3 rounded-2xl bg-${color}-50 text-${color}-600`}>
          <Icon size={24} />
        </div>
        {trend && (
          <div className={`flex items-center gap-1 text-xs font-bold ${trendUp ? 'text-emerald-600 bg-emerald-50' : 'text-rose-600 bg-rose-50'} px-2.5 py-1 rounded-full border border-current/10`}>
            <ArrowUpRight size={12} className={trendUp ? '' : 'rotate-90'} />
            {trend}
          </div>
        )}
      </div>
      <div className="mt-6 relative z-10">
        <p className="text-sm font-medium text-gray-500">{label}</p>
        <h3 className="text-3xl font-bold text-gray-900 mt-1 tracking-tight">{value}</h3>
      </div>
    </div>
  );
}

const DATA = [
  { name: 'Jan', value: 400 }, { name: 'Feb', value: 700 }, { name: 'Mar', value: 600 },
  { name: 'Apr', value: 900 }, { name: 'May', value: 1100 }, { name: 'Jun', value: 1400 },
];

export default function Dashboard() {
  const [stats, setStats] = useState({ total: 0, employees: 0, revenue: 0, mrr: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [c, b] = await Promise.all([getCompanyStats(), getBillingStats()]);
        setStats({
          total: c.total,
          employees: c.totalEmployees,
          revenue: b.totalRevenue,
          mrr: b.mrr
        });
      } finally { setLoading(false); }
    }
    load();
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Platform <span className="text-[#4c58fa]">Overview</span></h1>
          <p className="text-gray-500 mt-1 font-medium">Real-time health and performance of the HR SaaS ecosystem.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-white border border-gray-100 shadow-sm">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-bold text-gray-600 uppercase tracking-widest">Live Monitoring</span>
          </div>
        </div>
      </div>

      {/* Grid Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard icon={Building2} label="Total Companies" value={loading ? '...' : stats.total} trend="+4.2%" trendUp color="blue" />
        <StatCard icon={Users} label="Global Employees" value={loading ? '...' : stats.employees.toLocaleString()} trend="+12%" trendUp color="purple" />
        <StatCard icon={TrendingUp} label="Total Revenue" value={loading ? '...' : `₹${(stats.revenue/1000).toFixed(1)}k`} trend="+8.1%" trendUp color="emerald" />
        <StatCard icon={Activity} label="Monthly Revenue" value={loading ? '...' : `₹${(stats.mrr/1000).toFixed(1)}k`} trend="-2.4%" trendUp={false} color="orange" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Chart */}
        <div className="lg:col-span-2 glass-card p-8 rounded-[2rem] relative overflow-hidden">
          <div className="border-beam rounded-[2rem]" />
          <div className="flex items-center justify-between mb-10 relative z-10">
            <div>
              <h3 className="text-xl font-bold text-gray-900">Platform Scaling</h3>
              <p className="text-sm text-gray-500 mt-1 font-medium">Growth of client organizations over time</p>
            </div>
            <select className="bg-gray-50 border-none text-xs font-bold text-gray-500 rounded-xl px-4 py-2 outline-none">
              <option>Last 6 Months</option>
              <option>Year to Date</option>
            </select>
          </div>
          
          <div className="h-[350px] w-full relative z-10">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={DATA}>
                <defs>
                  <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4c58fa" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#4c58fa" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                <Tooltip 
                  contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)'}}
                  cursor={{stroke: '#4c58fa', strokeWidth: 2, strokeDasharray: '4 4'}}
                />
                <Area type="monotone" dataKey="value" stroke="#4c58fa" strokeWidth={4} fillOpacity={1} fill="url(#colorVal)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* System Health */}
        <div className="flex flex-col gap-6">
          <div className="glass-card p-6 rounded-3xl bg-gradient-to-br from-[#4c58fa] to-[#3d45e8] text-white overflow-hidden relative group">
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10" />
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-4">
                <Shield className="h-5 w-5 text-blue-200" />
                <span className="text-xs font-bold uppercase tracking-widest text-blue-100">Security Pulse</span>
              </div>
              <h4 className="text-2xl font-bold">100% Secure</h4>
              <p className="text-sm text-blue-100/70 mt-2 leading-relaxed">All data clusters are synchronized and encrypted with AES-256.</p>
              <div className="mt-6 flex items-center gap-3">
                <button className="flex-1 bg-white text-[#4c58fa] py-2 rounded-xl text-xs font-bold hover:bg-blue-50 transition-colors">Run Audit</button>
              </div>
            </div>
          </div>

          <div className="glass-card p-6 rounded-3xl flex-1 flex flex-col justify-center">
            <h4 className="text-sm font-bold text-gray-900 mb-6">Regional Distribution</h4>
            <div className="space-y-4">
              {[
                { label: 'India Cluster', val: 65, color: 'bg-emerald-500' },
                { label: 'US West Cluster', val: 20, color: 'bg-blue-500' },
                { label: 'Europe Cluster', val: 15, color: 'bg-purple-500' },
              ].map(r => (
                <div key={r.label}>
                  <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1.5">
                    <span>{r.label}</span>
                    <span>{r.val}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                    <div className={`h-full ${r.color} transition-all duration-1000`} style={{width: `${r.val}%`}} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
