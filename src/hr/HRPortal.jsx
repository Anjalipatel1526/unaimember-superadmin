import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Users, LayoutDashboard, CalendarDays, UserPlus, Award, Settings,
  LogOut, Lock, Mail, Eye, EyeOff, Menu, X, ArrowUpRight,
  BriefcaseBusiness, ClipboardList, TrendingUp
} from 'lucide-react';
import { loginCompany } from '../services/companyAuth';
import { supabase, supabaseAdmin } from '../services/supabase';

import HROverview from './views/HROverview';
import HRLeaveManagement from './views/HRLeaveManagement';
import HRRecruitment from './views/HRRecruitment';
import HRPerformance from './views/HRPerformance';
import HRAttendance from './views/HRAttendance';

const SESSION_KEY = 'unai_hr_session';

export default function HRPortal() {
  const { companySlug } = useParams();
  const navigate = useNavigate();

  const [session, setSession] = useState(null);
  const [checkingAuth, setCheckingAuth] = useState(true);

  // Login Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  // Navigation / Mobile State
  const [activeTab, setActiveTab] = useState('overview');
  const [mobileOpen, setMobileOpen] = useState(false);

  // Load session from localStorage + fetch fresh company data
  useEffect(() => {
    const saved = localStorage.getItem(SESSION_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setSession(parsed);

        const slug = (parsed.companyName || 'portal').toLowerCase().replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-');
        if (companySlug !== slug) {
          navigate(`/${slug}/hr`, { replace: true });
        }

        (supabaseAdmin || supabase)
          .from('companies')
          .select('*')
          .eq('id', parsed.companyId)
          .maybeSingle()
          .then(({ data: fresh, error }) => {
            if (!error && fresh) {
              setSession(prev => {
                if (!prev) return null;
                const updated = {
                  ...prev,
                  companyDetails: fresh,
                  companyName: fresh.name
                };
                localStorage.setItem(SESSION_KEY, JSON.stringify(updated));
                return updated;
              });
            }
          });
      } catch (e) {
        localStorage.removeItem(SESSION_KEY);
      }
    }
    setCheckingAuth(false);
  }, [companySlug, navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const data = await loginCompany(email, password);
      localStorage.setItem(SESSION_KEY, JSON.stringify(data));
      setSession(data);
      const slug = (data.companyName || 'portal').toLowerCase().replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-');
      navigate(`/${slug}/hr`);
    } catch (err) {
      setError(err.message || 'Incorrect email or password.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem(SESSION_KEY);
    setSession(null);
    setActiveTab('overview');
    navigate('/hr');
  };

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
        <div className="h-10 w-10 border-4 border-[#4c58fa] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // ────────────────────────────────────────────────────────────
  // RENDER LOGIN PAGE
  // ────────────────────────────────────────────────────────────
  if (!session) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col lg:flex-row font-inter overflow-hidden">
        {/* Left Panel: Branding & Info */}
        <div className="lg:w-1/2 bg-gradient-to-br from-[#4c58fa] to-[#3d45e8] text-white p-12 lg:p-24 flex flex-col justify-between relative overflow-hidden shrink-0">
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10" />
          
          {/* Top Info */}
          <div className="relative z-10 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-[#4c58fa] shadow-lg shadow-white/10">
              <span className="font-extrabold text-xl">U</span>
            </div>
            <span className="text-lg font-bold tracking-tight">UNAI <span className="text-blue-200">Member</span></span>
          </div>

          {/* Centered Pitch */}
          <div className="relative z-10 max-w-md my-12 lg:my-0">
            <div className="inline-flex items-center gap-2 bg-white/10 border border-white/10 px-3 py-1.5 rounded-full mb-6">
              <BriefcaseBusiness size={14} />
              <span className="text-xs font-semibold">HR Console</span>
            </div>
            <h1 className="text-4xl lg:text-5xl font-extrabold leading-tight tracking-tight">
              Human Resources Dashboard
            </h1>
            <p className="text-blue-100/80 mt-6 text-sm lg:text-base leading-relaxed">
              Access your HR console to manage employee lifecycle, track leave & attendance, oversee recruitment pipelines, and monitor team performance metrics.
            </p>
            
            <div className="mt-8 flex items-center gap-2 bg-white/10 border border-white/10 px-4 py-2.5 rounded-full w-fit">
              <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-semibold text-white/90">AES-256 Encrypted Portal Connection</span>
            </div>
          </div>

          {/* Footer Info */}
          <div className="relative z-10 text-xs text-blue-100/50 flex items-center justify-between">
            <span>© 2026 UNAI Member HR SaaS.</span>
            <span className="flex items-center gap-1 hover:text-white cursor-pointer transition-colors">
              Platform status <ArrowUpRight size={12} />
            </span>
          </div>
        </div>

        {/* Right Panel: Login Form */}
        <div className="flex-1 flex items-center justify-center p-8 lg:p-16 bg-[#F8FAFC]">
          <div className="w-full max-w-md space-y-8 animate-in fade-in duration-500">
            <div>
              <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">HR Portal Access</h2>
              <p className="text-sm text-gray-400 font-medium mt-1.5">Sign in with your company credentials.</p>
            </div>

            {error && (
              <div className="bg-rose-50 border border-rose-100 text-rose-600 px-4 py-3 rounded-2xl text-xs font-semibold flex items-center gap-2">
                <span>⚠️ {error}</span>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-5">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Login ID (Email)</label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="hr@company.com"
                    className="input pl-10 h-11"
                    required
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Password</label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="input pl-10 pr-10 h-11"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full btn-primary h-12 rounded-2xl font-bold text-xs shadow-lg shadow-[#4c58fa]/20 flex items-center justify-center gap-2"
              >
                {loading ? 'Authenticating...' : 'Sign In to HR Portal'}
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // ────────────────────────────────────────────────────────────
  // RENDER HR DASHBOARD
  // ────────────────────────────────────────────────────────────
  const { companyDetails } = session;

  const menuItems = [
    { id: 'overview', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'attendance', label: 'Attendance', icon: CalendarDays },
    { id: 'leave', label: 'Leave Manager', icon: ClipboardList },
    { id: 'recruitment', label: 'Recruitment', icon: UserPlus },
    { id: 'performance', label: 'Performance', icon: Award },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-inter text-[#1e293b] selection:bg-[#4c58fa]/10 overflow-x-hidden">
      <div className="relative z-10 flex h-screen overflow-hidden">
        {/* Sidebar */}
        <aside className={`glass-sidebar flex flex-col z-40 transition-all duration-300 ease-in-out w-[280px] ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        } fixed lg:static top-0 bottom-0 left-0 bg-white border-r border-gray-100`}>
          <div className="flex items-center h-20 px-6 shrink-0 justify-between">
            <div className="flex items-center gap-3 min-w-0">
              {session.companyDetails?.logo_url ? (
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white border border-gray-150 overflow-hidden shrink-0">
                  <img src={session.companyDetails.logo_url} alt="Logo" className="w-full h-full object-cover" />
                </div>
              ) : (
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#4c58fa] shadow-lg shadow-[#4c58fa]/20 shrink-0">
                  <span className="text-white font-bold text-xl">{session.companyName?.[0] || 'H'}</span>
                </div>
              )}
              <span className="text-base font-bold tracking-tight text-[#0f172a] truncate" title={session.companyName}>
                {session.companyName}
              </span>
            </div>
            <button onClick={() => setMobileOpen(false)} className="lg:hidden text-gray-400 hover:text-gray-900"><X size={20}/></button>
          </div>

          <nav className="flex-1 overflow-y-auto py-6 px-4 flex flex-col gap-1.5 custom-scrollbar">
            <p className="px-4 text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 mb-2">HR Console</p>
            {menuItems.map(({ id, label, icon: Icon }) => {
              const active = activeTab === id;
              return (
                <button
                  key={id}
                  onClick={() => {
                    setActiveTab(id);
                    setMobileOpen(false);
                  }}
                  className={`group flex items-center gap-3 rounded-xl transition-all duration-200 px-4 py-3 w-full text-left ${
                    active 
                      ? 'bg-[#4c58fa] text-white shadow-lg shadow-[#4c58fa]/20 font-semibold' 
                      : 'text-gray-500 hover:bg-[#4c58fa]/5 hover:text-[#4c58fa]'
                  }`}
                >
                  <Icon size={18} className={`shrink-0 ${active ? 'text-white' : 'group-hover:scale-115 transition-transform'}`} />
                  <span className="text-sm font-semibold">{label}</span>
                  {active && <div className="ml-auto h-1.5 w-1.5 rounded-full bg-white shadow-[0_0_8px_#fff]" />}
                </button>
              );
            })}
          </nav>

          <div className="p-4 mt-auto space-y-3">
            {/* Crafted by badge */}
            <a href="https://unaitech.com" target="_blank" rel="noopener noreferrer" className="flex items-center justify-between px-4 py-3 rounded-2xl bg-[#EEF0FF] border border-[#4c58fa]/10 hover:bg-[#4c58fa]/10 transition-colors group cursor-pointer">
              <div className="flex flex-col">
                <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#4c58fa]/50 leading-none mb-1">Crafted by</span>
                <span className="text-sm font-extrabold tracking-tight text-[#1e293b] leading-none">UNAI<span className="text-[#4c58fa]">TECH</span></span>
              </div>
              <div className="w-7 h-7 rounded-lg bg-[#4c58fa]/10 flex items-center justify-center group-hover:bg-[#4c58fa]/20 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-[#4c58fa] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform"><path d="M7 17L17 7"/><path d="M7 7h10v10"/></svg>
              </div>
            </a>

            <button onClick={handleLogout} className="flex items-center gap-3 p-3 w-full rounded-2xl border border-gray-100 hover:bg-rose-50 text-rose-600 transition-colors font-medium">
              <LogOut size={16} />
              <span className="text-sm">Sign Out Portal</span>
            </button>
          </div>
        </aside>

        {/* Content Wrapper */}
        <main className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
          {/* Top Navbar */}
          <header className="glass-navbar flex h-20 items-center justify-between px-8 bg-white/70 border-b border-gray-100/50 shrink-0">
            <div className="flex items-center gap-4">
              <button onClick={() => setMobileOpen(true)} className="lg:hidden p-2 hover:bg-gray-100 rounded-lg text-gray-500"><Menu size={20}/></button>
              <div className="flex items-center gap-2 bg-[#EEF0FF] border border-[#4c58fa]/10 px-3 py-1.5 rounded-full">
                <BriefcaseBusiness size={14} className="text-[#4c58fa]" />
                <span className="text-xs font-bold text-[#4c58fa]">HR Dashboard</span>
              </div>
            </div>

            <div className="flex items-center gap-6">
              <span className="text-xs font-mono text-gray-400 bg-gray-100 px-2.5 py-1 rounded-lg">
                {session.email}
              </span>
            </div>
          </header>

          {/* Main Area Workspace */}
          <div className="flex-1 overflow-y-auto p-8 custom-scrollbar bg-gray-50/30">
            <div className="mx-auto max-w-7xl relative">
              {activeTab === 'overview' && (
                <HROverview companyId={session.companyId} companyDetails={companyDetails} />
              )}
              {activeTab === 'attendance' && (
                <HRAttendance companyId={session.companyId} />
              )}
              {activeTab === 'leave' && (
                <HRLeaveManagement companyId={session.companyId} />
              )}
              {activeTab === 'recruitment' && (
                <HRRecruitment companyId={session.companyId} companyDetails={companyDetails} />
              )}
              {activeTab === 'performance' && (
                <HRPerformance companyId={session.companyId} />
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
