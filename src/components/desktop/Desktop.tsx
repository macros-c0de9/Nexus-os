import React, { useState, useEffect, useRef } from 'react';
import { useOS } from '../../context/OSContext';
import { vfs } from '../../services/vfs';
import { VFSItem } from '../../types/os';
import { getOpenWithApps } from '../../utils/fileAssociations';
import { DesktopIcon } from './DesktopIcon';
import {
  PlusSquare,
  FolderKanban,
  Terminal,
  Settings,
  Wallpaper,
  RotateCw,
  FolderPlus,
  FilePlus,
  Layers,
  Globe
} from 'lucide-react';

export const Desktop: React.FC = () => {
  const {
    allApps,
    customApps,
    openApp,
    openFileInDefaultApp,
    openFileWithApp,
    settings,
    openContextMenu,
    closeContextMenu,
    toggleTaskView,
    addNotification,
  } = useOS();

  const [desktopFiles, setDesktopFiles] = useState<VFSItem[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const refreshDesktopFiles = () => {
    const items = vfs.getItemsInDirectory('/Desktop');
    setDesktopFiles(items);
  };

  useEffect(() => {
    refreshDesktopFiles();
    const unsub = vfs.subscribe(() => {
      refreshDesktopFiles();
    });
    return () => unsub();
  }, []);

  const handleDesktopContextMenu = (e: React.MouseEvent) => {
    // Only if clicking on the background, not on an icon
    if ((e.target as HTMLElement).closest('[id^="desktop-icon-"]')) return;

    e.preventDefault();
    openContextMenu(
      e.clientX,
      e.clientY,
      [
        {
          id: 'app-maker',
          label: 'Create Web App (App Maker)',
          icon: 'PlusSquare',
          onClick: () => openApp('app-maker'),
        },
        {
          id: 'file-exp',
          label: 'Open File Explorer',
          icon: 'FolderKanban',
          onClick: () => openApp('file-explorer'),
        },
        {
          id: 'terminal',
          label: 'Open Linux Terminal',
          icon: 'Terminal',
          onClick: () => openApp('terminal'),
        },
        {
          id: 'task-view',
          label: 'Task View (All Tabs)',
          icon: 'Layers',
          onClick: () => toggleTaskView(),
        },
        { id: 'div1', label: '', divider: true },
        {
          id: 'new-folder',
          label: 'New Folder on Desktop',
          icon: 'FolderPlus',
          onClick: () => {
            const name = prompt('Enter folder name:', 'New Folder');
            if (name) {
              const res = vfs.createFolder('/Desktop', name);
              if (!res.success) addNotification('Error', res.error || 'Failed', 'error');
            }
          },
        },
        {
          id: 'new-text',
          label: 'New Text Document',
          icon: 'FilePlus',
          onClick: () => {
            const name = prompt('Enter document name:', 'Document.txt');
            if (name) {
              const res = vfs.createFile('/Desktop', name, '', 'text/plain');
              if (!res.success) addNotification('Error', res.error || 'Failed', 'error');
            }
          },
        },
        { id: 'div2', label: '', divider: true },
        {
          id: 'wallpaper',
          label: 'Change Wallpaper (Settings)',
          icon: 'Wallpaper',
          onClick: () => openApp('settings'),
        },
        {
          id: 'refresh',
          label: 'Refresh Desktop',
          icon: 'RotateCw',
          onClick: () => refreshDesktopFiles(),
        },
      ],
      'desktop'
    );
  };

  const getWallpaperStyle = (): React.CSSProperties => {
    return {
      backgroundImage: `url(${settings.wallpaperUrl})`,
      backgroundSize: settings.wallpaperFit || 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
    };
  };

  // Filter apps pinned to desktop
  const desktopApps = allApps.filter((a) => a.isPinnedToDesktop || a.isCustomApp);

  return (
    <div
      id="aura-desktop-surface"
      style={getWallpaperStyle()}
      onContextMenu={handleDesktopContextMenu}
      onClick={() => {
        setSelectedId(null);
        closeContextMenu();
      }}
      className="absolute inset-0 pb-12 overflow-hidden select-none bg-slate-900 bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950"
    >
      {/* Subtle overlay for contrast */}
      <div className="absolute inset-0 bg-slate-950/20 backdrop-brightness-95 pointer-events-none" />

      {/* Desktop Icon Grid Layout */}
      <div className="relative z-10 p-4 h-full flex flex-col flex-wrap items-start content-start gap-2 overflow-hidden">
        {/* System & Custom Apps */}
        {desktopApps.map((app) => (
          <DesktopIcon
            key={app.id}
            id={app.id}
            title={app.title}
            icon={app.icon}
            iconType={app.iconType}
            customUrl={app.customIconUrl}
            isCustomApp={app.isCustomApp}
            isSelected={selectedId === app.id}
            onClick={(e) => {
              e.stopPropagation();
              setSelectedId(app.id);
            }}
            onDoubleClick={() => openApp(app.id)}
            onContextMenu={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setSelectedId(app.id);
              openContextMenu(
                e.clientX,
                e.clientY,
                [
                  {
                    id: 'open',
                    label: 'Open Application',
                    icon: 'ExternalLink',
                    onClick: () => openApp(app.id),
                  },
                  ...(app.isCustomApp
                    ? [
                        {
                          id: 'remove',
                          label: 'Uninstall / Delete Web App',
                          icon: 'Trash2',
                          danger: true,
                          onClick: () => openApp('app-maker'),
                        },
                      ]
                    : []),
                ],
                'desktop'
              );
            }}
          />
        ))}

        {/* Desktop Virtual Files */}
        {desktopFiles.map((file) => {
          let fileIcon = 'FileText';
          const ext = file.name.split('.').pop()?.toLowerCase() || '';
          if (file.type === 'folder') fileIcon = 'FolderKanban';
          else if (['html', 'htm'].includes(ext)) fileIcon = 'Globe';
          else if (['jpg', 'jpeg', 'png', 'webp', 'svg', 'bmp', 'gif'].includes(ext)) fileIcon = 'Image';
          else if (['mp4', 'webm', 'mov', 'mp3', 'wav'].includes(ext)) fileIcon = 'Film';
          else if (['pdf'].includes(ext)) fileIcon = 'BookOpenText';

          const openWithOptions = getOpenWithApps(file);
          const defaultApp = openWithOptions.find((o) => o.isDefault) || openWithOptions[0];

          return (
            <DesktopIcon
              key={file.id}
              id={file.id}
              title={file.name}
              icon={fileIcon}
              fileItem={file}
              isSelected={selectedId === file.id}
              onClick={(e) => {
                e.stopPropagation();
                setSelectedId(file.id);
              }}
              onDoubleClick={() => openFileInDefaultApp(file)}
              onContextMenu={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setSelectedId(file.id);
                openContextMenu(
                  e.clientX,
                  e.clientY,
                  [
                    {
                      id: 'open-default',
                      label: file.type === 'folder' ? 'Open Folder' : `Open (${defaultApp.name})`,
                      icon: defaultApp.icon || 'ExternalLink',
                      onClick: () => openFileInDefaultApp(file),
                    },
                    {
                      id: 'open-with',
                      label: 'Open with...',
                      icon: 'Layers',
                      submenu: openWithOptions.map((opt) => ({
                        id: `open-with-${opt.appId}`,
                        label: `${opt.name}${opt.isDefault ? ' (Default)' : ''}`,
                        icon: opt.icon,
                        onClick: () => openFileWithApp(file, opt.appId),
                      })),
                    },
                    { id: 'div-file', label: '', divider: true },
                    {
                      id: 'delete',
                      label: 'Delete',
                      icon: 'Trash2',
                      danger: true,
                      onClick: () => {
                        if (confirm(`Delete "${file.name}"?`)) {
                          vfs.deleteItem(file.path);
                        }
                      },
                    },
                  ],
                  'file',
                  file
                );
              }}
            />
          );
        })}
      </div>
    </div>
  );
};
