import React, { useState, useEffect } from 'react';
import { CalendarDays, Check, X, Clock, AlertCircle, ChevronLeft, ChevronRight, Filter } from 'lucide-react';
import { getEmployees } from '../../services/employees';

const STATUS_STYLES = {
  Present: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  Absent: 'bg-rose-50 text-rose-600 border-rose-200',
  Late: 'bg-amber-50 text-amber-700 border-amber-200',
  'Half Day': 'bg-blue-50 text-blue-700 border-blue-200',
  '—': 'bg-gray-50 text-gray-400 border-gray-200',
};

export default function HRAttendance({ companyId }) {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendance, setAttendance] = useState({});
  const [filter, setFilter] = useState('All');

  useEffect(() => {
    getEmployees(companyId)
      .then(data => {
        setEmployees(data.filter(e => e.emp_status === 'Active'));
        // Initialize mock attendance
        const attn = {};
        data.forEach(e => {
          const rand = Math.random();
          attn[e.id] = rand > 0.85 ? 'Absent' : rand > 0.75 ? 'Late' : rand > 0.65 ? 'Half Day' : 'Present';
        });
        setAttendance(attn);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [companyId]);

  const markAttendance = (empId, status) => {
    setAttendance(prev => ({ ...prev, [empId]: status }));
  };

  const counts = {
    present: Object.values(attendance).filter(s => s === 'Present').length,
    absent: Object.values(attendance).filter(s => s === 'Absent').length,
    late: Object.values(attendance).filter(s => s === 'Late').length,
    halfDay: Object.values(attendance).filter(s => s === 'Half Day').length,
  };

  const filtered = filter === 'All'
    ? employees
    : employees.filter(e => attendance[e.id] === filter);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Attendance Tracker</h1>
          <p className="text-sm text-gray-500 mt-1">Mark and manage daily employee attendance records.</p>
        </div>
        <div className="flex items-center gap-3">
          <input
            type="date"
            value={selectedDate}
            onChange={e => setSelectedDate(e.target.value)}
            className="input h-10 w-auto text-sm"
          />
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Present', count: counts.present, color: '#22c55e', icon: Check },
          { label: 'Absent', count: counts.absent, color: '#ef4444', icon: X },
          { label: 'Late', count: counts.late, color: '#f59e0b', icon: Clock },
          { label: 'Half Day', count: counts.halfDay, color: '#3b82f6', icon: AlertCircle },
        ].map(item => (
          <div key={item.label} className="glass-card p-5 rounded-2xl">
            <div className="flex items-center gap-2 mb-3">
              <item.icon size={16} style={{ color: item.color }} />
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">{item.label}</span>
            </div>
            <p className="text-2xl font-extrabold text-gray-900">{item.count}</p>
            <p className="text-xs text-gray-400 mt-1">{employees.length > 0 ? Math.round((item.count / employees.length) * 100) : 0}% of staff</p>
          </div>
        ))}
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 flex-wrap">
        {['All', 'Present', 'Absent', 'Late', 'Half Day'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              filter === f
                ? 'bg-[#4c58fa] text-white shadow-lg shadow-[#4c58fa]/20'
                : 'bg-white border border-gray-200 text-gray-600 hover:border-[#4c58fa]/30'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Attendance Table */}
      <div className="card p-0 overflow-hidden rounded-2xl">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-6 space-y-3">
              {[...Array(5)].map((_, i) => <div key={i} className="h-14 bg-gray-100 rounded-xl animate-pulse" />)}
            </div>
          ) : (
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  {['Employee', 'Department', 'Status', 'Mark Attendance'].map(h => (
                    <th key={h} className="px-6 py-3 text-left text-xs font-bold text-gray-400 uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(emp => (
                  <tr key={emp.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-[#EEF0FF] flex items-center justify-center shrink-0 border border-[#4c58fa]/10">
                          <span className="text-xs font-bold text-[#4c58fa]">{emp.first_name?.[0]}{emp.last_name?.[0]}</span>
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-900">{emp.first_name} {emp.last_name}</p>
                          <p className="text-xs text-gray-400">{emp.designation || 'Staff'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs font-bold text-[#4c58fa] bg-[#EEF0FF] px-2 py-0.5 rounded-md">{emp.department || 'General'}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${STATUS_STYLES[attendance[emp.id]] || STATUS_STYLES['—']}`}>
                        {attendance[emp.id] || '—'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5">
                        {['Present', 'Absent', 'Late', 'Half Day'].map(s => (
                          <button
                            key={s}
                            onClick={() => markAttendance(emp.id, s)}
                            className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all ${
                              attendance[emp.id] === s
                                ? 'bg-[#4c58fa] text-white'
                                : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                            }`}
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan={4} className="text-center py-16 text-sm text-gray-400">No employees found.</td></tr>
                )}
              </tbody>
            </table>
          )}
        </div>
        <div className="px-6 py-3 border-t border-gray-100 bg-white">
          <p className="text-xs text-gray-400">Showing {filtered.length} of {employees.length} active employees</p>
        </div>
      </div>
    </div>
  );
}
