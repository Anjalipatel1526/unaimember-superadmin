import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard, Clock, DollarSign, BarChart2, Calendar,
  Bell, CheckSquare, ChevronLeft, ChevronRight, Users, TrendingUp,
  CheckCircle, XCircle, Plus, Search, X, Trash2, UserCheck,
  RefreshCw
} from 'lucide-react';
import { supabase as supabaseAnon, supabaseAdmin } from '../services/supabase';

const supabase = supabaseAdmin || supabaseAnon;
const BRAND  = '#4F6AF7';
const BRAND2 = '#6D84FF';
const SSS_CO = 'e5396e43-28b3-455f-b75c-afb8e5b1fe43';

const NAV = [
  { name: 'Dashboard',    icon: LayoutDashboard },
  { name: 'Attendance',   icon: Clock           },
  { name: 'Salary',       icon: DollarSign      },
  { name: 'Leave',        icon: Calendar        },
  { name: 'Reports',      icon: BarChart2       },
  { name: 'Daily Alerts', icon: Bell            },
  { name: 'Tasks',        icon: CheckSquare     },
];

const Badge = ({ label, color = 'indigo' }) => {
  const map = {
    indigo: 'bg-indigo-50 text-indigo-700 border-indigo-100',
    green:  'bg-emerald-50 text-emerald-700 border-emerald-100',
    red:    'bg-red-50 text-red-600 border-red-100',
    yellow: 'bg-amber-50 text-amber-700 border-amber-100',
    gray:   'bg-gray-50 text-gray-500 border-gray-200',
  };
  return (
    <span className={`inline-flex items-center text-[10px] font-semibold px-2 py-0.5 rounded-full border ${map[color] || map.gray}`}>
      {label}
    </span>
  );
};

const StatCard = ({ icon: Icon, label, value, sub, color = BRAND }) => (
  <div className="bg-white border border-gray-100 rounded-2xl p-5 flex items-start gap-4 shadow-sm hover:shadow-md transition-shadow">
    <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${color}18` }}>
      <Icon size={20} style={{ color }} />
    </div>
    <div>
      <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest">{label}</p>
      <p className="text-2xl font-extrabold text-gray-900 mt-0.5 leading-none" style={{ fontFamily: "'Inter', sans-serif" }}>{value}</p>
      {sub && <p className="text-[11px] text-gray-400 mt-1">{sub}</p>}
    </div>
  </div>
);

const TH = ({ cols }) => (
  <thead>
    <tr className="border-b border-gray-100">
      {cols.map(h => (
        <th key={h} className="text-left py-2.5 px-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">{h}</th>
      ))}
    </tr>
  </thead>
);

export default function SSSManagerDashboard() {
  const [activeTab,    setActiveTab]    = useState('Dashboard');
  const [sidebarOpen,  setSidebarOpen]  = useState(true);
  const [loading,      setLoading]      = useState(true);
  const [employees,    setEmployees]    = useState([]);
  const [attendance,   setAttendance]   = useState([]);
  const [leaves,       setLeaves]       = useState([]);
  const [alerts,       setAlerts]       = useState([]);
  const [tasks,        setTasks]        = useState([]);
  const [attDate,      setAttDate]      = useState(new Date().toISOString().split('T')[0]);
  const [attSearch,    setAttSearch]    = useState('');
  const [leaveFilter,  setLeaveFilter]  = useState('all');
  const [taskInput,    setTaskInput]    = useState('');
  const [taskPriority, setTaskPriority] = useState('Medium');
  const [alertInput,   setAlertInput]   = useState('');
  const [alertType,    setAlertType]    = useState('info');
  const [saving,       setSaving]       = useState(false);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [empRes, attRes, lvRes] = await Promise.all([
        supabase.from('sss_employees').select('*').eq('company_id', SSS_CO),
        supabase.from('attendance_logs').select('*').eq('company_id', SSS_CO),
        supabase.from('leave_requests').select('*').eq('company_id', SSS_CO),
      ]);
      setEmployees(empRes.data  || []);
      setAttendance(attRes.data || []);
      setLeaves(lvRes.data      || []);

      const { data: taskData } = await supabase
        .from('notifications').select('*')
        .eq('company_id', SSS_CO).eq('type', 'manager_task')
        .order('created_at', { ascending: false });
      setTasks(taskData || []);

      const { data: alertData } = await supabase
        .from('notifications').select('*')
        .eq('company_id', SSS_CO).eq('type', 'manager_alert')
        .order('created_at', { ascending: false });
      setAlerts(alertData || []);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  useEffect(() => { fetchAll(); }, []);

  const today        = new Date().toISOString().split('T')[0];
  const todayAtt     = attendance.filter(a => a.date === today);
  const presentToday = todayAtt.filter(a => a.status === 'Present').length;
  const absentToday  = todayAtt.filter(a => a.status === 'Absent').length;
  const pendingLeaves= leaves.filter(l => l.status === 'Pending').length;
  const totalSalary  = employees.reduce((s, e) => s + (e.basic_salary || 0), 0);

  const filteredAtt = attendance.filter(a => {
    const matchDate = !attDate || a.date === attDate;
    const emp  = employees.find(e => e.id === a.employee_id);
    const name = emp ? `${emp.first_name} ${emp.last_name}`.toLowerCase() : '';
    return matchDate && (!attSearch || name.includes(attSearch.toLowerCase()));
  });

  const filteredLeaves = leaveFilter === 'all'
    ? leaves
    : leaves.filter(l => l.status === leaveFilter);

  const empName = (id) => {
    const e = employees.find(e => e.id === id);
    return e ? `${e.first_name} ${e.last_name}` : 'Unknown';
  };

  const handleAddTask = async () => {
    if (!taskInput.trim()) return;
    setSaving(true);
    await supabase.from('notifications').insert({
      company_id: SSS_CO, user_id: null, type: 'manager_task',
      title: taskInput.trim(), body: taskPriority, is_read: false,
    });
    setTaskInput('');
    await fetchAll();
    setSaving(false);
  };

  const handleToggleTask = async (task) => {
    await supabase.from('notifications').update({ is_read: !task.is_read }).eq('id', task.id);
    setTasks(prev => prev.map(t => t.id === task.id ? { ...t, is_read: !t.is_read } : t));
  };

  const handleDeleteTask = async (id) => {
    await supabase.from('notifications').delete().eq('id', id);
    setTasks(prev => prev.filter(t => t.id !== id));
  };

  const handleAddAlert = async () => {
    if (!alertInput.trim()) return;
    setSaving(true);
    await supabase.from('notifications').insert({
      company_id: SSS_CO, user_id: null, type: 'manager_alert',
      title: alertInput.trim(), body: alertType, is_read: false,
    });
    setAlertInput('');
    await fetchAll();
    setSaving(false);
  };

  const handleDeleteAlert = async (id) => {
    await supabase.from('notifications').delete().eq('id', id);
    setAlerts(prev => prev.filter(a => a.id !== id));
  };

  const handleLeaveAction = async (id, status) => {
    await supabase.from('leave_requests').update({ status }).eq('id', id);
    setLeaves(prev => prev.map(l => l.id === id ? { ...l, status } : l));
  };

  const ALERT_STYLE = {
    info:    { bg: '#eff6ff', border: '#bfdbfe', icon: 'ℹ️', text: '#1d4ed8' },
    warning: { bg: '#fffbeb', border: '#fde68a', icon: '⚠️', text: '#92400e' },
    success: { bg: '#ecfdf5', border: '#a7f3d0', icon: '✅', text: '#065f46' },
    urgent:  { bg: '#fef2f2', border: '#fecaca', icon: '🔴', text: '#991b1b' },
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50" style={{ fontFamily: "'Inter', sans-serif" }}>

      {/* ── SIDEBAR ── */}
      <aside
        className="flex flex-col shrink-0 bg-white border-r border-gray-100 shadow-sm transition-all duration-300"
        style={{ width: sidebarOpen ? 220 : 64 }}
      >
        <div className="flex items-center gap-3 px-4 h-16 border-b border-gray-100">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0" style={{ background: BRAND }}>
            <span className="text-white font-black text-xs">SSS</span>
          </div>
          {sidebarOpen && (
            <div className="min-w-0">
              <p className="font-extrabold text-sm text-gray-900 leading-none truncate">Manager Portal</p>
              <p className="text-[9px] text-gray-400 font-medium mt-0.5 truncate">Story Seed Studio</p>
            </div>
          )}
          <button onClick={() => setSidebarOpen(o => !o)} className="ml-auto text-gray-400 hover:text-gray-700 transition-colors shrink-0">
            {sidebarOpen ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
          </button>
        </div>

        <nav className="flex-1 px-2 py-4 space-y-0.5 overflow-y-auto">
          {NAV.map(({ name, icon: Icon }) => {
            const active = activeTab === name;
            return (
              <button
                key={name}
                onClick={() => setActiveTab(name)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all ${
                  active ? 'text-white font-bold shadow-sm' : 'text-gray-500 hover:bg-gray-50 font-medium'
                }`}
                style={active ? { background: `linear-gradient(135deg, ${BRAND}, ${BRAND2})` } : {}}
                title={!sidebarOpen ? name : undefined}
              >
                <Icon size={17} className="shrink-0" />
                {sidebarOpen && <span className="text-[13px] truncate">{name}</span>}
              </button>
            );
          })}
        </nav>

        <div className={`px-3 py-4 border-t border-gray-100 ${sidebarOpen ? '' : 'flex justify-center'}`}>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-xs shrink-0" style={{ background: BRAND }}>
              M
            </div>
            {sidebarOpen && (
              <div className="min-w-0">
                <p className="text-xs font-bold text-gray-800 truncate">Manager</p>
                <p className="text-[9px] text-gray-400 truncate">Story Seed Studio</p>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* ── MAIN ── */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-16 bg-white border-b border-gray-100 flex items-center px-6 gap-4 shrink-0 shadow-sm">
          <h1 className="text-base font-extrabold text-gray-900 tracking-tight">{activeTab}</h1>
          <span className="ml-2 text-[11px] text-gray-400 font-medium hidden sm:block">
            {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </span>
          <div className="ml-auto">
            <button onClick={fetchAll} className="p-2 rounded-xl hover:bg-gray-50 text-gray-400 hover:text-gray-700 transition-colors" title="Refresh">
              <RefreshCw size={15} />
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {loading ? (
            <div className="flex items-center justify-center h-60">
              <div className="w-8 h-8 rounded-full border-2 animate-spin" style={{ borderColor: BRAND, borderTopColor: 'transparent' }} />
            </div>
          ) : (
            <>
              {/* ─── DASHBOARD ─── */}
              {activeTab === 'Dashboard' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCard icon={Users}     label="Total Employees" value={employees.length}     sub={`${employees.filter(e=>e.is_active).length} active`} color={BRAND} />
                    <StatCard icon={UserCheck} label="Present Today"   value={presentToday}          sub={`${absentToday} absent`}  color="#10b981" />
                    <StatCard icon={Calendar}  label="Pending Leaves"  value={pendingLeaves}          sub="awaiting approval"        color="#f59e0b" />
                    <StatCard icon={DollarSign}label="Total Payroll"   value={`₹${(totalSalary/1000).toFixed(0)}K`} sub="monthly basic" color="#8b5cf6" />
                  </div>

                  <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-sm font-extrabold text-gray-900">Today's Attendance</h2>
                      <span className="text-[11px] text-gray-400">{today}</span>
                    </div>
                    {todayAtt.length === 0 ? (
                      <p className="text-center text-gray-400 text-sm py-8">No attendance records for today yet.</p>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <TH cols={['Employee', 'Check In', 'Check Out', 'Status']} />
                          <tbody className="divide-y divide-gray-50">
                            {todayAtt.slice(0, 8).map(a => (
                              <tr key={a.id} className="hover:bg-gray-50/50 transition-colors">
                                <td className="py-2.5 px-4 font-semibold text-gray-800">{empName(a.employee_id)}</td>
                                <td className="py-2.5 px-4 text-gray-500">{a.check_in || '—'}</td>
                                <td className="py-2.5 px-4 text-gray-500">{a.check_out || '—'}</td>
                                <td className="py-2.5 px-4"><Badge label={a.status || 'Present'} color={a.status === 'Absent' ? 'red' : 'green'} /></td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
                      <h2 className="text-sm font-extrabold text-gray-900 mb-4">Recent Leave Requests</h2>
                      {leaves.slice(0, 4).length === 0 ? (
                        <p className="text-sm text-gray-400 text-center py-6">No leave requests.</p>
                      ) : leaves.slice(0, 4).map(l => (
                        <div key={l.id} className="flex items-center justify-between gap-2 p-2.5 bg-gray-50 rounded-xl mb-2">
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-gray-800 truncate">{empName(l.employee_id)}</p>
                            <p className="text-[10px] text-gray-400 mt-0.5">{l.leave_type} · {l.start_date}</p>
                          </div>
                          <Badge label={l.status} color={l.status==='Approved'?'green':l.status==='Rejected'?'red':'yellow'} />
                        </div>
                      ))}
                    </div>
                    <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
                      <h2 className="text-sm font-extrabold text-gray-900 mb-4">Active Tasks</h2>
                      {tasks.filter(t => !t.is_read).length === 0 ? (
                        <p className="text-sm text-gray-400 text-center py-6">No pending tasks. 🎉</p>
                      ) : tasks.filter(t => !t.is_read).slice(0, 4).map(task => (
                        <div key={task.id} className="flex items-center gap-2 p-2.5 bg-gray-50 rounded-xl mb-2">
                          <div className="w-2 h-2 rounded-full shrink-0" style={{ background: task.body==='High'?'#ef4444':task.body==='Medium'?'#f59e0b':'#10b981' }} />
                          <p className="text-xs font-semibold text-gray-800 flex-1 truncate">{task.title}</p>
                          <Badge label={task.body} color={task.body==='High'?'red':task.body==='Medium'?'yellow':'green'} />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* ─── ATTENDANCE ─── */}
              {activeTab === 'Attendance' && (
                <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
                    <h2 className="text-sm font-extrabold text-gray-900">Attendance Records</h2>
                    <div className="flex items-center gap-2">
                      <div className="relative">
                        <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input value={attSearch} onChange={e => setAttSearch(e.target.value)} placeholder="Search employee…"
                          className="pl-8 pr-3 h-9 text-xs rounded-xl border border-gray-200 focus:outline-none focus:border-indigo-400 w-44" />
                      </div>
                      <input type="date" value={attDate} onChange={e => setAttDate(e.target.value)}
                        className="h-9 text-xs rounded-xl border border-gray-200 px-3 focus:outline-none focus:border-indigo-400" />
                    </div>
                  </div>
                  {filteredAtt.length === 0 ? (
                    <p className="text-sm text-gray-400 text-center py-10">No records found.</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <TH cols={['Employee', 'Date', 'Check In', 'Check Out', 'Status', 'Hours']} />
                        <tbody className="divide-y divide-gray-50">
                          {filteredAtt.map(a => {
                            let hrs = '—';
                            if (a.check_in && a.check_out) {
                              const [ih, im] = a.check_in.split(':').map(Number);
                              const [oh, om] = a.check_out.split(':').map(Number);
                              const diff = (oh*60+om) - (ih*60+im);
                              if (diff > 0) hrs = `${Math.floor(diff/60)}h ${diff%60}m`;
                            }
                            return (
                              <tr key={a.id} className="hover:bg-gray-50/50 transition-colors">
                                <td className="py-3 px-4 font-semibold text-gray-800">{empName(a.employee_id)}</td>
                                <td className="py-3 px-4 text-gray-500 text-xs">{a.date}</td>
                                <td className="py-3 px-4 text-gray-500">{a.check_in || '—'}</td>
                                <td className="py-3 px-4 text-gray-500">{a.check_out || '—'}</td>
                                <td className="py-3 px-4"><Badge label={a.status || 'Present'} color={a.status==='Absent'?'red':'green'} /></td>
                                <td className="py-3 px-4 text-gray-600 font-medium">{hrs}</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* ─── SALARY ─── */}
              {activeTab === 'Salary' && (
                <div className="space-y-5">
                  <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                    <StatCard icon={DollarSign} label="Total Payroll"  value={`₹${totalSalary.toLocaleString('en-IN')}`}  sub="monthly basic"   color={BRAND}    />
                    <StatCard icon={Users}      label="On Payroll"     value={employees.length}                            sub="employees"        color="#10b981"  />
                    <StatCard icon={TrendingUp} label="Avg. Salary"    value={employees.length ? `₹${Math.round(totalSalary/employees.length).toLocaleString('en-IN')}` : '₹0'} sub="per employee" color="#8b5cf6" />
                  </div>
                  <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
                    <h2 className="text-sm font-extrabold text-gray-900 mb-5">Salary Breakdown</h2>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <TH cols={['Employee', 'Designation', 'Basic Salary', 'Status']} />
                        <tbody className="divide-y divide-gray-50">
                          {employees.map(emp => (
                            <tr key={emp.id} className="hover:bg-gray-50/50 transition-colors">
                              <td className="py-3 px-4 font-semibold text-gray-800">{emp.first_name} {emp.last_name}</td>
                              <td className="py-3 px-4 text-gray-500 text-xs">{emp.designation || '—'}</td>
                              <td className="py-3 px-4 font-bold text-gray-900">₹{(emp.basic_salary||0).toLocaleString('en-IN')}</td>
                              <td className="py-3 px-4"><Badge label={emp.is_active?'Active':'Inactive'} color={emp.is_active?'green':'gray'} /></td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* ─── LEAVE ─── */}
              {activeTab === 'Leave' && (
                <div className="space-y-5">
                  <div className="grid grid-cols-3 gap-4">
                    <StatCard icon={Calendar}   label="Pending"  value={leaves.filter(l=>l.status==='Pending').length}  color="#f59e0b" />
                    <StatCard icon={CheckCircle} label="Approved" value={leaves.filter(l=>l.status==='Approved').length} color="#10b981" />
                    <StatCard icon={XCircle}    label="Rejected" value={leaves.filter(l=>l.status==='Rejected').length} color="#ef4444" />
                  </div>
                  <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-sm font-extrabold text-gray-900">Leave Requests</h2>
                      <div className="flex items-center gap-1.5">
                        {['all','Pending','Approved','Rejected'].map(f => (
                          <button key={f} onClick={() => setLeaveFilter(f)}
                            className={`px-3 h-7 text-[11px] font-semibold rounded-xl transition-all ${leaveFilter===f?'text-white':'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
                            style={leaveFilter===f?{background:BRAND}:{}}
                          >{f==='all'?'All':f}</button>
                        ))}
                      </div>
                    </div>
                    {filteredLeaves.length === 0 ? (
                      <p className="text-sm text-gray-400 text-center py-10">No leave requests found.</p>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <TH cols={['Employee','Type','From','To','Reason','Status','Action']} />
                          <tbody className="divide-y divide-gray-50">
                            {filteredLeaves.map(l => (
                              <tr key={l.id} className="hover:bg-gray-50/50 transition-colors">
                                <td className="py-3 px-3 font-semibold text-gray-800 whitespace-nowrap">{empName(l.employee_id)}</td>
                                <td className="py-3 px-3 text-gray-500 text-xs">{l.leave_type}</td>
                                <td className="py-3 px-3 text-gray-500 text-xs">{l.start_date}</td>
                                <td className="py-3 px-3 text-gray-500 text-xs">{l.end_date}</td>
                                <td className="py-3 px-3 text-gray-500 text-xs max-w-[120px] truncate">{l.reason||'—'}</td>
                                <td className="py-3 px-3"><Badge label={l.status} color={l.status==='Approved'?'green':l.status==='Rejected'?'red':'yellow'} /></td>
                                <td className="py-3 px-3">
                                  {l.status === 'Pending' && (
                                    <div className="flex items-center gap-1">
                                      <button onClick={() => handleLeaveAction(l.id,'Approved')} className="w-6 h-6 flex items-center justify-center rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-600 transition-colors" title="Approve"><CheckCircle size={12}/></button>
                                      <button onClick={() => handleLeaveAction(l.id,'Rejected')} className="w-6 h-6 flex items-center justify-center rounded-lg bg-red-50 hover:bg-red-100 text-red-500 transition-colors" title="Reject"><XCircle size={12}/></button>
                                    </div>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ─── REPORTS ─── */}
              {activeTab === 'Reports' && (
                <div className="space-y-5">
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCard icon={Users}      label="Total Employees"    value={employees.length}                       color={BRAND}    />
                    <StatCard icon={UserCheck}  label="Attendance Records" value={attendance.length}                     color="#10b981"  />
                    <StatCard icon={Calendar}   label="Leave Requests"     value={leaves.length}                         color="#f59e0b"  />
                    <StatCard icon={DollarSign} label="Monthly Payroll"    value={`₹${(totalSalary/1000).toFixed(0)}K`} color="#8b5cf6"  />
                  </div>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
                      <h2 className="text-sm font-extrabold text-gray-900 mb-4">Attendance Summary</h2>
                      {[
                        {label:'Present',value:attendance.filter(a=>a.status==='Present').length,color:'#10b981'},
                        {label:'Absent', value:attendance.filter(a=>a.status==='Absent').length, color:'#ef4444'},
                        {label:'Late',   value:attendance.filter(a=>a.status==='Late').length,   color:'#f59e0b'},
                      ].map(({label,value,color}) => (
                        <div key={label} className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
                          <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full" style={{background:color}}/><span className="text-sm font-medium text-gray-700">{label}</span></div>
                          <span className="text-sm font-extrabold text-gray-900">{value}</span>
                        </div>
                      ))}
                    </div>
                    <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
                      <h2 className="text-sm font-extrabold text-gray-900 mb-4">Leave Summary</h2>
                      {[
                        {label:'Pending', value:leaves.filter(l=>l.status==='Pending').length,  color:'#f59e0b'},
                        {label:'Approved',value:leaves.filter(l=>l.status==='Approved').length, color:'#10b981'},
                        {label:'Rejected',value:leaves.filter(l=>l.status==='Rejected').length, color:'#ef4444'},
                      ].map(({label,value,color}) => (
                        <div key={label} className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
                          <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full" style={{background:color}}/><span className="text-sm font-medium text-gray-700">{label}</span></div>
                          <span className="text-sm font-extrabold text-gray-900">{value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
                    <h2 className="text-sm font-extrabold text-gray-900 mb-4">Employee Overview</h2>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <TH cols={['Name','Designation','Salary','Att. Days','Leave Days','Status']} />
                        <tbody className="divide-y divide-gray-50">
                          {employees.map(emp => (
                            <tr key={emp.id} className="hover:bg-gray-50/50 transition-colors">
                              <td className="py-3 px-4 font-semibold text-gray-800">{emp.first_name} {emp.last_name}</td>
                              <td className="py-3 px-4 text-gray-500 text-xs">{emp.designation||'—'}</td>
                              <td className="py-3 px-4 font-bold text-gray-900">₹{(emp.basic_salary||0).toLocaleString('en-IN')}</td>
                              <td className="py-3 px-4 text-gray-600">{attendance.filter(a=>a.employee_id===emp.id&&a.status==='Present').length}</td>
                              <td className="py-3 px-4 text-gray-600">{leaves.filter(l=>l.employee_id===emp.id&&l.status==='Approved').length}</td>
                              <td className="py-3 px-4"><Badge label={emp.is_active?'Active':'Inactive'} color={emp.is_active?'green':'gray'} /></td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* ─── DAILY ALERTS ─── */}
              {activeTab === 'Daily Alerts' && (
                <div className="space-y-5">
                  <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
                    <h2 className="text-sm font-extrabold text-gray-900 mb-4">Create Daily Alert</h2>
                    <div className="flex flex-col sm:flex-row gap-3">
                      <input value={alertInput} onChange={e => setAlertInput(e.target.value)} placeholder="Write your alert message…"
                        className="flex-1 h-10 px-4 text-sm rounded-xl border border-gray-200 focus:outline-none focus:border-indigo-400"
                        onKeyDown={e => e.key==='Enter' && handleAddAlert()} />
                      <select value={alertType} onChange={e => setAlertType(e.target.value)}
                        className="h-10 px-3 text-sm rounded-xl border border-gray-200 focus:outline-none focus:border-indigo-400">
                        <option value="info">ℹ️ Info</option>
                        <option value="warning">⚠️ Warning</option>
                        <option value="success">✅ Success</option>
                        <option value="urgent">🔴 Urgent</option>
                      </select>
                      <button onClick={handleAddAlert} disabled={saving}
                        className="h-10 px-5 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all"
                        style={{background: BRAND}}>
                        <Plus size={13}/> Post Alert
                      </button>
                    </div>
                  </div>
                  <div className="space-y-3">
                    {alerts.length === 0 ? (
                      <div className="bg-white border border-gray-100 rounded-2xl p-10 text-center shadow-sm">
                        <Bell size={28} className="text-gray-200 mx-auto mb-2"/>
                        <p className="text-sm text-gray-400 font-medium">No alerts posted yet.</p>
                      </div>
                    ) : alerts.map(a => {
                      const s = ALERT_STYLE[a.body] || ALERT_STYLE.info;
                      return (
                        <div key={a.id} className="flex items-start gap-3 p-4 rounded-2xl border" style={{background:s.bg, borderColor:s.border}}>
                          <span className="text-lg shrink-0 mt-0.5">{s.icon}</span>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold leading-snug" style={{color:s.text}}>{a.title}</p>
                            <p className="text-[10px] text-gray-400 mt-1">{new Date(a.created_at).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'})}</p>
                          </div>
                          <button onClick={() => handleDeleteAlert(a.id)} className="shrink-0 w-7 h-7 flex items-center justify-center rounded-lg hover:bg-black/10 text-gray-400 hover:text-gray-600 transition-colors">
                            <X size={13}/>
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* ─── TASKS ─── */}
              {activeTab === 'Tasks' && (
                <div className="space-y-5">
                  <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
                    <h2 className="text-sm font-extrabold text-gray-900 mb-4">Add New Task</h2>
                    <div className="flex flex-col sm:flex-row gap-3">
                      <input value={taskInput} onChange={e => setTaskInput(e.target.value)} placeholder="Task description…"
                        className="flex-1 h-10 px-4 text-sm rounded-xl border border-gray-200 focus:outline-none focus:border-indigo-400"
                        onKeyDown={e => e.key==='Enter' && handleAddTask()} />
                      <select value={taskPriority} onChange={e => setTaskPriority(e.target.value)}
                        className="h-10 px-3 text-sm rounded-xl border border-gray-200 focus:outline-none focus:border-indigo-400">
                        <option value="High">🔴 High</option>
                        <option value="Medium">🟡 Medium</option>
                        <option value="Low">🟢 Low</option>
                      </select>
                      <button onClick={handleAddTask} disabled={saving}
                        className="h-10 px-5 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all"
                        style={{background: BRAND}}>
                        <Plus size={13}/> Add Task
                      </button>
                    </div>
                  </div>
                  <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
                    <h2 className="text-sm font-extrabold text-gray-900 mb-4">Pending Tasks <span className="text-gray-400 font-normal">({tasks.filter(t=>!t.is_read).length})</span></h2>
                    {tasks.filter(t=>!t.is_read).length === 0 ? (
                      <p className="text-sm text-gray-400 text-center py-8">🎉 All tasks completed!</p>
                    ) : tasks.filter(t=>!t.is_read).map(task => (
                      <div key={task.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100 hover:border-indigo-100 transition-colors group mb-2">
                        <button onClick={() => handleToggleTask(task)} className="w-5 h-5 rounded-full border-2 border-gray-300 hover:border-indigo-400 shrink-0 transition-colors"/>
                        <div className="w-2 h-2 rounded-full shrink-0" style={{background:task.body==='High'?'#ef4444':task.body==='Medium'?'#f59e0b':'#10b981'}}/>
                        <p className="flex-1 text-sm font-semibold text-gray-800">{task.title}</p>
                        <Badge label={task.body} color={task.body==='High'?'red':task.body==='Medium'?'yellow':'green'} />
                        <button onClick={() => handleDeleteTask(task.id)} className="w-6 h-6 flex items-center justify-center rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100">
                          <Trash2 size={11}/>
                        </button>
                      </div>
                    ))}
                  </div>
                  {tasks.filter(t=>t.is_read).length > 0 && (
                    <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
                      <h2 className="text-sm font-extrabold text-gray-900 mb-4">Completed <span className="text-gray-400 font-normal">({tasks.filter(t=>t.is_read).length})</span></h2>
                      {tasks.filter(t=>t.is_read).map(task => (
                        <div key={task.id} className="flex items-center gap-3 p-3 bg-gray-50/50 rounded-xl opacity-60 mb-2">
                          <button onClick={() => handleToggleTask(task)} className="w-5 h-5 rounded-full bg-indigo-100 border-2 border-indigo-400 flex items-center justify-center shrink-0">
                            <CheckCircle size={10} className="text-indigo-600"/>
                          </button>
                          <p className="flex-1 text-sm text-gray-400 line-through">{task.title}</p>
                          <button onClick={() => handleDeleteTask(task.id)} className="w-6 h-6 flex items-center justify-center rounded-lg text-gray-300 hover:text-red-500 transition-colors">
                            <Trash2 size={11}/>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}
