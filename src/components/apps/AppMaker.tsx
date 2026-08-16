import React, { useState } from 'react';
import { useOS } from '../../context/OSContext';
import { DynamicIcon } from '../common/DynamicIcon';
import { APP_TEMPLATES } from '../../data/appsRegistry';
import {
  Globe,
  Plus,
  Trash2,
  ExternalLink,
  Sparkles,
  Check,
  Palette,
  Code2,
  BookOpen,
  Flame,
  Calculator,
  Film,
  FolderKanban,
  Music,
  Gamepad2,
  Wrench,
  Link,
  Layers
} from 'lucide-react';

const SUGGESTED_ICONS = [
  'Globe',
  'Palette',
  'Code2',
  'BookOpen',
  'Flame',
  'Calculator',
  'Film',
  'Music',
  'Gamepad2',
  'Wrench',
  'Layers',
  'FolderKanban',
  'Sparkles',
  'Bot',
  'Cpu',
  'Compass',
  'Shield',
  'Feather'
];

export const AppMaker: React.FC = () => {
  const { customApps, addCustomApp, deleteCustomApp, openApp } = useOS();

  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [iconType, setIconType] = useState<'lucide' | 'url'>('lucide');
  const [icon, setIcon] = useState('Globe');
  const [customIconUrl, setCustomIconUrl] = useState('');
  const [category, setCategory] = useState<'tools' | 'webapps' | 'utilities' | 'media' | 'development'>('webapps');
  const [description, setDescription] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleAddApp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !url.trim()) return;

    const chosenIcon = iconType === 'url' ? customIconUrl.trim() : icon;

    const created = addCustomApp({
      title: title.trim(),
      url: url.trim(),
      icon: chosenIcon,
      iconType,
      category,
      description: description.trim() || `Web app for ${url.trim()}`,
    });

    setSuccessMessage(`"${created.title}" added to your desktop!`);
    setTimeout(() => setSuccessMessage(''), 3500);

    // Reset form
    setTitle('');
    setUrl('');
    setDescription('');
    setCustomIconUrl('');
  };

  const handleUseTemplate = (template: (typeof APP_TEMPLATES)[0]) => {
    setTitle(template.title);
    setUrl(template.url);
    setIcon(template.icon);
    setIconType(template.iconType);
    setCategory(template.category);
    setDescription(template.description);
  };

  return (
    <div id="app-maker-container" className="h-full flex flex-col bg-slate-900 text-slate-100 overflow-y-auto">
      {/* Header Banner */}
      <div className="p-5 border-b border-slate-800 bg-gradient-to-r from-blue-950/40 via-slate-900 to-indigo-950/40 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-blue-600/20 text-blue-400 rounded-lg">
              <Sparkles className="w-5 h-5" />
            </span>
            <h1 className="text-lg font-bold tracking-tight text-white">App Maker (Web to App Converter)</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Turn any website into a standalone desktop application window with native controls.
          </p>
        </div>
      </div>

      {successMessage && (
        <div className="mx-5 mt-4 p-3 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 rounded-xl text-xs flex items-center gap-2 animate-in fade-in duration-200">
          <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      <div className="p-5 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Form Column */}
        <div className="lg:col-span-7 space-y-5">
          <div className="bg-slate-800/50 border border-slate-700/60 rounded-2xl p-5 space-y-4">
            <h2 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
              <Plus className="w-4 h-4 text-blue-400" />
              Configure New Web App
            </h2>

            <form onSubmit={handleAddApp} className="space-y-4">
              {/* App Name */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  App Name <span className="text-rose-400">*</span>
                </label>
                <input
                  id="input-app-maker-name"
                  type="text"
                  required
                  placeholder="e.g. Excalidraw Whiteboard, Notion, Spotify"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-slate-950/70 border border-slate-700/80 rounded-xl px-3.5 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                />
              </div>

              {/* URL */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Website URL <span className="text-rose-400">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                    <Link className="w-4 h-4" />
                  </div>
                  <input
                    id="input-app-maker-url"
                    type="text"
                    required
                    placeholder="https://excalidraw.com"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    className="w-full bg-slate-950/70 border border-slate-700/80 rounded-xl pl-9 pr-3.5 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                  />
                </div>
              </div>

              {/* Icon Type Selection */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-2">App Icon Source</label>
                <div className="flex gap-3 mb-3">
                  <button
                    type="button"
                    id="btn-icon-type-preset"
                    onClick={() => setIconType('lucide')}
                    className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-medium border transition-all ${
                      iconType === 'lucide'
                        ? 'bg-blue-600 text-white border-blue-500'
                        : 'bg-slate-900 text-slate-400 border-slate-700 hover:border-slate-600'
                    }`}
                  >
                    System Icon Presets
                  </button>
                  <button
                    type="button"
                    id="btn-icon-type-url"
                    onClick={() => setIconType('url')}
                    className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-medium border transition-all ${
                      iconType === 'url'
                        ? 'bg-blue-600 text-white border-blue-500'
                        : 'bg-slate-900 text-slate-400 border-slate-700 hover:border-slate-600'
                    }`}
                  >
                    Custom Image URL
                  </button>
                </div>

                {iconType === 'lucide' ? (
                  <div className="grid grid-cols-6 gap-2 p-2 bg-slate-950/60 rounded-xl border border-slate-800 max-h-32 overflow-y-auto">
                    {SUGGESTED_ICONS.map((ic) => (
                      <button
                        key={ic}
                        type="button"
                        onClick={() => setIcon(ic)}
                        className={`p-2 rounded-lg flex items-center justify-center transition-all ${
                          icon === ic
                            ? 'bg-blue-600 text-white ring-2 ring-blue-400'
                            : 'bg-slate-800/80 text-slate-400 hover:bg-slate-700 hover:text-slate-200'
                        }`}
                        title={ic}
                      >
                        <DynamicIcon name={ic} size={18} />
                      </button>
                    ))}
                  </div>
                ) : (
                  <div>
                    <input
                      id="input-app-maker-icon-url"
                      type="url"
                      placeholder="https://example.com/icon.png"
                      value={customIconUrl}
                      onChange={(e) => setCustomIconUrl(e.target.value)}
                      className="w-full bg-slate-950/70 border border-slate-700/80 rounded-xl px-3.5 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                )}
              </div>

              {/* Category & Description */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">Category</label>
                  <select
                    id="select-app-maker-category"
                    value={category}
                    onChange={(e: any) => setCategory(e.target.value)}
                    className="w-full bg-slate-950/70 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-blue-500"
                  >
                    <option value="webapps">Web Apps</option>
                    <option value="tools">Productivity & Tools</option>
                    <option value="development">Development</option>
                    <option value="media">Media & Entertainment</option>
                    <option value="utilities">Utilities</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">Short Description</label>
                  <input
                    id="input-app-maker-desc"
                    type="text"
                    placeholder="e.g. Sketching and diagrams"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full bg-slate-950/70 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                id="btn-add-app-to-desktop"
                className="w-full py-2.5 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-semibold rounded-xl shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2 transition-all active:scale-[0.99]"
              >
                <Plus className="w-4 h-4" />
                Add App to Desktop & Process Pool
              </button>
            </form>
          </div>

          {/* Quick 1-Click Templates */}
          <div className="bg-slate-800/30 border border-slate-700/40 rounded-2xl p-4">
            <h3 className="text-xs font-semibold text-slate-300 mb-3 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              Quick 1-Click Presets
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {APP_TEMPLATES.map((tmpl) => (
                <button
                  key={tmpl.title}
                  id={`btn-preset-template-${tmpl.title.toLowerCase().replace(/\s+/g, '-')}`}
                  onClick={() => handleUseTemplate(tmpl)}
                  className="p-2.5 bg-slate-900/60 hover:bg-slate-800/80 border border-slate-800 hover:border-slate-700 rounded-xl text-left transition-all group flex items-start gap-2.5"
                >
                  <div className="p-1.5 bg-slate-800 rounded-lg text-blue-400 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                    <DynamicIcon name={tmpl.icon} size={16} />
                  </div>
                  <div className="overflow-hidden">
                    <p className="text-xs font-medium text-slate-200 group-hover:text-white truncate">
                      {tmpl.title}
                    </p>
                    <p className="text-[10px] text-slate-500 truncate">{tmpl.url.replace('https://', '')}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Preview & Custom Apps List Column */}
        <div className="lg:col-span-5 space-y-5">
          {/* Live Preview Card */}
          <div className="bg-slate-800/50 border border-slate-700/60 rounded-2xl p-5">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
              Desktop Icon Preview
            </h3>
            <div className="bg-slate-950/80 border border-slate-850 rounded-xl p-6 flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600/30 to-indigo-600/30 border border-blue-500/40 flex items-center justify-center shadow-lg shadow-blue-900/20 mb-3">
                <DynamicIcon
                  name={iconType === 'url' ? customIconUrl || 'Globe' : icon}
                  iconType={iconType}
                  customUrl={iconType === 'url' ? customIconUrl : undefined}
                  size={32}
                  className="text-blue-400"
                />
              </div>
              <p className="text-sm font-semibold text-white truncate max-w-[200px]">
                {title || 'My Web App'}
              </p>
              <p className="text-[11px] text-slate-400 truncate max-w-[220px] mt-0.5">
                {url || 'https://example.com'}
              </p>
              <span className="mt-3 px-2 py-0.5 bg-blue-500/10 text-blue-300 text-[10px] font-medium rounded-full border border-blue-500/20">
                Category: {category}
              </span>
            </div>
          </div>

          {/* Installed Custom Apps List */}
          <div className="bg-slate-800/50 border border-slate-700/60 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-semibold text-slate-200">
                Your Installed Web Apps ({customApps.length})
              </h3>
            </div>

            {customApps.length === 0 ? (
              <div className="p-6 text-center text-slate-500 text-xs border border-dashed border-slate-800 rounded-xl">
                <Globe className="w-8 h-8 mx-auto mb-2 text-slate-600 stroke-1" />
                No custom web apps created yet. Use the form to add one!
              </div>
            ) : (
              <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                {customApps.map((app) => (
                  <div
                    key={app.id}
                    id={`custom-app-item-${app.id}`}
                    className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl flex items-center justify-between gap-3 group hover:border-slate-700 transition-all"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 flex-shrink-0">
                        <DynamicIcon
                          name={app.icon}
                          iconType={app.iconType}
                          customUrl={app.customIconUrl}
                          size={18}
                        />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-slate-200 truncate">{app.title}</p>
                        <p className="text-[10px] text-slate-500 truncate">{app.customUrl}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <button
                        onClick={() => openApp(app.id)}
                        className="p-1.5 bg-blue-600/20 hover:bg-blue-600 text-blue-300 hover:text-white rounded-lg transition-colors text-xs flex items-center gap-1"
                        title="Launch Window"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => deleteCustomApp(app.id)}
                        className="p-1.5 bg-rose-500/10 hover:bg-rose-600 text-rose-400 hover:text-white rounded-lg transition-colors text-xs"
                        title="Uninstall App"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
