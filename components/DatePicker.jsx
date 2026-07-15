import React, { useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight, CalendarDays, X } from 'lucide-react';

const DAYS   = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
const MONTHS = ['January','February','March','April','May','June',
                'July','August','September','October','November','December'];

function buildCells(year, month) {
  const first = new Date(year, month, 1).getDay();
  const total = new Date(year, month + 1, 0).getDate();
  const cells = Array(first).fill(null);
  for (let d = 1; d <= total; d++) cells.push(d);
  return cells;
}

export default function DatePicker({ value, onChange, placeholder = 'Select date', label }) {
  const [open, setOpen] = useState(false);
  const today = new Date();

  const parseVal = () => {
    if (!value) return { y: today.getFullYear(), m: today.getMonth(), d: null };
    const dt = new Date(value);
    return { y: dt.getFullYear(), m: dt.getMonth(), d: dt.getDate() };
  };

  const [view, setView] = useState({ y: today.getFullYear(), m: today.getMonth() });
  const ref = useRef(null);

  // Sync view when value changes externally
  useEffect(() => {
    if (value) {
      const dt = new Date(value);
      setView({ y: dt.getFullYear(), m: dt.getMonth() });
    }
  }, [value]);

  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  const prev = () => setView(v => v.m === 0 ? { y: v.y - 1, m: 11 } : { y: v.y, m: v.m - 1 });
  const next = () => setView(v => v.m === 11 ? { y: v.y + 1, m: 0  } : { y: v.y, m: v.m + 1 });

  const select = (d) => {
    if (!d) return;
    const iso = `${view.y}-${String(view.m + 1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
    onChange(iso);
    setOpen(false);
  };

  const clear = (e) => { e.stopPropagation(); onChange(''); };

  const { y: selY, m: selM, d: selD } = parseVal();
  const cells = buildCells(view.y, view.m);
  const todayD = today.getDate(), todayM = today.getMonth(), todayY = today.getFullYear();

  const displayValue = value ? new Date(value).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '';

  return (
    <div ref={ref} className="relative w-full">
      {label && <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">{label}</label>}

      {/* Trigger */}
      <button type="button" onClick={() => setOpen(v => !v)}
        className={`w-full flex items-center gap-2.5 px-4 h-11 rounded-xl border text-sm transition-all
          ${open ? 'border-[#4c58fa] ring-2 ring-[#4c58fa]/20' : 'border-gray-200 hover:border-gray-300'}
          ${value ? 'text-gray-900' : 'text-gray-400'} bg-white`}>
        <CalendarDays size={15} className={open ? 'text-[#4c58fa]' : 'text-gray-400'}/>
        <span className="flex-1 text-left">{displayValue || placeholder}</span>
        {value && (
          <span onClick={clear} className="text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full p-0.5 transition-colors">
            <X size={13}/>
          </span>
        )}
      </button>

      {/* Calendar popover */}
      {open && (
        <div className="absolute top-[calc(100%+6px)] left-0 z-50 w-72 bg-white rounded-2xl shadow-2xl border border-gray-200 p-4 select-none">
          {/* Month nav */}
          <div className="flex items-center justify-between mb-4">
            <button type="button" onClick={prev} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-900 transition-colors">
              <ChevronLeft size={16}/>
            </button>
            <div className="text-center">
              <p className="text-sm font-bold text-gray-900">{MONTHS[view.m]}</p>
              <p className="text-xs text-gray-500">{view.y}</p>
            </div>
            <button type="button" onClick={next} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-900 transition-colors">
              <ChevronRight size={16}/>
            </button>
          </div>

          {/* Day headers */}
          <div className="grid grid-cols-7 mb-1">
            {DAYS.map(d => (
              <div key={d} className="text-center text-[10px] font-bold text-gray-400 uppercase py-1">{d}</div>
            ))}
          </div>

          {/* Day cells */}
          <div className="grid grid-cols-7 gap-0.5">
            {cells.map((d, i) => {
              const isSelected = d && d === selD && view.m === selM && view.y === selY;
              const isToday    = d && d === todayD && view.m === todayM && view.y === todayY;
              return (
                <button key={i} type="button" onClick={() => select(d)} disabled={!d}
                  className={[
                    'h-9 w-full rounded-lg text-sm font-medium transition-all',
                    !d ? 'invisible' : '',
                    isSelected ? 'bg-[#4c58fa] text-white shadow-sm' : '',
                    isToday && !isSelected ? 'border-2 border-[#4c58fa] text-[#4c58fa]' : '',
                    !isSelected && !isToday && d ? 'text-gray-700 hover:bg-[#EEF0FF] hover:text-[#4c58fa]' : '',
                  ].join(' ')}>
                  {d}
                </button>
              );
            })}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
            <button type="button" onClick={() => { onChange(''); setOpen(false); }} className="text-xs text-gray-400 hover:text-gray-600 font-medium">Clear</button>
            <button type="button" onClick={() => { select(todayD); setView({ y: todayY, m: todayM }); }} className="text-xs text-[#4c58fa] font-semibold hover:underline">Today</button>
          </div>
        </div>
      )}
    </div>
  );
}
