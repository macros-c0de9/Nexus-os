import { VFSItem } from '../types/os';

export interface OpenWithAppOption {
  appId: string;
  name: string;
  icon: string;
  description?: string;
  isDefault?: boolean;
}

export function getOpenWithApps(item: VFSItem): OpenWithAppOption[] {
  if (item.type === 'folder') {
    return [
      { appId: 'file-explorer', name: 'File Explorer', icon: 'FolderKanban', isDefault: true, description: 'Browse folder contents' },
      { appId: 'terminal', name: 'Linux Terminal', icon: 'Terminal', description: 'Open directory in shell' },
    ];
  }

  const ext = item.name.split('.').pop()?.toLowerCase() || '';

  if (ext === 'html' || ext === 'htm') {
    return [
      { appId: 'browser', name: 'Web Browser', icon: 'Globe', isDefault: true, description: 'Live HTML preview & rendering' },
      { appId: 'text-editor', name: 'Text Editor', icon: 'FileText', description: 'Edit HTML source code' },
      { appId: 'terminal', name: 'Linux Terminal', icon: 'Terminal', description: 'Inspect in shell / cat' },
    ];
  }

  if (['txt', 'json', 'md', 'js', 'ts', 'jsx', 'tsx', 'css', 'scss', 'xml', 'log', 'yaml', 'yml', 'sh', 'py', 'sql'].includes(ext)) {
    return [
      { appId: 'text-editor', name: 'Text Editor', icon: 'FileText', isDefault: true, description: 'Edit code and text' },
      { appId: 'browser', name: 'Web Browser', icon: 'Globe', description: 'Preview formatted document' },
      { appId: 'terminal', name: 'Linux Terminal', icon: 'Terminal', description: 'View with terminal cat' },
    ];
  }

  if (['jpg', 'jpeg', 'png', 'webp', 'gif', 'svg', 'bmp', 'ico'].includes(ext)) {
    return [
      { appId: 'image-viewer', name: 'Photos (Image Viewer)', icon: 'Image', isDefault: true, description: 'View picture & set as wallpaper' },
      { appId: 'browser', name: 'Web Browser', icon: 'Globe', description: 'Display image in browser' },
      { appId: 'text-editor', name: 'Text Editor', icon: 'FileText', description: 'View raw code / SVG markup' },
    ];
  }

  if (['mp4', 'webm', 'mov', 'mp3', 'wav', 'ogg', 'm4a', 'aac', 'flac'].includes(ext)) {
    return [
      { appId: 'media-player', name: 'Media Player', icon: 'Film', isDefault: true, description: 'Play audio and video' },
      { appId: 'browser', name: 'Web Browser', icon: 'Globe', description: 'Play media in web viewport' },
    ];
  }

  if (ext === 'pdf') {
    return [
      { appId: 'pdf-viewer', name: 'PDF Viewer', icon: 'BookOpenText', isDefault: true, description: 'View and read PDF pages' },
      { appId: 'browser', name: 'Web Browser', icon: 'Globe', description: 'Preview document' },
      { appId: 'text-editor', name: 'Text Editor', icon: 'FileText', description: 'Raw document inspection' },
    ];
  }

  // Fallback for generic files
  return [
    { appId: 'text-editor', name: 'Text Editor', icon: 'FileText', isDefault: true, description: 'Open with default text viewer' },
    { appId: 'browser', name: 'Web Browser', icon: 'Globe', description: 'Preview in browser' },
    { appId: 'terminal', name: 'Linux Terminal', icon: 'Terminal', description: 'Inspect in shell' },
  ];
}
