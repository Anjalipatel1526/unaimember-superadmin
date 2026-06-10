import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Users, Shield, Plus, Trash2, Search,
  Edit2, X, Save, UserCheck, UserX, Clock, Building2
} from 'lucide-react';
import { getCompanies } from '../../services/companies';
import {
  getEmployees, createEmployee, updateEmployee, deleteEmployee,
  getEmployeeStats, getCompanyAccess, upsertCompanyAccess
} from '../../services/employees';
import ConfirmModal from '../../components/ConfirmModal';

// ── Helpers ──────────────────────────────────────────────────
function Modal({ open, onClose, title, children }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/25 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <h3 className="text-base font-bold text-gray-900">{title}</h3>
          <button onClick={onClose} className="btn-ghost w-8 h-8 flex items-center justify-center p-0">
            <X size={18} />
          </button>
        </div>
        <div className="px-6 py-6 overflow-y-auto max-h-[80vh]">{children}</div>
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{label}</label>
      {children}
    </div>
  );
}

function Toggle({ label, desc, value, onChange }) {
  return (
    <label className="flex items-center justify-between gap-4 py-3 px-4 rounded-xl hover:bg-gray-50 cursor-pointer transition-colors">
      <div>
        <p className="text-sm font-medium text-gray-800">{label}</p>
        {desc && <p className="text-xs text-gray-400 mt-0.5">{desc}</p>}
      </div>
      <button type="button" onClick={() => onChange(!value)}
        className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${value ? 'bg-[#4c58fa]' : 'bg-gray-200'}`}>
        <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${value ? 'translate-x-6' : 'translate-x-1'}`} />
      </button>
    </label>
  );
}

const BLANK_EMP = {
  first_name: '', last_name: '', email: '', phone: '',
  department: '', designation: '', employment_type: 'Full-Time',
  status: 'Active', date_of_joining: '', salary: '', address: '',
};

const STATUS_BADGE = {
  Active:    'badge-green',
  Inactive:  'badge-red',
  'On Leave': 'badge-orange',
};

// helper: normalise DB row → form values
function empToForm(emp) {
  return {
    first_name:      emp.first_name      || '',
    last_name:       emp.last_name       || '',
    email:           emp.email           || '',
    phone:           emp.phone           || '',
    department:      emp.department      || '',
    designation:     emp.designation     || '',
    employment_type: emp.employment_type || 'Full-Time',
    status:          emp.emp_status      || 'Active',   // form uses 'status', DB uses 'emp_status'
    date_of_joining: emp.date_of_joining || '',
    salary:          emp.salary          || '',
    address:         emp.address         || '',
  };
}

// ── Employee Tab ─────────────────────────────────────────────
function EmployeesTab({ companyId, companyName }) {
  const [employees, setEmployees] = useState([]);
  const [stats,     setStats]     = useState(null);
  const [loading,   setLoading]   = useState(true);
  const [search,    setSearch]    = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editEmp,   setEditEmp]   = useState(null);  // null=create, obj=edit
  const [form,      setForm]      = useState(BLANK_EMP);
  const [saving,    setSaving]    = useState(false);
  const [deleteId,  setDeleteId]  = useState(null);
  const [deleting,  setDeleting]  = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [emps, st] = await Promise.all([
        getEmployees(companyId),
        getEmployeeStats(companyId),
      ]);
      setEmployees(emps);
      setStats(st);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [companyId]);

  useEffect(() => { load(); }, [load]);

  const openCreate = () => { setEditEmp(null); setForm(BLANK_EMP); setShowModal(true); };
  const openEdit   = (emp) => {
    setEditEmp(emp);
    setForm(empToForm(emp));
    setShowModal(true);
  };

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editEmp) {
        const updated = await updateEmployee(editEmp.id, form);
        setEmployees(prev => prev.map(em => em.id === updated.id ? updated : em));
      } else {
        const created = await createEmployee(companyId, form);
        setEmployees(prev => [created, ...prev]);
        setStats(s => s ? { ...s, total: s.total + 1, active: form.status === 'Active' ? s.active + 1 : s.active } : s);
      }
      setShowModal(false);
    } catch (err) {
      alert('Error: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await deleteEmployee(deleteId);
      setEmployees(prev => prev.filter(e => e.id !== deleteId));
      setStats(s => s ? { ...s, total: Math.max(0, s.total - 1) } : s);
      setDeleteId(null);
    } catch (err) {
      alert('Error: ' + err.message);
    } finally {
      setDeleting(false);
    }
  };

  const filtered = employees.filter(e =>
    `${e.first_name} ${e.last_name} ${e.email || ''} ${e.department || ''} ${e.designation || ''}`
      .toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-6">
      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Total Employees', value: stats.total,    icon: Users,     color: 'text-[#4c58fa] bg-[#EEF0FF]' },
            { label: 'Active',          value: stats.active,   icon: UserCheck, color: 'text-emerald-600 bg-emerald-50' },
            { label: 'Inactive',        value: stats.inactive, icon: UserX,     color: 'text-rose-500 bg-rose-50' },
            { label: 'On Leave',        value: stats.onLeave,  icon: Clock,     color: 'text-amber-600 bg-amber-50' },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="card p-4 flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
                <Icon size={18} />
              </div>
              <div>
                <p className="text-xs text-gray-400 font-medium">{label}</p>
                <p className="text-xl font-bold text-gray-900">{value}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Table */}
      <div className="card p-0 overflow-hidden">
        <div className="flex items-center justify-between gap-3 px-6 py-4 border-b border-gray-100">
          <div className="relative flex-1 max-w-sm">
            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search employees…" className="input pl-9 h-10" />
          </div>
          <button onClick={openCreate} className="btn-primary">
            <Plus size={15} /> Add Employee
          </button>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-6 space-y-3">
              {[...Array(4)].map((_, i) => <div key={i} className="h-14 bg-gray-100 rounded-xl animate-pulse" />)}
            </div>
          ) : (
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  {['Employee', 'Department / Role', 'Type', 'Status', 'Joined', ''].map(h => (
                    <th key={h} className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(emp => (
                  <tr key={emp.id} className="table-row border-b border-gray-100 last:border-0">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-[#EEF0FF] flex items-center justify-center shrink-0">
                          <span className="text-sm font-bold text-[#4c58fa]">
                            {(emp.first_name || '?')[0]}{(emp.last_name || '')[0]}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-900">{emp.first_name} {emp.last_name}</p>
                          <p className="text-xs text-gray-400">{emp.email || '—'} {emp.employee_code ? `• ${emp.employee_code}` : ''}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-medium text-gray-700">{emp.designation || '—'}</p>
                      <p className="text-xs text-gray-400">{emp.department || '—'}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs font-medium text-gray-600 bg-gray-100 px-2 py-1 rounded-md">
                        {emp.employment_type}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={STATUS_BADGE[emp.emp_status] || 'badge-sand'}>{emp.emp_status || '—'}</span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-400 whitespace-nowrap">
                      {emp.date_of_joining ? new Date(emp.date_of_joining).toLocaleDateString() : '—'}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1 justify-end">
                        <button onClick={() => openEdit(emp)}
                          className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-[#4c58fa] hover:bg-[#EEF0FF] transition-all">
                          <Edit2 size={14} />
                        </button>
                        <button onClick={() => setDeleteId(emp.id)}
                          className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-rose-600 hover:bg-rose-50 transition-all">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && !loading && (
                  <tr><td colSpan={6} className="text-center py-16 text-sm text-gray-400">No employees found. Add your first employee!</td></tr>
                )}
              </tbody>
            </table>
          )}
        </div>
        <div className="px-6 py-3 border-t border-gray-100">
          <p className="text-xs text-gray-400">Showing {filtered.length} of {employees.length} employees</p>
        </div>
      </div>

      {/* Add / Edit Modal */}
      <Modal open={showModal} onClose={() => setShowModal(false)}
        title={editEmp ? `Edit — ${editEmp.first_name} ${editEmp.last_name}` : `Add Employee to ${companyName}`}>
        <form className="flex flex-col gap-5" onSubmit={handleSave}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="First Name">
              <input className="input" value={form.first_name} onChange={e => set('first_name', e.target.value)} required />
            </Field>
            <Field label="Last Name">
              <input className="input" value={form.last_name} onChange={e => set('last_name', e.target.value)} required />
            </Field>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Email">
              <input type="email" className="input" value={form.email} onChange={e => set('email', e.target.value)} />
            </Field>
            <Field label="Phone">
              <input className="input" value={form.phone} onChange={e => set('phone', e.target.value)} />
            </Field>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Department">
              <input className="input" value={form.department} onChange={e => set('department', e.target.value)} />
            </Field>
            <Field label="Designation">
              <input className="input" value={form.designation} onChange={e => set('designation', e.target.value)} />
            </Field>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Field label="Employment Type">
              <select className="input" value={form.employment_type} onChange={e => set('employment_type', e.target.value)}>
                {['Full-Time', 'Part-Time', 'Contract'].map(t => <option key={t}>{t}</option>)}
              </select>
            </Field>
            <Field label="Status">
              <select className="input" value={form.status} onChange={e => set('status', e.target.value)}>
                {['Active', 'Inactive', 'On Leave'].map(s => <option key={s}>{s}</option>)}
              </select>
            </Field>
            <Field label="Date of Joining">
              <input type="date" className="input" value={form.date_of_joining} onChange={e => set('date_of_joining', e.target.value)} />
            </Field>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Salary (₹)">
              <input type="number" className="input" value={form.salary} onChange={e => set('salary', e.target.value)} />
            </Field>
            <Field label="Address">
              <input className="input" value={form.address} onChange={e => set('address', e.target.value)} />
            </Field>
          </div>
          <div className="flex items-center justify-end gap-3 pt-2 border-t border-gray-100">
            <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary">
              {saving ? 'Saving…' : editEmp ? <><Save size={14}/> Update Employee</> : <><Plus size={14}/> Add Employee</>}
            </button>
          </div>
        </form>
      </Modal>

      {/* Premium Confirm Modal */}
      <ConfirmModal 
        open={!!deleteId} 
        onClose={() => setDeleteId(null)} 
        onConfirm={handleDelete}
        loading={deleting}
        title="Delete Employee"
        message="Are you sure you want to remove this employee from the system? This action is permanent and will delete all their records."
        confirmText="Remove Employee"
        type="danger"
      />
    </div>
  );
}

// ── Access Control Tab ────────────────────────────────────────
const ACCESS_GROUPS = [
  {
    group: 'Core HR Modules',
    items: [
      { key: 'employees_module',   label: 'Employee Management', desc: 'View and manage employee records' },
      { key: 'attendance_module',  label: 'Attendance Tracking', desc: 'Biometric, GPS, and manual check-in' },
      { key: 'payroll_module',     label: 'Payroll Processing',  desc: 'Salary, tax, and payslip generation' },
      { key: 'performance_module', label: 'Performance Reviews', desc: 'KPI tracking and appraisal cycles' },
      { key: 'recruitment_module', label: 'Recruitment',         desc: 'Job postings and candidate pipeline' },
      { key: 'training_module',    label: 'Training & L&D',      desc: 'Course management and certifications' },
    ],
  },
  {
    group: 'Reports & Analytics',
    items: [
      { key: 'reports_enabled',     label: 'Reports',       desc: 'Downloadable HR reports and exports' },
      { key: 'analytics_enabled',   label: 'Analytics',     desc: 'Dashboard charts and trends' },
      { key: 'ai_insights_enabled', label: 'AI Insights',   desc: 'Predictive attrition and AI summaries' },
    ],
  },
  {
    group: 'Integrations & Access',
    items: [
      { key: 'api_access',       label: 'API Access',      desc: 'REST API for custom integrations' },
      { key: 'mobile_app_access', label: 'Mobile App',     desc: 'iOS & Android employee app' },
      { key: 'can_export_data',  label: 'Data Export',     desc: 'CSV/Excel exports for all modules' },
      { key: 'can_manage_roles', label: 'Role Management', desc: 'Create and assign custom roles' },
      { key: 'custom_branding',  label: 'Custom Branding', desc: 'Company logo and color theme' },
    ],
  },
];

function AccessControlTab({ companyId }) {
  const [access,  setAccess]  = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving,  setSaving]  = useState(false);
  const [saved,   setSaved]   = useState(false);

  useEffect(() => {
    getCompanyAccess(companyId)
      .then(data => setAccess(data || {}))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [companyId]);

  const toggle = (key) => setAccess(prev => ({ ...prev, [key]: !prev[key] }));

  const handleSave = async () => {
    setSaving(true);
    try {
      const updated = await upsertCompanyAccess(companyId, access);
      setAccess(updated);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (e) {
      alert('Error saving: ' + e.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-8 text-center text-sm text-gray-400">Loading access controls…</div>;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">Toggle which modules this company can access in their HR portal.</p>
        <button onClick={handleSave} disabled={saving} className="btn-primary">
          {saved ? '✓ Saved!' : saving ? 'Saving…' : <><Save size={14}/> Save Changes</>}
        </button>
      </div>

      {ACCESS_GROUPS.map(({ group, items }) => (
        <div key={group} className="card p-0 overflow-hidden">
          <div className="px-5 py-3 bg-gray-50 border-b border-gray-100">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{group}</p>
          </div>
          <div className="divide-y divide-gray-50">
            {items.map(({ key, label, desc }) => (
              <Toggle key={key} label={label} desc={desc} value={!!access?.[key]} onChange={() => toggle(key)} />
            ))}
          </div>
        </div>
      ))}

      {/* Limits */}
      <div className="card p-5">
        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Limits</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Max Departments">
            <input type="number" className="input" min={1} max={100}
              value={access?.max_departments ?? 10}
              onChange={e => setAccess(a => ({ ...a, max_departments: Number(e.target.value) }))} />
          </Field>
          <Field label="Max Admin Users">
            <input type="number" className="input" min={1} max={50}
              value={access?.max_admin_users ?? 3}
              onChange={e => setAccess(a => ({ ...a, max_admin_users: Number(e.target.value) }))} />
          </Field>
        </div>
      </div>
    </div>
  );
}

// ── Main Company Detail Page ──────────────────────────────────
export default function CompanyDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [company, setCompany] = useState(null);
  const [tab,     setTab]     = useState('employees'); // 'employees' | 'access'

  useEffect(() => {
    getCompanies().then(list => {
      const found = list.find(c => c.id === id);
      if (found) setCompany(found);
    });
  }, [id]);

  if (!company) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-12 h-12 bg-gray-100 rounded-full mx-auto mb-3 animate-pulse" />
          <p className="text-sm text-gray-400">Loading company…</p>
        </div>
      </div>
    );
  }

  const STATUS_COLOR = { Active: 'badge-green', Trial: 'badge-orange', Suspended: 'badge-red', Cancelled: 'badge-sand' };

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button onClick={() => navigate('/companies')}
          className="w-9 h-9 flex items-center justify-center rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors">
          <ArrowLeft size={18} />
        </button>
        <div className="flex items-center gap-3 flex-1">
          <div className="w-11 h-11 rounded-xl bg-[#EEF0FF] flex items-center justify-center shrink-0 overflow-hidden">
            {company.logo_url ? (
              <img src={company.logo_url} alt={company.name} className="w-full h-full object-cover" />
            ) : (
              <span className="text-lg font-bold text-[#4c58fa]">{(company.name || '?')[0]}</span>
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-gray-900 tracking-tight">{company.name}</h1>
              <span className={STATUS_COLOR[company.status] || 'badge-sand'}>{company.status}</span>
            </div>
            <p className="text-sm text-gray-400">{company.email || '—'} {company.phone ? `• ${company.phone}` : ''}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 text-sm text-gray-500">
          <Building2 size={14} />
          <span>{company.employee_count || 0} / {company.employee_limit} employees</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-gray-200">
        {[
          { key: 'employees', label: 'Employees', icon: Users },
          { key: 'access',    label: 'Access Control', icon: Shield },
        ].map(({ key, label, icon: Icon }) => (
          <button key={key} onClick={() => setTab(key)}
            className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold border-b-2 -mb-px transition-colors ${
              tab === key
                ? 'border-[#4c58fa] text-[#4c58fa]'
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}>
            <Icon size={15} /> {label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {tab === 'employees' && <EmployeesTab companyId={id} companyName={company.name} />}
      {tab === 'access'    && <AccessControlTab companyId={id} />}
    </div>
  );
}
