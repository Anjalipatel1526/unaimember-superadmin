import React from 'react';
import { Check, Edit2, Zap, Shield, Briefcase, Plus } from 'lucide-react';
import { mockPlans } from '../../mock-data';

function Toggle({ on }) {
  return (
    <div className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ${on ? 'bg-[#4c58fa]' : 'bg-[#c7d2fe]'}`}>
      <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform duration-200 ${on ? 'translate-x-6' : 'translate-x-1'}`} />
    </div>
  );
}

const planIcons = { Basic: Briefcase, Professional: Zap, Enterprise: Shield };

function PlanCard({ plan }) {
  const Icon = planIcons[plan.name] || Briefcase;
  const isPopular = plan.name === 'Professional';

  return (
    <div className={`card flex flex-col gap-6 relative group transition-all duration-200 hover:shadow-card-hover ${isPopular ? 'ring-2 ring-[#4c58fa]' : ''}`}>
      {isPopular && (
        <div className="absolute -top-3 left-6">
          <span className="bg-[#4c58fa] text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
            Most Popular
          </span>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="w-10 h-10 rounded-xl bg-[#EEF0FF] flex items-center justify-center">
          <Icon size={18} className="text-[#4c58fa]" />
        </div>
        <Toggle on={plan.enabled} />
      </div>

      {/* Pricing */}
      <div>
        <h3 className="text-base font-bold text-[#111827]">{plan.name}</h3>
        <div className="flex items-baseline gap-1 mt-2">
          <span className="text-4xl font-extrabold text-[#111827] tracking-tight">${plan.price}</span>
          <span className="text-sm text-[#6B7280] font-medium">/month</span>
        </div>
      </div>

      {/* Stats */}
      <div className="flex gap-4">
        <div className="flex-1 bg-[#F9FAFB] rounded-xl p-3 border border-[#E5E7EB]">
          <p className="text-[10px] font-bold uppercase tracking-wider text-[#6B7280]">Employees</p>
          <p className="text-sm font-bold text-[#111827] mt-1">{plan.employeeLimit}</p>
        </div>
        <div className="flex-1 bg-[#F9FAFB] rounded-xl p-3 border border-[#E5E7EB]">
          <p className="text-[10px] font-bold uppercase tracking-wider text-[#6B7280]">Storage</p>
          <p className="text-sm font-bold text-[#111827] mt-1">{plan.storage}</p>
        </div>
      </div>

      {/* Features */}
      <div className="flex flex-col gap-2.5">
        {plan.features.map((f, i) => (
          <div key={i} className="flex items-center gap-2.5 text-sm text-[#374151]">
            <div className="w-5 h-5 rounded-full bg-emerald-50 flex items-center justify-center shrink-0">
              <Check size={11} className="text-emerald-600" />
            </div>
            {f}
          </div>
        ))}
        <div className="flex items-center gap-2.5 text-sm text-[#374151]">
          <div className="w-5 h-5 rounded-full bg-emerald-50 flex items-center justify-center shrink-0">
            <Check size={11} className="text-emerald-600" />
          </div>
          {plan.support} Support
        </div>
      </div>

      {/* Edit button */}
      <button className="btn-secondary w-full justify-center opacity-0 group-hover:opacity-100 transition-all duration-200">
        <Edit2 size={14} />Edit Plan
      </button>
    </div>
  );
}

export default function Subscriptions() {
  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#111827] tracking-tight">Subscription Plans</h1>
          <p className="text-sm text-[#6B7280] mt-1">Manage and customize pricing tiers for your platform.</p>
        </div>
        <button className="btn-primary">
          <Plus size={15} />Create New Tier
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mockPlans.map(p => <PlanCard key={p.id} plan={p} />)}
      </div>

      {/* CTA Banner */}
      <div className="card bg-[#4c58fa] border-none relative overflow-hidden">
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
          <div>
            <h2 className="text-xl font-bold text-white">Need a custom enterprise plan?</h2>
            <p className="text-sm text-white/75 mt-1 max-w-md">
              Build tailored plans with custom features, pricing, and employee limits for high-volume clients.
            </p>
          </div>
          <button className="bg-white text-[#4c58fa] font-bold text-sm px-6 py-2.5 rounded-xl hover:bg-[#EEF0FF] transition-colors shrink-0">
            Launch Builder
          </button>
        </div>
        <div className="absolute -right-12 -top-12 w-48 h-48 bg-white/10 rounded-full blur-3xl pointer-events-none" />
      </div>
    </div>
  );
}
