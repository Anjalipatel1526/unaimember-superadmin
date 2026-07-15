import React, { useState, useEffect } from 'react';
import { getAuditLogs } from '@/services/auditLogs';
import { 
  History, Search, Shield, Building, User, Calendar, 
  CheckCircle2, XCircle, ChevronDown, ChevronUp, Eye, EyeOff 
} from 'lucide-react';

export default function AuditLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Filter States
  const [company, setCompany] = useState('');
  const [role, setRole] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [expandedLogId, setExpandedLogId] = useState(null);

  const fetchLogs = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAuditLogs({
        company: company.trim() || undefined,
        role: role || undefined,
        from: fromDate || undefined,
        to: toDate || undefined,
      });
      setLogs(data || []);
    } catch (err) {
      console.error('Error fetching audit logs:', err);
      setError(err.message || 'Failed to fetch audit logs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchLogs();
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [company, role, fromDate, toDate]);

  const toggleExpand = (id) => {
    setExpandedLogId(expandedLogId === id ? null : id);
  };

  const clearFilters = () => {
    setCompany('');
    setRole('');
    setFromDate('');
    setToDate('');
  };

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-bold text-[#111827] tracking-tight">Audit Logs</h1>
        <p className="text-sm text-[#6B7280] mt-1">
          Traceability log of all critical administrative actions and system updates.
        </p>
      </div>

      {/* Filters Section */}
      <div className="card bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2">
            <History size={16} className="text-[#4c58fa]" />
            Search & Filter
          </h2>
          {(company || role || fromDate || toDate) && (
            <button 
              onClick={clearFilters}
              className="text-xs font-semibold text-[#4c58fa] hover:text-[#3d45e8] transition-colors"
            >
              Clear Filters
            </button>
          )}
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="Search by Company..."
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              className="w-full pl-10 pr-4 h-10 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-[#4c58fa]/10 focus:border-[#4c58fa] transition-all"
            />
          </div>

          <div className="relative">
            <Shield className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full pl-10 pr-4 h-10 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-[#4c58fa]/10 focus:border-[#4c58fa] transition-all appearance-none bg-white"
            >
              <option value="">All Roles</option>
              <option value="super-admin">Super Admin</option>
              <option value="hr-manager">HR Manager</option>
              <option value="employee">Employee</option>
            </select>
          </div>

          <div className="relative">
            <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              placeholder="From Date"
              className="w-full pl-10 pr-4 h-10 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-[#4c58fa]/10 focus:border-[#4c58fa] transition-all"
            />
          </div>

          <div className="relative">
            <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              placeholder="To Date"
              className="w-full pl-10 pr-4 h-10 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-[#4c58fa]/10 focus:border-[#4c58fa] transition-all"
            />
          </div>
        </div>
      </div>

      {/* Logs Table / List */}
      <div className="card bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden p-0">
        {loading ? (
          <div className="p-12 text-center text-gray-500">
            <div className="inline-block w-8 h-8 border-4 border-[#4c58fa] border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-sm font-medium">Loading audit logs...</p>
          </div>
        ) : error ? (
          <div className="p-12 text-center text-red-600">
            <XCircle className="mx-auto mb-4 text-red-500" size={32} />
            <p className="text-sm font-bold">Error loading logs</p>
            <p className="text-xs mt-1 text-gray-500">{error}</p>
            <button 
              onClick={fetchLogs}
              className="mt-4 px-4 py-2 bg-red-50 text-red-600 rounded-xl text-xs font-bold hover:bg-red-100 transition-colors"
            >
              Try Again
            </button>
          </div>
        ) : logs.length === 0 ? (
          <div className="p-12 text-center text-gray-400">
            <History className="mx-auto mb-4 text-gray-300" size={32} />
            <p className="text-sm font-bold">No Audit Logs Found</p>
            <p className="text-xs mt-1">Try relaxing your search filters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                  <th className="py-4 px-6">Timestamp</th>
                  <th className="py-4 px-6">User / Actor</th>
                  <th className="py-4 px-6">Action</th>
                  <th className="py-4 px-6">Target</th>
                  <th className="py-4 px-6">Outcome</th>
                  <th className="py-4 px-6 text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {logs.map((log) => {
                  const isExpanded = expandedLogId === log.id;
                  const formattedDate = new Date(log.created_at).toLocaleString();
                  const outcomeSuccess = log.outcome === 'Success';
                  
                  return (
                    <React.Fragment key={log.id}>
                      <tr className={`hover:bg-gray-50/40 transition-colors ${isExpanded ? 'bg-gray-50/30' : ''}`}>
                        <td className="py-4 px-6 text-xs text-gray-500 font-mono">
                          {formattedDate}
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex flex-col">
                            <span className="font-semibold text-gray-900 flex items-center gap-1.5">
                              <User size={13} className="text-gray-400" />
                              {log.user_name || 'System'}
                            </span>
                            <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider mt-0.5">
                              {log.user_role || 'system'}
                            </span>
                          </div>
                        </td>
                        <td className="py-4 px-6 font-medium text-gray-800">
                          {log.action}
                        </td>
                        <td className="py-4 px-6">
                          <span className="inline-flex items-center gap-1 text-xs text-gray-600 bg-gray-50 px-2 py-1 rounded-md border border-gray-100">
                            <Building size={12} className="text-gray-400" />
                            {log.target || 'N/A'}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            outcomeSuccess 
                              ? 'bg-emerald-50 text-emerald-700' 
                              : 'bg-rose-50 text-rose-700'
                          }`}>
                            {outcomeSuccess ? <CheckCircle2 size={10} /> : <XCircle size={10} />}
                            {log.outcome || 'Success'}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-right">
                          <button
                            onClick={() => toggleExpand(log.id)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-semibold text-gray-500 hover:text-[#4c58fa] hover:border-[#4c58fa]/30 transition-all bg-white"
                          >
                            {isExpanded ? (
                              <>
                                <EyeOff size={12} /> Hide
                              </>
                            ) : (
                              <>
                                <Eye size={12} /> View
                              </>
                            )}
                          </button>
                        </td>
                      </tr>
                      {isExpanded && (
                        <tr className="bg-gray-50/50">
                          <td colSpan={6} className="py-4 px-6 border-b border-gray-100">
                            <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-inner max-w-full overflow-x-auto">
                              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">
                                Metadata Details
                              </p>
                              {log.metadata ? (
                                <pre className="text-xs text-gray-700 font-mono whitespace-pre-wrap">
                                  {JSON.stringify(log.metadata, null, 2)}
                                </pre>
                              ) : (
                                <p className="text-xs italic text-gray-400">No additional metadata available for this log entry.</p>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
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
