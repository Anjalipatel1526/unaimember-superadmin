import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Clock, DollarSign, BarChart2, Calendar,
  Bell, CheckSquare, ChevronLeft, ChevronRight, Users, TrendingUp,
  CheckCircle, XCircle, Plus, Search, X, Trash2, UserCheck,
  RefreshCw, Edit, Eye, Copy, AlertTriangle, Star, ClipboardList,
  Upload, FileText, MoreVertical, Filter, Download, Send,
  AlertCircle, PlayCircle, PauseCircle, RotateCcw, LogOut
} from 'lucide-react';
import { supabase as supabaseAnon, supabaseAdmin, resolveTenantTableName } from '../services/supabase';
import ManagerEmployees from './ManagerEmployees';

const supabase = supabaseAdmin || supabaseAnon;
const BRAND  = '#4F6AF7';
const BRAND2 = '#6D84FF';
let SSS_CO = '593164de-58d8-4e10-992a-fb0f9382cf42';

const NAV = [
  { name: 'Dashboard',    icon: LayoutDashboard },
  { name: 'Employees',    icon: Users           },
  { name: 'Attendance',   icon: Clock           },
  { name: 'Salary',       icon: DollarSign      },
  { name: 'Leave',        icon: Calendar        },
  { name: 'Reports',      icon: BarChart2       },
  { name: 'Daily Alerts', icon: Bell            },
  { name: 'Tasks',        icon: CheckSquare     },
];

const PRIORITIES = ['Low', 'Medium', 'High', 'Critical'];
const STATUSES   = ['Pending','Accepted','In Progress','Paused','Completed','Approved','Rejected','Revision Required','Cancelled'];
const CATEGORIES = ['Development','Design','Marketing','Operations','HR','Finance','Support','Research','Other'];

const PRIORITY_COLORS = {
  Low:      { bg: '#f0fdf4', text: '#16a34a', border: '#bbf7d0' },
  Medium:   { bg: '#fffbeb', text: '#d97706', border: '#fde68a' },
  High:     { bg: '#fff7ed', text: '#ea580c', border: '#fdba74' },
  Critical: { bg: '#fef2f2', text: '#dc2626', border: '#fecaca' },
};

const STATUS_COLORS = {
  'Pending':          { bg: '#f9fafb', text: '#6b7280', border: '#e5e7eb' },
  'Accepted':         { bg: '#eff6ff', text: '#2563eb', border: '#bfdbfe' },
  'In Progress':      { bg: '#f0fdf4', text: '#16a34a', border: '#bbf7d0' },
  'Paused':           { bg: '#fffbeb', text: '#d97706', border: '#fde68a' },
  'Completed':        { bg: '#ecfdf5', text: '#059669', border: '#a7f3d0' },
  'Approved':         { bg: '#f0fdf4', text: '#15803d', border: '#86efac' },
  'Rejected':         { bg: '#fef2f2', text: '#dc2626', border: '#fecaca' },
  'Revision Required':{ bg: '#fdf4ff', text: '#9333ea', border: '#e9d5ff' },
  'Cancelled':        { bg: '#f9fafb', text: '#9ca3af', border: '#e5e7eb' },
};

const DEFAULT_TASK = {
  task_title: '', task_description: '', project_name: '', priority: 'Medium',
  category: '', start_date: '', due_date: '', estimated_hours: '',
  instructions: '', remarks: '', department_id: '', status: 'Pending',
};

const Badge = ({ label, colorMap }) => {
  const s = colorMap?.[label] || { bg: '#f9fafb', text: '#6b7280', border: '#e5e7eb' };
  return (
    <span className="inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded-full border" style={{ background: s.bg, color: s.text, borderColor: s.border }}>
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
      <p className="text-2xl font-extrabold text-gray-900 mt-0.5 leading-none">{value}</p>
      {sub && <p className="text-[11px] text-gray-400 mt-1">{sub}</p>}
    </div>
  </div>
);

const TH = ({ cols }) => (
  <thead>
    <tr className="border-b border-gray-100">
      {cols.map(h => <th key={h} className="text-left py-2.5 px-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest whitespace-nowrap">{h}</th>)}
    </tr>
  </thead>
);

/* ═══════ STAR RATING ═══════ */
const StarRating = ({ value, onChange }) => (
  <div className="flex gap-1">
    {[1,2,3,4,5].map(n => (
      <button key={n} onClick={() => onChange(n)} className="transition-transform hover:scale-110">
        <Star size={18} fill={n <= value ? '#f59e0b' : 'none'} color={n <= value ? '#f59e0b' : '#d1d5db'} />
      </button>
    ))}
  </div>
);

/* ═══════════════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════════════ */
export default function SSSManagerDashboard() {
  const { companySlug } = useParams();
  const navigate = useNavigate();
  const [manager, setManager] = useState(null);
  const [company, setCompany] = useState(null);
  const [activeTab,     setActiveTab]     = useState('Dashboard');
  const [sidebarOpen,   setSidebarOpen]   = useState(true);
  const [loading,       setLoading]       = useState(true);

  /* ── Core data ── */
  const [employees,    setEmployees]    = useState([]);
  const [departments,  setDepartments]  = useState([]);
  const [attendance,   setAttendance]   = useState([]);
  const [leaves,       setLeaves]       = useState([]);
  const [alerts,       setAlerts]       = useState([]);

  /* ── Task data ── */
  const [tasks,           setTasks]           = useState([]);
  const [taskAssignments, setTaskAssignments] = useState([]);
  const [taskFeedback,    setTaskFeedback]    = useState([]);
  const [taskReviews,     setTaskReviews]     = useState([]);
  const [taskProgress,    setTaskProgress]    = useState([]);   // sss_task_progress rows
  const [taskReports,     setTaskReports]     = useState([]);   // task_status_report notifications

  /* ── Task UI state ── */
  const [taskSubTab,       setTaskSubTab]       = useState('Task List');
  const [taskView,         setTaskView]         = useState('list');   // 'list' | 'create' | 'edit' | 'detail'
  const [selectedTask,     setSelectedTask]     = useState(null);
  const [taskForm,         setTaskForm]         = useState(DEFAULT_TASK);
  const [selectedAssignees,setSelectedAssignees]= useState([]);
  const [assignmentMode,   setAssignmentMode]   = useState('single'); // 'single' | 'all'
  const [savingTask,       setSavingTask]       = useState(false);
  const [taskFilters,      setTaskFilters]      = useState({ status: 'all', priority: 'all', search: '' });
  const [reviewForm,       setReviewForm]       = useState({ decision: '', comments: '', rating: 5 });
  const [reviewingTask,    setReviewingTask]    = useState(null);
  const [savingReview,     setSavingReview]     = useState(false);
  const [selectedEmpDetail, setSelectedEmpDetail] = useState(null); // for employee task card modal
  const [empDetailTab, setEmpDetailTab] = useState('tasks'); // 'tasks' | 'leaves'
  const [breakdownStatusDetails, setBreakdownStatusDetails] = useState(null); // holds status name like 'Accepted'
  const [deleteConfirm, setDeleteConfirm] = useState(null); // delete confirmation dialog state

  /* ── Alerts/Daily tab state ── */
  const [alertInput,   setAlertInput]   = useState('');
  const [alertType,    setAlertType]    = useState('info');
  const [attDate,      setAttDate]      = useState(new Date().toISOString().split('T')[0]);
  const [attSearch,    setAttSearch]    = useState('');
  const [leaveFilter,  setLeaveFilter]  = useState('all');
  const [saving,       setSaving]       = useState(false);

  // Load session from localStorage + fetch fresh company data
  useEffect(() => {
    const saved = localStorage.getItem('unai_manager_session');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setManager(parsed.employeeDetails);
        setCompany(parsed.companyDetails);
        SSS_CO = parsed.companyId;
      } catch (e) {
        localStorage.removeItem('unai_manager_session');
        navigate(`/${companySlug || 'sss'}/login`, { replace: true });
      }
    } else {
      navigate(`/${companySlug || 'sss'}/login`, { replace: true });
    }
  }, [companySlug, navigate]);

  /* ─────────────── FETCH ALL DATA ─────────────── */
  const fetchAll = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const empTable = await resolveTenantTableName(SSS_CO, 'employees');
      const deptTable = 'departments'; // departments table is shared or keep as is
      const attTable = await resolveTenantTableName(SSS_CO, 'attendance');
      const leaveTable = await resolveTenantTableName(SSS_CO, 'leave_requests');

      const [empRes, deptRes, attRes, lvRes] = await Promise.all([
        supabase.from(empTable).select('*').eq('company_id', SSS_CO),
        supabase.from(deptTable).select('*').eq('company_id', SSS_CO),
        supabase.from(attTable).select('*').eq('company_id', SSS_CO),
        supabase.from(leaveTable).select('*').eq('company_id', SSS_CO),
      ]);
      setEmployees(empRes.data  || []);
      setDepartments(deptRes.data || []);
      setAttendance(attRes.data || []);
      setLeaves(lvRes.data      || []);

      const notifTable = await resolveTenantTableName(SSS_CO, 'notifications');
      const { data: alertData } = await supabase
        .from(notifTable).select('*')
        .eq('company_id', SSS_CO).eq('type', 'manager_alert')
        .order('created_at', { ascending: false });
      setAlerts(alertData || []);

      await fetchTasks();
    } catch (e) { console.error(e); }
    if (!silent) setLoading(false);
  }, []);

  const fetchTasks = async () => {
    try {
      const notifTable = await resolveTenantTableName(SSS_CO, 'notifications');
      const [taskRes, assignRes, fbRes, revRes, progressRes, reportRes] = await Promise.all([
        supabase.from('sss_tasks').select('*').eq('company_id', SSS_CO).order('created_at', { ascending: false }),
        supabase.from('sss_task_assignments').select('*'),
        supabase.from('sss_task_feedback').select('*'),
        supabase.from('sss_task_reviews').select('*'),
        supabase.from('sss_task_progress').select('*').order('created_at', { ascending: false }),
        supabase.from(notifTable).select('*').eq('company_id', SSS_CO).eq('type', 'task_status_report').order('created_at', { ascending: false }),
      ]);

      if (taskRes.error) console.error('Supabase tasks error:', taskRes.error);
      if (assignRes.error) console.error('Supabase task assignments error:', assignRes.error);
      if (fbRes.error) console.error('Supabase task feedback error:', fbRes.error);
      if (revRes.error) console.error('Supabase task reviews error:', revRes.error);

      setTasks(taskRes.data         || []);
      setTaskAssignments(assignRes.data || []);
      setTaskFeedback(fbRes.data    || []);
      setTaskReviews(revRes.data    || []);
      setTaskProgress(progressRes.data || []);
      setTaskReports(reportRes.data || []);
    } catch (e) {
      console.error('fetchTasks error:', e);
    }
  };

  useEffect(() => {
    if (company) {
      fetchAll();
    }
  }, [company, fetchAll]);

  /* ─────────── REALTIME SUBSCRIPTION ─────────── */
  useEffect(() => {
    if (!company) return;
    const channel = supabase.channel('manager-task-updates')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'sss_tasks', filter: `company_id=eq.${SSS_CO}` }, () => fetchTasks())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'sss_task_assignments' }, () => fetchTasks())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'sss_task_feedback' },    () => fetchTasks())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'sss_task_reviews' },     () => fetchTasks())
      .subscribe();
    return () => supabase.removeChannel(channel);
  }, [company]);

  const handleLogout = () => {
    localStorage.removeItem('unai_manager_session');
    navigate(`/${companySlug || 'sss'}/login`);
  };

  /* ─────────── TASK CRUD ─────────── */
  const sendNotification = async (title, body, userId = null) => {
    const notifTable = await resolveTenantTableName(SSS_CO, 'notifications');
    await supabase.from(notifTable).insert({
      company_id: SSS_CO, user_id: userId, type: 'task_update',
      title, body, is_read: false,
    }).select();
  };

  const handleCreateTask = async () => {
    if (!taskForm.task_title.trim()) return;
    setSavingTask(true);
    try {
      const { data: newTask } = await supabase.from('sss_tasks').insert({
        ...taskForm,
        company_id: SSS_CO,
        estimated_hours: taskForm.estimated_hours ? Number(taskForm.estimated_hours) : null,
        department_id: taskForm.department_id || null,
        start_date: taskForm.start_date || null,
        due_date: taskForm.due_date || null,
      }).select().single();

      if (newTask && selectedAssignees.length > 0) {
        const assigns = selectedAssignees.map(empId => ({ task_id: newTask.id, employee_id: empId }));
        await supabase.from('sss_task_assignments').insert(assigns);
        for (const empId of selectedAssignees) {
          await sendNotification(`New task assigned: ${newTask.task_title}`, `You have been assigned a new task.`, empId);
        }
      }
      setTaskForm(DEFAULT_TASK);
      setSelectedAssignees([]);
      setTaskView('list');
      await fetchTasks();
    } catch (e) { console.error(e); }
    setSavingTask(false);
  };

  const handleUpdateTask = async () => {
    if (!selectedTask) return;
    setSavingTask(true);
    try {
      await supabase.from('sss_tasks').update({
        ...taskForm,
        estimated_hours: taskForm.estimated_hours ? Number(taskForm.estimated_hours) : null,
        last_updated: new Date().toISOString(),
      }).eq('id', selectedTask.id);

      // Re-sync assignments
      await supabase.from('sss_task_assignments').delete().eq('task_id', selectedTask.id);
      if (selectedAssignees.length > 0) {
        await supabase.from('sss_task_assignments').insert(selectedAssignees.map(empId => ({ task_id: selectedTask.id, employee_id: empId })));
      }
      setTaskView('list');
      setSelectedTask(null);
      await fetchTasks();
    } catch (e) { console.error(e); }
    setSavingTask(false);
  };

  const handleDeleteTask = async (taskId) => {
    const task = tasks.find(t => t.id === taskId);
    setDeleteConfirm({
      title: 'Delete Task Logs',
      message: `Permanently delete task "${task?.task_title || ''}" and all associated progress logs, feedback, and assignments? This cannot be undone.`,
      onConfirm: async () => {
        setDeleteConfirm(null);
        try {
          // Cascade delete child records
          await supabase.from('sss_task_assignments').delete().eq('task_id', taskId);
          await supabase.from('sss_task_feedback').delete().eq('task_id', taskId);
          await supabase.from('sss_task_reviews').delete().eq('task_id', taskId);
          await supabase.from('sss_task_progress').delete().eq('task_id', taskId);

          const { error } = await supabase.from('sss_tasks').delete().eq('id', taskId);
          if (error) throw error;
          await fetchTasks();
        } catch (e) {
          alert('Failed to delete task: ' + e.message);
        }
      }
    });
  };

  const handleDuplicateTask = async (task) => {
    const { id, created_at, assigned_date, last_updated, ...rest } = task;
    await supabase.from('sss_tasks').insert({ ...rest, task_title: `Copy of ${task.task_title}`, status: 'Pending', completion_pct: 0 });
    await fetchTasks();
  };

  const handleCancelTask = async (taskId) => {
    await supabase.from('sss_tasks').update({ status: 'Cancelled', last_updated: new Date().toISOString() }).eq('id', taskId);
    await fetchTasks();
  };

  const openEditTask = (task) => {
    setSelectedTask(task);
    setTaskForm({
      task_title: task.task_title || '', task_description: task.task_description || '',
      project_name: task.project_name || '', priority: task.priority || 'Medium',
      category: task.category || '', start_date: task.start_date || '',
      due_date: task.due_date || '', estimated_hours: task.estimated_hours || '',
      instructions: task.instructions || '', remarks: task.remarks || '',
      department_id: task.department_id || '', status: task.status || 'Pending',
    });
    const assigned = taskAssignments.filter(a => a.task_id === task.id).map(a => a.employee_id);
    setSelectedAssignees(assigned);
    setAssignmentMode(assigned.length > 1 ? 'all' : 'single');
    setTaskView('edit');
  };

  /* ─────────── REVIEW COMPLETED TASK ─────────── */
  const handleReviewTask = async () => {
    if (!reviewingTask || !reviewForm.decision) return;
    setSavingReview(true);
    try {
      await supabase.from('sss_task_reviews').insert({
        task_id: reviewingTask.id,
        decision: reviewForm.decision,
        manager_comments: reviewForm.comments,
        employee_rating: reviewForm.rating,
      });
      const newStatus = reviewForm.decision === 'Approved' ? 'Approved'
        : reviewForm.decision === 'Rejected' ? 'Rejected' : 'Revision Required';
      await supabase.from('sss_tasks').update({ status: newStatus, last_updated: new Date().toISOString() }).eq('id', reviewingTask.id);
      const assigns = taskAssignments.filter(a => a.task_id === reviewingTask.id);
      for (const a of assigns) {
        const msg = newStatus === 'Approved'
          ? `✅ Your task "${reviewingTask.task_title}" has been Approved!`
          : newStatus === 'Rejected'
          ? `❌ Your task "${reviewingTask.task_title}" was Rejected. See manager comments.`
          : `🔄 Task "${reviewingTask.task_title}" requires revision. See manager comments.`;
        await sendNotification(msg, reviewForm.comments, a.employee_id);
      }
      setReviewingTask(null);
      setReviewForm({ decision: '', comments: '', rating: 5 });
      await fetchTasks();
    } catch (e) { console.error(e); }
    setSavingReview(false);
  };

  /* ─────────── EXPORT CSV ─────────── */
  const exportCSV = () => {
    const rows = [['Task ID','Title','Project','Priority','Status','Due Date','Progress','Created By']];
    filteredTasks.forEach(t => rows.push([
      t.id.slice(0,8).toUpperCase(), t.task_title, t.project_name||'—',
      t.priority, t.status, t.due_date||'—', `${t.completion_pct||0}%`, t.created_by||'Manager',
    ]));
    const csv = rows.map(r => r.join(',')).join('\n');
    const a = document.createElement('a'); a.href = `data:text/csv;charset=utf-8,${encodeURIComponent(csv)}`; a.download = 'tasks.csv'; a.click();
  };

  /* ─────────── DERIVED DATA ─────────── */
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

  const filteredLeaves = leaveFilter === 'all' ? leaves : leaves.filter(l => l.status === leaveFilter);

  const filteredTasks = tasks.filter(t => {
    const matchStatus   = taskFilters.status   === 'all' || t.status   === taskFilters.status;
    const matchPriority = taskFilters.priority === 'all' || t.priority === taskFilters.priority;
    const matchSearch   = !taskFilters.search || t.task_title.toLowerCase().includes(taskFilters.search.toLowerCase())
      || (t.project_name || '').toLowerCase().includes(taskFilters.search.toLowerCase());
    return matchStatus && matchPriority && matchSearch;
  });

  const completedTasks = tasks.filter(t => t.status === 'Completed');

  const empName = (id) => { const e = employees.find(e => e.id === id); return e ? `${e.first_name} ${e.last_name}` : '—'; };
  const deptName = (id) => { const d = departments.find(d => d.id === id); return d ? d.name : '—'; };
  const taskAssigneeNames = (taskId) => taskAssignments.filter(a => a.task_id === taskId).map(a => empName(a.employee_id)).join(', ') || 'Unassigned';

  const ALERT_STYLE = {
    info:    { bg: '#eff6ff', border: '#bfdbfe', icon: 'ℹ️', text: '#1d4ed8' },
    warning: { bg: '#fffbeb', border: '#fde68a', icon: '⚠️', text: '#92400e' },
    success: { bg: '#ecfdf5', border: '#a7f3d0', icon: '✅', text: '#065f46' },
    urgent:  { bg: '#fef2f2', border: '#fecaca', icon: '🔴', text: '#991b1b' },
  };

  const handleDeleteAlert = async (id) => {
    const notifTable = await resolveTenantTableName(SSS_CO, 'notifications');
    await supabase.from(notifTable).delete().eq('id', id);
    setAlerts(prev => prev.filter(a => a.id !== id));
  };

  const handleLeaveAction = async (id, status) => {
    const leaveTable = await resolveTenantTableName(SSS_CO, 'leave_requests');
    await supabase.from(leaveTable).update({ status }).eq('id', id);
    setLeaves(prev => prev.map(l => l.id === id ? { ...l, status } : l));
  };

  const handleDeleteAttendance = async (id) => {
    setDeleteConfirm({
      title: 'Delete Attendance Log',
      message: 'Permanently remove this attendance entry from the database? This cannot be undone.',
      onConfirm: async () => {
        setDeleteConfirm(null);
        try {
          const attTable = await resolveTenantTableName(SSS_CO, 'attendance');
          const { error } = await supabase.from(attTable).delete().eq('id', id);
          if (error) throw error;
          await fetchAll(true);
        } catch (e) {
          alert('Failed to delete attendance record: ' + e.message);
        }
      }
    });
  };

  const handleDeleteLeave = async (id) => {
    setDeleteConfirm({
      title: 'Delete Leave Request',
      message: 'Permanently remove this leave request from the database? This cannot be undone.',
      onConfirm: async () => {
        setDeleteConfirm(null);
        try {
          const leaveTable = await resolveTenantTableName(SSS_CO, 'leave_requests');
          const { error } = await supabase.from(leaveTable).delete().eq('id', id);
          if (error) throw error;
          await fetchAll(true);
        } catch (e) {
          alert('Failed to delete leave request: ' + e.message);
        }
      }
    });
  };

  const handleAddAlert = async () => {
    if (!alertInput.trim()) return;
    setSaving(true);
    const notifTable = await resolveTenantTableName(SSS_CO, 'notifications');
    await supabase.from(notifTable).insert({
      company_id: SSS_CO, user_id: null, type: 'manager_alert',
      title: alertInput.trim(), body: alertType, is_read: false,
    });
    setAlertInput('');
    const { data } = await supabase.from(notifTable).select('*').eq('company_id', SSS_CO).eq('type', 'manager_alert').order('created_at', { ascending: false });
    setAlerts(data || []);
    setSaving(false);
  };

  /* ══════════════════════════════════════
     TASK FORM (Create / Edit)
  ══════════════════════════════════════ */
  function renderTaskFormPanel() { return (
    <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100" style={{ background: `linear-gradient(135deg, ${BRAND}08, ${BRAND2}05)` }}>
        <div>
          <h2 className="text-sm font-extrabold text-gray-900">{taskView === 'create' ? '+ Create New Task' : '✏️ Edit Task'}</h2>
          <p className="text-[11px] text-gray-400 mt-0.5">Fill all details and assign to employee(s)</p>
        </div>
        <button onClick={() => { setTaskView('list'); setSelectedTask(null); setTaskForm(DEFAULT_TASK); setSelectedAssignees([]); }}
          className="w-8 h-8 flex items-center justify-center rounded-xl border border-gray-200 text-gray-400 hover:text-gray-700 hover:bg-gray-50 transition-all">
          <X size={14} />
        </button>
      </div>

      <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Task Title */}
        <div className="lg:col-span-2">
          <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">Task Title *</label>
          <input value={taskForm.task_title} onChange={e => setTaskForm(p => ({ ...p, task_title: e.target.value }))}
            placeholder="Enter task title…" className="w-full h-10 px-4 text-sm rounded-xl border border-gray-200 focus:outline-none focus:border-indigo-400" />
        </div>

        {/* Description */}
        <div className="lg:col-span-2">
          <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">Task Description</label>
          <textarea value={taskForm.task_description} onChange={e => setTaskForm(p => ({ ...p, task_description: e.target.value }))}
            placeholder="Describe the task in detail…" rows={3} className="w-full px-4 py-3 text-sm rounded-xl border border-gray-200 focus:outline-none focus:border-indigo-400 resize-none" />
        </div>

        {/* Project */}
        <div>
          <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">Project Name</label>
          <input value={taskForm.project_name} onChange={e => setTaskForm(p => ({ ...p, project_name: e.target.value }))}
            placeholder="Project name…" className="w-full h-10 px-4 text-sm rounded-xl border border-gray-200 focus:outline-none focus:border-indigo-400" />
        </div>

        {/* Category */}
        <div>
          <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">Category</label>
          <select value={taskForm.category} onChange={e => setTaskForm(p => ({ ...p, category: e.target.value }))}
            className="w-full h-10 px-3 text-sm rounded-xl border border-gray-200 focus:outline-none focus:border-indigo-400">
            <option value="">Select category…</option>
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        {/* Priority */}
        <div>
          <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">Priority</label>
          <select value={taskForm.priority} onChange={e => setTaskForm(p => ({ ...p, priority: e.target.value }))}
            className="w-full h-10 px-3 text-sm rounded-xl border border-gray-200 focus:outline-none focus:border-indigo-400">
            {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>

        {/* Status (edit only) */}
        {taskView === 'edit' && (
          <div>
            <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">Status</label>
            <select value={taskForm.status} onChange={e => setTaskForm(p => ({ ...p, status: e.target.value }))}
              className="w-full h-10 px-3 text-sm rounded-xl border border-gray-200 focus:outline-none focus:border-indigo-400">
              {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        )}

        {/* Department */}
        <div>
          <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">Department</label>
          <select value={taskForm.department_id} onChange={e => setTaskForm(p => ({ ...p, department_id: e.target.value }))}
            className="w-full h-10 px-3 text-sm rounded-xl border border-gray-200 focus:outline-none focus:border-indigo-400">
            <option value="">All Departments</option>
            {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
          </select>
        </div>

        {/* Start Date */}
        <div>
          <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">Start Date</label>
          <input type="date" value={taskForm.start_date} onChange={e => setTaskForm(p => ({ ...p, start_date: e.target.value }))}
            className="w-full h-10 px-3 text-sm rounded-xl border border-gray-200 focus:outline-none focus:border-indigo-400" />
        </div>

        {/* Due Date */}
        <div>
          <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">Due Date</label>
          <input type="date" value={taskForm.due_date} onChange={e => setTaskForm(p => ({ ...p, due_date: e.target.value }))}
            className="w-full h-10 px-3 text-sm rounded-xl border border-gray-200 focus:outline-none focus:border-indigo-400" />
        </div>

        {/* Estimated Hours */}
        <div>
          <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">Estimated Hours</label>
          <input type="number" value={taskForm.estimated_hours} onChange={e => setTaskForm(p => ({ ...p, estimated_hours: e.target.value }))}
            placeholder="e.g. 8" className="w-full h-10 px-3 text-sm rounded-xl border border-gray-200 focus:outline-none focus:border-indigo-400" />
        </div>

        {/* Instructions */}
        <div className="lg:col-span-2">
          <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">Instructions</label>
          <textarea value={taskForm.instructions} onChange={e => setTaskForm(p => ({ ...p, instructions: e.target.value }))}
            placeholder="Step-by-step instructions for the employee…" rows={2} className="w-full px-4 py-3 text-sm rounded-xl border border-gray-200 focus:outline-none focus:border-indigo-400 resize-none" />
        </div>

        {/* Remarks */}
        <div className="lg:col-span-2">
          <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">Remarks / Notes</label>
          <textarea value={taskForm.remarks} onChange={e => setTaskForm(p => ({ ...p, remarks: e.target.value }))}
            placeholder="Additional notes or remarks…" rows={2} className="w-full px-4 py-3 text-sm rounded-xl border border-gray-200 focus:outline-none focus:border-indigo-400 resize-none" />
        </div>

        {/* Employee Assignment */}
        <div className="lg:col-span-2">
          <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-2">Assign Employees</label>
          <div className="flex gap-4 mb-3">
            <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer text-gray-700">
              <input type="radio" name="assignmentMode" checked={assignmentMode === 'single'} 
                onChange={() => {
                  setAssignmentMode('single');
                  setSelectedAssignees([]);
                }} className="accent-[#4F6AF7]" />
              Single Employee
            </label>
            <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer text-gray-700">
              <input type="radio" name="assignmentMode" checked={assignmentMode === 'all'} 
                onChange={() => {
                  setAssignmentMode('all');
                  setSelectedAssignees(employees.filter(e => e.is_active).map(e => e.id));
                }} className="accent-[#4F6AF7]" />
              All Employees
            </label>
          </div>

          {assignmentMode === 'single' && (
            <div className="flex flex-col gap-1.5 mt-2">
              <label className="text-[10px] text-gray-400 font-bold uppercase">Who is the employee? *</label>
              <select value={selectedAssignees[0] || ''} 
                onChange={e => {
                  const empId = e.target.value;
                  setSelectedAssignees(empId ? [empId] : []);
                }}
                className="w-full h-10 px-3 text-sm rounded-xl border border-gray-200 focus:outline-none focus:border-indigo-400 bg-white">
                <option value="">-- Choose Employee --</option>
                {employees.filter(e => e.is_active).map(emp => (
                  <option key={emp.id} value={emp.id}>{emp.first_name} {emp.last_name} ({emp.designation || 'Specialist'})</option>
                ))}
              </select>
            </div>
          )}

          {assignmentMode === 'all' && (
            <div className="p-3 bg-indigo-50/50 border border-indigo-100 rounded-xl text-xs text-indigo-700 font-bold mt-2">
              📢 Task will be assigned to all active employees. ({employees.filter(e => e.is_active).length} employees total)
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50">
        <button onClick={() => { setTaskView('list'); setSelectedTask(null); setTaskForm(DEFAULT_TASK); setSelectedAssignees([]); }}
          className="h-9 px-5 text-xs font-semibold rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-100 transition-all">
          Cancel
        </button>
        <button onClick={taskView === 'create' ? handleCreateTask : handleUpdateTask} 
          disabled={savingTask || !taskForm.task_title.trim()}
          className="h-9 px-6 text-xs font-bold rounded-xl text-white flex items-center gap-1.5 transition-all disabled:opacity-50"
          style={{ background: BRAND }}>
          {savingTask ? <RefreshCw size={12} className="animate-spin" /> : <CheckCircle size={12} />}
          {taskView === 'create' ? 'Create Task' : 'Update Task'}
        </button>
      </div>
    </div>
  ); }

  /* ══════════════════════════════════════
     COMPLETION REVIEW PANEL
  ══════════════════════════════════════ */
  function renderCompletionReviewPanel() { return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-extrabold text-gray-900">Task Completion Review</h2>
          <p className="text-[11px] text-gray-400 mt-0.5">Review employee submissions and approve or request revisions</p>
        </div>
        <span className="px-3 py-1 rounded-full text-xs font-bold text-white" style={{ background: '#059669' }}>
          {completedTasks.length} awaiting review
        </span>
      </div>

      {completedTasks.length === 0 ? (
        <div className="bg-white border border-gray-100 rounded-2xl p-16 text-center shadow-sm">
          <CheckCircle size={36} className="text-gray-200 mx-auto mb-3" />
          <p className="text-sm font-semibold text-gray-400">No tasks pending review</p>
          <p className="text-xs text-gray-300 mt-1">Completed task submissions will appear here</p>
        </div>
      ) : completedTasks.map(task => {
        const fb = taskFeedback.find(f => f.task_id === task.id);
        const rv = taskReviews.find(r => r.task_id === task.id);
        const isReviewing = reviewingTask?.id === task.id;
        const assigneeNames = taskAssigneeNames(task.id);
        return (
          <div key={task.id} className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
            {/* Task header */}
            <div className="flex items-start justify-between gap-3 p-5 border-b border-gray-50">
              <div className="min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-bold text-gray-400 font-mono">{task.id.slice(0,8).toUpperCase()}</span>
                  <Badge label={task.priority} colorMap={PRIORITY_COLORS} />
                  <Badge label={task.status}   colorMap={STATUS_COLORS}   />
                </div>
                <h3 className="font-extrabold text-gray-900 text-sm">{task.task_title}</h3>
                <p className="text-[11px] text-gray-500 mt-0.5">
                  {task.project_name && <span className="mr-2">📁 {task.project_name}</span>}
                  {/* Clickable assignee name(s) → opens employee task card */}
                  {taskAssignments.filter(a => a.task_id === task.id).map(a => {
                    const emp = employees.find(e => e.id === a.employee_id);
                    if (!emp) return null;
                    return (
                      <button
                        key={a.id}
                        onClick={() => setSelectedEmpDetail(emp)}
                        className="inline-flex items-center gap-1 mr-1 text-[#4F6AF7] font-bold hover:underline transition-colors"
                        title="View Employee Task Profile"
                      >
                        👤 {emp.first_name} {emp.last_name}
                      </button>
                    );
                  })}
                  {task.due_date && <span className="ml-2">📅 Due: {task.due_date}</span>}
                </p>
              </div>
              {!rv && (
                <button onClick={() => { setReviewingTask(isReviewing ? null : task); setReviewForm({ decision: '', comments: '', rating: 5 }); }}
                  className="shrink-0 h-8 px-4 text-xs font-bold rounded-xl border border-indigo-200 text-indigo-600 hover:bg-indigo-50 transition-all">
                  {isReviewing ? 'Cancel' : 'Review'}
                </button>
              )}
              {rv && <Badge label={rv.decision} colorMap={STATUS_COLORS} />}
            </div>

            {/* Employee submission */}
            {fb ? (
              <div className="p-6 bg-gradient-to-br from-gray-50 to-indigo-50/20 border-b border-gray-100">
                <div className="bg-white rounded-3xl border-2 border-dashed border-indigo-150 p-6 shadow-sm space-y-5 relative">
                  
                  {/* Decorative stamp-like badge */}
                  <div className="absolute top-4 right-4 bg-indigo-50 border border-indigo-150 rounded-2xl px-3 py-1.5 flex flex-col items-center justify-center shrink-0">
                    <span className="text-[8px] font-extrabold text-indigo-400 uppercase tracking-widest leading-none">Task Performance</span>
                    <span className="text-[10px] font-black text-indigo-700 mt-1 uppercase leading-none">Final Report</span>
                  </div>

                  <div className="border-b border-gray-100 pb-3">
                    <h4 className="text-xs font-black text-indigo-700 uppercase tracking-widest">📋 Employee Task Completion Report Card</h4>
                    <p className="text-[10px] text-gray-400 mt-0.5">Formal submission record for project assignment review</p>
                  </div>

                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                    {[
                      { label: 'Date Completed', value: fb.completion_date || '—', icon: '📅' },
                      { label: 'Hours Worked',    value: fb.hours_worked ? `${fb.hours_worked} hrs` : '—', icon: '⏱️' },
                      { label: 'Time Submitted',  value: new Date(fb.submitted_at).toLocaleDateString('en-IN') + ' ' + new Date(fb.submitted_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }), icon: '📥' },
                      { label: 'Review Status',   value: task.status, icon: '🏷️' },
                    ].map(({ label, value, icon }) => (
                      <div key={label} className="bg-gray-50/50 rounded-xl p-3 border border-gray-100">
                        <p className="text-[8px] font-extrabold text-gray-400 uppercase tracking-widest">{icon} {label}</p>
                        <p className="text-xs font-bold text-gray-800 mt-1">{value}</p>
                      </div>
                    ))}
                  </div>

                  {fb.work_summary && (
                    <div className="bg-gray-50/40 p-4 rounded-2xl border border-gray-100/50">
                      <span className="text-[9px] font-extrabold text-gray-400 uppercase tracking-widest block mb-1.5">📝 Deliverables & Work Summary</span>
                      <p className="text-xs text-gray-700 leading-relaxed font-medium">{fb.work_summary}</p>
                    </div>
                  )}

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    {fb.challenges && (
                      <div className="bg-rose-50/30 p-3.5 rounded-2xl border border-rose-100/40">
                        <span className="text-[9px] font-extrabold text-rose-500 uppercase tracking-widest block mb-1">⚠️ Challenges Encountered</span>
                        <p className="text-xs text-gray-600 leading-relaxed font-medium">{fb.challenges}</p>
                      </div>
                    )}
                    {fb.suggestions && (
                      <div className="bg-emerald-50/30 p-3.5 rounded-2xl border border-emerald-100/40">
                        <span className="text-[9px] font-extrabold text-emerald-600 uppercase tracking-widest block mb-1">💡 Suggestions & Recommendations</span>
                        <p className="text-xs text-gray-600 leading-relaxed font-medium">{fb.suggestions}</p>
                      </div>
                    )}
                    {fb.lessons_learned && (
                      <div className="bg-indigo-50/30 p-3.5 rounded-2xl border border-indigo-100/40">
                        <span className="text-[9px] font-extrabold text-indigo-600 uppercase tracking-widest block mb-1">🧠 Key Lessons Learned</span>
                        <p className="text-xs text-gray-600 leading-relaxed font-medium">{fb.lessons_learned}</p>
                      </div>
                    )}
                  </div>

                  {fb.file_urls?.length > 0 && (
                    <div className="pt-2">
                      <span className="text-[9px] font-extrabold text-gray-400 uppercase tracking-widest block mb-2">📂 Uploaded Reference Files & Evidence</span>
                      <div className="flex flex-wrap gap-2">
                        {fb.file_urls.filter(Boolean).map((url, i) => (
                          <a key={i} href={url} target="_blank" rel="noopener noreferrer"
                            className="flex items-center gap-1.5 px-3 py-2 bg-indigo-50/50 hover:bg-[#4F6AF7] hover:text-white border border-indigo-100 rounded-xl text-xs font-bold text-[#4F6AF7] transition-all">
                            <FileText size={12} /> Deliverable Evidence #{i + 1}
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="p-4 bg-amber-50 border-b border-amber-100">
                <p className="text-xs text-amber-700 font-medium">⚠️ Employee has not submitted a completion form yet.</p>
              </div>
            )}

            {/* Previously reviewed */}
            {rv && (
              <div className="p-4 bg-emerald-50/50 border-t border-emerald-100">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Manager Review</p>
                <div className="flex items-center gap-4">
                  <div className="flex gap-0.5">
                    {[1,2,3,4,5].map(n => <Star key={n} size={14} fill={n <= (rv.employee_rating||0) ? '#f59e0b' : 'none'} color={n <= (rv.employee_rating||0) ? '#f59e0b' : '#d1d5db'} />)}
                  </div>
                  <p className="text-xs text-gray-600">{rv.manager_comments || 'No comments'}</p>
                </div>
              </div>
            )}

            {/* Review form (inline) */}
            {isReviewing && !rv && (
              <div className="p-5 border-t border-gray-100 bg-indigo-50/30">
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-4">Manager Review</p>
                <div className="space-y-4">
                  <div>
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2 block">Decision *</label>
                    <div className="flex gap-2">
                      {['Approved','Rejected','Revision Required'].map(d => (
                        <button key={d} onClick={() => setReviewForm(p => ({ ...p, decision: d }))}
                          className={`px-4 h-8 text-xs font-bold rounded-xl border transition-all ${reviewForm.decision === d ? 'text-white border-transparent' : 'border-gray-200 text-gray-600 bg-white hover:bg-gray-50'}`}
                          style={reviewForm.decision === d ? { background: d === 'Approved' ? '#059669' : d === 'Rejected' ? '#dc2626' : '#9333ea' } : {}}>
                          {d === 'Approved' ? '✅' : d === 'Rejected' ? '❌' : '🔄'} {d}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2 block">Employee Rating</label>
                    <StarRating value={reviewForm.rating} onChange={v => setReviewForm(p => ({ ...p, rating: v }))} />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2 block">Manager Comments</label>
                    <textarea value={reviewForm.comments} onChange={e => setReviewForm(p => ({ ...p, comments: e.target.value }))}
                      placeholder="Add your comments, feedback, or revision instructions…" rows={2}
                      className="w-full px-4 py-3 text-sm rounded-xl border border-gray-200 focus:outline-none focus:border-indigo-400 resize-none bg-white" />
                  </div>
                  <div className="flex justify-end gap-2">
                    <button onClick={() => setReviewingTask(null)} className="h-8 px-4 text-xs font-semibold rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-100 transition-all">Cancel</button>
                    <button onClick={handleReviewTask} disabled={savingReview || !reviewForm.decision}
                      className="h-8 px-5 text-xs font-bold rounded-xl text-white flex items-center gap-1.5 transition-all disabled:opacity-50" style={{ background: BRAND }}>
                      {savingReview ? <RefreshCw size={11} className="animate-spin" /> : <Send size={11} />}
                      Submit Review
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  ); }

  /* ══════════════════════════════════════════
     RENDER
  ══════════════════════════════════════════ */
  return (
    <div className="flex h-screen overflow-hidden bg-gray-50" style={{ fontFamily: "'Inter', sans-serif" }}>

      {/* ── SIDEBAR ── */}
      <aside className="flex flex-col shrink-0 bg-white border-r border-gray-100 shadow-sm transition-all duration-300" style={{ width: sidebarOpen ? 220 : 64 }}>
        <div className="flex items-center gap-3 px-4 h-16 border-b border-gray-100">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 bg-[#8c1d18] border border-red-900/30 shadow-sm overflow-hidden">
            <img src="/story_seed_logo.png" alt="Story Seed Studio" className="w-full h-full object-cover" />
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
              <button key={name} onClick={() => { setActiveTab(name); if (name === 'Tasks') { setTaskView('list'); setTaskSubTab('Task List'); } }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all ${active ? 'text-white font-bold shadow-sm' : 'text-gray-500 hover:bg-gray-50 font-medium'}`}
                style={active ? { background: `linear-gradient(135deg, ${BRAND}, ${BRAND2})` } : {}} title={!sidebarOpen ? name : undefined}>
                <Icon size={17} className="shrink-0" />
                {sidebarOpen && (
                  <span className="text-[13px] truncate flex-1">{name}</span>
                )}
                {sidebarOpen && name === 'Tasks' && tasks.filter(t => t.status === 'Completed').length > 0 && (
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full text-white" style={{ background: '#ef4444' }}>
                    {tasks.filter(t => t.status === 'Completed').length}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
        <div className={`px-3 py-4 border-t border-gray-100 ${sidebarOpen ? '' : 'flex justify-center'}`}>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-xs shrink-0" style={{ background: BRAND }}>M</div>
            {sidebarOpen && (
              <div className="min-w-0">
                <p className="text-xs font-bold text-gray-800 truncate">{manager ? `${manager.first_name} ${manager.last_name}` : 'Manager'}</p>
                <p className="text-[9px] text-gray-400 truncate">{company ? company.name : 'Story Seed Studio'}</p>
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
          <div className="ml-auto flex items-center gap-2">
            {activeTab === 'Tasks' && taskView === 'list' && taskSubTab === 'Task List' && (
              <>
                <button onClick={exportCSV} className="h-8 px-3 text-xs font-semibold rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 flex items-center gap-1.5 transition-all">
                  <Download size={12} /> Export
                </button>
                <button onClick={() => { setTaskView('create'); setTaskForm(DEFAULT_TASK); setSelectedAssignees([]); }}
                  className="h-8 px-4 text-xs font-bold rounded-xl text-white flex items-center gap-1.5 transition-all" style={{ background: BRAND }}>
                  <Plus size={12} /> New Task
                </button>
              </>
            )}
            <button onClick={fetchAll} className="p-2 rounded-xl hover:bg-gray-50 text-gray-400 hover:text-gray-700 transition-colors" title="Refresh">
              <RefreshCw size={15} />
            </button>
            <button onClick={handleLogout} className="p-2 rounded-xl hover:bg-red-50 text-gray-400 hover:text-red-650 transition-colors" title="Log Out">
              <LogOut size={15} />
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
                    <StatCard icon={Users}      label="Total Employees" value={employees.length}     sub={`${employees.filter(e=>e.is_active).length} active`} color={BRAND}    />
                    <StatCard icon={UserCheck}  label="Present Today"   value={presentToday}          sub={`${absentToday} absent`}  color="#10b981" />
                    <StatCard icon={Calendar}   label="Pending Leaves"  value={pendingLeaves}          sub="awaiting approval"        color="#f59e0b" />
                    <StatCard icon={CheckSquare}label="Active Tasks"    value={tasks.filter(t=>['In Progress','Accepted'].includes(t.status)).length} sub={`${completedTasks.length} completed`} color="#8b5cf6" />
                  </div>
                  <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-sm font-extrabold text-gray-900">Today's Attendance</h2>
                      <span className="text-[11px] text-gray-400">{today}</span>
                    </div>
                    {todayAtt.length === 0 ? <p className="text-center text-gray-400 text-sm py-8">No attendance records for today.</p> : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <TH cols={['Employee','Check In','Check Out','Status']} />
                          <tbody className="divide-y divide-gray-50">
                            {todayAtt.slice(0,8).map(a => (
                              <tr key={a.id} className="hover:bg-gray-50/50 transition-colors">
                                <td className="py-2.5 px-4 font-semibold text-gray-800">{empName(a.employee_id)}</td>
                                <td className="py-2.5 px-4 text-gray-500">{a.check_in||'—'}</td>
                                <td className="py-2.5 px-4 text-gray-500">{a.check_out||'—'}</td>
                                <td className="py-2.5 px-4"><Badge label={a.status||'Present'} colorMap={{ Present: {bg:'#ecfdf5',text:'#059669',border:'#a7f3d0'}, Absent: {bg:'#fef2f2',text:'#dc2626',border:'#fecaca'} }} /></td>
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
                      {leaves.slice(0,4).length === 0 ? <p className="text-sm text-gray-400 text-center py-6">No leave requests.</p>
                        : leaves.slice(0,4).map(l => (
                        <div key={l.id} className="flex items-center justify-between gap-2 p-2.5 bg-gray-50 rounded-xl mb-2">
                          <div className="min-w-0"><p className="text-xs font-bold text-gray-800 truncate">{empName(l.employee_id)}</p><p className="text-[10px] text-gray-400 mt-0.5">{l.leave_type} · {l.start_date}</p></div>
                          <Badge label={l.status} colorMap={STATUS_COLORS} />
                        </div>
                      ))}
                    </div>
                    <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
                      <h2 className="text-sm font-extrabold text-gray-900 mb-4">Active Tasks</h2>
                      {tasks.filter(t=>t.status==='In Progress').length === 0 ? <p className="text-sm text-gray-400 text-center py-6">No tasks in progress.</p>
                        : tasks.filter(t=>t.status==='In Progress').slice(0,4).map(task => (
                        <div key={task.id} className="flex items-center gap-2 p-2.5 bg-gray-50 rounded-xl mb-2">
                          <div className="w-2 h-2 rounded-full shrink-0" style={{background: task.priority==='Critical'?'#dc2626':task.priority==='High'?'#ea580c':task.priority==='Medium'?'#d97706':'#16a34a'}} />
                          <p className="text-xs font-semibold text-gray-800 flex-1 truncate">{task.task_title}</p>
                          <Badge label={task.priority} colorMap={PRIORITY_COLORS} />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* ─── EMPLOYEES ─── */}
              {activeTab === 'Employees' && (
                <ManagerEmployees companyId={SSS_CO} onRefreshData={() => fetchAll(true)} />
              )}

              {/* ─── ATTENDANCE ─── */}
              {activeTab === 'Attendance' && (
                <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
                    <h2 className="text-sm font-extrabold text-gray-900">Attendance Records</h2>
                    <div className="flex items-center gap-2">
                      <div className="relative"><Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input value={attSearch} onChange={e => setAttSearch(e.target.value)} placeholder="Search employee…" className="pl-8 pr-3 h-9 text-xs rounded-xl border border-gray-200 focus:outline-none focus:border-indigo-400 w-44" /></div>
                      <input type="date" value={attDate} onChange={e => setAttDate(e.target.value)} className="h-9 text-xs rounded-xl border border-gray-200 px-3 focus:outline-none focus:border-indigo-400" />
                    </div>
                  </div>
                  {filteredAtt.length === 0 ? <p className="text-sm text-gray-400 text-center py-10">No records found.</p> : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <TH cols={['Employee','Date','Check In','Check Out','Status','Hours','Action']} />
                        <tbody className="divide-y divide-gray-50">
                          {filteredAtt.map(a => {
                            let hrs = '—';
                            if (a.check_in && a.check_out) { const [ih,im]=a.check_in.split(':').map(Number); const [oh,om]=a.check_out.split(':').map(Number); const d=(oh*60+om)-(ih*60+im); if(d>0) hrs=`${Math.floor(d/60)}h ${d%60}m`; }
                            return (
                              <tr key={a.id} className="hover:bg-gray-50/50 transition-colors">
                                <td className="py-3 px-4 font-semibold text-gray-800">{empName(a.employee_id)}</td>
                                <td className="py-3 px-4 text-gray-500 text-xs">{a.date}</td>
                                <td className="py-3 px-4 text-gray-500">{a.check_in||'—'}</td>
                                <td className="py-3 px-4 text-gray-500">{a.check_out||'—'}</td>
                                <td className="py-3 px-4"><Badge label={a.status||'Present'} colorMap={{ Present:{bg:'#ecfdf5',text:'#059669',border:'#a7f3d0'}, Absent:{bg:'#fef2f2',text:'#dc2626',border:'#fecaca'} }} /></td>
                                <td className="py-3 px-4 text-gray-600 font-medium">{hrs}</td>
                                <td className="py-3 px-4">
                                  <button 
                                    onClick={() => handleDeleteAttendance(a.id)}
                                    className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                                    title="Delete Attendance entry permanently"
                                  >
                                    <Trash2 size={12} />
                                  </button>
                                </td>
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
                    <StatCard icon={DollarSign} label="Total Payroll" value={`₹${totalSalary.toLocaleString('en-IN')}`} sub="monthly basic" color={BRAND} />
                    <StatCard icon={Users} label="On Payroll" value={employees.length} color="#10b981" />
                    <StatCard icon={TrendingUp} label="Avg. Salary" value={employees.length ? `₹${Math.round(totalSalary/employees.length).toLocaleString('en-IN')}` : '₹0'} color="#8b5cf6" />
                  </div>
                  <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
                    <h2 className="text-sm font-extrabold text-gray-900 mb-5">Salary Breakdown</h2>
                    <div className="overflow-x-auto"><table className="w-full text-sm">
                      <TH cols={['Employee','Designation','Basic Salary','Status']} />
                      <tbody className="divide-y divide-gray-50">
                        {employees.map(emp => (
                          <tr key={emp.id} className="hover:bg-gray-50/50 transition-colors">
                            <td className="py-3 px-4 font-semibold text-gray-800">{emp.first_name} {emp.last_name}</td>
                            <td className="py-3 px-4 text-gray-500 text-xs">{emp.designation||'—'}</td>
                            <td className="py-3 px-4 font-bold text-gray-900">₹{(emp.basic_salary||0).toLocaleString('en-IN')}</td>
                            <td className="py-3 px-4"><Badge label={emp.is_active?'Active':'Inactive'} colorMap={{ Active:{bg:'#ecfdf5',text:'#059669',border:'#a7f3d0'}, Inactive:{bg:'#f9fafb',text:'#9ca3af',border:'#e5e7eb'} }} /></td>
                          </tr>
                        ))}
                      </tbody>
                    </table></div>
                  </div>
                </div>
              )}

              {/* ─── LEAVE ─── */}
              {activeTab === 'Leave' && (
                <div className="space-y-5">
                  <div className="grid grid-cols-3 gap-4">
                    <StatCard icon={Calendar}    label="Pending"  value={leaves.filter(l=>l.status==='Pending').length}  color="#f59e0b" />
                    <StatCard icon={CheckCircle} label="Approved" value={leaves.filter(l=>l.status==='Approved').length} color="#10b981" />
                    <StatCard icon={XCircle}     label="Rejected" value={leaves.filter(l=>l.status==='Rejected').length} color="#ef4444" />
                  </div>
                  <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-sm font-extrabold text-gray-900">Leave Requests</h2>
                      <div className="flex gap-1.5">{['all','Pending','Approved','Rejected'].map(f => (
                        <button key={f} onClick={() => setLeaveFilter(f)} className={`px-3 h-7 text-[11px] font-semibold rounded-xl transition-all ${leaveFilter===f?'text-white':'bg-gray-100 text-gray-500 hover:bg-gray-200'}`} style={leaveFilter===f?{background:BRAND}:{}}>{f==='all'?'All':f}</button>
                      ))}</div>
                    </div>
                    {filteredLeaves.length === 0 ? <p className="text-sm text-gray-400 text-center py-10">No leave requests found.</p> : (
                      <div className="overflow-x-auto"><table className="w-full text-sm">
                        <TH cols={['Employee','Type','From','To','Reason','Status','Action']} />
                        <tbody className="divide-y divide-gray-50">
                          {filteredLeaves.map(l => (
                            <tr key={l.id} className="hover:bg-gray-50/50 transition-colors">
                              <td className="py-3 px-3 font-semibold text-gray-800 whitespace-nowrap">{empName(l.employee_id)}</td>
                              <td className="py-3 px-3 text-gray-500 text-xs">{l.leave_type}</td>
                              <td className="py-3 px-3 text-gray-500 text-xs">{l.start_date}</td>
                              <td className="py-3 px-3 text-gray-500 text-xs">{l.end_date}</td>
                              <td className="py-3 px-3 text-gray-500 text-xs max-w-[120px] truncate">{l.reason||'—'}</td>
                              <td className="py-3 px-3"><Badge label={l.status} colorMap={STATUS_COLORS} /></td>
                               <td className="py-3 px-3">
                                <div className="flex items-center gap-1">
                                  {l.status==='Pending' && (
                                    <>
                                      <button onClick={() => handleLeaveAction(l.id,'Approved')} className="w-6 h-6 flex items-center justify-center rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-600 transition-colors" title="Approve"><CheckCircle size={12}/></button>
                                      <button onClick={() => handleLeaveAction(l.id,'Rejected')} className="w-6 h-6 flex items-center justify-center rounded-lg bg-red-50 hover:bg-red-100 text-red-500 transition-colors" title="Reject"><XCircle size={12}/></button>
                                    </>
                                  )}
                                  <button onClick={() => handleDeleteLeave(l.id)} className="w-6 h-6 flex items-center justify-center rounded-lg bg-gray-50 hover:bg-red-50 text-gray-400 hover:text-red-600 transition-colors" title="Delete request permanently"><Trash2 size={12}/></button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table></div>
                    )}
                  </div>
                </div>
              )}

              {/* ─── REPORTS ─── */}
              {activeTab === 'Reports' && (
                <div className="space-y-5">
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCard icon={Users}       label="Total Employees"    value={employees.length}                       color={BRAND}    />
                    <StatCard icon={UserCheck}   label="Attendance Records" value={attendance.length}                     color="#10b981"  />
                    <StatCard icon={Calendar}    label="Leave Requests"     value={leaves.length}                         color="#f59e0b"  />
                    <StatCard icon={CheckSquare} label="Tasks Created"      value={tasks.length}                          color="#8b5cf6"  />
                  </div>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
                      <h2 className="text-sm font-extrabold text-gray-900 mb-4">Task Status Breakdown</h2>
                      {STATUSES.filter(s => tasks.filter(t=>t.status===s).length > 0).map(s => (
                        <div key={s} 
                          onClick={() => setBreakdownStatusDetails(s)}
                          className="flex items-center justify-between py-2.5 border-b border-gray-50 last:border-0 cursor-pointer hover:bg-gray-50 px-2 rounded-lg -mx-2 transition-all"
                          title={`Click to view ${s} tasks`}>
                          <div className="flex items-center gap-2">
                            <div className="w-2.5 h-2.5 rounded-full" style={{background: STATUS_COLORS[s]?.text||'#6b7280'}}/>
                            <span className="text-sm font-medium text-gray-700 hover:text-[#4F6AF7] transition-colors">{s}</span>
                          </div>
                          <span className="text-sm font-extrabold text-gray-900">{tasks.filter(t=>t.status===s).length}</span>
                        </div>
                      ))}
                    </div>
                    <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
                      <h2 className="text-sm font-extrabold text-gray-900 mb-4">Leave Summary</h2>
                      {['Pending','Approved','Rejected'].map(s => (
                        <div key={s} className="flex items-center justify-between py-2.5 border-b border-gray-50 last:border-0">
                          <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full" style={{background:s==='Approved'?'#10b981':s==='Rejected'?'#ef4444':'#f59e0b'}}/><span className="text-sm font-medium text-gray-700">{s}</span></div>
                          <span className="text-sm font-extrabold text-gray-900">{leaves.filter(l=>l.status===s).length}</span>
                        </div>
                      ))}
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
                      <input value={alertInput} onChange={e => setAlertInput(e.target.value)} placeholder="Write your alert message…" className="flex-1 h-10 px-4 text-sm rounded-xl border border-gray-200 focus:outline-none focus:border-indigo-400" onKeyDown={e => e.key==='Enter' && handleAddAlert()} />
                      <select value={alertType} onChange={e => setAlertType(e.target.value)} className="h-10 px-3 text-sm rounded-xl border border-gray-200 focus:outline-none focus:border-indigo-400">
                        <option value="info">ℹ️ Info</option><option value="warning">⚠️ Warning</option><option value="success">✅ Success</option><option value="urgent">🔴 Urgent</option>
                      </select>
                      <button onClick={handleAddAlert} disabled={saving} className="h-10 px-5 text-white text-xs font-bold rounded-xl flex items-center gap-1.5" style={{background:BRAND}}>
                        <Plus size={13}/> Post Alert
                      </button>
                    </div>
                  </div>
                  <div className="space-y-3">
                    {alerts.length === 0 ? (
                      <div className="bg-white border border-gray-100 rounded-2xl p-10 text-center shadow-sm"><Bell size={28} className="text-gray-200 mx-auto mb-2"/><p className="text-sm text-gray-400 font-medium">No alerts posted yet.</p></div>
                    ) : alerts.map(a => { const s = ALERT_STYLE[a.body] || ALERT_STYLE.info; return (
                      <div key={a.id} className="flex items-start gap-3 p-4 rounded-2xl border" style={{background:s.bg,borderColor:s.border}}>
                        <span className="text-lg shrink-0 mt-0.5">{s.icon}</span>
                        <div className="flex-1 min-w-0"><p className="text-sm font-semibold" style={{color:s.text}}>{a.title}</p><p className="text-[10px] text-gray-400 mt-1">{new Date(a.created_at).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'})}</p></div>
                        <button onClick={() => handleDeleteAlert(a.id)} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-black/10 text-gray-400 transition-colors"><X size={13}/></button>
                      </div>
                    ); })}
                  </div>
                </div>
              )}

              {/* ─── TASKS ─── */}
              {activeTab === 'Tasks' && (
                <div className="space-y-5">
                  {/* Sub-tab nav (only when in list view) */}
                  {/* TASK LIST VIEW */}
                  {taskView === 'list' && (
                    <div className="space-y-4">
                      {/* Filters */}
                      <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row gap-3">
                        <div className="relative flex-1">
                          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                          <input value={taskFilters.search} onChange={e => setTaskFilters(p => ({...p, search: e.target.value}))} placeholder="Search tasks…" className="w-full pl-8 pr-3 h-9 text-xs rounded-xl border border-gray-200 focus:outline-none focus:border-indigo-400" />
                        </div>
                        <select value={taskFilters.status} onChange={e => setTaskFilters(p => ({...p, status: e.target.value}))} className="h-9 px-3 text-xs rounded-xl border border-gray-200 focus:outline-none focus:border-indigo-400">
                          <option value="all">All Status</option>
                          {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                        <select value={taskFilters.priority} onChange={e => setTaskFilters(p => ({...p, priority: e.target.value}))} className="h-9 px-3 text-xs rounded-xl border border-gray-200 focus:outline-none focus:border-indigo-400">
                          <option value="all">All Priority</option>
                          {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
                        </select>
                      </div>

                      {/* Task count */}
                      <div className="flex items-center justify-between">
                        <p className="text-xs text-gray-500 font-medium">{filteredTasks.length} task{filteredTasks.length !== 1 ? 's' : ''} found</p>
                        <div className="flex gap-2">
                          {[['all','All'],[...STATUSES.filter(s=>['Pending','In Progress','Completed','Approved'].includes(s)).map(s=>[s,s])]].flat().filter(x=>typeof x==='object').slice(0,4).map(([val,lbl]) => (
                            <button key={val} onClick={() => setTaskFilters(p=>({...p,status:val}))}
                              className={`px-3 h-6 text-[10px] font-bold rounded-lg transition-all ${taskFilters.status===val?'text-white':'bg-gray-100 text-gray-500'}`}
                              style={taskFilters.status===val?{background:BRAND}:{}}>{lbl==='all'?'All':lbl}</button>
                          ))}
                        </div>
                      </div>

                      {/* Task table */}
                      {filteredTasks.length === 0 ? (
                        <div className="bg-white border border-gray-100 rounded-2xl p-16 text-center shadow-sm">
                          <ClipboardList size={36} className="text-gray-200 mx-auto mb-3" />
                          <p className="text-sm font-semibold text-gray-400">No tasks found</p>
                          <p className="text-xs text-gray-300 mt-1">Create your first task using the "+ New Task" button</p>
                        </div>
                      ) : (
                        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
                          <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                              <TH cols={['Task ID','Title','Assigned To','Priority','Status','Due Date','Progress','Accepted By','Actions']} />
                              <tbody className="divide-y divide-gray-50">
                                {filteredTasks.map(task => {
                                  const overdue = task.due_date && task.due_date < today && !['Completed','Approved','Cancelled'].includes(task.status);
                                  // Find acceptance record from task progress
                                  const acceptanceRecord = taskProgress.find(p => p.task_id === task.id && p.note === 'Task Accepted');
                                  // Find completion feedback
                                  const fb = taskFeedback.find(f => f.task_id === task.id);
                                  const rev = taskReviews.find(r => r.task_id === task.id);
                                  // Find accepted report notification
                                  const acceptedReport = taskReports.find(r => r.title && r.title.includes(task.task_title) && r.title.toLowerCase().includes('accepted'));
                                  return (
                                    <tr key={task.id} className="hover:bg-gray-50/50 transition-colors">
                                      <td className="py-3 px-4 font-mono text-[11px] text-gray-400">{task.id.slice(0,8).toUpperCase()}</td>
                                      <td className="py-3 px-4">
                                        <div className="flex flex-col gap-0.5">
                                          <p className="font-semibold text-gray-800 text-sm">{task.task_title}</p>
                                          {task.project_name && <p className="text-[10px] text-gray-400">{task.project_name}</p>}
                                          {['Accepted','In Progress','Paused','Completed','Approved'].includes(task.status) && (
                                            <span className="inline-flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100 w-fit mt-0.5">
                                              ✓ {task.status === 'Pending' ? 'Accepted' : task.status === 'Completed' ? 'Submitted' : 'Active'}
                                            </span>
                                          )}
                                        </div>
                                      </td>
                                      <td className="py-3 px-4 text-xs text-gray-500 max-w-[120px] truncate">{taskAssigneeNames(task.id)}</td>
                                      <td className="py-3 px-4"><Badge label={task.priority} colorMap={PRIORITY_COLORS} /></td>
                                      <td className="py-3 px-4"><Badge label={task.status}   colorMap={STATUS_COLORS}   /></td>
                                      <td className="py-3 px-4">
                                        <span className={`text-xs font-medium ${overdue ? 'text-red-500 font-bold' : 'text-gray-500'}`}>
                                          {task.due_date || '—'}{overdue && ' ⚠️'}
                                        </span>
                                      </td>
                                      <td className="py-3 px-4">
                                        <div className="flex items-center gap-2">
                                          <div className="w-16 h-1.5 rounded-full bg-gray-100 overflow-hidden">
                                            <div className="h-full rounded-full transition-all" style={{ width: `${task.completion_pct||0}%`, background: BRAND }} />
                                          </div>
                                          <span className="text-[10px] font-bold text-gray-500">{task.completion_pct||0}%</span>
                                        </div>
                                      </td>
                                      <td className="py-3 px-4">
                                        {acceptanceRecord ? (
                                          <div className="flex flex-col gap-0.5">
                                            <span className="text-[10px] font-bold text-emerald-600">✓ Accepted</span>
                                            <span className="text-[9px] text-gray-400">
                                              {acceptanceRecord.created_at ? new Date(acceptanceRecord.created_at).toLocaleDateString('en-IN', { day:'2-digit', month:'short', hour:'2-digit', minute:'2-digit' }) : '—'}
                                            </span>
                                          </div>
                                        ) : (
                                          <span className="text-[10px] text-gray-300 italic">Not yet</span>
                                        )}
                                      </td>
                                      <td className="py-3 px-4">
                                        <div className="flex items-center gap-1 flex-wrap">
                                          <button onClick={() => openEditTask(task)} title="Edit" className="w-6 h-6 flex items-center justify-center rounded-lg text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"><Edit size={11}/></button>
                                          <button onClick={() => handleDuplicateTask(task)} title="Duplicate" className="w-6 h-6 flex items-center justify-center rounded-lg text-gray-400 hover:text-green-600 hover:bg-green-50 transition-colors"><Copy size={11}/></button>
                                          <button onClick={() => handleCancelTask(task.id)} title="Cancel" className="w-6 h-6 flex items-center justify-center rounded-lg text-gray-400 hover:text-amber-600 hover:bg-amber-50 transition-colors"><XCircle size={11}/></button>
                                          <button onClick={() => handleDeleteTask(task.id)} title="Delete" className="w-6 h-6 flex items-center justify-center rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"><Trash2 size={11}/></button>
                                          {fb && (
                                            <button onClick={() => { setReviewingTask(task); setReviewForm({ decision: '', comments: '', rating: 5 }); }} title="View Report" className="w-6 h-6 flex items-center justify-center rounded-lg text-gray-400 hover:text-purple-600 hover:bg-purple-50 transition-colors"><Eye size={11}/></button>
                                          )}
                                        </div>
                                      </td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* CREATE / EDIT FORM */}
                  {(taskView === 'create' || taskView === 'edit') && renderTaskFormPanel()}
                </div>
              )}
            </>
          )}
        </div>
      </main>

      {/* ── Employee Task Detail Card Modal (Completion Review & Leaves) ── */}
      {selectedEmpDetail && (() => {
        const emp = selectedEmpDetail;
        const dept = departments.find(d => d.id === emp.department_id);
        const meta = emp.pf_number?.trim().startsWith('{') ? (() => { try { return JSON.parse(emp.pf_number); } catch { return {}; } })() : {};
        const empAssigns = taskAssignments.filter(a => a.employee_id === emp.id);
        const empTasks = tasks.filter(t => empAssigns.some(a => a.task_id === t.id));
        const empProgressRows = taskProgress.filter(p => p.employee_id === emp.id);
        const empFeedback = taskFeedback.filter(f => f.employee_id === emp.id);
        const acceptanceRecords = empProgressRows.filter(p => p.note === 'Task Accepted');
        const empLeaves = leaves.filter(l => l.employee_id === emp.id);
        const totalT = empTasks.length;
        const doneT = empTasks.filter(t => ['Completed','Approved'].includes(t.status)).length;
        const activeT = empTasks.filter(t => ['Accepted','In Progress','Paused','Revision Required'].includes(t.status)).length;
        const score = totalT > 0 ? Math.round((doneT / totalT) * 100) : 0;
        const today = new Date().toISOString().split('T')[0];

        const pColors = {
          Low: 'bg-green-50 text-green-700 border border-green-100',
          Medium: 'bg-amber-50 text-amber-700 border border-amber-100',
          High: 'bg-orange-50 text-orange-700 border border-orange-100',
          Critical: 'bg-red-50 text-red-700 border border-red-100',
        };
        const sColors = {
          'Pending': 'bg-gray-50 text-gray-600', 'Accepted': 'bg-blue-50 text-blue-700',
          'In Progress': 'bg-indigo-50 text-indigo-700', 'Paused': 'bg-amber-50 text-amber-700',
          'Completed': 'bg-teal-50 text-teal-700', 'Approved': 'bg-green-50 text-green-700',
          'Rejected': 'bg-rose-50 text-rose-700', 'Cancelled': 'bg-gray-100 text-gray-400',
        };

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fadeIn" onClick={() => setSelectedEmpDetail(null)}>
            <div className="bg-white w-full max-w-[700px] max-h-[88vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-slideUp" onClick={e => e.stopPropagation()}>
              {/* Header */}
              <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-gradient-to-r from-[#4F6AF7]/5 to-indigo-50/30">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-white font-extrabold text-lg" style={{ background: BRAND }}>
                    {emp.first_name?.[0]}{emp.last_name?.[0]}
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-gray-900">{emp.first_name} {emp.last_name}</h3>
                    <p className="text-[11px] text-gray-400">{emp.designation || 'Employee'} · {dept?.name || '—'}</p>
                  </div>
                </div>
                <button onClick={() => setSelectedEmpDetail(null)} className="p-2 rounded-xl text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors"><X size={18} /></button>
              </div>

              {/* Stats row */}
              <div className="px-6 py-4 grid grid-cols-4 gap-3 border-b border-gray-100 bg-gray-50/50">
                {[
                  { label: 'Total', value: totalT, color: BRAND },
                  { label: 'Active', value: activeT, color: '#f59e0b' },
                  { label: 'Done', value: doneT, color: '#10b981' },
                  { label: 'Score', value: `${score}%`, color: score >= 75 ? '#10b981' : score >= 40 ? '#f59e0b' : '#ef4444' },
                ].map(s => (
                  <div key={s.label} className="text-center">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">{s.label}</p>
                    <p className="text-2xl font-extrabold mt-0.5" style={{ color: s.color }}>{s.value}</p>
                  </div>
                ))}
              </div>

              {/* Performance Level */}
              {meta.performance_status && (
                <div className="px-6 py-3 border-b border-gray-100 flex items-center gap-2">
                  <span className="text-[10px] font-bold text-gray-400 uppercase">Performance Level:</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    meta.performance_status === 'Excellent' ? 'bg-green-50 text-green-700' :
                    meta.performance_status === 'Good' ? 'bg-blue-50 text-blue-700' :
                    meta.performance_status === 'Average' ? 'bg-amber-50 text-amber-700' :
                    'bg-red-50 text-red-700'
                  }`}>{meta.performance_status}</span>
                  {meta.performance_rating && <span className="text-[10px] text-amber-500 font-bold">⭐ {meta.performance_rating}/5</span>}
                </div>
              )}

              {/* Modal Tabs Navigation */}
              <div className="px-6 border-b border-gray-100 flex gap-4 bg-gray-50/20">
                <button onClick={() => setEmpDetailTab('tasks')} className={`py-3 text-xs font-bold transition-all border-b-2 ${empDetailTab === 'tasks' ? 'border-[#4F6AF7] text-[#4F6AF7]' : 'border-transparent text-gray-400 hover:text-gray-650'}`}>
                  Assigned Tasks ({empTasks.length})
                </button>
                <button onClick={() => setEmpDetailTab('leaves')} className={`py-3 text-xs font-bold transition-all border-b-2 ${empDetailTab === 'leaves' ? 'border-[#4F6AF7] text-[#4F6AF7]' : 'border-transparent text-gray-400 hover:text-gray-650'}`}>
                  Leave Requests ({empLeaves.length})
                </button>
              </div>

              {/* Tab: Tasks */}
              {empDetailTab === 'tasks' && (
                <div className="flex-1 overflow-y-auto p-6 space-y-3">
                  <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-3">Assigned Tasks ({empTasks.length})</h4>
                  {empTasks.length === 0 ? (
                    <div className="text-center py-12 text-gray-300 italic text-sm">No tasks assigned yet</div>
                  ) : empTasks.map(task => {
                    const accepted = acceptanceRecords.find(p => p.task_id === task.id);
                    const fb = empFeedback.find(f => f.task_id === task.id);
                    const isOverdue = task.due_date && task.due_date < today && !['Completed','Approved','Cancelled'].includes(task.status);
                    return (
                      <div key={task.id} className="border border-gray-200 rounded-2xl p-4 space-y-2.5 hover:border-[#4F6AF7]/30 transition-colors">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-gray-900 text-sm truncate">{task.task_title}</p>
                            {task.project_name && <p className="text-[10px] text-indigo-600 font-semibold mt-0.5">{task.project_name}</p>}
                          </div>
                          <div className="flex items-center gap-1 shrink-0">
                            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${pColors[task.priority] || pColors.Medium}`}>{task.priority}</span>
                            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${sColors[task.status] || sColors.Pending}`}>{task.status}</span>
                          </div>
                        </div>
                        {/* Progress bar */}
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-gray-100 h-1.5 rounded-full overflow-hidden">
                            <div className="h-full rounded-full transition-all" style={{ width: `${task.completion_pct || 0}%`, background: BRAND }} />
                          </div>
                          <span className="text-[10px] font-bold text-gray-500">{task.completion_pct || 0}%</span>
                        </div>
                        {/* Meta */}
                        <div className="flex items-center justify-between text-[9px] text-gray-400">
                          <span>📅 Due: <span className={`font-semibold ${isOverdue ? 'text-red-500' : 'text-gray-600'}`}>{task.due_date || '—'}{isOverdue ? ' ⚠️' : ''}</span></span>
                          {accepted && <span className="text-emerald-600 font-bold">✓ Accepted {new Date(accepted.created_at).toLocaleDateString('en-IN', { day:'2-digit', month:'short' })}</span>}
                        </div>
                        {/* Completion feedback */}
                        {fb && (
                          <div className="bg-teal-50 border border-teal-100 rounded-xl p-3 mt-1">
                            <p className="text-[9px] font-bold text-teal-700 uppercase tracking-wide mb-1">Completion Report</p>
                            <p className="text-[10px] text-teal-800 line-clamp-2">{fb.work_summary || 'No summary provided.'}</p>
                            {fb.hours_worked && <span className="text-[9px] text-teal-600 font-semibold">⏱ {fb.hours_worked}h logged</span>}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Tab: Leaves */}
              {empDetailTab === 'leaves' && (
                <div className="flex-1 overflow-y-auto p-6 space-y-3.5">
                  <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-3">Leave History & Requests ({empLeaves.length})</h4>
                  {empLeaves.length === 0 ? (
                    <div className="text-center py-12 text-gray-300 italic text-sm">No leave requests found for this employee</div>
                  ) : empLeaves.map(leave => (
                    <div key={leave.id} className="border border-gray-200 rounded-2xl p-4 space-y-3 hover:border-[#4F6AF7]/30 transition-all bg-gray-50/20">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-gray-800">{leave.leave_type}</span>
                        <Badge label={leave.status} colorMap={STATUS_COLORS} />
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-[10px] text-gray-500 bg-white p-2.5 rounded-xl border border-gray-100">
                        <div>
                          <span className="text-gray-400">From Date</span>
                          <p className="font-bold mt-0.5 text-gray-700">{leave.start_date}</p>
                        </div>
                        <div>
                          <span className="text-gray-400">To Date</span>
                          <p className="font-bold mt-0.5 text-gray-700">{leave.end_date}</p>
                        </div>
                      </div>
                      {leave.reason && (
                        <div className="bg-white p-2.5 rounded-xl border border-gray-100">
                          <span className="text-[8px] font-bold text-gray-400 uppercase">Reason</span>
                          <p className="text-[11px] text-gray-650 leading-relaxed mt-0.5">{leave.reason}</p>
                        </div>
                      )}
                      
                      {/* Action buttons if Pending */}
                      {leave.status === 'Pending' && (
                        <div className="flex justify-end gap-2 pt-1 border-t border-gray-50">
                          <button onClick={() => handleLeaveAction(leave.id, 'Rejected')} className="h-8 px-3 text-[10px] font-bold text-red-650 hover:bg-red-50 border border-red-200 rounded-lg transition-all">Reject</button>
                          <button onClick={() => handleLeaveAction(leave.id, 'Approved')} className="h-8 px-3 text-[10px] font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-all">Approve</button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

            </div>
          </div>
        );
      })()}

      {/* ── Task Review Modal ──────────────────────────── */}
      {reviewingTask && (() => {
        const task = reviewingTask;
        const fb = taskFeedback.find(f => f.task_id === task.id);
        const rv = taskReviews.find(r => r.task_id === task.id);
        
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fadeIn" onClick={() => setReviewingTask(null)}>
            <div className="bg-white w-full max-w-[650px] max-h-[85vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-slideUp" onClick={e => e.stopPropagation()}>
              {/* Header */}
              <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-gradient-to-r from-[#4F6AF7]/5 to-indigo-50/30">
                <div>
                  <h3 className="text-base font-extrabold text-gray-900">Task Completion Review</h3>
                  <p className="text-[11px] text-gray-400 mt-0.5">Review details of task "{task.task_title}"</p>
                </div>
                <button onClick={() => setReviewingTask(null)} className="p-2 rounded-xl text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors"><X size={18} /></button>
              </div>

              {/* Scrollable Content */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {/* Task info */}
                <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-[10px] font-bold text-gray-400 font-mono">{task.id.slice(0,8).toUpperCase()}</span>
                    <Badge label={task.priority} colorMap={PRIORITY_COLORS} />
                    <Badge label={task.status}   colorMap={STATUS_COLORS}   />
                  </div>
                  <h4 className="font-extrabold text-gray-800 text-sm">{task.task_title}</h4>
                  {task.project_name && <p className="text-[10px] text-indigo-600 font-semibold mt-1">📁 {task.project_name}</p>}
                </div>

                {/* Submission Form Details */}
                {fb ? (
                  <div className="bg-white rounded-2xl border-2 border-dashed border-indigo-100 p-5 space-y-4">
                    <div className="border-b border-gray-100 pb-2">
                      <h5 className="text-xs font-black text-indigo-700 uppercase tracking-widest">📋 Completion Report</h5>
                    </div>
                    <div className="grid grid-cols-2 gap-2.5">
                      <div className="bg-gray-50 rounded-xl p-2.5 border border-gray-100">
                        <span className="text-[8px] font-bold text-gray-400 uppercase">📅 Date Completed</span>
                        <p className="text-xs font-bold text-gray-800 mt-0.5">{fb.completion_date || '—'}</p>
                      </div>
                      <div className="bg-gray-50 rounded-xl p-2.5 border border-gray-100">
                        <span className="text-[8px] font-bold text-gray-400 uppercase">⏱️ Hours Worked</span>
                        <p className="text-xs font-bold text-gray-800 mt-0.5">{fb.hours_worked ? `${fb.hours_worked} hrs` : '—'}</p>
                      </div>
                    </div>
                    {fb.work_summary && (
                      <div className="bg-gray-50/50 p-3.5 rounded-xl border border-gray-100">
                        <span className="text-[8px] font-bold text-gray-400 uppercase block mb-1">Deliverables & Summary</span>
                        <p className="text-xs text-gray-700 leading-relaxed">{fb.work_summary}</p>
                      </div>
                    )}
                    {fb.challenges && (
                      <div className="bg-rose-50/20 p-3 rounded-xl border border-rose-100/30">
                        <span className="text-[8px] font-bold text-rose-500 uppercase block mb-1">Challenges</span>
                        <p className="text-xs text-gray-655 leading-relaxed">{fb.challenges}</p>
                      </div>
                    )}
                    {fb.file_urls?.length > 0 && (
                      <div className="space-y-1.5">
                        <span className="text-[8px] font-bold text-gray-400 uppercase block">Reference Evidence/Files</span>
                        <div className="flex flex-wrap gap-1.5">
                          {fb.file_urls.filter(Boolean).map((url, i) => (
                            <a key={i} href={url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 px-2.5 py-1.5 bg-indigo-50 hover:bg-[#4F6AF7] hover:text-white rounded-lg text-[10px] font-bold text-[#4F6AF7] transition-all">
                              <FileText size={10} /> Evidence #{i + 1}
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="p-4 bg-amber-50 rounded-xl border border-amber-100 text-xs text-amber-700 font-medium">
                    ⚠️ Employee has not submitted a formal completion report.
                  </div>
                )}

                {/* Review Form */}
                {!rv ? (
                  <div className="p-4 bg-indigo-50/30 rounded-2xl border border-indigo-100/50 space-y-4">
                    <div>
                      <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block mb-2">Decision *</label>
                      <div className="flex gap-2">
                        {['Approved','Rejected','Revision Required'].map(d => (
                          <button key={d} onClick={() => setReviewForm(p => ({ ...p, decision: d }))}
                            className={`px-3.5 h-8 text-[11px] font-bold rounded-xl border transition-all ${reviewForm.decision === d ? 'text-white border-transparent' : 'border-gray-200 text-gray-650 bg-white hover:bg-gray-50'}`}
                            style={reviewForm.decision === d ? { background: d === 'Approved' ? '#059669' : d === 'Rejected' ? '#dc2626' : '#9333ea' } : {}}>
                            {d === 'Approved' ? '✅' : d === 'Rejected' ? '❌' : '🔄'} {d}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block mb-1.5">Employee Rating</label>
                      <StarRating value={reviewForm.rating} onChange={v => setReviewForm(p => ({ ...p, rating: v }))} />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block mb-1.5">Comments & Instructions</label>
                      <textarea value={reviewForm.comments} onChange={e => setReviewForm(p => ({ ...p, comments: e.target.value }))}
                        placeholder="Feedback or revision instructions..." rows={2}
                        className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 focus:outline-none focus:border-indigo-400 bg-white resize-none" />
                    </div>
                  </div>
                ) : (
                  <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-xl space-y-2">
                    <span className="text-[8px] font-bold text-emerald-700 uppercase">Review Logged</span>
                    <div className="flex items-center gap-4">
                      <div className="flex gap-0.5">
                        {[1,2,3,4,5].map(n => <Star key={n} size={12} fill={n <= (rv.employee_rating||0) ? '#f59e0b' : 'none'} color={n <= (rv.employee_rating||0) ? '#f59e0b' : '#d1d5db'} />)}
                      </div>
                      <p className="text-xs text-gray-700 font-medium">{rv.manager_comments || 'No comments'}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-2">
                <button onClick={() => setReviewingTask(null)} className="h-9 px-4 text-xs font-semibold rounded-xl border border-gray-200 text-gray-650 hover:bg-gray-100 transition-colors">Cancel</button>
                {!rv && (
                  <button onClick={handleReviewTask} disabled={savingReview || !reviewForm.decision} className="h-9 px-5 text-xs font-bold text-white rounded-xl flex items-center gap-1.5 transition-colors disabled:opacity-50" style={{ background: BRAND }}>
                    {savingReview ? <RefreshCw size={12} className="animate-spin" /> : <Send size={12} />}
                    Submit Decision
                  </button>
                )}
              </div>
            </div>
          </div>
        );
      })()}

      {/* ── Status Breakdown Details Modal ──────────────────────────── */}
      {breakdownStatusDetails && (() => {
        const status = breakdownStatusDetails;
        const statusTasks = tasks.filter(t => t.status === status);
        
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fadeIn" onClick={() => setBreakdownStatusDetails(null)}>
            <div className="bg-white w-full max-w-md max-h-[75vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-slideUp" onClick={e => e.stopPropagation()}>
              {/* Header */}
              <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-gradient-to-r from-[#4F6AF7]/5 to-indigo-50/30">
                <div>
                  <h3 className="text-sm font-bold text-gray-900 capitalize">{status} Tasks</h3>
                  <p className="text-[10px] text-gray-400 mt-0.5">Tasks currently marked as {status}</p>
                </div>
                <button onClick={() => setBreakdownStatusDetails(null)} className="p-1.5 rounded-xl text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors"><X size={16} /></button>
              </div>

              {/* Task list */}
              <div className="flex-1 overflow-y-auto p-6 space-y-3.5">
                {statusTasks.length === 0 ? (
                  <p className="text-xs text-gray-400 italic text-center py-6">No tasks under this status</p>
                ) : statusTasks.map(t => (
                  <div key={t.id} className="border border-gray-200 rounded-2xl p-4 hover:border-[#4F6AF7]/30 transition-all bg-gray-50/30">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="text-xs font-bold text-gray-800 leading-snug">{t.task_title}</h4>
                        {t.project_name && <p className="text-[9px] text-[#4F6AF7] font-semibold mt-0.5">📁 {t.project_name}</p>}
                      </div>
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${PRIORITY_COLORS[t.priority] || 'bg-gray-50 text-gray-655'}`}>{t.priority}</span>
                    </div>

                    <div className="mt-3 pt-2.5 border-t border-gray-100 flex justify-between items-center text-[10px]">
                      <span className="text-gray-400">Assigned To:</span>
                      <span className="font-bold text-gray-700 text-right max-w-[180px] truncate">{taskAssigneeNames(t.id)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      })()}

      {/* ── Delete Confirmation Modal ──────────────────────────── */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-slideUp">
            {/* Header */}
            <div className="bg-red-50 px-6 pt-6 pb-4 flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                <Trash2 size={18} className="text-red-600" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-gray-900">{deleteConfirm.title}</h3>
                <p className="text-xs text-gray-500 mt-1 leading-relaxed">{deleteConfirm.message}</p>
              </div>
            </div>
            {/* Actions */}
            <div className="px-6 py-4 flex justify-end gap-3 border-t border-gray-100">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="h-10 px-5 text-xs font-semibold border border-gray-200 text-gray-600 hover:bg-gray-50 rounded-xl transition-all"
              >
                Cancel
              </button>
              <button
                onClick={deleteConfirm.onConfirm}
                className="h-10 px-5 text-xs font-bold bg-red-600 hover:bg-red-700 text-white rounded-xl shadow-md shadow-red-600/20 transition-all"
              >
                Yes, Delete Permanently
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
