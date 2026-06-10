import React, { useEffect, useState, useRef } from 'react';
import { Ticket, Send, Plus, X, MessageSquare, ShieldAlert, CheckCircle } from 'lucide-react';
import { getCompanyTickets, createSupportTicket, getTicketMessages, sendMessage, subscribeToMessages } from '../../services/support';

function Field({ label, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{label}</label>
      {children}
    </div>
  );
}

export default function CompanySupport({ companyId, companyDetails }) {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [messages, setMessages] = useState([]);
  const [reply, setReply] = useState('');
  const [sending, setSending] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [ticketSubject, setTicketSubject] = useState('');
  const [ticketPriority, setTicketPriority] = useState('Medium');
  const [creating, setCreating] = useState(false);
  
  const chatEndRef = useRef(null);

  // Load tickets
  useEffect(() => {
    async function load() {
      try {
        const data = await getCompanyTickets(companyId);
        setTickets(data);
        if (data.length > 0 && !selected) {
          setSelected(data[0]);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [companyId]);

  // Load messages when ticket selected
  useEffect(() => {
    if (!selected) return;
    setMessages([]);
    getTicketMessages(selected.id)
      .then(setMessages)
      .catch(console.error);

    // Subscribe to new messages
    const sub = subscribeToMessages(selected.id, (newMsg) => {
      setMessages(prev => {
        if (prev.some(m => m.id === newMsg.id)) return prev;
        return [...prev, newMsg];
      });
    });

    return () => {
      if (sub) sub.unsubscribe();
    };
  }, [selected]);

  // Scroll to bottom of chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!reply.trim() || !selected) return;
    setSending(true);
    try {
      const msg = await sendMessage({
        ticketId: selected.id,
        senderName: companyDetails?.name || 'Company Admin',
        senderRole: 'client',
        body: reply.trim()
      });
      setMessages(prev => [...prev, msg]);
      setReply('');
    } catch (e) {
      alert('Error sending message: ' + e.message);
    } finally {
      setSending(false);
    }
  };

  const handleCreateTicket = async (e) => {
    e.preventDefault();
    if (!ticketSubject.trim()) return;
    setCreating(true);
    try {
      const ticket = await createSupportTicket(companyId, {
        subject: ticketSubject.trim(),
        priority: ticketPriority
      });
      setTickets(prev => [ticket, ...prev]);
      setSelected(ticket);
      setShowModal(false);
      setTicketSubject('');
      setTicketPriority('Medium');
    } catch (e) {
      alert('Error creating support ticket: ' + e.message);
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="flex flex-col gap-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Help & Support</h1>
          <p className="text-sm text-gray-500 mt-1">Open support cases and communicate directly with platform administrators.</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-1.5 self-start">
          <Plus size={15}/>New Ticket
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-[calc(100vh-280px)] min-h-[450px]">
        {/* Ticket List */}
        <div className="glass-card rounded-3xl flex flex-col overflow-hidden bg-white">
          <div className="px-5 py-4 border-b border-gray-100">
            <h3 className="text-sm font-bold text-gray-900">Your Tickets</h3>
          </div>
          <div className="flex-1 overflow-y-auto divide-y divide-gray-100">
            {loading ? (
              <div className="p-5 text-center text-gray-400">Loading cases...</div>
            ) : tickets.length === 0 ? (
              <div className="py-12 text-center text-xs text-gray-400 px-5">
                <Ticket className="mx-auto text-gray-300 mb-2" size={24} />
                No support tickets found. Click "New Ticket" to request help.
              </div>
            ) : (
              tickets.map(t => {
                const isActive = selected?.id === t.id;
                return (
                  <button
                    key={t.id}
                    onClick={() => setSelected(t)}
                    className={`w-full text-left p-4 flex flex-col gap-2 transition-colors ${
                      isActive ? 'bg-[#4c58fa]/5 border-l-4 border-[#4c58fa]' : 'hover:bg-gray-50/50'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-bold text-[#4c58fa] bg-[#EEF0FF] px-2 py-0.5 rounded">
                        {t.ticket_number}
                      </span>
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                        t.status === 'Open' ? 'bg-orange-50 text-orange-700' :
                        t.status === 'Resolved' ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-500'
                      }`}>
                        {t.status}
                      </span>
                    </div>
                    <p className="text-sm font-semibold text-gray-900 truncate">{t.subject}</p>
                    <div className="flex items-center justify-between text-[10px] text-gray-400">
                      <span>Priority: <strong className="text-gray-600">{t.priority}</strong></span>
                      <span>{new Date(t.created_at).toLocaleDateString()}</span>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Chat window */}
        <div className="lg:col-span-2 glass-card rounded-3xl flex flex-col overflow-hidden bg-white">
          {selected ? (
            <>
              {/* Header */}
              <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-white shrink-0">
                <div>
                  <h3 className="text-sm font-bold text-gray-900">{selected.subject}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] font-mono text-gray-400">{selected.ticket_number}</span>
                    <span className="text-gray-300">•</span>
                    <span className="text-[10px] text-gray-400">Priority: <strong className="text-gray-600">{selected.priority}</strong></span>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                    selected.status === 'Open' ? 'bg-orange-50 text-orange-700 border border-orange-200' :
                    selected.status === 'Resolved' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-gray-100 text-gray-500'
                  }`}>
                    {selected.status}
                  </span>
                </div>
              </div>

              {/* Message Board */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50/20">
                {messages.map(m => {
                  const isAdmin = m.sender_role === 'agent' || m.sender_role === 'admin';
                  return (
                    <div key={m.id} className={`flex ${isAdmin ? 'justify-start' : 'justify-end'}`}>
                      <div className={`max-w-[70%] rounded-2xl p-3.5 shadow-sm text-sm ${
                        isAdmin 
                          ? 'bg-white text-gray-900 border border-gray-100' 
                          : 'bg-[#4c58fa] text-white'
                      }`}>
                        <p className={`text-[10px] font-bold mb-1 uppercase tracking-wider ${
                          isAdmin ? 'text-[#4c58fa]' : 'text-white/75'
                        }`}>
                          {isAdmin ? 'UNAI Support' : 'You'}
                        </p>
                        <p className="leading-relaxed whitespace-pre-wrap">{m.body}</p>
                        <span className={`text-[9px] block text-right mt-1.5 ${
                          isAdmin ? 'text-gray-400' : 'text-white/60'
                        }`}>
                          {new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  );
                })}
                <div ref={chatEndRef} />
              </div>

              {/* Chat Input */}
              {selected.status !== 'Closed' && (
                <form onSubmit={handleSend} className="p-4 border-t border-gray-100 bg-white flex items-center gap-3 shrink-0">
                  <input
                    value={reply}
                    onChange={e => setReply(e.target.value)}
                    placeholder="Type a message to support..."
                    className="input flex-1 h-11"
                    disabled={sending}
                  />
                  <button type="submit" disabled={sending || !reply.trim()} className="btn-primary h-11 px-5 flex items-center justify-center shrink-0">
                    <Send size={15} />
                  </button>
                </form>
              )}
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
              <MessageSquare className="text-gray-200 mb-2 animate-bounce" size={48} />
              <h3 className="text-sm font-bold text-gray-900">Select a Ticket</h3>
              <p className="text-xs text-gray-400 mt-1 max-w-xs">Click a case in the side list or create a new ticket to chat with support agents.</p>
            </div>
          )}
        </div>
      </div>

      {/* New Ticket Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/25 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
              <h3 className="text-base font-bold text-gray-900">Request Technical Support</h3>
              <button onClick={() => setShowModal(false)} className="btn-ghost w-8 h-8 flex items-center justify-center p-0">
                <X size={18}/>
              </button>
            </div>
            <form onSubmit={handleCreateTicket} className="p-6 space-y-4">
              <Field label="Subject / Summary">
                <input
                  className="input"
                  value={ticketSubject}
                  onChange={e => setTicketSubject(e.target.value)}
                  placeholder="e.g. Payroll calculations mismatch"
                  required
                />
              </Field>
              <Field label="Priority Level">
                <select
                  className="input"
                  value={ticketPriority}
                  onChange={e => setTicketPriority(e.target.value)}
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Critical">Critical</option>
                </select>
              </Field>
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">Cancel</button>
                <button type="submit" disabled={creating} className="btn-primary">
                  {creating ? 'Creating...' : 'Submit Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
