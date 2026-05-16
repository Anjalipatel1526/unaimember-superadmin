import React from 'react';
import { X, AlertTriangle } from 'lucide-react';

export default function ConfirmModal({ 
  open, 
  onClose, 
  onConfirm, 
  title = "Confirm Action", 
  message = "Are you sure you want to proceed?", 
  confirmText = "Confirm", 
  cancelText = "Cancel",
  type = "danger", // 'danger' | 'warning' | 'info'
  loading = false
}) {
  if (!open) return null;

  const colors = {
    danger: {
      icon: "text-rose-600 bg-rose-50",
      button: "bg-rose-600 hover:bg-rose-700 text-white shadow-rose-200",
    },
    warning: {
      icon: "text-amber-600 bg-amber-50",
      button: "bg-amber-600 hover:bg-amber-700 text-white shadow-amber-200",
    },
    info: {
      icon: "text-[#4c58fa] bg-[#EEF0FF]",
      button: "bg-[#4c58fa] hover:bg-[#3d48d9] text-white shadow-[#4c58fa]/20",
    }
  };

  const currentStyle = colors[type] || colors.info;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-50">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${currentStyle.icon}`}>
              <AlertTriangle size={20} />
            </div>
            <h3 className="text-lg font-bold text-gray-900">{title}</h3>
          </div>
          <button onClick={onClose} className="btn-ghost w-10 h-10 flex items-center justify-center p-0 rounded-2xl hover:bg-gray-100 transition-colors">
            <X size={20} />
          </button>
        </div>
        
        <div className="px-8 py-10 text-center">
          <p className="text-gray-600 leading-relaxed font-medium">
            {message}
          </p>
        </div>

        <div className="px-6 py-5 bg-gray-50/50 flex items-center gap-3">
          <button 
            type="button" 
            onClick={onClose} 
            disabled={loading}
            className="flex-1 px-6 py-3.5 rounded-2xl bg-white border border-gray-200 text-gray-700 font-bold hover:bg-gray-100 hover:border-gray-300 transition-all active:scale-95 disabled:opacity-50"
          >
            {cancelText}
          </button>
          <button 
            type="button" 
            onClick={onConfirm} 
            disabled={loading}
            className={`flex-1 px-6 py-3.5 rounded-2xl font-bold transition-all active:scale-95 shadow-lg disabled:opacity-50 ${currentStyle.button}`}
          >
            {loading ? "Processing..." : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
