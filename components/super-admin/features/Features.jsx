import React, { useEffect, useState } from 'react';
import { CreditCard, Activity, Cpu, Smartphone, Globe, Database, Info } from 'lucide-react';
import { getFeatures, toggleFeature } from '@/services/features';

const iconMap = { CreditCard, Activity, Cpu, Smartphone, Globe, Database };

function Toggle({ on, onToggle }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none ${on ? 'bg-[#4c58fa]' : 'bg-[#c7d2fe]'}`}
    >
      <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform duration-200 ${on ? 'translate-x-6' : 'translate-x-1'}`} />
    </button>
  );
}

function FeatureCard({ feature, onToggle }) {
  const Icon = iconMap[feature.icon] || Database;

  return (
    <div className="card flex flex-col gap-5">
      <div className="flex items-start justify-between">
        <div className="w-11 h-11 rounded-xl bg-[#EEF0FF] flex items-center justify-center">
          <Icon size={20} className="text-[#4c58fa]" />
        </div>
        <Toggle on={feature.enabled} onToggle={() => onToggle(feature.id, !feature.enabled)} />
      </div>

      <div className="flex-1">
        <h3 className="text-sm font-bold text-[#111827]">{feature.title}</h3>
        <p className="text-xs text-[#6B7280] mt-1.5 leading-relaxed">{feature.description}</p>
      </div>

      <div className="pt-4 border-t border-[#E5E7EB] flex items-center justify-between">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-[#6B7280]">Active Usage</p>
          <p className="text-sm font-bold text-[#111827] mt-0.5">{feature.usage_count} Companies</p>
        </div>
        <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${feature.enabled ? 'bg-emerald-50 text-emerald-700' : 'bg-[#E5E7EB] text-[#6B7280]'}`}>
          {feature.enabled ? 'ENABLED' : 'DISABLED'}
        </span>
      </div>
    </div>
  );
}

export default function Features() {
  const [features, setFeatures] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState(null);

  useEffect(() => {
    getFeatures()
      .then(setFeatures)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const handleToggle = async (id, enabled) => {
    // Optimistic update
    setFeatures(prev => prev.map(f => f.id === id ? { ...f, enabled } : f));
    try {
      await toggleFeature(id, enabled);
    } catch (e) {
      // Revert on failure
      setFeatures(prev => prev.map(f => f.id === id ? { ...f, enabled: !enabled } : f));
      alert('Failed to update feature: ' + e.message);
    }
  };

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-bold text-[#111827] tracking-tight">Feature Management</h1>
        <p className="text-sm text-[#6B7280] mt-1">Control global feature availability across all tenant organizations.</p>
      </div>

      {error && <div className="bg-red-50 border border-red-200 rounded-2xl px-5 py-3 text-sm text-red-700">⚠ {error}</div>}

      <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-2xl p-4">
        <Info size={16} className="text-amber-600 mt-0.5 shrink-0" />
        <p className="text-sm text-amber-800">
          Changes take effect immediately for all active tenants. Disabling a feature hides it from the client UI at once.
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[...Array(6)].map((_, i) => <div key={i} className="card h-48 animate-pulse bg-[#F9FAFB]" />)}
        </div>
      ) : features.length === 0 ? (
        <div className="card text-center py-16 text-sm text-[#6B7280]">No features configured yet.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map(f => <FeatureCard key={f.id} feature={f} onToggle={handleToggle} />)}
        </div>
      )}
    </div>
  );
}
