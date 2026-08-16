import React, { useState, useEffect, useRef } from 'react';
import { useOS } from '../../context/OSContext';
import { vfs } from '../../services/vfs';
import {
  ArrowLeft,
  ArrowRight,
  RotateCw,
  Globe,
  ExternalLink,
  Shield,
  Smartphone,
  Tablet,
  Monitor,
  Lock,
  Search,
  Code2,
  FileCode,
  Sparkles,
  Zap,
  CheckCircle2,
  AlertTriangle,
  Image as ImageIcon,
  Newspaper,
  Video,
  MapPin,
  X,
  Compass,
  ChevronRight,
  TrendingUp,
  Bookmark,
  Share2
} from 'lucide-react';

interface WebBrowserProps {
  initialUrl?: string;
  appTitle?: string;
  filePath?: string;
}

interface SearchResultItem {
  title: string;
  url: string;
  snippet: string;
  domain: string;
}

interface SearchApiResponse {
  query: string;
  abstract: string;
  abstractSource: string;
  abstractUrl: string;
  image: string;
  results: SearchResultItem[];
  related: string[];
}

const TOP_SHORTCUTS = [
  { title: 'Wikipedia', url: 'https://en.wikipedia.org', icon: 'https://en.wikipedia.org/static/favicon/wikipedia.ico', color: 'bg-slate-800' },
  { title: 'GitHub', url: 'https://github.com', icon: 'https://github.githubassets.com/favicons/favicon.png', color: 'bg-slate-900' },
  { title: 'Excalidraw', url: 'https://excalidraw.com', icon: 'https://excalidraw.com/favicon-32x32.png', color: 'bg-indigo-900/50' },
  { title: 'Hacker News', url: 'https://news.ycombinator.com', icon: 'https://news.ycombinator.com/favicon.ico', color: 'bg-amber-900/50' },
  { title: 'DevDocs', url: 'https://devdocs.io', icon: 'https://devdocs.io/favicon.ico', color: 'bg-emerald-900/50' },
  { title: 'DuckDuckGo', url: 'https://duckduckgo.com', icon: 'https://duckduckgo.com/favicon.ico', color: 'bg-orange-900/50' },
  { title: 'MDN Web Docs', url: 'https://developer.mozilla.org', icon: 'https://developer.mozilla.org/favicon-48x48.png', color: 'bg-cyan-900/50' },
  { title: 'OpenStreetMap', url: 'https://www.openstreetmap.org', icon: 'https://www.openstreetmap.org/assets/favicon-32x32.png', color: 'bg-teal-900/50' },
];

export const WebBrowser: React.FC<WebBrowserProps> = ({
  initialUrl = 'https://www.google.com',
  appTitle,
  filePath,
}) => {
  const { openApp, addNotification } = useOS();
  const [isLocalFile, setIsLocalFile] = useState<boolean>(!!filePath);
  const [activeFilePath, setActiveFilePath] = useState<string | undefined>(filePath);
  const [localHtmlContent, setLocalHtmlContent] = useState<string>('');
  
  const startingUrl = filePath ? `file://${filePath}` : initialUrl || 'https://www.google.com';
  const [currentUrl, setCurrentUrl] = useState(startingUrl);
  const [inputUrl, setInputUrl] = useState(startingUrl);
  const [viewportMode, setViewportMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [history, setHistory] = useState<string[]>([startingUrl]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [frameKey, setFrameKey] = useState(0);
  const [useProxy, setUseProxy] = useState(true);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Live Search States
  const [searchFilter, setSearchFilter] = useState<'all' | 'images' | 'news' | 'videos' | 'maps'>('all');
  const [searchData, setSearchData] = useState<SearchApiResponse | null>(null);
  const [isSearchLoading, setIsSearchLoading] = useState(false);
  const [searchQueryString, setSearchQueryString] = useState('');

  // Check if current URL is Google or Search Mode
  const isGoogleHome =
    !isLocalFile &&
    (currentUrl === 'https://www.google.com' ||
      currentUrl === 'https://google.com' ||
      currentUrl === 'http://www.google.com' ||
      currentUrl === 'http://google.com' ||
      currentUrl === 'about:blank' ||
      currentUrl === '');

  const isGoogleSearch =
    !isLocalFile &&
    (currentUrl.startsWith('https://www.google.com/search') ||
      currentUrl.startsWith('https://google.com/search') ||
      currentUrl.startsWith('http://www.google.com/search') ||
      currentUrl.startsWith('http://google.com/search') ||
      currentUrl.startsWith('https://duckduckgo.com/?q='));

  // Load local file content from VFS
  const loadLocalFile = (path: string) => {
    const item = vfs.getItemByPath(path);
    if (item) {
      setLocalHtmlContent(item.content || '');
      setIsLocalFile(true);
      setActiveFilePath(path);
      const fileUri = `file://${item.path}`;
      setCurrentUrl(fileUri);
      setInputUrl(fileUri);
    } else {
      setLocalHtmlContent(`<html><body style="font-family: sans-serif; padding: 2rem; color: #ef4444; background: #0f172a;"><h3>File not found: ${path}</h3></body></html>`);
      setIsLocalFile(true);
    }
  };

  useEffect(() => {
    if (filePath) {
      loadLocalFile(filePath);
    } else if (initialUrl && initialUrl !== currentUrl) {
      setIsLocalFile(false);
      setActiveFilePath(undefined);
      setCurrentUrl(initialUrl);
      setInputUrl(initialUrl);
      setHistory([initialUrl]);
      setHistoryIndex(0);
    }
  }, [filePath, initialUrl]);

  // Perform backend search API query when in Google Search Mode
  useEffect(() => {
    if (isGoogleSearch) {
      try {
        let q = '';
        if (currentUrl.includes('?q=')) {
          const u = new URL(currentUrl);
          q = u.searchParams.get('q') || '';
        } else if (currentUrl.includes('q=')) {
          const match = currentUrl.match(/q=([^&]+)/);
          if (match) q = decodeURIComponent(match[1]);
        }

        if (q) {
          setSearchQueryString(q);
          setIsSearchLoading(true);
          fetch(`/api/search?q=${encodeURIComponent(q)}`)
            .then((r) => r.json())
            .then((data: SearchApiResponse) => {
              setSearchData(data);
              setIsSearchLoading(false);
            })
            .catch(() => {
              setIsSearchLoading(false);
            });
        }
      } catch (err) {
        setIsSearchLoading(false);
      }
    }
  }, [currentUrl, isGoogleSearch]);

  // Subscribe to VFS changes for live HTML reload
  useEffect(() => {
    if (!activeFilePath) return;
    const unsubscribe = vfs.subscribe(() => {
      const updated = vfs.getItemByPath(activeFilePath);
      if (updated && updated.content !== localHtmlContent) {
        setLocalHtmlContent(updated.content);
        setFrameKey((k) => k + 1);
      }
    });
    return () => unsubscribe();
  }, [activeFilePath, localHtmlContent]);

  const handleNavigate = (targetUrl: string) => {
    let clean = targetUrl.trim();
    if (!clean) return;

    if (clean.startsWith('file://')) {
      const vfsPath = clean.replace(/^file:\/\//, '');
      loadLocalFile(vfsPath);
      const nextHistory = [...history.slice(0, historyIndex + 1), clean];
      setHistory(nextHistory);
      setHistoryIndex(nextHistory.length - 1);
      return;
    }

    if (!clean.startsWith('http://') && !clean.startsWith('https://')) {
      if (clean.includes('.') && !clean.includes(' ')) {
        clean = 'https://' + clean;
      } else {
        // Direct Search query -> Google Search Mode
        clean = `https://www.google.com/search?q=${encodeURIComponent(clean)}`;
      }
    }

    setIsLocalFile(false);
    setActiveFilePath(undefined);
    setCurrentUrl(clean);
    setInputUrl(clean);
    setIsLoading(true);

    const nextHistory = [...history.slice(0, historyIndex + 1), clean];
    setHistory(nextHistory);
    setHistoryIndex(nextHistory.length - 1);
  };

  const handleGoogleHomeSearch = (query: string) => {
    if (!query.trim()) return;
    const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(query.trim())}`;
    handleNavigate(searchUrl);
  };

  const handleReload = () => {
    if (isLocalFile && activeFilePath) {
      loadLocalFile(activeFilePath);
    }
    if (isGoogleSearch && searchQueryString) {
      setIsSearchLoading(true);
      fetch(`/api/search?q=${encodeURIComponent(searchQueryString)}`)
        .then((r) => r.json())
        .then((data: SearchApiResponse) => {
          setSearchData(data);
          setIsSearchLoading(false);
        })
        .catch(() => setIsSearchLoading(false));
    }
    setIsLoading(true);
    setFrameKey((prev) => prev + 1);
  };

  const handleBack = () => {
    if (historyIndex > 0) {
      const prevUrl = history[historyIndex - 1];
      setHistoryIndex((prev) => prev - 1);
      if (prevUrl.startsWith('file://')) {
        loadLocalFile(prevUrl.replace(/^file:\/\//, ''));
      } else {
        setIsLocalFile(false);
        setActiveFilePath(undefined);
        setCurrentUrl(prevUrl);
        setInputUrl(prevUrl);
      }
      setIsLoading(true);
    }
  };

  const handleForward = () => {
    if (historyIndex < history.length - 1) {
      const nextUrl = history[historyIndex + 1];
      setHistoryIndex((prev) => prev + 1);
      if (nextUrl.startsWith('file://')) {
        loadLocalFile(nextUrl.replace(/^file:\/\//, ''));
      } else {
        setIsLocalFile(false);
        setActiveFilePath(undefined);
        setCurrentUrl(nextUrl);
        setInputUrl(nextUrl);
      }
      setIsLoading(true);
    }
  };

  const getViewportWidthClass = () => {
    switch (viewportMode) {
      case 'mobile':
        return 'max-w-[390px] border-x border-slate-700/60 shadow-2xl';
      case 'tablet':
        return 'max-w-[768px] border-x border-slate-700/60 shadow-2xl';
      default:
        return 'w-full';
    }
  };

  // Effective iframe src
  const getIframeSrc = () => {
    if (isLocalFile || isGoogleHome || isGoogleSearch) return undefined;
    if (useProxy && (currentUrl.startsWith('http://') || currentUrl.startsWith('https://'))) {
      return `/api/proxy?url=${encodeURIComponent(currentUrl)}`;
    }
    return currentUrl;
  };

  return (
    <div id="browser-container" className="h-full flex flex-col bg-slate-950 text-slate-100 overflow-hidden select-text">
      {/* Browser Controls Toolbar */}
      <div className="p-2 border-b border-slate-800 bg-slate-900/90 flex flex-wrap items-center gap-2 flex-shrink-0">
        {/* Navigation Buttons */}
        <div className="flex items-center gap-1">
          <button
            id="browser-btn-back"
            onClick={handleBack}
            disabled={historyIndex === 0}
            className="p-1.5 rounded-lg text-slate-300 hover:bg-slate-800 disabled:opacity-40 disabled:hover:bg-transparent transition-colors"
            title="Back"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <button
            id="browser-btn-forward"
            onClick={handleForward}
            disabled={historyIndex >= history.length - 1}
            className="p-1.5 rounded-lg text-slate-300 hover:bg-slate-800 disabled:opacity-40 disabled:hover:bg-transparent transition-colors"
            title="Forward"
          >
            <ArrowRight className="w-4 h-4" />
          </button>
          <button
            id="browser-btn-reload"
            onClick={handleReload}
            className={`p-1.5 rounded-lg text-slate-300 hover:bg-slate-800 transition-colors ${
              isLoading || isSearchLoading ? 'animate-spin text-blue-400' : ''
            }`}
            title="Reload Preview"
          >
            <RotateCw className="w-4 h-4" />
          </button>
        </div>

        {/* Address Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleNavigate(inputUrl);
          }}
          className="flex-1 min-w-[200px] flex items-center bg-slate-950/80 border border-slate-700/80 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500"
        >
          {isLocalFile ? (
            <FileCode className="w-3.5 h-3.5 text-amber-400 mr-2 flex-shrink-0" />
          ) : isGoogleHome || isGoogleSearch ? (
            <Search className="w-3.5 h-3.5 text-blue-400 mr-2 flex-shrink-0" />
          ) : (
            <Lock className="w-3.5 h-3.5 text-emerald-400 mr-2 flex-shrink-0" />
          )}
          <input
            id="browser-address-input"
            type="text"
            value={inputUrl}
            onChange={(e) => setInputUrl(e.target.value)}
            onDragOver={(e) => {
              e.preventDefault();
              e.dataTransfer.dropEffect = 'copy';
            }}
            onDrop={(e) => {
              e.preventDefault();
              const dropped = e.dataTransfer.getData('text/plain') || e.dataTransfer.getData('text');
              if (dropped) {
                setInputUrl(dropped);
                handleNavigate(dropped);
              }
            }}
            className="flex-1 bg-transparent border-none outline-none text-xs text-slate-100 placeholder-slate-500 select-text"
            placeholder="Search Google or enter web address..."
          />
          <button type="submit" className="text-slate-400 hover:text-white ml-1">
            <Search className="w-3.5 h-3.5" />
          </button>
        </form>

        {/* Viewport Simulation & File / External Open Controls */}
        <div className="flex items-center gap-1.5">
          {/* Quick Home Button */}
          <button
            onClick={() => handleNavigate('https://www.google.com')}
            className={`p-1.5 rounded-lg text-xs font-medium flex items-center gap-1 transition-all ${
              isGoogleHome
                ? 'bg-blue-600/30 text-blue-300 border border-blue-500/40'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
            title="Google Home"
          >
            <Globe className="w-3.5 h-3.5" />
            <span className="hidden sm:inline text-[11px]">Google</span>
          </button>

          {/* Proxy Mode Toggle Button for external iframes */}
          {!isLocalFile && !isGoogleHome && !isGoogleSearch && (
            <button
              id="browser-btn-toggle-proxy"
              onClick={() => {
                setUseProxy(!useProxy);
                setIsLoading(true);
                setFrameKey((k) => k + 1);
              }}
              className={`p-1.5 px-2.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all ${
                useProxy
                  ? 'bg-blue-600/30 text-blue-300 border border-blue-500/50 hover:bg-blue-600/50'
                  : 'bg-slate-800 text-slate-400 border border-slate-700 hover:text-slate-200'
              }`}
              title={useProxy ? 'Proxy Gateway Active' : 'Direct Embed'}
            >
              <Zap className={`w-3.5 h-3.5 ${useProxy ? 'text-amber-400' : 'text-slate-400'}`} />
              <span className="hidden md:inline text-[11px]">
                {useProxy ? 'Proxy Gateway' : 'Direct Embed'}
              </span>
            </button>
          )}

          {/* Edit in Text Editor button for Local HTML files */}
          {isLocalFile && activeFilePath && (
            <button
              id="browser-btn-edit-code"
              onClick={() => openApp('text-editor', { filePath: activeFilePath })}
              className="p-1.5 bg-blue-600/30 hover:bg-blue-600/50 border border-blue-500/40 text-blue-300 hover:text-white rounded-lg text-xs flex items-center gap-1.5 transition-colors"
              title="Edit HTML Source Code in Text Editor"
            >
              <Code2 className="w-3.5 h-3.5 text-blue-400" />
              <span className="hidden sm:inline font-medium">Edit Source</span>
            </button>
          )}

          <div className="flex items-center bg-slate-950/60 rounded-lg p-0.5 border border-slate-800">
            <button
              id="browser-view-desktop"
              onClick={() => setViewportMode('desktop')}
              className={`p-1.5 rounded text-xs transition-colors ${
                viewportMode === 'desktop' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Desktop View (100%)"
            >
              <Monitor className="w-3.5 h-3.5" />
            </button>
            <button
              id="browser-view-tablet"
              onClick={() => setViewportMode('tablet')}
              className={`p-1.5 rounded text-xs transition-colors ${
                viewportMode === 'tablet' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Tablet View (768px)"
            >
              <Tablet className="w-3.5 h-3.5" />
            </button>
            <button
              id="browser-view-mobile"
              onClick={() => setViewportMode('mobile')}
              className={`p-1.5 rounded text-xs transition-colors ${
                viewportMode === 'mobile' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Mobile View (390px)"
            >
              <Smartphone className="w-3.5 h-3.5" />
            </button>
          </div>

          {!isLocalFile && (
            <a
              id="browser-btn-open-external"
              href={currentUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg text-xs flex items-center gap-1 transition-colors"
              title="Open in Native Browser Tab"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span className="hidden sm:inline text-[10px]">New Tab</span>
            </a>
          )}
        </div>
      </div>

      {/* Main Browser Content Body */}
      <div className="flex-1 bg-slate-900/50 flex items-center justify-center overflow-hidden relative select-text">
        <div className={`h-full mx-auto transition-all duration-300 bg-slate-950 overflow-y-auto flex flex-col ${getViewportWidthClass()}`}>
          {/* 1. Local HTML Files */}
          {isLocalFile ? (
            <iframe
              key={frameKey}
              ref={iframeRef}
              srcDoc={localHtmlContent}
              title={appTitle || activeFilePath || 'HTML Document Preview'}
              className="w-full h-full border-0 bg-white"
              sandbox="allow-same-origin allow-scripts allow-popups allow-forms allow-modals"
              onLoad={() => setIsLoading(false)}
            />
          ) : isGoogleHome ? (
            /* 2. Google Search Homepage View */
            <div className="flex-1 flex flex-col items-center justify-center p-6 text-center max-w-2xl mx-auto w-full my-auto space-y-6 animate-in fade-in duration-200">
              {/* Google Brand Logo */}
              <div className="space-y-2">
                <div className="flex items-center justify-center text-4xl sm:text-5xl font-black tracking-tight select-none">
                  <span className="text-[#4285F4]">G</span>
                  <span className="text-[#EA4335]">o</span>
                  <span className="text-[#FBBC05]">o</span>
                  <span className="text-[#4285F4]">g</span>
                  <span className="text-[#34A853]">l</span>
                  <span className="text-[#EA4335]">e</span>
                </div>
                <p className="text-xs text-slate-400 font-medium">AuraOS Web & Knowledge Search Engine</p>
              </div>

              {/* Main Search Input Card */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const val = (document.getElementById('google-home-search-input') as HTMLInputElement)?.value;
                  if (val) handleGoogleHomeSearch(val);
                }}
                className="w-full max-w-xl relative"
              >
                <div className="flex items-center w-full bg-slate-900 border border-slate-700/90 hover:border-slate-500 focus-within:border-blue-500 rounded-full px-4 py-3 shadow-xl transition-all">
                  <Search className="w-4 h-4 text-slate-400 mr-3 flex-shrink-0" />
                  <input
                    id="google-home-search-input"
                    type="text"
                    placeholder="Search Google or type a URL..."
                    autoFocus
                    defaultValue=""
                    className="flex-1 bg-transparent border-none outline-none text-sm text-slate-100 placeholder-slate-500 select-text"
                  />
                  <button
                    type="submit"
                    className="px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded-full text-xs font-semibold shadow transition-colors"
                  >
                    Search
                  </button>
                </div>

                <div className="flex items-center justify-center gap-3 mt-4">
                  <button
                    type="submit"
                    className="px-4 py-2 bg-slate-900/80 hover:bg-slate-800 border border-slate-800 text-xs font-medium text-slate-300 hover:text-white rounded-xl transition-colors"
                  >
                    Google Search
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const luckyTerms = ['React docs', 'Wikipedia today', 'Latest space discoveries', 'Web development guides'];
                      const pick = luckyTerms[Math.floor(Math.random() * luckyTerms.length)];
                      handleGoogleHomeSearch(pick);
                    }}
                    className="px-4 py-2 bg-slate-900/80 hover:bg-slate-800 border border-slate-800 text-xs font-medium text-slate-300 hover:text-white rounded-xl transition-colors"
                  >
                    I'm Feeling Lucky
                  </button>
                </div>
              </form>

              {/* Speed Dial Shortcuts */}
              <div className="w-full pt-4">
                <p className="text-[11px] text-slate-500 uppercase tracking-wider font-semibold mb-3">
                  Top Web Platforms & Knowledge Sites
                </p>
                <div className="grid grid-cols-4 sm:grid-cols-4 gap-2.5">
                  {TOP_SHORTCUTS.map((item) => (
                    <button
                      key={item.title}
                      onClick={() => handleNavigate(item.url)}
                      className="p-3 bg-slate-900/70 hover:bg-slate-800/90 border border-slate-800/90 hover:border-slate-700 rounded-2xl flex flex-col items-center justify-center gap-2 group transition-all"
                    >
                      <div className={`w-9 h-9 rounded-xl ${item.color} flex items-center justify-center text-xs font-bold text-white group-hover:scale-105 transition-transform overflow-hidden shadow`}>
                        <img
                          src={item.icon}
                          alt={item.title}
                          className="w-5 h-5 object-contain"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = 'none';
                          }}
                        />
                      </div>
                      <span className="text-[11px] text-slate-300 group-hover:text-white truncate max-w-full font-medium">
                        {item.title}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : isGoogleSearch ? (
            /* 3. Google Search Results View */
            <div className="flex-1 flex flex-col text-slate-200 overflow-y-auto select-text">
              {/* Google Results Header Bar */}
              <div className="p-4 border-b border-slate-800 bg-slate-900/70 space-y-3 sticky top-0 z-20 backdrop-blur-md">
                <div className="flex items-center gap-3 max-w-4xl mx-auto w-full">
                  {/* Google Mini Logo */}
                  <button
                    onClick={() => handleNavigate('https://www.google.com')}
                    className="font-black text-xl tracking-tight select-none flex-shrink-0"
                    title="Google Home"
                  >
                    <span className="text-[#4285F4]">G</span>
                    <span className="text-[#EA4335]">o</span>
                    <span className="text-[#FBBC05]">o</span>
                    <span className="text-[#4285F4]">g</span>
                    <span className="text-[#34A853]">l</span>
                    <span className="text-[#EA4335]">e</span>
                  </button>

                  {/* Search Input */}
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      const val = (document.getElementById('google-results-search-input') as HTMLInputElement)?.value;
                      if (val) handleGoogleHomeSearch(val);
                    }}
                    className="flex-1 flex items-center bg-slate-950 border border-slate-700/80 rounded-full px-3.5 py-1.5 focus-within:border-blue-500 shadow-inner"
                  >
                    <input
                      id="google-results-search-input"
                      type="text"
                      defaultValue={searchQueryString}
                      key={searchQueryString}
                      className="flex-1 bg-transparent border-none outline-none text-xs sm:text-sm text-slate-100 select-text"
                    />
                    <button type="submit" className="text-blue-400 hover:text-blue-300 ml-2">
                      <Search className="w-4 h-4" />
                    </button>
                  </form>
                </div>

                {/* Filter Tabs */}
                <div className="flex items-center gap-1 sm:gap-2 max-w-4xl mx-auto w-full overflow-x-auto text-xs">
                  <button
                    onClick={() => setSearchFilter('all')}
                    className={`px-3 py-1 rounded-full font-medium transition-colors flex items-center gap-1.5 ${
                      searchFilter === 'all'
                        ? 'bg-blue-600 text-white'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                    }`}
                  >
                    <Search className="w-3.5 h-3.5" />
                    <span>All</span>
                  </button>
                  <button
                    onClick={() => setSearchFilter('images')}
                    className={`px-3 py-1 rounded-full font-medium transition-colors flex items-center gap-1.5 ${
                      searchFilter === 'images'
                        ? 'bg-blue-600 text-white'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                    }`}
                  >
                    <ImageIcon className="w-3.5 h-3.5" />
                    <span>Images</span>
                  </button>
                  <button
                    onClick={() => setSearchFilter('news')}
                    className={`px-3 py-1 rounded-full font-medium transition-colors flex items-center gap-1.5 ${
                      searchFilter === 'news'
                        ? 'bg-blue-600 text-white'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                    }`}
                  >
                    <Newspaper className="w-3.5 h-3.5" />
                    <span>News</span>
                  </button>
                  <button
                    onClick={() => setSearchFilter('videos')}
                    className={`px-3 py-1 rounded-full font-medium transition-colors flex items-center gap-1.5 ${
                      searchFilter === 'videos'
                        ? 'bg-blue-600 text-white'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                    }`}
                  >
                    <Video className="w-3.5 h-3.5" />
                    <span>Videos</span>
                  </button>
                  <button
                    onClick={() => setSearchFilter('maps')}
                    className={`px-3 py-1 rounded-full font-medium transition-colors flex items-center gap-1.5 ${
                      searchFilter === 'maps'
                        ? 'bg-blue-600 text-white'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                    }`}
                  >
                    <MapPin className="w-3.5 h-3.5" />
                    <span>Maps</span>
                  </button>
                </div>
              </div>

              {/* Search Results Main Body */}
              <div className="p-4 sm:p-6 max-w-4xl mx-auto w-full space-y-6">
                {isSearchLoading ? (
                  <div className="py-12 flex flex-col items-center justify-center space-y-3 text-slate-400">
                    <div className="w-8 h-8 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
                    <p className="text-xs">Fetching live Google search results for "{searchQueryString}"...</p>
                  </div>
                ) : searchData ? (
                  <>
                    {/* Stats Header */}
                    <div className="text-[11px] text-slate-500 font-mono">
                      About {(searchData.results.length * 142000).toLocaleString()} results (0.18 seconds) for <span className="text-slate-300 font-bold">"{searchData.query}"</span>
                    </div>

                    {/* Instant Answer / Knowledge Graph Panel (if available) */}
                    {searchData.abstract && (
                      <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-2xl shadow-xl flex flex-col sm:flex-row gap-4 items-start">
                        {searchData.image && (
                          <img
                            src={searchData.image}
                            alt="Preview"
                            className="w-24 h-24 sm:w-28 sm:h-28 object-cover rounded-xl border border-slate-800 flex-shrink-0 bg-slate-950"
                            onError={(e) => {
                              (e.target as HTMLElement).style.display = 'none';
                            }}
                          />
                        )}
                        <div className="space-y-1.5 flex-1">
                          <div className="flex items-center gap-2 text-xs text-blue-400 font-semibold">
                            <Sparkles className="w-3.5 h-3.5" />
                            <span>Instant Overview ({searchData.abstractSource || 'Overview'})</span>
                          </div>
                          <p className="text-xs sm:text-sm text-slate-200 leading-relaxed select-text">
                            {searchData.abstract}
                          </p>
                          {searchData.abstractUrl && (
                            <div className="pt-2">
                              <button
                                onClick={() => handleNavigate(searchData.abstractUrl)}
                                className="text-xs text-blue-400 hover:text-blue-300 hover:underline flex items-center gap-1 font-medium"
                              >
                                <span>Read full article on {searchData.abstractSource || 'Web'}</span>
                                <ChevronRight className="w-3 h-3" />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Tab View: Images Filter */}
                    {searchFilter === 'images' && (
                      <div className="space-y-3">
                        <h3 className="text-xs font-bold text-slate-300">Images for "{searchQueryString}"</h3>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                          {searchData.results.slice(0, 9).map((res, idx) => (
                            <div
                              key={idx}
                              onClick={() => handleNavigate(res.url)}
                              className="p-2 bg-slate-900 border border-slate-800 rounded-xl hover:border-slate-700 cursor-pointer space-y-1.5 group"
                            >
                              <div className="h-28 bg-slate-950 rounded-lg flex items-center justify-center text-slate-600 group-hover:text-blue-400 transition-colors">
                                <ImageIcon className="w-8 h-8 opacity-60" />
                              </div>
                              <p className="text-[11px] text-slate-300 font-medium truncate group-hover:text-blue-400">
                                {res.title}
                              </p>
                              <span className="text-[10px] text-slate-500 font-mono truncate block">
                                {res.domain}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Tab View: Maps Filter */}
                    {searchFilter === 'maps' && (
                      <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl space-y-3">
                        <div className="flex items-center justify-between">
                          <h3 className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                            <MapPin className="w-4 h-4 text-emerald-400" />
                            <span>Interactive Map for "{searchQueryString}"</span>
                          </h3>
                          <a
                            href={`https://www.openstreetmap.org/search?query=${encodeURIComponent(searchQueryString)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-blue-400 hover:underline flex items-center gap-1"
                          >
                            <span>Open in Full Map</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                        <div className="h-64 rounded-xl overflow-hidden border border-slate-800 bg-slate-950">
                          <iframe
                            src={`https://www.openstreetmap.org/export/embed.html?bbox=-180,-85,180,85&layer=mapnik&marker=0,0`}
                            title="Map View"
                            className="w-full h-full border-0"
                          />
                        </div>
                      </div>
                    )}

                    {/* Standard Search Results List (All, News, Videos) */}
                    {(searchFilter === 'all' || searchFilter === 'news' || searchFilter === 'videos') && (
                      <div className="space-y-5">
                        {searchData.results.map((item, index) => (
                          <div
                            key={index}
                            className="p-3.5 rounded-2xl bg-slate-900/40 hover:bg-slate-900/90 border border-slate-800/60 hover:border-slate-700/90 transition-all space-y-1.5"
                          >
                            {/* Breadcrumb URL */}
                            <div className="flex items-center gap-2 text-[11px] text-slate-400">
                              <Globe className="w-3.5 h-3.5 text-slate-500" />
                              <span className="text-slate-400 font-mono truncate max-w-sm">
                                {item.domain} {item.url !== item.domain ? `› ${item.url.slice(0, 45)}...` : ''}
                              </span>
                            </div>

                            {/* Clickable Title */}
                            <h3
                              onClick={() => handleNavigate(item.url)}
                              className="text-sm sm:text-base font-semibold text-blue-400 hover:text-blue-300 hover:underline cursor-pointer leading-tight select-text"
                            >
                              {item.title}
                            </h3>

                            {/* Snippet text */}
                            <p className="text-xs text-slate-300 leading-relaxed select-text">
                              {item.snippet}
                            </p>

                            {/* Action Bar */}
                            <div className="pt-2 flex items-center gap-3 text-[11px]">
                              <button
                                onClick={() => handleNavigate(item.url)}
                                className="px-2.5 py-1 bg-slate-800 hover:bg-blue-600 hover:text-white text-slate-300 rounded-lg transition-colors font-medium"
                              >
                                Open in Browser
                              </button>
                              <a
                                href={item.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-slate-400 hover:text-slate-200 flex items-center gap-1 transition-colors"
                              >
                                <span>Open New Tab</span>
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Related Searches / People Also Ask */}
                    {searchData.related && searchData.related.length > 0 && (
                      <div className="pt-4 border-t border-slate-800 space-y-3">
                        <h4 className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
                          <TrendingUp className="w-3.5 h-3.5 text-blue-400" />
                          <span>Related searches</span>
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {searchData.related.map((rel, idx) => (
                            <button
                              key={idx}
                              onClick={() => handleGoogleHomeSearch(rel)}
                              className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-xs text-slate-300 hover:text-white rounded-xl transition-all flex items-center gap-1.5"
                            >
                              <Search className="w-3 h-3 text-slate-500" />
                              <span>{rel}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="py-12 text-center text-slate-400 text-xs">
                    No results found. Try searching another topic or check spelling.
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* 4. External Websites in Sandboxed / Proxy Frame */
            <div className="w-full h-full flex flex-col relative bg-slate-950">
              <iframe
                key={frameKey}
                ref={iframeRef}
                src={getIframeSrc()}
                title={appTitle || 'Web Application'}
                className="w-full h-full border-0 bg-white"
                sandbox="allow-same-origin allow-scripts allow-popups allow-forms allow-presentation"
                onLoad={() => setIsLoading(false)}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
