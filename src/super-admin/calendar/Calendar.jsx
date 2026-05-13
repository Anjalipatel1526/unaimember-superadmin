import React, { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, CalendarDays, Clock, Building2, AlertCircle } from 'lucide-react';
import { supabase } from '../../services/supabase';

const DAYS   = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

const EVENT_COLORS = {
  trial:   { dot: 'bg-orange-400', badge: 'bg-orange-50 text-orange-700 border-orange-200', label: 'Trial Expiry' },
  renewal: { dot: 'bg-blue-400',   badge: 'bg-blue-50 text-blue-700 border-blue-200',       label: 'Renewal Due' },
  invoice: { dot: 'bg-[#4c58fa]',  badge: 'bg-[#EEF0FF] text-[#374151] border-[#E5E7EB]',  label: 'Invoice Due' },
};

function buildCalendar(year, month) {
  const first = new Date(year, month, 1).getDay();
  const days  = new Date(year, month + 1, 0).getDate();
  const cells = [];
  for (let i = 0; i < first; i++) cells.push(null);
  for (let d = 1; d <= days; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

export default function Calendar() {
  const today = new Date();
  const [year,   setYear]   = useState(today.getFullYear());
  const [month,  setMonth]  = useState(today.getMonth());
  const [events, setEvents] = useState({});
  const [sel,    setSel]    = useState(today.getDate());
  const [loading,setLoading]= useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const from = new Date(year, month, 1).toISOString().slice(0, 10);
        const to   = new Date(year, month + 1, 0).toISOString().slice(0, 10);

        const [trials, invoices] = await Promise.all([
          supabase.from('companies').select('name, trial_expiry').gte('trial_expiry', from).lte('trial_expiry', to),
          supabase.from('invoices').select('invoice_number, due_date, status, companies(name)').gte('due_date', from).lte('due_date', to),
        ]);

        const map = {};
        const add = (dateStr, ev) => {
          const d = parseInt(dateStr.slice(8, 10), 10);
          if (!map[d]) map[d] = [];
          map[d].push(ev);
        };

        (trials.data || []).forEach(c => c.trial_expiry && add(c.trial_expiry, { type: 'trial',   label: c.name }));
        (invoices.data || []).forEach(inv => inv.due_date && add(inv.due_date, { type: 'invoice', label: inv.invoice_number, sub: inv.companies?.name }));

        setEvents(map);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [year, month]);

  const prev = () => { if (month === 0) { setYear(y => y-1); setMonth(11); } else setMonth(m => m-1); setSel(null); };
  const next = () => { if (month === 11){ setYear(y => y+1); setMonth(0);  } else setMonth(m => m+1); setSel(null); };

  const cells   = buildCalendar(year, month);
  const selEvts = sel ? (events[sel] || []) : [];
  const isToday = (d) => d === today.getDate() && month === today.getMonth() && year === today.getFullYear();

  const totalEvents = Object.values(events).flat().length;

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#111827] tracking-tight">Calendar</h1>
          <p className="text-sm text-[#6B7280] mt-1">Trial expiries, invoice due dates, and renewal events.</p>
        </div>
        <div className="flex items-center gap-2">
          {Object.entries(EVENT_COLORS).map(([k, v]) => (
            <div key={k} className="flex items-center gap-1.5">
              <div className={`w-2 h-2 rounded-full ${v.dot}`}/>
              <span className="text-xs text-[#6B7280]">{v.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { icon: CalendarDays,  label: 'Events This Month', value: totalEvents },
          { icon: Clock,         label: 'Trial Expiries',    value: Object.values(events).flat().filter(e=>e.type==='trial').length },
          { icon: AlertCircle,   label: 'Invoices Due',      value: Object.values(events).flat().filter(e=>e.type==='invoice').length },
        ].map(({ icon: Icon, label, value }) => (
          <div key={label} className="card-hover flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-[#EEF0FF] flex items-center justify-center shrink-0">
              <Icon size={18} className="text-[#4c58fa]"/>
            </div>
            <div>
              <p className="text-xs text-[#6B7280] font-medium">{label}</p>
              <p className="text-2xl font-bold text-[#111827] tracking-tight">{loading ? '…' : value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Calendar + sidebar */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Calendar grid */}
        <div className="card flex-1">
          {/* Month nav */}
          <div className="flex items-center justify-between mb-6">
            <button onClick={prev} className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-[#EEF0FF] text-[#374151] hover:text-[#111827] transition-colors">
              <ChevronLeft size={18}/>
            </button>
            <div className="text-center">
              <p className="text-base font-bold text-[#111827]">{MONTHS[month]}</p>
              <p className="text-xs text-[#6B7280]">{year}</p>
            </div>
            <button onClick={next} className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-[#EEF0FF] text-[#374151] hover:text-[#111827] transition-colors">
              <ChevronRight size={18}/>
            </button>
          </div>

          {/* Day headers */}
          <div className="grid grid-cols-7 mb-2">
            {DAYS.map(d => (
              <div key={d} className="text-center text-[10px] font-bold text-[#6B7280] uppercase tracking-wider py-2">{d}</div>
            ))}
          </div>

          {/* Day cells */}
          <div className="grid grid-cols-7 gap-px bg-[#E5E7EB] rounded-2xl overflow-hidden border border-[#E5E7EB]">
            {cells.map((d, i) => {
              const hasEvt  = d && events[d]?.length > 0;
              const isSel   = d === sel;
              const isTod   = d && isToday(d);
              const evtTypes = d ? [...new Set((events[d]||[]).map(e=>e.type))] : [];

              return (
                <button
                  key={i}
                  onClick={() => d && setSel(d)}
                  disabled={!d}
                  className={[
                    'relative flex flex-col items-center py-3 px-1 min-h-[72px] transition-colors',
                    !d ? 'bg-[#F9FAFB] cursor-default' : 'bg-white cursor-pointer',
                    d && !isSel && !isTod ? 'hover:bg-[#F9FAFB]' : '',
                    isSel ? 'bg-[#4c58fa] hover:bg-[#4c58fa]' : '',
                    isTod && !isSel ? 'bg-[#EEF0FF]' : '',
                  ].join(' ')}
                >
                  {d && (
                    <>
                      <span className={['text-sm font-semibold', isSel ? 'text-white' : isTod ? 'text-[#4c58fa]' : 'text-[#111827]'].join(' ')}>
                        {d}
                      </span>
                      {isTod && !isSel && (
                        <div className="w-1 h-1 rounded-full bg-[#4c58fa] mt-0.5"/>
                      )}
                      {hasEvt && (
                        <div className="flex gap-0.5 mt-1 flex-wrap justify-center">
                          {evtTypes.map(t => (
                            <div key={t} className={`w-1.5 h-1.5 rounded-full ${EVENT_COLORS[t]?.dot || 'bg-gray-400'}`}/>
                          ))}
                        </div>
                      )}
                    </>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Event detail panel */}
        <div className="card lg:w-72 shrink-0 flex flex-col">
          <div className="flex items-center gap-3 mb-5 pb-4 border-b border-[#E5E7EB]">
            <div className="w-10 h-10 rounded-xl bg-[#EEF0FF] flex items-center justify-center">
              <CalendarDays size={18} className="text-[#4c58fa]"/>
            </div>
            <div>
              <p className="text-sm font-bold text-[#111827]">
                {sel ? `${MONTHS[month]} ${sel}, ${year}` : 'Select a date'}
              </p>
              <p className="text-xs text-[#6B7280]">
                {sel ? `${selEvts.length} event${selEvts.length!==1?'s':''}` : 'Click any day'}
              </p>
            </div>
          </div>

          <div className="flex-1 flex flex-col gap-3 overflow-y-auto">
            {!sel && (
              <div className="flex-1 flex flex-col items-center justify-center text-center gap-3 py-8">
                <div className="w-14 h-14 rounded-2xl bg-[#EEF0FF] flex items-center justify-center">
                  <CalendarDays size={24} className="text-[#3d45e8]"/>
                </div>
                <p className="text-sm text-[#6B7280]">Click a day to see its events</p>
              </div>
            )}
            {sel && selEvts.length === 0 && (
              <div className="flex-1 flex flex-col items-center justify-center text-center gap-3 py-8">
                <div className="w-14 h-14 rounded-2xl bg-[#EEF0FF] flex items-center justify-center">
                  <CalendarDays size={24} className="text-[#3d45e8]"/>
                </div>
                <p className="text-sm text-[#6B7280]">No events on this day</p>
              </div>
            )}
            {selEvts.map((ev, i) => {
              const c = EVENT_COLORS[ev.type] || EVENT_COLORS.invoice;
              return (
                <div key={i} className={`flex items-start gap-3 p-3 rounded-xl border ${c.badge}`}>
                  <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${c.dot}`}/>
                  <div>
                    <p className="text-xs font-bold text-[#111827]">{ev.label}</p>
                    {ev.sub && <p className="text-[10px] text-[#6B7280] mt-0.5">{ev.sub}</p>}
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded mt-1 inline-block ${c.badge}`}>{c.label}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Monthly summary */}
          <div className="mt-5 pt-4 border-t border-[#E5E7EB]">
            <p className="text-[10px] font-bold uppercase tracking-wider text-[#6B7280] mb-3">Month Summary</p>
            {Object.entries(EVENT_COLORS).map(([k, v]) => {
              const count = Object.values(events).flat().filter(e=>e.type===k).length;
              return (
                <div key={k} className="flex items-center justify-between py-1.5">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${v.dot}`}/>
                    <span className="text-xs text-[#374151]">{v.label}</span>
                  </div>
                  <span className="text-xs font-bold text-[#111827]">{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
