import React, { useState } from 'react';
import { Briefcase, Users, FileText, CheckCircle, Clock, Plus, Search, MapPin, DollarSign, Calendar } from 'lucide-react';

const STAGES = ['Applied', 'Screening', 'Interview', 'Offered', 'Rejected'];
const STAGE_COLORS = {
  Applied: 'bg-blue-50 text-blue-700 border-blue-200',
  Screening: 'bg-purple-50 text-purple-700 border-purple-200',
  Interview: 'bg-amber-50 text-amber-700 border-amber-200',
  Offered: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  Rejected: 'bg-rose-50 text-rose-600 border-rose-200'
};

const INITIAL_JOBS = [
  { id: 1, title: 'Senior React Developer', department: 'Engineering', location: 'Remote', salary: '₹12,00,000 - ₹18,00,000', type: 'Full-Time', status: 'Active', applicants: 24 },
  { id: 2, title: 'HR Manager', department: 'People & Culture', location: 'Chennai, India', salary: '₹8,00,000 - ₹12,00,000', type: 'Full-Time', status: 'Active', applicants: 15 },
  { id: 3, title: 'UI/UX Designer', department: 'Design', location: 'Hybrid', salary: '₹6,00,000 - ₹9,00,000', type: 'Full-Time', status: 'Active', applicants: 31 },
  { id: 4, title: 'QA Engineer', department: 'Quality Assurance', location: 'Chennai, India', salary: '₹5,00,000 - ₹8,00,000', type: 'Contract', status: 'Draft', applicants: 0 }
];

const INITIAL_CANDIDATES = [
  { id: 1, name: 'Anjali Sharma', jobTitle: 'Senior React Developer', email: 'anjali@example.com', stage: 'Interview', date: '2026-06-08' },
  { id: 2, name: 'Vikram Singh', jobTitle: 'UI/UX Designer', email: 'vikram@example.com', stage: 'Offered', date: '2026-06-09' },
  { id: 3, name: 'Rohan Mehta', jobTitle: 'Senior React Developer', email: 'rohan@example.com', stage: 'Screening', date: '2026-06-10' },
  { id: 4, name: 'Priya Patel', jobTitle: 'HR Manager', email: 'priya@example.com', stage: 'Applied', date: '2026-06-10' }
];

export default function HRRecruitment() {
  const [activeSubTab, setActiveSubTab] = useState('jobs');
  const [jobs, setJobs] = useState(INITIAL_JOBS);
  const [candidates, setCandidates] = useState(INITIAL_CANDIDATES);
  const [showJobModal, setShowJobModal] = useState(false);
  const [search, setSearch] = useState('');

  // New Job Form State
  const [jobForm, setJobForm] = useState({ title: '', department: '', location: '', salary: '', type: 'Full-Time' });

  const handleCreateJob = (e) => {
    e.preventDefault();
    const newJob = {
      id: Date.now(),
      ...jobForm,
      status: 'Active',
      applicants: 0
    };
    setJobs([newJob, ...jobs]);
    setShowJobModal(false);
    setJobForm({ title: '', department: '', location: '', salary: '', type: 'Full-Time' });
  };

  const handleStageChange = (candId, newStage) => {
    setCandidates(prev => prev.map(c => c.id === candId ? { ...c, stage: newStage } : c));
  };

  const filteredJobs = jobs.filter(j => j.title.toLowerCase().includes(search.toLowerCase()) || j.department.toLowerCase().includes(search.toLowerCase()));
  const filteredCandidates = candidates.filter(c => c.name.toLowerCase().includes(search.toLowerCase()) || c.jobTitle.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Recruitment Portal</h1>
          <p className="text-sm text-gray-500 mt-1">Oversee job postings, track applicant pipelines, and manage offers.</p>
        </div>
        {activeSubTab === 'jobs' && (
          <button onClick={() => setShowJobModal(true)} className="btn-primary self-start">
            <Plus size={15} /> Create Job Post
          </button>
        )}
      </div>

      {/* Navigation sub-tabs */}
      <div className="flex border-b border-gray-200">
        <button
          onClick={() => { setActiveSubTab('jobs'); setSearch(''); }}
          className={`pb-3 px-6 text-sm font-bold border-b-2 transition-all ${
            activeSubTab === 'jobs' ? 'border-[#4c58fa] text-[#4c58fa]' : 'border-transparent text-gray-500 hover:text-gray-900'
          }`}
        >
          Active Job Openings ({jobs.length})
        </button>
        <button
          onClick={() => { setActiveSubTab('candidates'); setSearch(''); }}
          className={`pb-3 px-6 text-sm font-bold border-b-2 transition-all ${
            activeSubTab === 'candidates' ? 'border-[#4c58fa] text-[#4c58fa]' : 'border-transparent text-gray-500 hover:text-gray-900'
          }`}
        >
          Candidate Pipeline ({candidates.length})
        </button>
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-3 max-w-sm">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder={activeSubTab === 'jobs' ? 'Search jobs...' : 'Search candidates...'}
            className="input pl-9 h-10"
          />
        </div>
      </div>

      {/* Content Rendering */}
      {activeSubTab === 'jobs' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredJobs.map(job => (
            <div key={job.id} className="glass-card p-6 rounded-2xl flex flex-col justify-between hover:translate-y-[-2px] transition-all duration-300">
              <div>
                <div className="flex items-start justify-between gap-2">
                  <span className="text-xs font-bold text-[#4c58fa] bg-[#EEF0FF] px-2 py-0.5 rounded-md">{job.department}</span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${job.status === 'Active' ? 'bg-emerald-50 text-emerald-700 border-emerald-250' : 'bg-gray-100 text-gray-500 border-gray-250'}`}>{job.status}</span>
                </div>
                <h3 className="text-lg font-bold text-gray-900 mt-3">{job.title}</h3>
                
                <div className="space-y-2 mt-4 text-xs text-gray-500 font-medium">
                  <div className="flex items-center gap-1.5"><MapPin size={13} /> {job.location}</div>
                  <div className="flex items-center gap-1.5"><DollarSign size={13} /> {job.salary}</div>
                  <div className="flex items-center gap-1.5"><Briefcase size={13} /> {job.type}</div>
                </div>
              </div>
              <div className="flex items-center justify-between border-t border-gray-100 pt-4 mt-6">
                <span className="text-xs text-gray-400 font-bold">{job.applicants} Applicant{job.applicants !== 1 ? 's' : ''}</span>
                <button className="text-xs font-bold text-[#4c58fa] hover:underline">View Pipeline →</button>
              </div>
            </div>
          ))}
          {filteredJobs.length === 0 && (
            <div className="col-span-2 py-16 text-center text-sm text-gray-400">No jobs found matching your search.</div>
          )}
        </div>
      ) : (
        <div className="card p-0 overflow-hidden rounded-2xl">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                {['Candidate', 'Applied Position', 'Stage', 'Applied Date', 'Update Stage'].map(h => (
                  <th key={h} className="px-6 py-3 text-left text-xs font-bold text-gray-400 uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredCandidates.map(c => (
                <tr key={c.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50/30 transition-colors">
                  <td className="px-6 py-4">
                    <p className="text-sm font-semibold text-gray-900">{c.name}</p>
                    <p className="text-xs text-gray-400 font-mono">{c.email}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-xs font-bold text-[#4c58fa] bg-[#EEF0FF] px-2.5 py-1 rounded-lg">{c.jobTitle}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${STAGE_COLORS[c.stage]}`}>{c.stage}</span>
                  </td>
                  <td className="px-6 py-4 text-xs text-gray-400">{c.date}</td>
                  <td className="px-6 py-4">
                    <select
                      value={c.stage}
                      onChange={e => handleStageChange(c.id, e.target.value)}
                      className="input h-8 py-0.5 text-xs w-36 font-semibold"
                    >
                      {STAGES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </td>
                </tr>
              ))}
              {filteredCandidates.length === 0 && (
                <tr><td colSpan={5} className="text-center py-16 text-sm text-gray-400">No candidates found matching your search.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Create Job Modal */}
      {showJobModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/25 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
              <h3 className="text-base font-bold text-gray-900">Create Job Opening</h3>
              <button onClick={() => setShowJobModal(false)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-50"><X size={18} onClick={() => setShowJobModal(false)} /></button>
            </div>
            <form onSubmit={handleCreateJob} className="p-6 space-y-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Job Title</label>
                <input className="input" value={jobForm.title} onChange={e => setJobForm(f => ({ ...f, title: e.target.value }))} placeholder="e.g. Senior Product Designer" required />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Department</label>
                <input className="input" value={jobForm.department} onChange={e => setJobForm(f => ({ ...f, department: e.target.value }))} placeholder="e.g. Design, Marketing" required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Location</label>
                  <input className="input" value={jobForm.location} onChange={e => setJobForm(f => ({ ...f, location: e.target.value }))} placeholder="e.g. Remote, Delhi" required />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Job Type</label>
                  <select className="input" value={jobForm.type} onChange={e => setJobForm(f => ({ ...f, type: e.target.value }))}>
                    <option value="Full-Time">Full-Time</option>
                    <option value="Part-Time">Part-Time</option>
                    <option value="Contract">Contract</option>
                    <option value="Internship">Internship</option>
                  </select>
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Salary Range (Annual)</label>
                <input className="input" value={jobForm.salary} onChange={e => setJobForm(f => ({ ...f, salary: e.target.value }))} placeholder="e.g. ₹6,00,000 - ₹9,00,000" required />
              </div>
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                <button type="button" onClick={() => setShowJobModal(false)} className="btn-secondary">Cancel</button>
                <button type="submit" className="btn-primary">Post Job</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
