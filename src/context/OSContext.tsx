import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import {
  WindowState,
  AppDefinition,
  SnapLayoutType,
  WindowBounds,
  OSSettings,
  ContextMenuState,
  NotificationItem,
  VFSItem,
} from '../types/os';
import { SYSTEM_APPS, PRESET_WALLPAPERS } from '../data/appsRegistry';
import { vfs } from '../services/vfs';
import { devicePermissions } from '../services/devicePermissions';
import { soundService } from '../services/sound';

const SETTINGS_KEY = 'aura_os_settings_v1';
const CUSTOM_APPS_KEY = 'aura_os_custom_apps_v1';

const DEFAULT_SETTINGS: OSSettings = {
  wallpaperUrl: PRESET_WALLPAPERS[0].url,
  wallpaperFit: 'cover',
  theme: 'dark',
  accentColor: '#3b82f6',
  soundEnabled: true,
  dockPosition: 'bottom',
  taskbarAlignment: 'center',
  maxR1FileSizeMB: 20,
  deviceGesturesEnabled: true,
  desktopGridSize: 'medium',
  lockScreenEnabled: false,
};

interface OSContextType {
  // Window Management
  windows: WindowState[];
  activeWindowId: string | null;
  openApp: (appId: string, customData?: any) => string;
  closeWindow: (windowId: string) => void;
  minimizeWindow: (windowId: string) => void;
  restoreWindow: (windowId: string) => void;
  maximizeWindow: (windowId: string) => void;
  snapWindow: (windowId: string, snapType: SnapLayoutType) => void;
  focusWindow: (windowId: string) => void;
  updateWindowBounds: (windowId: string, bounds: Partial<WindowBounds>) => void;
  updateWindowTitle: (windowId: string, title: string) => void;
  isWindowMinimized: (windowId: string) => boolean;

  // Apps Registry & App Maker
  allApps: AppDefinition[];
  customApps: AppDefinition[];
  addCustomApp: (app: {
    title: string;
    url: string;
    icon: string;
    iconType: 'lucide' | 'url';
    category?: 'tools' | 'webapps' | 'utilities' | 'media' | 'development';
    description?: string;
  }) => AppDefinition;
  deleteCustomApp: (appId: string) => void;
  getAppDefinition: (appId: string) => AppDefinition | undefined;

  // Settings
  settings: OSSettings;
  updateSettings: (newSettings: Partial<OSSettings>) => void;

  // UI Shell States
  startMenuOpen: boolean;
  setStartMenuOpen: (open: boolean) => void;
  toggleStartMenu: () => void;

  systemTrayOpen: boolean;
  setSystemTrayOpen: (open: boolean) => void;
  toggleSystemTray: () => void;

  taskViewOpen: boolean;
  setTaskViewOpen: (open: boolean) => void;
  toggleTaskView: () => void;

  showDesktop: () => void;

  // Context Menu
  contextMenu: ContextMenuState;
  openContextMenu: (x: number, y: number, items: ContextMenuState['items'], targetType?: ContextMenuState['targetType'], targetData?: any) => void;
  closeContextMenu: () => void;

  // Notifications
  notifications: NotificationItem[];
  addNotification: (title: string, message: string, type?: NotificationItem['type'], actionLabel?: string, onAction?: () => void) => void;
  dismissNotification: (id: string) => void;
  clearNotifications: () => void;

  // File Operations Helper
  openFileInDefaultApp: (item: VFSItem) => void;
  openFileWithApp: (item: VFSItem, targetAppId: string) => void;
}

const OSContext = createContext<OSContextType | null>(null);

export const OSProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [windows, setWindows] = useState<WindowState[]>([]);
  const [activeWindowId, setActiveWindowId] = useState<string | null>(null);
  const [highestZIndex, setHighestZIndex] = useState<number>(100);

  const [customApps, setCustomApps] = useState<AppDefinition[]>(() => {
    try {
      const saved = localStorage.getItem(CUSTOM_APPS_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [settings, setSettings] = useState<OSSettings>(() => {
    try {
      const saved = localStorage.getItem(SETTINGS_KEY);
      return saved ? { ...DEFAULT_SETTINGS, ...JSON.parse(saved) } : DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  });

  const [startMenuOpen, setStartMenuOpen] = useState(false);
  const [systemTrayOpen, setSystemTrayOpen] = useState(false);
  const [taskViewOpen, setTaskViewOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  const [contextMenu, setContextMenu] = useState<ContextMenuState>({
    isOpen: false,
    x: 0,
    y: 0,
    items: [],
  });

  // Save custom apps
  useEffect(() => {
    try {
      localStorage.setItem(CUSTOM_APPS_KEY, JSON.stringify(customApps));
    } catch (e) {
      console.warn('Failed to save custom apps:', e);
    }
  }, [customApps]);

  // Save settings
  useEffect(() => {
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    } catch (e) {
      console.warn('Failed to save settings:', e);
    }
  }, [settings]);

  // Register service worker on mount
  useEffect(() => {
    devicePermissions.registerServiceWorker();
    
    // Add welcome notification
    addNotification(
      'Welcome to AuraOS',
      'Use App Maker to convert any website into a windowed app. Touch gestures & multi-window snapping active.',
      'info'
    );
  }, []);

  const allApps = [...SYSTEM_APPS, ...customApps];

  const getAppDefinition = useCallback(
    (appId: string): AppDefinition | undefined => {
      return allApps.find((app) => app.id === appId);
    },
    [allApps]
  );

  const focusWindow = useCallback((windowId: string) => {
    setHighestZIndex((prev) => {
      const nextZ = prev + 1;
      setWindows((curr) =>
        curr.map((w) => {
          if (w.id === windowId) {
            return { ...w, zIndex: nextZ, isMinimized: false };
          }
          return w;
        })
      );
      return nextZ;
    });
    setActiveWindowId(windowId);
    setStartMenuOpen(false);
    setSystemTrayOpen(false);
    setContextMenu((cm) => ({ ...cm, isOpen: false }));
  }, []);

  const openApp = useCallback(
    (appId: string, customData?: any): string => {
      const appDef = getAppDefinition(appId);
      if (!appDef) {
        console.warn('App definition not found:', appId);
        return '';
      }

      // Check if instance exists and multiple not allowed
      if (!appDef.canHaveMultipleInstances && !customData) {
        const existing = windows.find((w) => w.appId === appId);
        if (existing) {
          if (existing.isMinimized) {
            restoreWindow(existing.id);
          } else {
            focusWindow(existing.id);
          }
          return existing.id;
        }
      }

      const nextZ = highestZIndex + 1;
      setHighestZIndex(nextZ);

      // Cascade coordinates calculation
      const screenWidth = typeof window !== 'undefined' ? window.innerWidth : 1280;
      const screenHeight = typeof window !== 'undefined' ? window.innerHeight : 800;
      const taskbarHeight = 48;

      const baseWidth = Math.min(appDef.defaultWidth, screenWidth - 40);
      const baseHeight = Math.min(appDef.defaultHeight, screenHeight - taskbarHeight - 40);

      const offsetMultiplier = (windows.length % 6) * 28;
      let initialX = 40 + offsetMultiplier;
      let initialY = 40 + offsetMultiplier;

      // Keep within bounds
      if (initialX + baseWidth > screenWidth) initialX = 20;
      if (initialY + baseHeight > screenHeight - taskbarHeight) initialY = 20;

      // Determine initial title
      let windowTitle = appDef.title;
      if (customData?.filePath) {
        const parts = customData.filePath.split('/');
        windowTitle = `${parts[parts.length - 1]} - ${appDef.title}`;
      } else if (appDef.isCustomApp && appDef.title) {
        windowTitle = appDef.title;
      }

      const newWindowId = `win_${appId}_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`;

      const newWindow: WindowState = {
        id: newWindowId,
        appId: appDef.id,
        title: windowTitle,
        icon: appDef.icon,
        iconType: appDef.iconType,
        x: Math.max(10, initialX),
        y: Math.max(10, initialY),
        width: Math.max(340, baseWidth),
        height: Math.max(300, baseHeight),
        minWidth: 320,
        minHeight: 240,
        isMinimized: false,
        isMaximized: false,
        snapState: 'none',
        zIndex: nextZ,
        data: customData || (appDef.isCustomApp ? { url: appDef.customUrl } : undefined),
      };

      setWindows((prev) => [...prev, newWindow]);
      setActiveWindowId(newWindowId);
      setStartMenuOpen(false);
      setSystemTrayOpen(false);

      return newWindowId;
    },
    [allApps, getAppDefinition, highestZIndex, windows]
  );

  const closeWindow = useCallback((windowId: string) => {
    setWindows((prev) => {
      const filtered = prev.filter((w) => w.id !== windowId);
      if (filtered.length > 0) {
        // Focus the top-most remaining window
        const sorted = [...filtered].sort((a, b) => b.zIndex - a.zIndex);
        setActiveWindowId(sorted[0].id);
      } else {
        setActiveWindowId(null);
      }
      return filtered;
    });
  }, []);

  const minimizeWindow = useCallback((windowId: string) => {
    setWindows((prev) =>
      prev.map((w) => (w.id === windowId ? { ...w, isMinimized: true } : w))
    );
    setActiveWindowId((current) => {
      if (current === windowId) {
        const visible = windows.filter((w) => w.id !== windowId && !w.isMinimized);
        if (visible.length > 0) {
          const sorted = [...visible].sort((a, b) => b.zIndex - a.zIndex);
          return sorted[0].id;
        }
        return null;
      }
      return current;
    });
  }, [windows]);

  const restoreWindow = useCallback((windowId: string) => {
    focusWindow(windowId);
  }, [focusWindow]);

  const maximizeWindow = useCallback((windowId: string) => {
    setWindows((prev) =>
      prev.map((w) => {
        if (w.id === windowId) {
          if (w.isMaximized) {
            // Restore to previous bounds
            const prevBounds = w.previousBounds || {
              x: 60,
              y: 60,
              width: 800,
              height: 560,
            };
            return {
              ...w,
              isMaximized: false,
              snapState: 'none',
              x: prevBounds.x,
              y: prevBounds.y,
              width: prevBounds.width,
              height: prevBounds.height,
            };
          } else {
            // Maximize
            return {
              ...w,
              isMaximized: true,
              snapState: 'maximize',
              previousBounds: {
                x: w.x,
                y: w.y,
                width: w.width,
                height: w.height,
              },
            };
          }
        }
        return w;
      })
    );
    focusWindow(windowId);
  }, [focusWindow]);

  const snapWindow = useCallback(
    (windowId: string, snapType: SnapLayoutType) => {
      setWindows((prev) =>
        prev.map((w) => {
          if (w.id !== windowId) return w;

          // Save current bounds if not already snapped or maximized
          const previousBounds =
            w.snapState === 'none' && !w.isMaximized
              ? { x: w.x, y: w.y, width: w.width, height: w.height }
              : w.previousBounds || { x: 60, y: 60, width: 800, height: 560 };

          return {
            ...w,
            snapState: snapType,
            isMaximized: snapType === 'maximize',
            previousBounds,
          };
        })
      );
      focusWindow(windowId);
    },
    [focusWindow]
  );

  const updateWindowBounds = useCallback((windowId: string, bounds: Partial<WindowBounds>) => {
    setWindows((prev) =>
      prev.map((w) => {
        if (w.id === windowId) {
          return {
            ...w,
            ...bounds,
            isMaximized: false,
            snapState: 'none',
          };
        }
        return w;
      })
    );
  }, []);

  const updateWindowTitle = useCallback((windowId: string, title: string) => {
    setWindows((prev) =>
      prev.map((w) => (w.id === windowId ? { ...w, title } : w))
    );
  }, []);

  const isWindowMinimized = useCallback(
    (windowId: string) => {
      const win = windows.find((w) => w.id === windowId);
      return win ? win.isMinimized : false;
    },
    [windows]
  );

  // App Maker: Add new custom Web App by URL
  const addCustomApp = useCallback(
    (newApp: {
      title: string;
      url: string;
      icon: string;
      iconType: 'lucide' | 'url';
      category?: 'tools' | 'webapps' | 'utilities' | 'media' | 'development';
      description?: string;
    }): AppDefinition => {
      const appId = `custom_app_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`;
      let cleanUrl = newApp.url.trim();
      if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
        cleanUrl = 'https://' + cleanUrl;
      }

      const createdApp: AppDefinition = {
        id: appId,
        title: newApp.title.trim() || 'Web App',
        icon: newApp.icon || 'Globe',
        iconType: newApp.iconType || 'lucide',
        category: newApp.category || 'webapps',
        description: newApp.description || `Web application hosted at ${cleanUrl}`,
        defaultWidth: 920,
        defaultHeight: 640,
        isCustomApp: true,
        customUrl: cleanUrl,
        customIconUrl: newApp.iconType === 'url' ? newApp.icon : undefined,
        isPinnedToDesktop: true,
        isPinnedToTaskbar: true,
        canHaveMultipleInstances: true,
      };

      setCustomApps((prev) => [...prev, createdApp]);

      addNotification(
        'App Added to Desktop',
        `"${createdApp.title}" is now available on your desktop and Start Menu.`,
        'success'
      );

      return createdApp;
    },
    []
  );

  const deleteCustomApp = useCallback((appId: string) => {
    setCustomApps((prev) => prev.filter((a) => a.id !== appId));
    // Close any open windows of this custom app
    setWindows((prev) => prev.filter((w) => w.appId !== appId));
  }, []);

  const updateSettings = useCallback((newSettings: Partial<OSSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  }, []);

  const toggleStartMenu = useCallback(() => {
    setStartMenuOpen((prev) => !prev);
    setSystemTrayOpen(false);
    setContextMenu((cm) => ({ ...cm, isOpen: false }));
  }, []);

  const toggleSystemTray = useCallback(() => {
    setSystemTrayOpen((prev) => !prev);
    setStartMenuOpen(false);
    setContextMenu((cm) => ({ ...cm, isOpen: false }));
  }, []);

  const toggleTaskView = useCallback(() => {
    setTaskViewOpen((prev) => !prev);
    setStartMenuOpen(false);
    setSystemTrayOpen(false);
    setContextMenu((cm) => ({ ...cm, isOpen: false }));
  }, []);

  const showDesktop = useCallback(() => {
    const allAreMinimized = windows.every((w) => w.isMinimized);
    setWindows((prev) =>
      prev.map((w) => ({
        ...w,
        isMinimized: !allAreMinimized,
      }))
    );
    if (!allAreMinimized) {
      setActiveWindowId(null);
    }
  }, [windows]);

  const openContextMenu = useCallback(
    (
      x: number,
      y: number,
      items: ContextMenuState['items'],
      targetType?: ContextMenuState['targetType'],
      targetData?: any
    ) => {
      // Bounds check for context menu
      const maxX = typeof window !== 'undefined' ? window.innerWidth - 220 : 800;
      const maxY = typeof window !== 'undefined' ? window.innerHeight - 300 : 600;
      setContextMenu({
        isOpen: true,
        x: Math.min(x, maxX),
        y: Math.min(y, maxY),
        items,
        targetType,
        targetData,
      });
      setStartMenuOpen(false);
      setSystemTrayOpen(false);
    },
    []
  );

  const closeContextMenu = useCallback(() => {
    setContextMenu((cm) => (cm.isOpen ? { ...cm, isOpen: false } : cm));
  }, []);

  const addNotification = useCallback(
    (
      title: string,
      message: string,
      type: NotificationItem['type'] = 'info',
      actionLabel?: string,
      onAction?: () => void
    ) => {
      const notif: NotificationItem = {
        id: 'notif_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
        title,
        message,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        type,
        actionLabel,
        onAction,
      };

      setNotifications((prev) => [notif, ...prev.slice(0, 19)]);

      // Play system chime
      try {
        soundService.playNotificationChime();
      } catch {}

      // Deliver system notification if permitted
      if (devicePermissions) {
        devicePermissions.showNotification(title, { body: message });
      }
    },
    []
  );

  const dismissNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  const openFileInDefaultApp = useCallback(
    (item: VFSItem) => {
      if (item.type === 'folder') {
        openApp('file-explorer', { initialPath: item.path });
        return;
      }

      const lower = item.name.toLowerCase();
      if (lower.endsWith('.html') || lower.endsWith('.htm')) {
        // HTML files open directly in Web Browser for preview
        openApp('browser', { filePath: item.path, isLocalFile: true });
      } else if (
        lower.endsWith('.txt') ||
        lower.endsWith('.json') ||
        lower.endsWith('.md') ||
        lower.endsWith('.js') ||
        lower.endsWith('.ts') ||
        lower.endsWith('.jsx') ||
        lower.endsWith('.tsx') ||
        lower.endsWith('.css') ||
        lower.endsWith('.scss') ||
        lower.endsWith('.xml') ||
        lower.endsWith('.log') ||
        lower.endsWith('.yaml') ||
        lower.endsWith('.yml')
      ) {
        openApp('text-editor', { filePath: item.path });
      } else if (lower.endsWith('.pdf')) {
        openApp('pdf-viewer', { filePath: item.path });
      } else if (
        lower.endsWith('.jpg') ||
        lower.endsWith('.jpeg') ||
        lower.endsWith('.png') ||
        lower.endsWith('.webp') ||
        lower.endsWith('.gif') ||
        lower.endsWith('.svg') ||
        lower.endsWith('.bmp') ||
        lower.endsWith('.ico')
      ) {
        openApp('image-viewer', { filePath: item.path });
      } else if (
        lower.endsWith('.mp4') ||
        lower.endsWith('.webm') ||
        lower.endsWith('.mov') ||
        lower.endsWith('.mp3') ||
        lower.endsWith('.wav') ||
        lower.endsWith('.ogg') ||
        lower.endsWith('.m4a') ||
        lower.endsWith('.aac')
      ) {
        openApp('media-player', { filePath: item.path });
      } else {
        // Fallback to text editor
        openApp('text-editor', { filePath: item.path });
      }
    },
    [openApp]
  );

  const openFileWithApp = useCallback(
    (item: VFSItem, targetAppId: string) => {
      if (targetAppId === 'browser') {
        openApp('browser', { filePath: item.path, isLocalFile: true });
      } else if (targetAppId === 'text-editor') {
        openApp('text-editor', { filePath: item.path });
      } else if (targetAppId === 'image-viewer') {
        openApp('image-viewer', { filePath: item.path });
      } else if (targetAppId === 'media-player') {
        openApp('media-player', { filePath: item.path });
      } else if (targetAppId === 'pdf-viewer') {
        openApp('pdf-viewer', { filePath: item.path });
      } else if (targetAppId === 'terminal') {
        openApp('terminal', {
          initialPath: item.type === 'folder' ? item.path : item.parentPath,
          initialCommand: item.type === 'folder' ? `cd "${item.path}"` : `cat "${item.path}"`,
        });
      } else if (targetAppId === 'file-explorer') {
        openApp('file-explorer', {
          initialPath: item.type === 'folder' ? item.path : item.parentPath,
        });
      } else {
        openApp(targetAppId, { filePath: item.path });
      }
    },
    [openApp]
  );

  return (
    <OSContext.Provider
      value={{
        windows,
        activeWindowId,
        openApp,
        closeWindow,
        minimizeWindow,
        restoreWindow,
        maximizeWindow,
        snapWindow,
        focusWindow,
        updateWindowBounds,
        updateWindowTitle,
        isWindowMinimized,
        allApps,
        customApps,
        addCustomApp,
        deleteCustomApp,
        getAppDefinition,
        settings,
        updateSettings,
        startMenuOpen,
        setStartMenuOpen,
        toggleStartMenu,
        systemTrayOpen,
        setSystemTrayOpen,
        toggleSystemTray,
        taskViewOpen,
        setTaskViewOpen,
        toggleTaskView,
        showDesktop,
        contextMenu,
        openContextMenu,
        closeContextMenu,
        notifications,
        addNotification,
        dismissNotification,
        clearNotifications,
        openFileInDefaultApp,
        openFileWithApp,
      }}
    >
      {children}
    </OSContext.Provider>
  );
};

export const useOS = (): OSContextType => {
  const context = useContext(OSContext);
  if (!context) {
    throw new Error('useOS must be used within an OSProvider');
  }
  return context;
};
