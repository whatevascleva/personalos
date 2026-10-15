import React from 'react';
import { CheckCircle2, Info, AlertCircle, X } from 'lucide-react';
import { useOS } from '../../store/useOSStore';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useOS();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm pointer-events-none">
      {toasts.map((toast) => {
        const Icon =
          toast.type === 'alert'
            ? AlertCircle
            : toast.type === 'info'
            ? Info
            : CheckCircle2;

        const colorClasses =
          toast.type === 'alert'
            ? 'border-rose-500/40 text-rose-300'
            : toast.type === 'info'
            ? 'border-indigo-500/40 text-indigo-300'
            : 'border-emerald-500/40 text-emerald-300';

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto p-3.5 rounded-xl bg-slate-900/95 border backdrop-blur-md shadow-2xl flex items-start gap-3 transition-all animate-slideUp text-xs ${colorClasses}`}
          >
            <Icon className="w-4 h-4 shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-slate-100 truncate">{toast.title}</div>
              {toast.message && (
                <div className="text-[11px] text-slate-400 mt-0.5 truncate">{toast.message}</div>
              )}
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-slate-500 hover:text-slate-300 p-0.5 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
