import React from 'react';
import { useOS } from '../../context/OSContext';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';

export const NotificationToast: React.FC = () => {
  const { notifications, dismissNotification } = useOS();

  if (notifications.length === 0) return null;

  return (
    <div
      id="notifications-container"
      className="fixed top-4 right-4 z-[9999] flex flex-col gap-2 max-w-sm w-full pointer-events-none"
    >
      {notifications.map((n) => {
        let icon = <Info className="w-4 h-4 text-blue-400" />;
        let borderColor = 'border-slate-700/80';
        let bgColor = 'bg-slate-900/95';

        if (n.type === 'success') {
          icon = <CheckCircle2 className="w-4 h-4 text-emerald-400" />;
          borderColor = 'border-emerald-500/40';
        } else if (n.type === 'error') {
          icon = <AlertCircle className="w-4 h-4 text-rose-400" />;
          borderColor = 'border-rose-500/40';
        } else if (n.type === 'warning') {
          icon = <AlertTriangle className="w-4 h-4 text-amber-400" />;
          borderColor = 'border-amber-500/40';
        }

        return (
          <div
            key={n.id}
            id={`notification-${n.id}`}
            className={`pointer-events-auto p-3 rounded-2xl border ${borderColor} ${bgColor} shadow-2xl backdrop-blur-xl flex items-start gap-3 text-slate-100 animate-in slide-in-from-top-3 fade-in duration-200`}
          >
            <div className="mt-0.5 flex-shrink-0">{icon}</div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-white leading-tight">{n.title}</p>
              <p className="text-[11px] text-slate-300 mt-0.5 leading-snug break-words">
                {n.message}
              </p>
            </div>
            <button
              onClick={() => dismissNotification(n.id)}
              className="p-1 text-slate-500 hover:text-white rounded-lg transition-colors flex-shrink-0"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
