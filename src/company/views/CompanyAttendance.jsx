import React, { useEffect, useState } from 'react';
import { CalendarDays, Clock, Play, Square, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { getEmployees } from '../../services/employees';

export default function CompanyAttendance({ companyId }) {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [logs, setLogs] = useState([]);
  const [selectedEmp, setSelectedEmp] = useState('');
  const [actionType, setActionType] = useState('In');

  useEffect(() => {
    async function load() {
      try {
        const data = await getEmployees(companyId);
        setEmployees(data);
        // Generate some mock previous logs for today
        const mockLogs = data.slice(0, 3).map((emp, i) => ({
          id: `log-${i}`,
          name: `${emp.first_name} ${emp.last_name}`,
          time: new Date(Date.now() - (i + 1) * 3600000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          type: 'In',
          status: 'On Time'
        }));
        setLogs(mockLogs);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [companyId]);

  const handleLogAction = (e) => {
    e.preventDefault();
    if (!selectedEmp) return;
    const emp = employees.find(x => x.id === selectedEmp);
    if (!emp) return;

    const newLog = {
      id: `log-${Date.now()}`,
      name: `${emp.first_name} ${emp.last_name}`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type: actionType,
      status: actionType === 'In' ? 'On Time' : 'Completed'
    };

    setLogs(prev => [newLog, ...prev]);
    setSelectedEmp('');
  };

  const todayStr = new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Attendance Board</h1>
        <p className="text-sm text-gray-500 mt-1">Clock employees in/out and view the real-time daily work logs.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Attendance Terminal Console */}
        <div className="glass-card p-6 rounded-3xl flex flex-col justify-between h-fit">
          <form onSubmit={handleLogAction} className="space-y-6">
            <div className="flex items-center gap-2 text-[#4c58fa]">
              <Clock size={18} />
              <h3 className="text-sm font-bold uppercase tracking-wider">Clocking Terminal</h3>
            </div>
            
            <div className="space-y-4">
              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Select Staff Member</label>
                <select 
                  className="input h-11"
                  value={selectedEmp}
                  onChange={e => setSelectedEmp(e.target.value)}
                  required
                >
                  <option value="">-- Choose Employee --</option>
                  {employees.map(e => (
                    <option key={e.id} value={e.id}>{e.first_name} {e.last_name} ({e.department || 'Staff'})</option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Action Type</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setActionType('In')}
                    className={`py-3 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 border transition-all ${
                      actionType === 'In'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-300 shadow-sm'
                        : 'bg-white text-gray-500 border-gray-100 hover:bg-gray-50'
                    }`}
                  >
                    <Play size={12} /> Clock In (Start)
                  </button>
                  <button
                    type="button"
                    onClick={() => setActionType('Out')}
                    className={`py-3 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 border transition-all ${
                      actionType === 'Out'
                        ? 'bg-amber-50 text-amber-700 border-amber-300 shadow-sm'
                        : 'bg-white text-gray-500 border-gray-100 hover:bg-gray-50'
                    }`}
                  >
                    <Square size={12} /> Clock Out (End)
                  </button>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={!selectedEmp}
              className="w-full btn-primary py-3 rounded-2xl font-bold text-xs shadow-lg shadow-[#4c58fa]/20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Submit Terminal Log
            </button>
          </form>
        </div>

        {/* Live log */}
        <div className="lg:col-span-2 glass-card p-6 rounded-3xl flex flex-col">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-5 mb-6">
            <div>
              <h3 className="text-base font-bold text-gray-900">Today's Check-ins</h3>
              <p className="text-xs text-gray-400 font-medium mt-0.5">{todayStr}</p>
            </div>
            <div className="flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-100 px-3 py-1.5 rounded-full text-xs font-bold">
              <CheckCircle size={13} />
              <span>All Clusters Operational</span>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto max-h-[300px] divide-y divide-gray-100 pr-2">
            {loading ? (
              <div className="py-8 text-center text-gray-400">Loading directory...</div>
            ) : logs.length === 0 ? (
              <div className="py-12 text-center text-sm text-gray-400">
                <AlertCircle className="mx-auto text-gray-300 mb-2" size={24} />
                No activities logged yet today.
              </div>
            ) : (
              logs.map(log => (
                <div key={log.id} className="flex items-center justify-between py-3.5 first:pt-0 last:pb-0">
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                      log.type === 'In' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                    }`}>
                      <Clock size={16} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{log.name}</p>
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-0.5">
                        Logged {log.type === 'In' ? 'Clock In' : 'Clock Out'}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-mono font-bold text-gray-900">{log.time}</p>
                    <span className={`inline-block text-[9px] font-bold px-2 py-0.5 rounded-full mt-1 ${
                      log.status === 'On Time' ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-500'
                    }`}>
                      {log.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
