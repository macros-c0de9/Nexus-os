export type SnapLayoutType =
  | 'none'
  | 'left-half'
  | 'right-half'
  | 'left-wide'
  | 'right-slim'
  | 'top-left'
  | 'top-right'
  | 'bottom-left'
  | 'bottom-right'
  | 'maximize';

export interface AppDefinition {
  id: string;
  title: string;
  icon: string; // lucide icon identifier or image URL
  iconType: 'lucide' | 'url';
  category: 'system' | 'utilities' | 'media' | 'webapps' | 'development' | 'custom' | 'tools' | 'productivity';
  description: string;
  defaultWidth: number;
  defaultHeight: number;
  isCustomApp?: boolean;
  customUrl?: string;
  customIconUrl?: string;
  canHaveMultipleInstances?: boolean;
  isPinnedToTaskbar?: boolean;
  isPinnedToDesktop?: boolean;
}

export interface WindowBounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface WindowState {
  id: string;
  appId: string;
  title: string;
  icon: string;
  iconType: 'lucide' | 'url';
  x: number;
  y: number;
  width: number;
  height: number;
  minWidth: number;
  minHeight: number;
  isMinimized: boolean;
  isMaximized: boolean;
  snapState: SnapLayoutType;
  zIndex: number;
  data?: any; // e.g., file path, custom URL, initial query
  previousBounds?: WindowBounds;
}

export interface VFSItem {
  id: string;
  name: string;
  path: string;
  type: 'file' | 'folder';
  size: number; // bytes
  mimeType: string;
  content: string; // text content, or data URI, or sample representation
  parentPath: string;
  updatedAt: string;
  createdAt: string;
  isSystem?: boolean;
}

export interface OSSettings {
  wallpaperUrl: string;
  wallpaperFit: 'cover' | 'contain' | 'center';
  theme: 'dark' | 'light' | 'mica';
  accentColor: string;
  soundEnabled: boolean;
  dockPosition: 'bottom' | 'top';
  taskbarAlignment: 'center' | 'left';
  maxR1FileSizeMB: number; // Cloudflare worker / R1 free tier limit (20MB)
  deviceGesturesEnabled: boolean;
  desktopGridSize: 'small' | 'medium' | 'large';
  lockScreenEnabled: boolean;
}

export interface ContextMenuItem {
  id: string;
  label: string;
  icon?: string;
  shortcut?: string;
  disabled?: boolean;
  danger?: boolean;
  divider?: boolean;
  onClick?: () => void;
  submenu?: ContextMenuItem[];
}

export interface ContextMenuState {
  isOpen: boolean;
  x: number;
  y: number;
  items: ContextMenuItem[];
  targetType?: 'desktop' | 'file' | 'taskbar' | 'window';
  targetData?: any;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  time: string;
  type?: 'info' | 'success' | 'warning' | 'error';
  icon?: string;
  read?: boolean;
  actionLabel?: string;
  onAction?: () => void;
}

export interface OSProcess {
  pid: number;
  name: string;
  windowId?: string;
  cpu: number;
  memoryMB: number;
  status: 'running' | 'sleeping' | 'suspended';
}

export interface TerminalCommandDef {
  command: string;
  description: string;
  usage: string;
  category: 'file' | 'system' | 'network' | 'utility' | 'process';
  examples?: string[];
}
