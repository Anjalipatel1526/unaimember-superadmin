import React, { useState, useEffect } from 'react';
import { Award, Search, Plus, Star, MessageSquare, ChevronRight, BarChart3 } from 'lucide-react';
import { getEmployees } from '../../services/employees';

const RATINGS = [
  { value: 5, label: 'Outstanding' },
  { value: 4, label: 'Exceeds Expectations' },
  { value: 3, label: 'Meets Expectations' },
  { value: 2, label: 'Needs Improvement' },
  { value: 1, label: 'Unsatisfactory' }
];

export default function HRPerformance({ companyId }) {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState([]);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);

  // Form state
  const [form, setForm] = useState({ empId: '', period: 'Q2 2026', rating: 3, feedback: '' });

  useEffect(() => {
    getEmployees(companyId)
      .then(data => {
        setEmployees(data);
        // Create mock reviews
        const mockReviews = data.slice(0, Math.min(5, data.length)).map((emp, i) => ({
          id: i + 1,
          empId: emp.id,
          empName: `${emp.first_name} ${emp.last_name}`,
          department: emp.department || 'General',
          designation: emp.designation || 'Staff',
          period: 'Q1 2026',
          rating: [5, 4, 3, 4, 3][i % 5],
          feedback: [
            'Consistent high performance and leadership in team initiatives.',
            'Strong contributions to key backend APIs and prompt delivery.',
            'Demonstrates reliable daily execution. Meets all assigned targets.',
            'Excellent creative work on web portals. Great attention to detail.',
            'Maintains stable work performance. Ready for next scale tasks.'
          ][i % 5]
        }));
        setReviews(mockReviews);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [companyId]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const emp = employees.find(e => e.id === form.empId);
    if (!emp) return;
    const newReview = {
      id: Date.now(),
      empId: form.empId,
      empName: `${emp.first_name} ${emp.last_name}`,
      department: emp.department || 'General',
      designation: emp.designation || 'Staff',
      period: form.period,
      rating: Number(form.rating),
      feedback: form.feedback
    };
    setReviews([newReview, ...reviews]);
    setShowModal(false);
    setForm({ empId: '', period: 'Q2 2026', rating: 3, feedback: '' });
  };

  const filteredReviews = reviews.filter(r => r.empName.toLowerCase().includes(search.toLowerCase()));

  const averageRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : '0.0';

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Performance Reviews</h1>
          <p className="text-sm text-gray-500 mt-1">Review ratings, record feedback, and track key performer stats.</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary self-start">
          <Plus size={15} /> Add Review
        </button>
      </div>

      {/* Summary KPI card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-card p-6 rounded-2xl flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Average Score</p>
            <h3 className="text-3xl font-extrabold text-gray-900 mt-1">{averageRating} / 5.0</h3>
            <p className="text-[10px] text-gray-400 mt-1">based on {reviews.length} Q1 reviews</p>
          </div>
          <div className="p-3 bg-[#EEF0FF] text-[#4c58fa] rounded-xl"><Star size={24} fill="#4c58fa" /></div>
        </div>

        <div className="glass-card p-6 rounded-2xl flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">High Performers</p>
            <h3 className="text-3xl font-extrabold text-gray-900 mt-1">{reviews.filter(r => r.rating >= 4).length}</h3>
            <p className="text-[10px] text-gray-400 mt-1">staff with rating 4.0 or above</p>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl"><Award size={24} /></div>
        </div>

        <div className="glass-card p-6 rounded-2xl flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Total Reviews</p>
            <h3 className="text-3xl font-extrabold text-gray-900 mt-1">{reviews.length}</h3>
            <p className="text-[10px] text-gray-400 mt-1">completed in active period</p>
          </div>
          <div className="p-3 bg-purple-50 text-purple-600 rounded-xl"><BarChart3 size={24} /></div>
        </div>
      </div>

      {/* Review List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-gray-900">Review Records</h3>
          <div className="relative w-64">
            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by employee name..." className="input pl-9 h-9 text-xs" />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {filteredReviews.map(r => (
            <div key={r.id} className="glass-card p-6 rounded-2xl hover:border-[#4c58fa]/20 transition-all">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#EEF0FF] flex items-center justify-center shrink-0 border border-[#4c58fa]/10">
                    <span className="text-sm font-bold text-[#4c58fa]">{r.empName[0]}</span>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900">{r.empName}</h4>
                    <p className="text-xs text-gray-400">{r.designation} • {r.department}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 self-start sm:self-center">
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, idx) => (
                      <Star key={idx} size={14} className={idx < r.rating ? 'text-amber-500 fill-amber-500' : 'text-gray-200'} />
                    ))}
                  </div>
                  <span className="text-xs font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded">{r.period}</span>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-100 flex items-start gap-2.5">
                <MessageSquare size={14} className="text-gray-400 shrink-0 mt-0.5" />
                <p className="text-xs text-gray-600 italic leading-relaxed">{r.feedback}</p>
              </div>
            </div>
          ))}
          {filteredReviews.length === 0 && (
            <div className="py-16 text-center text-sm text-gray-400 card">No performance reviews found.</div>
          )}
        </div>
      </div>

      {/* Add Review Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/25 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
              <h3 className="text-base font-bold text-gray-900">Record Performance Review</h3>
              <button onClick={() => setShowModal(false)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-50">
                <ChevronRight size={18} className="rotate-90 text-gray-400" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Employee</label>
                <select className="input" value={form.empId} onChange={e => setForm(f => ({ ...f, empId: e.target.value }))} required>
                  <option value="">Select Employee</option>
                  {employees.map(e => <option key={e.id} value={e.id}>{e.first_name} {e.last_name}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Review Period</label>
                  <input className="input" value={form.period} onChange={e => setForm(f => ({ ...f, period: e.target.value }))} placeholder="e.g. Q2 2026" required />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Rating</label>
                  <select className="input" value={form.rating} onChange={e => setForm(f => ({ ...f, rating: Number(e.target.value) }))}>
                    {RATINGS.map(r => <option key={r.value} value={r.value}>{r.value} — {r.label}</option>)}
                  </select>
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Performance Feedback</label>
                <textarea className="input min-h-[100px] py-2 resize-none" value={form.feedback} onChange={e => setForm(f => ({ ...f, feedback: e.target.value }))} placeholder="Provide constructive feedback..." required />
              </div>
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">Cancel</button>
                <button type="submit" className="btn-primary">Submit Review</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
