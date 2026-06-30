import React, { useState, useEffect } from 'react';
import { 
  Clock, Calendar, FileText, CheckCircle, XCircle, LogOut, ArrowRight,
  TrendingUp, Award, User, ChevronRight, Briefcase, Plus, CalendarDays, Activity,
  ClipboardList, CreditCard, Phone, Mail, Shield, Settings, LayoutDashboard, Search, Bell, Archive, Trash2, Paperclip
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { supabase as supabaseAnon, supabaseAdmin } from '../services/supabase';

const supabase = supabaseAdmin || supabaseAnon;

export default function SSSEmployeeDashboard() {
  const [company, setCompany] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [attendanceLogs, setAttendanceLogs] = useState([]);
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Navigation: 'Dashboard' | 'Attendance' | 'Salary' | 'Leave Request' | 'Personal Details'
  const [activeTab, setActiveTab] = useState('Dashboard');
  
  // Leave Request Form State
  const [leaveForm, setLeaveForm] = useState({
    leave_type: 'Sick Leave',
    from_date: new Date().toISOString().split('T')[0],
    to_date: new Date().toISOString().split('T')[0],
    total_days: 1,
    reason: ''
  });
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Month selector for stats
  const [currentMonth, setCurrentMonth] = useState(new Date().toISOString().slice(0, 7));

  // Personal Details Settings State
  const [emailInput, setEmailInput] = useState('');
  const [phoneInput, setPhoneInput] = useState('');
  const [dobInput, setDobInput] = useState('');
  const [profilePicInput, setProfilePicInput] = useState('');
  const [savingSettings, setSavingSettings] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [feedbackText, setFeedbackText] = useState('');
  const [feedbackWorkMode, setFeedbackWorkMode] = useState('Office');
  const [submittingFeedback, setSubmittingFeedback] = useState(false);
  const [notifFilter, setNotifFilter] = useState('all');
  const [notifSearch, setNotifSearch] = useState('');
  const [expandedNotifId, setExpandedNotifId] = useState(null);

  // Set document title without %20
  useEffect(() => {
    document.title = "Employee Detail";
  }, []);

  // Fetch initial data
  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch Story Seed company details
      const { data: companyData, error: companyErr } = await supabase
        .from('companies')
        .select('*')
        .ilike('name', '%story%seed%')
        .maybeSingle();

      if (companyErr) throw companyErr;
      if (!companyData) {
        throw new Error("Story Seed company not found. Please log in to SSS Admin first to initialize company details.");
      }
      setCompany(companyData);

      // Fetch Departments
      const { data: deptsData, error: deptsErr } = await supabase
        .from('departments')
        .select('*')
        .eq('company_id', companyData.id);

      if (deptsErr) throw deptsErr;
      setDepartments(deptsData || []);

      // Fetch all employees
      const { data: empData, error: empErr } = await supabase
        .from('employees')
        .select('*')
        .eq('company_id', companyData.id)
        .order('first_name', { ascending: true });

      if (empErr) throw empErr;
      setEmployees(empData || []);

      // Check for cached employee session
      const savedEmpId = localStorage.getItem('sss_employee_session_id');
      if (savedEmpId && empData) {
        const matched = empData.find(e => e.id === savedEmpId);
        if (matched) {
          setSelectedEmployee(matched);
          await fetchEmployeeData(matched.id, companyData.id);
        }
      }
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployeeData = async (employeeId, companyId) => {
    try {
      // Fetch attendance
      const { data: attData, error: attErr } = await supabase
        .from('attendance')
        .select('*')
        .eq('employee_id', employeeId)
        .eq('company_id', companyId)
        .order('date', { ascending: false });

      if (attErr) throw attErr;
      setAttendanceLogs(attData || []);

      // Fetch leave requests
      const { data: lData, error: lErr } = await supabase
        .from('leave_requests')
        .select('*')
        .eq('employee_id', employeeId)
        .eq('company_id', companyId)
        .order('created_at', { ascending: false });

      if (lErr) throw lErr;
      setLeaveRequests(lData || []);

      // Fetch notifications
      const { data: notifData, error: notifErr } = await supabase
        .from('notifications')
        .select('*')
        .eq('company_id', companyId)
        .or(`user_id.eq.${employeeId},user_id.is.null`)
        .order('created_at', { ascending: false });

      if (notifErr) throw notifErr;
      setNotifications(notifData || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Initialize input states when selectedEmployee changes
  useEffect(() => {
    if (selectedEmployee) {
      setEmailInput(selectedEmployee.email || '');
      setPhoneInput(selectedEmployee.phone || '');
      const meta = getMetadata(selectedEmployee);
      setDobInput(meta.date_of_birth || '');
      setProfilePicInput(meta.profile_picture || '');
    }
  }, [selectedEmployee]);

  const handleSelectEmployee = async (emp) => {
    setSelectedEmployee(emp);
    localStorage.setItem('sss_employee_session_id', emp.id);
    await fetchEmployeeData(emp.id, company.id);
  };

  const handleLogout = () => {
    setSelectedEmployee(null);
    setAttendanceLogs([]);
    setLeaveRequests([]);
    setNotifications([]);
    localStorage.removeItem('sss_employee_session_id');
    setActiveTab('Dashboard');
  };

  const handleMarkAllRead = async () => {
    if (!selectedEmployee || !company) return;
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('company_id', company.id)
        .or(`user_id.eq.${selectedEmployee.id},user_id.is.null`);
      if (error) throw error;
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkIndividualRead = async (id) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', id);
      if (error) throw error;
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
    } catch (err) {
      console.error(err);
    }
  };

  const handleArchiveIndividual = async (id, currentArchiveState) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_archived: !currentArchiveState })
        .eq('id', id);
      if (error) throw error;
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_archived: !currentArchiveState } : n));
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteIndividual = async (id) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', id);
      if (error) throw error;
      setNotifications(prev => prev.filter(n => n.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();
    if (!feedbackText.trim()) return;
    setSubmittingFeedback(true);
    try {
      const todayStr = new Date().toISOString().split('T')[0];
      const { error: repErr } = await supabase
        .from('daily_reports')
        .insert({
          employee_id: selectedEmployee.id,
          company_id: company.id,
          report_date: todayStr,
          description: feedbackText.trim(),
          tags: [feedbackWorkMode],
          submitted_at: new Date().toISOString()
        });
      if (repErr) throw repErr;

      const { error: notifErr } = await supabase
        .from('notifications')
        .insert({
          company_id: company.id,
          type: 'announcement',
          title: 'Daily Feedback Submitted',
          body: `Employee ${selectedEmployee.first_name} ${selectedEmployee.last_name} submitted daily feedback: "${feedbackText.trim()}"`,
          is_read: false,
          created_at: new Date().toISOString()
        });
      if (notifErr) throw notifErr;

      setShowFeedbackModal(false);
      handleLogout();
    } catch (err) {
      console.error(err);
      alert('Error submitting daily feedback: ' + err.message);
    } finally {
      setSubmittingFeedback(false);
    }
  };

  // Helper calculations
  const getWorkingHours = (clockIn, clockOut) => {
    if (!clockIn || !clockOut) return 0;
    try {
      const a = new Date(clockIn), b = new Date(clockOut);
      if (isNaN(a) || isNaN(b)) return 0;
      const diff = (b - a) / 3600000;
      return diff > 0 ? Math.round(diff * 100) / 100 : 0;
    } catch { return 0; }
  };

  const getOvertimeHours = (hrs) => Math.max(0, Math.round((hrs - 8) * 100) / 100);

  const isLateArrival = (clockIn) => {
    if (!clockIn) return false;
    try {
      const t = new Date(clockIn);
      return t.getHours() > 9 || (t.getHours() === 9 && t.getMinutes() > 30);
    } catch { return false; }
  };

  const getMetadata = (emp) => {
    if (!emp?.pf_number) return {};
    try {
      return JSON.parse(emp.pf_number);
    } catch {
      return {};
    }
  };

  const getDeptName = (deptId) => {
    const dept = departments.find(d => d.id === deptId);
    return dept ? dept.name : '—';
  };

  const getManagerName = (managerId) => {
    const mgr = employees.find(e => e.id === managerId);
    return mgr ? `${mgr.first_name} ${mgr.last_name}` : '—';
  };

  // Monthly stats computation
  const stats = React.useMemo(() => {
    if (!selectedEmployee) return { present: 0, late: 0, absent: 0, totalHours: 0, pct: 0, leaves: 0 };
    const [yr, mo] = currentMonth.split('-').map(Number);
    const logs = attendanceLogs.filter(l => {
      if (!l.date) return false;
      const d = new Date(l.date);
      return d.getFullYear() === yr && d.getMonth() + 1 === mo;
    });

    const approvedLeaves = leaveRequests.filter(r => 
      r.status?.toUpperCase() === 'APPROVED' && 
      (r.from_date?.slice(0, 7) === currentMonth || r.to_date?.slice(0, 7) === currentMonth)
    );

    let present = 0, late = 0, absent = 0, totalHours = 0;
    logs.forEach(l => {
      if (l.status === 'Present') present++;
      else if (l.status === 'Late') { present++; late++; }
      else if (l.status === 'Absent') absent++;
      totalHours += getWorkingHours(l.clock_in, l.clock_out);
    });

    const daysInMonth = new Date(yr, mo, 0).getDate();
    const workdays = Math.round(daysInMonth * 5 / 7);
    const pct = workdays > 0 ? Math.min(100, Math.round((present / workdays) * 100)) : 0;
    const leaveDays = approvedLeaves.reduce((sum, r) => sum + (r.total_days || 0), 0);

    return {
      present: present - late,
      late,
      absent,
      totalHours: Math.round(totalHours * 10) / 10,
      pct,
      leaves: leaveDays
    };
  }, [attendanceLogs, leaveRequests, currentMonth, selectedEmployee]);

  const handleLeaveSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitSuccess(false);
      const payload = {
        employee_id: selectedEmployee.id,
        company_id: company.id,
        leave_type: leaveForm.leave_type,
        from_date: leaveForm.from_date,
        to_date: leaveForm.to_date,
        total_days: Number(leaveForm.total_days),
        reason: leaveForm.reason || null,
        status: 'PENDING'
      };

      const { error: err } = await supabase
        .from('leave_requests')
        .insert([payload]);

      if (err) throw err;
      setSubmitSuccess(true);
      setLeaveForm({
        leave_type: 'Sick Leave',
        from_date: new Date().toISOString().split('T')[0],
        to_date: new Date().toISOString().split('T')[0],
        total_days: 1,
        reason: ''
      });
      await fetchEmployeeData(selectedEmployee.id, company.id);
    } catch (err) {
      alert('Failed to submit leave request: ' + err.message);
    }
  };

  const handleBannerFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert("Image is too large. Please select an image under 5MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = async () => {
        const canvas = document.createElement('canvas');
        const size = 150;
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        
        const minSide = Math.min(img.width, img.height);
        const sx = (img.width - minSide) / 2;
        const sy = (img.height - minSide) / 2;
        
        ctx.drawImage(img, sx, sy, minSide, minSide, 0, 0, size, size);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
        
        try {
          const currentMeta = getMetadata(selectedEmployee);
          const updatedMeta = {
            ...currentMeta,
            profile_picture: dataUrl
          };

          const { error: updateErr } = await supabase
            .from('employees')
            .update({
              pf_number: JSON.stringify(updatedMeta)
            })
            .eq('id', selectedEmployee.id);

          if (updateErr) throw updateErr;

          const updatedEmp = {
            ...selectedEmployee,
            pf_number: JSON.stringify(updatedMeta)
          };
          setSelectedEmployee(updatedEmp);
          setEmployees(prev => prev.map(emp => emp.id === selectedEmployee.id ? updatedEmp : emp));
          setProfilePicInput(dataUrl);
        } catch (err) {
          alert('Failed to save profile picture: ' + err.message);
        }
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    try {
      setSavingSettings(true);
      const currentMeta = getMetadata(selectedEmployee);
      const updatedMeta = {
        ...currentMeta,
        date_of_birth: dobInput,
        profile_picture: profilePicInput
      };

      const { error: updateErr } = await supabase
        .from('employees')
        .update({
          email: emailInput,
          phone: phoneInput,
          pf_number: JSON.stringify(updatedMeta)
        })
        .eq('id', selectedEmployee.id);

      if (updateErr) throw updateErr;

      // Update local state
      const updatedEmp = {
        ...selectedEmployee,
        email: emailInput,
        phone: phoneInput,
        pf_number: JSON.stringify(updatedMeta)
      };
      setSelectedEmployee(updatedEmp);
      setEmployees(prev => prev.map(emp => emp.id === selectedEmployee.id ? updatedEmp : emp));
      alert('Personal settings updated successfully!');
    } catch (err) {
      alert('Failed to save settings: ' + err.message);
    } finally {
      setSavingSettings(false);
    }
  };

  // Recharts Attendance History Chart Data preparation
  const chartData = React.useMemo(() => {
    const logs = [...attendanceLogs].slice(0, 7).reverse();
    return logs.map(l => {
      const hrs = getWorkingHours(l.clock_in, l.clock_out);
      const dayName = new Date(l.date).toLocaleDateString('en-US', { weekday: 'short' });
      return {
        day: dayName,
        'Hours Worked': hrs > 0 ? hrs : 8
      };
    });
  }, [attendanceLogs]);

  // Fallback data if no logs exist yet
  const displayChartData = chartData.length > 0 ? chartData : [
    { day: 'Mon', 'Hours Worked': 8.5 },
    { day: 'Tue', 'Hours Worked': 8.0 },
    { day: 'Wed', 'Hours Worked': 9.2 },
    { day: 'Thu', 'Hours Worked': 8.0 },
    { day: 'Fri', 'Hours Worked': 7.5 },
    { day: 'Sat', 'Hours Worked': 8.8 },
    { day: 'Sun', 'Hours Worked': 0 }
  ];

  // Realtime subscription setup
  useEffect(() => {
    fetchData();

    const channel = supabase
      .channel('employee-db-sync')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'leave_requests' },
        () => {
          const cachedEmpId = localStorage.getItem('sss_employee_session_id');
          if (cachedEmpId && company) {
            fetchEmployeeData(cachedEmpId, company.id);
          }
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'attendance' },
        () => {
          const cachedEmpId = localStorage.getItem('sss_employee_session_id');
          if (cachedEmpId && company) {
            fetchEmployeeData(cachedEmpId, company.id);
          }
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'notifications' },
        () => {
          const cachedEmpId = localStorage.getItem('sss_employee_session_id');
          if (cachedEmpId && company) {
            fetchEmployeeData(cachedEmpId, company.id);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [company]);

  // LOGIN SCREEN
  if (!selectedEmployee) {
    return (
      <div className="min-h-screen bg-[#F0F2F8] font-inter flex flex-col items-center justify-center p-4">
        <div className="bg-white/80 backdrop-blur-xl border border-gray-150 p-8 rounded-3xl shadow-xl w-full max-w-md space-y-6 text-center">
          <div className="flex flex-col items-center gap-2">
            <div className="w-12 h-12 bg-gradient-to-br from-[#4F6AF7] to-[#8094FF] rounded-2xl flex items-center justify-center text-white shadow-lg shadow-[#4F6AF7]/20">
              <User size={24} />
            </div>
            <h1 className="text-xl font-extrabold text-gray-900 tracking-tight">Employee Detail</h1>
            <p className="text-xs text-gray-400">Story Seed Studio Profile Directory</p>
          </div>

          {loading ? (
            <div className="py-8 flex flex-col items-center justify-center gap-3">
              <div className="w-8 h-8 border-4 border-[#4F6AF7] border-t-transparent rounded-full animate-spin" />
              <p className="text-xs text-gray-500 font-semibold">Connecting to backend...</p>
            </div>
          ) : error ? (
            <div className="p-4 bg-red-50 text-red-700 text-xs rounded-xl font-medium border border-red-100">
              {error}
            </div>
          ) : (
            <div className="space-y-4 text-left">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Choose Employee Profile</label>
                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                  {employees.map(emp => (
                    <button
                      key={emp.id}
                      onClick={() => handleSelectEmployee(emp)}
                      className="w-full flex items-center justify-between p-3.5 border border-gray-150 hover:border-[#4F6AF7] hover:bg-indigo-50/20 rounded-2xl transition-all group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-indigo-50 text-indigo-755 font-black flex items-center justify-center text-xs">
                          {emp.first_name?.[0]}{emp.last_name?.[0]}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-gray-900 leading-none">{emp.first_name} {emp.last_name}</p>
                          <p className="text-[10px] text-gray-400 mt-1">{emp.designation || 'Specialist'}</p>
                        </div>
                      </div>
                      <ChevronRight size={14} className="text-gray-300 group-hover:text-[#4F6AF7] transition-all" />
                    </button>
                  ))}
                  {employees.length === 0 && (
                    <p className="text-xs text-gray-400 text-center py-4">No employees initialized. Add employees in the SSS Admin portal first.</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  const meta = getMetadata(selectedEmployee);
  const baseSalary = selectedEmployee.basic_salary || 0;
  const pfContribution = Math.round(baseSalary * 0.12);
  const netTakeHome = baseSalary - pfContribution;

  return (
    <div className="min-h-screen bg-[#F0F2F8] font-inter text-[#1e293b] flex flex-col md:flex-row">
      
      {/* ── Left Sidebar Menu (Restored to white matching SSSPortal admin dashboard layout) ── */}
      <aside className="w-full md:w-64 bg-white border-r border-gray-200 flex flex-col shrink-0 shadow-sm">
        
        {/* Brand header console */}
        <div className="px-6 py-5 border-b border-gray-100 bg-white flex flex-col items-start gap-2.5">
          <img 
            src="/logo.png?v=3" 
            alt="Story Seed Studio" 
            className="h-12 w-12 rounded-2xl object-cover shadow-sm border border-gray-100"
          />
          <div className="flex flex-col">
            <span className="text-xs font-bold text-gray-900 leading-none">Employee</span>
            <span className="text-[10px] text-gray-400 font-medium mt-1">Story Seed Studio</span>
          </div>
        </div>

        {/* Profile Card Header (Supports Custom Profile Picture) */}
        <div className="p-4 mx-3 my-4 bg-indigo-50/50 border border-indigo-100 rounded-2xl flex items-center gap-3">
          {meta.profile_picture ? (
            <img 
              src={meta.profile_picture} 
              alt="Profile" 
              className="w-10 h-10 rounded-full object-cover shrink-0 border border-gray-200"
              onError={(e) => { e.currentTarget.src = ''; }}
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-[#4F6AF7] text-white font-black flex items-center justify-center text-xs shrink-0">
              {selectedEmployee.first_name?.[0]}{selectedEmployee.last_name?.[0]}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold text-gray-900 truncate leading-tight">{selectedEmployee.first_name} {selectedEmployee.last_name}</p>
            <p className="text-[10px] text-gray-400 mt-0.5 truncate">{selectedEmployee.designation || 'Specialist'}</p>
          </div>
        </div>

        {/* Nav Tabs List */}
        <nav className="flex-1 px-3 space-y-0.5">
          {[
            { name: 'Dashboard', icon: LayoutDashboard },
            { name: 'Attendance', icon: CalendarDays },
            { name: 'Salary', icon: CreditCard },
            { name: 'Leave Request', icon: ClipboardList },
            { name: 'Notifications', icon: Bell }
          ].map(item => {
            const Icon = item.icon;
            const isSel = activeTab === item.name;
            const unreadCount = item.name === 'Notifications' ? notifications.filter(n => !n.is_read && !n.is_archived).length : 0;
            return (
              <button
                key={item.name}
                onClick={() => {
                  setActiveTab(item.name);
                  setSubmitSuccess(false);
                }}
                className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isSel 
                    ? 'bg-[#4F6AF7] text-white shadow-md shadow-[#4F6AF7]/25' 
                    : 'text-gray-500 hover:bg-indigo-50 hover:text-[#4F6AF7]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon size={17} />
                  {item.name}
                </div>
                {unreadCount > 0 && (
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    isSel ? 'bg-white text-[#4F6AF7]' : 'bg-[#4F6AF7] text-white'
                  }`}>
                    {unreadCount}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gray-100">
          <button 
            onClick={() => {
              setFeedbackText('');
              setFeedbackWorkMode('Office');
              setShowFeedbackModal(true);
            }} 
            className="flex items-center gap-3 px-4 py-3 w-full rounded-xl hover:bg-rose-50 text-rose-600 transition-all font-medium text-sm"
          >
            <LogOut size={16} />
            Sign Out
          </button>
        </div>

      </aside>

      {/* ── Right Content Container (max-w-7xl for bigger layout) ── */}
      <main className="flex-1 p-6 md:p-8 space-y-6 max-w-7xl mx-auto w-full">
        
        {/* Header Breadcrumbs Row */}
        <div className="flex items-center justify-between flex-wrap gap-4 border-b border-gray-200 pb-4">
          <div>
            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
              <span className="text-[#4F6AF7]">{activeTab}</span>
            </div>
            <h1 className="text-xl font-extrabold text-gray-900 tracking-tight mt-1">{activeTab} Page</h1>
          </div>
        </div>

        {/* ── TAB content: DASHBOARD (Re-styled based on the light/blue layout structure) ── */}
        {activeTab === 'Dashboard' && (
          <div className="space-y-6 animate-fadeIn">
            
            {/* Top Profile Banner containing the custom profile picture, name, and meta stats */}
            <div className="bg-white border border-gray-200/80 rounded-3xl p-6 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-4 text-center md:text-left flex-col md:flex-row">
                <label className="relative cursor-pointer group select-none shrink-0">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleBannerFileChange}
                    className="hidden"
                  />
                  {meta.profile_picture ? (
                    <img 
                      src={meta.profile_picture} 
                      alt="Profile" 
                      className="w-16 h-16 rounded-full object-cover shrink-0 border-2 border-white shadow-md transition-all group-hover:brightness-75"
                      onError={(e) => { e.currentTarget.src = ''; }}
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#4F6AF7] to-[#8094FF] text-white text-xl font-extrabold flex items-center justify-center shadow-md shadow-[#4F6AF7]/10 transition-all group-hover:brightness-90">
                      {selectedEmployee.first_name?.[0]}{selectedEmployee.last_name?.[0]}
                    </div>
                  )}
                  {/* Camera Icon Overlay on Hover */}
                  <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                </label>
                <div>
                  <h2 className="text-lg font-extrabold text-gray-900 leading-tight">{selectedEmployee.first_name} {selectedEmployee.last_name}</h2>
                  <p className="text-xs text-[#4F6AF7] font-bold mt-1">{selectedEmployee.designation || 'Specialist'}</p>
                  <p className="text-[10px] text-gray-400 mt-1.5">Story Seed Studio • Joined {selectedEmployee.joining_date ? new Date(selectedEmployee.joining_date).toLocaleDateString() : '—'}</p>
                </div>
              </div>
              <div className="flex gap-3 flex-wrap justify-center">
                <div className="bg-gray-50 border border-gray-100 rounded-2xl px-5 py-3 text-center min-w-[110px]">
                  <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider block">ID Number</span>
                  <span className="text-xs font-black text-gray-700 block mt-1">{selectedEmployee.id ? selectedEmployee.id.slice(0, 8).toUpperCase() : '—'}</span>
                </div>
                <div className="bg-gray-50 border border-gray-100 rounded-2xl px-5 py-3 text-center min-w-[110px]">
                  <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider block">Date of Birth</span>
                  <span className="text-xs font-black text-gray-700 block mt-1">{meta.date_of_birth ? new Date(meta.date_of_birth).toLocaleDateString() : '—'}</span>
                </div>
              </div>
            </div>

            {/* Grid Layout structure matches layout image but cleaned up as requested */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
              
              {/* ── Column 1 (Left): Metrics Stack ── */}
              <div className="space-y-6 flex flex-col justify-start">
                
                {/* Performance score card */}
                <div className="bg-white border border-gray-200/85 rounded-3xl p-5 shadow-sm space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold text-gray-900">Performance Status</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-full border border-emerald-100">Active</span>
                  </div>
                  <div className="flex items-center gap-4 bg-gray-50 p-3.5 rounded-2xl border border-gray-100">
                    <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center shrink-0 border border-amber-100">
                      <Award size={18} />
                    </div>
                    <div>
                      <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider leading-none">Rating Score</p>
                      <p className="text-base font-black text-gray-800 mt-1.5">{meta.performance_rating ? `★ ${meta.performance_rating} / 5` : '★ 4.5 / 5'}</p>
                    </div>
                  </div>
                  <div className="text-[11px] text-gray-400 leading-relaxed">
                    Evaluated as <strong className="text-gray-700">{meta.performance_status || 'Excellent'}</strong> performance standing for the current workspace semester.
                  </div>
                </div>

                {/* Salary Overview card */}
                <div className="bg-white border border-gray-200/85 rounded-3xl p-5 shadow-sm space-y-3">
                  <span className="text-xs font-extrabold text-gray-900 block">Monthly Payroll Summary</span>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-gray-400">Gross Salary</span>
                      <span className="font-bold text-gray-800">₹{baseSalary.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs text-rose-600">
                      <span>PF Deductions</span>
                      <span className="font-semibold">- ₹{pfContribution.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="border-t border-gray-100 pt-2 flex justify-between items-center text-xs font-bold text-[#4F6AF7]">
                      <span>Net Take-Home</span>
                      <span className="text-sm font-black">₹{netTakeHome.toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                </div>

              </div>

              {/* ── Column 2 (Middle): Bar Chart Card ONLY ── */}
              <div className="space-y-6 flex flex-col justify-start">
                
                {/* Working Hours Bar Chart (Stretches cleanly) */}
                <div className="bg-white border border-gray-200/85 rounded-3xl p-5 shadow-sm flex-1 flex flex-col justify-between min-h-[300px]">
                  <div className="pb-3 border-b border-gray-100">
                    <span className="text-xs font-extrabold text-gray-900 block">Attendance Hours (Last 7 Days)</span>
                    <span className="text-[10px] text-gray-400">Daily productivity logs</span>
                  </div>
                  <div className="h-56 w-full mt-4">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={displayChartData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} width={20} />
                        <Tooltip cursor={{ fill: '#f8fafc' }} />
                        <Bar dataKey="Hours Worked" fill="#4F6AF7" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

              </div>

              {/* ── Column 3 (Right): Contacts, Progress, & Feed ── */}
              <div className="space-y-6 flex flex-col justify-start">
                
                {/* Manager Contact details */}
                <div className="bg-white border border-gray-200/85 rounded-3xl p-5 shadow-sm space-y-4">
                  <span className="text-xs font-extrabold text-gray-900 block">Reporting Manager</span>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-sky-50 text-[#4F6AF7] flex items-center justify-center font-bold text-xs shrink-0">
                      LM
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gray-800 leading-tight">{getManagerName(selectedEmployee.reporting_manager_id)}</p>
                      <p className="text-[9px] text-gray-400 mt-0.5">Team Leader / Lead Coordinator</p>
                    </div>
                  </div>
                </div>

                {/* Leaves Entitlement progress bars */}
                <div className="bg-white border border-gray-200/85 rounded-3xl p-5 shadow-sm space-y-4">
                  <span className="text-xs font-extrabold text-gray-900 block">Leave Entitlement Breakdown</span>
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-[10px] font-semibold text-gray-600 mb-1">
                        <span>Sick Leave</span>
                        <span>{stats.leaves} / 12 Days</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                        <div className="bg-[#4F6AF7] h-full rounded-full" style={{ width: `${Math.min(100, (stats.leaves / 12) * 100)}%` }} />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-[10px] font-semibold text-gray-600 mb-1">
                        <span>Casual Leave</span>
                        <span>0 / 8 Days</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                        <div className="bg-emerald-500 h-full rounded-full" style={{ width: `0%` }} />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Recent activity timeline feed */}
                <div className="bg-white border border-gray-200/85 rounded-3xl p-5 shadow-sm space-y-4 flex-1">
                  <span className="text-xs font-extrabold text-gray-900 block">Recent Activity Log</span>
                  <div className="space-y-3 max-h-48 overflow-y-auto pr-1">
                    {attendanceLogs.slice(0, 3).map(log => (
                      <div key={log.id} className="flex gap-2 text-[10px] text-gray-500 leading-normal border-b border-gray-50 pb-2">
                        <span className="font-semibold text-gray-700 shrink-0">{new Date(log.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}:</span>
                        <span>Checked in at {log.clock_in ? new Date(log.clock_in).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' }) : '—'} as <strong className="text-gray-800">{log.status}</strong>.</span>
                      </div>
                    ))}
                    {attendanceLogs.length === 0 && (
                      <div className="text-center py-4 text-gray-400 italic text-[10px]">No activity logs found.</div>
                    )}
                  </div>
                </div>

              </div>

            </div>

          </div>
        )}

        {/* ── TAB content: ATTENDANCE ── */}
        {activeTab === 'Attendance' && (
          <div className="space-y-6 animate-fadeIn">
            {/* Monthly Stats Banner */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white border border-gray-200 p-4 rounded-2xl shadow-sm">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Attendance %</span>
                <p className="text-2xl font-extrabold text-gray-900 mt-1">{stats.pct}%</p>
              </div>
              <div className="bg-white border border-gray-200 p-4 rounded-2xl shadow-sm">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Hours Worked</span>
                <p className="text-2xl font-extrabold text-[#4F6AF7] mt-1">{stats.totalHours}h</p>
              </div>
              <div className="bg-white border border-gray-200 p-4 rounded-2xl shadow-sm">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Late Arrivals</span>
                <p className="text-2xl font-extrabold text-amber-600 mt-1">{stats.late}</p>
              </div>
              <div className="bg-white border border-gray-200 p-4 rounded-2xl shadow-sm">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Leave Days</span>
                <p className="text-2xl font-extrabold text-sky-600 mt-1">{stats.leaves}d</p>
              </div>
            </div>

            {/* Attendance logs list */}
            <div className="bg-white border border-gray-200 rounded-3xl shadow-sm p-6 space-y-4">
              <h3 className="text-sm font-bold text-gray-900">Attendance Log History</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-gray-100 text-[10px] font-bold uppercase tracking-wider text-gray-400 bg-gray-50/50">
                      <th className="py-3 px-4">Date</th>
                      <th className="py-3 px-4">Check In</th>
                      <th className="py-3 px-4">Check Out</th>
                      <th className="py-3 px-4">Working Hours</th>
                      <th className="py-3 px-4">Overtime</th>
                      <th className="py-3 px-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100/50">
                    {attendanceLogs.map(log => {
                      const hrs = getWorkingHours(log.clock_in, log.clock_out);
                      const ot = getOvertimeHours(hrs);
                      return (
                        <tr key={log.id} className="hover:bg-gray-50/50 transition-all">
                          <td className="py-3 px-4 font-semibold text-gray-905">{new Date(log.date).toLocaleDateString()}</td>
                          <td className="py-3 px-4 font-mono">{log.clock_in ? new Date(log.clock_in).toLocaleTimeString() : '—'}</td>
                          <td className="py-3 px-4 font-mono">{log.clock_out ? new Date(log.clock_out).toLocaleTimeString() : '—'}</td>
                          <td className="py-3 px-4 font-bold">{hrs > 0 ? `${hrs}h` : '—'}</td>
                          <td className="py-3 px-4 text-orange-600 font-bold">{ot > 0 ? `+${ot}h` : '—'}</td>
                          <td className="py-3 px-4">
                            <span className={`text-[9px] font-bold px-2 py-0.5 border rounded-full uppercase ${
                              log.status === 'Present' ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                              : log.status === 'Late' ? 'bg-amber-50 text-amber-700 border-amber-100'
                              : 'bg-red-50 text-red-700 border-red-100'
                            }`}>{log.status}</span>
                          </td>
                        </tr>
                      );
                    })}
                    {attendanceLogs.length === 0 && (
                      <tr>
                        <td colSpan="6" className="py-8 text-center text-gray-400 italic">No attendance logs logged yet in the Supabase backend.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ── TAB content: SALARY ── */}
        {activeTab === 'Salary' && (
          <div className="space-y-6 animate-fadeIn">
            {/* Pay grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white border border-gray-200 rounded-3xl shadow-sm p-6 flex flex-col gap-2">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Gross Basic Salary</span>
                <span className="text-3xl font-extrabold text-gray-900">₹{baseSalary.toLocaleString('en-IN')}</span>
              </div>
              <div className="bg-white border border-gray-200 rounded-3xl shadow-sm p-6 flex flex-col gap-2">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">PF Deduction (12%)</span>
                <span className="text-3xl font-extrabold text-rose-650">₹{pfContribution.toLocaleString('en-IN')}</span>
              </div>
              <div className="bg-white border border-gray-200 rounded-3xl shadow-sm p-6 flex flex-col gap-2 bg-indigo-50/10">
                <span className="text-[10px] font-bold text-[#4F6AF7] uppercase tracking-wider">Net Take-Home Salary</span>
                <span className="text-3xl font-extrabold text-[#4F6AF7]">₹{netTakeHome.toLocaleString('en-IN')}</span>
              </div>
            </div>

            {/* Pay slips history */}
            <div className="bg-white border border-gray-200 rounded-3xl shadow-sm p-6 space-y-4">
              <h3 className="text-sm font-bold text-gray-900 font-inter">Recent Pay slips</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-gray-100 text-[10px] font-bold uppercase tracking-wider text-gray-400 bg-gray-50/50">
                      <th className="py-3 px-4">Month</th>
                      <th className="py-3 px-4">Basic Pay</th>
                      <th className="py-3 px-4">PF Deductions</th>
                      <th className="py-3 px-4">Disbursed Net Account</th>
                      <th className="py-3 px-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100/50">
                    {[
                      { m: 'May 2026', status: 'Received' },
                      { m: 'April 2026', status: 'Received' },
                      { m: 'March 2026', status: 'Received' }
                    ].map((row, idx) => {
                      return (
                        <tr key={idx} className="hover:bg-gray-50/50 transition-all">
                          <td className="py-3 px-4 font-semibold text-gray-900">{row.m}</td>
                          <td className="py-3 px-4">₹{baseSalary.toLocaleString('en-IN')}</td>
                          <td className="py-3 px-4 text-rose-650 font-semibold">₹{pfContribution.toLocaleString('en-IN')}</td>
                          <td className="py-3 px-4 font-bold text-[#4F6AF7]">₹{netTakeHome.toLocaleString('en-IN')}</td>
                          <td className="py-3 px-4">
                            <span className="text-[9px] font-bold px-2 py-0.5 border rounded-full uppercase bg-emerald-50 border-emerald-100 text-emerald-700">{row.status}</span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ── TAB content: LEAVE REQUEST ── */}
        {activeTab === 'Leave Request' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start animate-fadeIn">
            <div className="bg-white border border-gray-200 p-6 lg:col-span-1 space-y-4 rounded-3xl shadow-sm">
              <h3 className="text-sm font-bold text-gray-900">New Leave Request</h3>
              {submitSuccess && (
                <div className="p-3 bg-emerald-50 text-emerald-700 border border-emerald-100 text-xs rounded-xl font-medium">
                  Request successfully sent to Supabase.
                </div>
              )}
              <form onSubmit={handleLeaveSubmit} className="space-y-4 text-xs font-semibold text-gray-700">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase">Leave Type</label>
                  <select
                    value={leaveForm.leave_type}
                    onChange={e => setLeaveForm(prev => ({ ...prev, leave_type: e.target.value }))}
                    className="h-10 px-3 border border-gray-200 rounded-xl bg-white"
                  >
                    <option value="Sick Leave">Sick Leave</option>
                    <option value="Casual Leave">Casual Leave</option>
                    <option value="Maternity Leave">Maternity Leave</option>
                    <option value="Paternity Leave">Paternity Leave</option>
                    <option value="Unpaid Leave">Unpaid Leave</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase">Start Date</label>
                    <input
                      type="date"
                      value={leaveForm.from_date}
                      onChange={e => setLeaveForm(prev => ({ ...prev, from_date: e.target.value }))}
                      required
                      className="h-10 px-3 border border-gray-200 rounded-xl"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase">End Date</label>
                    <input
                      type="date"
                      value={leaveForm.to_date}
                      onChange={e => setLeaveForm(prev => ({ ...prev, to_date: e.target.value }))}
                      required
                      className="h-10 px-3 border border-gray-200 rounded-xl"
                    />
                  </div>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase">Total Days</label>
                  <input
                    type="number"
                    min="1"
                    value={leaveForm.total_days}
                    onChange={e => setLeaveForm(prev => ({ ...prev, total_days: e.target.value }))}
                    required
                    className="h-10 px-3 border border-gray-200 rounded-xl"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase">Reason Description</label>
                  <textarea
                    value={leaveForm.reason}
                    onChange={e => setLeaveForm(prev => ({ ...prev, reason: e.target.value }))}
                    rows="3"
                    className="p-3 border border-gray-200 rounded-xl font-sans"
                  />
                </div>
                <button type="submit" className="w-full h-10 bg-[#4F6AF7] hover:bg-[#3d58e5] text-white font-bold text-xs rounded-xl shadow-md transition-all">
                  Send Leave Letter
                </button>
              </form>
            </div>

            <div className="bg-white border border-gray-200 p-6 lg:col-span-2 space-y-4 rounded-3xl shadow-sm">
              <h3 className="text-sm font-bold text-gray-900">Leave Applications History</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-gray-100 text-[10px] font-bold uppercase tracking-wider text-gray-400 bg-gray-50/50">
                      <th className="py-3 px-4">Leave Type</th>
                      <th className="py-3 px-4">Dates</th>
                      <th className="py-3 px-4">Days</th>
                      <th className="py-3 px-4">Reason</th>
                      <th className="py-3 px-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100/50">
                    {leaveRequests.map(req => {
                      const displayStatus = req.status?.toUpperCase() === 'APPROVED' ? 'Approved' : req.status?.toUpperCase() === 'PENDING' ? 'Pending' : 'Rejected';
                      return (
                        <tr key={req.id}>
                          <td className="py-3 px-4 font-semibold text-gray-900">{req.leave_type}</td>
                          <td className="py-3 px-4 text-gray-500">{new Date(req.from_date).toLocaleDateString()} to {new Date(req.to_date).toLocaleDateString()}</td>
                          <td className="py-3 px-4 font-bold">{req.total_days}d</td>
                          <td className="py-3 px-4 max-w-[150px] truncate">{req.reason || '—'}</td>
                          <td className="py-3 px-4">
                            <span className={`text-[9px] font-bold px-2 py-0.5 border rounded-full uppercase ${
                              req.status?.toUpperCase() === 'APPROVED' ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                              : req.status?.toUpperCase() === 'PENDING' ? 'bg-amber-50 text-amber-700 border-amber-100'
                              : 'bg-red-50 text-red-700 border-red-100'
                            }`}>{displayStatus}</span>
                          </td>
                        </tr>
                      );
                    })}
                    {leaveRequests.length === 0 && (
                      <tr>
                        <td colSpan="5" className="py-8 text-center text-gray-400 italic">No leave applications submitted yet in the Supabase backend.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ── TAB content: NOTIFICATIONS ── */}
        {activeTab === 'Notifications' && (
          <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm space-y-6 animate-fadeIn max-w-4xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-gray-100 pb-4 gap-4">
              <div>
                <h3 className="text-base font-extrabold text-gray-900">Notifications & Alerts</h3>
                <p className="text-xs text-gray-500 mt-1">Receive instant notifications for leave approvals, salary credits, announcements, and task updates.</p>
              </div>
              {notifications.some(n => !n.is_read) && (
                <button 
                  onClick={handleMarkAllRead}
                  className="px-3 py-1.5 bg-[#4F6AF7]/10 text-[#4F6AF7] hover:bg-[#4F6AF7]/20 text-xs font-bold rounded-xl transition-all self-start sm:self-auto shrink-0"
                >
                  Mark all as read
                </button>
              )}
            </div>

            {/* Search and Filters Bar */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input 
                  type="text"
                  placeholder="Search notifications..."
                  value={notifSearch}
                  onChange={e => setNotifSearch(e.target.value)}
                  className="w-full pl-9 pr-4 h-9 text-xs bg-gray-50/70 border border-gray-200 rounded-xl outline-none focus:border-[#4F6AF7]"
                />
              </div>
              <div className="flex items-center gap-1 bg-gray-100/70 p-1 rounded-xl shrink-0">
                {[
                  { id: 'all', label: 'All' },
                  { id: 'unread', label: 'Unread' },
                  { id: 'read', label: 'Read' },
                  { id: 'archived', label: 'Archived' }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setNotifFilter(tab.id);
                      setExpandedNotifId(null);
                    }}
                    className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                      notifFilter === tab.id 
                        ? 'bg-white text-gray-900 shadow-sm' 
                        : 'text-gray-500 hover:text-gray-900'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* List */}
            <div className="space-y-3">
              {(() => {
                const list = notifications.filter(notif => {
                  const query = notifSearch.toLowerCase();
                  const matchesSearch = notif.title?.toLowerCase().includes(query) || notif.body?.toLowerCase().includes(query);
                  if (!matchesSearch) return false;

                  if (notifFilter === 'archived') {
                    return notif.is_archived === true;
                  }
                  if (notif.is_archived) return false;

                  if (notifFilter === 'unread') return !notif.is_read;
                  if (notifFilter === 'read') return notif.is_read;
                  return true;
                });

                return (
                  <>
                    {list.map(notif => {
                      const isExpanded = expandedNotifId === notif.id;
                      const getIconClass = () => {
                        switch (notif.type) {
                          case 'leave_approval': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
                          case 'salary_credit': return 'bg-indigo-50 text-indigo-600 border-indigo-100';
                          case 'announcement': return 'bg-amber-50 text-amber-600 border-amber-100';
                          default: return 'bg-blue-50 text-blue-600 border-blue-100';
                        }
                      };

                      const getPriorityClass = (priority) => {
                        switch (priority?.toLowerCase()) {
                          case 'high': return 'bg-red-50 text-red-700 border-red-100';
                          case 'medium': return 'bg-amber-50 text-amber-700 border-amber-100';
                          default: return 'bg-gray-50 text-gray-600 border-gray-150';
                        }
                      };

                      return (
                        <div 
                          key={notif.id} 
                          onClick={async () => {
                            if (!notif.is_read) {
                              await handleMarkIndividualRead(notif.id);
                            }
                            setExpandedNotifId(isExpanded ? null : notif.id);
                          }}
                          className={`group flex flex-col p-4 rounded-2xl border transition-all cursor-pointer ${
                            notif.is_read ? 'bg-gray-50/55 border-gray-100/70 hover:bg-gray-50' : 'bg-white border-blue-100/75 shadow-sm hover:border-[#4F6AF7]/50'
                          }`}
                        >
                          <div className="flex items-start gap-4">
                            <div className={`w-8 h-8 rounded-xl border flex items-center justify-center shrink-0 ${getIconClass()}`}>
                              <Bell size={14} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-2 flex-wrap">
                                <div className="flex items-center gap-2">
                                  <p className={`text-xs font-bold text-gray-900 ${notif.is_read ? 'opacity-75 font-semibold' : ''}`}>
                                    {notif.title}
                                  </p>
                                  {notif.priority && (
                                    <span className={`text-[8px] font-bold px-1.5 py-0.5 border rounded-md uppercase tracking-wider ${getPriorityClass(notif.priority)}`}>
                                      {notif.priority}
                                    </span>
                                  )}
                                </div>
                                <span className="text-[9px] text-gray-400 font-medium">
                                  {new Date(notif.created_at).toLocaleDateString()}
                                </span>
                              </div>
                              <p className={`text-xs text-gray-500 mt-1 leading-relaxed ${isExpanded ? '' : 'truncate'}`}>
                                {notif.body}
                              </p>
                            </div>
                            
                            {/* Actions block */}
                            <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
                              <button 
                                onClick={() => handleArchiveIndividual(notif.id, notif.is_archived)}
                                className="p-1.5 text-gray-400 hover:text-indigo-600 rounded-lg hover:bg-indigo-50 transition-colors"
                                title={notif.is_archived ? "Unarchive" : "Archive"}
                              >
                                <Archive size={14} />
                              </button>
                              <button 
                                onClick={() => handleDeleteIndividual(notif.id)}
                                className="p-1.5 text-gray-400 hover:text-red-650 rounded-lg hover:bg-red-50 transition-colors"
                                title="Delete"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </div>

                          {/* Expanded content */}
                          {isExpanded && (
                            <div className="mt-4 pt-4 border-t border-gray-100 text-xs space-y-3 animate-fadeIn">
                              <div className="text-gray-700 leading-relaxed whitespace-pre-wrap font-sans">
                                {notif.body}
                              </div>
                              {notif.attachment_url && (
                                <div className="flex items-center gap-2 bg-indigo-50/50 border border-indigo-100 p-2.5 rounded-xl self-start w-fit">
                                  <Paperclip size={13} className="text-[#4F6AF7]" />
                                  <span className="font-semibold text-gray-700">{notif.attachment_name || 'Attachment File'}</span>
                                  <a 
                                    href={notif.attachment_url} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="ml-3 text-[10px] bg-[#4F6AF7] hover:bg-[#3d58e5] text-white px-2 py-1 rounded-lg font-bold transition-colors"
                                  >
                                    View / Download
                                  </a>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}

                    {list.length === 0 && (
                      <div className="text-center py-12 text-gray-400 italic text-xs">
                        No notifications found matching the criteria.
                      </div>
                    )}
                  </>
                );
              })()}
            </div>
          </div>
        )}
      </main>

      {/* ── Daily Feedback & Sign Out Modal ── */}
      {showFeedbackModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-2xl max-w-md w-full space-y-6">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 text-[#4F6AF7] flex items-center justify-center mb-4">
                <Bell size={20} />
              </div>
              <h3 className="text-base font-extrabold text-gray-900">Daily Work Feedback & Sign Out</h3>
              <p className="text-xs text-gray-500 mt-1.5 leading-relaxed">
                Before you leave for today, please fill out your daily accomplishments and select your work mode. Submitting will record your daily feed and automatically sign you out.
              </p>
            </div>

            <form onSubmit={handleFeedbackSubmit} className="space-y-4 text-xs font-semibold text-gray-700">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Today's Accomplishments & Feedback</label>
                <textarea
                  value={feedbackText}
                  onChange={e => setFeedbackText(e.target.value)}
                  placeholder="What did you work on today? Any issues faced?"
                  rows="4"
                  required
                  className="p-3 border border-gray-200 rounded-xl font-sans outline-none focus:border-[#4F6AF7]"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Work Mode Status</label>
                <select
                  value={feedbackWorkMode}
                  onChange={e => setFeedbackWorkMode(e.target.value)}
                  className="h-10 px-3 border border-gray-200 rounded-xl bg-white outline-none focus:border-[#4F6AF7]"
                >
                  <option value="Office">Office (In-Person)</option>
                  <option value="Remote">Remote (WFH)</option>
                  <option value="Site Visit">Site Visit / Meeting</option>
                  <option value="Half Day">Half Day / Leave</option>
                </select>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowFeedbackModal(false)}
                  className="flex-1 h-10 border border-gray-200 text-gray-600 font-bold rounded-xl hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingFeedback}
                  className="flex-1 h-10 bg-[#4F6AF7] hover:bg-[#3d58e5] text-white font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
                >
                  {submittingFeedback ? 'Submitting...' : 'Submit & Sign Out'}
                  <ArrowRight size={14} />
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
