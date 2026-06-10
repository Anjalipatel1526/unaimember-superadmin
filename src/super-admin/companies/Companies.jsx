import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Download, Plus, X, Users, Trash2, ChevronRight, KeyRound, Copy, Check, Eye, EyeOff, RefreshCw, Building2 } from 'lucide-react';
import { getCompaniesWithCredentials, createCompany, deleteCompany, resetCompanyPassword } from '../../services/companies';

import ConfirmModal from '../../components/ConfirmModal';
import CredentialsModal from '../../components/CredentialsModal';

function Modal({ open, onClose, title, children }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/25 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden animate-in zoom-in-95 duration-200">
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
  employee_limit: 50,
  payroll_enabled: false, performance_enabled: false,
  login_id: '', login_password: '',
  logo_url: '',
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
  const [deleteId,   setDeleteId]   = useState(null);
  const [deleting,   setDeleting]   = useState(false);
  const [showCreds,  setShowCreds]  = useState(false);
  const [newCreds,   setNewCreds]   = useState(null);  // { email, password }
  const [createdCo,  setCreatedCo]  = useState(null);  // the new company row

  const [resetTarget, setResetTarget] = useState(null); // { id, name } for reset
  const [resetCreds,  setResetCreds]  = useState(null);
  const [resetting,   setResetting]   = useState(false);
  const [copiedId,    setCopiedId]    = useState(null);  // tracks which cell was copied
  const [showPwdFor,  setShowPwdFor]  = useState(null);  // companyId whose password is revealed
  const [showFormPwd, setShowFormPwd] = useState(false);  // show/hide in form

  const load = useCallback(() => {
    setLoading(true);
    getCompaniesWithCredentials()
      .then(setCompanies)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = companies.filter(c =>
    (c.name || '').toLowerCase().includes(search.toLowerCase()) ||
    (c.email || '').toLowerCase().includes(search.toLowerCase())
  );

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  // Quick copy helper
  const copyText = async (text, key) => {
    try { await navigator.clipboard.writeText(text); }
    catch { const el = document.createElement('textarea'); el.value = text; document.body.appendChild(el); el.select(); document.execCommand('copy'); document.body.removeChild(el); }
    setCopiedId(key);
    setTimeout(() => setCopiedId(k2 => k2 === key ? null : k2), 2000);
  };

  // Auto-generate password
  const autoGenPassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789@#$!';
    const pwd = Array.from({ length: 12 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
    set('login_password', pwd);
  };

  const handleLogoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert('Please upload an image smaller than 5MB.');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      set('logo_url', reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await deleteCompany(deleteId);
      setCompanies(prev => prev.filter(c => c.id !== deleteId));
      setDeleteId(null);
    } catch (e) {
      alert('Error deleting company: ' + e.message);
    } finally {
      setDeleting(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const result = await createCompany({ ...form, status: 'Trial', payment_status: 'Pending' });
      const company     = result.company     ?? result;
      const credentials = result.credentials ?? null;
      setCompanies(prev => [{ ...company, company_credentials: [{ login_email: credentials.email, login_password: credentials.password, is_active: true }] }, ...prev]);
      setShowModal(false);
      setForm(BLANK);
      setShowFormPwd(false);
      if (credentials) {
        setCreatedCo(company);
        setNewCreds(credentials);
        setShowCreds(true);
      }
    } catch (e) {
      alert('Error: ' + e.message);
    } finally {
      setSaving(false);
    }
  };

  const handleResetPassword = async (company) => {
    setResetting(true);
    try {
      const creds = await resetCompanyPassword(company.id);
      setResetTarget(company);
      setResetCreds(creds);
      setShowCreds(true);
      setNewCreds(creds);
      setCreatedCo(company);
    } catch (e) {
      alert('Reset failed: ' + e.message);
    } finally {
      setResetting(false);
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
                  {['Company', 'Login ID', 'Password', 'Employees', 'Status', 'Date', ''].map(h=>(
                    <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(c => {
                  const cred      = c.company_credentials?.[0] ?? c.company_credentials ?? null;
                  const loginEmail = cred?.login_email ?? null;
                  const pwdKey    = `pwd-${c.id}`;
                  const emailKey  = `email-${c.id}`;
                  const showPwd   = showPwdFor === c.id;
                  return (
                    <tr key={c.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50/60 transition-colors">

                      {/* Company */}
                      <td className="px-5 py-3.5 cursor-pointer" onClick={() => navigate(`/companies/${c.id}`)}>
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-[#EEF0FF] flex items-center justify-center shrink-0 overflow-hidden">
                            {c.logo_url ? (
                              <img src={c.logo_url} alt={c.name} className="w-full h-full object-cover" />
                            ) : (
                              <span className="text-sm font-bold text-[#4c58fa]">{(c.name||'?')[0]}</span>
                            )}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-gray-900">{c.name}</p>
                            <p className="text-xs text-gray-400">{c.email || '—'}</p>
                          </div>
                        </div>
                      </td>

                      {/* Login ID */}
                      <td className="px-5 py-3.5" onClick={e => e.stopPropagation()}>
                        {loginEmail ? (
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-mono text-gray-700 bg-gray-100 px-2 py-1 rounded-lg max-w-[160px] truncate" title={loginEmail}>
                              {loginEmail}
                            </span>
                            <button onClick={() => copyText(loginEmail, emailKey)}
                              className={`w-6 h-6 flex items-center justify-center rounded-md transition-all ${
                                copiedId === emailKey ? 'bg-emerald-100 text-emerald-700' : 'text-gray-400 hover:text-gray-700 hover:bg-gray-100'
                              }`} title="Copy login email">
                              {copiedId === emailKey ? <Check size={11}/> : <Copy size={11}/>}
                            </button>
                          </div>
                        ) : (
                          <span className="text-xs text-gray-300 italic">Not generated</span>
                        )}
                      </td>

                      {/* Password */}
                      <td className="px-5 py-3.5" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-mono text-gray-700 bg-gray-100 px-2 py-1 rounded-lg">
                            {showPwdFor === c.id
                              ? (cred?.login_password || <em className="text-gray-400">—</em>)
                              : '••••••••••••'
                            }
                          </span>
                          <button onClick={() => setShowPwdFor(v => v === c.id ? null : c.id)}
                            className="w-6 h-6 flex items-center justify-center rounded-md text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-all">
                            {showPwdFor === c.id ? <EyeOff size={11}/> : <Eye size={11}/>}
                          </button>
                          {cred?.login_password && (
                            <button onClick={() => copyText(cred.login_password, `pwd-${c.id}`)}
                              className={`w-6 h-6 flex items-center justify-center rounded-md transition-all ${
                                copiedId === `pwd-${c.id}` ? 'bg-emerald-100 text-emerald-700' : 'text-gray-400 hover:text-gray-700 hover:bg-gray-100'
                              }`} title="Copy password">
                              {copiedId === `pwd-${c.id}` ? <Check size={11}/> : <Copy size={11}/>}
                            </button>
                          )}
                          <button onClick={() => handleResetPassword(c)}
                            disabled={resetting}
                            className="w-6 h-6 flex items-center justify-center rounded-md text-gray-400 hover:text-amber-600 hover:bg-amber-50 transition-all"
                            title="Reset password">
                            <RefreshCw size={11} className={resetting ? 'animate-spin' : ''}/>
                          </button>
                        </div>
                      </td>

                      {/* Employees */}
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Users size={13} className="text-[#4c58fa]"/>
                          <span className="font-medium">{c.employee_count || 0}</span>
                          <span className="text-gray-300">/</span>
                          <span>{c.employee_limit || '—'}</span>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-5 py-3.5">
                        {c.status==='Active'    && <span className="badge-green">Active</span>}
                        {c.status==='Trial'     && <span className="badge-orange">Trial</span>}
                        {c.status==='Suspended' && <span className="badge-red">Suspended</span>}
                        {!c.status              && <span className="badge-sand">—</span>}
                      </td>

                      {/* Date */}
                      <td className="px-5 py-3.5 text-xs text-gray-400 whitespace-nowrap">
                        {new Date(c.created_at).toLocaleDateString()}
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-1 justify-end">
                          <button
                            onClick={(e) => { e.stopPropagation(); setDeleteId(c.id); }}
                            className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-rose-600 hover:bg-rose-50 transition-all"
                            title="Delete Company">
                            <Trash2 size={15}/>
                          </button>
                          <button onClick={() => navigate(`/companies/${c.id}`)}
                            className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-[#4c58fa] hover:bg-[#EEF0FF] transition-all">
                            <ChevronRight size={15}/>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {filtered.length===0 && !loading && (
                  <tr><td colSpan={7} className="text-center py-16 text-sm text-gray-400">No companies found.</td></tr>
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
              <input className="input" value={form.name} onChange={e=>set('name',e.target.value)} required />
            </Field>
            <Field label="Company Email">
              <input type="email" className="input" value={form.email} onChange={e=>set('email',e.target.value)} />
            </Field>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Phone">
              <input className="input" value={form.phone} onChange={e=>set('phone',e.target.value)} />
            </Field>
            <Field label="Employee Limit">
              <input type="number" className="input" value={form.employee_limit} onChange={e=>set('employee_limit',e.target.value)} min={1}/>
            </Field>
          </div>
          <Field label="Address">
            <input className="input" value={form.address} onChange={e=>set('address',e.target.value)} />
          </Field>

          {/* Company Logo Section */}
          <div className="flex flex-col sm:flex-row items-center gap-6 p-4 rounded-xl bg-gray-50/50 border border-gray-100/80">
            <div className="relative group shrink-0">
              <div className="w-16 h-16 rounded-xl bg-[#EEF0FF] flex items-center justify-center overflow-hidden border border-gray-200">
                {form.logo_url ? (
                  <img src={form.logo_url} alt="Company Logo" className="w-full h-full object-cover" />
                ) : (
                  <Building2 className="text-[#4c58fa]" size={28} />
                )}
              </div>
            </div>
            <div className="flex-1 space-y-2 w-full">
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-bold text-gray-900 uppercase tracking-wide">Company Logo</p>
                <span className="text-[10px] text-gray-400">under 5MB</span>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-2">
                <label className="btn-secondary text-xs px-3 py-1.5 cursor-pointer text-center whitespace-nowrap">
                  Choose File
                  <input type="file" accept="image/*" className="hidden" onChange={handleLogoChange} />
                </label>
                <input 
                  type="text" 
                  className="input text-xs font-mono h-8 py-1 flex-1" 
                  value={form.logo_url} 
                  onChange={e => set('logo_url', e.target.value)} 
                  placeholder="Or paste logo image URL..."
                />
                {form.logo_url && (
                  <button 
                    type="button" 
                    onClick={() => set('logo_url', '')} 
                    className="btn-ghost text-xs text-rose-600 hover:bg-rose-50 h-8 px-2"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* ── Login Credentials ── */}
          <div className="flex flex-col gap-3 pt-2 border-t border-gray-100">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
              <KeyRound size={12}/> Portal Login Credentials
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Login ID (Email)">
                <input
                  type="email"
                  className="input font-mono"
                  value={form.login_id}
                  onChange={e => set('login_id', e.target.value)}
                  required
                  placeholder="admin@company.com"
                />
              </Field>
              <Field label="Password">
                <div className="relative">
                  <input
                    type={showFormPwd ? 'text' : 'password'}
                    className="input font-mono pr-20"
                    value={form.login_password}
                    onChange={e => set('login_password', e.target.value)}
                    required
                    placeholder="••••••••••••"
                  />
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                    <button type="button" onClick={() => setShowFormPwd(s => !s)}
                      className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors">
                      {showFormPwd ? <EyeOff size={14}/> : <Eye size={14}/>}
                    </button>
                    <button type="button" onClick={autoGenPassword}
                      className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:text-[#4c58fa] hover:bg-[#EEF0FF] transition-colors" title="Auto-generate">
                      <RefreshCw size={13}/>
                    </button>
                  </div>
                </div>
              </Field>
            </div>
            <p className="text-xs text-gray-400">Specify the login ID (email) and password that this company will use to log in to their dashboard.</p>
          </div>

          <div className="flex flex-col gap-3 pt-2 border-t border-gray-100">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Module Access</p>
            <Toggle label="Enable Payroll Module"     value={form.payroll_enabled}     onChange={v=>set('payroll_enabled',v)}/>
            <Toggle label="Enable Performance Module" value={form.performance_enabled} onChange={v=>set('performance_enabled',v)}/>
          </div>
          <div className="flex items-center justify-end gap-3 pt-2 border-t border-gray-100">
            <button type="button" onClick={()=>{setShowModal(false);setForm(BLANK);setShowFormPwd(false);}} className="btn-secondary">Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary">
              {saving ? 'Creating…' : 'Create Company'}
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
        title="Delete Company"
        message="Are you sure you want to delete this company? All associated data, employees, and records will be permanently removed."
        confirmText="Delete Organization"
        type="danger"
      />

      {/* One-time Credentials Modal */}
      <CredentialsModal
        open={showCreds}
        onClose={() => { setShowCreds(false); setNewCreds(null); setCreatedCo(null); }}
        companyName={createdCo?.name ?? ''}
        credentials={newCreds}
        onResetPassword={createdCo ? () => resetCompanyPassword(createdCo.id) : null}
      />
    </div>
  );
}
