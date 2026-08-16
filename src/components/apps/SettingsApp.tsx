import React, { useState, useEffect } from 'react';
import { useOS } from '../../context/OSContext';
import { PRESET_WALLPAPERS } from '../../data/appsRegistry';
import { vfs } from '../../services/vfs';
import { devicePermissions } from '../../services/devicePermissions';
import { soundService } from '../../services/sound';
import {
  Wallpaper,
  Layout,
  Layers,
  Palette,
  HardDrive,
  Shield,
  Smartphone,
  Check,
  RotateCcw,
  Sparkles,
  Link,
  Bell,
  Maximize2,
  Lock,
  Compass,
  Monitor,
  Volume2,
  VolumeX,
  Volume1,
  Headphones,
  Play,
  Download,
  Laptop,
  CheckCircle2,
  Share2,
  PlusSquare,
  HelpCircle,
  ExternalLink,
  SmartphoneNfc
} from 'lucide-react';
import { pwaService, PWAState } from '../../services/pwaService';

export const SettingsApp: React.FC = () => {
  const { settings, updateSettings, addNotification, openApp, snapWindow, windows } = useOS();
  const [activeTab, setActiveTab] = useState<'wallpaper' | 'sound' | 'window-layouts' | 'storage' | 'gestures' | 'permissions' | 'about'>('wallpaper');
  const [customWallpaperInput, setCustomWallpaperInput] = useState('');
  const [wallpaperSuccess, setWallpaperSuccess] = useState(false);
  const [storageStats, setStorageStats] = useState(vfs.getStorageStats());
  const [soundSettings, setSoundSettings] = useState(soundService.getSettings());
  const [pwaState, setPwaState] = useState<PWAState>(pwaService.getState());

  useEffect(() => {
    const unsub = soundService.subscribe((s) => setSoundSettings(s));
    const unsubPWA = pwaService.subscribe((s) => setPwaState(s));
    return () => {
      unsub();
      unsubPWA();
    };
  }, []);

  const handleApplyCustomWallpaper = (e: React.FormEvent) => {
    e.preventDefault();
    const url = customWallpaperInput.trim();
    if (!url) return;

    updateSettings({ wallpaperUrl: url });
    setWallpaperSuccess(true);
    addNotification('Wallpaper Updated', 'Custom URL wallpaper applied successfully!', 'success');
    setTimeout(() => setWallpaperSuccess(false), 3000);
  };

  const handleSelectPresetWallpaper = (url: string) => {
    updateSettings({ wallpaperUrl: url });
    setWallpaperSuccess(true);
    addNotification('Wallpaper Changed', 'Preset desktop background active.', 'success');
    setTimeout(() => setWallpaperSuccess(false), 2500);
  };

  const handleTestNotification = async () => {
    const perm = await devicePermissions.requestNotificationPermission();
    if (perm === 'granted') {
      addNotification('Test Notification', 'AuraOS notifications are enabled and functioning properly!', 'info');
    } else {
      addNotification('Permissions', `Notification permission: ${perm}`, 'warning');
    }
  };

  const handleToggleFullscreen = async () => {
    await devicePermissions.toggleFullscreen();
  };

  const handleToggleWakeLock = async () => {
    const active = await devicePermissions.toggleWakeLock();
    addNotification('Screen Wake Lock', active ? 'Screen will stay awake' : 'Wake lock released', 'info');
  };

  return (
    <div id="settings-container" className="h-full flex flex-col sm:flex-row bg-slate-950 text-slate-100 overflow-hidden">
      {/* Sidebar Categories */}
      <div className="w-full sm:w-56 bg-slate-900/80 border-b sm:border-b-0 sm:border-r border-slate-800 p-3 flex sm:flex-col justify-between flex-shrink-0">
        <div className="space-y-1 w-full flex sm:block overflow-x-auto sm:overflow-x-visible pb-1 sm:pb-0">
          <div className="hidden sm:flex items-center gap-2 px-3 py-2 mb-3">
            <span className="p-1.5 bg-blue-600/20 text-blue-400 rounded-lg">
              <Sparkles className="w-4 h-4" />
            </span>
            <span className="text-xs font-bold tracking-tight text-white">System Settings</span>
          </div>

          <button
            onClick={() => setActiveTab('wallpaper')}
            className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium w-full text-left transition-all ${
              activeTab === 'wallpaper'
                ? 'bg-blue-600 text-white shadow'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Wallpaper className="w-4 h-4 flex-shrink-0" />
            <span>Wallpaper & Display</span>
          </button>

          <button
            onClick={() => setActiveTab('sound')}
            className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium w-full text-left transition-all ${
              activeTab === 'sound'
                ? 'bg-blue-600 text-white shadow'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Volume2 className="w-4 h-4 flex-shrink-0" />
            <span>Sound & Volume</span>
          </button>

          <button
            onClick={() => setActiveTab('window-layouts')}
            className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium w-full text-left transition-all ${
              activeTab === 'window-layouts'
                ? 'bg-blue-600 text-white shadow'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Layout className="w-4 h-4 flex-shrink-0" />
            <span>Multi-Window Layouts</span>
          </button>

          <button
            onClick={() => setActiveTab('gestures')}
            className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium w-full text-left transition-all ${
              activeTab === 'gestures'
                ? 'bg-blue-600 text-white shadow'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Smartphone className="w-4 h-4 flex-shrink-0" />
            <span>Mouse & Touch Gestures</span>
          </button>

          <button
            onClick={() => setActiveTab('storage')}
            className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium w-full text-left transition-all ${
              activeTab === 'storage'
                ? 'bg-blue-600 text-white shadow'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <HardDrive className="w-4 h-4 flex-shrink-0" />
            <span>R1 Quota (20MB Limit)</span>
          </button>

          <button
            onClick={() => setActiveTab('permissions')}
            className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium w-full text-left transition-all ${
              activeTab === 'permissions'
                ? 'bg-blue-600 text-white shadow'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Shield className="w-4 h-4 flex-shrink-0" />
            <span>PWA & Permissions</span>
          </button>
        </div>

        <div className="hidden sm:block text-[10px] text-slate-500 px-3 py-2 border-t border-slate-800">
          AuraOS Build 2026.08
        </div>
      </div>

      {/* Main Settings Content Area */}
      <div className="flex-1 p-6 overflow-y-auto bg-slate-950/60">
        {/* Tab 1: Wallpaper & Appearance */}
        {activeTab === 'wallpaper' && (
          <div className="space-y-6 max-w-2xl">
            <div>
              <h2 className="text-base font-bold text-white">Desktop Wallpaper & Personalization</h2>
              <p className="text-xs text-slate-400 mt-1">
                Customize your desktop appearance with preset themes or any custom image URL.
              </p>
            </div>

            {wallpaperSuccess && (
              <div className="p-3 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 rounded-xl text-xs flex items-center gap-2 animate-in fade-in">
                <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>Wallpaper updated instantly!</span>
              </div>
            )}

            {/* Custom URL Input Section (Explicitly requested by user!) */}
            <div className="p-5 bg-slate-900/80 border border-slate-800 rounded-2xl space-y-3">
              <h3 className="text-xs font-semibold text-slate-200 flex items-center gap-2">
                <Link className="w-4 h-4 text-blue-400" />
                Custom Wallpaper URL
              </h3>
              <p className="text-xs text-slate-400">
                Paste any high-resolution image URL (JPEG, PNG, WebP) to set it as your wallpaper.
              </p>

              <form onSubmit={handleApplyCustomWallpaper} className="flex gap-2">
                <input
                  id="input-custom-wallpaper-url"
                  type="url"
                  placeholder="https://images.unsplash.com/photo-example.jpg"
                  value={customWallpaperInput}
                  onChange={(e) => setCustomWallpaperInput(e.target.value)}
                  className="flex-1 bg-slate-950 border border-slate-700/80 rounded-xl px-3.5 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
                <button
                  type="submit"
                  id="btn-apply-custom-wallpaper"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-medium transition-colors shadow"
                >
                  Apply URL
                </button>
              </form>
            </div>

            {/* Default Preset Wallpapers */}
            <div className="space-y-3">
              <h3 className="text-xs font-semibold text-slate-200">Default Preset Wallpapers</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {PRESET_WALLPAPERS.map((wp) => {
                  const isCurrent = settings.wallpaperUrl === wp.url;
                  return (
                    <button
                      key={wp.id}
                      onClick={() => handleSelectPresetWallpaper(wp.url)}
                      className={`group relative rounded-xl overflow-hidden border-2 aspect-video transition-all ${
                        isCurrent
                          ? 'border-blue-500 ring-2 ring-blue-500/40 scale-[1.02]'
                          : 'border-slate-800 hover:border-slate-600'
                      }`}
                    >
                      <img src={wp.thumbnail} alt={wp.name} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-transparent flex items-end p-2">
                        <span className="text-[11px] font-medium text-white truncate">{wp.name}</span>
                      </div>
                      {isCurrent && (
                        <div className="absolute top-2 right-2 p-1 bg-blue-600 text-white rounded-full">
                          <Check className="w-3 h-3" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Scaling / Fit Mode */}
            <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-2xl flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-slate-200">Wallpaper Fit Mode</p>
                <p className="text-[11px] text-slate-500">Choose how the background image scales</p>
              </div>
              <select
                value={settings.wallpaperFit}
                onChange={(e: any) => updateSettings({ wallpaperFit: e.target.value })}
                className="bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
              >
                <option value="cover">Fill Screen (Cover)</option>
                <option value="contain">Fit to Screen (Contain)</option>
                <option value="center">Center</option>
              </select>
            </div>
          </div>
        )}

        {/* Tab: Sound & Volume Control */}
        {activeTab === 'sound' && (
          <div className="space-y-6 max-w-2xl">
            <div>
              <h2 className="text-base font-bold text-white">Audio & Master Volume Control</h2>
              <p className="text-xs text-slate-400 mt-1">
                Configure master system output volume, synthesize sound effects, and mute alerts.
              </p>
            </div>

            {/* Master Volume Slider Card */}
            <div className="p-5 bg-slate-900/80 border border-slate-800 rounded-2xl space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-600/20 text-blue-400 rounded-xl">
                    {soundSettings.isMuted ? (
                      <VolumeX className="w-5 h-5 text-rose-400" />
                    ) : soundSettings.masterVolume < 40 ? (
                      <Volume1 className="w-5 h-5 text-blue-400" />
                    ) : (
                      <Volume2 className="w-5 h-5 text-blue-400" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-xs font-semibold text-slate-200">
                      Master Audio Output Volume
                    </h3>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Controls all system sounds, notification chimes, and media playback.
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => soundService.toggleMute()}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                    soundSettings.isMuted
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 hover:bg-rose-500/30'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  {soundSettings.isMuted ? 'Muted (Click to Unmute)' : 'Active'}
                </button>
              </div>

              <div className="space-y-2 pt-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Master Level</span>
                  <span className="font-mono font-bold text-blue-400 text-sm">
                    {soundSettings.isMuted ? '0% (Muted)' : `${soundSettings.masterVolume}%`}
                  </span>
                </div>
                <input
                  id="settings-master-volume-slider"
                  type="range"
                  min="0"
                  max="100"
                  value={soundSettings.isMuted ? 0 : soundSettings.masterVolume}
                  onChange={(e) => {
                    const val = parseInt(e.target.value);
                    soundService.setMasterVolume(val);
                    soundService.playTestChime(val);
                  }}
                  className="w-full h-2.5 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-blue-500 border border-slate-800"
                />
              </div>

              <div className="pt-2 flex items-center justify-between">
                <button
                  id="btn-settings-test-audio-chime"
                  onClick={() => soundService.playTestChime(soundSettings.masterVolume)}
                  className="px-3 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-medium flex items-center gap-2 transition-colors shadow"
                >
                  <Play className="w-3.5 h-3.5" />
                  <span>Play Test Chime</span>
                </button>

                <button
                  onClick={() => soundService.playNotificationChime()}
                  className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-medium flex items-center gap-2 transition-colors"
                >
                  <Bell className="w-3.5 h-3.5 text-amber-400" />
                  <span>Test Notification Chord</span>
                </button>
              </div>
            </div>

            {/* System Sound Effects Toggle */}
            <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-2xl flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-200 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-blue-400" />
                  System UI Sound Synthesizer
                </p>
                <p className="text-[11px] text-slate-500">
                  Play harmonic Web Audio chimes on window snapping, clicks, and notifications
                </p>
              </div>
              <button
                onClick={() => {
                  const next = !soundSettings.systemSoundsEnabled;
                  soundService.setSystemSoundsEnabled(next);
                  if (next) soundService.playTestChime();
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  soundSettings.systemSoundsEnabled
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-800 text-slate-400'
                }`}
              >
                {soundSettings.systemSoundsEnabled ? 'Enabled' : 'Disabled'}
              </button>
            </div>
          </div>
        )}

        {/* Tab 2: Multi-Window Snapping Layouts */}
        {activeTab === 'window-layouts' && (
          <div className="space-y-6 max-w-2xl">
            <div>
              <h2 className="text-base font-bold text-white">Multi-Window Management & Snapping</h2>
              <p className="text-xs text-slate-400 mt-1">
                Configure dual-side windows, 1.5:0.5 ratio split, and 4-quadrant layout snapping.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Layout 1: 50 / 50 Dual Window */}
              <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-2xl space-y-3">
                <div className="h-24 bg-slate-950 border border-slate-800 rounded-xl p-2 flex gap-1.5">
                  <div className="w-1/2 h-full bg-blue-600/30 border border-blue-500/60 rounded flex items-center justify-center text-[10px] text-blue-300 font-semibold">
                    50% Left
                  </div>
                  <div className="w-1/2 h-full bg-slate-800 border border-slate-700 rounded flex items-center justify-center text-[10px] text-slate-300">
                    50% Right
                  </div>
                </div>
                <h4 className="text-xs font-semibold text-slate-200">50 / 50 Equal Split</h4>
                <p className="text-[11px] text-slate-400">
                  Ideal for side-by-side document comparison or dual-tasking.
                </p>
              </div>

              {/* Layout 2: 1.5 : 0.5 Asymmetric Ratio (Requested!) */}
              <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-2xl space-y-3">
                <div className="h-24 bg-slate-950 border border-slate-800 rounded-xl p-2 flex gap-1.5">
                  <div className="w-[60%] h-full bg-indigo-600/30 border border-indigo-500/60 rounded flex items-center justify-center text-[10px] text-indigo-300 font-semibold">
                    1.5 (60%)
                  </div>
                  <div className="w-[40%] h-full bg-slate-800 border border-slate-700 rounded flex items-center justify-center text-[10px] text-slate-300">
                    0.5 (40%)
                  </div>
                </div>
                <h4 className="text-xs font-semibold text-slate-200">1.5 : 0.5 Split</h4>
                <p className="text-[11px] text-slate-400">
                  Main focus workspace with a companion reference pane.
                </p>
              </div>

              {/* Layout 3: 4-Quadrant 2x2 Grid (Requested!) */}
              <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-2xl space-y-3">
                <div className="h-24 bg-slate-950 border border-slate-800 rounded-xl p-1.5 grid grid-cols-2 gap-1">
                  <div className="bg-emerald-600/20 border border-emerald-500/40 rounded flex items-center justify-center text-[9px] text-emerald-300">
                    Top Left
                  </div>
                  <div className="bg-slate-800 border border-slate-700 rounded flex items-center justify-center text-[9px] text-slate-300">
                    Top Right
                  </div>
                  <div className="bg-slate-800 border border-slate-700 rounded flex items-center justify-center text-[9px] text-slate-300">
                    Bottom Left
                  </div>
                  <div className="bg-slate-800 border border-slate-700 rounded flex items-center justify-center text-[9px] text-slate-300">
                    Bottom Right
                  </div>
                </div>
                <h4 className="text-xs font-semibold text-slate-200">4-Quadrant 2x2 Grid</h4>
                <p className="text-[11px] text-slate-400">
                  Four simultaneous application windows arranged in a clean grid.
                </p>
              </div>
            </div>

            <div className="p-4 bg-blue-950/20 border border-blue-900/40 rounded-2xl text-xs text-blue-300/90 leading-relaxed">
              <strong>Quick Tip:</strong> Hover over any window's Maximize button to reveal the instant snap menu, or drag a window's titlebar to any screen edge!
            </div>
          </div>
        )}

        {/* Tab 3: Gestures & Touch Navigation */}
        {activeTab === 'gestures' && (
          <div className="space-y-6 max-w-2xl">
            <div>
              <h2 className="text-base font-bold text-white">Mouse & Mobile Touch Gestures</h2>
              <p className="text-xs text-slate-400 mt-1">
                Precision desktop mouse actions paired with multi-finger mobile ergonomics.
              </p>
            </div>

            <div className="space-y-4">
              {/* Responsive Display-Calibrated Cursor Section */}
              <div className="p-5 bg-slate-900/80 border border-slate-800 rounded-2xl space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-600/20 text-blue-400 rounded-xl">
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-xs font-semibold text-slate-200">
                        Dynamic Display-Calibrated Mouse Cursor
                      </h3>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Automatically detected when a mouse or trackpad device is connected. Size scales smoothly with screen resolution.
                      </p>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 rounded-full text-[10px] font-medium flex items-center gap-1">
                    <Check className="w-3 h-3" />
                    Active Auto-Scale
                  </span>
                </div>

                {/* Place-Based Cursor Previews & Interactive Test Area */}
                <div>
                  <h4 className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2">
                    Interactive Place-Based Cursor States
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
                    <button className="p-3 bg-slate-950 border border-slate-800 rounded-xl hover:border-blue-500 transition-colors text-xs font-medium text-slate-200">
                      Hover for <strong className="text-blue-400">Hand / Pointer</strong>
                    </button>

                    <input
                      type="text"
                      placeholder="Hover for I-Beam Text"
                      className="p-3 bg-slate-950 border border-slate-800 rounded-xl focus:border-blue-500 text-xs text-slate-200 outline-none placeholder-slate-500 text-center"
                    />

                    <div className="window-drag-handle p-3 bg-slate-950 border border-slate-800 rounded-xl hover:border-amber-500/50 text-xs font-medium text-amber-300 flex items-center justify-center">
                      Hover for <strong>Grab Hand</strong>
                    </div>

                    <button disabled className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl text-xs font-medium text-slate-500 opacity-60">
                      Hover for <strong>Blocked</strong>
                    </button>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-2xl flex items-start gap-3">
                <div className="p-2 bg-blue-600/20 text-blue-400 rounded-xl flex-shrink-0">
                  <Monitor className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-slate-200">Computer Mouse Actions</h4>
                  <ul className="text-xs text-slate-400 mt-1.5 space-y-1 list-disc pl-4">
                    <li><strong>Arrow Pointer:</strong> General desktop surface and non-interactive backgrounds</li>
                    <li><strong>Hand / Point:</strong> Buttons, links, desktop icons, taskbar items, and menus</li>
                    <li><strong>I-Beam Text:</strong> Text inputs, search bars, text editor code, and terminal</li>
                    <li><strong>Grab / Grasping:</strong> Window titlebars, moveable panes, and dragging items</li>
                    <li><strong>Bidirectional Arrows:</strong> 8-way window borders and split screen handles</li>
                  </ul>
                </div>
              </div>

              <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-2xl flex items-start gap-3">
                <div className="p-2 bg-indigo-600/20 text-indigo-400 rounded-xl flex-shrink-0">
                  <Smartphone className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-slate-200">Mobile Multi-Finger Touch Controls</h4>
                  <ul className="text-xs text-slate-400 mt-1.5 space-y-1 list-disc pl-4">
                    <li><strong>Single Finger:</strong> Left click, tap to focus, drag windows</li>
                    <li><strong>Two Fingers:</strong> Right click to trigger Desktop / File context menu</li>
                    <li><strong>Three Fingers:</strong> Task View (All Tab Exposé overview of running windows)</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Cloudflare R1 Storage Quota (20MB Limit) */}
        {activeTab === 'storage' && (
          <div className="space-y-6 max-w-2xl">
            <div>
              <h2 className="text-base font-bold text-white">Cloudflare Worker & R1 Storage Manager</h2>
              <p className="text-xs text-slate-400 mt-1">
                Virtual storage monitor enforcing the 20MB per-file upload threshold.
              </p>
            </div>

            <div className="p-5 bg-slate-900/80 border border-slate-800 rounded-2xl space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-semibold text-slate-200">Virtual Storage Usage</h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    {(storageStats.usedBytes / 1024).toFixed(1)} KB used of 100 MB quota ({storageStats.fileCount} files)
                  </p>
                </div>
                <span className="text-xs font-bold text-sky-400">{storageStats.percentage}%</span>
              </div>

              <div className="w-full bg-slate-950 h-2.5 rounded-full overflow-hidden border border-slate-800">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-sky-400 transition-all duration-300"
                  style={{ width: `${Math.max(5, storageStats.percentage)}%` }}
                />
              </div>

              <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-300 text-xs flex items-center gap-2">
                <Shield className="w-4 h-4 text-amber-400 flex-shrink-0" />
                <span>
                  <strong>20MB Per-File Upload Ceiling:</strong> Files exceeding 20MB are blocked at the upload gateway to preserve free tier capacity.
                </span>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => {
                  if (confirm('Reset Virtual File System back to factory defaults?')) {
                    vfs.resetToDefaults();
                    setStorageStats(vfs.getStorageStats());
                    addNotification('Reset', 'VFS restored to default files', 'info');
                  }
                }}
                className="px-4 py-2 bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white rounded-xl text-xs font-medium transition-colors"
              >
                Reset Virtual Storage to Factory Default
              </button>
            </div>
          </div>
        )}

        {/* Tab 5: Permissions & PWA Installation Center */}
        {activeTab === 'permissions' && (
          <div className="space-y-6 max-w-2xl">
            <div>
              <h2 className="text-base font-bold text-white">PWA & Progressive Web App Installation</h2>
              <p className="text-xs text-slate-400 mt-1">
                Install AuraOS as a native standalone application on Desktop (Windows/macOS/Linux) and Mobile phones (Android/iOS).
              </p>
            </div>

            {/* PWA Hero Status Card */}
            <div className="p-5 bg-gradient-to-tr from-slate-900 via-slate-900 to-blue-950/40 border border-blue-500/30 rounded-2xl space-y-4 shadow-xl">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-blue-900/50 flex-shrink-0">
                    {pwaState.isIOS || pwaState.isAndroid ? (
                      <Smartphone className="w-6 h-6" />
                    ) : (
                      <Laptop className="w-6 h-6" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-white">AuraOS App Status</h3>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          pwaState.isInstalled
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        }`}
                      >
                        {pwaState.isInstalled ? 'Installed (Standalone PWA)' : 'Browser Mode (Installable)'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Platform: <strong className="text-slate-200">{pwaState.platformName}</strong> &bull; Browser: <strong className="text-slate-200">{pwaState.browserName}</strong>
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-xl">
                  <span className="text-[10px] text-slate-500 font-semibold block uppercase tracking-wider">Service Worker & Offline</span>
                  <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5 mt-0.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Registered & Ready (Cache v3)
                  </span>
                </div>
                <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-xl">
                  <span className="text-[10px] text-slate-500 font-semibold block uppercase tracking-wider">Display Mode</span>
                  <span className="text-xs font-semibold text-sky-400 mt-0.5 block">
                    {pwaState.isInstalled ? 'Standalone Window Controls' : 'Web Viewport'}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                {!pwaState.isInstalled ? (
                  <button
                    onClick={async () => {
                      const res = await pwaService.promptInstall();
                      if (res === 'accepted') {
                        addNotification('PWA Installed', 'AuraOS is now installing!', 'success');
                      } else if (res === 'ios_guide') {
                        pwaService.openIOSGuide();
                      } else if (res === 'already_installed') {
                        addNotification('AuraOS Active', 'Already installed.', 'info');
                      } else {
                        addNotification('Install AuraOS', 'Click the install icon in your browser address bar (🖥️ or ⬇️)', 'info');
                      }
                    }}
                    className="px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg shadow-blue-950 transition-all active:scale-95"
                  >
                    <Download className="w-4 h-4" />
                    <span>{pwaState.isIOS ? 'View iOS Add to Home Screen Guide' : 'Install AuraOS App Now'}</span>
                  </button>
                ) : (
                  <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 bg-emerald-950/40 border border-emerald-800/60 px-3.5 py-2 rounded-xl">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>AuraOS is installed as a native app on this device.</span>
                  </div>
                )}
              </div>
            </div>

            {/* Platform Guides */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Device Installation Guides</h3>

              {/* Desktop Guide */}
              <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-2xl space-y-2">
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-200">
                  <Laptop className="w-4 h-4 text-blue-400" />
                  <span>Desktop (Windows, macOS, Linux, ChromeOS)</span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  In <strong>Google Chrome</strong> or <strong>Microsoft Edge</strong>, click the <strong>Install icon (🖥️ or ⬇️)</strong> on the right side of the address bar, or click Menu &gt; <em>"Save and Share"</em> &gt; <em>"Install AuraOS"</em>.
                </p>
              </div>

              {/* Android Guide */}
              <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-2xl space-y-2">
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-200">
                  <Smartphone className="w-4 h-4 text-emerald-400" />
                  <span>Android (Chrome, Samsung Internet, Firefox)</span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Tap the <strong>"Install App"</strong> prompt banner, or tap the three dots <strong>(⋮)</strong> &gt; <strong>"Install app"</strong> / <strong>"Add to Home Screen"</strong>.
                </p>
              </div>

              {/* iOS Guide */}
              <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-2xl space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-200">
                    <Smartphone className="w-4 h-4 text-indigo-400" />
                    <span>iPhone &amp; iPad (Apple Safari)</span>
                  </div>
                  <button
                    onClick={() => pwaService.openIOSGuide()}
                    className="text-xs text-blue-400 hover:text-blue-300 underline font-medium"
                  >
                    Open Visual Guide
                  </button>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  In Safari, tap the <strong>Share</strong> button <Share2 className="w-3.5 h-3.5 inline text-blue-400 mx-0.5" /> &gt; Scroll down and tap <strong>"Add to Home Screen"</strong> <PlusSquare className="w-3.5 h-3.5 inline text-slate-300 mx-0.5" /> &gt; Tap <strong>"Add"</strong>.
                </p>
              </div>
            </div>

            {/* Hardware & Browser Permissions */}
            <div className="space-y-3 pt-2">
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Device Hardware Permissions</h3>

              <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-2xl flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-slate-200 flex items-center gap-2">
                    <Bell className="w-4 h-4 text-amber-400" />
                    System Notifications
                  </p>
                  <p className="text-[11px] text-slate-500">Deliver app updates and status alerts</p>
                </div>
                <button
                  onClick={handleTestNotification}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium transition-colors"
                >
                  Request / Test
                </button>
              </div>

              <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-2xl flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-slate-200 flex items-center gap-2">
                    <Maximize2 className="w-4 h-4 text-blue-400" />
                    Fullscreen Desktop Mode
                  </p>
                  <p className="text-[11px] text-slate-500">Immersive edge-to-edge desktop experience</p>
                </div>
                <button
                  onClick={handleToggleFullscreen}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-medium transition-colors"
                >
                  Toggle Fullscreen
                </button>
              </div>

              <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-2xl flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-slate-200 flex items-center gap-2">
                    <Lock className="w-4 h-4 text-emerald-400" />
                    Screen Wake Lock
                  </p>
                  <p className="text-[11px] text-slate-500">Prevent screen from turning off during work</p>
                </div>
                <button
                  onClick={handleToggleWakeLock}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium transition-colors"
                >
                  Toggle Wake Lock
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
