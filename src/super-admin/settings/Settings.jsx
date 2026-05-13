import React from 'react';
import { Palette, Mail, Shield, Database, Save } from 'lucide-react';

function Section({ icon: Icon, title, description, children }) {
  return (
    <div className="card">
      <div className="flex flex-col md:flex-row gap-8">
        <div className="md:w-72 shrink-0">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 rounded-xl bg-[#EEF0FF] flex items-center justify-center">
              <Icon size={17} className="text-[#4c58fa]" />
            </div>
            <h2 className="text-sm font-bold text-[#111827]">{title}</h2>
          </div>
          <p className="text-xs text-[#6B7280] leading-relaxed pl-12">{description}</p>
        </div>
        <div className="flex-1 flex flex-col gap-4">{children}</div>
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-semibold text-[#374151] uppercase tracking-wide">{label}</label>
      {children}
    </div>
  );
}

function Toggle({ label, sub, defaultOn }) {
  const [on, setOn] = React.useState(!!defaultOn);
  return (
    <div className="flex items-center justify-between p-4 bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl">
      <div>
        <p className="text-sm font-semibold text-[#111827]">{label}</p>
        {sub && <p className="text-xs text-[#6B7280] mt-0.5">{sub}</p>}
      </div>
      <button
        type="button"
        onClick={() => setOn(!on)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 shrink-0 ${on ? 'bg-[#4c58fa]' : 'bg-[#c7d2fe]'}`}
      >
        <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform duration-200 ${on ? 'translate-x-6' : 'translate-x-1'}`} />
      </button>
    </div>
  );
}

export default function Settings() {
  return (
    <div className="flex flex-col gap-8 pb-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#111827] tracking-tight">Platform Settings</h1>
          <p className="text-sm text-[#6B7280] mt-1">Global configuration for the entire SaaS platform.</p>
        </div>
        <button className="btn-primary">
          <Save size={15} />Save All Changes
        </button>
      </div>

      {/* Branding */}
      <Section icon={Palette} title="Platform Branding" description="Customize the visual identity including your logo and brand colors.">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Platform Name">
            <input type="text" className="input" defaultValue="UNAI MEMBER" />
          </Field>
          <Field label="Support Email">
            <input type="email" className="input" defaultValue="support@unaimember.com" />
          </Field>
        </div>
        <Field label="Brand Color">
          <div className="flex items-center gap-3">
            <input type="color" defaultValue="#4c58fa" className="w-11 h-11 rounded-xl border border-[#E5E7EB] cursor-pointer p-1 bg-white" />
            <input type="text" className="input flex-1" defaultValue="#4c58fa" />
          </div>
        </Field>
      </Section>

      {/* SMTP */}
      <Section icon={Mail} title="SMTP Configuration" description="Configure your email delivery server for notifications and password resets.">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="sm:col-span-2">
            <Field label="SMTP Host">
              <input type="text" className="input" placeholder="smtp.mailgun.org" />
            </Field>
          </div>
          <Field label="Port">
            <input type="text" className="input" placeholder="587" />
          </Field>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Username">
            <input type="text" className="input" placeholder="postmaster@example.com" />
          </Field>
          <Field label="Password">
            <input type="password" className="input" placeholder="••••••••••••" />
          </Field>
        </div>
        <div className="flex justify-end">
          <button className="btn-ghost text-sm">Test Connection →</button>
        </div>
      </Section>

      {/* Security */}
      <Section icon={Shield} title="Security & Access" description="Enforce global security policies across all tenant organizations.">
        <Toggle label="Two-Factor Authentication" sub="Require 2FA for all admin-level users" defaultOn />
        <Toggle label="IP Whitelisting"           sub="Restrict access to specific IP address ranges" />
        <Toggle label="Session Timeout (30 min)"  sub="Auto-logout inactive user sessions" defaultOn />
      </Section>

      {/* Backup */}
      <Section icon={Database} title="Backup & Maintenance" description="Configure automated backups and maintenance windows.">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Backup Frequency">
            <select className="input">
              <option>Every 6 Hours</option>
              <option>Daily at 02:00 AM</option>
              <option>Weekly</option>
            </select>
          </Field>
          <Field label="Retention Period">
            <select className="input">
              <option>30 Days</option>
              <option>90 Days</option>
              <option>1 Year</option>
            </select>
          </Field>
        </div>
        <button className="btn-secondary w-fit">
          <Database size={14} />Create Manual Snapshot
        </button>
      </Section>
    </div>
  );
}
