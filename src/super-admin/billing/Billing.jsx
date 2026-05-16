import React, { useEffect, useState } from 'react';
import {
  TrendingUp, Clock, AlertCircle, CheckCircle2,
  Download, Search, MoreHorizontal, Mail, Plus, X
} from 'lucide-react';
import { getInvoices, getBillingStats, createInvoice, nextInvoiceNumber } from '../../services/billing';
import { getCompanies } from '../../services/companies';
import DatePicker from '../../components/DatePicker';

/* ── KPI Card ───────────────────────────────────────────────── */
function KPICard({ icon: Icon, title, value, sub, loading }) {
  return (
    <div className="card-hover flex flex-col gap-4">
      <div className="w-11 h-11 rounded-xl bg-[#EEF0FF] flex items-center justify-center">
        <Icon size={20} className="text-[#4c58fa]"/>
      </div>
      <div>
        <p className="text-sm text-gray-500 font-medium">{title}</p>
        {loading
          ? <div className="h-8 w-24 bg-gray-100 rounded-lg animate-pulse mt-1"/>
          : <p className="text-2xl font-bold text-gray-900 tracking-tight mt-1">{value}</p>
        }
        {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

/* ── Add Invoice Modal ──────────────────────────────────────── */
function AddInvoiceModal({ open, onClose, onSaved }) {
  const [companies, setCompanies] = useState([]);
  const [invNo,     setInvNo]     = useState('');
  const [saving,    setSaving]    = useState(false);
  const [form, setForm] = useState({
    company_id: '', amount: '', due_date: '', status: 'Pending', notes: '',
  });

  useEffect(() => {
    if (!open) return;
    getCompanies().then(setCompanies).catch(()=>{});
    nextInvoiceNumber().then(setInvNo).catch(()=>setInvNo('INV-0001'));
  }, [open]);

  if (!open) return null;

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.company_id || !form.amount || !form.due_date) {
      alert('Please fill in Company, Amount, and Due Date.');
      return;
    }
    setSaving(true);
    try {
      const inv = await createInvoice({
        invoice_number: invNo,
        company_id:     form.company_id,
        amount:         Number(form.amount),
        due_date:       form.due_date,
        status:         form.status,
        notes:          form.notes || null,
      });
      onSaved(inv);
      onClose();
      setForm({ company_id:'', amount:'', due_date:'', status:'Pending', notes:'' });
    } catch (err) {
      alert('Error saving invoice: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/25 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <div>
            <h3 className="text-base font-bold text-gray-900">Add New Invoice</h3>
            <p className="text-xs text-gray-400 mt-0.5">Invoice # <span className="font-mono font-semibold text-[#4c58fa]">{invNo}</span></p>
          </div>
          <button onClick={onClose} className="btn-ghost w-8 h-8 flex items-center justify-center p-0"><X size={18}/></button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-6 flex flex-col gap-5">
          {/* Company */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Company *</label>
            <select className="input" value={form.company_id} onChange={e=>set('company_id',e.target.value)} required>
              <option value="">Select company…</option>
              {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>

          {/* Amount + Status */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Amount (₹) *</label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm">₹</span>
                <input type="number" min="1" step="0.01" className="input pl-7" value={form.amount} onChange={e=>set('amount',e.target.value)} required placeholder="0.00"/>
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</label>
              <select className="input" value={form.status} onChange={e=>set('status',e.target.value)}>
                <option value="Pending">Pending</option>
                <option value="Paid">Paid</option>
                <option value="Failed">Failed</option>
              </select>
            </div>
          </div>

          {/* Due Date — custom picker */}
          <DatePicker
            label="Due Date *"
            value={form.due_date}
            onChange={v => set('due_date', v)}
            placeholder="Pick due date…"
          />

          {/* Notes */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Notes</label>
            <textarea className="input resize-none" rows={2} value={form.notes} onChange={e=>set('notes',e.target.value)} placeholder="Optional notes…"/>
          </div>

          {/* Summary preview */}
          {form.company_id && form.amount && (
            <div className="rounded-xl bg-[#EEF0FF] border border-[#4c58fa]/20 px-4 py-3 flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500">Invoice Preview</p>
                <p className="text-sm font-bold text-gray-900">{invNo} · {companies.find(c=>c.id===form.company_id)?.name}</p>
              </div>
              <p className="text-lg font-bold text-[#4c58fa]">₹{Number(form.amount).toLocaleString()}</p>
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-2 border-t border-gray-100">
            <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary">
              {saving ? 'Saving…' : 'Create Invoice'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ── Billing Page ───────────────────────────────────────────── */
const fmt = n => n >= 1000000 ? `₹${(n/1000000).toFixed(2)}M` : n >= 1000 ? `₹${(n/1000).toFixed(1)}k` : `₹${n}`;

export default function Billing() {
  const [invoices, setInvoices] = useState([]);
  const [stats,    setStats]    = useState(null);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState(null);
  const [search,   setSearch]   = useState('');
  const [showAdd,  setShowAdd]  = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const [invs, s] = await Promise.all([getInvoices(), getBillingStats()]);
        setInvoices(invs);
        setStats(s);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleSaved = (inv) => {
    setInvoices(prev => [inv, ...prev]);
    // refresh stats
    getBillingStats().then(setStats).catch(()=>{});
  };

  const filtered = invoices.filter(inv =>
    (inv.invoice_number || '').toLowerCase().includes(search.toLowerCase()) ||
    (inv.companies?.name || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Revenue & Billing</h1>
          <p className="text-sm text-gray-500 mt-1">Track financial performance and manage client invoices.</p>
        </div>
        <button onClick={() => setShowAdd(true)} className="btn-primary">
          <Plus size={15}/>Add Invoice
        </button>
      </div>


      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <KPICard icon={TrendingUp}   title="Total Revenue"       value={stats ? fmt(stats.totalRevenue) : '—'} sub="All paid invoices"    loading={loading}/>
        <KPICard icon={CheckCircle2} title="Monthly Recurring"   value={stats ? fmt(stats.mrr)          : '—'} sub="MRR this month"       loading={loading}/>
        <KPICard icon={Clock}        title="Pending Invoices"    value={stats ? stats.pending            : '—'} sub="Awaiting payment"     loading={loading}/>
        <KPICard icon={AlertCircle}  title="Failed Transactions" value={stats ? stats.failed             : '—'} sub="Requires attention"   loading={loading}/>
      </div>

      {/* Invoice Table */}
      <div className="card p-0 overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 px-6 py-4 border-b border-gray-100">
          <div className="relative flex-1 max-w-sm">
            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"/>
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search invoices…" className="input pl-9 h-10"/>
          </div>
          <button className="btn-secondary ml-auto"><Download size={14}/>Download Reports</button>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-6 space-y-3">{[...Array(4)].map((_,i)=><div key={i} className="h-12 bg-gray-100 rounded-xl animate-pulse"/>)}</div>
          ) : (
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  {['Invoice ID','Company','Amount','Due Date','Status',''].map(h=>(
                    <th key={h} className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(inv=>(
                  <tr key={inv.id} className="table-row border-b border-gray-100 last:border-0">
                    <td className="px-6 py-4 text-sm font-mono font-semibold text-[#4c58fa]">{inv.invoice_number}</td>
                    <td className="px-6 py-4 text-sm font-semibold text-gray-900">{inv.companies?.name ?? '—'}</td>
                    <td className="px-6 py-4 text-sm font-bold text-gray-900">₹{Number(inv.amount).toLocaleString()}</td>
                    <td className="px-6 py-4 text-sm text-gray-400 whitespace-nowrap">{inv.due_date}</td>
                    <td className="px-6 py-4">
                      {inv.status==='Paid'    && <span className="badge-green">Paid</span>}
                      {inv.status==='Pending' && <span className="badge-orange">Pending</span>}
                      {inv.status==='Failed'  && <span className="badge-red">Failed</span>}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 justify-end">
                        {inv.status!=='Paid' && (
                          <button className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#EEF0FF] text-[#4c58fa] text-xs font-semibold hover:bg-[#E8EAFD] transition-colors">
                            <Mail size={12}/>Remind
                          </button>
                        )}
                        <button className="btn-ghost w-8 h-8 flex items-center justify-center p-0 text-gray-400">
                          <MoreHorizontal size={16}/>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length===0 && !loading && (
                  <tr>
                    <td colSpan={6} className="text-center py-16">
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-[#EEF0FF] flex items-center justify-center">
                          <TrendingUp size={20} className="text-[#4c58fa]"/>
                        </div>
                        <p className="text-sm text-gray-400">No invoices yet. Click <strong>Add Invoice</strong> to create one.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <AddInvoiceModal open={showAdd} onClose={()=>setShowAdd(false)} onSaved={handleSaved}/>
    </div>
  );
}
