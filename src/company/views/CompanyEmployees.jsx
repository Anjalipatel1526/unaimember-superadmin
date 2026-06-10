import React, { useEffect, useState, useCallback } from 'react';
import { Search, Plus, Trash2, Edit3, X, User, Briefcase, Mail, Phone, Calendar, IndianRupee } from 'lucide-react';
import { getEmployees, createEmployee, updateEmployee, deleteEmployee } from '../../services/employees';
import ConfirmModal from '../../components/ConfirmModal';

function Modal({ open, onClose, title, children }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/25 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <h3 className="text-base font-bold text-gray-900">{title}</h3>
          <button onClick={onClose} className="btn-ghost w-8 h-8 flex items-center justify-center p-0">
            <X size={18}/>
          </button>
        </div>
        <div className="px-6 py-6 overflow-y-auto max-h-[85vh]">{children}</div>
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

const BLANK_EMP = {
  first_name: '', last_name: '', email: '', phone: '',
  department: '', designation: '', employment_type: 'Full-Time',
  status: 'Active', date_of_joining: '', date_of_birth: '',
  salary: '', address: '',
};

export default function CompanyEmployees({ companyId }) {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(BLANK_EMP);
  const [editId, setEditId] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    getEmployees(companyId)
      .then(setEmployees)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [companyId]);

  useEffect(() => { load(); }, [load]);

  const filtered = employees.filter(e =>
    `${e.first_name} ${e.last_name}`.toLowerCase().includes(search.toLowerCase()) ||
    (e.email || '').toLowerCase().includes(search.toLowerCase()) ||
    (e.department || '').toLowerCase().includes(search.toLowerCase()) ||
    (e.designation || '').toLowerCase().includes(search.toLowerCase())
  );

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editId) {
        const result = await updateEmployee(editId, form);
        setEmployees(prev => prev.map(emp => emp.id === editId ? result : emp));
      } else {
        const result = await createEmployee(companyId, form);
        setEmployees(prev => [result, ...prev]);
      }
      setShowModal(false);
      setForm(BLANK_EMP);
      setEditId(null);
    } catch (err) {
      alert('Error saving employee: ' + err.message);
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
      setDeleteId(null);
    } catch (err) {
      alert('Error deleting employee: ' + err.message);
    } finally {
      setDeleting(false);
    }
  };

  const handleEditClick = (emp) => {
    setForm({
      first_name: emp.first_name || '',
      last_name: emp.last_name || '',
      email: emp.email || '',
      phone: emp.phone || '',
      department: emp.department || '',
      designation: emp.designation || '',
      employment_type: emp.employment_type || 'Full-Time',
      status: emp.emp_status || 'Active',
      date_of_joining: emp.date_of_joining || '',
      date_of_birth: emp.date_of_birth || '',
      salary: emp.salary || '',
      address: emp.address || '',
    });
    setEditId(emp.id);
    setShowModal(true);
  };

  return (
    <div className="flex flex-col gap-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Staff Directory</h1>
          <p className="text-sm text-gray-500 mt-1">Manage and update records for your organization's team members.</p>
        </div>
        <button onClick={() => { setForm(BLANK_EMP); setEditId(null); setShowModal(true); }} className="btn-primary flex items-center gap-1.5 self-start">
          <Plus size={15}/>Add Employee
        </button>
      </div>

      {/* Toolbar */}
      <div className="card p-0 overflow-hidden">
        <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100 bg-white">
          <div className="relative flex-1 max-w-sm">
            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"/>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search employees by name, department, title…" className="input pl-9 h-10"/>
          </div>
        </div>

        {/* Directory Table */}
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-6 space-y-3">
              {[...Array(4)].map((_, i) => <div key={i} className="h-14 bg-gray-100 rounded-xl animate-pulse"/>)}
            </div>
          ) : (
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  {['Employee', 'Contact', 'Work Info', 'Status', 'Joined Date', ''].map(h => (
                    <th key={h} className="px-6 py-3 text-left text-xs font-bold text-gray-400 uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(emp => (
                  <tr key={emp.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50/30 transition-colors">
                    {/* Employee Profile */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[#EEF0FF] flex items-center justify-center shrink-0 border border-[#4c58fa]/10">
                          <span className="text-sm font-bold text-[#4c58fa]">{emp.first_name[0]}{emp.last_name[0]}</span>
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-900">{emp.first_name} {emp.last_name}</p>
                          <p className="text-xs text-gray-400 font-mono">{emp.employee_code || 'No Code'}</p>
                        </div>
                      </div>
                    </td>

                    {/* Contact details */}
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5 text-xs text-gray-600">
                          <Mail size={12} className="text-gray-400" />
                          <span>{emp.email || '—'}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-gray-600">
                          <Phone size={12} className="text-gray-400" />
                          <span>{emp.phone || '—'}</span>
                        </div>
                      </div>
                    </td>

                    {/* Department / Title */}
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-xs font-bold text-[#4c58fa] bg-[#EEF0FF] px-2 py-0.5 rounded-md inline-block mb-1">{emp.department || 'General'}</p>
                        <p className="text-sm font-semibold text-gray-800">{emp.designation || 'Staff Member'}</p>
                        <p className="text-[10px] text-gray-400 uppercase tracking-wider mt-0.5">{emp.employment_type}</p>
                      </div>
                    </td>

                    {/* Status Badge */}
                    <td className="px-6 py-4">
                      {emp.emp_status === 'Active' && <span className="badge-green">Active</span>}
                      {emp.emp_status === 'Inactive' && <span className="badge-red">Inactive</span>}
                      {emp.emp_status === 'On Leave' && <span className="badge-orange">On Leave</span>}
                      {!emp.emp_status && <span className="badge-sand">—</span>}
                    </td>

                    {/* Date Joined */}
                    <td className="px-6 py-4 text-xs text-gray-400 whitespace-nowrap">
                      {emp.date_of_joining ? new Date(emp.date_of_joining).toLocaleDateString() : '—'}
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 justify-end">
                        <button onClick={() => handleEditClick(emp)} className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-[#4c58fa] hover:bg-[#EEF0FF] transition-all" title="Edit Employee">
                          <Edit3 size={14}/>
                        </button>
                        <button onClick={() => setDeleteId(emp.id)} className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-rose-600 hover:bg-rose-50 transition-all" title="Delete Employee">
                          <Trash2 size={14}/>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && !loading && (
                  <tr><td colSpan={6} className="text-center py-16 text-sm text-gray-400">No employees found. Add some to get started!</td></tr>
                )}
              </tbody>
            </table>
          )}
        </div>
        <div className="px-6 py-3 border-t border-gray-100 bg-white">
          <p className="text-xs text-gray-400">Showing {filtered.length} of {employees.length} results</p>
        </div>
      </div>

      {/* Add / Edit Employee Modal */}
      <Modal open={showModal} onClose={() => { setShowModal(false); setForm(BLANK_EMP); setEditId(null); }} title={editId ? 'Edit Employee Record' : 'Register New Employee'}>
        <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="First Name">
              <input className="input" value={form.first_name} onChange={e => set('first_name', e.target.value)} required />
            </Field>
            <Field label="Last Name">
              <input className="input" value={form.last_name} onChange={e => set('last_name', e.target.value)} required />
            </Field>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Email Address">
              <input type="email" className="input" value={form.email} onChange={e => set('email', e.target.value)} />
            </Field>
            <Field label="Phone Number">
              <input className="input" value={form.phone} onChange={e => set('phone', e.target.value)} />
            </Field>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Field label="Department">
              <input className="input" value={form.department} onChange={e => set('department', e.target.value)} placeholder="e.g. engineering, HR" />
            </Field>
            <Field label="Designation / Title">
              <input className="input" value={form.designation} onChange={e => set('designation', e.target.value)} placeholder="e.g. Lead Designer" />
            </Field>
            <Field label="Employment Type">
              <select className="input" value={form.employment_type} onChange={e => set('employment_type', e.target.value)}>
                <option value="Full-Time">Full-Time</option>
                <option value="Part-Time">Part-Time</option>
                <option value="Contract">Contract</option>
                <option value="Intern">Intern</option>
              </select>
            </Field>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Field label="Date of Joining">
              <input type="date" className="input" value={form.date_of_joining} onChange={e => set('date_of_joining', e.target.value)} />
            </Field>
            <Field label="Date of Birth">
              <input type="date" className="input" value={form.date_of_birth} onChange={e => set('date_of_birth', e.target.value)} />
            </Field>
            <Field label="Salary (INR / Month)">
              <input type="number" className="input" value={form.salary} onChange={e => set('salary', e.target.value)} placeholder="e.g. 75000" min={0}/>
            </Field>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Field label="Status">
              <select className="input" value={form.status} onChange={e => set('status', e.target.value)}>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
                <option value="On Leave">On Leave</option>
              </select>
            </Field>
            <div className="sm:col-span-2">
              <Field label="Home Address">
                <input className="input" value={form.address} onChange={e => set('address', e.target.value)} placeholder="Full street address..." />
              </Field>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
            <button type="button" onClick={() => { setShowModal(false); setForm(BLANK_EMP); setEditId(null); }} className="btn-secondary">Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary">
              {saving ? 'Saving...' : editId ? 'Update Record' : 'Register Employee'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmModal 
        open={!!deleteId} 
        onClose={() => setDeleteId(null)} 
        onConfirm={handleDelete}
        loading={deleting}
        title="Remove Employee Record"
        message="Are you sure you want to delete this employee? All salary histories, attendance logs, and permissions will be permanently purged from the server."
        confirmText="Confirm Purge"
        type="danger"
      />
    </div>
  );
}
