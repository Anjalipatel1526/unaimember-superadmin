import React from 'react';
import { Server, Clock, Activity, AlertCircle, CheckCircle2, ExternalLink } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const chartData = [];

const activityLogs = [];

const logTypes = {
  Error:   'bg-red-50 text-red-600',
  Warning: 'bg-orange-50 text-orange-600',
  Info:    'bg-blue-50 text-blue-600',
};

function StatusCard({ icon: Icon, title, value, status }) {
  const ok = status === 'Healthy';
  return (
    <div className="card-hover flex flex-col gap-4">
      <div className="flex items-start justify-between">
        <div className="w-11 h-11 rounded-xl bg-[#EEF0FF] flex items-center justify-center">
          <Icon size={20} className="text-[#4c58fa]" />
        </div>
        <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full ${ok ? 'bg-emerald-50 text-emerald-700' : 'bg-orange-50 text-orange-700'}`}>
          {ok ? <CheckCircle2 size={10} /> : <AlertCircle size={10} />}
          {status.toUpperCase()}
        </span>
      </div>
      <div>
        <p className="text-sm text-[#6B7280] font-medium">{title}</p>
        <p className="text-2xl font-bold text-[#111827] tracking-tight mt-1">{value}</p>
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

export default function Monitoring() {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-bold text-[#111827] tracking-tight">System Monitoring</h1>
        <p className="text-sm text-[#6B7280] mt-1">Live infrastructure health and performance metrics.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatusCard icon={Server}       title="Server Status"     value="—" status="Unknown" />
        <StatusCard icon={Clock}        title="API Response Time" value="—" status="Unknown" />
        <StatusCard icon={Activity}     title="Active Sessions"   value="—" status="Unknown" />
        <StatusCard icon={AlertCircle}  title="Errors (24h)"      value="—" status="Unknown" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Line chart */}
        <div className="card lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="section-title">Server Load & Response</h2>
              <p className="section-subtitle">Last 24 hours across all nodes</p>
            </div>
            <button className="btn-ghost text-xs gap-1.5">
              <ExternalLink size={13} />Grafana
            </button>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F0EBE5" />
                <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 11 }} dy={8} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 11 }} dx={-8} />
                <Tooltip contentStyle={tooltipStyle} />
                <Line type="monotone" dataKey="load" name="Load %" stroke="#4c58fa" strokeWidth={2.5} dot={false} activeDot={{ r: 5, fill: '#4c58fa' }} />
                <Line type="monotone" dataKey="ms"   name="Response ms" stroke="#3d45e8" strokeWidth={2.5} dot={false} activeDot={{ r: 5, fill: '#3d45e8' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Live logs */}
        <div className="card flex flex-col">
          <h2 className="section-title mb-1">Live Activity</h2>
          <p className="section-subtitle mb-6">Real-time event stream</p>
          <div className="flex flex-col gap-5 flex-1">
            {activityLogs.map((log, i) => (
              <div key={i} className="flex gap-3">
                <span className={`mt-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded shrink-0 h-fit ${logTypes[log.type]}`}>
                  {log.type.toUpperCase()}
                </span>
                <div>
                  <p className="text-xs font-semibold text-[#111827] leading-snug">{log.msg}</p>
                  <p className="text-[10px] text-[#6B7280] mt-1">{log.time} · {log.src}</p>
                </div>
              </div>
            ))}
          </div>
          <button className="btn-secondary w-full justify-center mt-6 text-xs">View All Logs</button>
        </div>
      </div>
    </div>
  );
}
