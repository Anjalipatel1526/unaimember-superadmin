import React, { useState, useRef, useEffect, useCallback } from 'react';
import { NavLink, useLocation, useNavigate, Outlet } from 'react-router-dom';
import {
  LayoutDashboard, Building2, BarChart3, Users, Ticket,
  ShieldCheck, Activity, Lock, Bell, History, Settings,
  ChevronLeft, ChevronRight, Search, Plus, Menu, X,
  CalendarDays, User, LogOut, Edit3, Check, Building,
  FileText, AlertCircle, CreditCard, TrendingUp
} from 'lucide-react';
import { globalSearch } from '../services/search';
import { getNotifications } from '../services/notifications';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';

const cn = (...inputs) => twMerge(clsx(inputs));

const ADMIN_KEY    = 'unai_admin_name';
const getAdminName = () => localStorage.getItem(ADMIN_KEY) || 'Super Admin';
const saveAdminName= (n) => localStorage.setItem(ADMIN_KEY, n);

const NAV_ITEMS = [
  { icon: LayoutDashboard, label: 'Dashboard',          to: '/' },
  { icon: Building2,       label: 'Client Companies',   to: '/companies' },
  { icon: BarChart3,       label: 'Revenue & Billing',  to: '/billing' },
  { icon: Users,           label: 'Employee Analytics', to: '/analytics' },
  { icon: Ticket,          label: 'Support Tickets',    to: '/support' },
  { icon: ShieldCheck,     label: 'Feature Management', to: '/features' },
  { icon: Activity,        label: 'System Monitoring',  to: '/monitoring' },
  { icon: Lock,            label: 'Roles & Permissions',to: '/permissions' },
  { icon: Bell,            label: 'Notifications',      to: '/notifications' },
  { icon: History,         label: 'Audit Logs',         to: '/logs' },
  { icon: Settings,        label: 'Platform Settings',  to: '/settings' },
];

const RESULT_COLORS = { company: 'bg-[#EEF0FF] text-[#4c58fa]', invoice: 'bg-emerald-50 text-emerald-700', ticket: 'bg-orange-50 text-orange-700' };
const RESULT_ICONS  = { company: Building2, invoice: CreditCard, ticket: Ticket };

function useClickOutside(ref, cb) {
  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) cb(); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [ref, cb]);
}

/* ── Panels ─────────────────────────────────────────────────── */
function ProfilePanel({ onClose }) {
  const [name, setName] = useState(getAdminName());
  const [editing, setEdit] = useState(false);
  const [draft, setDraft] = useState(name);
  const ref = useRef(null);
  useClickOutside(ref, onClose);
  const save = () => { saveAdminName(draft); setName(draft); setEdit(false); window.dispatchEvent(new Event('adminNameChanged')); };

  return (
    <div ref={ref} className="absolute top-[78px] right-4 z-50 w-80 glass-card rounded-2xl overflow-hidden shadow-2xl">
      <div className="h-20 bg-gradient-to-br from-[#4c58fa] to-[#3d45e8] relative">
        <button onClick={onClose} className="absolute top-3 right-3 text-white/70 hover:text-white"><X size={16}/></button>
      </div>
      <div className="flex flex-col items-center -mt-10 pb-5 px-5 relative z-10">
        <div className="w-20 h-20 rounded-full border-4 border-white bg-[#4c58fa] flex items-center justify-center shadow-lg">
          <span className="text-2xl font-bold text-white">{name[0]?.toUpperCase()}</span>
        </div>
        <div className="mt-3 text-center w-full">
          {editing ? (
            <div className="flex items-center gap-2 mt-1 px-4">
              <input value={draft} onChange={e=>setDraft(e.target.value)} className="input text-sm flex-1 h-9 text-center" autoFocus onKeyDown={e=>e.key==='Enter'&&save()}/>
              <button onClick={save} className="w-9 h-9 bg-[#4c58fa] text-white rounded-xl flex items-center justify-center shrink-0"><Check size={14}/></button>
            </div>
          ) : (
            <div className="flex items-center justify-center gap-2">
              <p className="text-base font-bold text-gray-900">{name}</p>
              <button onClick={()=>{setDraft(name);setEdit(true);}} className="text-gray-400 hover:text-[#4c58fa] transition-colors"><Edit3 size={13}/></button>
            </div>
          )}
          <p className="text-xs text-gray-500 mt-0.5">Super Admin</p>
        </div>
        <div className="w-full mt-4 flex flex-col gap-2 border-t border-gray-100 pt-4">
          <div className="flex items-center gap-3 px-3 py-2 rounded-xl bg-gray-50/50">
            <User size={14} className="text-[#4c58fa]"/>
            <div className="text-left"><p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider leading-none">Role</p><p className="text-sm font-semibold text-gray-900">Super Admin</p></div>
          </div>
          <button className="mt-2 flex items-center gap-2 w-full px-4 py-2.5 rounded-xl text-red-600 hover:bg-red-50 text-sm font-medium transition-colors">
            <LogOut size={15}/>Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}

function NotifPanel({ onClose }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const ref = useRef(null);
  useClickOutside(ref, onClose);
  useEffect(() => { getNotifications().then(setItems).catch(()=>{}).finally(()=>setLoading(false)); }, []);
  const typeC = { billing: 'bg-orange-50 text-orange-600', system: 'bg-[#EEF0FF] text-[#4c58fa]', user: 'bg-blue-50 text-blue-600' };

  return (
    <div ref={ref} className="absolute top-[78px] right-4 z-50 w-96 glass-card rounded-2xl overflow-hidden shadow-2xl">
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100/50">
        <div><p className="text-sm font-bold text-gray-900">Notifications</p><p className="text-xs text-gray-500">Recent platform events</p></div>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-900 transition-colors"><X size={16}/></button>
      </div>
      <div className="max-h-96 overflow-y-auto divide-y divide-gray-100/50">
        {loading ? <div className="p-5 space-y-3">{[...Array(4)].map((_,i)=><div key={i} className="h-12 bg-gray-100/50 rounded-xl animate-pulse"/>)}</div> :
         items.length===0 ? <div className="py-12 text-center text-sm text-gray-400">No notifications.</div> :
         items.map(n=>(
          <div key={n.id} className="flex items-start gap-3 px-5 py-3.5 hover:bg-white/50 transition-colors cursor-pointer group">
            <span className={`mt-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded shrink-0 ${typeC[n.type]||'bg-gray-100 text-gray-600'}`}>{(n.type||'').toUpperCase()}</span>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-gray-900 group-hover:text-[#4c58fa] transition-colors leading-snug">{n.action}</p>
              <p className="text-[10px] text-gray-400 mt-0.5 truncate">{n.target} · {new Date(n.created_at).toLocaleDateString()}</p>
            </div>
            <div className={`w-1.5 h-1.5 rounded-full mt-2 shrink-0 ${n.outcome==='Success'?'bg-emerald-500':'bg-red-500'} shadow-[0_0_8px_currentColor]`}/>
          </div>
        ))}
      </div>
    </div>
  );
}

function GlobalSearch() {
  const [q, setQ] = useState('');
  const [results, setResults] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const ref = useRef(null);
  const timerRef = useRef(null);
  useClickOutside(ref, ()=>setOpen(false));

  useEffect(()=>{
    if (q.trim().length<2) { setResults([]); setOpen(false); return; }
    setLoading(true);
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(async()=>{
      try { const r = await globalSearch(q); setResults(r); setOpen(true); }
      catch { setResults([]); }
      finally { setLoading(false); }
    }, 350);
    return ()=>clearTimeout(timerRef.current);
  },[q]);

  return (
    <div ref={ref} className="relative flex-1 max-w-md group">
      <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#4c58fa] transition-colors"/>
      <input type="text" value={q} onChange={e=>setQ(e.target.value)} onFocus={()=>results.length>0&&setOpen(true)}
        placeholder="Search anything..."
        className="w-full pl-9 pr-4 h-11 rounded-full border border-gray-200 bg-white/80 text-sm focus:bg-white focus:ring-4 focus:ring-[#4c58fa]/5 focus:border-[#4c58fa] transition-all outline-none"
      />
      {open && results.length>0 && (
        <div className="absolute top-[calc(100%+8px)] left-0 right-0 glass-card rounded-2xl z-50 overflow-hidden shadow-2xl">
          <div className="py-2 max-h-80 overflow-y-auto">
            {results.map(r=>(
              <button key={r.type+r.id} onClick={()=>{navigate(r.to);setQ('');setOpen(false);}} className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-[#4c58fa]/5 text-left transition-colors">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${RESULT_COLORS[r.type]}`}><CreditCard size={14}/></div>
                <div className="flex-1 min-w-0"><p className="text-sm font-semibold text-gray-900 truncate">{r.title}</p><p className="text-xs text-gray-500 truncate">{r.subtitle}</p></div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Main Layout ────────────────────────────────────────────── */
export default function MainLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [adminName, setAdminName] = useState(getAdminName());
  const [showNotif, setShowNotif] = useState(false);
  const location = useLocation();

  useEffect(()=>{
    const h=()=>setAdminName(getAdminName());
    window.addEventListener('adminNameChanged',h);
    return ()=>window.removeEventListener('adminNameChanged',h);
  },[]);

  const sidebarW = collapsed ? 80 : 280;
  const isActive = (to) => to==='/' ? location.pathname==='/' : location.pathname.startsWith(to);

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-inter text-[#1e293b] selection:bg-[#4c58fa]/10 overflow-x-hidden">
      
      <div className="relative z-10 flex h-screen overflow-hidden">
        
        {/* Sidebar */}
        <aside className={cn('glass-sidebar flex flex-col z-40 transition-all duration-300 ease-in-out',
          collapsed?'w-[80px]':'w-[280px]', mobileOpen?'translate-x-0':'-translate-x-full lg:translate-x-0')}>
          
          <div className="flex items-center h-20 px-6 shrink-0 relative">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#4c58fa] shadow-lg shadow-[#4c58fa]/20">
              <span className="text-white font-bold text-xl">U</span>
            </div>
            {!collapsed && <span className="ml-3 text-lg font-bold tracking-tight text-[#0f172a]">UNAI <span className="text-[#4c58fa]">Member</span></span>}
            <button onClick={()=>setMobileOpen(false)} className="ml-auto lg:hidden text-gray-400"><X size={20}/></button>
          </div>

          <nav className="flex-1 overflow-y-auto py-6 px-4 flex flex-col gap-1.5 custom-scrollbar">
            <p className={cn('px-4 text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 mb-2', collapsed?'hidden':'block')}>System Menu</p>
            {NAV_ITEMS.map(({icon:Icon, label, to})=>{
              const active = isActive(to);
              return (
                <NavLink key={to} to={to} onClick={()=>setMobileOpen(false)} className={cn(
                  "group flex items-center gap-3 rounded-xl transition-all duration-200",
                  collapsed ? "justify-center h-12 w-12 mx-auto" : "px-4 py-3",
                  active ? "bg-[#4c58fa] text-white shadow-lg shadow-[#4c58fa]/20" : "text-gray-500 hover:bg-[#4c58fa]/5 hover:text-[#4c58fa]"
                )}>
                  <Icon size={active?20:18} className={cn("shrink-0", active?"text-white":"group-hover:scale-110 transition-transform")}/>
                  {!collapsed && <span className="text-sm font-semibold">{label}</span>}
                  {active && !collapsed && <div className="ml-auto h-1.5 w-1.5 rounded-full bg-white shadow-[0_0_8px_#fff]" />}
                </NavLink>
              );
            })}
          </nav>

          <div className="p-4 mt-auto">
            <button onClick={()=>setProfileOpen(true)} className={cn(
              "flex items-center gap-3 rounded-2xl hover:bg-white transition-all cursor-pointer border border-transparent hover:border-gray-200",
              collapsed ? "h-12 w-12 justify-center mx-auto" : "p-3 w-full"
            )}>
              <div className="w-9 h-9 rounded-full bg-[#4c58fa] flex items-center justify-center text-white font-bold text-sm shadow-md">{adminName[0]}</div>
              {!collapsed && <div className="flex-1 overflow-hidden"><p className="text-sm font-bold text-gray-900 truncate">{adminName}</p><p className="text-[10px] text-gray-400 font-medium">Platform Admin</p></div>}
            </button>
          </div>
        </aside>

        {/* Content */}
        <main className="flex-1 flex flex-col min-w-0">
          
          {/* Top Navbar */}
          <header className="glass-navbar flex h-20 items-center justify-between px-8">
            <div className="flex items-center gap-4 flex-1">
              <button onClick={()=>setMobileOpen(true)} className="lg:hidden p-2 hover:bg-gray-100 rounded-lg"><Menu size={20}/></button>
              <GlobalSearch />
            </div>

            <div className="flex items-center gap-6">
              <div className="hidden md:flex items-center gap-2 rounded-full border border-gray-200 bg-white px-3 py-1.5 shadow-sm">
                <div className="h-2 w-2 rounded-full bg-emerald-500" />
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">System: Optimal</span>
              </div>

              <button onClick={()=>setShowNotif(!showNotif)} className="relative group">
                <Bell className="h-5 w-5 text-gray-400 group-hover:text-[#4c58fa] transition-colors" />
                <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-rose-500 shadow-[0_0_8px_#f43f5e]" />
              </button>

              <div className="h-8 w-px bg-gray-200" />
              
              <button onClick={()=>setProfileOpen(true)} className="flex items-center gap-3 group">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-bold text-gray-900 leading-none group-hover:text-[#4c58fa] transition-colors">{adminName}</p>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Super Admin</p>
                </div>
              </button>
            </div>
            {showNotif && <NotifPanel onClose={()=>setShowNotif(false)} />}
          </header>

          {/* Main Area */}
          <div className="flex-1 overflow-y-auto p-8 custom-scrollbar bg-gray-50/30">
            <div className="mx-auto max-w-7xl relative">
              <Outlet />
            </div>
          </div>
        </main>
      </div>

      {profileOpen && <ProfilePanel onClose={()=>setProfileOpen(false)} />}
      {profileOpen && <div className="fixed inset-0 z-40 bg-black/5 backdrop-blur-sm" onClick={()=>setProfileOpen(false)} />}
    </div>
  );
}
