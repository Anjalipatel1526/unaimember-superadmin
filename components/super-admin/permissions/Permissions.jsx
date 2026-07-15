import React from 'react';
import { Shield, Check, Minus, Info, Plus } from 'lucide-react';

const ROLES   = ['Super Admin', 'HR Admin', 'Assistant HR', 'Employee'];
const MODULES = ['Dashboard', 'Employees', 'Attendance', 'Leave', 'Payroll', 'Documents', 'Billing', 'Reports'];
const ACTIONS = ['View', 'Create', 'Edit', 'Delete', 'Export'];

// Permission definitions
const PERMS = {
  'Super Admin': { all: true },
  'HR Admin': {
    Dashboard:  ['View'],
    Employees:  ['View','Create','Edit','Delete','Export'],
    Attendance: ['View','Create','Edit'],
    Leave:      ['View','Edit'],
    Payroll:    ['View','Edit'],
    Documents:  ['View','Create','Edit'],
    Billing:    ['View'],
    Reports:    ['View','Export'],
  },
  'Assistant HR': {
    Dashboard:  ['View'],
    Employees:  ['View','Edit'],
    Attendance: ['View','Create'],
    Leave:      ['View'],
    Documents:  ['View'],
    Reports:    ['View'],
  },
  Employee: {
    Dashboard:  ['View'],
    Employees:  ['View'],
    Attendance: ['View'],
    Leave:      ['View','Create'],
    Documents:  ['View'],
  },
};

function has(role, module, action) {
  if (PERMS[role]?.all) return true;
  return PERMS[role]?.[module]?.includes(action) ?? false;
}

const roleColors = {
  'Super Admin':  'bg-[#4c58fa] text-white',
  'HR Admin':     'bg-blue-100 text-blue-700',
  'Assistant HR': 'bg-purple-100 text-purple-700',
  'Employee':     'bg-[#EEF0FF] text-[#374151]',
};

export default function Permissions() {
  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#111827] tracking-tight">Roles & Permissions</h1>
          <p className="text-sm text-[#6B7280] mt-1">Define access levels for every platform role.</p>
        </div>
        <button className="btn-primary">
          <Plus size={15} />Add Role
        </button>
      </div>

      {/* Role badges */}
      <div className="flex flex-wrap gap-3">
        {ROLES.map(r => (
          <div key={r} className="card py-3 px-4 flex items-center gap-2.5 w-fit">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center">
              <Shield size={14} className="text-[#4c58fa]" />
            </div>
            <span className="text-sm font-semibold text-[#111827]">{r}</span>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${roleColors[r]}`}>
              {r === 'Super Admin' ? 'FULL ACCESS' : 'LIMITED'}
            </span>
          </div>
        ))}
      </div>

      {/* Permission Matrix */}
      <div className="card p-0 overflow-hidden">
        <div className="px-6 py-4 border-b border-[#E5E7EB]">
          <h2 className="section-title">Permission Matrix</h2>
          <p className="section-subtitle">Fine-grained access control per module and action</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse min-w-[700px]">
            <thead>
              <tr className="bg-[#F9FAFB] border-b border-[#E5E7EB]">
                <th className="px-6 py-3 text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wider">Module / Role</th>
                {ACTIONS.map(a => (
                  <th key={a} className="px-4 py-3 text-center text-xs font-semibold text-[#6B7280] uppercase tracking-wider">{a}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {MODULES.map(mod => (
                <React.Fragment key={mod}>
                  {/* Module group header */}
                  <tr className="bg-[#F9FAFB]">
                    <td colSpan={ACTIONS.length + 1} className="px-6 py-2 text-xs font-bold text-[#4c58fa] uppercase tracking-widest border-t border-b border-[#E5E7EB]">
                      {mod}
                    </td>
                  </tr>
                  {/* Role rows */}
                  {ROLES.map(role => (
                    <tr key={role} className="table-row border-b border-[#E5E7EB] last:border-0">
                      <td className="px-6 py-3">
                        <div className="flex items-center gap-2">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${roleColors[role]}`}>{role}</span>
                        </div>
                      </td>
                      {ACTIONS.map(action => {
                        const granted = has(role, mod, action);
                        return (
                          <td key={action} className="px-4 py-3 text-center">
                            <div className="flex items-center justify-center">
                              {granted ? (
                                <div className="w-6 h-6 rounded-lg bg-[#4c58fa] flex items-center justify-center shadow-sm">
                                  <Check size={12} className="text-white" />
                                </div>
                              ) : (
                                <div className="w-6 h-6 rounded-lg bg-[#EEF0FF] flex items-center justify-center">
                                  <Minus size={12} className="text-[#c7d2fe]" />
                                </div>
                              )}
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex items-start gap-3 bg-[#F9FAFB] border border-[#E5E7EB] rounded-2xl p-4">
        <Info size={15} className="text-[#6B7280] mt-0.5 shrink-0" />
        <p className="text-sm text-[#374151]">
          Changes to the permission matrix take effect on the next user login session. Super Admins have immutable full access.
        </p>
      </div>
    </div>
  );
}
