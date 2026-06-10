import React, { useState, useEffect } from 'react';
import { CalendarDays, Check, X, Clock, Plus, Filter, Search } from 'lucide-react';
import { getEmployees } from '../../services/employees';

const LEAVE_TYPES = ['Casual Leave', 'Sick Leave', 'Earned Leave', 'Maternity Leave', 'Paternity Leave', 'Comp Off'];
const STATUS_BADGE = {
  Pending: 'bg-amber-50 text-amber-700 border-amber-200',
  Approved: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  Rejected: 'bg-rose-50 text-rose-600 border-rose-200',
};

function Modal({ open, onClose, title, children }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/25 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <h3 className="text-base font-bold text-gray-900">{title}</h3>
          <button onClick={onClose} className="btn-ghost w-8 h-8 flex items-center justify-center p-0"><X size={18}/></button>
        </div>
        <div className="px-6 py-6">{children}</div>
      </div>
    </div>
  );
}

export default function HRLeaveManagement({ companyId }) {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [leaveRequests, setLeaveRequests] = useState([]);

  // Form state
  const [form, setForm] = useState({ empId: '', type: 'Casual Leave', from: '', to: '', reason: '' });

  useEffect(() => {
    getEmployees(companyId)
      .then(data => {
        setEmployees(data);
        // Generate mock leave data
        const mockLeaves = data.slice(0, Math.min(8, data.length)).map((emp, i) => ({
          id: i + 1,
          empId: emp.id,
          empName: `${emp.first_name} ${emp.last_name}`,
          department: emp.department || 'General',
          type: LEAVE_TYPES[i % LEAVE_TYPES.length],
          from: new Date(Date.now() - Math.random() * 7 * 86400000).toISOString().split('T')[0],
          to: new Date(Date.now() + Math.random() * 5 * 86400000).toISOString().split('T')[0],
          days: Math.ceil(Math.random() * 5) + 1,
          reason: ['Family function', 'Not feeling well', 'Personal work', 'Medical appointment', 'Vacation', 'Child care', 'Home emergency', 'Festival'][i % 8],
          status: i < 3 ? 'Pending' : i < 6 ? 'Approved' : 'Rejected',
          appliedOn: new Date(Date.now() - Math.random() * 14 * 86400000).toISOString().split('T')[0],
        }));
        setLeaveRequests(mockLeaves);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [companyId]);

  const handleAction = (id, action) => {
    setLeaveRequests(prev => prev.map(lr => lr.id === id ? { ...lr, status: action } : lr));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const emp = employees.find(e => e.id === form.empId);
    if (!emp) return;
    const newReq = {
      id: Date.now(),
      empId: form.empId,
      empName: `${emp.first_name} ${emp.last_name}`,
      department: emp.department || 'General',
      type: form.type,
      from: form.from,
      to: form.to,
      days: Math.max(1, Math.ceil((new Date(form.to) - new Date(form.from)) / 86400000) + 1),
      reason: form.reason,
      status: 'Pending',
      appliedOn: new Date().toISOString().split('T')[0],
    };
    setLeaveRequests(prev => [newReq, ...prev]);
    setShowModal(false);
    setForm({ empId: '', type: 'Casual Leave', from: '', to: '', reason: '' });
  };

  const counts = {
    pending: leaveRequests.filter(l => l.status === 'Pending').length,
    approved: leaveRequests.filter(l => l.status === 'Approved').length,
    rejected: leaveRequests.filter(l => l.status === 'Rejected').length,
  };

  const filtered = leaveRequests
    .filter(l => filter === 'All' || l.status === filter)
    .filter(l => l.empName.toLowerCase().includes(search.toLowerCase()) || l.type.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Leave Management</h1>
          <p className="text-sm text-gray-500 mt-1">Review, approve, or reject employee leave applications.</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary self-start">
          <Plus size={15} /> Apply Leave
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Pending', count: counts.pending, color: '#f59e0b' },
          { label: 'Approved', count: counts.approved, color: '#22c55e' },
          { label: 'Rejected', count: counts.rejected, color: '#ef4444' },
        ].map(item => (
          <div key={item.label} className="glass-card p-5 rounded-2xl text-center">
            <p className="text-2xl font-extrabold text-gray-900">{item.count}</p>
            <p className="text-xs font-bold uppercase tracking-wider mt-1" style={{ color: item.color }}>{item.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name or leave type..." className="input pl-9 h-10" />
        </div>
        <div className="flex items-center gap-2">
          {['All', 'Pending', 'Approved', 'Rejected'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                filter === f ? 'bg-[#4c58fa] text-white shadow-lg shadow-[#4c58fa]/20' : 'bg-white border border-gray-200 text-gray-600 hover:border-[#4c58fa]/30'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Leave Requests Table */}
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
                  {['Employee', 'Leave Type', 'Duration', 'Reason', 'Status', 'Actions'].map(h => (
                    <th key={h} className="px-6 py-3 text-left text-xs font-bold text-gray-400 uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(lr => (
                  <tr key={lr.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50/30 transition-colors">
                    <td className="px-6 py-4">
                      <p className="text-sm font-semibold text-gray-900">{lr.empName}</p>
                      <p className="text-xs text-gray-400">{lr.department}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs font-bold text-[#4c58fa] bg-[#EEF0FF] px-2 py-1 rounded-lg">{lr.type}</span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-xs text-gray-700 font-semibold">{lr.from} → {lr.to}</p>
                      <p className="text-[10px] text-gray-400 mt-0.5">{lr.days} day{lr.days > 1 ? 's' : ''}</p>
                    </td>
                    <td className="px-6 py-4 max-w-[200px]">
                      <p className="text-xs text-gray-600 truncate">{lr.reason}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${STATUS_BADGE[lr.status]}`}>
                        {lr.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {lr.status === 'Pending' ? (
                        <div className="flex items-center gap-1.5">
                          <button onClick={() => handleAction(lr.id, 'Approved')} className="w-8 h-8 flex items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-all" title="Approve">
                            <Check size={14} />
                          </button>
                          <button onClick={() => handleAction(lr.id, 'Rejected')} className="w-8 h-8 flex items-center justify-center rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 transition-all" title="Reject">
                            <X size={14} />
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400">—</span>
                      )}
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan={6} className="text-center py-16 text-sm text-gray-400">No leave requests found.</td></tr>
                )}
              </tbody>
            </table>
          )}
        </div>
        <div className="px-6 py-3 border-t border-gray-100 bg-white">
          <p className="text-xs text-gray-400">Showing {filtered.length} of {leaveRequests.length} requests</p>
        </div>
      </div>

      {/* Apply Leave Modal */}
      <Modal open={showModal} onClose={() => setShowModal(false)} title="Apply Leave Request">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Employee</label>
            <select className="input" value={form.empId} onChange={e => setForm(f => ({ ...f, empId: e.target.value }))} required>
              <option value="">Select Employee</option>
              {employees.map(e => <option key={e.id} value={e.id}>{e.first_name} {e.last_name}</option>)}
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Leave Type</label>
            <select className="input" value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}>
              {LEAVE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">From</label>
              <input type="date" className="input" value={form.from} onChange={e => setForm(f => ({ ...f, from: e.target.value }))} required />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">To</label>
              <input type="date" className="input" value={form.to} onChange={e => setForm(f => ({ ...f, to: e.target.value }))} required />
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Reason</label>
            <input className="input" value={form.reason} onChange={e => setForm(f => ({ ...f, reason: e.target.value }))} placeholder="Brief reason for leave..." required />
          </div>
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
            <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">Cancel</button>
            <button type="submit" className="btn-primary">Submit Request</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
