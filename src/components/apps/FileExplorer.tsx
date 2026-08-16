import React, { useState, useEffect, useRef } from 'react';
import { useOS } from '../../context/OSContext';
import { vfs } from '../../services/vfs';
import { VFSItem } from '../../types/os';
import { getOpenWithApps } from '../../utils/fileAssociations';
import { DynamicIcon } from '../common/DynamicIcon';
import {
  Folder,
  FileText,
  Image,
  Film,
  HardDrive,
  Cloud,
  Plus,
  Upload,
  Search,
  Trash2,
  Copy,
  Scissors,
  Clipboard,
  ChevronRight,
  ArrowUp,
  LayoutGrid,
  List,
  AlertCircle,
  FileCode,
  Globe,
  Info
} from 'lucide-react';

interface FileExplorerProps {
  initialPath?: string;
}

export const FileExplorer: React.FC<FileExplorerProps> = ({ initialPath = '/Desktop' }) => {
  const { openFileInDefaultApp, openFileWithApp, openContextMenu, addNotification, settings } = useOS();
  const [currentPath, setCurrentPath] = useState(initialPath);
  const [items, setItems] = useState<VFSItem[]>([]);
  const [selectedItemIds, setSelectedItemIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [newFolderName, setNewFolderName] = useState('');
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [storageStats, setStorageStats] = useState(vfs.getStorageStats());
  const [dragOverFolder, setDragOverFolder] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const refreshItems = () => {
    const list = vfs.getItemsInDirectory(currentPath);
    setItems(list);
    setStorageStats(vfs.getStorageStats());
  };

  useEffect(() => {
    refreshItems();
    const unsub = vfs.subscribe(() => {
      refreshItems();
    });
    return () => unsub();
  }, [currentPath]);

  const handleNavigate = (path: string) => {
    setCurrentPath(vfs.normalizePath(path));
    setSelectedItemIds([]);
    setSearchQuery('');
  };

  const handleGoUp = () => {
    if (currentPath === '/') return;
    const parent = vfs.getParentPath(currentPath);
    handleNavigate(parent);
  };

  const handleItemClick = (item: VFSItem, e: React.MouseEvent) => {
    if (e.ctrlKey || e.metaKey) {
      setSelectedItemIds((prev) =>
        prev.includes(item.id) ? prev.filter((id) => id !== item.id) : [...prev, item.id]
      );
    } else {
      setSelectedItemIds([item.id]);
    }
  };

  const handleItemDoubleClick = (item: VFSItem) => {
    if (item.type === 'folder') {
      handleNavigate(item.path);
    } else {
      openFileInDefaultApp(item);
    }
  };

  const handleCreateFolder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFolderName.trim()) return;
    const res = vfs.createFolder(currentPath, newFolderName.trim());
    if (res.success) {
      setIsCreatingFolder(false);
      setNewFolderName('');
    } else {
      addNotification('Folder Error', res.error || 'Failed to create folder', 'error');
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const res = await vfs.uploadBrowserFile(file, currentPath);
      if (!res.success) {
        addNotification('Upload Rejected (Limit 20MB)', res.error || 'Upload failed', 'error');
      } else {
        addNotification('File Uploaded', `"${file.name}" saved to ${currentPath}`, 'success');
      }
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Window Scoped Drag and Drop
  const handleDragStart = (e: React.DragEvent, item: VFSItem) => {
    e.dataTransfer.setData('application/aura-vfs-path', item.path);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDropOnFolder = (e: React.DragEvent, targetFolderItem: VFSItem) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOverFolder(null);

    const srcPath = e.dataTransfer.getData('application/aura-vfs-path');
    if (srcPath && targetFolderItem.type === 'folder') {
      const res = vfs.moveItem(srcPath, targetFolderItem.path);
      if (!res.success) {
        addNotification('Move Failed', res.error || 'Could not move item', 'warning');
      }
    }
  };

  const handleDropOnContainer = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOverFolder(null);

    // Check if dragging OS files
    const srcPath = e.dataTransfer.getData('application/aura-vfs-path');
    if (srcPath) {
      const res = vfs.moveItem(srcPath, currentPath);
      if (!res.success) {
        addNotification('Move Failed', res.error || 'Could not move item', 'warning');
      }
      return;
    }

    // Check if dragging physical files from host computer
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      Array.from(e.dataTransfer.files).forEach(async (file: File) => {
        const res = await vfs.uploadBrowserFile(file, currentPath);
        if (!res.success) {
          addNotification('Upload Limit (20MB)', res.error || 'File too large', 'error');
        } else {
          addNotification('Uploaded', `"${file.name}" saved`, 'success');
        }
      });
    }
  };

  // Window Context Menu
  const handleItemContextMenu = (e: React.MouseEvent, item: VFSItem) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedItemIds([item.id]);

    const openWithOptions = getOpenWithApps(item);
    const defaultApp = openWithOptions.find((o) => o.isDefault) || openWithOptions[0];

    openContextMenu(
      e.clientX,
      e.clientY,
      [
        {
          id: 'open-default',
          label: item.type === 'folder' ? 'Open Folder' : `Open (${defaultApp.name})`,
          icon: defaultApp.icon || 'ExternalLink',
          onClick: () => openFileInDefaultApp(item),
        },
        {
          id: 'open-with',
          label: 'Open with...',
          icon: 'Layers',
          submenu: openWithOptions.map((opt) => ({
            id: `open-with-${opt.appId}`,
            label: `${opt.name}${opt.isDefault ? ' (Default)' : ''}`,
            icon: opt.icon,
            onClick: () => openFileWithApp(item, opt.appId),
          })),
        },
        { id: 'div-open', label: '', divider: true },
        {
          id: 'copy',
          label: 'Copy (Window Only)',
          icon: 'Copy',
          shortcut: 'Ctrl+C',
          onClick: () => {
            vfs.setClipboard('copy', item);
            addNotification('Copied', `"${item.name}" copied to window clipboard`, 'info');
          },
        },
        {
          id: 'cut',
          label: 'Cut (Window Only)',
          icon: 'Scissors',
          shortcut: 'Ctrl+X',
          onClick: () => {
            vfs.setClipboard('cut', item);
            addNotification('Cut', `"${item.name}" ready to move`, 'info');
          },
        },
        { id: 'div1', label: '', divider: true },
        {
          id: 'rename',
          label: 'Rename',
          icon: 'Edit3',
          onClick: () => {
            const newName = prompt('Enter new name:', item.name);
            if (newName && newName !== item.name) {
              const res = vfs.renameItem(item.path, newName);
              if (!res.success) addNotification('Rename Error', res.error || 'Failed', 'error');
            }
          },
        },
        {
          id: 'delete',
          label: 'Delete',
          icon: 'Trash2',
          danger: true,
          shortcut: 'Del',
          onClick: () => {
            if (confirm(`Delete "${item.name}"?`)) {
              vfs.deleteItem(item.path);
            }
          },
        },
      ],
      'file',
      item
    );
  };

  const handleContainerContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    const clip = vfs.getClipboard();

    openContextMenu(
      e.clientX,
      e.clientY,
      [
        {
          id: 'new-folder',
          label: 'New Folder',
          icon: 'FolderPlus',
          onClick: () => setIsCreatingFolder(true),
        },
        {
          id: 'upload',
          label: 'Upload File (Max 20MB)',
          icon: 'Upload',
          onClick: () => fileInputRef.current?.click(),
        },
        { id: 'div1', label: '', divider: true },
        {
          id: 'paste',
          label: 'Paste into Folder',
          icon: 'Clipboard',
          disabled: !clip,
          shortcut: 'Ctrl+V',
          onClick: () => {
            const res = vfs.pasteClipboard(currentPath);
            if (!res.success) addNotification('Paste Failed', res.error || 'Could not paste', 'error');
          },
        },
        { id: 'div2', label: '', divider: true },
        {
          id: 'refresh',
          label: 'Refresh View',
          icon: 'RotateCw',
          onClick: () => refreshItems(),
        },
      ],
      'desktop'
    );
  };

  const getItemIcon = (item: VFSItem) => {
    if (item.type === 'folder') return <Folder className="w-5 h-5 text-amber-400 fill-amber-400/20" />;
    const ext = item.name.split('.').pop()?.toLowerCase() || '';
    if (['html', 'htm'].includes(ext)) return <Globe className="w-5 h-5 text-orange-400" />;
    if (['txt', 'md', 'json', 'log', 'js', 'ts', 'jsx', 'tsx', 'css'].includes(ext)) return <FileText className="w-5 h-5 text-blue-400" />;
    if (['jpg', 'jpeg', 'png', 'webp', 'svg', 'bmp', 'gif'].includes(ext)) return <Image className="w-5 h-5 text-emerald-400" />;
    if (['mp4', 'webm', 'mov', 'mp3', 'wav', 'ogg'].includes(ext)) return <Film className="w-5 h-5 text-rose-400" />;
    if (['pdf'].includes(ext)) return <FileCode className="w-5 h-5 text-red-400" />;
    return <FileText className="w-5 h-5 text-slate-400" />;
  };

  const filteredItems = searchQuery
    ? items.filter((item) => item.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : items;

  const quickFolders = [
    { name: 'Desktop', path: '/Desktop', icon: 'Monitor' },
    { name: 'Documents', path: '/Documents', icon: 'FileText' },
    { name: 'Pictures', path: '/Pictures', icon: 'Image' },
    { name: 'Videos', path: '/Videos', icon: 'Film' },
    { name: 'Downloads', path: '/Downloads', icon: 'Download' },
    { name: 'CloudDrive (R1)', path: '/CloudDrive', icon: 'Cloud' },
  ];

  return (
    <div
      id="file-explorer-container"
      className="h-full flex flex-col bg-slate-950 text-slate-100 select-none overflow-hidden"
    >
      {/* Hidden File Input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        className="hidden"
        multiple
      />

      {/* Top Toolbar */}
      <div className="p-2 border-b border-slate-800 bg-slate-900/90 flex flex-wrap items-center justify-between gap-2 flex-shrink-0">
        <div className="flex items-center gap-1">
          <button
            onClick={handleGoUp}
            disabled={currentPath === '/'}
            className="p-1.5 rounded-lg text-slate-300 hover:bg-slate-800 disabled:opacity-30 disabled:hover:bg-transparent"
            title="Up Directory"
          >
            <ArrowUp className="w-4 h-4" />
          </button>

          {/* Breadcrumb Path Bar */}
          <div className="flex items-center bg-slate-950/80 border border-slate-700/80 rounded-xl px-3 py-1 text-xs text-slate-200">
            <HardDrive className="w-3.5 h-3.5 text-blue-400 mr-2 flex-shrink-0" />
            <button onClick={() => handleNavigate('/')} className="hover:text-blue-400">
              Root
            </button>
            {currentPath !== '/' &&
              currentPath
                .split('/')
                .filter(Boolean)
                .map((segment, idx, arr) => {
                  const segPath = '/' + arr.slice(0, idx + 1).join('/');
                  return (
                    <React.Fragment key={segPath}>
                      <ChevronRight className="w-3 h-3 text-slate-600 mx-1" />
                      <button
                        onClick={() => handleNavigate(segPath)}
                        className={`hover:text-blue-400 truncate max-w-[120px] ${
                          idx === arr.length - 1 ? 'font-semibold text-white' : 'text-slate-400'
                        }`}
                      >
                        {segment}
                      </button>
                    </React.Fragment>
                  );
                })}
          </div>
        </div>

        {/* Action Buttons & Search */}
        <div className="flex items-center gap-1.5">
          <button
            id="btn-new-folder"
            onClick={() => setIsCreatingFolder(true)}
            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs flex items-center gap-1 transition-colors"
            title="Create Folder"
          >
            <Plus className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">New Folder</span>
          </button>
          <button
            id="btn-upload-file"
            onClick={() => fileInputRef.current?.click()}
            className="p-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs flex items-center gap-1 transition-colors"
            title="Upload File (Max 20MB)"
          >
            <Upload className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Upload (≤20MB)</span>
          </button>

          {/* View Mode Toggle */}
          <div className="flex bg-slate-950/60 rounded-lg p-0.5 border border-slate-800">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded text-xs ${
                viewMode === 'grid' ? 'bg-blue-600 text-white' : 'text-slate-400'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded text-xs ${
                viewMode === 'list' ? 'bg-blue-600 text-white' : 'text-slate-400'
              }`}
            >
              <List className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Search Input */}
          <div className="relative">
            <Search className="w-3 h-3 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-28 sm:w-36 bg-slate-950/80 border border-slate-700/80 rounded-lg pl-7 pr-2 py-1 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Main Dual Pane Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar Navigation */}
        <div className="w-48 bg-slate-900/60 border-r border-slate-800 p-3 hidden sm:flex flex-col justify-between flex-shrink-0">
          <div className="space-y-1">
            <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider px-2 mb-2">
              Quick Locations
            </p>
            {quickFolders.map((qf) => (
              <button
                key={qf.path}
                onClick={() => handleNavigate(qf.path)}
                className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs transition-colors ${
                  currentPath === qf.path
                    ? 'bg-blue-600/30 text-blue-300 font-medium'
                    : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                }`}
              >
                <DynamicIcon name={qf.icon} size={15} className="text-slate-400" />
                <span className="truncate">{qf.name}</span>
              </button>
            ))}
          </div>

          {/* Cloudflare R1 Storage Info Widget */}
          <div className="p-2.5 bg-slate-950/70 border border-slate-800/80 rounded-xl space-y-1.5">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-slate-400 flex items-center gap-1">
                <Cloud className="w-3 h-3 text-sky-400" /> R1 Storage
              </span>
              <span className="font-semibold text-slate-300">{storageStats.percentage}%</span>
            </div>
            <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all ${
                  storageStats.percentage > 85 ? 'bg-rose-500' : 'bg-blue-500'
                }`}
                style={{ width: `${storageStats.percentage}%` }}
              />
            </div>
            <p className="text-[9px] text-slate-500">Max 20MB per file upload</p>
          </div>
        </div>

        {/* File Grid/List Area */}
        <div
          id="file-explorer-canvas"
          onContextMenu={handleContainerContextMenu}
          onDragOver={(e) => {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'move';
          }}
          onDrop={handleDropOnContainer}
          className="flex-1 p-4 overflow-y-auto bg-slate-950/40 relative"
        >
          {/* New Folder Modal Prompt inline */}
          {isCreatingFolder && (
            <div className="mb-4 p-3 bg-slate-900 border border-blue-500/40 rounded-xl max-w-sm">
              <p className="text-xs font-semibold text-slate-200 mb-2">Create New Folder in {currentPath}</p>
              <form onSubmit={handleCreateFolder} className="flex gap-2">
                <input
                  type="text"
                  autoFocus
                  placeholder="Folder name"
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-slate-100"
                />
                <button
                  type="submit"
                  className="px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-medium"
                >
                  Create
                </button>
                <button
                  type="button"
                  onClick={() => setIsCreatingFolder(false)}
                  className="px-2 py-1 text-slate-400 hover:text-slate-200 text-xs"
                >
                  Cancel
                </button>
              </form>
            </div>
          )}

          {filteredItems.length === 0 ? (
            <div className="h-48 flex flex-col items-center justify-center text-slate-500 text-xs">
              <Folder className="w-10 h-10 stroke-1 mb-2 text-slate-600" />
              <p>Folder is empty</p>
              <p className="text-[10px] text-slate-600 mt-1">
                Drag files here or click "Upload" (up to 20MB)
              </p>
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
              {filteredItems.map((item) => {
                const isSelected = selectedItemIds.includes(item.id);
                const isOver = dragOverFolder === item.path;

                return (
                  <div
                    key={item.id}
                    id={`file-item-${item.id}`}
                    draggable
                    onDragStart={(e) => handleDragStart(e, item)}
                    onDragOver={(e) => {
                      if (item.type === 'folder') {
                        e.preventDefault();
                        setDragOverFolder(item.path);
                      }
                    }}
                    onDragLeave={() => setDragOverFolder(null)}
                    onDrop={(e) => item.type === 'folder' && handleDropOnFolder(e, item)}
                    onClick={(e) => handleItemClick(item, e)}
                    onDoubleClick={() => handleItemDoubleClick(item)}
                    onContextMenu={(e) => handleItemContextMenu(e, item)}
                    className={`p-3 rounded-xl flex flex-col items-center justify-center text-center cursor-pointer transition-all border group ${
                      isSelected
                        ? 'bg-blue-600/20 border-blue-500/60 shadow-lg'
                        : isOver
                        ? 'bg-amber-500/20 border-amber-400 ring-2 ring-amber-400'
                        : 'bg-slate-900/40 border-transparent hover:bg-slate-800/60 hover:border-slate-700/60'
                    }`}
                  >
                    <div className="w-12 h-12 flex items-center justify-center mb-1.5 transition-transform group-hover:scale-105">
                      {getItemIcon(item)}
                    </div>
                    <span className="text-xs text-slate-200 font-medium truncate w-full group-hover:text-white">
                      {item.name}
                    </span>
                    <span className="text-[10px] text-slate-500 mt-0.5">
                      {item.type === 'folder'
                        ? 'Folder'
                        : `${(item.size / 1024).toFixed(0)} KB`}
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="space-y-1">
              <div className="grid grid-cols-12 px-3 py-1.5 text-[11px] font-semibold text-slate-500 border-b border-slate-800">
                <span className="col-span-6">Name</span>
                <span className="col-span-3">Type</span>
                <span className="col-span-3 text-right">Size</span>
              </div>
              {filteredItems.map((item) => {
                const isSelected = selectedItemIds.includes(item.id);
                return (
                  <div
                    key={item.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, item)}
                    onClick={(e) => handleItemClick(item, e)}
                    onDoubleClick={() => handleItemDoubleClick(item)}
                    onContextMenu={(e) => handleItemContextMenu(e, item)}
                    className={`grid grid-cols-12 px-3 py-2 rounded-lg text-xs items-center cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-blue-600/20 text-white font-medium'
                        : 'text-slate-300 hover:bg-slate-900/80 hover:text-white'
                    }`}
                  >
                    <div className="col-span-6 flex items-center gap-2 truncate">
                      {getItemIcon(item)}
                      <span className="truncate">{item.name}</span>
                    </div>
                    <div className="col-span-3 text-slate-500 truncate text-[11px]">
                      {item.type === 'folder' ? 'Folder' : item.mimeType}
                    </div>
                    <div className="col-span-3 text-right text-slate-500 text-[11px]">
                      {item.type === 'folder' ? '-' : `${(item.size / 1024).toFixed(1)} KB`}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Footer Status Bar */}
      <div className="px-3 py-1.5 border-t border-slate-800 bg-slate-900/90 text-[11px] text-slate-400 flex items-center justify-between">
        <span>
          {filteredItems.length} item{filteredItems.length !== 1 ? 's' : ''}{' '}
          {selectedItemIds.length > 0 && `(${selectedItemIds.length} selected)`}
        </span>
        <div className="flex items-center gap-3">
          <span>Virtual File System (VFS)</span>
          <span className="text-emerald-400">● Synced</span>
        </div>
      </div>
    </div>
  );
};
