import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Download, Plus, MoreHorizontal, X, Users, Trash2, ChevronRight } from 'lucide-react';
import { getCompanies, createCompany, deleteCompany } from '../../services/companies';
import DatePicker from '../../components/DatePicker';

function Modal({ open, onClose, title, children }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/25 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <h3 className="text-base font-bold text-gray-900">{title}</h3>
          <button onClick={onClose} className="btn-ghost w-8 h-8 flex items-center justify-center p-0">
            <X size={18}/>
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

function Toggle({ label, value, onChange }) {
  return (
    <label className="flex items-center gap-3 cursor-pointer select-none">
      <button type="button" onClick={() => onChange(!value)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${value ? 'bg-[#4c58fa]' : 'bg-gray-200'}`}>
        <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${value ? 'translate-x-6' : 'translate-x-1'}`}/>
      </button>
      <span className="text-sm font-medium text-gray-700">{label}</span>
    </label>
  );
}

const BLANK = {
  name: '', email: '', phone: '', address: '',
  employee_limit: 50, trial_expiry: '',
  payroll_enabled: false, performance_enabled: false,
};

export default function Companies() {
  const navigate = useNavigate();
  const [companies, setCompanies] = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [saving,    setSaving]    = useState(false);
  const [search,    setSearch]    = useState('');
  const [error,     setError]     = useState(null);
  const [form,      setForm]      = useState(BLANK);

  useEffect(() => {
    getCompanies()
      .then(setCompanies)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const filtered = companies.filter(c =>
    (c.name || '').toLowerCase().includes(search.toLowerCase()) ||
    (c.email || '').toLowerCase().includes(search.toLowerCase())
  );

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this company? All associated data will be removed.')) return;
    try {
      await deleteCompany(id);
      setCompanies(prev => prev.filter(c => c.id !== id));
    } catch (e) {
      alert('Error deleting company: ' + e.message);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const created = await createCompany({ ...form, status: 'Trial', payment_status: 'Pending' });
      setCompanies(prev => [created, ...prev]);
      setShowModal(false);
      setForm(BLANK);
    } catch (e) {
      alert('Error: ' + e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Client Companies</h1>
          <p className="text-sm text-gray-500 mt-1">Manage all registered organizations on the platform.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="btn-secondary"><Download size={15}/>Export CSV</button>
          <button onClick={() => setShowModal(true)} className="btn-primary"><Plus size={15}/>Add Company</button>
        </div>
      </div>


      <div className="card p-0 overflow-hidden">
        <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100">
          <div className="relative flex-1 max-w-sm">
            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"/>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search companies…" className="input pl-9 h-10"/>
          </div>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-6 space-y-3">{[...Array(4)].map((_,i)=><div key={i} className="h-14 bg-gray-100 rounded-xl animate-pulse"/>)}</div>
          ) : (
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  {['Company','Employees','Status','Date',''].map(h=>(
                    <th key={h} className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(c=>(
                  <tr key={c.id} className="table-row border-b border-gray-100 last:border-0 cursor-pointer"
                    onClick={() => navigate(`/companies/${c.id}`)}>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-[#EEF0FF] flex items-center justify-center shrink-0">
                          <span className="text-sm font-bold text-[#4c58fa]">{(c.name||'?')[0]}</span>
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-900">{c.name}</p>
                          <p className="text-xs text-gray-400">{c.email || '—'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Users size={13} className="text-[#4c58fa]"/>
                        <span className="font-medium">{c.employee_count || 0}</span>
                        <span className="text-gray-300">/</span>
                        <span>{c.employee_limit || '—'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {c.status==='Active'    && <span className="badge-green">Active</span>}
                      {c.status==='Trial'     && <span className="badge-orange">Trial</span>}
                      {c.status==='Suspended' && <span className="badge-red">Suspended</span>}
                      {!c.status              && <span className="badge-sand">—</span>}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-400 whitespace-nowrap">{new Date(c.created_at).toLocaleDateString()}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 justify-end" onClick={e => e.stopPropagation()}>
                        <button 
                          onClick={(e) => { e.stopPropagation(); handleDelete(c.id); }}
                          className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-rose-600 hover:bg-rose-50 transition-all"
                          title="Delete Company"
                        >
                          <Trash2 size={16}/>
                        </button>
                        <button onClick={() => navigate(`/companies/${c.id}`)}
                          className="btn-ghost w-8 h-8 flex items-center justify-center p-0 text-gray-400">
                          <ChevronRight size={16}/>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length===0 && !loading && (
                  <tr><td colSpan={5} className="text-center py-16 text-sm text-gray-400">No companies found.</td></tr>
                )}
              </tbody>
            </table>
          )}
        </div>
        <div className="px-6 py-3 border-t border-gray-100">
          <p className="text-xs text-gray-400">Showing {filtered.length} of {companies.length} results</p>
        </div>
      </div>

      {/* Add Company Modal */}
      <Modal open={showModal} onClose={()=>{setShowModal(false);setForm(BLANK);}} title="Add New Company">
        <form className="flex flex-col gap-5" onSubmit={handleCreate}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Company Name">
              <input className="input" value={form.name} onChange={e=>set('name',e.target.value)} required placeholder="Acme Corp"/>
            </Field>
            <Field label="Company Email">
              <input type="email" className="input" value={form.email} onChange={e=>set('email',e.target.value)} placeholder="admin@acme.com"/>
            </Field>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Phone">
              <input className="input" value={form.phone} onChange={e=>set('phone',e.target.value)} placeholder="+91 99999 00000"/>
            </Field>
            <Field label="Employee Limit">
              <input type="number" className="input" value={form.employee_limit} onChange={e=>set('employee_limit',e.target.value)} min={1}/>
            </Field>
          </div>
          <Field label="Address">
            <input className="input" value={form.address} onChange={e=>set('address',e.target.value)} placeholder="123 Street, City"/>
          </Field>

          {/* Custom Date Picker */}
          <DatePicker
            label="Trial Expiry Date"
            value={form.trial_expiry}
            onChange={v => set('trial_expiry', v)}
            placeholder="Pick a date…"
          />

          <div className="flex flex-col gap-3 pt-2 border-t border-gray-100">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Module Access</p>
            <Toggle label="Enable Payroll Module"     value={form.payroll_enabled}     onChange={v=>set('payroll_enabled',v)}/>
            <Toggle label="Enable Performance Module" value={form.performance_enabled} onChange={v=>set('performance_enabled',v)}/>
          </div>
          <div className="flex items-center justify-end gap-3 pt-2 border-t border-gray-100">
            <button type="button" onClick={()=>{setShowModal(false);setForm(BLANK);}} className="btn-secondary">Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary">
              {saving ? 'Creating…' : 'Create Company'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
