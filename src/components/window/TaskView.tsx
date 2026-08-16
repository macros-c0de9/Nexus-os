import React from 'react';
import { useOS } from '../../context/OSContext';
import { DynamicIcon } from '../common/DynamicIcon';
import { X, Layers, Plus } from 'lucide-react';

export const TaskView: React.FC = () => {
  const {
    windows,
    focusWindow,
    closeWindow,
    taskViewOpen,
    setTaskViewOpen,
    openApp,
  } = useOS();

  if (!taskViewOpen) return null;

  return (
    <div
      id="task-view-overlay"
      onClick={() => setTaskViewOpen(false)}
      className="fixed inset-0 z-[9990] bg-slate-950/80 backdrop-blur-2xl flex flex-col p-6 sm:p-10 select-none animate-in fade-in duration-200"
    >
      {/* Task View Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-blue-600/20 text-blue-400 rounded-2xl">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">Task View & All Tab Exposé</h2>
            <p className="text-xs text-slate-400">
              {windows.length} running window{windows.length !== 1 ? 's' : ''} • Tap any window to switch focus
            </p>
          </div>
        </div>

        <button
          onClick={() => setTaskViewOpen(false)}
          className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* Windows Grid */}
      <div className="flex-1 overflow-y-auto">
        {windows.length === 0 ? (
          <div className="h-64 flex flex-col items-center justify-center text-slate-500 text-sm">
            <Layers className="w-12 h-12 stroke-1 text-slate-600 mb-3" />
            <p>No active windows open.</p>
            <button
              onClick={(e) => {
                e.stopPropagation();
                openApp('app-maker');
                setTaskViewOpen(false);
              }}
              className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Launch App Maker
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {windows.map((win) => (
              <div
                key={win.id}
                id={`task-view-card-${win.id}`}
                onClick={(e) => {
                  e.stopPropagation();
                  focusWindow(win.id);
                  setTaskViewOpen(false);
                }}
                className="group relative bg-slate-900/90 border border-slate-700/60 hover:border-blue-500 rounded-2xl p-3 flex flex-col justify-between h-48 cursor-pointer shadow-xl hover:shadow-2xl hover:scale-[1.02] transition-all"
              >
                {/* Header in preview */}
                <div className="flex items-center justify-between gap-2 border-b border-slate-800 pb-2">
                  <div className="flex items-center gap-2 truncate">
                    <DynamicIcon name={win.icon} iconType={win.iconType} size={16} className="text-blue-400" />
                    <span className="text-xs font-semibold text-white truncate">{win.title}</span>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      closeWindow(win.id);
                    }}
                    className="p-1 text-slate-500 hover:text-white hover:bg-rose-600 rounded-lg transition-colors"
                    title="Close Window"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Thumbnail Wireframe Preview */}
                <div className="flex-1 my-2 bg-slate-950/80 rounded-xl border border-slate-800 flex flex-col items-center justify-center p-3 text-center">
                  <DynamicIcon name={win.icon} iconType={win.iconType} size={28} className="text-slate-600 group-hover:text-blue-400 transition-colors mb-1" />
                  <span className="text-[11px] text-slate-400 truncate max-w-[180px]">
                    {win.title}
                  </span>
                </div>

                <div className="flex items-center justify-between text-[10px] text-slate-500">
                  <span>PID: {win.id.slice(-4)}</span>
                  <span className="text-emerald-400 font-medium">● Running</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
