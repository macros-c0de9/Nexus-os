import React, { useState, useEffect } from 'react';
import { useOS } from '../../context/OSContext';
import {
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Info,
  X,
  ChevronLeft,
  ChevronRight,
  Layers,
  Trash2
} from 'lucide-react';

export const NotificationToast: React.FC = () => {
  const { notifications, dismissNotification, clearNotifications } = useOS();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [slideDirection, setSlideDirection] = useState<'left' | 'right' | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);

  // Keep index within bounds whenever notifications array updates
  useEffect(() => {
    if (currentIndex >= notifications.length) {
      setCurrentIndex(Math.max(0, notifications.length - 1));
    }
  }, [notifications.length, currentIndex]);

  // When a brand new notification arrives, focus index 0 (the newest upcoming message)
  useEffect(() => {
    if (notifications.length > 0) {
      setCurrentIndex(0);
      setSlideDirection('right');
      const t = setTimeout(() => setSlideDirection(null), 300);
      return () => clearTimeout(t);
    }
  }, [notifications.length > 0 ? notifications[0].id : null]);

  if (notifications.length === 0) return null;

  const currentNotif = notifications[currentIndex] || notifications[0];
  const total = notifications.length;

  const handlePrev = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (total <= 1 || isAnimating) return;
    setIsAnimating(true);
    setSlideDirection('left');
    setCurrentIndex((prev) => (prev === 0 ? total - 1 : prev - 1));
    setTimeout(() => {
      setSlideDirection(null);
      setIsAnimating(false);
    }, 260);
  };

  const handleNext = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (total <= 1 || isAnimating) return;
    setIsAnimating(true);
    setSlideDirection('right');
    setCurrentIndex((prev) => (prev === total - 1 ? 0 : prev + 1));
    setTimeout(() => {
      setSlideDirection(null);
      setIsAnimating(false);
    }, 260);
  };

  const handleCardClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // If clicking on a button, do not navigate
    if ((e.target as HTMLElement).closest('button')) return;

    // Detect if click happened on left half or right half of popup
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    if (clickX < rect.width / 2) {
      handlePrev();
    } else {
      handleNext();
    }
  };

  let icon = <Info className="w-4 h-4 text-blue-400" />;
  let borderColor = 'border-slate-700/80';
  let badgeColor = 'bg-blue-500/20 text-blue-300 border-blue-500/30';

  if (currentNotif.type === 'success') {
    icon = <CheckCircle2 className="w-4 h-4 text-emerald-400" />;
    borderColor = 'border-emerald-500/50';
    badgeColor = 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
  } else if (currentNotif.type === 'error') {
    icon = <AlertCircle className="w-4 h-4 text-rose-400" />;
    borderColor = 'border-rose-500/50';
    badgeColor = 'bg-rose-500/20 text-rose-300 border-rose-500/30';
  } else if (currentNotif.type === 'warning') {
    icon = <AlertTriangle className="w-4 h-4 text-amber-400" />;
    borderColor = 'border-amber-500/50';
    badgeColor = 'bg-amber-500/20 text-amber-300 border-amber-500/30';
  }

  return (
    <div
      id="notifications-stacked-container"
      className="fixed top-4 right-4 z-[9999] w-full max-w-sm select-none pointer-events-auto"
    >
      <div className="relative">
        {/* Layer 2: Third notification card back illusion (if >= 3) */}
        {total >= 3 && (
          <div
            className="absolute top-2 left-3 right-3 h-20 bg-slate-900/60 border border-slate-800/60 rounded-2xl shadow-md -z-20 transform scale-[0.92] opacity-50 blur-[0.5px]"
            style={{ transformOrigin: 'top center' }}
          />
        )}

        {/* Layer 1: Second notification card back illusion (if >= 2) */}
        {total >= 2 && (
          <div
            className="absolute top-1 left-1.5 right-1.5 h-20 bg-slate-900/80 border border-slate-700/60 rounded-2xl shadow-lg -z-10 transform scale-[0.96] opacity-75"
            style={{ transformOrigin: 'top center' }}
          />
        )}

        {/* Front Active Notification Card (Upcoming / Selected) */}
        <div
          id={`notification-popup-${currentNotif.id}`}
          onClick={handleCardClick}
          className={`relative p-3.5 rounded-2xl border ${borderColor} bg-slate-950/95 shadow-2xl backdrop-blur-2xl text-slate-100 transition-all duration-200 cursor-pointer overflow-hidden ${
            slideDirection === 'left'
              ? '-translate-x-2 opacity-90'
              : slideDirection === 'right'
              ? 'translate-x-2 opacity-90'
              : 'translate-x-0 opacity-100'
          }`}
        >
          {/* Top Header: Icon, Type Badge, Stack Counter, and Controls */}
          <div className="flex items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-2 min-w-0">
              <div className="flex-shrink-0">{icon}</div>
              <span className={`px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider rounded-full border ${badgeColor}`}>
                {currentNotif.type || 'Notice'}
              </span>
              {currentNotif.time && (
                <span className="text-[10px] text-slate-400 font-mono hidden sm:inline">
                  {currentNotif.time}
                </span>
              )}
            </div>

            <div className="flex items-center gap-1">
              {/* Stack Counter & Carousel Navigation */}
              {total > 1 && (
                <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 rounded-lg px-1.5 py-0.5 mr-1">
                  <button
                    id="btn-notif-prev"
                    onClick={handlePrev}
                    className="p-0.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-colors"
                    title="Previous notification (Click left)"
                  >
                    <ChevronLeft className="w-3 h-3" />
                  </button>
                  <span className="text-[10px] font-mono text-slate-300 px-1">
                    {currentIndex + 1}/{total}
                  </span>
                  <button
                    id="btn-notif-next"
                    onClick={handleNext}
                    className="p-0.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-colors"
                    title="Next notification (Click right)"
                  >
                    <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
              )}

              {/* Dismiss All if multiple */}
              {total > 1 && (
                <button
                  id="btn-notif-clear-all"
                  onClick={(e) => {
                    e.stopPropagation();
                    clearNotifications();
                  }}
                  className="p-1 text-slate-400 hover:text-rose-400 hover:bg-slate-900 rounded-lg transition-colors"
                  title="Dismiss all notifications"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}

              {/* Close Current */}
              <button
                id="btn-notif-close-current"
                onClick={(e) => {
                  e.stopPropagation();
                  dismissNotification(currentNotif.id);
                }}
                className="p-1 text-slate-400 hover:text-white hover:bg-slate-900 rounded-lg transition-colors"
                title="Dismiss"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Main Body */}
          <div className="space-y-1">
            <h4 className="text-xs font-bold text-white leading-tight">
              {currentNotif.title}
            </h4>
            <p className="text-[11px] text-slate-300 leading-snug break-words">
              {currentNotif.message}
            </p>
          </div>

          {/* Optional Action Button */}
          {currentNotif.actionLabel && currentNotif.onAction && (
            <div className="mt-2 pt-2 border-t border-slate-800/80 flex justify-end">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  currentNotif.onAction?.();
                  dismissNotification(currentNotif.id);
                }}
                className="px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-medium transition-colors"
              >
                {currentNotif.actionLabel}
              </button>
            </div>
          )}

          {/* Bottom Interactive Hint for Multi-message stack */}
          {total > 1 && (
            <div className="mt-2 pt-1.5 border-t border-slate-800/50 flex items-center justify-between text-[10px] text-slate-500">
              <span className="flex items-center gap-1">
                <Layers className="w-3 h-3 text-blue-400" />
                <span>{total - 1} more behind</span>
              </span>
              <span className="text-[9px] text-slate-400">
                Click left ◀ or right ▶ to slide
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
