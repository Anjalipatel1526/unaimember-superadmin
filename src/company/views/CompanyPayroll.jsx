import React, { useEffect, useState } from 'react';
import { CreditCard, CheckCircle2, AlertCircle, CalendarDays, IndianRupee, FileText, Send } from 'lucide-react';
import { getEmployees } from '../../services/employees';

export default function CompanyPayroll({ companyId, companyDetails }) {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processed, setProcessed] = useState(false);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const data = await getEmployees(companyId);
        setEmployees(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [companyId]);

  const totalPayroll = employees.reduce((acc, emp) => acc + (Number(emp.salary) || 0), 0);

  const handleProcessPayroll = () => {
    setProcessing(true);
    setTimeout(() => {
      setProcessing(false);
      setProcessed(true);
    }, 2000);
  };

  const currentMonth = new Date().toLocaleDateString(undefined, { month: 'long', year: 'numeric' });

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Payroll Manager</h1>
          <p className="text-sm text-gray-500 mt-1">Review employee salaries and approve the monthly payroll processing.</p>
        </div>
        <div className="flex items-center gap-2 bg-white border border-gray-200 px-4 py-2 rounded-2xl shadow-sm">
          <CalendarDays className="text-[#4c58fa]" size={16} />
          <span className="text-xs font-bold text-gray-600 uppercase tracking-wider">{currentMonth} Cycle</span>
        </div>
      </div>

      {/* Payroll Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-card p-6 rounded-3xl relative overflow-hidden">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Total Monthly Cost</p>
          <h3 className="text-3xl font-bold text-gray-900 mt-3 tracking-tight flex items-center">
            <span className="text-lg mr-0.5 text-gray-400">₹</span>{(totalPayroll / 1000).toFixed(1)}k
          </h3>
          <p className="text-xs text-gray-400 mt-1">Based on {employees.length} employees</p>
        </div>

        <div className="glass-card p-6 rounded-3xl relative overflow-hidden">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Payment Status</p>
          <div className="mt-3 flex items-center gap-2">
            {processed ? (
              <span className="badge-green text-xs flex items-center gap-1 py-1 px-3">
                <CheckCircle2 size={12} /> Processed
              </span>
            ) : (
              <span className="badge-orange text-xs flex items-center gap-1 py-1 px-3">
                <AlertCircle size={12} /> Pending Approval
              </span>
            )}
          </div>
          <p className="text-xs text-gray-400 mt-1.5">{processed ? 'Disbursed to bank accounts' : 'Awaiting admin processing'}</p>
        </div>

        <div className="glass-card p-6 rounded-3xl flex items-center justify-center">
          {!processed ? (
            <button
              onClick={handleProcessPayroll}
              disabled={processing || employees.length === 0}
              className="w-full btn-primary h-12 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-[#4c58fa]/20 disabled:opacity-50"
            >
              {processing ? (
                <>Processing...</>
              ) : (
                <>
                  <Send size={14} /> Process & Release Payroll
                </>
              )}
            </button>
          ) : (
            <div className="flex flex-col items-center justify-center text-center gap-1">
              <CheckCircle2 className="text-emerald-500" size={24} />
              <span className="text-xs font-bold text-gray-900">Payroll Released Successfully</span>
            </div>
          )}
        </div>
      </div>

      {/* Salary List */}
      <div className="card p-0 overflow-hidden bg-white">
        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
          <h3 className="text-sm font-bold text-gray-900">Staff Salary Roll</h3>
          <span className="text-xs text-gray-400 font-medium">Monthly payout statement</span>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-6 text-center text-gray-400">Loading payroll table...</div>
          ) : (
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  {['Employee', 'Department', 'Monthly Salary', 'Status'].map(h => (
                    <th key={h} className="px-6 py-3 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {employees.map(emp => (
                  <tr key={emp.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center shrink-0">
                          <span className="text-xs font-bold text-gray-500">{emp.first_name[0]}{emp.last_name[0]}</span>
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-900">{emp.first_name} {emp.last_name}</p>
                          <p className="text-xs text-gray-400">{emp.designation}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs font-bold text-gray-600 bg-gray-100 px-2 py-0.5 rounded">{emp.department || '—'}</span>
                    </td>
                    <td className="px-6 py-4 font-mono text-sm font-bold text-gray-900">
                      ₹{(Number(emp.salary) || 0).toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      {processed ? (
                        <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                          <CheckCircle2 size={12} /> Disbursed
                        </span>
                      ) : (
                        <span className="text-xs font-bold text-amber-500 flex items-center gap-1">
                          <AlertCircle size={12} /> Calculated
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
                {employees.length === 0 && !loading && (
                  <tr><td colSpan={4} className="text-center py-16 text-sm text-gray-400">No employees registered.</td></tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
