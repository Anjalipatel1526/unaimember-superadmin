import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Lock, Mail, Eye, EyeOff, User, AlertTriangle } from 'lucide-react';
import { supabase, supabaseAdmin, resolveTenantTableName } from '../services/supabase';

export default function EmployeeLogin() {
  const { companySlug } = useParams();
  const navigate = useNavigate();

  const [company, setCompany] = useState(null);
  const [loadingCompany, setLoadingCompany] = useState(true);

  // Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  // Fetch Company details by slug
  useEffect(() => {
    const fetchCompany = async () => {
      try {
        setLoadingCompany(true);
        const { data: cos, error: cosErr } = await (supabaseAdmin || supabase)
          .from('companies')
          .select('*');
        if (cosErr) throw cosErr;

        const matched = (cos || []).find(c => {
          const s = c.name.toLowerCase().replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-');
          return s === companySlug;
        });

        if (matched) {
          setCompany(matched);
        } else {
          // Fallback to Story Seed Studio if the slug is sss or invalid
          const { data: sssCompany } = await (supabaseAdmin || supabase)
            .from('companies')
            .select('*')
            .ilike('name', '%story%seed%')
            .maybeSingle();
          setCompany(sssCompany);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingCompany(false);
      }
    };

    if (companySlug) {
      fetchCompany();
    }
  }, [companySlug]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (!email.trim() || !password.trim()) {
      setError("Please fill out both email/User ID and password.");
      setLoading(false);
      return;
    }

    try {
      if (!company) {
        throw new Error("Company details could not be resolved. Please try again.");
      }

      const slug = company.name.toLowerCase().replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-');

      // 1. Try to find user in the employees table under this company
      const tableName = await resolveTenantTableName(company.id, 'employees');
      const { data: emps, error: empErr } = await (supabaseAdmin || supabase)
        .from(tableName)
        .select('*')
        .eq('company_id', company.id);

      if (empErr) throw empErr;

      const match = (emps || []).find(emp => {
        let meta = {};
        try {
          const rawMeta = emp.pf_number || emp.metadata;
          meta = typeof rawMeta === 'string' ? JSON.parse(rawMeta) : (rawMeta || {});
        } catch (e) {
          meta = {};
        }
        const empEmail = (meta.email || emp.email || '').toLowerCase().trim();
        return empEmail === email.toLowerCase().trim();
      });

      if (match) {
        // Handle Employee Login
        let meta = {};
        try {
          const rawMeta = match.pf_number || match.metadata;
          meta = typeof rawMeta === 'string' ? JSON.parse(rawMeta) : (rawMeta || {});
        } catch (e) {
          meta = {};
        }
        const correctPassword = meta.password || '123456';

        if (password !== correctPassword) {
          throw new Error("Incorrect password. Please try again.");
        }

        const designation = (match.designation || meta.designation || '').toLowerCase();

        if (designation.includes('hr')) {
          const sessionData = {
            companyId: company.id,
            companyName: company.name,
            email: match.email,
            role: 'HR',
            companyDetails: company,
            employeeDetails: match
          };
          localStorage.setItem('unai_hr_session', JSON.stringify(sessionData));
          navigate(`/${slug}/hr`);
        } else if (designation.includes('manager')) {
          const sessionData = {
            companyId: company.id,
            companyName: company.name,
            email: match.email,
            role: 'Manager',
            companyDetails: company,
            employeeDetails: match
          };
          localStorage.setItem('unai_manager_session', JSON.stringify(sessionData));
          navigate(`/${slug}/manager`);
        } else {
          // Staff
          localStorage.setItem('sss_employee_session_id', match.id);
          navigate(`/${slug}/employee`);
        }
        return;
      }

      // 2. If not found in employees, check if it's a company partner admin in company_credentials
      const { data: creds, error: credsErr } = await (supabaseAdmin || supabase)
        .from('company_credentials')
        .select('*')
        .eq('company_id', company.id)
        .ilike('login_email', email)
        .eq('is_active', true)
        .maybeSingle();

      if (credsErr) throw credsErr;

      if (creds) {
        if (creds.login_password !== password) {
          throw new Error("Incorrect password. Please try again.");
        }

        // Update last_login_at
        await (supabaseAdmin || supabase)
          .from('company_credentials')
          .update({ last_login_at: new Date().toISOString() })
          .eq('id', creds.id);

        const sessionData = {
          companyId: company.id,
          companyName: company.name,
          email: creds.login_email,
          role: creds.role,
          companyDetails: company
        };
        localStorage.setItem('unai_company_session', JSON.stringify(sessionData));
        navigate(`/${slug}`);
        return;
      }

      // 3. Neither employee nor admin found under this company
      throw new Error("No employee or admin profile found with this email/User ID under this company.");

    } catch (err) {
      console.error(err);
      setError(err.message || "An authentication error occurred.");
    } finally {
      setLoading(false);
    }
  };

  if (loadingCompany) {
    return (
      <div className="min-h-screen bg-[#F0F2F8] flex items-center justify-center">
        <div className="h-10 w-10 border-4 border-[#4F6AF7] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F0F2F8] font-inter flex flex-col items-center justify-center p-4">
      <div className="bg-white/80 backdrop-blur-xl border border-gray-150 p-8 rounded-3xl shadow-xl w-full max-w-md space-y-6 text-center">
        
        {/* Header */}
        <div className="flex flex-col items-center gap-2">
          {company && company.logo_url ? (
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white border border-gray-100 overflow-hidden shrink-0 shadow-sm">
              <img src={company.logo_url} alt="Logo" className="w-full h-full object-cover" />
            </div>
          ) : (
            <div className="w-12 h-12 bg-gradient-to-br from-[#4F6AF7] to-[#8094FF] rounded-2xl flex items-center justify-center text-white shadow-lg shadow-[#4F6AF7]/20">
              <User size={24} />
            </div>
          )}
          
          <h1 className="text-xl font-extrabold text-gray-900 tracking-tight mt-2">
            {companySlug || 'company'}<span className="text-[#4F6AF7]">/login</span>
          </h1>
          <p className="text-xs text-gray-400">Employee Portal</p>
        </div>

        {error && (
          <div className="bg-rose-50 border border-rose-100 text-rose-600 px-4 py-3 rounded-2xl text-xs font-semibold flex items-center gap-2 text-left">
            <AlertTriangle size={14} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4 text-left">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Email / User ID</label>
            <div className="relative">
              <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="name@company.com"
                className="w-full h-11 pl-10 pr-4 text-sm rounded-2xl border border-gray-200 focus:outline-none focus:border-[#4F6AF7] bg-white transition-colors"
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
                placeholder="••••••••"
                className="w-full h-11 pl-10 pr-10 text-sm rounded-2xl border border-gray-200 focus:outline-none focus:border-[#4F6AF7] bg-white transition-colors"
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
            className="w-full bg-[#4F6AF7] hover:bg-[#3d58e5] text-white h-11 rounded-2xl font-bold text-xs shadow-lg shadow-[#4F6AF7]/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50 mt-2"
          >
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

      </div>
    </div>
  );
}
