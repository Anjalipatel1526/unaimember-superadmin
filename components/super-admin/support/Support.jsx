import React, { useEffect, useState, useRef } from 'react';
import { Search, User, MessageSquare, Send, Paperclip, X } from 'lucide-react';
import {
  getTickets, getTicketMessages, sendMessage,
  updateTicketStatus, subscribeToMessages
} from '@/services/support';

const priorityBadge = { High: 'badge-red', Medium: 'badge-orange', Low: 'badge-blue' };
const statusBadge   = { 'Open': 'badge-green', 'In Progress': 'badge-orange', 'Resolved': 'badge-sand', 'Closed': 'badge-sand' };

export default function Support() {
  const [tickets,   setTickets]   = useState([]);
  const [messages,  setMessages]  = useState([]);
  const [selected,  setSelected]  = useState(null);
  const [msg,       setMsg]       = useState('');
  const [loading,   setLoading]   = useState(true);
  const [sending,   setSending]   = useState(false);
  const [search,    setSearch]    = useState('');
  const [error,     setError]     = useState(null);
  const bottomRef = useRef(null);
  const channelRef = useRef(null);

  useEffect(() => {
    getTickets()
      .then(setTickets)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  // Load messages & subscribe when a ticket is selected
  useEffect(() => {
    if (!selected) return;
    setMessages([]);
    getTicketMessages(selected.id)
      .then(setMessages)
      .catch(console.error);

    // Realtime
    if (channelRef.current) channelRef.current.unsubscribe();
    channelRef.current = subscribeToMessages(selected.id, newMsg => {
      setMessages(prev => [...prev, newMsg]);
    });

    return () => { if (channelRef.current) channelRef.current.unsubscribe(); };
  }, [selected]);

  // Auto-scroll chat
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!msg.trim() || !selected) return;
    setSending(true);
    try {
      await sendMessage({
        ticketId:   selected.id,
        senderName: 'Alex Sterling',
        senderRole: 'agent',
        body:       msg.trim(),
      });
      setMsg('');
    } catch (e) {
      alert('Failed to send: ' + e.message);
    } finally {
      setSending(false);
    }
  };

  const filtered = tickets.filter(t =>
    t.ticket_number.toLowerCase().includes(search.toLowerCase()) ||
    t.companies?.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-bold text-[#111827] tracking-tight">Support Tickets</h1>
        <p className="text-sm text-[#6B7280] mt-1">Manage and respond to platform support requests.</p>
      </div>

      {error && <div className="bg-red-50 border border-red-200 rounded-2xl px-5 py-3 text-sm text-red-700">⚠ {error}</div>}

      <div className="card p-0 overflow-hidden">
        <div className="flex items-center gap-3 px-6 py-4 border-b border-[#E5E7EB]">
          <div className="relative flex-1 max-w-sm">
            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6B7280]" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search tickets…" className="input pl-9 h-10" />
          </div>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-6 space-y-3">{[...Array(3)].map((_, i) => <div key={i} className="h-12 bg-[#F9FAFB] rounded-xl animate-pulse" />)}</div>
          ) : (
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-[#E5E7EB] bg-[#F9FAFB]">
                  {['Ticket ID', 'Company', 'Priority', 'Assigned Agent', 'Status', 'Date', ''].map(h => (
                    <th key={h} className="px-6 py-3 text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(t => (
                  <tr key={t.id} className="table-row border-b border-[#E5E7EB] last:border-0 cursor-pointer" onClick={() => setSelected(t)}>
                    <td className="px-6 py-4 text-sm font-mono font-semibold text-[#4c58fa]">{t.ticket_number}</td>
                    <td className="px-6 py-4 text-sm font-semibold text-[#111827]">{t.companies?.name ?? '—'}</td>
                    <td className="px-6 py-4"><span className={priorityBadge[t.priority] || 'badge-sand'}>{t.priority}</span></td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm text-[#374151]">
                        <div className="w-6 h-6 rounded-full bg-[#EEF0FF] flex items-center justify-center">
                          <User size={11} className="text-[#4c58fa]" />
                        </div>
                        {t.assigned_agent ?? 'Unassigned'}
                      </div>
                    </td>
                    <td className="px-6 py-4"><span className={statusBadge[t.status] || 'badge-sand'}>{t.status}</span></td>
                    <td className="px-6 py-4 text-sm text-[#6B7280] whitespace-nowrap">{new Date(t.created_at).toLocaleDateString()}</td>
                    <td className="px-6 py-4">
                      <button className="btn-secondary px-3 py-1.5 text-xs" onClick={e => { e.stopPropagation(); setSelected(t); }}>View</button>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && !loading && (
                  <tr><td colSpan={7} className="text-center py-16 text-sm text-[#6B7280]">No support tickets found.</td></tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Chat Slide-over */}
      {selected && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/25 backdrop-blur-sm">
          <div className="bg-white w-full max-w-lg h-full flex flex-col shadow-2xl">
            <div className="flex items-center gap-4 px-6 py-4 border-b border-[#E5E7EB] shrink-0">
              <div className="w-10 h-10 rounded-xl bg-[#EEF0FF] flex items-center justify-center">
                <MessageSquare size={18} className="text-[#4c58fa]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-[#111827] truncate">{selected.ticket_number}: {selected.subject}</p>
                <p className="text-xs text-[#6B7280]">{selected.companies?.name}</p>
              </div>
              <button onClick={() => setSelected(null)} className="btn-ghost w-8 h-8 flex items-center justify-center p-0 text-[#6B7280]">
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 bg-[#F9FAFB] flex flex-col gap-5">
              {messages.length === 0 && (
                <div className="flex-1 flex items-center justify-center">
                  <p className="text-sm text-[#6B7280] italic">No messages yet. Start the conversation below.</p>
                </div>
              )}
              {messages.map(m => (
                <div key={m.id} className={`flex flex-col gap-1 max-w-[85%] ${m.sender_role === 'agent' ? 'self-end items-end' : 'items-start'}`}>
                  <div className={`rounded-2xl px-4 py-3 ${m.sender_role === 'agent' ? 'bg-[#4c58fa] rounded-tr-sm' : 'bg-white border border-[#E5E7EB] rounded-tl-sm shadow-sm'}`}>
                    <p className={`text-sm ${m.sender_role === 'agent' ? 'text-white' : 'text-[#111827]'}`}>{m.body}</p>
                  </div>
                  <p className="text-[10px] text-[#6B7280] mx-1">{new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} · {m.sender_name}</p>
                </div>
              ))}
              <div ref={bottomRef} />
            </div>

            <div className="px-5 py-4 border-t border-[#E5E7EB] shrink-0">
              <div className="flex items-end gap-3 bg-[#F9FAFB] border border-[#E5E7EB] rounded-2xl p-3">
                <textarea
                  value={msg}
                  onChange={e => setMsg(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                  placeholder="Type your reply… (Enter to send)"
                  rows={2}
                  className="flex-1 bg-transparent outline-none resize-none text-sm text-[#111827] placeholder-[#6B7280]"
                />
                <button
                  onClick={handleSend}
                  disabled={sending || !msg.trim()}
                  className="w-9 h-9 bg-[#4c58fa] text-white rounded-xl flex items-center justify-center hover:bg-[#3d45e8] disabled:opacity-40 transition-colors shrink-0"
                >
                  <Send size={15} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
