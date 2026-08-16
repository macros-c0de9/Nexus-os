import React, { useState, useEffect } from 'react';
import { useOS } from '../../context/OSContext';
import { DynamicIcon } from '../common/DynamicIcon';
import { vfs } from '../../services/vfs';
import {
  LayoutGrid,
  Search,
  Layers,
  Volume2,
  VolumeX,
  Wifi,
  HardDrive,
  Calendar,
  Sparkles,
  Maximize2
} from 'lucide-react';
import { devicePermissions } from '../../services/devicePermissions';

export const Taskbar: React.FC = () => {
  const {
    startMenuOpen,
    setStartMenuOpen,
    toggleStartMenu,
    toggleTaskView,
    windows,
    activeWindowId,
    focusWindow,
    minimizeWindow,
    allApps,
    openApp,
    closeContextMenu,
    openContextMenu,
  } = useOS();

  const [timeStr, setTimeStr] = useState('');
  const [dateStr, setDateStr] = useState('');
  const [storageStats, setStorageStats] = useState(vfs.getStorageStats());
  const [volumeMuted, setVolumeMuted] = useState(false);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(
        now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      );
      setDateStr(
        now.toLocaleDateString([], { month: 'short', day: 'numeric' })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);

    const unsub = vfs.subscribe(() => {
      setStorageStats(vfs.getStorageStats());
    });

    return () => {
      clearInterval(interval);
      unsub();
    };
  }, []);

  // Pinned taskbar apps
  const pinnedApps = allApps.filter((a) => a.isPinnedToTaskbar || a.isCustomApp);

  const handleAppClick = (appId: string) => {
    // Check if there is already a window open for this app
    const existingWins = windows.filter((w) => w.appId === appId);
    if (existingWins.length > 0) {
      const activeWin = existingWins.find((w) => w.id === activeWindowId);
      if (activeWin && !activeWin.isMinimized) {
        // Minimize if already focused
        minimizeWindow(activeWin.id);
      } else {
        // Focus top window
        focusWindow(existingWins[0].id);
      }
    } else {
      openApp(appId);
    }
  };

  return (
    <div
      id="aura-taskbar"
      onClick={(e) => {
        closeContextMenu();
      }}
      className="fixed bottom-0 left-0 right-0 h-12 z-[9800] bg-slate-950/85 backdrop-blur-2xl border-t border-slate-800/80 flex items-center justify-between px-3 select-none"
    >
      {/* Left / Center Section: Start Button & Taskbar Apps */}
      <div className="flex items-center gap-1.5 h-full">
        {/* Windows-style Aura Start Button */}
        <button
          id="btn-start-menu"
          onClick={(e) => {
            e.stopPropagation();
            toggleStartMenu();
          }}
          className={`h-9 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-all duration-150 ${
            startMenuOpen
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
              : 'text-slate-300 hover:text-white hover:bg-slate-800/70 active:scale-95'
          }`}
          title="Start Menu"
        >
          <LayoutGrid className="w-4 h-4" />
          <span className="text-xs font-bold tracking-tight hidden sm:inline">AuraOS</span>
        </button>

        {/* Search button */}
        <button
          id="btn-taskbar-search"
          onClick={(e) => {
            e.stopPropagation();
            toggleStartMenu();
          }}
          className="h-9 px-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/70 transition-colors hidden sm:flex items-center gap-1.5"
          title="Search"
        >
          <Search className="w-3.5 h-3.5" />
          <span className="text-xs text-slate-400">Search</span>
        </button>

        {/* Task View / All Tabs Exposé Button (3-Finger Equivalent) */}
        <button
          id="btn-task-view"
          onClick={(e) => {
            e.stopPropagation();
            toggleTaskView();
          }}
          className="h-9 px-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/70 transition-colors flex items-center gap-1.5"
          title="Task View (All Tabs)"
        >
          <Layers className="w-3.5 h-3.5" />
          <span className="text-xs hidden md:inline">Task View</span>
        </button>

        <div className="w-[1px] h-6 bg-slate-800 mx-1" />

        {/* Running & Pinned Apps Dock */}
        <div className="flex items-center gap-1 h-full overflow-x-auto max-w-[50vw]">
          {/* Pinned system apps and custom web apps */}
          {pinnedApps.map((app) => {
            const openWindows = windows.filter((w) => w.appId === app.id);
            const isOpen = openWindows.length > 0;
            const isCurrentActive = openWindows.some((w) => w.id === activeWindowId && !w.isMinimized);

            return (
              <button
                key={app.id}
                id={`taskbar-app-${app.id}`}
                onClick={() => handleAppClick(app.id)}
                onContextMenu={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  openContextMenu(
                    e.clientX,
                    e.clientY - 80,
                    [
                      {
                        id: 'launch',
                        label: `Open ${app.title}`,
                        icon: 'ExternalLink',
                        onClick: () => openApp(app.id),
                      },
                      ...(isOpen
                        ? [
                            {
                              id: 'close-all',
                              label: 'Close Window',
                              icon: 'X',
                              danger: true,
                              onClick: () => openWindows.forEach((w) => minimizeWindow(w.id)),
                            },
                          ]
                        : []),
                    ],
                    'taskbar'
                  );
                }}
                className={`relative h-9 px-2 rounded-xl flex items-center justify-center transition-all duration-150 group ${
                  isCurrentActive
                    ? 'bg-slate-800/90 text-blue-400 ring-1 ring-blue-500/40'
                    : isOpen
                    ? 'bg-slate-900/60 text-slate-200 hover:bg-slate-800/60'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
                }`}
                title={app.title}
              >
                <div className="w-6 h-6 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <DynamicIcon
                    name={app.icon}
                    iconType={app.iconType}
                    customUrl={app.customIconUrl}
                    size={18}
                  />
                </div>

                {/* Open Indicator Pill Bar */}
                {isOpen && (
                  <span
                    className={`absolute bottom-0.5 left-1/2 -translate-x-1/2 h-1 rounded-full transition-all duration-200 ${
                      isCurrentActive ? 'w-4 bg-blue-500 shadow-sm shadow-blue-400' : 'w-1.5 bg-slate-500'
                    }`}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Right Section: System Tray & Clock */}
      <div className="flex items-center gap-1.5 h-full">
        {/* R1 Cloudflare Storage Monitor Chip */}
        <button
          onClick={() => openApp('settings')}
          className="h-8 px-2 bg-slate-900/70 hover:bg-slate-800/90 border border-slate-800 rounded-lg flex items-center gap-1.5 text-[11px] text-slate-300 transition-colors hidden sm:flex"
          title="Cloudflare R1 Free Storage (20MB Max per file limit)"
        >
          <HardDrive className="w-3.5 h-3.5 text-sky-400" />
          <span className="font-mono">{storageStats.percentage}% R1</span>
        </button>

        {/* Volume Mute Toggle */}
        <button
          onClick={() => setVolumeMuted(!volumeMuted)}
          className="p-2 text-slate-400 hover:text-white hover:bg-slate-800/70 rounded-lg transition-colors"
          title="System Audio"
        >
          {volumeMuted ? <VolumeX className="w-3.5 h-3.5 text-rose-400" /> : <Volume2 className="w-3.5 h-3.5" />}
        </button>

        {/* Wi-Fi indicator */}
        <div className="p-2 text-slate-400 hover:text-white rounded-lg hidden sm:block" title="Connected: Cloudflare Worker Gateway">
          <Wifi className="w-3.5 h-3.5 text-emerald-400" />
        </div>

        {/* Live Clock & Calendar */}
        <button
          onClick={() => openApp('settings')}
          className="h-9 px-2.5 rounded-xl hover:bg-slate-800/70 flex flex-col items-end justify-center text-right transition-colors"
          title="Time and Calendar Settings"
        >
          <span className="text-xs font-semibold text-slate-200 leading-tight font-mono">
            {timeStr}
          </span>
          <span className="text-[10px] text-slate-400 leading-tight">
            {dateStr}
          </span>
        </button>
      </div>
    </div>
  );
};
