import React, { useState } from 'react';
import { useOS } from '../../context/OSContext';
import { DynamicIcon } from '../common/DynamicIcon';
import {
  Search,
  PlusSquare,
  Power,
  RotateCcw,
  Maximize2,
  Lock,
  HardDrive,
  ExternalLink,
  ChevronRight,
  Sparkles,
  Settings,
  Terminal,
  FolderKanban,
  Download,
  Smartphone,
  Laptop
} from 'lucide-react';
import { devicePermissions } from '../../services/devicePermissions';
import { pwaService } from '../../services/pwaService';

export const StartMenu: React.FC = () => {
  const {
    startMenuOpen,
    setStartMenuOpen,
    allApps,
    customApps,
    openApp,
    openFileInDefaultApp,
    toggleTaskView,
    addNotification,
  } = useOS();

  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');

  if (!startMenuOpen) return null;

  const filteredApps = allApps.filter((app) => {
    const matchesSearch =
      app.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = activeCategory === 'all' || app.category === activeCategory;
    return matchesSearch && matchesCat;
  });

  const handleLaunch = (appId: string) => {
    openApp(appId);
    setStartMenuOpen(false);
  };

  const handleToggleFullscreen = async () => {
    await devicePermissions.toggleFullscreen();
    setStartMenuOpen(false);
  };

  return (
    <div
      id="start-menu-container"
      onClick={(e) => e.stopPropagation()}
      className="fixed bottom-14 left-1/2 -translate-x-1/2 sm:left-4 sm:translate-x-0 z-[9900] w-[95vw] sm:w-[540px] h-[520px] max-h-[85vh] bg-slate-900/95 border border-slate-700/80 rounded-3xl shadow-2xl backdrop-blur-2xl flex flex-col overflow-hidden text-slate-100 animate-in fade-in slide-in-from-bottom-6 duration-200"
    >
      {/* Top Search Bar */}
      <div className="p-4 border-b border-slate-800 flex-shrink-0">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            autoFocus
            placeholder="Search applications, tools, web apps..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950/80 border border-slate-750 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50"
          />
        </div>

        {/* Quick Category Filters */}
        <div className="flex items-center gap-1.5 mt-3 overflow-x-auto pb-1 text-xs">
          {[
            { id: 'all', label: 'All' },
            { id: 'custom', label: 'Web Apps' },
            { id: 'productivity', label: 'Productivity' },
            { id: 'media', label: 'Media' },
            { id: 'system', label: 'System' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-3 py-1 rounded-xl font-medium transition-colors text-[11px] ${
                activeCategory === cat.id
                  ? 'bg-blue-600 text-white shadow'
                  : 'bg-slate-950/60 text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Prominent App Maker Banner */}
      <div className="p-3 mx-4 my-2 bg-gradient-to-r from-blue-900/40 via-indigo-900/30 to-slate-900/40 border border-blue-500/30 rounded-2xl flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-blue-600 text-white rounded-xl shadow-md shadow-blue-600/30">
            <PlusSquare className="w-4 h-4" />
          </div>
          <div>
            <p className="text-xs font-bold text-white">App Maker: Add Website as App</p>
            <p className="text-[10px] text-blue-200/80">Turn any URL into a desktop window process</p>
          </div>
        </div>
        <button
          onClick={() => handleLaunch('app-maker')}
          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold shadow transition-all flex items-center gap-1 flex-shrink-0"
        >
          <span>Create</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Main Apps Grid */}
      <div className="flex-1 p-4 overflow-y-auto">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Applications ({filteredApps.length})
          </span>
        </div>

        {filteredApps.length === 0 ? (
          <div className="h-32 flex items-center justify-center text-slate-500 text-xs">
            No matching apps found.
          </div>
        ) : (
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5">
            {filteredApps.map((app) => (
              <button
                key={app.id}
                id={`start-app-${app.id}`}
                onClick={() => handleLaunch(app.id)}
                className="group p-2.5 bg-slate-950/40 hover:bg-slate-800/70 border border-slate-850 hover:border-blue-500/40 rounded-2xl flex flex-col items-center justify-center text-center transition-all hover:scale-105"
              >
                <div className="w-10 h-10 flex items-center justify-center mb-1.5 group-hover:drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]">
                  <DynamicIcon
                    name={app.icon}
                    iconType={app.iconType}
                    customUrl={app.customIconUrl}
                    size={24}
                    className={app.isCustomApp ? 'text-indigo-400' : 'text-blue-400'}
                  />
                </div>
                <span className="text-[11px] font-semibold text-slate-200 group-hover:text-white truncate w-full px-1">
                  {app.title}
                </span>
                <span className="text-[9px] text-slate-500 truncate w-full px-1">
                  {app.isCustomApp ? 'Web App' : app.category}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Bottom Profile & System Power Footer */}
      <div className="p-3 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center font-bold text-xs text-white shadow">
            A
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-200">AuraOS User</p>
            <p className="text-[10px] text-slate-500">Cloudflare Worker Process</p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={async () => {
              setStartMenuOpen(false);
              const res = await pwaService.promptInstall();
              if (res === 'accepted') {
                addNotification('PWA Installed', 'AuraOS is now installed on your device!', 'success');
              } else if (res === 'already_installed') {
                addNotification('AuraOS Active', 'Running in standalone native window mode.', 'info');
              }
            }}
            className="p-2 text-sky-400 hover:text-white hover:bg-blue-600/30 rounded-xl transition-colors"
            title="Install AuraOS App (PWA)"
          >
            <Download className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleLaunch('settings')}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
            title="Settings"
          >
            <Settings className="w-4 h-4" />
          </button>
          <button
            onClick={handleToggleFullscreen}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
            title="Toggle Fullscreen"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              if (confirm('Restart AuraOS web desktop session?')) {
                window.location.reload();
              }
            }}
            className="p-2 text-rose-400 hover:text-white hover:bg-rose-600 rounded-xl transition-colors"
            title="Restart Session"
          >
            <Power className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
