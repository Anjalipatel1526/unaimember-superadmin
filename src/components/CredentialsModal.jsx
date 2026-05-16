import React, { useState } from 'react';
import { X, Copy, Check, KeyRound, Mail, Eye, EyeOff, RefreshCw, ShieldCheck } from 'lucide-react';

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
      const el = document.createElement('textarea');
      el.value = text;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all active:scale-95 ${
        copied
          ? 'bg-emerald-100 text-emerald-700'
          : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
      }`}
    >
      {copied ? <Check size={13} /> : <Copy size={13} />}
      {copied ? 'Copied!' : 'Copy'}
    </button>
  );
}

function CredField({ icon: Icon, label, value, isPassword }) {
  const [show, setShow] = useState(false);
  const displayed = isPassword && !show ? '•'.repeat(value.length) : value;

  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-semibold text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
        <Icon size={12} />
        {label}
      </label>
      <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3">
        <span className={`flex-1 text-sm font-mono font-semibold text-gray-800 select-all ${isPassword && !show ? 'tracking-wider' : ''}`}>
          {displayed}
        </span>
        {isPassword && (
          <button
            type="button"
            onClick={() => setShow(s => !s)}
            className="text-gray-400 hover:text-gray-700 transition-colors p-1"
          >
            {show ? <EyeOff size={15} /> : <Eye size={15} />}
          </button>
        )}
        <CopyButton text={value} />
      </div>
    </div>
  );
}

export default function CredentialsModal({ open, onClose, companyName, credentials, onResetPassword }) {
  const [resetting, setResetting] = useState(false);
  const [newCreds,  setNewCreds]  = useState(null);

  if (!open || !credentials) return null;

  const displayCreds = newCreds || credentials;

  const handleReset = async () => {
    setResetting(true);
    try {
      const result = await onResetPassword();
      setNewCreds(result);
    } catch (e) {
      alert('Error resetting password: ' + e.message);
    } finally {
      setResetting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">

        {/* Header */}
        <div className="px-6 pt-6 pb-4 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#EEF0FF] flex items-center justify-center">
              <ShieldCheck size={24} className="text-[#4c58fa]" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">Login Credentials</h3>
              <p className="text-xs text-gray-400 mt-0.5">{companyName}</p>
            </div>
          </div>
          <button onClick={onClose} className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-gray-100 text-gray-400 transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Warning banner */}
        <div className="mx-6 mb-4 px-4 py-3 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-2.5">
          <KeyRound size={15} className="text-amber-600 mt-0.5 shrink-0" />
          <p className="text-xs text-amber-700 font-medium leading-relaxed">
            Save these credentials now. The password is shown <strong>only once</strong> and is not stored in the system.
          </p>
        </div>

        {/* Credentials */}
        <div className="px-6 pb-2 flex flex-col gap-4">
          <CredField
            icon={Mail}
            label="Login Email"
            value={displayCreds.email}
          />
          <CredField
            icon={KeyRound}
            label="Password"
            value={displayCreds.password}
            isPassword
          />
        </div>

        {/* Copy All */}
        <div className="px-6 py-3">
          <CopyAllButton email={displayCreds.email} password={displayCreds.password} />
        </div>

        {/* Footer actions */}
        <div className="px-6 py-5 bg-gray-50 border-t border-gray-100 flex items-center gap-3">
          {onResetPassword && (
            <button
              type="button"
              onClick={handleReset}
              disabled={resetting}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm font-bold text-gray-600 hover:bg-gray-100 transition-all active:scale-95 disabled:opacity-50"
            >
              <RefreshCw size={14} className={resetting ? 'animate-spin' : ''} />
              {resetting ? 'Resetting…' : 'Reset Password'}
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-2.5 rounded-xl bg-[#4c58fa] hover:bg-[#3d45e8] text-white text-sm font-bold transition-all shadow-lg shadow-[#4c58fa]/20 active:scale-95"
          >
            Done — I've saved these
          </button>
        </div>
      </div>
    </div>
  );
}

function CopyAllButton({ email, password }) {
  const [copied, setCopied] = useState(false);

  const handleCopyAll = async () => {
    const text = `UNAI Member Login Credentials\n\nEmail:    ${email}\nPassword: ${password}\n\nPortal: https://app.unaimember.com`;
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const el = document.createElement('textarea');
      el.value = text;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <button
      type="button"
      onClick={handleCopyAll}
      className={`w-full flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-bold transition-all active:scale-95 border ${
        copied
          ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
          : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
      }`}
    >
      {copied ? <Check size={15} /> : <Copy size={15} />}
      {copied ? 'All credentials copied!' : 'Copy all credentials'}
    </button>
  );
}
