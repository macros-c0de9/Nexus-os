import React, { useState, useEffect, useRef } from 'react';
import { useOS } from '../../context/OSContext';
import { DynamicIcon } from '../common/DynamicIcon';
import { vfs } from '../../services/vfs';
import { soundService } from '../../services/sound';
import {
  LayoutGrid,
  Search,
  Layers,
  Volume2,
  Volume1,
  VolumeX,
  Wifi,
  HardDrive,
  Calendar,
  Sparkles,
  Maximize2,
  Headphones,
  Bell,
  Sliders,
  Play,
  Download,
  Smartphone,
  Laptop,
  CheckCircle2
} from 'lucide-react';
import { devicePermissions } from '../../services/devicePermissions';
import { pwaService, PWAState } from '../../services/pwaService';

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
    addNotification,
  } = useOS();

  const [timeStr, setTimeStr] = useState('');
  const [dateStr, setDateStr] = useState('');
  const [storageStats, setStorageStats] = useState(vfs.getStorageStats());
  const [pwaState, setPwaState] = useState<PWAState>(pwaService.getState());
  
  // Sound Service state
  const [soundSettings, setSoundSettings] = useState(soundService.getSettings());
  const [showVolumeFlyout, setShowVolumeFlyout] = useState(false);
  const volumeFlyoutRef = useRef<HTMLDivElement>(null);

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

    const unsubVfs = vfs.subscribe(() => {
      setStorageStats(vfs.getStorageStats());
    });

    const unsubSound = soundService.subscribe((settings) => {
      setSoundSettings(settings);
    });

    const unsubPWA = pwaService.subscribe((state) => {
      setPwaState(state);
    });

    // Close flyout on outside click
    const handleGlobalClick = (e: MouseEvent) => {
      if (volumeFlyoutRef.current && !volumeFlyoutRef.current.contains(e.target as Node)) {
        setShowVolumeFlyout(false);
      }
    };
    window.addEventListener('mousedown', handleGlobalClick);

    return () => {
      clearInterval(interval);
      unsubVfs();
      unsubSound();
      unsubPWA();
      window.removeEventListener('mousedown', handleGlobalClick);
    };
  }, []);

  const handleInstallClick = async () => {
    const res = await pwaService.promptInstall();
    if (res === 'accepted') {
      addNotification('PWA Installed', 'AuraOS is now installing as a standalone desktop app!', 'success');
    } else if (res === 'already_installed') {
      addNotification('AuraOS Active', 'Running in standalone native window mode.', 'info');
    }
  };

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

  const handleVolumeChange = (newVal: number) => {
    soundService.setMasterVolume(newVal);
    soundService.playTestChime(newVal);
  };

  const handleToggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    soundService.toggleMute();
  };

  const getVolumeIcon = () => {
    if (soundSettings.isMuted || soundSettings.masterVolume === 0) {
      return <VolumeX className="w-3.5 h-3.5 text-rose-400" />;
    }
    if (soundSettings.masterVolume < 40) {
      return <Volume1 className="w-3.5 h-3.5 text-slate-300" />;
    }
    return <Volume2 className="w-3.5 h-3.5 text-blue-400" />;
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
            setShowVolumeFlyout(false);
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
            setShowVolumeFlyout(false);
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
            setShowVolumeFlyout(false);
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
      <div className="flex items-center gap-1.5 h-full relative">
        {/* R1 Cloudflare Storage Monitor Chip */}
        <button
          onClick={() => openApp('settings')}
          className="h-8 px-2 bg-slate-900/70 hover:bg-slate-800/90 border border-slate-800 rounded-lg flex items-center gap-1.5 text-[11px] text-slate-300 transition-colors hidden sm:flex"
          title="Cloudflare R1 Free Storage (20MB Max per file limit)"
        >
          <HardDrive className="w-3.5 h-3.5 text-sky-400" />
          <span className="font-mono">{storageStats.percentage}% R1</span>
        </button>

        {/* Master Sound & Volume Control Flyout Button */}
        <div className="relative" ref={volumeFlyoutRef}>
          <button
            id="btn-taskbar-volume"
            onClick={(e) => {
              e.stopPropagation();
              setShowVolumeFlyout(!showVolumeFlyout);
            }}
            className={`p-2 rounded-lg transition-colors flex items-center gap-1 ${
              showVolumeFlyout
                ? 'bg-blue-600/30 text-blue-300 border border-blue-500/50'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/70'
            }`}
            title={`Sound: ${soundSettings.isMuted ? 'Muted' : `${soundSettings.masterVolume}%`}`}
          >
            {getVolumeIcon()}
            <span className="text-[10px] font-mono font-medium hidden md:inline text-slate-300">
              {soundSettings.isMuted ? 'MUTE' : `${soundSettings.masterVolume}%`}
            </span>
          </button>

          {/* Windows 11-style Quick Sound & Volume Flyout Panel */}
          {showVolumeFlyout && (
            <div
              id="volume-flyout-panel"
              onClick={(e) => e.stopPropagation()}
              className="absolute right-0 bottom-12 mb-2 w-72 p-4 bg-slate-900/95 border border-slate-700/80 rounded-2xl shadow-2xl backdrop-blur-2xl text-slate-100 animate-in fade-in zoom-in-95 space-y-3 z-[9999]"
            >
              {/* Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-blue-600/20 text-blue-400 rounded-lg">
                    <Headphones className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-white">Audio & Volume</h4>
                    <p className="text-[10px] text-slate-400">Aura Stereo Web Audio</p>
                  </div>
                </div>
                <button
                  onClick={handleToggleMute}
                  className={`px-2 py-1 rounded-lg text-xs font-medium transition-colors flex items-center gap-1 ${
                    soundSettings.isMuted
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  {soundSettings.isMuted ? 'Unmute' : 'Mute'}
                </button>
              </div>

              {/* Master Volume Slider */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-300 flex items-center gap-1.5">
                    {getVolumeIcon()}
                    <span>Master Output</span>
                  </span>
                  <span className="font-mono font-bold text-blue-400">
                    {soundSettings.isMuted ? '0%' : `${soundSettings.masterVolume}%`}
                  </span>
                </div>
                <input
                  id="taskbar-volume-slider"
                  type="range"
                  min="0"
                  max="100"
                  value={soundSettings.isMuted ? 0 : soundSettings.masterVolume}
                  onChange={(e) => handleVolumeChange(parseInt(e.target.value))}
                  className="w-full h-2 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-blue-500 border border-slate-800"
                />
              </div>

              {/* System Sound Chimes & Test Controls */}
              <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                <button
                  id="btn-volume-test-sound"
                  onClick={() => soundService.playTestChime(soundSettings.masterVolume)}
                  className="px-2.5 py-1.5 bg-slate-800 hover:bg-blue-600 hover:text-white text-slate-300 rounded-xl text-[11px] font-medium flex items-center gap-1.5 transition-colors"
                >
                  <Play className="w-3 h-3 text-emerald-400" />
                  <span>Test Audio Chime</span>
                </button>

                <button
                  onClick={() => {
                    setShowVolumeFlyout(false);
                    openApp('settings');
                  }}
                  className="p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors"
                  title="More Sound Settings"
                >
                  <Sliders className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Wi-Fi indicator */}
        <div className="p-2 text-slate-400 hover:text-white rounded-lg hidden sm:block" title="Connected: Cloudflare Worker Gateway">
          <Wifi className="w-3.5 h-3.5 text-emerald-400" />
        </div>

        {/* PWA Install / Standalone Status Tray Button */}
        <button
          id="taskbar-pwa-install-btn"
          onClick={handleInstallClick}
          className={`h-9 px-2 rounded-xl flex items-center gap-1.5 transition-all text-xs ${
            pwaState.isInstalled
              ? 'text-emerald-400 hover:bg-slate-800/70'
              : 'bg-blue-600/20 hover:bg-blue-600 text-blue-300 hover:text-white border border-blue-500/30'
          }`}
          title={
            pwaState.isInstalled
              ? `AuraOS Standalone App (${pwaState.platformName})`
              : `Install AuraOS on ${pwaState.isIOS ? 'iPhone/iPad' : pwaState.isAndroid ? 'Android' : 'Desktop'}`
          }
        >
          {pwaState.isInstalled ? (
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          ) : (
            <>
              <Download className="w-3.5 h-3.5 text-sky-400" />
              <span className="hidden md:inline font-bold text-[11px]">Install App</span>
            </>
          )}
        </button>

        {/* Live Clock & Calendar */}
        <button
          onClick={() => {
            setShowVolumeFlyout(false);
            openApp('settings');
          }}
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
