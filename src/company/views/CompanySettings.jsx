import React, { useState } from 'react';
import { Settings, Save, AlertCircle, Building2, Mail, Phone, MapPin } from 'lucide-react';
import { updateCompany } from '../../services/companies';

function Field({ label, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{label}</label>
      {children}
    </div>
  );
}

export default function CompanySettings({ companyId, companyDetails, onUpdateCompany }) {
  const [form, setForm] = useState({
    email: companyDetails?.email || '',
    phone: companyDetails?.phone || '',
    address: companyDetails?.address || '',
    logo_url: companyDetails?.logo_url || '',
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleLogoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert('Please upload an image smaller than 5MB.');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setForm(f => ({ ...f, logo_url: reader.result }));
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    try {
      const result = await updateCompany(companyId, form);
      if (onUpdateCompany) {
        onUpdateCompany(result);
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      alert('Error updating profile: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Portal Settings</h1>
        <p className="text-sm text-gray-500 mt-1">Manage your organization's public credentials and contact details.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Details form */}
        <div className="lg:col-span-2 glass-card p-6 rounded-3xl bg-white">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex items-center gap-2 border-b border-gray-100 pb-4">
              <Building2 className="text-[#4c58fa]" size={18} />
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Company Profile</h3>
            </div>

            {/* Logo upload section */}
            <div className="flex flex-col sm:flex-row items-center gap-6 p-5 rounded-2xl bg-gray-50/50 border border-gray-100/80">
              <div className="relative group shrink-0">
                <div className="w-20 h-20 rounded-2xl bg-[#EEF0FF] flex items-center justify-center overflow-hidden border border-gray-200">
                  {form.logo_url ? (
                    <img src={form.logo_url} alt="Company Logo" className="w-full h-full object-cover" />
                  ) : (
                    <Building2 className="text-[#4c58fa]" size={32} />
                  )}
                </div>
              </div>
              <div className="flex-1 space-y-2.5 w-full">
                <p className="text-xs font-bold text-gray-900 uppercase tracking-wide">Company Logo</p>
                <p className="text-xs text-gray-400">Use a square image file (PNG/JPG) under 5MB, or paste an image URL.</p>
                
                <div className="flex flex-col sm:flex-row gap-3">
                  <label className="btn-secondary text-xs px-4 py-2 cursor-pointer text-center whitespace-nowrap">
                    Choose Image File
                    <input type="file" accept="image/*" className="hidden" onChange={handleLogoChange} />
                  </label>
                  <input 
                    type="text" 
                    className="input text-xs font-mono h-9 py-1 flex-1" 
                    value={form.logo_url} 
                    onChange={e => setForm(f => ({ ...f, logo_url: e.target.value }))} 
                    placeholder="Or paste image URL here..."
                  />
                  {form.logo_url && (
                    <button 
                      type="button" 
                      onClick={() => setForm(f => ({ ...f, logo_url: '' }))} 
                      className="btn-ghost text-xs text-rose-600 hover:bg-rose-50 h-9 px-3"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Company Name">
                <input className="input bg-gray-50 text-gray-400 cursor-not-allowed" value={companyDetails?.name || ''} disabled />
              </Field>
              <Field label="Contact Email">
                <input type="email" className="input" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required />
              </Field>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Phone Number">
                <input className="input" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
              </Field>
              <Field label="Address">
                <input className="input" value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} />
              </Field>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
              {saved && (
                <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                  <Save size={12} /> Changes saved successfully!
                </span>
              )}
              <div className="flex-1 text-right">
                <button type="submit" disabled={saving} className="btn-primary flex items-center gap-1.5 self-start ml-auto">
                  <Save size={14}/> {saving ? 'Saving...' : 'Save Settings'}
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* Subscription Plan Card */}
        <div className="glass-card p-6 rounded-3xl bg-gradient-to-br from-[#4c58fa] to-[#3d45e8] text-white flex flex-col justify-between relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10" />
          <div className="relative z-10 space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <h4 className="text-sm font-bold uppercase tracking-widest text-blue-100">Plan Details</h4>
              <span className="bg-white/20 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
                {companyDetails?.status || 'Active'}
              </span>
            </div>
            
            <div>
              <p className="text-xs text-blue-100/60">Subscription Tier</p>
              <p className="text-3xl font-extrabold tracking-tight mt-1">
                {companyDetails?.plan_id ? 'Enterprise Plan' : 'Standard Tier'}
              </p>
            </div>

            <div className="space-y-2.5 pt-2">
              <div className="flex justify-between text-xs text-blue-100/80">
                <span>Employee Limit</span>
                <span className="font-bold">{companyDetails?.employee_limit || 50} Staff</span>
              </div>
              <div className="flex justify-between text-xs text-blue-100/80">
                <span>Active Modules</span>
                <span className="font-bold">
                  {[
                    companyDetails?.payroll_enabled && 'Payroll',
                    companyDetails?.performance_enabled && 'Performance'
                  ].filter(Boolean).join(', ') || 'Core HR'}
                </span>
              </div>
            </div>
          </div>
          
          <div className="mt-8 relative z-10 bg-white/10 p-3 rounded-2xl border border-white/5 flex items-start gap-2.5">
            <AlertCircle className="text-blue-200 shrink-0" size={16} />
            <p className="text-[10px] text-blue-100/80 leading-relaxed">
              Need to upgrade your subscription plan or employee limits? Contact UNAI Platform Administration to unlock advanced features.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
