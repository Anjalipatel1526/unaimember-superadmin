import React, { useState, useRef, useEffect, useCallback } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Building2, BarChart3, Users, Ticket,
  ShieldCheck, Activity, Lock, Bell, History, Settings,
  ChevronLeft, ChevronRight, Search, Plus, Menu, X,
  CalendarDays, User, LogOut, Edit3, Check, Building,
  FileText, AlertCircle, CreditCard, TrendingUp,
} from 'lucide-react';
import { globalSearch } from '../services/search';
import { getNotifications } from '../services/notifications';

const ADMIN_KEY    = 'unai_admin_name';
const getAdminName = () => localStorage.getItem(ADMIN_KEY) || 'Super Admin';
const saveAdminName= (n) => localStorage.setItem(ADMIN_KEY, n);

const NAV_ITEMS = [
  { icon: LayoutDashboard, label: 'Dashboard',          to: '/' },
  { icon: Building2,       label: 'Client Companies',   to: '/companies' },
  { icon: CalendarDays,    label: 'Calendar',           to: '/calendar' },
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

const QUICK_ACTIONS = [
  { icon: Building,   label: 'Add Company',      to: '/companies',  color: 'text-[#4c58fa]', bg: 'bg-[#EEF0FF]' },
  { icon: FileText,   label: 'Create Invoice',   to: '/billing',    color: 'text-emerald-600',bg: 'bg-emerald-50'},
  { icon: Ticket,     label: 'New Ticket',       to: '/support',    color: 'text-orange-600', bg: 'bg-orange-50' },
  { icon: TrendingUp, label: 'View Analytics',   to: '/analytics',  color: 'text-blue-600',  bg: 'bg-blue-50'   },
  { icon: Settings,   label: 'Platform Settings',to: '/settings',   color: 'text-purple-600', bg: 'bg-purple-50' },
  { icon: History,    label: 'Audit Logs',       to: '/logs',       color: 'text-red-600',    bg: 'bg-red-50'    },
];

const RESULT_COLORS = {
  company: 'bg-[#EEF0FF] text-[#4c58fa]',
  invoice: 'bg-emerald-50 text-emerald-700',
  ticket:  'bg-orange-50 text-orange-700',
};
const RESULT_ICONS = { company: Building2, invoice: CreditCard, ticket: Ticket };

/* ── useClickOutside ─── */
function useClickOutside(ref, cb) {
  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) cb(); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [ref, cb]);
}

/* ── Profile Panel ────────────────────────────────────────── */
function ProfilePanel({ onClose }) {
  const [name, setName]   = useState(getAdminName());
  const [editing, setEdit]= useState(false);
  const [draft, setDraft] = useState(name);
  const ref = useRef(null);
  useClickOutside(ref, onClose);

  const save = () => { saveAdminName(draft); setName(draft); setEdit(false); window.dispatchEvent(new Event('adminNameChanged')); };

  return (
    <div ref={ref} className="absolute top-[78px] right-4 z-50 w-80 bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
      <div className="h-20 bg-gradient-to-br from-[#4c58fa] to-[#3d45e8] relative">
        <button onClick={onClose} className="absolute top-3 right-3 text-white/70 hover:text-white"><X size={16}/></button>
      </div>
      <div className="flex flex-col items-center -mt-10 pb-5 px-5">
        <div className="w-20 h-20 rounded-full border-4 border-white bg-[#4c58fa] flex items-center justify-center shadow-lg">
          <span className="text-2xl font-bold text-white">{name[0]?.toUpperCase()}</span>
        </div>
        <div className="mt-3 text-center w-full">
          {editing ? (
            <div className="flex items-center gap-2 mt-1">
              <input value={draft} onChange={e=>setDraft(e.target.value)} className="input text-sm flex-1 h-9 text-center" autoFocus onKeyDown={e=>e.key==='Enter'&&save()}/>
              <button onClick={save} className="w-9 h-9 bg-[#4c58fa] text-white rounded-xl flex items-center justify-center hover:bg-[#3d45e8]"><Check size={14}/></button>
            </div>
          ) : (
            <div className="flex items-center justify-center gap-2">
              <p className="text-base font-bold text-gray-900">{name}</p>
              <button onClick={()=>{setDraft(name);setEdit(true);}} className="text-gray-400 hover:text-[#4c58fa]"><Edit3 size={13}/></button>
            </div>
          )}
          <p className="text-xs text-gray-500 mt-0.5">Super Admin</p>
        </div>
        <div className="w-full mt-4 flex flex-col gap-2 border-t border-gray-100 pt-4">
          {[
            { icon: User,          label: 'Role',     value: 'Super Admin' },
            { icon: AlertCircle,   label: 'Platform', value: 'UNAI Member' },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} className="flex items-center gap-3 px-3 py-2 rounded-xl bg-gray-50">
              <Icon size={14} className="text-[#4c58fa]"/>
              <div>
                <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">{label}</p>
                <p className="text-sm font-semibold text-gray-900">{value}</p>
              </div>
            </div>
          ))}
          <button className="mt-2 flex items-center gap-2 w-full px-4 py-2.5 rounded-xl text-red-600 hover:bg-red-50 text-sm font-medium transition-colors">
            <LogOut size={15}/>Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Notification Panel ─────────────────────────────────────── */
function NotifPanel({ onClose }) {
  const [items,   setItems]   = useState([]);
  const [loading, setLoading] = useState(true);
  const ref = useRef(null);
  useClickOutside(ref, onClose);

  useEffect(() => { getNotifications().then(setItems).catch(()=>{}).finally(()=>setLoading(false)); }, []);

  const typeC = {
    billing:  'bg-orange-50 text-orange-600',
    system:   'bg-[#EEF0FF] text-[#4c58fa]',
    user:     'bg-blue-50 text-blue-600',
    security: 'bg-red-50 text-red-600',
    auth:     'bg-purple-50 text-purple-600',
  };

  return (
    <div ref={ref} className="absolute top-[78px] right-4 z-50 w-96 bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
        <div><p className="text-sm font-bold text-gray-900">Notifications</p><p className="text-xs text-gray-500">Recent platform events</p></div>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-900"><X size={16}/></button>
      </div>
      <div className="max-h-96 overflow-y-auto divide-y divide-gray-100">
        {loading && <div className="p-5 space-y-3">{[...Array(4)].map((_,i)=><div key={i} className="h-12 bg-gray-100 rounded-xl animate-pulse"/>)}</div>}
        {!loading && items.length===0 && <div className="py-12 text-center text-sm text-gray-400">No notifications yet.</div>}
        {items.map(n=>(
          <div key={n.id} className="flex items-start gap-3 px-5 py-3.5 hover:bg-gray-50 transition-colors cursor-pointer">
            <span className={`mt-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded shrink-0 ${typeC[n.type]||'bg-[#EEF0FF] text-[#4c58fa]'}`}>{(n.type||'').toUpperCase()}</span>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-gray-900 leading-snug">{n.action}</p>
              <p className="text-[10px] text-gray-400 mt-0.5">{n.target} · {new Date(n.created_at).toLocaleString()}</p>
            </div>
            <div className={`w-1.5 h-1.5 rounded-full mt-2 shrink-0 ${n.outcome==='Success'?'bg-emerald-500':'bg-red-500'}`}/>
          </div>
        ))}
      </div>
      <div className="px-5 py-3 border-t border-gray-100">
        <button className="text-xs text-[#4c58fa] font-semibold hover:underline">View all in Audit Logs →</button>
      </div>
    </div>
  );
}

/* ── Quick Action Panel ─────────────────────────────────────── */
function QuickActionPanel({ onClose }) {
  const navigate = useNavigate();
  const ref = useRef(null);
  useClickOutside(ref, onClose);

  return (
    <div ref={ref} className="absolute top-[78px] right-4 z-50 w-72 bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
        <div><p className="text-sm font-bold text-gray-900">Quick Actions</p><p className="text-xs text-gray-500">Jump to common tasks</p></div>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-900"><X size={16}/></button>
      </div>
      <div className="p-3 grid grid-cols-2 gap-2">
        {QUICK_ACTIONS.map(a => {
          const Icon = a.icon;
          return (
            <button key={a.label} onClick={()=>{navigate(a.to);onClose();}}
              className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-gray-50 transition-colors group text-center">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${a.bg}`}>
                <Icon size={16} className={a.color}/>
              </div>
              <span className="text-xs font-semibold text-gray-600 group-hover:text-gray-900 leading-tight">{a.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ── Global Search ──────────────────────────────────────────── */
function GlobalSearch() {
  const [q,        setQ]       = useState('');
  const [results,  setResults] = useState([]);
  const [open,     setOpen]    = useState(false);
  const [loading,  setLoading] = useState(false);
  const navigate   = useNavigate();
  const ref        = useRef(null);
  const timerRef   = useRef(null);
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

  const badgeCls = (b) => {
    if (!b) return 'bg-gray-100 text-gray-600';
    if (['Active','Paid','Open'].includes(b)) return 'bg-emerald-50 text-emerald-700';
    if (['Trial','Pending','In Progress'].includes(b)) return 'bg-orange-50 text-orange-600';
    return 'bg-red-50 text-red-600';
  };

  return (
    <div ref={ref} className="relative flex-1 max-w-md">
      <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"/>
      {loading && <div className="absolute right-3 top-1/2 -translate-y-1/2 w-3 h-3 border-2 border-[#4c58fa] border-t-transparent rounded-full animate-spin"/>}
      <input type="text" value={q} onChange={e=>setQ(e.target.value)} onFocus={()=>results.length>0&&setOpen(true)}
        placeholder="Search companies, invoices, tickets…"
        className="w-full pl-9 pr-4 h-10 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#4c58fa]/20 focus:border-[#4c58fa] transition-all"
      />
      {open && results.length>0 && (
        <div className="absolute top-[calc(100%+8px)] left-0 right-0 bg-white rounded-2xl shadow-2xl border border-gray-200 z-50 overflow-hidden">
          <div className="py-2 max-h-80 overflow-y-auto">
            {results.map(r=>{
              const Icon=RESULT_ICONS[r.type]||Building2;
              return (
                <button key={r.type+r.id} onClick={()=>{navigate(r.to);setQ('');setOpen(false);}}
                  className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 text-left transition-colors">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${RESULT_COLORS[r.type]}`}><Icon size={14}/></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">{r.title}</p>
                    <p className="text-xs text-gray-500 truncate">{r.subtitle}</p>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${badgeCls(r.badge)}`}>{r.badge}</span>
                </button>
              );
            })}
          </div>
          <div className="px-4 py-2 border-t border-gray-100 text-[10px] text-gray-400">{results.length} result{results.length!==1?'s':''} for "{q}"</div>
        </div>
      )}
      {open && q.trim().length>=2 && results.length===0 && !loading && (
        <div className="absolute top-[calc(100%+8px)] left-0 right-0 bg-white rounded-2xl shadow-2xl border border-gray-200 z-50 px-5 py-8 text-center text-sm text-gray-400">
          No results for "{q}"
        </div>
      )}
    </div>
  );
}

/* ── Sidebar ────────────────────────────────────────────────── */
function Sidebar({ collapsed, onToggle, mobileOpen, onMobileClose, onProfileOpen }) {
  const location = useLocation();
  const [adminName, setAdminNameState] = useState(getAdminName());

  useEffect(()=>{
    const h=()=>setAdminNameState(getAdminName());
    window.addEventListener('adminNameChanged',h);
    return ()=>window.removeEventListener('adminNameChanged',h);
  },[]);

  const isActive = (to) => to==='/' ? location.pathname==='/' : location.pathname.startsWith(to);

  return (
    <>
      {mobileOpen && <div className="fixed inset-0 z-30 bg-black/30 backdrop-blur-sm lg:hidden" onClick={onMobileClose}/>}
      <aside className={['fixed top-0 left-0 h-screen z-40 flex flex-col bg-white border-r border-gray-200 transition-all duration-300 ease-in-out',
        collapsed?'w-[72px]':'w-[280px]', mobileOpen?'translate-x-0':'-translate-x-full lg:translate-x-0'].join(' ')}>

        {/* Logo */}
        <div className="flex items-center h-[70px] px-4 border-b border-gray-100 shrink-0">
          <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-[#4c58fa] shrink-0">
            <span className="text-white font-bold text-lg leading-none">U</span>
          </div>
          {!collapsed && <span className="ml-3 font-bold text-gray-900 text-base tracking-tight truncate">UNAI MEMBER</span>}
          <button onClick={onMobileClose} className="ml-auto lg:hidden text-gray-400 hover:text-gray-900"><X size={18}/></button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 flex flex-col gap-0.5">
          {NAV_ITEMS.map(({icon:Icon, label, to})=>{
            const active=isActive(to);
            return (
              <NavLink key={to} to={to} onClick={onMobileClose} title={collapsed?label:undefined}
                className={['flex items-center h-11 rounded-xl transition-all duration-150 select-none',
                  collapsed?'justify-center px-0':'px-4 gap-3',
                  active?'bg-[#EEF0FF] text-[#4c58fa] font-semibold':'text-gray-600 hover:bg-gray-100 hover:text-gray-900 font-medium'].join(' ')}>
                <Icon size={18} className="shrink-0"/>
                {!collapsed && <span className="text-sm truncate">{label}</span>}
              </NavLink>
            );
          })}
        </nav>

        {/* Bottom user */}
        {!collapsed && (
          <div className="shrink-0 px-3 pb-4 border-t border-gray-100 pt-3">
            <button onClick={onProfileOpen} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-[#EEF0FF] cursor-pointer transition-all text-left group">
              <div className="w-8 h-8 rounded-full bg-[#4c58fa] flex items-center justify-center shrink-0">
                <span className="text-white font-bold text-sm">{adminName[0]?.toUpperCase()}</span>
              </div>
              <div className="overflow-hidden flex-1">
                <p className="text-sm font-semibold text-gray-900 truncate leading-none">{adminName}</p>
                <p className="text-xs text-gray-500 mt-0.5">Super Admin</p>
              </div>
            </button>
          </div>
        )}

        {/* Collapse toggle */}
        <button onClick={onToggle} className="hidden lg:flex absolute -right-3 top-[86px] w-6 h-6 items-center justify-center bg-white border border-gray-200 rounded-full shadow-sm text-gray-500 hover:text-gray-900 transition-colors z-10">
          {collapsed?<ChevronRight size={12}/>:<ChevronLeft size={12}/>}
        </button>
      </aside>
    </>
  );
}

/* ── Navbar ─────────────────────────────────────────────────── */
function Navbar({ onMenuClick, onProfileOpen }) {
  const [adminName, setAdminNameState] = useState(getAdminName());
  const [showNotif, setShowNotif] = useState(false);
  const [showQuick, setShowQuick] = useState(false);

  useEffect(()=>{
    const h=()=>setAdminNameState(getAdminName());
    window.addEventListener('adminNameChanged',h);
    return ()=>window.removeEventListener('adminNameChanged',h);
  },[]);

  const closeAll = ()=>{setShowNotif(false);setShowQuick(false);};

  return (
    <header className="sticky top-0 z-20 h-[70px] bg-white border-b border-gray-200 shadow-sm flex items-center px-6 gap-4">
      <button onClick={onMenuClick} className="lg:hidden text-gray-500 hover:text-gray-900 p-1.5 rounded-lg hover:bg-gray-100"><Menu size={20}/></button>
      <GlobalSearch/>
      <div className="ml-auto flex items-center gap-3 relative">
        <button onClick={()=>{closeAll();setShowQuick(v=>!v);}} className="btn-primary hidden sm:inline-flex">
          <Plus size={15}/>Quick Action
        </button>
        <button onClick={()=>{closeAll();setShowNotif(v=>!v);}}
          className={`relative w-9 h-9 flex items-center justify-center rounded-xl transition-all ${showNotif?'bg-[#EEF0FF] text-[#4c58fa]':'text-gray-500 hover:bg-gray-100 hover:text-gray-900'}`}>
          <Bell size={18}/>
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white"/>
        </button>
        <button onClick={()=>{closeAll();onProfileOpen();}} className="flex items-center gap-2.5 pl-3 border-l border-gray-200 hover:opacity-80 transition-opacity">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-semibold text-gray-900 leading-none">{adminName}</p>
            <p className="text-xs text-gray-500 mt-0.5">Super Admin</p>
          </div>
          <div className="w-9 h-9 rounded-full bg-[#4c58fa] border-2 border-gray-100 flex items-center justify-center">
            <span className="text-white font-bold text-sm">{adminName[0]?.toUpperCase()}</span>
          </div>
        </button>
        {showNotif && <NotifPanel onClose={()=>setShowNotif(false)}/>}
        {showQuick && <QuickActionPanel onClose={()=>setShowQuick(false)}/>}
      </div>
    </header>
  );
}

/* ── Root Layout ─────────────────────────────────────────────── */
export default function MainLayout({ children }) {
  const [collapsed,   setCollapsed]   = useState(false);
  const [mobileOpen,  setMobileOpen]  = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const sidebarW = collapsed ? 72 : 280;
  const openProfile  = useCallback(()=>setProfileOpen(true), []);
  const closeProfile = useCallback(()=>setProfileOpen(false),[]);

  return (
    <div className="min-h-screen bg-gray-50 font-inter">
      <Sidebar collapsed={collapsed} onToggle={()=>setCollapsed(!collapsed)}
        mobileOpen={mobileOpen} onMobileClose={()=>setMobileOpen(false)} onProfileOpen={openProfile}/>
      <div className="flex flex-col min-h-screen transition-[margin-left] duration-300 ease-in-out" style={{marginLeft:`${sidebarW}px`}}>
        <Navbar onMenuClick={()=>setMobileOpen(true)} onProfileOpen={openProfile}/>
        <main className="flex-1 p-6 md:p-8">{children}</main>
      </div>
      {profileOpen && <ProfilePanel onClose={closeProfile}/>}
      {profileOpen && <div className="fixed inset-0 z-40 bg-black/10" onClick={closeProfile}/>}
    </div>
  );
}
