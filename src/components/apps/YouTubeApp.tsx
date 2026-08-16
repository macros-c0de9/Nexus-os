import React, { useState, useEffect, useRef } from 'react';
import { useOS } from '../../context/OSContext';
import {
  Youtube,
  Search,
  Play,
  Clock,
  Bookmark,
  Share2,
  ExternalLink,
  Copy,
  Check,
  Plus,
  X,
  Trash2,
  Flame,
  Music,
  Code2,
  Sparkles,
  Gamepad2,
  Film,
  Compass,
  Eye,
  Maximize2,
  Info,
  Loader2,
  RefreshCw,
  SlidersHorizontal,
  History,
  TrendingUp,
  Radio,
  Tv,
  Atom,
  GraduationCap,
  Headphones,
  Link2,
  ClipboardPaste,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';

export interface YouTubeVideo {
  id: string;
  title: string;
  channel: string;
  category?: 'trending' | 'music' | 'tech' | 'science' | 'gaming' | 'relaxation' | 'education' | 'general';
  duration: string;
  views: string;
  published: string;
  description?: string;
  thumbnail?: string;
  embedUrl?: string;
}

export interface VideoTab {
  id: string;
  title: string;
  type: 'search' | 'video' | 'library';
  video?: YouTubeVideo;
  searchQuery?: string;
}

// Curated starter catalog
const FEATURED_VIDEOS: YouTubeVideo[] = [
  {
    id: 'dQw4w9WgXcQ',
    title: 'Rick Astley - Never Gonna Give You Up (Official Music Video)',
    channel: 'Rick Astley',
    category: 'music',
    duration: '3:33',
    views: '1.5B views',
    published: '14 years ago',
    description: 'The legendary music video remastered in high definition.',
  },
  {
    id: 'jfKfPfyJRdk',
    title: 'lofi hip hop radio 📚 - beats to relax/study to',
    channel: 'Lofi Girl',
    category: 'relaxation',
    duration: 'LIVE',
    views: '78K watching',
    published: 'Started streaming',
    description: 'Chill and study beats 24/7 stream with peaceful vibes.',
  },
  {
    id: 'SqcY0GlETPk',
    title: 'React in 100 Seconds',
    channel: 'Fireship',
    category: 'tech',
    duration: '2:24',
    views: '2.1M views',
    published: '3 years ago',
    description: 'Learn the fundamentals of React and virtual DOM in under 2 minutes.',
  },
  {
    id: 'bMknfKXIFA8',
    title: "React Course - Beginner's Tutorial for React JavaScript Library",
    channel: 'freeCodeCamp.org',
    category: 'tech',
    duration: '11:55:28',
    views: '4.8M views',
    published: '2 years ago',
    description: 'Comprehensive full React developer course building real web apps.',
  },
  {
    id: 'ujO_6vF_y6U',
    title: 'Web Development in 2026 - A Complete Practical Guide',
    channel: 'Traversy Media',
    category: 'tech',
    duration: '1:12:40',
    views: '890K views',
    published: '1 year ago',
    description: 'Modern developer roadmap exploring frontend, backend, AI, and tooling.',
  },
  {
    id: 'unb4hU1cT2w',
    title: 'Earth from Space - 4K Ultra HD Relaxing Space Video with Ambient Music',
    channel: 'Space Cinema',
    category: 'relaxation',
    duration: '3:00:00',
    views: '18M views',
    published: '4 years ago',
    description: 'Breathtaking footage of planet Earth captured from the International Space Station.',
  },
  {
    id: 'yPyZ_3rI_2s',
    title: 'Grand Theft Auto VI Trailer 1 (Official)',
    channel: 'Rockstar Games',
    category: 'gaming',
    duration: '1:31',
    views: '210M views',
    published: '1 year ago',
    description: 'Official first look at Vice City and the next generation of open world gaming.',
  },
  {
    id: '36YnV9STBqc',
    title: 'How Quantum Computers Work - in Simple Terms',
    channel: 'Kurzgesagt – In a Nutshell',
    category: 'science',
    duration: '7:46',
    views: '14M views',
    published: '8 years ago',
    description: 'Fascinating illustrated explanation of qubits, superposition, and quantum entanglement.',
  },
  {
    id: '0e3GPea1Tyg',
    title: '$456,000 Squid Game In Real Life!',
    channel: 'MrBeast',
    category: 'trending',
    duration: '25:41',
    views: '650M views',
    published: '3 years ago',
    description: 'Recreation of every single game with 456 real participants.',
  },
  {
    id: 'kJQP7kiw5Fk',
    title: 'Luis Fonsi - Despacito ft. Daddy Yankee',
    channel: 'Luis Fonsi',
    category: 'music',
    duration: '4:42',
    views: '8.4B views',
    published: '7 years ago',
    description: 'Record-breaking international Latin pop anthem.',
  }
];

const SEARCH_TOPIC_CATEGORIES = [
  { id: 'all', label: 'All Videos', icon: Compass, color: 'text-red-400 bg-red-500/10 border-red-500/20' },
  { id: 'music', label: 'Music & Beats', icon: Music, color: 'text-pink-400 bg-pink-500/10 border-pink-500/20' },
  { id: 'tech', label: 'Coding & Tech', icon: Code2, color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20' },
  { id: 'gaming', label: 'Gaming', icon: Gamepad2, color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
  { id: 'science', label: 'Science & Cosmos', icon: Atom, color: 'text-purple-400 bg-purple-500/10 border-purple-500/20' },
  { id: 'relaxation', label: 'Lofi & Ambient', icon: Headphones, color: 'text-amber-400 bg-amber-500/10 border-amber-500/20' },
];

const TRENDING_SUGGESTIONS = [
  { text: 'React 19 & Next.js 15 Tutorial', category: 'tech' },
  { text: 'Lofi hip hop radio beats to relax', category: 'relaxation' },
  { text: 'Python for Beginners Full Course', category: 'tech' },
  { text: 'GTA 6 Gameplay Trailer', category: 'gaming' },
  { text: 'Space 4K ISS Relaxing Ambient', category: 'science' },
  { text: 'Hans Zimmer Live Concert', category: 'music' },
  { text: 'Kurzgesagt Quantum Computers', category: 'science' },
  { text: 'Top 10 Web Dev Frameworks 2026', category: 'tech' },
];

export function extractYouTubeId(input: string): string | null {
  if (!input) return null;
  const trimmed = input.trim();
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) {
    return trimmed;
  }
  const patterns = [
    /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/|youtube\.com\/shorts\/)([^"&?\/\s]{11})/i,
    /^[a-zA-Z0-9_-]{11}$/
  ];
  for (const regex of patterns) {
    const match = trimmed.match(regex);
    if (match && match[1]) {
      return match[1];
    }
  }
  return null;
}

export const YouTubeApp: React.FC = () => {
  const { addNotification } = useOS();

  // Tabs state - default starts with Search & Explore tab
  const [tabs, setTabs] = useState<VideoTab[]>([
    {
      id: 'tab-search',
      title: 'Search & Explore',
      type: 'search',
      searchQuery: '',
    }
  ]);
  const [activeTabId, setActiveTabId] = useState<string>('tab-search');

  // Search Engine State
  const [searchInput, setSearchInput] = useState('');
  const [searchResults, setSearchResults] = useState<YouTubeVideo[]>(FEATURED_VIDEOS);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [lastSearchedQuery, setLastSearchedQuery] = useState('');
  const [isSearchPopupOpen, setIsSearchPopupOpen] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Search History State
  const [recentSearches, setRecentSearches] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('auraos_yt_recent_searches');
      return saved ? JSON.parse(saved) : ['React tutorial', 'Lofi beats', 'GTA 6 trailer', 'Space 4K'];
    } catch {
      return ['React tutorial', 'Lofi beats', 'GTA 6 trailer', 'Space 4K'];
    }
  });

  // Saved Bookmarks
  const [savedPlaylist, setSavedPlaylist] = useState<YouTubeVideo[]>(() => {
    try {
      const saved = localStorage.getItem('auraos_youtube_saved');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Copied embed states
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Save recent searches to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('auraos_yt_recent_searches', JSON.stringify(recentSearches));
    } catch {}
  }, [recentSearches]);

  useEffect(() => {
    try {
      localStorage.setItem('auraos_youtube_saved', JSON.stringify(savedPlaylist));
    } catch {}
  }, [savedPlaylist]);

  // Click outside to close search popup
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setIsSearchPopupOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Perform Live YouTube API Search
  const executeSearch = async (query: string) => {
    const trimmed = query.trim();
    setIsSearchPopupOpen(false);

    if (!trimmed) {
      setSearchResults(FEATURED_VIDEOS);
      setLastSearchedQuery('');
      return;
    }

    // Add to recent searches
    setRecentSearches((prev) => [trimmed, ...prev.filter((s) => s.toLowerCase() !== trimmed.toLowerCase())].slice(0, 10));

    // Check if input is a direct YouTube URL or 11-char Video ID
    const extractedId = extractYouTubeId(trimmed);
    if (extractedId) {
      const directVideo: YouTubeVideo = {
        id: extractedId,
        title: `YouTube Video (${extractedId})`,
        channel: 'YouTube Creator',
        duration: 'HD',
        views: 'Direct Link',
        published: 'Imported',
        description: `Direct imported YouTube video for link: ${trimmed}`,
        thumbnail: `https://img.youtube.com/vi/${extractedId}/hqdefault.jpg`,
        embedUrl: `https://www.youtube.com/embed/${extractedId}`,
      };

      setSearchResults([directVideo, ...FEATURED_VIDEOS]);
      setLastSearchedQuery(trimmed);
      // Immediately open in a new clean embed tab
      openVideoInNewTab(directVideo);
      addNotification('Video Imported', `Opened embed for video ID: ${extractedId}`, 'success');
      return;
    }

    setIsSearching(true);
    setLastSearchedQuery(trimmed);

    try {
      const response = await fetch(`/api/youtube/search?q=${encodeURIComponent(trimmed)}`);
      if (response.ok) {
        const data = await response.json();
        if (data.results && data.results.length > 0) {
          setSearchResults(data.results);
        } else {
          // Fallback keyword match in local catalog
          const localMatches = FEATURED_VIDEOS.filter((v) =>
            v.title.toLowerCase().includes(trimmed.toLowerCase()) ||
            v.channel.toLowerCase().includes(trimmed.toLowerCase())
          );
          setSearchResults(localMatches.length > 0 ? localMatches : FEATURED_VIDEOS);
        }
      } else {
        throw new Error('Search failed');
      }
    } catch (err) {
      console.warn('YouTube search API error:', err);
      const localMatches = FEATURED_VIDEOS.filter((v) =>
        v.title.toLowerCase().includes(trimmed.toLowerCase()) ||
        v.channel.toLowerCase().includes(trimmed.toLowerCase())
      );
      setSearchResults(localMatches.length > 0 ? localMatches : FEATURED_VIDEOS);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    executeSearch(searchInput);
  };

  // OPEN VIDEO IN NEW TAB: Renders the pure embed link only!
  const openVideoInNewTab = (video: YouTubeVideo) => {
    const newTabId = `tab-embed-${video.id}-${Date.now()}`;
    const newTab: VideoTab = {
      id: newTabId,
      title: video.title,
      type: 'video',
      video: video,
    };
    setTabs((prev) => [...prev, newTab]);
    setActiveTabId(newTabId);
    addNotification('Video Tab Opened', `Playing in new embed tab: ${video.title.slice(0, 30)}...`, 'info');
  };

  // Close Tab handler
  const handleCloseTab = (tabId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (tabs.length <= 1) return;

    const index = tabs.findIndex((t) => t.id === tabId);
    const newTabs = tabs.filter((t) => t.id !== tabId);
    setTabs(newTabs);

    if (activeTabId === tabId) {
      const nextTab = newTabs[Math.max(0, index - 1)];
      setActiveTabId(nextTab.id);
    }
  };

  const handleNewSearchTab = () => {
    const newTabId = `tab-search-${Date.now()}`;
    const newTab: VideoTab = {
      id: newTabId,
      title: 'Search & Explore',
      type: 'search',
    };
    setTabs((prev) => [...prev, newTab]);
    setActiveTabId(newTabId);
  };

  const handleOpenLibraryTab = () => {
    const existing = tabs.find((t) => t.type === 'library');
    if (existing) {
      setActiveTabId(existing.id);
    } else {
      const newTabId = `tab-library-${Date.now()}`;
      const newTab: VideoTab = {
        id: newTabId,
        title: `Library (${savedPlaylist.length})`,
        type: 'library',
      };
      setTabs((prev) => [...prev, newTab]);
      setActiveTabId(newTabId);
    }
  };

  const toggleSaveVideo = (video: YouTubeVideo, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const exists = savedPlaylist.some((v) => v.id === video.id);
    if (exists) {
      setSavedPlaylist(savedPlaylist.filter((v) => v.id !== video.id));
      addNotification('Removed Bookmark', `Removed "${video.title}"`, 'info');
    } else {
      setSavedPlaylist([video, ...savedPlaylist]);
      addNotification('Video Saved', `Saved "${video.title}" to library`, 'success');
    }
  };

  const copyEmbedLink = (video: YouTubeVideo, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const link = `https://www.youtube.com/embed/${video.id}`;
    navigator.clipboard.writeText(link);
    setCopiedId(video.id);
    setTimeout(() => setCopiedId(null), 2000);
    addNotification('Embed Link Copied', link, 'success');
  };

  const handlePasteClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setSearchInput(text);
        executeSearch(text);
      }
    } catch {
      addNotification('Clipboard Notice', 'Please paste the YouTube URL into the search field.', 'info');
    }
  };

  const currentOrigin = typeof window !== 'undefined' ? window.location.origin : 'https://auraos.local';

  // Active tab finder
  const activeTab = tabs.find((t) => t.id === activeTabId) || tabs[0];

  // Filter category results
  const displayResults = searchResults.filter((v) => {
    if (selectedCategory === 'all') return true;
    return v.category === selectedCategory;
  });

  return (
    <div id="youtube-studio-app" className="h-full flex flex-col bg-slate-950 text-slate-100 select-text overflow-hidden font-sans">
      {/* 1. Window Tab Bar with Clean Tab Switching */}
      <div className="bg-slate-900/95 border-b border-slate-800 px-2 pt-2 flex items-center gap-1.5 overflow-x-auto no-scrollbar flex-shrink-0">
        {/* App Branding Icon */}
        <div className="flex items-center gap-2 px-2 py-1 mr-1 flex-shrink-0">
          <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-red-700 to-red-500 flex items-center justify-center text-white shadow-md shadow-red-950/60">
            <Youtube className="w-3.5 h-3.5 fill-white" />
          </div>
          <span className="text-xs font-black tracking-tight text-white hidden sm:inline">AuraTube</span>
        </div>

        {/* Dynamic Tabs */}
        {tabs.map((tab) => {
          const isActive = tab.id === activeTabId;
          const isSearch = tab.type === 'search';
          const isLib = tab.type === 'library';
          const isVideo = tab.type === 'video';

          return (
            <div
              key={tab.id}
              onClick={() => setActiveTabId(tab.id)}
              className={`group relative flex items-center gap-2 px-3 py-1.5 rounded-t-xl border-t border-x cursor-pointer max-w-[240px] transition-all text-xs select-none ${
                isActive
                  ? 'bg-slate-950 border-slate-700/90 text-white font-bold shadow-sm'
                  : 'bg-slate-900/90 border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              {isSearch && <Compass className="w-3.5 h-3.5 text-red-400 flex-shrink-0" />}
              {isLib && <Bookmark className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />}
              {isVideo && (
                <div className="w-4 h-3 bg-red-600 rounded-sm flex items-center justify-center flex-shrink-0">
                  <Play className="w-2.5 h-2.5 fill-white" />
                </div>
              )}

              <span className="truncate flex-1">{tab.title}</span>

              {tabs.length > 1 && (
                <button
                  onClick={(e) => handleCloseTab(tab.id, e)}
                  className="p-0.5 rounded-md hover:bg-slate-800 text-slate-400 hover:text-white opacity-60 group-hover:opacity-100 transition-opacity"
                  title="Close tab"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          );
        })}

        {/* New Search Tab Button */}
        <button
          onClick={handleNewSearchTab}
          className="p-1.5 rounded-lg bg-slate-800/70 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors flex-shrink-0"
          title="Open new search tab"
        >
          <Plus className="w-3.5 h-3.5" />
        </button>

        <div className="ml-auto flex items-center gap-1.5 pb-1 flex-shrink-0">
          <button
            onClick={handleOpenLibraryTab}
            className="px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-white text-xs font-medium flex items-center gap-1.5 transition-colors border border-slate-700/50"
          >
            <Bookmark className="w-3 h-3 text-amber-400" />
            <span className="hidden md:inline">Bookmarks</span>
            <span className="text-[10px] bg-slate-700 px-1 rounded-full">{savedPlaylist.length}</span>
          </button>
        </div>
      </div>

      {/* 2. ENHANCED SEARCH BAR & POPUP WINDOW CONTAINER */}
      <header className="p-2.5 bg-slate-900/90 border-b border-slate-800/80 flex items-center justify-between gap-3 flex-shrink-0 relative z-40">
        <div ref={searchContainerRef} className="flex-1 max-w-3xl relative">
          <form
            onSubmit={handleSearchSubmit}
            className="flex items-center bg-slate-950 border border-slate-800 hover:border-slate-700 focus-within:border-red-500 rounded-xl px-3 py-1.5 shadow-inner transition-all"
          >
            <div className="p-1 bg-red-600/10 rounded-lg mr-2 flex-shrink-0">
              <Search className="w-3.5 h-3.5 text-red-500" />
            </div>

            <input
              id="youtube-search-main-input"
              type="text"
              value={searchInput}
              onFocus={() => setIsSearchPopupOpen(true)}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search any YouTube video, topic, paste video URL or 11-char ID..."
              className="flex-1 bg-transparent border-none outline-none text-xs text-slate-100 placeholder-slate-500 select-text"
            />

            {/* Quick Paste Clipboard Button */}
            <button
              type="button"
              onClick={handlePasteClipboard}
              className="p-1 text-slate-500 hover:text-slate-300 mr-1 rounded hover:bg-slate-900 transition-colors"
              title="Paste YouTube link from clipboard"
            >
              <ClipboardPaste className="w-3.5 h-3.5" />
            </button>

            {searchInput && (
              <button
                type="button"
                onClick={() => setSearchInput('')}
                className="p-1 text-slate-500 hover:text-slate-300 mr-1"
                title="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}

            <button
              type="submit"
              disabled={isSearching}
              className="px-3.5 py-1 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 disabled:opacity-50 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all shadow-md shadow-red-950/50"
            >
              {isSearching ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Searching...</span>
                </>
              ) : (
                <>
                  <Play className="w-3 h-3 fill-white" />
                  <span>Search</span>
                </>
              )}
            </button>
          </form>

          {/* ENHANCED SEARCH POPUP WINDOW */}
          {isSearchPopupOpen && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl shadow-black/80 overflow-hidden p-3.5 space-y-4 backdrop-blur-xl z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              {/* Category Quick Badges */}
              <div>
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Flame className="w-3.5 h-3.5 text-amber-500" />
                  <span>Explore Topics</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {SEARCH_TOPIC_CATEGORIES.map((cat) => {
                    const Icon = cat.icon;
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => {
                          setSelectedCategory(cat.id);
                          if (cat.id !== 'all') {
                            setSearchInput(cat.label);
                            executeSearch(cat.label);
                          } else {
                            executeSearch('');
                          }
                        }}
                        className={`flex items-center gap-2 p-2 rounded-xl border text-xs font-semibold transition-all text-left ${cat.color} hover:scale-[1.02] active:scale-[0.98]`}
                      >
                        <div className="p-1 rounded-lg bg-black/20">
                          <Icon className="w-3.5 h-3.5" />
                        </div>
                        <span className="truncate">{cat.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Trending Instant Suggestions */}
              <div>
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <TrendingUp className="w-3.5 h-3.5 text-red-400" />
                  <span>Trending Searches</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {TRENDING_SUGGESTIONS.map((item, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setSearchInput(item.text);
                        executeSearch(item.text);
                      }}
                      className="px-2.5 py-1 bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white rounded-full text-xs flex items-center gap-1.5 transition-colors"
                    >
                      <Search className="w-3 h-3 text-slate-500" />
                      <span>{item.text}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Recent Searches */}
              {recentSearches.length > 0 && (
                <div className="pt-2 border-t border-slate-800/80">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                      <History className="w-3.5 h-3.5 text-blue-400" />
                      <span>Recent Searches</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => setRecentSearches([])}
                      className="text-[10px] text-slate-500 hover:text-rose-400 font-medium"
                    >
                      Clear
                    </button>
                  </div>
                  <div className="space-y-1">
                    {recentSearches.slice(0, 4).map((query, idx) => (
                      <div
                        key={idx}
                        onClick={() => {
                          setSearchInput(query);
                          executeSearch(query);
                        }}
                        className="flex items-center justify-between px-2.5 py-1.5 rounded-lg hover:bg-slate-950 text-xs text-slate-300 hover:text-white cursor-pointer group"
                      >
                        <div className="flex items-center gap-2">
                          <History className="w-3 h-3 text-slate-500 group-hover:text-red-400" />
                          <span>{query}</span>
                        </div>
                        <span className="text-[10px] text-slate-600 group-hover:text-slate-400">Search</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Global info tip */}
        <div className="hidden lg:flex items-center gap-1.5 text-xs text-slate-400 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
          <span className="text-[11px]">Clicking any video opens in a new pure embed tab</span>
        </div>
      </header>

      {/* 3. MAIN ROUTER: VIEWPORTS */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* VIEW 1: Search & Explore Grid View */}
        {activeTab.type === 'search' && (
          <div className="flex-1 flex flex-col overflow-y-auto bg-slate-950 p-4 space-y-4">
            {/* Horizontal Filter Category Pills */}
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-2.5">
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                {SEARCH_TOPIC_CATEGORIES.map((c) => {
                  const Icon = c.icon;
                  const isSelected = selectedCategory === c.id;
                  return (
                    <button
                      key={c.id}
                      onClick={() => setSelectedCategory(c.id)}
                      className={`px-3 py-1 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all whitespace-nowrap ${
                        isSelected
                          ? 'bg-red-600 text-white shadow-md shadow-red-950/50'
                          : 'bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span>{c.label}</span>
                    </button>
                  );
                })}
              </div>

              <span className="text-xs font-medium text-slate-400 hidden sm:inline">
                {displayResults.length} videos found
              </span>
            </div>

            {/* Results Title Banner */}
            {lastSearchedQuery && (
              <div className="flex items-center justify-between bg-slate-900/60 border border-slate-800/80 rounded-xl px-3 py-2">
                <span className="text-xs font-semibold text-slate-300">
                  Search results for: <span className="text-red-400 font-bold">"{lastSearchedQuery}"</span>
                </span>
                <button
                  onClick={() => {
                    setSearchInput('');
                    executeSearch('');
                  }}
                  className="text-[11px] text-slate-400 hover:text-white flex items-center gap-1"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Reset</span>
                </button>
              </div>
            )}

            {/* Video Cards Grid */}
            {isSearching ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 py-6">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                  <div key={i} className="bg-slate-900/60 border border-slate-800 rounded-2xl p-3 space-y-3 animate-pulse">
                    <div className="w-full aspect-video bg-slate-800 rounded-xl" />
                    <div className="h-3 bg-slate-800 rounded w-3/4" />
                    <div className="h-2 bg-slate-800/60 rounded w-1/2" />
                  </div>
                ))}
              </div>
            ) : displayResults.length === 0 ? (
              <div className="text-center py-20 space-y-3">
                <Search className="w-12 h-12 text-slate-700 mx-auto" />
                <p className="text-slate-300 text-sm font-semibold">No YouTube videos found matching "{lastSearchedQuery}".</p>
                <p className="text-slate-500 text-xs">Try searching another keyword or paste any direct YouTube link.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 pb-6">
                {displayResults.map((video) => {
                  const thumb = video.thumbnail || `https://img.youtube.com/vi/${video.id}/hqdefault.jpg`;
                  const isSaved = savedPlaylist.some((v) => v.id === video.id);

                  return (
                    <div
                      key={video.id}
                      onClick={() => openVideoInNewTab(video)}
                      className="group bg-slate-900/80 hover:bg-slate-900 border border-slate-800/90 hover:border-red-500/50 rounded-2xl p-3 flex flex-col justify-between space-y-3 cursor-pointer transition-all hover:shadow-xl hover:shadow-red-950/20 hover:-translate-y-0.5"
                    >
                      {/* Video Thumbnail Stage */}
                      <div className="relative w-full aspect-video bg-black rounded-xl overflow-hidden border border-slate-800">
                        <img
                          src={thumb}
                          alt={video.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = `https://img.youtube.com/vi/${video.id}/0.jpg`;
                          }}
                        />
                        {/* Duration Badge */}
                        <span className="absolute bottom-1.5 right-1.5 bg-black/85 text-[10px] font-mono font-bold px-1.5 py-0.5 rounded text-white border border-black/40">
                          {video.duration}
                        </span>

                        {/* Hover Overlay Play Icon */}
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <div className="w-11 h-11 rounded-full bg-red-600 text-white flex items-center justify-center shadow-xl transform group-hover:scale-110 transition-transform">
                            <Play className="w-5 h-5 fill-white ml-0.5" />
                          </div>
                        </div>
                      </div>

                      {/* Video Metadata */}
                      <div className="space-y-1.5 flex-1">
                        <h4 className="text-xs font-bold text-slate-100 group-hover:text-red-400 line-clamp-2 leading-snug">
                          {video.title}
                        </h4>
                        <p className="text-[11px] text-slate-400 font-medium truncate">{video.channel}</p>
                        <div className="flex items-center gap-2 text-[10px] text-slate-500">
                          <span>{video.views}</span>
                          {video.published && <span>• {video.published}</span>}
                        </div>
                      </div>

                      {/* Action Bar */}
                      <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between gap-1.5">
                        <div className="px-2.5 py-1 bg-red-600 group-hover:bg-red-500 text-white rounded-lg text-[11px] font-bold flex items-center gap-1 transition-colors shadow-sm">
                          <Play className="w-3 h-3 fill-white" />
                          <span>Open Embed</span>
                        </div>

                        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={(e) => copyEmbedLink(video, e)}
                            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg text-xs transition-colors"
                            title="Copy embed URL (https://www.youtube.com/embed/...)"
                          >
                            {copiedId === video.id ? (
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>

                          <button
                            onClick={(e) => toggleSaveVideo(video, e)}
                            className={`p-1.5 rounded-lg text-xs transition-colors ${
                              isSaved
                                ? 'bg-amber-600/20 text-amber-400 border border-amber-500/30'
                                : 'bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-amber-400'
                            }`}
                            title={isSaved ? 'Remove from bookmarks' : 'Save bookmark'}
                          >
                            <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-amber-400' : ''}`} />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* VIEW 2: PURE EMBED LINK TAB (Only embed link, no other clutter) */}
        {activeTab.type === 'video' && activeTab.video && (
          <div className="flex-1 flex flex-col bg-black relative w-full h-full overflow-hidden">
            {/* Top Sleek Link Indicator Header */}
            <div className="bg-slate-950/90 border-b border-slate-800/80 px-3 py-1.5 flex items-center justify-between gap-3 text-xs flex-shrink-0 z-10 backdrop-blur-md">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <span className="px-2 py-0.5 bg-red-600 text-white rounded font-mono text-[10px] font-bold uppercase flex-shrink-0">
                  Embed
                </span>
                <span className="font-semibold text-slate-200 truncate">{activeTab.video.title}</span>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                <span className="font-mono text-[11px] text-red-400 hidden sm:inline">
                  https://www.youtube.com/embed/{activeTab.video.id}
                </span>

                <button
                  onClick={() => copyEmbedLink(activeTab.video!)}
                  className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-lg text-xs font-medium flex items-center gap-1 transition-colors"
                  title="Copy embed URL"
                >
                  {copiedId === activeTab.video.id ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                  <span className="hidden sm:inline">Copy Link</span>
                </button>

                <a
                  href={`https://www.youtube.com/watch?v=${activeTab.video.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-lg text-xs font-medium flex items-center gap-1 transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">YouTube</span>
                </a>
              </div>
            </div>

            {/* PURE 100% FULL-VIEW EMBED PLAYER */}
            <div className="flex-1 w-full h-full bg-black relative">
              <iframe
                src={`https://www.youtube-nocookie.com/embed/${activeTab.video.id}?autoplay=1&controls=1&enablejsapi=1&origin=${encodeURIComponent(
                  currentOrigin
                )}&widget_referrer=${encodeURIComponent(currentOrigin)}&rel=0&modestbranding=1`}
                title={activeTab.video.title}
                className="w-full h-full border-0 absolute inset-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            </div>
          </div>
        )}

        {/* VIEW 3: Saved Bookmarks Library */}
        {activeTab.type === 'library' && (
          <div className="flex-1 flex flex-col overflow-y-auto bg-slate-950 p-4 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Bookmark className="w-4 h-4 text-amber-400" />
                <span>Saved Bookmarks ({savedPlaylist.length})</span>
              </h3>
            </div>

            {savedPlaylist.length === 0 ? (
              <div className="p-12 text-center bg-slate-900/40 border border-dashed border-slate-800 rounded-2xl space-y-2">
                <Bookmark className="w-10 h-10 text-slate-600 mx-auto" />
                <p className="text-xs text-slate-400 font-semibold">Your bookmarks library is empty.</p>
                <p className="text-[11px] text-slate-500">Click the bookmark icon on any video card to save it here.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {savedPlaylist.map((v) => (
                  <div
                    key={v.id}
                    onClick={() => openVideoInNewTab(v)}
                    className="p-3 bg-slate-900 border border-slate-800 hover:border-red-500/40 rounded-xl space-y-2 cursor-pointer transition-all hover:scale-[1.01]"
                  >
                    <img
                      src={`https://img.youtube.com/vi/${v.id}/hqdefault.jpg`}
                      alt={v.title}
                      className="w-full aspect-video object-cover rounded-lg bg-black"
                    />
                    <h4 className="text-xs font-bold text-slate-100 truncate">{v.title}</h4>
                    <p className="text-[11px] text-slate-400">{v.channel}</p>
                    <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
                      <span className="text-[11px] text-red-400 font-semibold flex items-center gap-1">
                        <Play className="w-3 h-3 fill-red-400" />
                        <span>Open Embed</span>
                      </span>
                      <button
                        onClick={(e) => toggleSaveVideo(v, e)}
                        className="text-slate-500 hover:text-rose-400 p-1"
                        title="Remove bookmark"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
