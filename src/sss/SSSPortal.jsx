import React, { useState, useEffect, useMemo } from 'react';
import { 
  Users, UserPlus, Search, Filter, Mail, Phone, Calendar, 
  MapPin, DollarSign, Briefcase, Plus, CheckCircle, XCircle, 
  Download, FileJson, Edit, Trash2, X, RefreshCw, Info, AlertTriangle,
  Clock, CreditCard, Landmark, FileText, ChevronRight, LayoutDashboard,
  ClipboardList, Settings as SettingsIcon, BarChart2, Award, Award as LeadIcon,
  ChevronLeft, TrendingUp, UserCheck, CalendarDays, Activity, Bell,
  ArrowRight, Paperclip, CheckSquare
} from 'lucide-react';
import { 
  BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';
import { supabase as supabaseAnon, supabaseAdmin } from '../services/supabase';

const supabase = supabaseAdmin || supabaseAnon;

const TYPE_STYLES = {
  Active: 'bg-indigo-50 text-indigo-700 border-indigo-100',
  Inactive: 'bg-gray-50 text-gray-400 border-gray-200'
};

export default function SSSPortal() {
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [attendanceLogs, setAttendanceLogs] = useState([]);
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [dailyReports, setDailyReports] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [newNotifTitle, setNewNotifTitle] = useState('');
  const [newNotifBody, setNewNotifBody] = useState('');
  const [newNotifRecipientType, setNewNotifRecipientType] = useState('all');
  const [newNotifTargetDept, setNewNotifTargetDept] = useState('');
  const [newNotifTargetEmp, setNewNotifTargetEmp] = useState('');
  const [newNotifTargetTeam, setNewNotifTargetTeam] = useState('');
  const [newNotifPriority, setNewNotifPriority] = useState('Medium');
  const [newNotifAttachmentUrl, setNewNotifAttachmentUrl] = useState('');
  const [newNotifAttachmentName, setNewNotifAttachmentName] = useState('');
  const [sendingNotif, setSendingNotif] = useState(false);
  const [selectedEmpCard, setSelectedEmpCard] = useState(null);

  // Task Monitor states
  const [tasks, setTasks] = useState([]);
  const [taskAssignments, setTaskAssignments] = useState([]);
  const [taskFeedback, setTaskFeedback] = useState([]);
  const [taskReviews, setTaskReviews] = useState([]);
  const [taskProgress, setTaskProgress] = useState([]);
  
  // Task Monitor filter states
  const [taskFilterStatus, setTaskFilterStatus] = useState('all');
  const [taskFilterEmployee, setTaskFilterEmployee] = useState('all');
  const [taskFilterDepartment, setTaskFilterDepartment] = useState('all');
  const [taskFilterSearch, setTaskFilterSearch] = useState('');

  // Employee Performance Card (HR Task Monitor)
  const [performanceEmpSearch, setPerformanceEmpSearch] = useState('');
  const [selectedPerformanceEmp, setSelectedPerformanceEmp] = useState(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  
  // Attendance & Leaves Filters
  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendanceSearch, setAttendanceSearch] = useState('');
  // Attendance sub-tabs: 'Daily' | 'Monthly Summary' | 'Calendar'
  const [attendanceSubTab, setAttendanceSubTab] = useState('Daily');
  const [attendanceMonth, setAttendanceMonth] = useState(new Date().toISOString().slice(0, 7));
  const [selectedEmpForAttendance, setSelectedEmpForAttendance] = useState('all');
  // Leave filters
  const [leaveStatusFilter, setLeaveStatusFilter] = useState('all');
  const [leaveSearchQuery, setLeaveSearchQuery] = useState('');
  
  // Modals / Form States
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddAttendanceModal, setShowAddAttendanceModal] = useState(false);
  const [showAddLeaveModal, setShowAddLeaveModal] = useState(false);
  const [currentEmployee, setCurrentEmployee] = useState(null);

  // Delete confirmation modal: { title, message, onConfirm }
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  // Custom states for Priya dharshini profile, Salary Console, TL details, and Leave Letters
  const [showPriyaModal, setShowPriyaModal] = useState(false);
  const [salaryStatusMap, setSalaryStatusMap] = useState({});
  const [expandedTlId, setExpandedTlId] = useState(null);
  const [selectedLeaveLetter, setSelectedLeaveLetter] = useState(null);

  // Role preset state for add modal (standard employee, manager, or team lead)
  const [rolePreset, setRolePreset] = useState('employee');

  // Attendance Form
  const [attendanceFormData, setAttendanceFormData] = useState({
    employee_id: '',
    date: new Date().toISOString().split('T')[0],
    clock_in: '09:00',
    clock_out: '18:00',
    status: 'Present'
  });

  // Leave Form
  const [leaveFormData, setLeaveFormData] = useState({
    employee_id: '',
    leave_type: 'Sick Leave',
    from_date: new Date().toISOString().split('T')[0],
    to_date: new Date().toISOString().split('T')[0],
    total_days: 1,
    reason: '',
    status: 'Pending'
  });

  // Employee Form Fields
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    phone: '',
    department_id: '',
    designation: '',
    joining_date: '',
    basic_salary: '',
    bank_account: '',
    bank_ifsc: '',
    pan_number: '',
    pf_number: '', // Serialized metadata for custom fields (email, performance rating, project, etc.)
    is_active: true
  });

  // Custom Manager/TL fields (which serialize into pf_number)
  const [customFields, setCustomFields] = useState({
    email: '',
    performance_status: '',
    project_name: '',
    performance_rating: ''
  });

  const notificationCampaigns = useMemo(() => {
    const map = {};
    // Filter out internal task status signals — only show HR-composed broadcasts
    const broadcastOnly = notifications.filter(n => !['task_status_report', 'task_update'].includes(n.type));
    broadcastOnly.forEach(n => {
      const timeKey = n.created_at ? new Date(n.created_at).toISOString().slice(0, 16) : 'unknown';
      const key = `${n.title}_${n.body}_${timeKey}`;
      if (!map[key]) {
        map[key] = {
          id: n.id,
          title: n.title,
          body: n.body,
          priority: n.priority || 'Medium',
          created_at: n.created_at,
          attachment_url: n.attachment_url,
          attachment_name: n.attachment_name,
          scheduled_for: n.scheduled_for,
          total: 0,
          read: 0,
          unread: 0
        };
      }
      map[key].total++;
      if (n.is_read) {
        map[key].read++;
      } else {
        map[key].unread++;
      }
    });
    return Object.values(map).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  }, [notifications]);

  // Helper: Get parsed metadata from pf_number
  const getMetadata = (emp) => {
    if (!emp || !emp.pf_number) return {};
    try {
      if (emp.pf_number.trim().startsWith('{')) {
        return JSON.parse(emp.pf_number);
      }
    } catch (e) {
      // Not JSON
    }
    return { pf: emp.pf_number };
  };

  // Fetch Data from Supabase
  const fetchData = async (isRef = false) => {
    if (isRef) setRefreshing(true);
    else setLoading(true);
    setError(null);

    try {
      // 1. Fetch Story Seed Company details
      const { data: companiesData, error: companyError } = await supabase
        .from('companies')
        .select('*')
        .ilike('name', '%story%seed%')
        .maybeSingle();

      if (companyError) throw companyError;

      let sssCompany = companiesData;

      // Auto-create company record if missing
      if (!sssCompany) {
        console.log('Story Seed company record not found. Auto-creating company record...');
        const { data: newCompany, error: createError } = await supabase
          .from('companies')
          .insert([{
            name: 'Story Seed Studio ',
            email: 'admin@storyseed.com',
            status: 'Active',
            payment_status: 'Paid',
            employee_count: 0
          }])
          .select()
          .single();
        
        if (createError) throw createError;
        sssCompany = newCompany;
      }

      setCompany(sssCompany);

      // 2. Fetch Departments for the company
      let { data: deptsData, error: deptsError } = await supabase
        .from('departments')
        .select('*')
        .eq('company_id', sssCompany.id);

      if (deptsError) throw deptsError;

      // Auto-create default departments if list is empty
      if (!deptsData || deptsData.length === 0) {
        console.log('Departments empty. Seeding default departments...');
        const defaultDepts = ['Creative', 'Development', 'Marketing', 'HR', 'Editorial'];
        const insertRows = defaultDepts.map(name => ({ company_id: sssCompany.id, name }));
        const { data: seededDepts, error: seedError } = await supabase
          .from('departments')
          .insert(insertRows)
          .select();

        if (seedError) throw seedError;
        deptsData = seededDepts;
      }

      setDepartments(deptsData || []);

      // 3. Fetch Employees for Story Seed
      const { data: employeesData, error: employeesError } = await supabase
        .from('employees')
        .select('*')
        .eq('company_id', sssCompany.id)
        .order('created_at', { ascending: false });

      if (employeesError) throw employeesError;
      setEmployees(employeesData || []);

      // 4. Fetch Attendance Logs
      const { data: attendanceData, error: attendanceError } = await supabase
        .from('attendance')
        .select('*')
        .eq('company_id', sssCompany.id)
        .order('date', { ascending: false });

      if (attendanceError) throw attendanceError;
      setAttendanceLogs(attendanceData || []);

      // 5. Fetch Leave Requests
      const { data: leavesData, error: leavesError } = await supabase
        .from('leave_requests')
        .select('*')
        .eq('company_id', sssCompany.id)
        .order('created_at', { ascending: false });

      if (leavesError) throw leavesError;
      setLeaveRequests(leavesData || []);

      // 6. Fetch Daily Reports
      const { data: reportsData, error: reportsError } = await supabase
        .from('daily_reports')
        .select('*')
        .eq('company_id', sssCompany.id)
        .order('submitted_at', { ascending: false });

      if (reportsError) throw reportsError;
      setDailyReports(reportsData || []);

      // 7. Fetch Notifications
      const { data: notifData, error: notifError } = await supabase
        .from('notifications')
        .select('*')
        .eq('company_id', sssCompany.id)
        .order('created_at', { ascending: false });

      if (notifError) throw notifError;
      setNotifications(notifData || []);

      // 8. Fetch Tasks tables for Task Monitor
      const [taskRes, assignRes, fbRes, revRes, progressRes] = await Promise.all([
        supabase.from('sss_tasks').select('*').eq('company_id', sssCompany.id).order('created_at', { ascending: false }),
        supabase.from('sss_task_assignments').select('*'),
        supabase.from('sss_task_feedback').select('*'),
        supabase.from('sss_task_reviews').select('*'),
        supabase.from('sss_task_progress').select('*').order('created_at', { ascending: false }),
      ]);
      setTasks(taskRes.data || []);
      setTaskAssignments(assignRes.data || []);
      setTaskFeedback(fbRes.data || []);
      setTaskReviews(revRes.data || []);
      setTaskProgress(progressRes.data || []);

    } catch (e) {
      console.error('Fetch error:', e);
      setError(e.message || 'Failed to connect and fetch data from Supabase backend.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleAdminDismissNotification = async (id) => {
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

  const handleCreateNotification = async (e) => {
    e.preventDefault();
    if (!newNotifTitle.trim() || !newNotifBody.trim()) return;
    setSendingNotif(true);
    try {
      let targetEmployees = [];
      if (newNotifRecipientType === 'all') {
        targetEmployees = [...employees];
      } else if (newNotifRecipientType === 'department') {
        targetEmployees = employees.filter(emp => emp.department_id === newNotifTargetDept);
      } else if (newNotifRecipientType === 'team') {
        targetEmployees = employees.filter(emp => emp.reporting_manager_id === newNotifTargetTeam);
      } else if (newNotifRecipientType === 'employee') {
        const emp = employees.find(emp => emp.id === newNotifTargetEmp);
        if (emp) targetEmployees = [emp];
      }

      if (targetEmployees.length === 0) {
        alert('No recipient employees found for the selected scope.');
        setSendingNotif(false);
        return;
      }

      // Build rows using only the columns that exist in the DB schema
      const buildRow = (userId) => ({
        company_id: company.id,
        user_id: userId,
        type: 'announcement',
        title: newNotifTitle.trim(),
        body: newNotifBody.trim(),
        is_read: false,
        created_at: new Date().toISOString()
      });

      let rows = [];
      if (newNotifRecipientType === 'all') {
        // Broadcast: single row with user_id = null, visible to all employees
        rows = [buildRow(null)];
      } else {
        const activeRecipients = targetEmployees.filter(emp => emp.user_id);
        if (activeRecipients.length === 0) {
          // Fallback: insert as broadcast if no auth user_id is linked
          rows = [buildRow(null)];
        } else {
          rows = activeRecipients.map(emp => buildRow(emp.user_id));
        }
      }

      const { error } = await supabase
        .from('notifications')
        .insert(rows);

      if (error) throw error;

      setNewNotifTitle('');
      setNewNotifBody('');
      setNewNotifTargetTeam('');
      setNewNotifAttachmentUrl('');
      setNewNotifAttachmentName('');
      alert('Notification successfully created & synced!');
      fetchData();
    } catch (err) {
      console.error(err);
      alert('Error creating notification: ' + err.message);
    } finally {
      setSendingNotif(false);
    }
  };

  useEffect(() => {
    fetchData();

    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'leave_requests' },
        () => {
          fetchData();
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'attendance' },
        () => {
          fetchData();
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'daily_reports' },
        () => {
          fetchData();
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'notifications' },
        () => {
          fetchData();
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'sss_tasks' },
        () => {
          fetchData();
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'sss_task_assignments' },
        () => {
          fetchData();
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'sss_task_feedback' },
        () => {
          fetchData();
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'sss_task_reviews' },
        () => {
          fetchData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleOpenAddModal = (preset = 'employee') => {
    setRolePreset(preset);
    setCustomFields({
      email: '',
      performance_status: '',
      project_name: '',
      performance_rating: ''
    });
    setFormData({
      first_name: '',
      last_name: '',
      phone: '',
      department_id: departments[0]?.id || '',
      designation: preset === 'manager' ? 'Manager' : preset === 'tl' ? 'Team Lead' : '',
      joining_date: new Date().toISOString().split('T')[0],
      basic_salary: '',
      bank_account: '',
      bank_ifsc: '',
      pan_number: '',
      pf_number: '',
      is_active: true
    });
    setShowAddModal(true);
  };

  const handleOpenEditModal = (emp) => {
    setCurrentEmployee(emp);
    const meta = getMetadata(emp);
    setRolePreset(
      (emp.designation || '').toLowerCase().includes('manager')
        ? 'manager'
        : (emp.designation || '').toLowerCase().includes('lead') || (emp.designation || '').toLowerCase().includes('tl')
        ? 'tl'
        : 'employee'
    );
    setCustomFields({
      email: meta.email || '',
      performance_status: meta.performance_status || '',
      project_name: meta.project_name || '',
      performance_rating: meta.performance_rating || ''
    });
    setFormData({
      first_name: emp.first_name || '',
      last_name: emp.last_name || '',
      phone: emp.phone || '',
      department_id: emp.department_id || departments[0]?.id || '',
      designation: emp.designation || '',
      joining_date: emp.joining_date || '',
      basic_salary: emp.basic_salary || '',
      bank_account: emp.bank_account || '',
      bank_ifsc: emp.bank_ifsc || '',
      pan_number: emp.pan_number || '',
      pf_number: emp.pf_number || '',
      is_active: emp.is_active ?? true
    });
    setShowEditModal(true);
  };

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleCustomFieldChange = (e) => {
    const { name, value } = e.target;
    setCustomFields(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Add Employee / Manager / Team Lead
  const handleAddEmployee = async (e) => {
    e.preventDefault();
    setError(null);

    // Serialize custom fields if role is manager or TL
    let finalPf = formData.pf_number;
    if (rolePreset === 'manager' || rolePreset === 'tl') {
      finalPf = JSON.stringify({
        email: customFields.email,
        performance_status: customFields.performance_status,
        project_name: customFields.project_name,
        performance_rating: customFields.performance_rating
      });
    }

    const payload = {
      company_id: company.id,
      first_name: formData.first_name,
      last_name: formData.last_name,
      phone: formData.phone || null,
      department_id: formData.department_id || null,
      designation: formData.designation || null,
      joining_date: formData.joining_date || null,
      basic_salary: formData.basic_salary ? Number(formData.basic_salary) : null,
      bank_account: formData.bank_account || null,
      bank_ifsc: formData.bank_ifsc || null,
      pan_number: formData.pan_number || null,
      pf_number: finalPf || null,
      is_active: formData.is_active
    };

    try {
      const { error: insertError } = await supabase
        .from('employees')
        .insert([payload]);

      if (insertError) throw insertError;
      
      fetchData();
      setShowAddModal(false);
    } catch (err) {
      setError(err.message || 'Failed to save employee to Supabase.');
    }
  };

  // Edit Employee
  const handleEditEmployee = async (e) => {
    e.preventDefault();
    setError(null);

    let finalPf = formData.pf_number;
    if (rolePreset === 'manager' || rolePreset === 'tl') {
      finalPf = JSON.stringify({
        email: customFields.email,
        performance_status: customFields.performance_status,
        project_name: customFields.project_name,
        performance_rating: customFields.performance_rating
      });
    }

    const payload = {
      first_name: formData.first_name,
      last_name: formData.last_name,
      phone: formData.phone || null,
      department_id: formData.department_id || null,
      designation: formData.designation || null,
      joining_date: formData.joining_date || null,
      basic_salary: formData.basic_salary ? Number(formData.basic_salary) : null,
      bank_account: formData.bank_account || null,
      bank_ifsc: formData.bank_ifsc || null,
      pan_number: formData.pan_number || null,
      pf_number: finalPf || null,
      is_active: formData.is_active
    };

    try {
      const { error: updateError } = await supabase
        .from('employees')
        .update(payload)
        .eq('id', currentEmployee.id);

      if (updateError) throw updateError;
      
      fetchData();
      setShowEditModal(false);
    } catch (err) {
      setError(err.message || 'Failed to update employee details in Supabase.');
    }
  };

  // Delete Employee / Manager / Team Lead
  // FULL cascade delete in correct FK order (found via live schema inspection):
  //   attendance → leave_requests → leave_balances → payroll → documents → employees → users → auth.users
  const handleDeleteEmployee = async (id, name) => {
    setDeleteConfirm({
      title: 'Delete from Supabase',
      message: `Permanently delete "${name}" and ALL linked records from the Supabase database? This cannot be undone.`,
      onConfirm: async () => {
        setDeleteConfirm(null);
        setError(null);

        const adminClient = supabaseAdmin || supabase;

        try {
          // Step 0: Fetch user_id before deleting
          const { data: empData } = await adminClient
            .from('employees').select('user_id').eq('id', id).maybeSingle();
          const linkedUserId = empData?.user_id || null;
          console.log(`[SSS Delete] Cascade deleting: ${name} (${id})`);

          // Step 1: attendance
          const { error: e1 } = await adminClient.from('attendance').delete().eq('employee_id', id);
          if (e1) throw new Error('attendance: ' + e1.message);
          console.log('[SSS Delete] ✓ attendance');

          // Step 2: leave_requests
          const { error: e2 } = await adminClient.from('leave_requests').delete().eq('employee_id', id);
          if (e2) throw new Error('leave_requests: ' + e2.message);
          console.log('[SSS Delete] ✓ leave_requests');

          // Step 3: leave_balances (FK found in schema)
          const { error: e3 } = await adminClient.from('leave_balances').delete().eq('employee_id', id);
          if (e3) console.warn('[SSS Delete] leave_balances (non-fatal):', e3.message);
          else console.log('[SSS Delete] ✓ leave_balances');

          // Step 4: payroll
          const { error: e4 } = await adminClient.from('payroll').delete().eq('employee_id', id);
          if (e4) console.warn('[SSS Delete] payroll (non-fatal):', e4.message);
          else console.log('[SSS Delete] ✓ payroll');

          // Step 5: documents
          const { error: e5 } = await adminClient.from('documents').delete().eq('employee_id', id);
          if (e5) console.warn('[SSS Delete] documents (non-fatal):', e5.message);
          else console.log('[SSS Delete] ✓ documents');

          // Step 6: DELETE the employee row itself
          const { error: e6 } = await adminClient.from('employees').delete().eq('id', id);
          if (e6) throw new Error('employees: ' + e6.message);
          console.log('[SSS Delete] ✓ employee row deleted');

          // Step 7: Delete from users table (if linked)
          if (linkedUserId) {
            const { error: e7 } = await adminClient.from('users').delete().eq('id', linkedUserId);
            if (e7) console.warn('[SSS Delete] users table (non-fatal):', e7.message);
            else console.log('[SSS Delete] ✓ users row deleted');

            // Step 8: Delete Supabase auth account
            if (supabaseAdmin) {
              const { error: e8 } = await supabaseAdmin.auth.admin.deleteUser(linkedUserId);
              if (e8) console.warn('[SSS Delete] auth.users (non-fatal):', e8.message);
              else console.log('[SSS Delete] ✓ auth.users deleted');
            }
          }

          console.log(`[SSS Delete] ✅ COMPLETE — "${name}" fully removed from Supabase`);
          fetchData();
        } catch (err) {
          console.error('[SSS Delete] FAILED:', err.message);
          setError(`Delete failed at step: ${err.message} — Open F12 Console for details.`);
        }
      }
    });
  };


  // Add Attendance record
  const handleAddAttendance = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        employee_id: attendanceFormData.employee_id,
        company_id: company.id,
        date: attendanceFormData.date,
        clock_in: attendanceFormData.clock_in ? `${attendanceFormData.date}T${attendanceFormData.clock_in}:00` : null,
        clock_out: attendanceFormData.clock_out ? `${attendanceFormData.date}T${attendanceFormData.clock_out}:00` : null,
        status: attendanceFormData.status
      };

      const { error: insertError } = await supabase
        .from('attendance')
        .insert([payload]);

      if (insertError) throw insertError;

      fetchData();
      setShowAddAttendanceModal(false);
    } catch (e) {
      alert('Failed to record attendance: ' + e.message);
    }
  };

  // Delete Attendance record — uses admin client to bypass RLS
  const handleDeleteAttendance = async (id) => {
    setDeleteConfirm({
      title: 'Delete Attendance Log',
      message: 'Permanently remove this attendance entry from the Supabase database?',
      onConfirm: async () => {
        setDeleteConfirm(null);
        setError(null);
        const adminClient = supabaseAdmin || supabase;
        try {
          const { error } = await adminClient
            .from('attendance')
            .delete()
            .eq('id', id);
          if (error) {
            console.error('[SSS Delete] Attendance delete error:', error);
            throw error;
          }
          console.log('[SSS Delete] ✓ Attendance log deleted from Supabase');
          fetchData();
        } catch (e) {
          setError('Failed to delete attendance log: ' + e.message + ' — Check F12 console for details.');
        }
      }
    });
  };

  // Add Leave Request
  const handleAddLeave = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        employee_id: leaveFormData.employee_id,
        company_id: company.id,
        leave_type: leaveFormData.leave_type,
        from_date: leaveFormData.from_date,
        to_date: leaveFormData.to_date,
        total_days: Number(leaveFormData.total_days),
        reason: leaveFormData.reason || null,
        status: (leaveFormData.status || 'PENDING').toUpperCase()
      };

      const { error: insertError } = await supabase
        .from('leave_requests')
        .insert([payload]);

      if (insertError) throw insertError;

      fetchData();
      setShowAddLeaveModal(false);
    } catch (e) {
      alert('Failed to submit leave request: ' + e.message);
    }
  };

  // Update Leave Request Status (Approve / Reject)
  const handleUpdateLeaveStatus = async (id, status) => {
    try {
      const { error } = await supabase
        .from('leave_requests')
        .update({ status: status.toUpperCase() })
        .eq('id', id);

      if (error) throw error;
      fetchData();
    } catch (e) {
      alert('Failed to update leave status: ' + e.message);
    }
  };

  // Delete Leave Request — uses admin client to bypass RLS
  const handleDeleteLeave = async (id) => {
    setDeleteConfirm({
      title: 'Delete Leave Request',
      message: 'Permanently remove this leave request from the Supabase database? This cannot be undone.',
      onConfirm: async () => {
        setDeleteConfirm(null);
        setError(null);
        const adminClient = supabaseAdmin || supabase;
        try {
          const { error } = await adminClient
            .from('leave_requests')
            .delete()
            .eq('id', id);
          if (error) {
            console.error('[SSS Delete] Leave request delete error:', error);
            throw error;
          }
          console.log('[SSS Delete] ✓ Leave request deleted from Supabase');
          fetchData();
        } catch (e) {
          setError('Failed to delete leave request: ' + e.message + ' — Check F12 console for details.');
        }
      }
    });
  };

  // Delete Daily Report submission — uses admin client to bypass RLS
  const handleDeleteDailyReport = async (id) => {
    setDeleteConfirm({
      title: 'Delete Daily Report',
      message: 'Permanently remove this daily report submission from the Supabase database? This cannot be undone.',
      onConfirm: async () => {
        setDeleteConfirm(null);
        setError(null);
        const adminClient = supabaseAdmin || supabase;
        try {
          const { error } = await adminClient
            .from('daily_reports')
            .delete()
            .eq('id', id);
          if (error) {
            console.error('[SSS Delete] Daily report delete error:', error);
            throw error;
          }
          console.log('[SSS Delete] ✓ Daily report deleted from Supabase');
          fetchData();
        } catch (e) {
          setError('Failed to delete daily report: ' + e.message + ' — Check F12 console for details.');
        }
      }
    });
  };

  // Delete Notification Campaign — deletes all notifications matching the title and body
  const handleDeleteNotificationCampaign = async (title, body) => {
    setDeleteConfirm({
      title: 'Delete Broadcast Campaign',
      message: 'Permanently remove this broadcast notification and all delivery records from Supabase? This cannot be undone.',
      onConfirm: async () => {
        setDeleteConfirm(null);
        setError(null);
        const adminClient = supabaseAdmin || supabase;
        try {
          const { error } = await adminClient
            .from('notifications')
            .delete()
            .eq('title', title)
            .eq('body', body);
          if (error) {
            console.error('[SSS Delete] Broadcast delete error:', error);
            throw error;
          }
          console.log('[SSS Delete] ✓ Broadcast notifications deleted from Supabase');
          fetchData();
        } catch (e) {
          setError('Failed to delete broadcast: ' + e.message + ' — Check F12 console for details.');
        }
      }
    });
  };

  // Helper mapping department_id to Name
  const getDeptName = (deptId) => {
    const dept = departments.find(d => d.id === deptId);
    return dept ? dept.name : '—';
  };

  // Filter Employees
  const filteredEmployees = employees.filter(emp => {
    const fullName = `${emp.first_name || ''} ${emp.last_name || ''}`.toLowerCase();
    const matchesSearch = searchQuery === '' || 
      fullName.includes(searchQuery.toLowerCase()) ||
      (emp.designation || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      getDeptName(emp.department_id).toLowerCase().includes(searchQuery.toLowerCase());

    const matchesDept = selectedDept === 'all' || emp.department_id === selectedDept;
    const matchesStatus = selectedStatus === 'all' || 
      (selectedStatus === 'Active' && emp.is_active === true) || 
      (selectedStatus === 'Inactive' && emp.is_active === false);

    return matchesSearch && matchesDept && matchesStatus;
  });

  // Filter Managers
  const managersList = employees.filter(emp => 
    (emp.designation || '').toLowerCase().includes('manager')
  ).filter(emp => {
    const fullName = `${emp.first_name || ''} ${emp.last_name || ''}`.toLowerCase();
    const matchesSearch = searchQuery === '' || fullName.includes(searchQuery.toLowerCase());
    const matchesDept = selectedDept === 'all' || emp.department_id === selectedDept;
    return matchesSearch && matchesDept;
  });

  // Filter Team Leads
  const teamLeadsList = employees.filter(emp => 
    (emp.designation || '').toLowerCase().includes('lead') || (emp.designation || '').toLowerCase().includes('tl')
  ).filter(emp => {
    const fullName = `${emp.first_name || ''} ${emp.last_name || ''}`.toLowerCase();
    const matchesSearch = searchQuery === '' || fullName.includes(searchQuery.toLowerCase());
    const matchesDept = selectedDept === 'all' || emp.department_id === selectedDept;
    return matchesSearch && matchesDept;
  });

  // Attendance filter
  const filteredAttendance = attendanceLogs.filter(log => log.date === attendanceDate).filter(log => {
    const emp = employees.find(e => e.id === log.employee_id);
    if (!emp) return false;
    const fullName = `${emp.first_name || ''} ${emp.last_name || ''}`.toLowerCase();
    return attendanceSearch === '' || fullName.includes(attendanceSearch.toLowerCase());
  });

  // Today's attendance Present vs Late vs Absent
  const todayAttendanceCount = attendanceLogs.filter(log => log.date === new Date().toISOString().split('T')[0]).length;
  
  // New Joiners (last 30 days)
  const getNewJoinersCount = () => {
    const limitDate = new Date();
    limitDate.setDate(limitDate.getDate() - 30);
    return employees.filter(emp => emp.joining_date && new Date(emp.joining_date) >= limitDate).length;
  };

  // Employees on leave today
  const getEmployeesOnLeaveCount = () => {
    const today = new Date().toISOString().split('T')[0];
    return leaveRequests.filter(req => req.status?.toUpperCase() === 'APPROVED' && req.from_date <= today && req.to_date >= today).length;
  };

  // Pending Leave Requests Count
  const pendingLeavesCount = leaveRequests.filter(req => req.status?.toUpperCase() === 'PENDING').length;

  // Active Employees Count
  const activeCount = employees.filter(e => e.is_active === true).length;

  // Export CSV
  const handleExportCSV = () => {
    if (filteredEmployees.length === 0) return;
    const headers = ['First Name', 'Last Name', 'Phone', 'Department', 'Designation', 'Joining Date', 'Basic Salary', 'Bank Account', 'Bank IFSC', 'PAN', 'Active'];
    const csvRows = [
      headers.join(','),
      ...filteredEmployees.map(emp => [
        `"${emp.first_name || ''}"`,
        `"${emp.last_name || ''}"`,
        `"${emp.phone || ''}"`,
        `"${getDeptName(emp.department_id)}"`,
        `"${emp.designation || ''}"`,
        `"${emp.joining_date || ''}"`,
        `${emp.basic_salary || 0}`,
        `"${emp.bank_account || ''}"`,
        `"${emp.bank_ifsc || ''}"`,
        `"${emp.pan_number || ''}"`,
        `"${emp.is_active ? 'Yes' : 'No'}"`
      ].join(','))
    ];
    
    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `storyseed_employees_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  // Chart Data preparation
  const getDeptChartData = () => {
    const dataMap = {};
    departments.forEach(d => {
      dataMap[d.name] = 0;
    });
    employees.forEach(emp => {
      const deptName = getDeptName(emp.department_id);
      if (deptName && deptName !== '—') {
        dataMap[deptName] = (dataMap[deptName] || 0) + 1;
      }
    });
    return Object.entries(dataMap).map(([name, count]) => ({ name, count }));
  };



  // ── Attendance Helpers ─────────────────────────────────────

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

  const isLate = (clockIn) => {
    if (!clockIn) return false;
    try {
      const t = new Date(clockIn);
      return t.getHours() > 9 || (t.getHours() === 9 && t.getMinutes() > 30);
    } catch { return false; }
  };

  const getEmpMonthlySummary = (empId, month) => {
    const [yr, mo] = month.split('-').map(Number);
    const logs = attendanceLogs.filter(l => {
      if (l.employee_id !== empId || !l.date) return false;
      const d = new Date(l.date);
      return d.getFullYear() === yr && d.getMonth() + 1 === mo;
    });
    const leaves = leaveRequests.filter(r =>
      r.employee_id === empId && r.status?.toUpperCase() === 'APPROVED' &&
      (r.from_date?.slice(0,7) === month || r.to_date?.slice(0,7) === month)
    );
    let present = 0, absent = 0, late = 0, leaveDays = 0, totalHours = 0, overtime = 0;
    logs.forEach(l => {
      if (l.status === 'Present') present++;
      else if (l.status === 'Absent') absent++;
      else if (l.status === 'Late') { present++; }
      if (isLate(l.clock_in)) late++;
      const hrs = getWorkingHours(l.clock_in, l.clock_out);
      totalHours += hrs;
      overtime += getOvertimeHours(hrs);
    });
    leaveDays = leaves.reduce((a, r) => a + (r.total_days || 0), 0);
    const daysInMonth = new Date(yr, mo, 0).getDate();
    const workdays = Math.round(daysInMonth * 5 / 7);
    const pct = workdays > 0 ? Math.min(100, Math.round((present / workdays) * 100)) : 0;
    return { present, absent, late, leaveDays, totalHours: Math.round(totalHours * 10) / 10, overtime: Math.round(overtime * 10) / 10, pct };
  };

  const getCalendarGrid = (empId, month) => {
    const [yr, mo] = month.split('-').map(Number);
    const daysInMonth = new Date(yr, mo, 0).getDate();
    const firstDay = new Date(yr, mo - 1, 1).getDay();
    const cells = [];
    for (let i = 0; i < firstDay; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${yr}-${String(mo).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
      const dow = new Date(yr, mo - 1, d).getDay();
      const isWeekend = dow === 0 || dow === 6;
      const log = empId && empId !== 'all'
        ? attendanceLogs.find(l => l.employee_id === empId && l.date === dateStr) || null
        : null;
      const onLeave = empId && empId !== 'all'
        ? leaveRequests.some(r => r.employee_id === empId && r.status?.toUpperCase() === 'APPROVED' && r.from_date <= dateStr && r.to_date >= dateStr)
        : false;
      cells.push({ day: d, dateStr, isWeekend, log, onLeave });
    }
    return cells;
  };

  return (
    <div className="min-h-screen bg-[#F0F2F8] font-inter text-[#1e293b] flex">
      {/* ── Left Sidebar Menu ───────────────────────────────────── */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col shrink-0 shadow-sm">
        <div className="px-6 py-5 border-b border-gray-100 bg-white flex flex-col items-start gap-2.5">
          <img 
            src="/logo.png?v=3" 
            alt="Story Seed Studio" 
            className="h-12 w-12 rounded-2xl object-cover shadow-sm border border-gray-100"
          />
          <div className="flex flex-col">
            <span className="text-xs font-bold text-gray-900 leading-none">HR Priyadharshini</span>
            <span className="text-[10px] text-gray-400 font-medium mt-1">Story Seed Studio</span>
          </div>
        </div>

        <nav className="flex-1 px-3 py-5 space-y-0.5">
          {[
            { name: 'Dashboard', icon: LayoutDashboard },
            { name: 'Our Employees', icon: Users },
            { name: 'Managers', icon: Briefcase },
            { name: 'Team Leads', icon: Award },
            { name: 'Attendance', icon: Clock },
            { name: 'Salary Console', icon: CreditCard },
            { name: 'Reports & Leaves', icon: ClipboardList },
            { name: 'Task Monitor', icon: CheckSquare },
            { name: 'Daily Feeds & Alerts', icon: Bell },
            { name: 'Settings', icon: SettingsIcon }
          ].map(item => {
            const Icon = item.icon;
            const isSel = activeTab === item.name;
            return (
              <button
                key={item.name}
                onClick={() => {
                  setActiveTab(item.name);
                  setSearchQuery('');
                }}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isSel 
                    ? 'bg-[#4F6AF7] text-white shadow-md shadow-[#4F6AF7]/25' 
                    : 'text-gray-500 hover:bg-indigo-50 hover:text-[#4F6AF7]'
                }`}
              >
                <Icon size={17} />
                {item.name}
              </button>
            );
          })}
        </nav>

        <div className="px-5 py-4 border-t border-gray-100">
          <div className="flex items-center gap-2 rounded-full bg-indigo-50 border border-indigo-100 px-3 py-1.5 justify-center">
            <div className="h-2 w-2 rounded-full bg-[#4F6AF7] animate-pulse" />
            <span className="text-[10px] font-bold text-[#4F6AF7] uppercase tracking-wider">Live Connection</span>
          </div>
        </div>
      </aside>

      {/* ── Main Panel ─────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Navbar */}
        <header className="bg-white border-b border-gray-100 flex items-center justify-between px-8 py-4 shadow-sm sticky top-0 z-35">
          <div className="flex items-center gap-3">
            <h1 className="text-sm font-bold text-[#4F6AF7] leading-tight capitalize">{activeTab}</h1>
          </div>

          <div className="flex items-center gap-4">
            <button 
              onClick={() => fetchData(true)}
              disabled={refreshing || loading}
              className="p-2 hover:bg-indigo-50 rounded-xl border border-indigo-100 text-[#4F6AF7] transition-colors"
              title="Refresh Records"
            >
              <RefreshCw size={15} className={refreshing ? 'animate-spin' : ''} />
            </button>
          </div>
        </header>

        {/* Workspace */}
        <main className="flex-1 p-8 space-y-8 overflow-y-auto">
          {error && (
            <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-2xl p-4 text-red-800 animate-fadeIn">
              <AlertTriangle size={16} className="mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-semibold">Backend Error</p>
                <p className="text-xs mt-0.5">{error}</p>
              </div>
            </div>
          )}

          {/* ───────────────── VIEW 1: DASHBOARD ────────────────── */}
          {activeTab === 'Dashboard' && (
            <div className="space-y-8">
              {/* HR Overview Section */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Total Employee Count */}
                <div className="glass-card p-6 rounded-2xl flex flex-col gap-4 bg-white border border-gray-100 shadow-sm">
                  <div className="w-11 h-11 rounded-xl bg-[#EEF1FE] text-[#4F6AF7] flex items-center justify-center">
                    <Users size={20} />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Total Headcount</p>
                    <p className="text-3xl font-extrabold text-gray-900 mt-1 tracking-tight">{loading ? '—' : employees.length}</p>
                    <p className="text-[10px] text-gray-400 mt-1">{activeCount} currently active</p>
                  </div>
                </div>

                {/* Today Attendance */}
                <div className="glass-card p-6 rounded-2xl flex flex-col gap-4 bg-white border border-gray-100 shadow-sm">
                  <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <Clock size={20} />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Today's Attendance</p>
                    <p className="text-3xl font-extrabold text-gray-900 mt-1 tracking-tight">
                      {loading ? '—' : todayAttendanceCount}
                    </p>
                    <p className="text-[10px] text-gray-400 mt-1">Logged presence entries</p>
                  </div>
                </div>

                {/* Leave Requests */}
                <div className="glass-card p-6 rounded-2xl flex flex-col gap-4 bg-white border border-gray-100 shadow-sm">
                  <div className="w-11 h-11 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center">
                    <ClipboardList size={20} />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Leave Requests</p>
                    <p className="text-3xl font-extrabold text-gray-900 mt-1 tracking-tight">
                      {loading ? '—' : pendingLeavesCount}
                    </p>
                    <p className="text-[10px] text-violet-600 mt-1 font-semibold">{pendingLeavesCount} pending approval</p>
                  </div>
                </div>

                {/* Open Positions */}
                <div className="glass-card p-6 rounded-2xl flex flex-col gap-4 bg-white border border-gray-100 shadow-sm">
                  <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center">
                    <Briefcase size={20} />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Monthly Payroll</p>
                    <p className="text-3xl font-extrabold text-gray-900 mt-1 tracking-tight">₹{loading ? '—' : (employees.reduce((a, e) => a + (e.basic_salary || 0), 0) / 1000).toFixed(0)}K</p>
                    <p className="text-[10px] text-gray-400 mt-1">{employees.length} employees</p>
                  </div>
                </div>
              </div>

              {/* Sub-Metrics Section */}
              <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
                <h3 className="text-xs font-bold text-gray-400 mb-5 uppercase tracking-widest">Workforce Analytics</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  <div className="border-l-2 border-[#4F6AF7] pl-4">
                    <p className="text-[11px] text-gray-400 font-semibold uppercase">New Joiners (30d)</p>
                    <p className="text-2xl font-extrabold text-gray-900 mt-0.5">{loading ? '—' : getNewJoinersCount()}</p>
                  </div>
                  <div className="border-l-2 border-emerald-400 pl-4">
                    <p className="text-[11px] text-gray-400 font-semibold uppercase">Employees on Leave</p>
                    <p className="text-2xl font-extrabold text-gray-900 mt-0.5">{loading ? '—' : getEmployeesOnLeaveCount()}</p>
                  </div>
                  <div className="border-l-2 border-violet-400 pl-4">
                    <p className="text-[11px] text-gray-400 font-semibold uppercase">Inactive Count</p>
                    <p className="text-2xl font-extrabold text-gray-900 mt-0.5">{loading ? '—' : (employees.length - activeCount)}</p>
                  </div>
                  <div className="border-l-2 border-amber-400 pl-4">
                    <p className="text-[11px] text-gray-400 font-semibold uppercase">Total Payroll Cost</p>
                    <p className="text-2xl font-extrabold text-gray-900 mt-0.5">
                      ₹{loading ? '—' : employees.reduce((acc, e) => acc + (e.basic_salary || 0), 0).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>

              {/* Quick Actions Panel */}
              <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
                <h3 className="text-xs font-bold text-gray-400 mb-4 uppercase tracking-widest">Quick Actions</h3>
                <div className="flex flex-wrap gap-3">
                  <button onClick={() => handleOpenAddModal('employee')} className="flex items-center gap-1.5 bg-[#4F6AF7] hover:bg-[#3d58e5] text-white rounded-xl py-2.5 px-4 font-semibold text-xs transition-all shadow-md shadow-[#4F6AF7]/20">
                    <UserPlus size={14} /> Add Employee
                  </button>
                  <button onClick={() => handleOpenAddModal('manager')} className="flex items-center gap-1.5 bg-[#4F6AF7] hover:bg-[#3d58e5] text-white rounded-xl py-2.5 px-4 font-semibold text-xs transition-all shadow-md shadow-[#4F6AF7]/20">
                    <Briefcase size={14} /> Add Manager
                  </button>
                  <button onClick={() => handleOpenAddModal('tl')} className="flex items-center gap-1.5 bg-[#4F6AF7] hover:bg-[#3d58e5] text-white rounded-xl py-2.5 px-4 font-semibold text-xs transition-all shadow-md shadow-[#4F6AF7]/20">
                    <Award size={14} /> Add Team Lead
                  </button>
                  <button onClick={() => setActiveTab('Reports & Leaves')} className="flex items-center gap-1.5 border border-[#4F6AF7] text-[#4F6AF7] hover:bg-indigo-50 font-semibold text-xs py-2.5 px-4 rounded-xl transition-all">
                    <CheckCircle size={14} /> Approve Requests
                  </button>
                  <button onClick={handleExportCSV} className="flex items-center gap-1.5 border border-gray-200 text-gray-600 hover:bg-gray-50 font-semibold text-xs py-2.5 px-4 rounded-xl transition-all">
                    <Download size={14} /> Export Report
                  </button>
                </div>
              </div>

              {/* Chart — Employee Distribution by Department (live Supabase data) */}
              <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm flex flex-col" style={{ height: 340 }}>
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <h3 className="text-sm font-bold text-gray-800">Employee Distribution by Department</h3>
                    <p className="text-[11px] text-gray-400 mt-0.5">Live headcount per department from Supabase</p>
                  </div>
                  <span className="text-[10px] font-bold bg-indigo-50 text-[#4F6AF7] border border-indigo-100 px-2.5 py-1 rounded-full uppercase tracking-wider">
                    {employees.length} Total
                  </span>
                </div>
                <div className="flex-1 w-full min-h-0">
                  {getDeptChartData().every(d => d.count === 0) ? (
                    <div className="h-full flex items-center justify-center text-gray-300 flex-col gap-2">
                      <BarChart2 size={32} />
                      <p className="text-xs font-medium">No employee data yet</p>
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={getDeptChartData()} barCategoryGap="30%">
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                        <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} allowDecimals={false} />
                        <Tooltip
                          cursor={{ fill: '#EEF1FE' }}
                          contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 12, boxShadow: '0 4px 16px rgba(0,0,0,0.08)' }}
                          formatter={(val) => [`${val} employees`, 'Headcount']}
                        />
                        <Bar dataKey="count" fill="#4F6AF7" radius={[6, 6, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ───────────────── VIEW 2: OUR EMPLOYEES ────────────── */}
          {activeTab === 'Our Employees' && (
            <div className="card p-6 space-y-6 flex flex-col bg-white border border-gray-100 rounded-2xl shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-bold text-gray-900">Our Employees</h2>
                  <p className="text-xs text-gray-400 mt-1">Click on any employee to view their full profile card.</p>
                </div>
                <div className="flex items-center gap-3">
                  <button onClick={() => handleOpenAddModal('employee')} className="text-xs h-10 px-4 flex items-center gap-1.5 font-semibold bg-[#4F6AF7] hover:bg-[#3d58e5] text-white rounded-xl shadow-md shadow-[#4F6AF7]/20 transition-all">
                    <Plus size={16} /> Add Employee
                  </button>
                  <button onClick={handleExportCSV} className="text-xs h-10 px-3 flex items-center gap-1.5 border border-gray-200 text-gray-600 hover:bg-gray-50 rounded-xl transition-all">
                    <Download size={14} /> Export CSV
                  </button>
                </div>
              </div>

              {/* Filters */}
              <div className="flex flex-col sm:flex-row gap-4 items-center">
                <div className="relative flex-1 w-full">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                  <input 
                    type="text" 
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder="Search by name, designation..."
                    className="w-full pl-10 pr-4 h-11 rounded-xl border border-gray-200 text-sm focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-500 outline-none"
                  />
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <select 
                    value={selectedDept}
                    onChange={e => setSelectedDept(e.target.value)}
                    className="bg-white border border-gray-200 rounded-xl px-3 h-11 text-sm font-semibold outline-none text-gray-700 cursor-pointer"
                  >
                    <option value="all">All Departments</option>
                    {departments.map(dept => (
                      <option key={dept.id} value={dept.id}>{dept.name}</option>
                    ))}
                  </select>

                  <select 
                    value={selectedStatus}
                    onChange={e => setSelectedStatus(e.target.value)}
                    className="bg-white border border-gray-200 rounded-xl px-3 h-11 text-sm font-semibold outline-none text-gray-700 cursor-pointer"
                  >
                    <option value="all">All Statuses</option>
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>

              {/* Table */}
              {loading ? (
                <div className="py-20 text-center text-gray-400">Loading records...</div>
              ) : filteredEmployees.length === 0 ? (
                <div className="py-16 text-center border-2 border-dashed border-gray-100 rounded-2xl">
                  <Users size={36} className="text-gray-300 mx-auto mb-2" />
                  <p className="text-sm font-bold text-gray-900">No employees found</p>
                </div>
              ) : (
                <div className="overflow-x-auto -mx-6">
                  <table className="w-full text-left border-collapse min-w-[900px]">
                    <thead>
                      <tr className="border-b border-gray-100 text-[10px] font-bold uppercase tracking-wider text-gray-400 bg-gray-50/50">
                        <th className="py-4 px-6">Employee</th>
                        <th className="py-4 px-6">Department & Role</th>
                        <th className="py-4 px-6">Contact Phone</th>
                        <th className="py-4 px-6">Date Joined</th>
                        <th className="py-4 px-6">Basic Salary</th>
                        <th className="py-4 px-6">Status</th>
                        <th className="py-4 px-6 text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100/50 text-sm">
                      {filteredEmployees.map(emp => (
                        <tr key={emp.id} className="hover:bg-indigo-50/20 transition-colors cursor-pointer group">
                          <td className="py-4 px-6" onClick={() => setSelectedEmpCard(emp)}>
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-400 to-[#4F6AF7] text-white font-extrabold flex items-center justify-center shrink-0 shadow-sm">
                                {emp.first_name?.[0]?.toUpperCase()}{emp.last_name?.[0]?.toUpperCase()}
                              </div>
                              <div>
                                <p className="font-semibold text-[#4F6AF7] leading-tight group-hover:underline underline-offset-2">
                                  {emp.first_name} {emp.last_name}
                                </p>
                                <p className="text-[9px] text-gray-400 mt-1 font-mono">
                                  ID: {emp.id.substring(0, 8)}...
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-6" onClick={() => setSelectedEmpCard(emp)}>
                            <div>
                              <p className="font-medium text-gray-900 leading-tight">{emp.designation || 'N/A'}</p>
                              <p className="text-xs text-gray-500 mt-0.5">{getDeptName(emp.department_id)}</p>
                            </div>
                          </td>
                          <td className="py-4 px-6 text-xs text-gray-600" onClick={() => setSelectedEmpCard(emp)}>
                            {emp.phone || '—'}
                          </td>
                          <td className="py-4 px-6 text-xs text-gray-500" onClick={() => setSelectedEmpCard(emp)}>
                            {emp.joining_date ? new Date(emp.joining_date).toLocaleDateString() : '—'}
                          </td>
                          <td className="py-4 px-6 font-semibold text-gray-900" onClick={() => setSelectedEmpCard(emp)}>
                            ₹{(emp.basic_salary || 0).toLocaleString()}
                          </td>
                          <td className="py-4 px-6" onClick={() => setSelectedEmpCard(emp)}>
                            <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2.5 py-1 rounded-full border ${
                              emp.is_active ? TYPE_STYLES.Active : TYPE_STYLES.Inactive
                            }`}>
                              {emp.is_active ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td className="py-4 px-6 text-center">
                            <div className="flex items-center justify-center gap-2">
                              <button onClick={(e) => { e.stopPropagation(); handleOpenEditModal(emp); }} className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors">
                                <Edit size={13} />
                              </button>
                              <button onClick={(e) => { e.stopPropagation(); handleDeleteEmployee(emp.id, `${emp.first_name} ${emp.last_name}`); }} className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors" title="Delete employee">
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* ───── EMPLOYEE PROFILE CARD MODAL ───── */}
          {selectedEmpCard && (() => {
            const empCardTab = selectedEmpCard._tab || 'profile';
            const setEmpCardTab = (t) => setSelectedEmpCard(prev => ({ ...prev, _tab: t }));
            const leaveCount = leaveRequests.filter(l => l.employee_id === selectedEmpCard.id).length;
            const attCount = attendanceLogs.filter(a => a.employee_id === selectedEmpCard.id).length;
            const approvedLeaves = leaveRequests.filter(l => l.employee_id === selectedEmpCard.id && l.status === 'Approved').length;
            return (
              <div
                className="fixed inset-0 z-50 flex items-center justify-center p-4"
                style={{ background: 'rgba(0,0,0,0.35)', backdropFilter: 'blur(6px)', fontFamily: "'Inter', sans-serif" }}
                onClick={() => setSelectedEmpCard(null)}
              >
                <div
                  className="relative w-full bg-white rounded-2xl shadow-2xl overflow-hidden flex"
                  onClick={e => e.stopPropagation()}
                  style={{ maxWidth: 800, maxHeight: '92vh' }}
                >
                  {/* Close */}
                  <button
                    onClick={() => setSelectedEmpCard(null)}
                    className="absolute top-3 right-3 z-20 w-7 h-7 flex items-center justify-center rounded-full border border-gray-200 text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-all"
                  >
                    <X size={14} />
                  </button>

                  {/* ── LEFT PANEL ── */}
                  <div className="w-64 shrink-0 bg-gray-50 border-r border-gray-100 flex flex-col p-5 gap-3">

                    {/* BOX 1 — Photo only (separate box) */}
                    <div className="w-full bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden relative" style={{ height: 240 }}>
                      {/* ACTIVE badge */}
                      <span className={`absolute top-2.5 right-2.5 z-10 text-[9px] font-bold px-2 py-0.5 rounded-full tracking-wide ${
                        selectedEmpCard.is_active ? 'bg-emerald-100 text-emerald-600' : 'bg-gray-100 text-gray-400'
                      }`}>
                        {selectedEmpCard.is_active ? 'ACTIVE' : 'INACTIVE'}
                      </span>
                      {/* Photo upload label fills entire box */}
                      <label className="cursor-pointer group block w-full h-full relative">
                        <input type="file" accept="image/*" className="hidden" onChange={e => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onload = ev => setSelectedEmpCard(prev => ({ ...prev, _photoPreview: ev.target.result }));
                            reader.readAsDataURL(file);
                          }
                        }} />
                        {selectedEmpCard._photoPreview ? (
                          <img src={selectedEmpCard._photoPreview} alt="Employee" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-indigo-100 via-indigo-200 to-indigo-300 flex flex-col items-center justify-center gap-1">
                            <span className="text-indigo-700 font-black text-5xl select-none" style={{ fontFamily: "'Inter', sans-serif" }}>
                              {selectedEmpCard.first_name?.[0]?.toUpperCase()}{selectedEmpCard.last_name?.[0]?.toUpperCase()}
                            </span>
                            <p className="text-indigo-400 text-[9px] font-semibold">Click to upload photo</p>
                          </div>
                        )}
                        {/* Upload hover overlay */}
                        <div className="absolute inset-0 bg-black/25 flex flex-col items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          <p className="text-white text-[10px] font-semibold">Upload Photo</p>
                        </div>
                      </label>
                    </div>

                    {/* BOX 2 — Details (name, profession, ID, department) — separate box below photo */}
                    <div className="w-full bg-white rounded-2xl border border-gray-100 shadow-sm px-4 py-4 flex flex-col gap-2.5">
                      {/* Name */}
                      <div>
                        <p className="text-gray-900 font-bold text-sm leading-tight" style={{ fontFamily: "'Inter', sans-serif" }}>
                          {selectedEmpCard.first_name} {selectedEmpCard.last_name}
                        </p>
                        <p className="text-[10px] font-bold mt-0.5 uppercase tracking-wider" style={{ color: '#4F6AF7', fontFamily: "'Inter', sans-serif" }}>
                          {selectedEmpCard.designation || 'Employee'}
                        </p>
                      </div>
                      <div className="border-t border-gray-100 pt-2.5 grid grid-cols-2 gap-x-3 gap-y-2">
                        <div>
                          <p className="text-[8px] text-gray-400 font-semibold uppercase tracking-widest leading-none">Employee ID</p>
                          <p className="text-[11px] font-bold text-gray-700 font-mono mt-0.5">{selectedEmpCard.id.slice(0, 8).toUpperCase()}</p>
                        </div>
                        <div>
                          <p className="text-[8px] text-gray-400 font-semibold uppercase tracking-widest leading-none">Department</p>
                          <p className="text-[11px] font-semibold text-gray-700 mt-0.5 leading-tight">{getDeptName(selectedEmpCard.department_id)}</p>
                        </div>
                      </div>
                    </div>

                    {/* Edit button */}
                    <button
                      onClick={() => { setSelectedEmpCard(null); handleOpenEditModal(selectedEmpCard); }}
                      className="w-full h-9 flex items-center justify-center gap-1.5 bg-[#4F6AF7] hover:bg-[#3d58e5] text-white text-xs font-bold rounded-xl transition-all mt-auto"
                    >
                      <Edit size={12} /> Edit Profile
                    </button>
                  </div>

                  {/* ── RIGHT PANEL ── */}
                  <div className="flex-1 flex flex-col overflow-hidden">
                    {/* Tabs */}
                    <div className="flex border-b border-gray-100 px-6 pt-5 gap-6">
                      {['profile', 'details'].map(tab => (
                        <button
                          key={tab}
                          onClick={() => setEmpCardTab(tab)}
                          className={`pb-3 text-xs font-bold capitalize tracking-wide border-b-2 transition-all ${
                            empCardTab === tab
                              ? 'border-[#4F6AF7] text-[#4F6AF7]'
                              : 'border-transparent text-gray-400 hover:text-gray-600'
                          }`}
                        >
                          {tab === 'profile' ? 'Profile & Stats' : 'Full Details'}
                        </button>
                      ))}
                    </div>

                    <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-5">
                      {empCardTab === 'profile' && (
                        <>
                          {/* Grouped info fields — like reference image */}
                          <div className="border border-gray-100 rounded-xl overflow-hidden">
                            {[
                              { icon: Phone, label: 'PHONE NUMBER', value: selectedEmpCard.phone || '—' },
                              { icon: Calendar, label: 'JOINED DATE', value: selectedEmpCard.joining_date ? new Date(selectedEmpCard.joining_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : '—' },
                              { icon: DollarSign, label: 'BASIC SALARY', value: `₹${(selectedEmpCard.basic_salary || 0).toLocaleString('en-IN')}` },
                            ].map(({ icon: Icon, label, value }, i, arr) => (
                              <div key={label} className={`flex items-center gap-3 px-4 py-3.5 ${i < arr.length - 1 ? 'border-b border-gray-100' : ''}`}>
                                <Icon size={15} className="text-gray-400 shrink-0" />
                                <div>
                                  <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest leading-none">{label}</p>
                                  <p className="text-[13px] font-semibold text-gray-800 mt-0.5">{value}</p>
                                </div>
                              </div>
                            ))}
                          </div>

                          {/* Performance metrics */}
                          <div>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Performance Metrics</p>
                            <div className="grid grid-cols-3 gap-3">
                              {[
                                { label: 'Attendance Days', value: attCount },
                                { label: 'Leave Requests', value: leaveCount },
                                { label: 'Leaves Approved', value: approvedLeaves },
                              ].map(({ label, value }) => (
                                <div key={label} className="border border-gray-100 rounded-xl p-3.5 text-center flex flex-col items-center gap-1 hover:border-indigo-100 transition-colors">
                                  <p className="text-xl font-black text-gray-800">{value}</p>
                                  <p className="text-[9px] text-gray-400 font-semibold leading-tight text-center">{label}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        </>
                      )}

                      {empCardTab === 'details' && (
                        <div className="border border-gray-100 rounded-xl overflow-hidden">
                          {[
                            { icon: Landmark, label: 'BANK ACCOUNT', value: selectedEmpCard.bank_account || '—' },
                            { icon: FileText, label: 'BANK IFSC', value: selectedEmpCard.bank_ifsc || '—' },
                            { icon: Info, label: 'PAN NUMBER', value: selectedEmpCard.pan_number || '—' },
                            { icon: Info, label: 'PF NUMBER', value: selectedEmpCard.pf_number || '—' },
                            { icon: Briefcase, label: 'DEPARTMENT', value: getDeptName(selectedEmpCard.department_id) },
                            { icon: Calendar, label: 'DATE JOINED', value: selectedEmpCard.joining_date ? new Date(selectedEmpCard.joining_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : '—' },
                          ].map(({ icon: Icon, label, value }, i, arr) => (
                            <div key={label} className={`flex items-center gap-3 px-4 py-3.5 ${i < arr.length - 1 ? 'border-b border-gray-100' : ''}`}>
                              <Icon size={15} className="text-gray-400 shrink-0" />
                              <div>
                                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest leading-none">{label}</p>
                                <p className="text-[13px] font-semibold text-gray-800 mt-0.5">{value}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* ───────────────── VIEW 3: MANAGERS ─────────────────── */}
          {activeTab === 'Managers' && (
            <div className="card p-6 space-y-6 flex flex-col bg-white border border-gray-100 rounded-2xl shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-bold text-gray-900">Manager Registry</h2>
                  <p className="text-xs text-gray-400 mt-1">Story Seed leaders overseeing client execution and departments.</p>
                </div>
                <button onClick={() => handleOpenAddModal('manager')} className="text-xs h-10 px-4 flex items-center gap-1.5 font-semibold bg-[#4F6AF7] hover:bg-[#3d58e5] text-white rounded-xl shadow-md shadow-[#4F6AF7]/20 transition-all">
                  <Plus size={16} /> Add Manager
                </button>
              </div>

              {/* Search / Filter */}
              <div className="flex flex-col sm:flex-row gap-4 items-center">
                <div className="relative flex-1 w-full">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                  <input 
                    type="text" 
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder="Search managers by name..."
                    className="w-full pl-10 pr-4 h-11 rounded-xl border border-gray-200 text-sm focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 outline-none"
                  />
                </div>

                <select 
                  value={selectedDept}
                  onChange={e => setSelectedDept(e.target.value)}
                  className="bg-white border border-gray-200 rounded-xl px-3 h-11 text-sm font-semibold outline-none text-gray-700 cursor-pointer w-full sm:w-48"
                >
                  <option value="all">All Departments</option>
                  {departments.map(dept => (
                    <option key={dept.id} value={dept.id}>{dept.name}</option>
                  ))}
                </select>
              </div>

              {/* Managers Table */}
              {loading ? (
                <div className="py-20 text-center text-gray-400">Loading records...</div>
              ) : managersList.length === 0 ? (
                <div className="py-16 text-center border-2 border-dashed border-gray-100 rounded-2xl">
                  <Briefcase size={36} className="text-gray-300 mx-auto mb-2" />
                  <p className="text-sm font-bold text-gray-900">No managers found</p>
                </div>
              ) : (
                <div className="overflow-x-auto -mx-6">
                  <table className="w-full text-left border-collapse min-w-[900px]">
                    <thead>
                      <tr className="border-b border-gray-100 text-[10px] font-bold uppercase tracking-wider text-gray-400 bg-gray-50/50">
                        <th className="py-4 px-6">Manager</th>
                        <th className="py-4 px-6">Employee ID</th>
                        <th className="py-4 px-6">Department</th>
                        <th className="py-4 px-6">Team Size</th>
                        <th className="py-4 px-6">Contact Number</th>
                        <th className="py-4 px-6">Email ID</th>
                        <th className="py-4 px-6">Performance Status</th>
                        <th className="py-4 px-6 text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100/50 text-sm">
                      {managersList.map(mgr => {
                        const meta = getMetadata(mgr);
                        const teamSize = employees.filter(e => e.reporting_manager_id === mgr.id).length;
                        return (
                          <tr key={mgr.id} className="hover:bg-gray-50/30 transition-colors">
                            <td className="py-4 px-6 font-semibold text-gray-900">
                              {mgr.first_name} {mgr.last_name}
                            </td>
                            <td className="py-4 px-6 text-xs text-gray-500 font-mono">
                              {mgr.id.substring(0, 8)}...
                            </td>
                            <td className="py-4 px-6">
                              {getDeptName(mgr.department_id)}
                            </td>
                            <td className="py-4 px-6 font-bold text-gray-800">
                              {teamSize} members
                            </td>
                            <td className="py-4 px-6 text-xs">
                              {mgr.phone || '—'}
                            </td>
                            <td className="py-4 px-6 text-xs text-blue-600 font-medium">
                              {meta.email || `${mgr.first_name.toLowerCase()}.${mgr.last_name.toLowerCase()}@storyseed.com`}
                            </td>
                            <td className="py-4 px-6">
                              <span className={`text-[10px] font-bold px-2 py-0.5 border rounded-full ${
                                meta.performance_status === 'Excellent' 
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                                  : 'bg-blue-50 text-blue-700 border-blue-100'
                              }`}>
                                {meta.performance_status || 'Good'}
                              </span>
                            </td>
                            <td className="py-4 px-6 text-center">
                              <div className="flex items-center justify-center gap-2">
                                <button onClick={() => handleOpenEditModal(mgr)} className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors">
                                  <Edit size={13} />
                                </button>
                                <button onClick={() => handleDeleteEmployee(mgr.id, `${mgr.first_name} ${mgr.last_name}`)} className="p-1.5 rounded-lg text-gray-400 hover:text-red-650 hover:bg-red-50 transition-colors" title="Delete Manager">
                                  <Trash2 size={13} />
                                </button>
                              </div>
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

          {/* ───────────────── VIEW 4: TEAM LEADS ───────────────── */}
          {activeTab === 'Team Leads' && (
            <div className="space-y-6">
              {/* Header */}
              <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-bold text-gray-900">Team Lead Registry</h2>
                  <p className="text-xs text-gray-400 mt-1">Team leaders, their team sizes, and complete member details.</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="bg-indigo-50 border border-indigo-100 rounded-xl px-4 py-2 flex items-center gap-2">
                    <Award size={14} className="text-[#4F6AF7]" />
                    <span className="text-xs font-bold text-[#4F6AF7]">{teamLeadsList.length} Team Leads</span>
                  </div>
                  <button onClick={() => handleOpenAddModal('tl')} className="text-xs h-10 px-4 flex items-center gap-1.5 font-semibold bg-[#4F6AF7] hover:bg-[#3d58e5] text-white rounded-xl shadow-md shadow-[#4F6AF7]/20 transition-all">
                    <Plus size={16} /> Add Team Lead
                  </button>
                </div>
              </div>

              {/* Filters */}
              <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-4 flex gap-3 items-center">
                <div className="relative flex-1">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder="Search team leads by name..."
                    className="w-full pl-10 pr-4 h-10 rounded-xl border border-gray-200 text-sm focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 outline-none"
                  />
                </div>
                <select
                  value={selectedDept}
                  onChange={e => setSelectedDept(e.target.value)}
                  className="h-10 px-3 border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 outline-none bg-white"
                >
                  <option value="all">All Departments</option>
                  {departments.map(dept => (
                    <option key={dept.id} value={dept.id}>{dept.name}</option>
                  ))}
                </select>
              </div>

              {/* Team Lead Cards */}
              {loading ? (
                <div className="py-20 text-center text-gray-400">Loading records...</div>
              ) : teamLeadsList.length === 0 ? (
                <div className="py-16 text-center border-2 border-dashed border-gray-100 rounded-2xl bg-white">
                  <Award size={40} className="text-gray-200 mx-auto mb-3" />
                  <p className="text-sm font-bold text-gray-900">No team leads found</p>
                  <p className="text-xs text-gray-400 mt-1">Add your first team lead using the button above.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-5">
                  {teamLeadsList.map(tl => {
                    const meta = getMetadata(tl);
                    const myTeam = employees.filter(e => e.reporting_manager_id === tl.id);
                    const teamSize = myTeam.length;
                    const todayLog = attendanceLogs.find(log => log.employee_id === tl.id && log.date === new Date().toISOString().split('T')[0]);
                    const isExpanded = expandedTlId === tl.id;

                    return (
                      <div key={tl.id} className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
                        {/* TL Card Header */}
                        <div className="p-6">
                          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                            {/* Left: TL info */}
                            <div className="flex items-center gap-4">
                              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#4F6AF7] to-purple-600 text-white font-extrabold flex items-center justify-center text-lg shadow-md shadow-[#4F6AF7]/20 shrink-0">
                                {tl.first_name?.[0]}{tl.last_name?.[0]}
                              </div>
                              <div>
                                <h3 className="text-base font-extrabold text-gray-900">{tl.first_name} {tl.last_name}</h3>
                                <p className="text-xs text-[#4F6AF7] font-semibold mt-0.5">{tl.designation || 'Team Lead'}</p>
                                <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                                  <span className="text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-100 px-2 py-0.5 rounded-full">
                                    {getDeptName(tl.department_id)} Dept
                                  </span>
                                  <span className="text-[10px] font-mono text-gray-400">ID: {tl.id?.substring(0, 8)}...</span>
                                </div>
                              </div>
                            </div>

                            {/* Right: Action buttons */}
                            <div className="flex items-center gap-2 shrink-0">
                              <button onClick={() => handleOpenEditModal(tl)} className="p-2 rounded-xl text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors border border-gray-100" title="Edit">
                                <Edit size={14} />
                              </button>
                              <button onClick={() => handleDeleteEmployee(tl.id, `${tl.first_name} ${tl.last_name}`)} className="p-2 rounded-xl text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors border border-gray-100" title="Delete">
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </div>

                          {/* Stats Row */}
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5">
                            {/* Team Members count — click to expand */}
                            <button
                              type="button"
                              onClick={() => setExpandedTlId(isExpanded ? null : tl.id)}
                              className={`flex flex-col items-center gap-1 p-3.5 rounded-xl border transition-all text-center ${
                                isExpanded
                                  ? 'bg-indigo-50 border-indigo-200 text-[#4F6AF7]'
                                  : 'bg-gray-50 border-gray-100 text-gray-700 hover:bg-indigo-50 hover:border-indigo-100 hover:text-[#4F6AF7]'
                              }`}
                            >
                              <Users size={16} />
                              <span className="text-lg font-extrabold leading-none">{teamSize}</span>
                              <span className="text-[10px] font-semibold uppercase tracking-wider">
                                {teamSize === 1 ? 'Member' : 'Members'}
                              </span>
                              <ChevronRight size={11} className={`mt-0.5 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                            </button>

                            <div className="flex flex-col items-center gap-1 p-3.5 rounded-xl border bg-gray-50 border-gray-100 text-center">
                              <Briefcase size={16} className="text-gray-400" />
                              <span className="text-xs font-bold text-gray-800 truncate w-full">{meta.project_name || '—'}</span>
                              <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Project</span>
                            </div>

                            <div className="flex flex-col items-center gap-1 p-3.5 rounded-xl border bg-amber-50 border-amber-100 text-center">
                              <Award size={16} className="text-amber-500" />
                              <span className="text-lg font-extrabold text-amber-600 leading-none">
                                {meta.performance_rating ? `★${meta.performance_rating}` : '—'}
                              </span>
                              <span className="text-[10px] font-semibold text-amber-600 uppercase tracking-wider">Rating /5</span>
                            </div>

                            <div className={`flex flex-col items-center gap-1 p-3.5 rounded-xl border text-center ${
                              todayLog?.status === 'Present'
                                ? 'bg-emerald-50 border-emerald-100'
                                : 'bg-gray-50 border-gray-100'
                            }`}>
                              <Clock size={16} className={todayLog?.status === 'Present' ? 'text-emerald-500' : 'text-gray-400'} />
                              <span className={`text-xs font-bold leading-none ${todayLog?.status === 'Present' ? 'text-emerald-700' : 'text-gray-500'}`}>
                                {todayLog?.status || 'Not Checked'}
                              </span>
                              <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Today</span>
                            </div>
                          </div>
                        </div>

                        {/* Expandable Team Member Details */}
                        {isExpanded && (
                          <div className="border-t border-gray-100 bg-gray-50/50 p-6">
                            <div className="flex items-center justify-between mb-4">
                              <div>
                                <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider">
                                  {tl.first_name}'s Team — {teamSize} Member{teamSize !== 1 ? 's' : ''}
                                </h4>
                                <p className="text-[11px] text-gray-400 mt-0.5">
                                  Direct reports assigned to {tl.first_name} {tl.last_name}
                                </p>
                              </div>
                              {meta.project_name && (
                                <div className="text-xs bg-white border border-gray-200 px-3 py-1.5 rounded-lg font-semibold text-gray-600">
                                  Project: {meta.project_name}
                                </div>
                              )}
                            </div>

                            {myTeam.length === 0 ? (
                              <div className="bg-white rounded-xl border border-gray-100 p-8 text-center text-xs text-gray-400 italic">
                                No team members are currently assigned to this lead.
                              </div>
                            ) : (
                              <div className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm">
                                <table className="w-full text-left border-collapse text-xs min-w-[650px]">
                                  <thead>
                                    <tr className="border-b border-gray-100 text-[10px] font-bold uppercase tracking-wider text-gray-400 bg-gray-50/50">
                                      <th className="py-3 px-5">#</th>
                                      <th className="py-3 px-5">Member Name</th>
                                      <th className="py-3 px-5">Designation</th>
                                      <th className="py-3 px-5">Department</th>
                                      <th className="py-3 px-5">Contact</th>
                                      <th className="py-3 px-5">Basic Salary</th>
                                      <th className="py-3 px-5">Status</th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-gray-100/50 text-gray-700">
                                    {myTeam.map((member, idx) => (
                                      <tr key={member.id} className="hover:bg-gray-50/40 transition-colors">
                                        <td className="py-3 px-5 text-gray-400 font-mono">{idx + 1}</td>
                                        <td className="py-3 px-5">
                                          <div className="flex items-center gap-2">
                                            <div className="w-7 h-7 rounded-full bg-indigo-50 text-indigo-700 font-bold flex items-center justify-center text-[10px] shrink-0">
                                              {member.first_name?.[0]}{member.last_name?.[0]}
                                            </div>
                                            <span className="font-semibold text-gray-900">{member.first_name} {member.last_name}</span>
                                          </div>
                                        </td>
                                        <td className="py-3 px-5 text-gray-500">{member.designation || '—'}</td>
                                        <td className="py-3 px-5">{getDeptName(member.department_id)}</td>
                                        <td className="py-3 px-5">
                                          <span className="flex items-center gap-1 text-gray-600">
                                            <Phone size={10} className="text-gray-400" />
                                            {member.phone || '—'}
                                          </span>
                                        </td>
                                        <td className="py-3 px-5 font-bold text-gray-800">
                                          ₹{(member.basic_salary || 0).toLocaleString('en-IN')}
                                        </td>
                                        <td className="py-3 px-5">
                                          <span className={`inline-block text-[9px] font-bold px-2 py-0.5 rounded-full border ${
                                            member.is_active
                                              ? 'bg-indigo-50 text-indigo-700 border-indigo-100'
                                              : 'bg-gray-50 text-gray-400 border-gray-200'
                                          }`}>
                                            {member.is_active ? 'Active' : 'Inactive'}
                                          </span>
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ───────────────── VIEW 5: ATTENDANCE ───────────────── */}
          {activeTab === 'Attendance' && (
            <div className="space-y-6">
              {/* Header */}
              <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-bold text-gray-900">Attendance Tracker</h2>
                  <p className="text-xs text-gray-400 mt-1">Monitor daily logs, monthly summaries, and attendance calendars for all employees.</p>
                </div>
                <button onClick={() => {
                  setAttendanceFormData({
                    employee_id: employees[0]?.id || '',
                    date: new Date().toISOString().split('T')[0],
                    clock_in: '09:00',
                    clock_out: '18:00',
                    status: 'Present'
                  });
                  setShowAddAttendanceModal(true);
                }} className="text-xs h-10 px-4 flex items-center gap-1.5 font-semibold bg-[#4F6AF7] hover:bg-[#3d58e5] text-white rounded-xl shadow-md shadow-[#4F6AF7]/20 transition-all">
                  <Plus size={16} /> Log Attendance
                </button>
              </div>

              {/* Sub-Tab Navigation */}
              <div className="flex gap-1 bg-white border border-gray-100 rounded-xl p-1 shadow-sm w-fit">
                {['Daily', 'Monthly Summary', 'Calendar'].map(tab => (
                  <button
                    key={tab}
                    onClick={() => setAttendanceSubTab(tab)}
                    className={`text-xs font-semibold px-4 py-2 rounded-lg transition-all ${
                      attendanceSubTab === tab
                        ? 'bg-[#4F6AF7] text-white shadow-md shadow-[#4F6AF7]/20'
                        : 'text-gray-500 hover:text-[#4F6AF7] hover:bg-indigo-50'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {/* ── Sub-tab 1: DAILY VIEW ── */}
              {attendanceSubTab === 'Daily' && (
                <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6 space-y-5">
                  {/* Filters */}
                  <div className="flex flex-col sm:flex-row gap-3 items-center">
                    <div className="relative flex-1 w-full">
                      <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
                      <input
                        type="text"
                        value={attendanceSearch}
                        onChange={e => setAttendanceSearch(e.target.value)}
                        placeholder="Search employee name..."
                        className="w-full pl-10 pr-4 h-10 rounded-xl border border-gray-200 text-sm focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 outline-none"
                      />
                    </div>
                    <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-1.5 h-10">
                      <Calendar size={13} className="text-gray-400" />
                      <input
                        type="date"
                        value={attendanceDate}
                        onChange={e => setAttendanceDate(e.target.value)}
                        className="bg-transparent text-sm font-semibold text-gray-700 outline-none border-none cursor-pointer"
                      />
                    </div>
                  </div>

                  {/* Daily Table */}
                  {loading ? (
                    <div className="py-16 text-center text-gray-400">Loading attendance logs...</div>
                  ) : filteredAttendance.length === 0 ? (
                    <div className="py-14 text-center border border-dashed border-gray-200 rounded-2xl text-gray-400 text-sm">
                      No attendance records found for {new Date(attendanceDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}.
                    </div>
                  ) : (
                    <div className="overflow-x-auto -mx-6">
                      <table className="w-full text-left border-collapse min-w-[900px]">
                        <thead>
                          <tr className="border-b border-gray-100 text-[10px] font-bold uppercase tracking-wider text-gray-400 bg-gray-50/50">
                            <th className="py-3.5 px-6">Employee</th>
                            <th className="py-3.5 px-6">Employee ID</th>
                            <th className="py-3.5 px-6">Status</th>
                            <th className="py-3.5 px-6">Check-In</th>
                            <th className="py-3.5 px-6">Check-Out</th>
                            <th className="py-3.5 px-6">Total Hours</th>
                            <th className="py-3.5 px-6">Overtime</th>
                            <th className="py-3.5 px-6 text-center">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100/50 text-sm">
                          {filteredAttendance.map(log => {
                            const emp = employees.find(e => e.id === log.employee_id);
                            const cleanIn = log.clock_in ? (log.clock_in.match(/\d{2}:\d{2}/) ? log.clock_in.match(/\d{2}:\d{2}/)[0] : log.clock_in.substring(0, 5)) : '—';
                            const cleanOut = log.clock_out ? (log.clock_out.match(/\d{2}:\d{2}/) ? log.clock_out.match(/\d{2}:\d{2}/)[0] : log.clock_out.substring(0, 5)) : '—';
                            const hrs = getWorkingHours(log.clock_in, log.clock_out);
                            const ot = getOvertimeHours(hrs);
                            const late = isLate(log.clock_in);
                            const status = log.status === 'Present' && late ? 'Late' : log.status;
                            return (
                              <tr key={log.id} className="hover:bg-gray-50/30 transition-colors">
                                <td className="py-4 px-6">
                                  <div className="flex items-center gap-2.5">
                                    <div className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-700 font-bold flex items-center justify-center text-xs shrink-0">
                                      {emp?.first_name?.[0]}{emp?.last_name?.[0]}
                                    </div>
                                    <span className="font-semibold text-gray-900">
                                      {emp ? `${emp.first_name} ${emp.last_name}` : 'Unknown'}
                                    </span>
                                  </div>
                                </td>
                                <td className="py-4 px-6 text-[11px] text-gray-400 font-mono">{log.employee_id?.substring(0, 8)}...</td>
                                <td className="py-4 px-6">
                                  <span className={`text-[10px] font-bold px-2.5 py-0.5 border rounded-full uppercase ${
                                    status === 'Present' ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                                    : status === 'Late' ? 'bg-amber-50 text-amber-700 border-amber-100'
                                    : status === 'Absent' ? 'bg-red-50 text-red-700 border-red-100'
                                    : 'bg-sky-50 text-sky-700 border-sky-100'
                                  }`}>{status}</span>
                                </td>
                                <td className="py-4 px-6 font-mono text-xs text-gray-700">{cleanIn}</td>
                                <td className="py-4 px-6 font-mono text-xs text-gray-700">{cleanOut}</td>
                                <td className="py-4 px-6 font-semibold text-gray-900">{hrs > 0 ? `${hrs}h` : '—'}</td>
                                <td className="py-4 px-6">
                                  {ot > 0
                                    ? <span className="text-[10px] font-bold text-orange-600 bg-orange-50 border border-orange-100 px-2 py-0.5 rounded-full">+{ot}h OT</span>
                                    : <span className="text-gray-300 text-xs">—</span>
                                  }
                                </td>
                                <td className="py-4 px-6 text-center">
                                  <button onClick={() => handleDeleteAttendance(log.id)} className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors" title="Delete Log">
                                    <Trash2 size={13} />
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

              {/* ── Sub-tab 2: MONTHLY SUMMARY ── */}
              {attendanceSubTab === 'Monthly Summary' && (
                <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6 space-y-5">
                  {/* Month Picker */}
                  <div className="flex items-center gap-3">
                    <CalendarDays size={16} className="text-[#4F6AF7]" />
                    <input
                      type="month"
                      value={attendanceMonth}
                      onChange={e => setAttendanceMonth(e.target.value)}
                      className="h-10 px-3 border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500"
                    />
                    <span className="text-xs text-gray-400 font-medium">Showing attendance summary for all employees</span>
                  </div>

                  {loading ? (
                    <div className="py-16 text-center text-gray-400">Computing summaries...</div>
                  ) : employees.length === 0 ? (
                    <div className="py-14 text-center border border-dashed border-gray-200 rounded-2xl text-gray-400 text-sm">No employees found.</div>
                  ) : (
                    <div className="overflow-x-auto -mx-6">
                      <table className="w-full text-left border-collapse min-w-[900px]">
                        <thead>
                          <tr className="border-b border-gray-100 text-[10px] font-bold uppercase tracking-wider text-gray-400 bg-gray-50/50">
                            <th className="py-3.5 px-6">Employee</th>
                            <th className="py-3.5 px-6">Present</th>
                            <th className="py-3.5 px-6">Absent</th>
                            <th className="py-3.5 px-6">Leave Days</th>
                            <th className="py-3.5 px-6">Late Arrivals</th>
                            <th className="py-3.5 px-6">Total Hours</th>
                            <th className="py-3.5 px-6">Overtime</th>
                            <th className="py-3.5 px-6">Attendance %</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100/50 text-sm">
                          {employees.map(emp => {
                            const s = getEmpMonthlySummary(emp.id, attendanceMonth);
                            return (
                              <tr key={emp.id} className="hover:bg-gray-50/30 transition-colors">
                                <td className="py-4 px-6">
                                  <div className="flex items-center gap-2.5">
                                    <div className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-700 font-bold flex items-center justify-center text-xs shrink-0">
                                      {emp.first_name?.[0]}{emp.last_name?.[0]}
                                    </div>
                                    <div>
                                      <p className="font-semibold text-gray-900 leading-tight">{emp.first_name} {emp.last_name}</p>
                                      <p className="text-[10px] text-gray-400 mt-0.5">{emp.designation || '—'}</p>
                                    </div>
                                  </div>
                                </td>
                                <td className="py-4 px-6 font-bold text-emerald-600">{s.present}</td>
                                <td className="py-4 px-6 font-bold text-red-500">{s.absent}</td>
                                <td className="py-4 px-6 font-bold text-sky-600">{s.leaveDays}</td>
                                <td className="py-4 px-6">
                                  {s.late > 0
                                    ? <span className="text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-100 px-2 py-0.5 rounded-full">{s.late} late</span>
                                    : <span className="text-gray-300 text-xs">—</span>
                                  }
                                </td>
                                <td className="py-4 px-6 font-semibold text-gray-700">{s.totalHours > 0 ? `${s.totalHours}h` : '—'}</td>
                                <td className="py-4 px-6">
                                  {s.overtime > 0
                                    ? <span className="text-[10px] font-bold text-orange-600 bg-orange-50 border border-orange-100 px-2 py-0.5 rounded-full">+{s.overtime}h</span>
                                    : <span className="text-gray-300 text-xs">—</span>
                                  }
                                </td>
                                <td className="py-4 px-6">
                                  <div className="flex items-center gap-2">
                                    <div className="flex-1 bg-gray-100 rounded-full h-1.5 w-16">
                                      <div
                                        className={`h-1.5 rounded-full ${s.pct >= 85 ? 'bg-emerald-500' : s.pct >= 70 ? 'bg-amber-500' : 'bg-red-500'}`}
                                        style={{ width: `${s.pct}%` }}
                                      />
                                    </div>
                                    <span className={`text-xs font-bold ${s.pct >= 85 ? 'text-emerald-600' : s.pct >= 70 ? 'text-amber-600' : 'text-red-600'}`}>
                                      {s.pct}%
                                    </span>
                                  </div>
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

              {/* ── Sub-tab 3: CALENDAR VIEW ── */}
              {attendanceSubTab === 'Calendar' && (
                <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6 space-y-5">
                  {/* Controls */}
                  <div className="flex flex-col sm:flex-row gap-3 items-center">
                    <div className="flex items-center gap-2">
                      <CalendarDays size={16} className="text-[#4F6AF7]" />
                      <input
                        type="month"
                        value={attendanceMonth}
                        onChange={e => setAttendanceMonth(e.target.value)}
                        className="h-10 px-3 border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500"
                      />
                    </div>
                    <select
                      value={selectedEmpForAttendance}
                      onChange={e => setSelectedEmpForAttendance(e.target.value)}
                      className="h-10 px-3 border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 bg-white"
                    >
                      <option value="all">— Select Employee —</option>
                      {employees.map(emp => (
                        <option key={emp.id} value={emp.id}>{emp.first_name} {emp.last_name}</option>
                      ))}
                    </select>
                  </div>

                  {/* Legend */}
                  <div className="flex items-center gap-4 text-[10px] font-bold uppercase tracking-wider">
                    {[
                      { color: 'bg-emerald-500', label: 'Present' },
                      { color: 'bg-amber-400', label: 'Late' },
                      { color: 'bg-red-400', label: 'Absent' },
                      { color: 'bg-sky-400', label: 'On Leave' },
                      { color: 'bg-gray-200', label: 'Weekend' },
                    ].map(({ color, label }) => (
                      <div key={label} className="flex items-center gap-1.5">
                        <div className={`w-3 h-3 rounded-full ${color}`} />
                        <span className="text-gray-500">{label}</span>
                      </div>
                    ))}
                  </div>

                  {selectedEmpForAttendance === 'all' ? (
                    <div className="py-14 text-center border border-dashed border-gray-200 rounded-2xl text-gray-400 text-sm">
                      Please select an employee to view their attendance calendar.
                    </div>
                  ) : (() => {
                    const cells = getCalendarGrid(selectedEmpForAttendance, attendanceMonth);
                    const emp = employees.find(e => e.id === selectedEmpForAttendance);
                    const summary = getEmpMonthlySummary(selectedEmpForAttendance, attendanceMonth);
                    const monthLabel = new Date(attendanceMonth + '-01').toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
                    return (
                      <div className="space-y-4">
                        {/* Mini summary bar */}
                        {emp && (
                          <div className="flex items-center gap-4 flex-wrap bg-indigo-50/50 border border-indigo-100 rounded-xl p-3.5">
                            <div className="font-bold text-indigo-800 text-sm">{emp.first_name} {emp.last_name}</div>
                            <div className="flex gap-5 text-xs">
                              <span className="text-emerald-600 font-bold">✓ {summary.present} Present</span>
                              <span className="text-red-500 font-bold">✗ {summary.absent} Absent</span>
                              <span className="text-amber-600 font-bold">⏰ {summary.late} Late</span>
                              <span className="text-sky-600 font-bold">📅 {summary.leaveDays} Leave Days</span>
                              <span className={`font-extrabold ${summary.pct >= 85 ? 'text-emerald-600' : summary.pct >= 70 ? 'text-amber-600' : 'text-red-600'}`}>
                                {summary.pct}% Attendance
                              </span>
                            </div>
                          </div>
                        )}
                        {/* Calendar grid */}
                        <div>
                          <p className="text-xs font-bold text-gray-500 mb-3 uppercase tracking-wider">{monthLabel}</p>
                          {/* Day headers */}
                          <div className="grid grid-cols-7 gap-1 mb-1">
                            {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(d => (
                              <div key={d} className="text-center text-[10px] font-bold text-gray-400 uppercase py-1">{d}</div>
                            ))}
                          </div>
                          {/* Day cells */}
                          <div className="grid grid-cols-7 gap-1">
                            {cells.map((cell, idx) => {
                              if (!cell) return <div key={`empty-${idx}`} />;
                              let bg = 'bg-gray-50 border-gray-100';
                              let textColor = 'text-gray-400';
                              let label = '';
                              if (cell.isWeekend) {
                                bg = 'bg-gray-100 border-gray-200'; textColor = 'text-gray-400'; label = '';
                              } else if (cell.onLeave) {
                                bg = 'bg-sky-50 border-sky-200'; textColor = 'text-sky-700'; label = 'L';
                              } else if (cell.log) {
                                const late = isLate(cell.log.clock_in);
                                if (cell.log.status === 'Present' && late) {
                                  bg = 'bg-amber-50 border-amber-200'; textColor = 'text-amber-700'; label = 'P*';
                                } else if (cell.log.status === 'Present') {
                                  bg = 'bg-emerald-50 border-emerald-200'; textColor = 'text-emerald-700'; label = 'P';
                                } else if (cell.log.status === 'Late') {
                                  bg = 'bg-amber-50 border-amber-200'; textColor = 'text-amber-700'; label = 'L';
                                } else if (cell.log.status === 'Absent') {
                                  bg = 'bg-red-50 border-red-200'; textColor = 'text-red-600'; label = 'A';
                                } else {
                                  bg = 'bg-sky-50 border-sky-200'; textColor = 'text-sky-700'; label = 'HD';
                                }
                              }
                              return (
                                <div
                                  key={cell.dateStr}
                                  className={`border rounded-lg p-1.5 text-center min-h-[52px] flex flex-col items-center justify-center gap-0.5 ${bg}`}
                                  title={cell.dateStr}
                                >
                                  <span className="text-[10px] font-semibold text-gray-500">{cell.day}</span>
                                  {label && <span className={`text-[9px] font-extrabold uppercase ${textColor}`}>{label}</span>}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              )}
            </div>
          )}

          {/* ───────────────── VIEW 5.5: SALARY CONSOLE ─────────── */}
          {activeTab === 'Salary Console' && (
            <div className="space-y-6">
              {/* Salary Summary Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="glass-card p-6 rounded-2xl flex flex-col gap-3 bg-white border border-gray-100 shadow-sm">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                    <DollarSign size={18} />
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Gross Payroll</p>
                    <p className="text-2xl font-extrabold text-gray-900 mt-0.5">
                      ₹{employees.reduce((acc, e) => acc + (e.basic_salary || 0), 0).toLocaleString('en-IN')}
                    </p>
                  </div>
                </div>

                <div className="glass-card p-6 rounded-2xl flex flex-col gap-3 bg-white border border-gray-100 shadow-sm">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                    <Landmark size={18} />
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Total PF (12%)</p>
                    <p className="text-2xl font-extrabold text-gray-900 mt-0.5">
                      ₹{employees.reduce((acc, e) => acc + Math.round((e.basic_salary || 0) * 0.12), 0).toLocaleString('en-IN')}
                    </p>
                  </div>
                </div>

                <div className="glass-card p-6 rounded-2xl flex flex-col gap-3 bg-white border border-gray-100 shadow-sm">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <CheckCircle size={18} />
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Received Salary</p>
                    <p className="text-2xl font-extrabold text-emerald-600 mt-0.5">
                      ₹{employees.reduce((acc, e) => {
                        const isPaid = salaryStatusMap[e.id] === 'Received';
                        return isPaid ? acc + ((e.basic_salary || 0) - Math.round((e.basic_salary || 0) * 0.12)) : acc;
                      }, 0).toLocaleString('en-IN')}
                    </p>
                  </div>
                </div>

                <div className="glass-card p-6 rounded-2xl flex flex-col gap-3 bg-white border border-gray-100 shadow-sm">
                  <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
                    <AlertTriangle size={18} />
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Unreceived Salary</p>
                    <p className="text-2xl font-extrabold text-rose-600 mt-0.5">
                      ₹{employees.reduce((acc, e) => {
                        const isPaid = salaryStatusMap[e.id] === 'Received';
                        return !isPaid ? acc + ((e.basic_salary || 0) - Math.round((e.basic_salary || 0) * 0.12)) : acc;
                      }, 0).toLocaleString('en-IN')}
                    </p>
                  </div>
                </div>
              </div>

              {/* Salary Registry */}
              <div className="card p-6 bg-white border border-gray-100 rounded-2xl shadow-sm space-y-6">
                <div>
                  <h2 className="text-lg font-bold text-gray-900">Workforce Compensation Console</h2>
                  <p className="text-xs text-gray-450 mt-1">
                    Calculate monthly payouts, EPF deductions, and track disbursement status for all Story Seed staff.
                  </p>
                </div>

                {employees.length === 0 ? (
                  <div className="py-20 text-center text-gray-400 italic">No employee details found to process salaries.</div>
                ) : (
                  <div className="overflow-x-auto -mx-6">
                    <table className="w-full text-left border-collapse min-w-[900px]">
                      <thead>
                        <tr className="border-b border-gray-100 text-[10px] font-bold uppercase tracking-wider text-gray-400 bg-gray-50/50">
                          <th className="py-4 px-6">Employee Name</th>
                          <th className="py-4 px-6">Designation</th>
                          <th className="py-4 px-6">Basic Salary</th>
                          <th className="py-4 px-6">PF Deduction (12%)</th>
                          <th className="py-4 px-6">Net Payable Salary</th>
                          <th className="py-4 px-6">Payment Status</th>
                          <th className="py-4 px-6 text-center">Payout Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100/50 text-sm">
                        {employees.map(emp => {
                          const pf = Math.round((emp.basic_salary || 0) * 0.12);
                          const netPay = (emp.basic_salary || 0) - pf;
                          const isPaid = salaryStatusMap[emp.id] === 'Received';

                          return (
                            <tr key={emp.id} className="hover:bg-gray-50/30 transition-colors">
                              <td className="py-4 px-6 font-semibold text-gray-900">
                                {emp.first_name} {emp.last_name}
                              </td>
                              <td className="py-4 px-6 text-xs text-gray-500">
                                {emp.designation || 'Specialist'}
                              </td>
                              <td className="py-4 px-6 font-bold text-gray-800">
                                ₹{(emp.basic_salary || 0).toLocaleString('en-IN')}
                              </td>
                              <td className="py-4 px-6 font-medium text-gray-600">
                                ₹{pf.toLocaleString('en-IN')}
                              </td>
                              <td className="py-4 px-6 font-extrabold text-[#4F6AF7]">
                                ₹{netPay.toLocaleString('en-IN')}
                              </td>
                              <td className="py-4 px-6">
                                <span className={`text-[10px] font-bold px-2.5 py-0.5 border rounded-full uppercase ${
                                  isPaid 
                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-100' 
                                    : 'bg-rose-50 text-rose-700 border-rose-100'
                                }`}>
                                  {isPaid ? 'Received' : 'Unreceived'}
                                </span>
                              </td>
                              <td className="py-4 px-6 text-center">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setSalaryStatusMap(prev => ({
                                      ...prev,
                                      [emp.id]: isPaid ? 'Unreceived' : 'Received'
                                    }));
                                  }}
                                  className={`text-xs px-3.5 py-1.5 font-bold rounded-lg transition-all ${
                                    isPaid 
                                      ? 'border border-rose-200 text-rose-600 hover:bg-rose-50' 
                                      : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/10'
                                  }`}
                                >
                                  {isPaid ? 'Mark Unreceived' : 'Mark Received'}
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
            </div>
          )}

          {/* ───────────────── VIEW 6: REPORTS & LEAVES ─────────── */}
          {activeTab === 'Reports & Leaves' && (
            <div className="space-y-6">
              {/* Header + Action */}
              <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-bold text-gray-900">Reports & Leave Manager</h2>
                  <p className="text-xs text-gray-400 mt-1">All employee leave letters and requests — submitted via Employee Dashboard or HR console.</p>
                </div>
                <button onClick={() => {
                  setLeaveFormData({
                    employee_id: employees[0]?.id || '',
                    leave_type: 'Sick Leave',
                    from_date: new Date().toISOString().split('T')[0],
                    to_date: new Date().toISOString().split('T')[0],
                    total_days: 1,
                    reason: '',
                    status: 'Pending'
                  });
                  setShowAddLeaveModal(true);
                }} className="text-xs h-10 px-4 flex items-center gap-1.5 font-semibold bg-[#4F6AF7] hover:bg-[#3d58e5] text-white rounded-xl shadow-md shadow-[#4F6AF7]/20 transition-all">
                  <Plus size={16} /> Submit Leave Request
                </button>
              </div>

              {/* Auto-sync Info Banner */}
              <div className="flex items-start gap-3 bg-indigo-50 border border-indigo-100 rounded-2xl p-4">
                <CheckCircle size={16} className="text-[#4F6AF7] mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs font-bold text-indigo-800">Auto-synced with Employee Dashboard</p>
                  <p className="text-[11px] text-indigo-600 mt-0.5">
                    Any leave letter submitted by an employee from the Employee Dashboard automatically appears here in real-time via Supabase.
                  </p>
                </div>
              </div>

              {/* Summary Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  { label: 'Total Requests', value: leaveRequests.length, color: 'text-gray-900', bg: 'bg-white' },
                  { label: 'Pending', value: leaveRequests.filter(r => r.status?.toUpperCase() === 'PENDING').length, color: 'text-amber-600', bg: 'bg-amber-50' },
                  { label: 'Approved', value: leaveRequests.filter(r => r.status?.toUpperCase() === 'APPROVED').length, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                  { label: 'Rejected', value: leaveRequests.filter(r => r.status?.toUpperCase() === 'REJECTED').length, color: 'text-red-600', bg: 'bg-red-50' },
                ].map(({ label, value, color, bg }) => (
                  <div key={label} className={`${bg} border border-gray-100 rounded-xl p-4 shadow-sm`}>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{label}</p>
                    <p className={`text-2xl font-extrabold mt-1 ${color}`}>{loading ? '—' : value}</p>
                  </div>
                ))}
              </div>

              {/* Filters */}
              <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-5 flex flex-col sm:flex-row gap-3 items-center">
                <div className="relative flex-1 w-full">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
                  <input
                    type="text"
                    value={leaveSearchQuery}
                    onChange={e => setLeaveSearchQuery(e.target.value)}
                    placeholder="Search by employee name..."
                    className="w-full pl-10 pr-4 h-10 rounded-xl border border-gray-200 text-sm focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 outline-none"
                  />
                </div>
                <div className="flex gap-1 bg-gray-100 rounded-xl p-1 w-full sm:w-auto">
                  {['all', 'Pending', 'Approved', 'Rejected'].map(s => (
                    <button
                      key={s}
                      onClick={() => setLeaveStatusFilter(s)}
                      className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-all capitalize ${
                        leaveStatusFilter === s
                          ? 'bg-white text-[#4F6AF7] shadow-sm'
                          : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      {s === 'all' ? 'All' : s}
                    </button>
                  ))}
                </div>
              </div>

              {/* Leave Requests Table */}
              <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
                {loading ? (
                  <div className="py-20 text-center text-gray-400">Loading leave requests...</div>
                ) : (() => {
                  const filtered = leaveRequests.filter(req => {
                    const emp = employees.find(e => e.id === req.employee_id);
                    const name = emp ? `${emp.first_name} ${emp.last_name}`.toLowerCase() : '';
                    const matchesSearch = leaveSearchQuery === '' || name.includes(leaveSearchQuery.toLowerCase());
                    const matchesStatus = leaveStatusFilter === 'all' || req.status?.toUpperCase() === leaveStatusFilter?.toUpperCase();
                    return matchesSearch && matchesStatus;
                  });
                  if (filtered.length === 0) {
                    return (
                      <div className="py-16 text-center text-gray-400">
                        <ClipboardList size={32} className="mx-auto mb-2 text-gray-300" />
                        <p className="text-sm font-medium">No leave requests match the current filters.</p>
                      </div>
                    );
                  }
                  return (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse min-w-[900px]">
                        <thead>
                          <tr className="border-b border-gray-100 text-[10px] font-bold uppercase tracking-wider text-gray-400 bg-gray-50/50">
                            <th className="py-4 px-6">Employee</th>
                            <th className="py-4 px-6">Leave Type</th>
                            <th className="py-4 px-6">Duration</th>
                            <th className="py-4 px-6">Total Days</th>
                            <th className="py-4 px-6">Reason</th>
                            <th className="py-4 px-6">Status</th>
                            <th className="py-4 px-6 text-center">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100/50 text-sm">
                          {filtered.map(req => {
                            const emp = employees.find(e => e.id === req.employee_id);
                            const displayStatus = req.status?.toUpperCase() === 'APPROVED' ? 'Approved' : req.status?.toUpperCase() === 'PENDING' ? 'Pending' : 'Rejected';
                            return (
                              <tr key={req.id} className="hover:bg-gray-50/30 transition-colors">
                                <td className="py-4 px-6">
                                  <div className="flex items-center gap-2.5">
                                    <div className="w-8 h-8 rounded-full bg-violet-50 text-violet-700 font-bold flex items-center justify-center text-xs shrink-0">
                                      {emp?.first_name?.[0]}{emp?.last_name?.[0]}
                                    </div>
                                    <div>
                                      <p className="font-semibold text-gray-900 leading-tight">
                                        {emp ? `${emp.first_name} ${emp.last_name}` : 'Unknown Employee'}
                                      </p>
                                      <p className="text-[10px] text-gray-400 mt-0.5">{emp?.designation || '—'}</p>
                                    </div>
                                  </div>
                                </td>
                                <td className="py-4 px-6">
                                  <span className="text-xs font-semibold text-[#4F6AF7] bg-indigo-50 px-2 py-0.5 rounded-lg border border-indigo-100">{req.leave_type}</span>
                                </td>
                                <td className="py-4 px-6 text-xs text-gray-500">
                                  {new Date(req.from_date).toLocaleDateString()} to {new Date(req.to_date).toLocaleDateString()}
                                </td>
                                <td className="py-4 px-6 font-bold text-gray-800">{req.total_days} days</td>
                                <td className="py-4 px-6 text-xs text-gray-600 max-w-[180px] truncate">{req.reason || '—'}</td>
                                <td className="py-4 px-6">
                                  <span className={`text-[10px] font-bold px-2.5 py-0.5 border rounded-full uppercase ${
                                    req.status?.toUpperCase() === 'APPROVED'
                                      ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                                      : req.status?.toUpperCase() === 'PENDING'
                                      ? 'bg-amber-50 text-amber-700 border-amber-100'
                                      : 'bg-red-50 text-red-700 border-red-100'
                                  }`}>{displayStatus}</span>
                                </td>
                                <td className="py-4 px-6 text-center">
                                  <div className="flex items-center justify-center gap-1.5">
                                    <button
                                      onClick={() => setSelectedLeaveLetter(req)}
                                      className="p-1.5 rounded-lg text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                                      title="View Leave Letter"
                                    >
                                      <FileText size={14} />
                                    </button>
                                    {req.status?.toUpperCase() === 'PENDING' && (
                                      <>
                                        <button
                                          onClick={() => handleUpdateLeaveStatus(req.id, 'APPROVED')}
                                          className="px-2 py-1 text-[10px] font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg"
                                        >
                                          Approve
                                        </button>
                                        <button
                                          onClick={() => handleUpdateLeaveStatus(req.id, 'REJECTED')}
                                          className="px-2 py-1 text-[10px] font-bold bg-red-600 hover:bg-red-700 text-white rounded-lg"
                                        >
                                          Reject
                                        </button>
                                      </>
                                    )}
                                    <button onClick={() => handleDeleteLeave(req.id)} className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors" title="Delete">
                                      <Trash2 size={13} />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  );
                })()}
              </div>
            </div>
          )}

          {/* ───────────────── VIEW: DAILY FEEDS & ALERTS ─────────────────── */}
          {activeTab === 'Daily Feeds & Alerts' && (
            <div className="space-y-6 animate-fadeIn w-full">
              
              {/* Analytics Row */}
              {(() => {
                const totalSent = notifications.length;
                const readCount = notifications.filter(n => n.is_read).length;
                const unreadCount = notifications.filter(n => !n.is_read).length;
                const readRate = totalSent > 0 ? Math.round((readCount / totalSent) * 100) : 0;

                return (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 w-full">
                    <div className="bg-white border border-gray-250/70 rounded-3xl p-5 shadow-sm">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Total Sent</p>
                      <p className="text-2xl font-black text-gray-900 mt-1">{totalSent}</p>
                    </div>
                    <div className="bg-white border border-gray-250/70 rounded-3xl p-5 shadow-sm">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Delivered</p>
                      <p className="text-2xl font-black text-emerald-600 mt-1">{totalSent}</p>
                    </div>
                    <div className="bg-white border border-gray-250/70 rounded-3xl p-5 shadow-sm">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Read Alerts</p>
                      <p className="text-2xl font-black text-[#4F6AF7] mt-1">{readCount}</p>
                    </div>
                    <div className="bg-white border border-gray-250/70 rounded-3xl p-5 shadow-sm">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Read Rate</p>
                      <p className="text-2xl font-black text-indigo-600 mt-1">{readRate}%</p>
                    </div>
                  </div>
                );
              })()}

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start w-full">
                
                {/* Left Column (2/3 width) - Create Form and Daily Feed */}
                <div className="lg:col-span-2 space-y-6">
                  
                  {/* Create / Schedule Notification Form */}
                  <div className="bg-white border border-gray-250/70 rounded-3xl p-6 shadow-sm">
                    <div className="border-b border-gray-100 pb-4 mb-4">
                      <h2 className="text-base font-extrabold text-gray-900">Broadcast Notification / Announcement</h2>
                      <p className="text-xs text-gray-500 mt-1">Create and send notifications instantly or schedule them for later to employees.</p>
                    </div>

                    <form onSubmit={handleCreateNotification} className="space-y-4 text-xs font-semibold text-gray-700">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1.5">
                          <label className="text-[10px] font-bold text-gray-400 uppercase">Notification Title</label>
                          <input 
                            type="text"
                            value={newNotifTitle}
                            onChange={e => setNewNotifTitle(e.target.value)}
                            placeholder="Announcement title"
                            required
                            className="h-10 px-3 border border-gray-250/75 rounded-xl bg-white outline-none focus:border-[#4F6AF7]"
                          />
                        </div>
                        <div className="flex flex-col gap-1.5">
                          <label className="text-[10px] font-bold text-gray-400 uppercase">Recipient Target</label>
                          <select
                            value={newNotifRecipientType}
                            onChange={e => setNewNotifRecipientType(e.target.value)}
                            className="h-10 px-3 border border-gray-255/75 rounded-xl bg-white outline-none focus:border-[#4F6AF7]"
                          >
                            <option value="all">All Employees</option>
                            <option value="department">Specific Department</option>
                            <option value="team">Specific Team (Lead/Manager)</option>
                            <option value="employee">Individual Employee</option>
                          </select>
                        </div>
                      </div>

                      {/* Recipient conditional dropdowns */}
                      {newNotifRecipientType === 'department' && (
                        <div className="flex flex-col gap-1.5">
                          <label className="text-[10px] font-bold text-gray-400 uppercase">Select Target Department</label>
                          <select
                            value={newNotifTargetDept}
                            onChange={e => setNewNotifTargetDept(e.target.value)}
                            required
                            className="h-10 px-3 border border-gray-250/75 rounded-xl bg-white outline-none focus:border-[#4F6AF7]"
                          >
                            <option value="">-- Choose Department --</option>
                            {departments.map(d => (
                              <option key={d.id} value={d.id}>{d.name}</option>
                            ))}
                          </select>
                        </div>
                      )}

                      {newNotifRecipientType === 'team' && (
                        <div className="flex flex-col gap-1.5">
                          <label className="text-[10px] font-bold text-gray-400 uppercase">Select Target Team (Reporting Manager/Lead)</label>
                          <select
                            value={newNotifTargetTeam}
                            onChange={e => setNewNotifTargetTeam(e.target.value)}
                            required
                            className="h-10 px-3 border border-gray-255/75 rounded-xl bg-white outline-none focus:border-[#4F6AF7]"
                          >
                            <option value="">-- Choose Lead/Manager --</option>
                            {employees.filter(emp => emp.designation === 'Team Lead' || emp.designation === 'Manager').map(mgr => (
                              <option key={mgr.id} value={mgr.id}>{mgr.first_name} {mgr.last_name} ({mgr.designation})</option>
                            ))}
                          </select>
                        </div>
                      )}

                      {newNotifRecipientType === 'employee' && (
                        <div className="flex flex-col gap-1.5">
                          <label className="text-[10px] font-bold text-gray-400 uppercase">Select Target Employee</label>
                          <select
                            value={newNotifTargetEmp}
                            onChange={e => setNewNotifTargetEmp(e.target.value)}
                            required
                            className="h-10 px-3 border border-gray-250/75 rounded-xl bg-white outline-none focus:border-[#4F6AF7]"
                          >
                            <option value="">-- Choose Employee --</option>
                            {employees.map(emp => (
                              <option key={emp.id} value={emp.id}>{emp.first_name} {emp.last_name}</option>
                            ))}
                          </select>
                        </div>
                      )}

                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-bold text-gray-400 uppercase">Message Body</label>
                        <textarea 
                          value={newNotifBody}
                          onChange={e => setNewNotifBody(e.target.value)}
                          placeholder="Type notification description details here..."
                          rows="3"
                          required
                          className="p-3 border border-gray-250/75 rounded-xl font-sans outline-none focus:border-[#4F6AF7]"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="flex flex-col gap-1.5">
                          <label className="text-[10px] font-bold text-gray-400 uppercase">Priority Level</label>
                          <select
                            value={newNotifPriority}
                            onChange={e => setNewNotifPriority(e.target.value)}
                            className="h-10 px-3 border border-gray-250/75 rounded-xl bg-white outline-none focus:border-[#4F6AF7]"
                          >
                            <option value="Low">Low</option>
                            <option value="Medium">Medium</option>
                            <option value="High">High</option>
                          </select>
                        </div>
                        <div className="flex flex-col gap-1.5">
                          <label className="text-[10px] font-bold text-gray-400 uppercase">Attachment URL (Image/PDF)</label>
                          <input 
                            type="text"
                            value={newNotifAttachmentUrl}
                            onChange={e => setNewNotifAttachmentUrl(e.target.value)}
                            placeholder="https://example.com/file.pdf"
                            className="h-10 px-3 border border-gray-250/75 rounded-xl bg-white outline-none focus:border-[#4F6AF7]"
                          />
                        </div>
                        <div className="flex flex-col gap-1.5">
                          <label className="text-[10px] font-bold text-gray-400 uppercase">Attachment Display Name</label>
                          <input 
                            type="text"
                            value={newNotifAttachmentName}
                            onChange={e => setNewNotifAttachmentName(e.target.value)}
                            placeholder="file.pdf"
                            className="h-10 px-3 border border-gray-250/75 rounded-xl bg-white outline-none focus:border-[#4F6AF7]"
                          />
                        </div>
                      </div>

                      <div className="pt-2">
                        <button
                          type="submit"
                          disabled={sendingNotif}
                          className="w-full h-10 bg-[#4F6AF7] hover:bg-[#3d58e5] text-white font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5 disabled:opacity-50 text-[11px] sm:text-xs"
                        >
                          {sendingNotif ? 'Publishing...' : 'Send & Sync to Supabase & Employee Dashboard'}
                          <ArrowRight size={14} />
                        </button>
                      </div>
                    </form>
                  </div>

                  {/* Employee Daily Feeds */}
                  <div className="bg-white border border-gray-255/70 rounded-3xl p-6 shadow-sm">
                    <div className="border-b border-gray-100 pb-4 mb-6">
                      <h2 className="text-base font-extrabold text-gray-900">Employee Daily Sign-Out Feeds</h2>
                      <p className="text-xs text-gray-500 mt-1">Review work updates and daily feedback submitted by employees at sign-out.</p>
                    </div>

                    <div className="flow-root">
                      <ul className="-mb-8">
                        {dailyReports.map((report, idx) => {
                          const emp = employees.find(e => e.id === report.employee_id);
                          return (
                            <li key={report.id}>
                              <div className="relative pb-8">
                                {idx !== dailyReports.length - 1 && (
                                  <span className="absolute top-5 left-5 -ml-px h-full w-0.5 bg-gray-250" aria-hidden="true" />
                                )}
                                <div className="relative flex items-start space-x-3">
                                  <div className="relative shrink-0">
                                    {emp?.profile_picture ? (
                                      <img src={emp.profile_picture} alt="" className="h-10 w-10 rounded-xl object-cover border border-gray-250" />
                                    ) : (
                                      <div className="h-10 w-10 rounded-xl bg-[#4F6AF7] text-white flex items-center justify-center font-bold text-sm">
                                        {emp?.first_name?.[0] || 'E'}
                                      </div>
                                    )}
                                  </div>
                                  <div className="min-w-0 flex-1">
                                    <div>
                                      <div className="flex items-center justify-between gap-2">
                                        <div className="text-xs">
                                          <span className="font-bold text-gray-900">{emp ? `${emp.first_name} ${emp.last_name}` : 'Unknown Employee'}</span>
                                          <span className="text-gray-400 ml-1">({emp?.designation || 'Specialist'})</span>
                                        </div>
                                        <button 
                                          onClick={() => handleDeleteDailyReport(report.id)} 
                                          className="p-1 rounded-lg text-gray-400 hover:text-red-600 hover:bg-gray-100 transition-colors"
                                          title="Delete Daily Report permanently"
                                        >
                                          <Trash2 size={12} />
                                        </button>
                                      </div>
                                      <p className="text-[10px] text-gray-400 mt-0.5">
                                        Submitted on {new Date(report.submitted_at).toLocaleDateString()} at {new Date(report.submitted_at).toLocaleTimeString()}
                                      </p>
                                    </div>
                                    
                                    {report.tags && report.tags.length > 0 && (
                                      <div className="mt-2">
                                        <span className="text-[9px] font-bold px-2 py-0.5 bg-indigo-50 text-indigo-700 border border-indigo-100 rounded-full uppercase">
                                          {report.tags[0]}
                                        </span>
                                      </div>
                                    )}

                                    <div className="mt-2 text-xs text-gray-700 bg-gray-50/70 p-3 rounded-2xl border border-gray-100/50 leading-relaxed font-sans">
                                      {report.description}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </li>
                          );
                        })}

                        {dailyReports.length === 0 && (
                          <div className="text-center py-16 text-gray-400 italic text-xs">
                            No daily reports or feedbacks submitted by employees yet.
                          </div>
                        )}
                      </ul>
                    </div>
                  </div>

                </div>

                {/* Right Column (1/3 width) - Notification History & Campaigns Tracking */}
                <div className="lg:col-span-1 space-y-6">
                  <div className="bg-white border border-gray-250/70 rounded-3xl p-6 shadow-sm">
                    <div className="border-b border-gray-100 pb-4 mb-4">
                      <h2 className="text-base font-extrabold text-gray-900">Broadcast History & Analytics</h2>
                      <p className="text-xs text-gray-500 mt-1">Track delivery, read rate, priority, and link downloads in real-time.</p>
                    </div>

                    <div className="space-y-4">
                      {notificationCampaigns.map(campaign => {
                        const getPriorityClass = (priority) => {
                          switch (priority?.toLowerCase()) {
                            case 'high': return 'bg-red-50 text-red-700 border-red-100';
                            case 'medium': return 'bg-amber-50 text-amber-700 border-amber-100';
                            default: return 'bg-gray-50 text-gray-600 border-gray-150';
                          }
                        };

                        const campaignReadRate = campaign.total > 0 ? Math.round((campaign.read / campaign.total) * 100) : 0;

                        return (
                          <div key={campaign.id} className="p-4 border border-gray-200 rounded-2xl bg-white shadow-sm space-y-3">
                            <div className="flex items-start justify-between gap-2">
                              <div className="min-w-0 flex-1">
                                <h4 className="text-xs font-bold text-gray-900 truncate max-w-[150px]" title={campaign.title}>
                                  {campaign.title}
                                </h4>
                                <p className="text-[9px] text-gray-400">
                                  {campaign.created_at ? new Date(campaign.created_at).toLocaleString() : 'Just now'}
                                </p>
                              </div>
                              <div className="flex items-center gap-1 shrink-0">
                                <span className={`text-[8px] font-bold px-1.5 py-0.5 border rounded-md uppercase tracking-wider ${getPriorityClass(campaign.priority)}`}>
                                  {campaign.priority}
                                </span>
                                <button
                                  onClick={() => handleDeleteNotificationCampaign(campaign.title, campaign.body)}
                                  className="p-1 rounded-lg text-gray-400 hover:text-red-600 hover:bg-gray-100 transition-colors"
                                  title="Delete Broadcast Campaign permanently"
                                >
                                  <Trash2 size={11} />
                                </button>
                              </div>
                            </div>

                            <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed font-sans">
                              {campaign.body}
                            </p>

                            {/* Tracking Progress Bar */}
                            <div className="space-y-1 pt-1">
                              <div className="flex items-center justify-between text-[9px] font-bold text-gray-500">
                                <span>Read Rate</span>
                                <span>{campaign.read} / {campaign.total} ({campaignReadRate}%)</span>
                              </div>
                              <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                                <div 
                                  className="bg-[#4F6AF7] h-full rounded-full transition-all duration-500" 
                                  style={{ width: `${campaignReadRate}%` }}
                                />
                              </div>
                            </div>

                            {/* Scheduled and Attachment Badges */}
                            <div className="flex flex-wrap gap-1.5 pt-1">
                              {campaign.attachment_url && (
                                <span className="text-[8px] font-bold px-1.5 py-0.5 bg-indigo-50 border border-indigo-100 text-indigo-700 rounded-md flex items-center gap-1">
                                  <Paperclip size={8} /> Attachment
                                </span>
                              )}
                              {campaign.scheduled_for && (
                                <span className="text-[8px] font-bold px-1.5 py-0.5 bg-yellow-50 border border-yellow-100 text-yellow-700 rounded-md">
                                  Scheduled: {new Date(campaign.scheduled_for).toLocaleDateString()}
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* ───────────────── VIEW: TASK MONITOR ───────────────── */}
          {activeTab === 'Task Monitor' && (
            <div className="space-y-6 animate-fadeIn">
              {/* Summary Statistics */}
              <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                {[
                  { label: 'Total Tasks', count: tasks.length, color: '#4F6AF7', sub: 'All created tasks' },
                  { label: 'Completed', count: tasks.filter(t => t.status === 'Completed').length, color: '#059669', sub: 'Awaiting review' },
                  { label: 'Approved', count: tasks.filter(t => t.status === 'Approved').length, color: '#15803d', sub: 'Finalized' },
                  { label: 'Pending', count: tasks.filter(t => ['Pending', 'Accepted', 'In Progress', 'Paused', 'Revision Required'].includes(t.status)).length, color: '#d97706', sub: 'In progress' },
                  { label: 'Overdue', count: tasks.filter(t => {
                    const todayStr = new Date().toISOString().split('T')[0];
                    return t.due_date && t.due_date < todayStr && !['Completed','Approved','Cancelled'].includes(t.status);
                  }).length, color: '#dc2626', sub: 'Past due date' },
                ].map(s => (
                  <div key={s.label} className="bg-white border border-gray-100 p-5 rounded-2xl shadow-sm flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">{s.label}</span>
                      <p className="text-2xl font-extrabold mt-1 leading-none" style={{ color: s.color }}>{s.count}</p>
                    </div>
                    <span className="text-[9px] text-gray-400 mt-2 block">{s.sub}</span>
                  </div>
                ))}
              </div>

              {/* Department & Employee break-down cards */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Department-wise Tasks */}
                <div className="bg-white border border-gray-100 rounded-3xl shadow-sm p-6 space-y-4">
                  <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">🏢 Department Overview</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="border-b border-gray-100 text-[10px] font-bold text-gray-400 uppercase">
                          <th className="py-2.5 px-3">Department</th>
                          <th className="py-2.5 px-3 text-center">Assigned</th>
                          <th className="py-2.5 px-3 text-center">Completed</th>
                          <th className="py-2.5 px-3 text-center">Approved</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {departments.map(d => {
                          const deptTasks = tasks.filter(t => t.department_id === d.id);
                          return (
                            <tr key={d.id} className="hover:bg-gray-50/50">
                              <td className="py-2.5 px-3 font-semibold text-gray-800">{d.name}</td>
                              <td className="py-2.5 px-3 text-center font-bold text-gray-600">{deptTasks.length}</td>
                              <td className="py-2.5 px-3 text-center text-teal-600 font-bold">{deptTasks.filter(t=>t.status==='Completed').length}</td>
                              <td className="py-2.5 px-3 text-center text-green-600 font-bold">{deptTasks.filter(t=>t.status==='Approved').length}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Employee Performance Overview */}
                <div className="bg-white border border-gray-100 rounded-3xl shadow-sm p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">👤 Employee Performance</h3>
                    <span className="text-[10px] text-gray-400">Click a row to view tasks</span>
                  </div>
                  {/* Search */}
                  <div className="relative">
                    <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      value={performanceEmpSearch}
                      onChange={e => setPerformanceEmpSearch(e.target.value)}
                      placeholder="Search employee…"
                      className="w-full pl-8 pr-3 h-8 text-[11px] rounded-xl border border-gray-200 bg-gray-50 focus:outline-none focus:border-[#4F6AF7]"
                    />
                  </div>
                  <div className="overflow-x-auto max-h-[220px] overflow-y-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="border-b border-gray-100 text-[10px] font-bold text-gray-400 uppercase">
                          <th className="py-2.5 px-3">Employee</th>
                          <th className="py-2.5 px-3 text-center">Total</th>
                          <th className="py-2.5 px-3 text-center">Active</th>
                          <th className="py-2.5 px-3 text-center">Done</th>
                          <th className="py-2.5 px-3 text-center">Stage</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {employees
                          .filter(emp => {
                            const name = `${emp.first_name} ${emp.last_name}`.toLowerCase();
                            return !performanceEmpSearch || name.includes(performanceEmpSearch.toLowerCase());
                          })
                          .map(emp => {
                          const empAssigns = taskAssignments.filter(a => a.employee_id === emp.id);
                          const empTasks = tasks.filter(t => empAssigns.some(a => a.task_id === t.id));
                          const activeTasks = empTasks.filter(t => ['Accepted','In Progress','Paused','Revision Required'].includes(t.status));
                          const doneTasks = empTasks.filter(t => ['Completed','Approved'].includes(t.status));
                          // Determine stage label from most recent task
                          const latestTask = empTasks[0];
                          const stageLabel = latestTask ? latestTask.status : '—';
                          const stageColor = {
                            'Pending': 'bg-gray-50 text-gray-500',
                            'Accepted': 'bg-blue-50 text-blue-600',
                            'In Progress': 'bg-indigo-50 text-indigo-600',
                            'Paused': 'bg-amber-50 text-amber-600',
                            'Completed': 'bg-teal-50 text-teal-600',
                            'Approved': 'bg-green-50 text-green-600',
                            'Rejected': 'bg-rose-50 text-rose-600',
                            'Cancelled': 'bg-gray-100 text-gray-400',
                          }[stageLabel] || 'bg-gray-50 text-gray-500';
                          return (
                            <tr
                              key={emp.id}
                              className="hover:bg-indigo-50/40 cursor-pointer transition-colors"
                              onClick={() => setSelectedPerformanceEmp(emp)}
                            >
                              <td className="py-2.5 px-3 font-semibold text-gray-800">{emp.first_name} {emp.last_name}</td>
                              <td className="py-2.5 px-3 text-center font-bold text-gray-600">{empTasks.length}</td>
                              <td className="py-2.5 px-3 text-center font-bold text-[#4F6AF7]">{activeTasks.length}</td>
                              <td className="py-2.5 px-3 text-center text-green-600 font-bold">{doneTasks.length}</td>
                              <td className="py-2.5 px-3">
                                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${stageColor}`}>{stageLabel}</span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

              </div>

              {/* Full Task Grid Monitor */}
              <div className="bg-white border border-gray-100 rounded-3xl shadow-sm p-6 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-4">
                  <div>
                    <h3 className="text-sm font-bold text-gray-900">Task Log Directory</h3>
                    <p className="text-[11px] text-gray-400 mt-0.5">Filter and review details of all tasks generated in SSS system</p>
                  </div>
                  <button onClick={() => {
                    const rows = [['Task ID','Title','Project','Priority','Status','Due Date','Completion']];
                    tasks.forEach(t => rows.push([t.id.slice(0,8).toUpperCase(), t.task_title, t.project_name||'—', t.priority, t.status, t.due_date||'—', `${t.completion_pct||0}%`]));
                    const csv = rows.map(r => r.join(',')).join('\n');
                    const a = document.createElement('a'); a.href = `data:text/csv;charset=utf-8,${encodeURIComponent(csv)}`; a.download = 'hr_tasks_report.csv'; a.click();
                  }} className="h-8 px-4 bg-indigo-50 hover:bg-indigo-100 text-[#4F6AF7] text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all">
                    <Download size={12} /> Export CSV
                  </button>
                </div>

                {/* Filters */}
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 bg-gray-50/50 p-3.5 rounded-2xl border border-gray-100">
                  <div className="relative">
                    <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input value={taskFilterSearch} onChange={e => setTaskFilterSearch(e.target.value)} placeholder="Search tasks…" className="w-full pl-8 pr-3 h-8 text-[11px] rounded-xl border border-gray-200 bg-white focus:outline-none" />
                  </div>
                  <select value={taskFilterStatus} onChange={e => setTaskFilterStatus(e.target.value)} className="h-8 px-2 text-[11px] rounded-xl border border-gray-200 bg-white">
                    <option value="all">All Status</option>
                    {['Pending','Accepted','In Progress','Paused','Completed','Approved','Rejected','Revision Required','Cancelled'].map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                  <select value={taskFilterDepartment} onChange={e => setTaskFilterDepartment(e.target.value)} className="h-8 px-2 text-[11px] rounded-xl border border-gray-200 bg-white">
                    <option value="all">All Departments</option>
                    {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                  </select>
                  <select value={taskFilterEmployee} onChange={e => setTaskFilterEmployee(e.target.value)} className="h-8 px-2 text-[11px] rounded-xl border border-gray-200 bg-white">
                    <option value="all">All Employees</option>
                    {employees.map(e => <option key={e.id} value={e.id}>{e.first_name} {e.last_name}</option>)}
                  </select>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-gray-100 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                        <th className="py-3 px-4">Task ID</th>
                        <th className="py-3 px-4">Title</th>
                        <th className="py-3 px-4">Assignee</th>
                        <th className="py-3 px-4">Priority</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4">Due Date</th>
                        <th className="py-3 px-4">Progress</th>
                        <th className="py-3 px-4 text-center">Feedback</th>
                        <th className="py-3 px-4 text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {tasks.filter(t => {
                        const matchSearch = !taskFilterSearch || t.task_title.toLowerCase().includes(taskFilterSearch.toLowerCase());
                        const matchStatus = taskFilterStatus === 'all' || t.status === taskFilterStatus;
                        const matchDept = taskFilterDepartment === 'all' || t.department_id === taskFilterDepartment;
                        const assigns = taskAssignments.filter(a => a.task_id === t.id).map(a => a.employee_id);
                        const matchEmp = taskFilterEmployee === 'all' || assigns.includes(taskFilterEmployee);
                        return matchSearch && matchStatus && matchDept && matchEmp;
                      }).map(t => {
                        const assigns = taskAssignments.filter(a => a.task_id === t.id);
                        const names = assigns.map(a => {
                          const e = employees.find(emp => emp.id === a.employee_id);
                          return e ? `${e.first_name} ${e.last_name}` : '';
                        }).filter(Boolean).join(', ') || 'Unassigned';

                        const fb = taskFeedback.find(f => f.task_id === t.id);
                        const rev = taskReviews.find(r => r.task_id === t.id);

                        return (
                          <tr key={t.id} className="hover:bg-gray-50/50">
                            <td className="py-3 px-4 font-mono font-bold text-[10px] text-gray-400">{t.id.slice(0,8).toUpperCase()}</td>
                            <td className="py-3 px-4 font-semibold text-gray-800">{t.task_title}</td>
                            <td className="py-3 px-4 text-gray-500 max-w-[130px] truncate">{names}</td>
                            <td className="py-3 px-4">
                              <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                                t.priority === 'Critical' ? 'bg-red-50 text-red-700'
                                : t.priority === 'High' ? 'bg-orange-50 text-orange-700'
                                : t.priority === 'Medium' ? 'bg-amber-50 text-amber-700'
                                : 'bg-green-50 text-green-700'
                              }`}>{t.priority}</span>
                            </td>
                            <td className="py-3 px-4">
                              <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-gray-50 border text-gray-600">{t.status}</span>
                            </td>
                            <td className="py-3 px-4 text-gray-500">{t.due_date || '—'}</td>
                            <td className="py-3 px-4 font-bold text-gray-700">{t.completion_pct || 0}%</td>
                            <td className="py-3 px-4 text-center">
                              {fb ? (
                                <button onClick={() => {
                                  let msg = `Work Summary:\n${fb.work_summary || '—'}\n\nChallenges:\n${fb.challenges || '—'}\n\nLessons Learned:\n${fb.lessons_learned || '—'}`;
                                  if (rev) {
                                    msg += `\n\n-----------------\nManager Decision: ${rev.decision}\nRating: ${rev.employee_rating} Stars\nComments: ${rev.manager_comments || '—'}`;
                                  }
                                  alert(msg);
                                }} className="text-[#4F6AF7] hover:underline font-bold text-[10px]">View Feedback</button>
                              ) : <span className="text-gray-300">—</span>}
                            </td>
                            <td className="py-3 px-4 text-center">
                              <button onClick={async () => {
                                if (window.confirm('Are you sure you want to permanently delete this task and all associated logs, reports, and assignments? This cannot be undone.')) {
                                  try {
                                    // Cascade delete child records first
                                    await supabase.from('sss_task_assignments').delete().eq('task_id', t.id);
                                    await supabase.from('sss_task_feedback').delete().eq('task_id', t.id);
                                    await supabase.from('sss_task_reviews').delete().eq('task_id', t.id);
                                    await supabase.from('sss_task_progress').delete().eq('task_id', t.id);
                                    
                                    const { error } = await supabase.from('sss_tasks').delete().eq('id', t.id);
                                    if (error) throw error;
                                    alert('Task deleted successfully!');
                                    fetchData();
                                  } catch (err) {
                                    alert('Failed to delete task: ' + err.message);
                                  }
                                }
                              }} className="text-red-500 hover:text-red-700 font-bold text-[10px] flex items-center justify-center gap-1 mx-auto">
                                <Trash2 size={12} /> Delete
                              </button>
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

          {/* ───────────────── VIEW 7: SETTINGS ─────────────────── */}
          {activeTab === 'Settings' && (
            <div className="card p-8 bg-white border border-gray-100 rounded-2xl shadow-sm space-y-6">
              <h2 className="text-lg font-bold text-gray-900">Branding & System Configurations</h2>
              <p className="text-sm text-gray-400">Configure Story Seed settings and verify local deployment connection strings.</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-gray-100">
                <div className="flex flex-col gap-2">
                  <span className="text-xs font-bold text-gray-400 uppercase">Tenant Name</span>
                  <span className="text-sm font-semibold text-gray-800">{company?.name || 'Story Seed Studio'}</span>
                </div>
                <div className="flex flex-col gap-2">
                  <span className="text-xs font-bold text-gray-400 uppercase">Support Email</span>
                  <span className="text-sm font-semibold text-gray-800">{company?.email || 'admin@storyseed.com'}</span>
                </div>
                <div className="flex flex-col gap-2">
                  <span className="text-xs font-bold text-gray-400 uppercase">Plan Limit</span>
                  <span className="text-sm font-semibold text-gray-800">{company?.employee_limit || 50} employees</span>
                </div>
                <div className="flex flex-col gap-2">
                  <span className="text-xs font-bold text-gray-400 uppercase">Project Reference ID</span>
                  <span className="text-sm font-semibold text-gray-800">nchqkbabvzhedzyomefu</span>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* ── MODALS ─────────────────────────────────────────────── */}
      
      {/* 0. Employee Task Performance Detail Card (HR Task Monitor) */}
      {selectedPerformanceEmp && (() => {
        const emp = selectedPerformanceEmp;
        const meta = getMetadata(emp);
        const dept = departments.find(d => d.id === emp.department_id);
        const empAssigns = taskAssignments.filter(a => a.employee_id === emp.id);
        const empTasks = tasks.filter(t => empAssigns.some(a => a.task_id === t.id));
        const empProgress = taskProgress.filter(p => p.employee_id === emp.id);
        const empFeedback = taskFeedback.filter(f => f.employee_id === emp.id);
        const acceptanceRecords = empProgress.filter(p => p.note === 'Task Accepted');
        const totalTasks = empTasks.length;
        const completedTasks = empTasks.filter(t => ['Completed','Approved'].includes(t.status)).length;
        const activeTasks = empTasks.filter(t => ['Accepted','In Progress','Paused','Revision Required'].includes(t.status)).length;
        const performanceScore = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
        
        const pColors = {
          Low: 'bg-green-50 text-green-700 border-green-100',
          Medium: 'bg-amber-50 text-amber-700 border-amber-100',
          High: 'bg-orange-50 text-orange-700 border-orange-100',
          Critical: 'bg-red-50 text-red-700 border-red-100',
        };
        const sColors = {
          'Pending': 'bg-gray-50 text-gray-600',
          'Accepted': 'bg-blue-50 text-blue-700',
          'In Progress': 'bg-indigo-50 text-indigo-700',
          'Paused': 'bg-amber-50 text-amber-700',
          'Completed': 'bg-teal-50 text-teal-700',
          'Approved': 'bg-green-50 text-green-700',
          'Rejected': 'bg-rose-50 text-rose-700',
          'Cancelled': 'bg-gray-100 text-gray-400',
        };

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={() => setSelectedPerformanceEmp(null)}>
            <div className="bg-white w-full max-w-[700px] max-h-[88vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden" onClick={e => e.stopPropagation()}>
              {/* Header */}
              <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-gradient-to-r from-[#4F6AF7]/5 to-indigo-50/30">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 bg-[#4F6AF7]/10 rounded-2xl flex items-center justify-center">
                    <span className="text-lg font-extrabold text-[#4F6AF7]">{emp.first_name?.[0]}{emp.last_name?.[0]}</span>
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-gray-900">{emp.first_name} {emp.last_name}</h3>
                    <p className="text-[11px] text-gray-400">{emp.designation || 'Employee'} · {dept?.name || '—'}</p>
                  </div>
                </div>
                <button onClick={() => setSelectedPerformanceEmp(null)} className="p-2 rounded-xl text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors"><X size={16} /></button>
              </div>

              {/* Stats row */}
              <div className="px-6 py-4 grid grid-cols-4 gap-3 border-b border-gray-100 bg-gray-50/50">
                {[
                  { label: 'Total', value: totalTasks, color: '#4F6AF7' },
                  { label: 'Active', value: activeTasks, color: '#f59e0b' },
                  { label: 'Done', value: completedTasks, color: '#10b981' },
                  { label: 'Score', value: `${performanceScore}%`, color: performanceScore >= 75 ? '#10b981' : performanceScore >= 40 ? '#f59e0b' : '#ef4444' },
                ].map(s => (
                  <div key={s.label} className="text-center">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">{s.label}</p>
                    <p className="text-xl font-extrabold mt-0.5" style={{ color: s.color }}>{s.value}</p>
                  </div>
                ))}
              </div>

              {/* Performance level */}
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

              {/* Task list */}
              <div className="flex-1 overflow-y-auto p-6 space-y-3">
                <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-3">Assigned Tasks ({empTasks.length})</h4>
                {empTasks.length === 0 ? (
                  <div className="text-center py-10 text-gray-300 italic text-xs">No tasks assigned yet</div>
                ) : empTasks.map(task => {
                  const accepted = acceptanceRecords.find(p => p.task_id === task.id);
                  const fb = empFeedback.find(f => f.task_id === task.id);
                  const todayStr = new Date().toISOString().split('T')[0];
                  const isOverdue = task.due_date && task.due_date < todayStr && !['Completed','Approved','Cancelled'].includes(task.status);
                  return (
                    <div key={task.id} className="border border-gray-200 rounded-2xl p-4 space-y-2 hover:border-[#4F6AF7]/30 transition-colors">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-gray-900 text-xs truncate">{task.task_title}</p>
                          {task.project_name && <p className="text-[10px] text-indigo-600 font-semibold">{task.project_name}</p>}
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <span className={`text-[9px] font-bold px-1.5 py-0.5 border rounded-full ${pColors[task.priority] || pColors.Medium}`}>{task.priority}</span>
                          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${sColors[task.status] || sColors.Pending}`}>{task.status}</span>
                        </div>
                      </div>
                      
                      {/* Progress bar */}
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-gray-100 h-1.5 rounded-full overflow-hidden">
                          <div className="h-full bg-[#4F6AF7] rounded-full transition-all" style={{ width: `${task.completion_pct || 0}%` }} />
                        </div>
                        <span className="text-[10px] font-bold text-gray-500">{task.completion_pct || 0}%</span>
                      </div>

                      {/* Meta row */}
                      <div className="flex items-center justify-between text-[9px] text-gray-400">
                        <span>📅 Due: <span className={`font-semibold ${isOverdue ? 'text-red-500' : 'text-gray-600'}`}>{task.due_date || '—'}{isOverdue ? ' ⚠️' : ''}</span></span>
                        {accepted && <span className="text-emerald-600 font-bold">✓ Accepted {new Date(accepted.created_at).toLocaleDateString('en-IN', { day:'2-digit', month:'short' })}</span>}
                      </div>

                      {/* Completion feedback summary */}
                      {fb && (
                        <div className="bg-teal-50 border border-teal-100 rounded-xl p-2.5 mt-1">
                          <p className="text-[9px] font-bold text-teal-700 uppercase tracking-wide mb-1">Completion Report</p>
                          <p className="text-[10px] text-teal-800 line-clamp-2">{fb.work_summary || 'No summary provided.'}</p>
                          {fb.hours_worked && <span className="text-[9px] text-teal-600 font-semibold">⏱ {fb.hours_worked}h logged</span>}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        );
      })()}

      {/* 1. Modal: Add Employee / Manager / Team Lead */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-slideUp">
            <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <div className="flex items-center gap-2">
                <UserPlus className="text-[#4F6AF7]" size={20} />
                <h3 className="text-base font-bold text-gray-900 capitalize">Add New {rolePreset}</h3>
              </div>
              <button onClick={() => setShowAddModal(false)} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-950 hover:bg-gray-100 transition-colors">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddEmployee} className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
              <div className="space-y-4">
                <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Briefcase size={12} /> Personal & Job Details
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-gray-500 uppercase">First Name *</label>
                    <input type="text" name="first_name" value={formData.first_name} onChange={handleFormChange} required className="input" placeholder="First name" />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-gray-500 uppercase">Last Name *</label>
                    <input type="text" name="last_name" value={formData.last_name} onChange={handleFormChange} required className="input" placeholder="Last name" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-gray-500 uppercase">Contact Phone</label>
                    <input type="text" name="phone" value={formData.phone} onChange={handleFormChange} className="input" placeholder="Phone number" />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-gray-500 uppercase">Date of Joining</label>
                    <input type="date" name="joining_date" value={formData.joining_date} onChange={handleFormChange} className="input" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-gray-500 uppercase">Department *</label>
                    <select name="department_id" value={formData.department_id} onChange={handleFormChange} className="input">
                      {departments.map(dept => (
                        <option key={dept.id} value={dept.id}>{dept.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-gray-500 uppercase">Designation *</label>
                    <input type="text" name="designation" value={formData.designation} onChange={handleFormChange} required className="input" placeholder="Designation" />
                  </div>
                </div>
              </div>

              {/* Custom Metadata for Manager / TL */}
              {(rolePreset === 'manager' || rolePreset === 'tl') && (
                <div className="space-y-4 pt-4 border-t border-gray-100">
                  <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Award size={12} /> {rolePreset === 'manager' ? 'Manager details' : 'Team Lead details'}
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-gray-500 uppercase">Email ID</label>
                      <input type="email" name="email" value={customFields.email} onChange={handleCustomFieldChange} className="input" placeholder="Email" />
                    </div>
                    {rolePreset === 'manager' && (
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-gray-500 uppercase">Performance Status</label>
                        <select name="performance_status" value={customFields.performance_status} onChange={handleCustomFieldChange} className="input">
                          <option value="Excellent">Excellent</option>
                          <option value="Good">Good</option>
                          <option value="Satisfactory">Satisfactory</option>
                          <option value="Needs Improvement">Needs Improvement</option>
                        </select>
                      </div>
                    )}
                    {rolePreset === 'tl' && (
                      <>
                        <div className="flex flex-col gap-1.5">
                          <label className="text-xs font-bold text-gray-500 uppercase">Project Name</label>
                          <input type="text" name="project_name" value={customFields.project_name} onChange={handleCustomFieldChange} className="input" placeholder="Project assignment" />
                        </div>
                        <div className="flex flex-col gap-1.5">
                          <label className="text-xs font-bold text-gray-500 uppercase">Performance Rating (1-5)</label>
                          <input type="number" step="0.1" min="1" max="5" name="performance_rating" value={customFields.performance_rating} onChange={handleCustomFieldChange} className="input" />
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}

              <div className="space-y-4 pt-4 border-t border-gray-100">
                <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                  <DollarSign size={12} /> Salary & Banking Details
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-gray-500 uppercase">Basic Monthly Salary (₹) *</label>
                    <input type="number" name="basic_salary" value={formData.basic_salary} onChange={handleFormChange} required className="input" placeholder="Monthly salary" />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-gray-500 uppercase">Bank Account Number</label>
                    <input type="text" name="bank_account" value={formData.bank_account} onChange={handleFormChange} className="input" placeholder="Account number" />
                  </div>
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-gray-100">
                <button type="button" onClick={() => setShowAddModal(false)} className="h-11 px-5 text-xs font-semibold border border-gray-200 text-gray-600 hover:bg-gray-50 rounded-xl transition-all">Cancel</button>
                <button type="submit" className="h-11 px-5 text-xs font-semibold bg-[#4F6AF7] hover:bg-[#3d58e5] text-white rounded-xl shadow-md shadow-[#4F6AF7]/20 transition-all">Save Record</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. Modal: Edit Employee */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-slideUp">
            <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <div className="flex items-center gap-2">
                <Edit className="text-[#4F6AF7]" size={20} />
                <h3 className="text-base font-bold text-gray-900">Edit Details</h3>
              </div>
              <button onClick={() => setShowEditModal(false)} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-950 hover:bg-gray-100 transition-colors">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleEditEmployee} className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
              <div className="space-y-4">
                <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Briefcase size={12} /> Personal & Job Details
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-gray-500 uppercase">First Name *</label>
                    <input type="text" name="first_name" value={formData.first_name} onChange={handleFormChange} required className="input" />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-gray-500 uppercase">Last Name *</label>
                    <input type="text" name="last_name" value={formData.last_name} onChange={handleFormChange} required className="input" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-gray-500 uppercase">Contact Phone</label>
                    <input type="text" name="phone" value={formData.phone} onChange={handleFormChange} className="input" />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-gray-500 uppercase">Date of Joining</label>
                    <input type="date" name="joining_date" value={formData.joining_date} onChange={handleFormChange} className="input" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-gray-500 uppercase">Department *</label>
                    <select name="department_id" value={formData.department_id} onChange={handleFormChange} className="input">
                      {departments.map(dept => (
                        <option key={dept.id} value={dept.id}>{dept.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-gray-500 uppercase">Designation *</label>
                    <input type="text" name="designation" value={formData.designation} onChange={handleFormChange} required className="input" />
                  </div>
                </div>
              </div>

              {/* Custom fields */}
              {(rolePreset === 'manager' || rolePreset === 'tl') && (
                <div className="space-y-4 pt-4 border-t border-gray-100">
                  <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Award size={12} /> Custom Details
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-gray-500 uppercase">Email ID</label>
                      <input type="email" name="email" value={customFields.email} onChange={handleCustomFieldChange} className="input" />
                    </div>
                    {rolePreset === 'manager' && (
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-gray-500 uppercase">Performance Status</label>
                        <select name="performance_status" value={customFields.performance_status} onChange={handleCustomFieldChange} className="input">
                          <option value="Excellent">Excellent</option>
                          <option value="Good">Good</option>
                          <option value="Satisfactory">Satisfactory</option>
                          <option value="Needs Improvement">Needs Improvement</option>
                        </select>
                      </div>
                    )}
                    {rolePreset === 'tl' && (
                      <>
                        <div className="flex flex-col gap-1.5">
                          <label className="text-xs font-bold text-gray-500 uppercase">Project Name</label>
                          <input type="text" name="project_name" value={customFields.project_name} onChange={handleCustomFieldChange} className="input" />
                        </div>
                        <div className="flex flex-col gap-1.5">
                          <label className="text-xs font-bold text-gray-500 uppercase">Performance Rating (1-5)</label>
                          <input type="number" step="0.1" min="1" max="5" name="performance_rating" value={customFields.performance_rating} onChange={handleCustomFieldChange} className="input" />
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}

              <div className="space-y-4 pt-4 border-t border-gray-100">
                <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                  <DollarSign size={12} /> Salary & Banking Details
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-gray-500 uppercase">Basic Monthly Salary (₹) *</label>
                    <input type="number" name="basic_salary" value={formData.basic_salary} onChange={handleFormChange} required className="input" />
                  </div>
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-gray-100">
                <button type="button" onClick={() => setShowEditModal(false)} className="h-11 px-5 text-xs font-semibold border border-gray-200 text-gray-600 hover:bg-gray-50 rounded-xl transition-all">Cancel</button>
                <button type="submit" className="h-11 px-5 text-xs font-semibold bg-[#4F6AF7] hover:bg-[#3d58e5] text-white rounded-xl shadow-md shadow-[#4F6AF7]/20 transition-all">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. Modal: Add Attendance Log */}
      {showAddAttendanceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md flex flex-col overflow-hidden animate-slideUp">
            <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <div className="flex items-center gap-2">
                <Clock className="text-[#4F6AF7]" size={20} />
                <h3 className="text-base font-bold text-gray-900">Add Attendance Log</h3>
              </div>
              <button onClick={() => setShowAddAttendanceModal(false)} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-950 hover:bg-gray-100 transition-colors">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddAttendance} className="p-6 space-y-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-gray-500 uppercase">Select Employee *</label>
                <select 
                  value={attendanceFormData.employee_id} 
                  onChange={e => setAttendanceFormData(prev => ({ ...prev, employee_id: e.target.value }))}
                  required
                  className="input"
                >
                  <option value="">-- Choose Employee --</option>
                  {employees.map(emp => (
                    <option key={emp.id} value={emp.id}>{emp.first_name} {emp.last_name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-gray-500 uppercase">Log Date</label>
                  <input 
                    type="date" 
                    value={attendanceFormData.date} 
                    onChange={e => setAttendanceFormData(prev => ({ ...prev, date: e.target.value }))} 
                    required 
                    className="input" 
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-gray-500 uppercase">Status</label>
                  <select 
                    value={attendanceFormData.status} 
                    onChange={e => setAttendanceFormData(prev => ({ ...prev, status: e.target.value }))} 
                    className="input"
                  >
                    <option value="Present">Present</option>
                    <option value="Late">Late</option>
                    <option value="Absent">Absent</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-gray-500 uppercase">Clock In</label>
                  <input 
                    type="time" 
                    value={attendanceFormData.clock_in} 
                    onChange={e => setAttendanceFormData(prev => ({ ...prev, clock_in: e.target.value }))} 
                    className="input" 
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-gray-500 uppercase">Clock Out</label>
                  <input 
                    type="time" 
                    value={attendanceFormData.clock_out} 
                    onChange={e => setAttendanceFormData(prev => ({ ...prev, clock_out: e.target.value }))} 
                    className="input" 
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-gray-100">
                <button type="button" onClick={() => setShowAddAttendanceModal(false)} className="h-11 px-5 text-xs font-semibold border border-gray-200 text-gray-600 hover:bg-gray-50 rounded-xl transition-all">Cancel</button>
                <button type="submit" className="h-11 px-5 text-xs font-semibold bg-[#4F6AF7] hover:bg-[#3d58e5] text-white rounded-xl shadow-md shadow-[#4F6AF7]/20 transition-all">Save Log</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4. Modal: Add Leave Request */}
      {showAddLeaveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md flex flex-col overflow-hidden animate-slideUp">
            <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <div className="flex items-center gap-2">
                <ClipboardList className="text-[#4F6AF7]" size={20} />
                <h3 className="text-base font-bold text-gray-900">Submit Leave Request</h3>
              </div>
              <button onClick={() => setShowAddLeaveModal(false)} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-950 hover:bg-gray-100 transition-colors">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddLeave} className="p-6 space-y-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-gray-500 uppercase">Select Employee *</label>
                <select 
                  value={leaveFormData.employee_id} 
                  onChange={e => setLeaveFormData(prev => ({ ...prev, employee_id: e.target.value }))}
                  required
                  className="input"
                >
                  <option value="">-- Choose Employee --</option>
                  {employees.map(emp => (
                    <option key={emp.id} value={emp.id}>{emp.first_name} {emp.last_name}</option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-gray-500 uppercase">Leave Type</label>
                <select 
                  value={leaveFormData.leave_type} 
                  onChange={e => setLeaveFormData(prev => ({ ...prev, leave_type: e.target.value }))} 
                  className="input"
                >
                  <option value="Sick Leave">Sick Leave</option>
                  <option value="Casual Leave">Casual Leave</option>
                  <option value="Maternity Leave">Maternity Leave</option>
                  <option value="Paternity Leave">Paternity Leave</option>
                  <option value="Unpaid Leave">Unpaid Leave</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-gray-500 uppercase">From Date</label>
                  <input 
                    type="date" 
                    value={leaveFormData.from_date} 
                    onChange={e => setLeaveFormData(prev => ({ ...prev, from_date: e.target.value }))} 
                    required 
                    className="input" 
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-gray-500 uppercase">To Date</label>
                  <input 
                    type="date" 
                    value={leaveFormData.to_date} 
                    onChange={e => setLeaveFormData(prev => ({ ...prev, to_date: e.target.value }))} 
                    required 
                    className="input" 
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-gray-500 uppercase">Total Days</label>
                  <input 
                    type="number" 
                    value={leaveFormData.total_days} 
                    onChange={e => setLeaveFormData(prev => ({ ...prev, total_days: e.target.value }))} 
                    required 
                    className="input" 
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-gray-500 uppercase">Status</label>
                  <select 
                    value={leaveFormData.status} 
                    onChange={e => setLeaveFormData(prev => ({ ...prev, status: e.target.value }))} 
                    className="input"
                  >
                    <option value="Pending">Pending</option>
                    <option value="Approved">Approved</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-gray-500 uppercase">Reason / Notes</label>
                <input 
                  type="text" 
                  value={leaveFormData.reason} 
                  onChange={e => setLeaveFormData(prev => ({ ...prev, reason: e.target.value }))} 
                  className="input" 
                  placeholder="Reason for leave" 
                />
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-gray-100">
                <button type="button" onClick={() => setShowAddLeaveModal(false)} className="btn-secondary h-11 px-5 text-xs font-bold rounded-xl">Cancel</button>
                <button type="submit" className="btn-primary h-11 px-5 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl">Submit Request</button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* ── Delete Confirmation Modal ──────────────────────────── */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">
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

      {/* ── Priya Dharshini HR Profile Modal ─────────────────────── */}
      {showPriyaModal && (() => {
        const priyaEmp = employees.find(e => 
          (e.first_name + ' ' + e.last_name).toLowerCase().includes('priya')
        );
        const managedCount = employees.filter(e => e.id !== priyaEmp?.id).length;
        
        return (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fadeIn">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-slideUp">
              {/* Header card with gradient */}
              <div className="bg-gradient-to-r from-indigo-500 to-blue-600 px-6 py-6 text-white relative">
                <button 
                  onClick={() => setShowPriyaModal(false)}
                  className="absolute top-4 right-4 text-white/80 hover:text-white hover:bg-white/10 p-1.5 rounded-full transition-all"
                >
                  <X size={18} />
                </button>
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center text-xl font-extrabold shadow-inner">
                    PD
                  </div>
                  <div>
                    <h3 className="text-lg font-bold">Priya dharshini</h3>
                    <p className="text-xs text-white/85">HR Administrator / Director</p>
                  </div>
                </div>
              </div>

              {/* Profile Details */}
              <div className="p-6 space-y-5 text-sm">
                <div>
                  <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2.5">Basic Details</h4>
                  <div className="grid grid-cols-2 gap-y-3.5 gap-x-4">
                    <div>
                      <span className="text-gray-400 text-[10px] uppercase font-semibold block">Full Name</span>
                      <span className="font-semibold text-gray-900">Priya dharshini</span>
                    </div>
                    <div>
                      <span className="text-gray-400 text-[10px] uppercase font-semibold block">Designation</span>
                      <span className="font-semibold text-gray-900">{priyaEmp?.designation || '—'}</span>
                    </div>
                    <div>
                      <span className="text-gray-400 text-[10px] uppercase font-semibold block">Email Address</span>
                      <span className="font-semibold text-blue-600">{priyaEmp?.email || '—'}</span>
                    </div>
                    <div>
                      <span className="text-gray-400 text-[10px] uppercase font-semibold block">Phone Number</span>
                      <span className="font-semibold text-gray-900">{priyaEmp?.phone || '—'}</span>
                    </div>
                    <div>
                      <span className="text-gray-400 text-[10px] uppercase font-semibold block">Department</span>
                      <span className="font-semibold text-gray-900">{priyaEmp ? getDeptName(priyaEmp.department_id) : '—'}</span>
                    </div>
                    <div>
                      <span className="text-gray-400 text-[10px] uppercase font-semibold block">Joining Date</span>
                      <span className="font-semibold text-gray-900">
                        {priyaEmp?.joining_date ? new Date(priyaEmp.joining_date).toLocaleDateString() : '—'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="border-t border-gray-100 pt-4">
                  <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2.5">Salary & PF Breakdown</h4>
                  <div className="grid grid-cols-2 gap-y-3.5 gap-x-4">
                    <div>
                      <span className="text-gray-400 text-[10px] uppercase font-semibold block">Basic Salary</span>
                      <span className="font-bold text-gray-900">
                        {priyaEmp?.basic_salary ? `₹${priyaEmp.basic_salary.toLocaleString('en-IN')}` : '—'}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-400 text-[10px] uppercase font-semibold block">PF Contribution (12%)</span>
                      <span className="font-semibold text-gray-700">
                        {priyaEmp?.basic_salary ? `₹${Math.round(priyaEmp.basic_salary * 0.12).toLocaleString('en-IN')}` : '—'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="border-t border-gray-100 pt-4">
                  <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Managed Team Scope</h4>
                  <div className="bg-indigo-50/50 border border-indigo-100/50 rounded-xl p-3.5 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-indigo-700 block text-xs">Workforce Headcount</span>
                      <span className="text-[10px] text-indigo-500 mt-0.5 block">Total active employees currently working with you</span>
                    </div>
                    <span className="text-3xl font-extrabold text-[#4F6AF7] tracking-tight">
                      {managedCount}
                    </span>
                  </div>
                </div>
              </div>

              <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end">
                <button 
                  onClick={() => setShowPriyaModal(false)}
                  className="px-4.5 py-2 bg-[#4F6AF7] hover:bg-[#3d58e5] text-white font-bold text-xs rounded-xl shadow-md shadow-[#4F6AF7]/20 transition-all focus:outline-none"
                >
                  Close Profile
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* ── View Formal Leave Letter Modal ──────────────────────── */}
      {selectedLeaveLetter && (() => {
        const req = selectedLeaveLetter;
        const emp = employees.find(e => e.id === req.employee_id);
        const fromDateStr = new Date(req.from_date).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' });
        const toDateStr = new Date(req.to_date).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' });
        const requestDateStr = new Date(req.created_at || new Date()).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' });

        return (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/45 backdrop-blur-sm animate-fadeIn">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-slideUp border border-gray-100">
              {/* Top Banner strip */}
              <div className="bg-indigo-50 px-6 py-4 border-b border-indigo-100/50 flex justify-between items-center">
                <div className="flex items-center gap-2 text-indigo-700">
                  <FileText size={16} />
                  <span className="text-xs font-bold uppercase tracking-wider">Leave Application Letter</span>
                </div>
                <button 
                  onClick={() => setSelectedLeaveLetter(null)}
                  className="p-1 rounded-full text-gray-400 hover:text-gray-900 hover:bg-white/50 transition-all"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Professional Letter Body */}
              <div className="p-8 bg-gray-50/50 max-h-[70vh] overflow-y-auto">
                <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm font-serif text-sm text-gray-800 space-y-5 leading-relaxed relative">
                  {/* Decorative stamp/seal */}
                  <div className={`absolute top-6 right-6 border-2 px-3 py-1 text-[10px] font-bold uppercase tracking-widest rounded rotate-12 ${
                    req.status === 'Approved' 
                      ? 'border-emerald-500/30 text-emerald-500/80 bg-emerald-50/50' 
                      : req.status === 'Pending'
                      ? 'border-amber-500/30 text-amber-500/80 bg-amber-50/50'
                      : 'border-red-500/30 text-red-500/80 bg-red-50/50'
                  }`}>
                    {req.status}
                  </div>

                  <div className="text-xs font-sans text-gray-400 space-y-0.5">
                    <p>Date: {requestDateStr}</p>
                    <p>To: HR Administration Department</p>
                    <p>Company: Story Seed Studio</p>
                  </div>

                  <div className="border-b border-gray-100 pb-3">
                    <p className="font-bold font-sans text-gray-900 text-xs uppercase tracking-wide">
                      Subject: Application for {req.leave_type} ({req.total_days} Days)
                    </p>
                  </div>

                  <p>Respected Sir/Madam,</p>

                  <p>
                    I am writing this letter to formally submit my application for leave of absence from the company. 
                    I request you to kindly approve my leave starting from <strong className="text-gray-900 font-sans">{fromDateStr}</strong> to <strong className="text-gray-900 font-sans">{toDateStr}</strong> (inclusive of both dates).
                  </p>

                  <p>
                    The reason for my leave request is: <em className="text-gray-700 italic font-sans">"{req.reason || 'Not specified'}"</em>. 
                    I will ensure that all my pending tasks are updated, and I will hand over necessary project files to my team lead before my departure. I expect to resume my regular work duties on the next business day.
                  </p>

                  <div className="pt-6 font-sans text-xs text-gray-500">
                    <p>Thanking you in anticipation.</p>
                    <p className="mt-4 font-bold text-gray-900">Sincerely,</p>
                    <p className="text-sm font-extrabold text-gray-900 mt-1">
                      {emp ? `${emp.first_name} ${emp.last_name}` : 'Story Seed Employee'}
                    </p>
                    <p className="text-[10px] text-gray-400 uppercase tracking-wider mt-0.5">
                      {emp?.designation || 'Specialist'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons in Modal Footer */}
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-between items-center">
                <span className="text-[10px] text-gray-400 font-bold uppercase font-sans">
                  Application ID: #{req.id.substring(0, 8)}
                </span>
                
                <div className="flex gap-2">
                  <button 
                    onClick={() => setSelectedLeaveLetter(null)}
                    className="h-9 px-4 text-xs font-semibold border border-gray-200 text-gray-650 bg-white hover:bg-gray-50 rounded-xl transition-all"
                  >
                    Close
                  </button>
                  {req.status === 'Pending' && (
                    <>
                      <button 
                        onClick={() => {
                          handleUpdateLeaveStatus(req.id, 'Rejected');
                          setSelectedLeaveLetter(null);
                        }}
                        className="h-9 px-4 text-xs font-bold bg-red-600 hover:bg-red-700 text-white rounded-xl shadow-md shadow-red-600/10 transition-all"
                      >
                        Reject Request
                      </button>
                      <button 
                        onClick={() => {
                          handleUpdateLeaveStatus(req.id, 'Approved');
                          setSelectedLeaveLetter(null);
                        }}
                        className="h-9 px-4 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-md shadow-emerald-600/10 transition-all"
                      >
                        Approve Request
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
