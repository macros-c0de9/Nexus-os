import React, { useState, useEffect } from 'react';
import { useOS } from '../../context/OSContext';
import { Activity, XCircle, RefreshCw, Cpu, HardDrive } from 'lucide-react';
import { DynamicIcon } from '../common/DynamicIcon';

export const TaskManager: React.FC = () => {
  const { windows, closeWindow } = useOS();
  const [cpuUsage, setCpuUsage] = useState(12);
  const [ramUsage, setRamUsage] = useState(41);

  useEffect(() => {
    const interval = setInterval(() => {
      setCpuUsage(Math.floor(8 + Math.random() * 15));
      setRamUsage(Math.floor(38 + windows.length * 4 + Math.random() * 3));
    }, 2000);
    return () => clearInterval(interval);
  }, [windows.length]);

  return (
    <div id="task-manager-container" className="h-full flex flex-col bg-slate-950 text-slate-100 overflow-hidden">
      {/* Metrics Banner */}
      <div className="p-3 border-b border-slate-800 bg-slate-900/90 grid grid-cols-2 gap-3 flex-shrink-0">
        <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Cpu className="w-4 h-4 text-blue-400" />
            <div>
              <p className="text-[10px] text-slate-400 uppercase font-semibold">CPU Usage</p>
              <p className="text-sm font-bold text-slate-100">{cpuUsage}%</p>
            </div>
          </div>
          <div className="w-16 bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div className="bg-blue-500 h-full transition-all duration-300" style={{ width: `${cpuUsage}%` }} />
          </div>
        </div>

        <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-2">
            <HardDrive className="w-4 h-4 text-indigo-400" />
            <div>
              <p className="text-[10px] text-slate-400 uppercase font-semibold">Memory Usage</p>
              <p className="text-sm font-bold text-slate-100">{ramUsage}%</p>
            </div>
          </div>
          <div className="w-16 bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div className="bg-indigo-500 h-full transition-all duration-300" style={{ width: `${ramUsage}%` }} />
          </div>
        </div>
      </div>

      {/* Process Table */}
      <div className="flex-1 p-3 overflow-y-auto">
        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
          Active Window Processes ({windows.length})
        </h3>

        {windows.length === 0 ? (
          <div className="p-6 text-center text-slate-500 text-xs border border-dashed border-slate-800 rounded-xl">
            No active application windows running.
          </div>
        ) : (
          <div className="space-y-1.5">
            {windows.map((win, idx) => {
              const pid = 200 + idx;
              const mem = 18 + (idx * 6) % 35;
              const cpu = (1.2 + (idx * 0.7) % 4).toFixed(1);

              return (
                <div
                  key={win.id}
                  id={`process-row-${win.id}`}
                  className="p-2.5 bg-slate-900/60 border border-slate-800/80 rounded-xl flex items-center justify-between gap-3 hover:bg-slate-800/50 transition-colors"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="p-1.5 bg-slate-800 rounded-lg text-blue-400 flex-shrink-0">
                      <DynamicIcon name={win.icon} iconType={win.iconType} size={16} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-slate-200 truncate">{win.title}</p>
                      <p className="text-[10px] text-slate-500">PID: {pid} | State: Active</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-xs font-mono text-slate-400">
                    <span className="hidden sm:inline text-[11px]">{cpu}% CPU</span>
                    <span className="hidden sm:inline text-[11px]">{mem} MB</span>
                    <button
                      onClick={() => closeWindow(win.id)}
                      className="px-2 py-1 bg-rose-500/10 hover:bg-rose-600 text-rose-400 hover:text-white rounded-lg text-[11px] font-sans font-medium transition-colors flex items-center gap-1"
                      title="End Process"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      <span>End Task</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
