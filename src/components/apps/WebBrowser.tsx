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
  Sparkles
} from 'lucide-react';

interface WebBrowserProps {
  initialUrl?: string;
  appTitle?: string;
  filePath?: string;
}

export const WebBrowser: React.FC<WebBrowserProps> = ({
  initialUrl = 'https://en.wikipedia.org',
  appTitle,
  filePath,
}) => {
  const { openApp } = useOS();
  const [isLocalFile, setIsLocalFile] = useState<boolean>(!!filePath);
  const [activeFilePath, setActiveFilePath] = useState<string | undefined>(filePath);
  const [localHtmlContent, setLocalHtmlContent] = useState<string>('');
  
  const startingUrl = filePath ? `file://${filePath}` : initialUrl;
  const [currentUrl, setCurrentUrl] = useState(startingUrl);
  const [inputUrl, setInputUrl] = useState(startingUrl);
  const [viewportMode, setViewportMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [history, setHistory] = useState<string[]>([startingUrl]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [frameKey, setFrameKey] = useState(0);
  const iframeRef = useRef<HTMLIFrameElement>(null);

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
        // Search query
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

  const handleReload = () => {
    if (isLocalFile && activeFilePath) {
      loadLocalFile(activeFilePath);
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

  return (
    <div id="browser-container" className="h-full flex flex-col bg-slate-950 text-slate-100 overflow-hidden">
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
              isLoading ? 'animate-spin text-blue-400' : ''
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
          ) : (
            <Lock className="w-3.5 h-3.5 text-emerald-400 mr-2 flex-shrink-0" />
          )}
          <input
            id="browser-address-input"
            type="text"
            value={inputUrl}
            onChange={(e) => setInputUrl(e.target.value)}
            className="flex-1 bg-transparent border-none outline-none text-xs text-slate-100 placeholder-slate-500"
            placeholder="Enter URL or file:///path..."
          />
          <button type="submit" className="text-slate-400 hover:text-white ml-1">
            <Search className="w-3.5 h-3.5" />
          </button>
        </form>

        {/* Viewport Simulation & File / External Open Controls */}
        <div className="flex items-center gap-1.5">
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

      {/* Security & Status Notice */}
      <div className="px-3 py-1 bg-slate-900/60 border-b border-slate-800 text-[11px] text-slate-300/90 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          {isLocalFile ? (
            <>
              <Sparkles className="w-3 h-3 text-amber-400" />
              <span>
                Local HTML Preview Mode: Live rendering with JS DOM execution & auto-sync from VFS.
              </span>
            </>
          ) : (
            <>
              <Shield className="w-3 h-3 text-blue-400" />
              <span>Sandboxed Runtime: If a website prohibits iframe embedding, click "New Tab" to open directly.</span>
            </>
          )}
        </div>
      </div>

      {/* Frame Container */}
      <div className="flex-1 bg-slate-900 flex items-center justify-center overflow-hidden relative">
        <div className={`h-full mx-auto transition-all duration-300 bg-white ${getViewportWidthClass()}`}>
          {isLocalFile ? (
            <iframe
              key={frameKey}
              ref={iframeRef}
              srcDoc={localHtmlContent}
              title={appTitle || activeFilePath || 'HTML Document Preview'}
              className="w-full h-full border-0"
              sandbox="allow-same-origin allow-scripts allow-popups allow-forms allow-modals"
              onLoad={() => setIsLoading(false)}
            />
          ) : (
            <iframe
              key={frameKey}
              ref={iframeRef}
              src={currentUrl}
              title={appTitle || 'Web Application'}
              className="w-full h-full border-0"
              sandbox="allow-same-origin allow-scripts allow-popups allow-forms allow-presentation"
              onLoad={() => setIsLoading(false)}
            />
          )}
        </div>
      </div>
    </div>
  );
};
