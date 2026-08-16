import { VFSItem } from '../types/os';

const STORAGE_KEY = 'aura_os_vfs_v1';
const MAX_R1_FILE_SIZE_BYTES = 20 * 1024 * 1024; // 20 MB limit as requested

const DEFAULT_VFS_ITEMS: VFSItem[] = [
  // Root Folders
  {
    id: 'root-desktop',
    name: 'Desktop',
    path: '/Desktop',
    type: 'folder',
    size: 0,
    mimeType: 'inode/directory',
    content: '',
    parentPath: '/',
    updatedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    isSystem: true,
  },
  {
    id: 'root-documents',
    name: 'Documents',
    path: '/Documents',
    type: 'folder',
    size: 0,
    mimeType: 'inode/directory',
    content: '',
    parentPath: '/',
    updatedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    isSystem: true,
  },
  {
    id: 'root-pictures',
    name: 'Pictures',
    path: '/Pictures',
    type: 'folder',
    size: 0,
    mimeType: 'inode/directory',
    content: '',
    parentPath: '/',
    updatedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    isSystem: true,
  },
  {
    id: 'root-videos',
    name: 'Videos',
    path: '/Videos',
    type: 'folder',
    size: 0,
    mimeType: 'inode/directory',
    content: '',
    parentPath: '/',
    updatedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    isSystem: true,
  },
  {
    id: 'root-downloads',
    name: 'Downloads',
    path: '/Downloads',
    type: 'folder',
    size: 0,
    mimeType: 'inode/directory',
    content: '',
    parentPath: '/',
    updatedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    isSystem: true,
  },
  {
    id: 'root-clouddrive',
    name: 'CloudDrive',
    path: '/CloudDrive',
    type: 'folder',
    size: 0,
    mimeType: 'inode/directory',
    content: '',
    parentPath: '/',
    updatedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    isSystem: true,
  },

  // Desktop Files
  {
    id: 'file-demo-html',
    name: 'Interactive_Demo.html',
    path: '/Desktop/Interactive_Demo.html',
    type: 'file',
    size: 2840,
    mimeType: 'text/html',
    content: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>AuraOS HTML Preview</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
    body {
      background: radial-gradient(circle at top, #1e1b4b, #0f172a 70%);
      color: #f8fafc;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 1.5rem;
    }
    .card {
      background: rgba(30, 41, 59, 0.75);
      border: 1px solid rgba(148, 163, 184, 0.2);
      border-radius: 1.25rem;
      padding: 2.5rem 2rem;
      max-width: 540px;
      width: 100%;
      text-align: center;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
      backdrop-filter: blur(16px);
    }
    .badge {
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
      background: #2563eb;
      color: #ffffff;
      padding: 0.35rem 0.9rem;
      border-radius: 9999px;
      font-size: 0.75rem;
      font-weight: 700;
      letter-spacing: 0.05em;
      text-transform: uppercase;
      margin-bottom: 1.25rem;
    }
    h1 {
      font-size: 1.85rem;
      font-weight: 800;
      color: #38bdf8;
      margin-bottom: 0.75rem;
      line-height: 1.2;
    }
    p {
      color: #94a3b8;
      font-size: 0.95rem;
      line-height: 1.6;
      margin-bottom: 1.75rem;
    }
    .counter-box {
      background: rgba(15, 23, 42, 0.6);
      border: 1px solid rgba(51, 65, 85, 0.8);
      border-radius: 0.75rem;
      padding: 1.25rem;
      margin-bottom: 1.5rem;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.75rem;
    }
    .count-display {
      font-size: 2.5rem;
      font-weight: 800;
      color: #60a5fa;
      font-variant-numeric: tabular-nums;
    }
    .btn-group {
      display: flex;
      gap: 0.5rem;
    }
    button {
      background: #3b82f6;
      color: white;
      border: none;
      padding: 0.6rem 1.25rem;
      border-radius: 0.5rem;
      font-size: 0.9rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s ease;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.2);
    }
    button:hover {
      background: #2563eb;
      transform: translateY(-1px);
    }
    button.secondary {
      background: #334155;
    }
    button.secondary:hover {
      background: #475569;
    }
    .features {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 0.75rem;
      text-align: left;
      margin-top: 1rem;
    }
    .feature-item {
      background: rgba(15, 23, 42, 0.4);
      padding: 0.75rem;
      border-radius: 0.5rem;
      font-size: 0.8rem;
      color: #cbd5e1;
    }
  </style>
</head>
<body>
  <div class="card">
    <div class="badge">
      <span>●</span> Live Web Preview
    </div>
    <h1>Interactive HTML Preview</h1>
    <p>This HTML document is rendered directly inside AuraOS Web Browser with JavaScript interactivity, CSS animations, and VFS synchronization.</p>
    
    <div class="counter-box">
      <div id="counter" class="count-display">0</div>
      <div class="btn-group">
        <button class="secondary" onclick="updateCount(-1)">- Decrease</button>
        <button onclick="updateCount(1)">+ Increase</button>
        <button class="secondary" onclick="updateCount(0, true)">Reset</button>
      </div>
    </div>

    <div class="features">
      <div class="feature-item">⚡ <strong>Live Sandbox</strong>: Full HTML5 DOM rendering</div>
      <div class="feature-item">📝 <strong>Open With</strong>: Right-click to edit source code</div>
    </div>
  </div>

  <script>
    let count = 0;
    function updateCount(delta, reset = false) {
      if (reset) count = 0;
      else count += delta;
      document.getElementById('counter').innerText = count;
    }
  </script>
</body>
</html>`,
    parentPath: '/Desktop',
    updatedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
  },
  {
    id: 'file-readme',
    name: 'Welcome_To_AuraOS.txt',
    path: '/Desktop/Welcome_To_AuraOS.txt',
    type: 'file',
    size: 1420,
    mimeType: 'text/plain',
    content: `=====================================================
🚀 WELCOME TO AURA-OS WEB DESKTOP ENVIRONMENT
=====================================================

AuraOS is a high-performance Web Desktop Operating System packed with native-like features:

✨ KEY FEATURES & HIGHLIGHTS:
1. 🌐 APP MAKER:
   - Turn ANY website into a desktop app window!
   - Simply open "App Maker", provide a URL, Name & Icon, and click "Add to Desktop".
   - Features built-in browser controls, viewport scaling, and external tab fallbacks.

2. 🪟 WINDOW MANAGEMENT & MULTI-WINDOW SNAPPING:
   - Snapping presets: 50/50 Dual Split, 1.5/0.5 Ratio Split, and 4-Quadrant 2x2 Grid.
   - Smooth drag, 8-directional edge resize, minimize, maximize, and active z-index focus.
   - Window Manager bar for instant layout switching.

3. 📁 VIRTUAL FILE SYSTEM & MULTI-WINDOW DRAG & DROP:
   - Drag & drop files between explorer windows, view in text editor, image viewer, or PDF reader.
   - 20 MB File Limit Enforcement: Cloudflare free plan & R1 simulated bucket safety checks.
   - Scoped copy/cut/paste clipboard operations.

4. 🐧 LINUX TERMINAL:
   - Authentic bash-like command-line environment.
   - Type 'help' to view all available commands and their comprehensive definitions.

5. 📱 TOUCH & GESTURE CONTROLS:
   - 1 Finger: Left click / Select / Drag
   - 2 Fingers: Right click (Context Menu)
   - 3 Fingers: Task View / All Tab Exposé window overview
   - Horizontal landscape auto-optimization on mobile devices!

Enjoy computing in the browser!
`,
    parentPath: '/Desktop',
    updatedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
  },
  {
    id: 'file-cloudflare-guide',
    name: 'Cloudflare_Worker_R1_Rules.txt',
    path: '/Desktop/Cloudflare_Worker_R1_Rules.txt',
    type: 'file',
    size: 890,
    mimeType: 'text/plain',
    content: `--- CLOUDFLARE WORKER & R1 FREE TIER QUOTA SPECIFICATION ---

Storage Rules & Guidelines:
- Maximum upload size per individual file: 20 MB (Enforced by AuraOS VFS)
- Files exceeding 20 MB will be rejected with an alert to preserve R1 bucket limits.
- R1 Free Tier limits: 10 GB/month stored data, 1,000,000 Class A operations.
- Cloudflare Workers Free Tier: 100,000 requests/day, 10ms CPU time per request.
- Web apps added via App Maker run through client-side sandbox iframe with zero backend compute overhead.
`,
    parentPath: '/Desktop',
    updatedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
  },
  {
    id: 'file-sample-pdf',
    name: 'AuraOS_Whitepaper.pdf',
    path: '/Desktop/AuraOS_Whitepaper.pdf',
    type: 'file',
    size: 245000,
    mimeType: 'application/pdf',
    content: 'sample_pdf_document',
    parentPath: '/Desktop',
    updatedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
  },
  {
    id: 'file-sample-img1',
    name: 'Cyberpunk_Neon.jpg',
    path: '/Desktop/Cyberpunk_Neon.jpg',
    type: 'file',
    size: 480000,
    mimeType: 'image/jpeg',
    content: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1920&q=80',
    parentPath: '/Desktop',
    updatedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
  },
  {
    id: 'file-sample-video',
    name: 'Cosmic_Orbit.mp4',
    path: '/Desktop/Cosmic_Orbit.mp4',
    type: 'file',
    size: 1450000,
    mimeType: 'video/mp4',
    content: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    parentPath: '/Desktop',
    updatedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
  },

  // Documents
  {
    id: 'file-notes',
    name: 'QuickNotes.txt',
    path: '/Documents/QuickNotes.txt',
    type: 'file',
    size: 340,
    mimeType: 'text/plain',
    content: `Meeting Notes:
- Review Web OS window snapping logic (1.5:0.5 ratio, 4 quadrants)
- Verify mobile 3-finger gesture for Task View
- Test Web App Maker URL injection and sandbox security
- Verify 20MB file upload ceiling in CloudDrive
`,
    parentPath: '/Documents',
    updatedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
  },
  {
    id: 'file-linux-help',
    name: 'Linux_Terminal_Guide.txt',
    path: '/Documents/Linux_Terminal_Guide.txt',
    type: 'file',
    size: 980,
    mimeType: 'text/plain',
    content: `AuraOS Linux Terminal Commands:
- help         : Display complete reference of available commands and their descriptions
- ls [-la]     : List directory contents
- cd <dir>     : Change directory (e.g. cd Desktop, cd .., cd ~)
- pwd          : Print current working directory
- cat <file>   : Output contents of a file
- touch <file> : Create an empty file
- mkdir <dir>  : Create a new directory
- rm <file>    : Remove a file or directory
- cp <src> <dst>: Copy file or folder
- mv <src> <dst>: Move or rename file/folder
- clear        : Clear terminal screen
- echo <text>  : Print text or echo into files
- ps           : List active processes & open windows
- kill <pid>   : Terminate an active window process
- calc <expr>  : Calculate mathematical expression
- neofetch     : Display system info & ASCII art
- quota        : View R1 storage quota (20MB max file limit)
- open <file>  : Open file in default GUI viewer
- theme <dark|light>: Switch terminal & OS theme
`,
    parentPath: '/Documents',
    updatedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
  },
  {
    id: 'file-spec-pdf',
    name: 'Architecture_Design.pdf',
    path: '/Documents/Architecture_Design.pdf',
    type: 'file',
    size: 312000,
    mimeType: 'application/pdf',
    content: 'sample_pdf_document_arch',
    parentPath: '/Documents',
    updatedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
  },

  // Pictures
  {
    id: 'pic-aurora',
    name: 'Aurora_Borealis.jpg',
    path: '/Pictures/Aurora_Borealis.jpg',
    type: 'file',
    size: 512000,
    mimeType: 'image/jpeg',
    content: 'https://images.unsplash.com/photo-1531366936337-7c912a4589a7?auto=format&fit=crop&w=1920&q=80',
    parentPath: '/Pictures',
    updatedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
  },
  {
    id: 'pic-mountains',
    name: 'Misty_Mountains.jpg',
    path: '/Pictures/Misty_Mountains.jpg',
    type: 'file',
    size: 620000,
    mimeType: 'image/jpeg',
    content: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1920&q=80',
    parentPath: '/Pictures',
    updatedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
  },
  {
    id: 'pic-darkspace',
    name: 'Deep_Cosmos.jpg',
    path: '/Pictures/Deep_Cosmos.jpg',
    type: 'file',
    size: 780000,
    mimeType: 'image/jpeg',
    content: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=1920&q=80',
    parentPath: '/Pictures',
    updatedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
  },

  // Videos
  {
    id: 'vid-nature',
    name: 'Nature_Cinematic.mp4',
    path: '/Videos/Nature_Cinematic.mp4',
    type: 'file',
    size: 2100000,
    mimeType: 'video/mp4',
    content: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    parentPath: '/Videos',
    updatedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
  }
];

class VFSService {
  private items: VFSItem[] = [];
  private listeners: Array<() => void> = [];
  private localClipboard: { action: 'copy' | 'cut'; item: VFSItem } | null = null;

  constructor() {
    this.load();
  }

  private load(): void {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const loaded: VFSItem[] = JSON.parse(saved);
        // Ensure default items exist
        const existingPaths = new Set(loaded.map((i) => i.path));
        let changed = false;
        DEFAULT_VFS_ITEMS.forEach((defItem) => {
          if (!existingPaths.has(defItem.path)) {
            loaded.push(defItem);
            changed = true;
          }
        });
        this.items = loaded;
        if (changed) {
          this.save();
        }
      } else {
        this.items = [...DEFAULT_VFS_ITEMS];
        this.save();
      }
    } catch (e) {
      console.warn('Failed to load VFS from localStorage, using defaults:', e);
      this.items = [...DEFAULT_VFS_ITEMS];
    }
  }

  private save(): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.items));
      this.notifyListeners();
    } catch (e) {
      console.error('Error saving VFS to localStorage:', e);
    }
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private notifyListeners(): void {
    this.listeners.forEach((listener) => listener());
  }

  public getAllItems(): VFSItem[] {
    return [...this.items];
  }

  public getItemsInDirectory(dirPath: string): VFSItem[] {
    const normalized = this.normalizePath(dirPath);
    return this.items.filter((item) => item.parentPath === normalized);
  }

  public getItemByPath(path: string): VFSItem | undefined {
    const normalized = this.normalizePath(path);
    return this.items.find((item) => item.path === normalized);
  }

  public getItemById(id: string): VFSItem | undefined {
    return this.items.find((item) => item.id === id);
  }

  public normalizePath(path: string): string {
    if (!path || path === '/' || path === '') return '/';
    let clean = path.replace(/\\/g, '/');
    if (!clean.startsWith('/')) clean = '/' + clean;
    if (clean.length > 1 && clean.endsWith('/')) {
      clean = clean.slice(0, -1);
    }
    return clean;
  }

  public getParentPath(path: string): string {
    const clean = this.normalizePath(path);
    if (clean === '/') return '/';
    const lastSlash = clean.lastIndexOf('/');
    if (lastSlash === 0) return '/';
    return clean.substring(0, lastSlash);
  }

  public createFolder(parentPath: string, folderName: string): { success: boolean; item?: VFSItem; error?: string } {
    const normalizedParent = this.normalizePath(parentPath);
    const cleanName = folderName.trim().replace(/[/\\?%*:|"<>]/g, '_');
    if (!cleanName) return { success: false, error: 'Invalid folder name' };

    const targetPath = normalizedParent === '/' ? `/${cleanName}` : `${normalizedParent}/${cleanName}`;

    if (this.getItemByPath(targetPath)) {
      return { success: false, error: 'A file or folder with that name already exists.' };
    }

    const newItem: VFSItem = {
      id: 'folder_' + Math.random().toString(36).substring(2, 10),
      name: cleanName,
      path: targetPath,
      type: 'folder',
      size: 0,
      mimeType: 'inode/directory',
      content: '',
      parentPath: normalizedParent,
      updatedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };

    this.items.push(newItem);
    this.save();
    return { success: true, item: newItem };
  }

  public createFile(
    parentPath: string,
    fileName: string,
    content: string = '',
    mimeType: string = 'text/plain',
    size?: number
  ): { success: boolean; item?: VFSItem; error?: string } {
    const normalizedParent = this.normalizePath(parentPath);
    const cleanName = fileName.trim().replace(/[/\\?%*:|"<>]/g, '_');
    if (!cleanName) return { success: false, error: 'Invalid file name' };

    const targetPath = normalizedParent === '/' ? `/${cleanName}` : `${normalizedParent}/${cleanName}`;
    const calculatedSize = size ?? new Blob([content]).size;

    // Check 20MB limit
    if (calculatedSize > MAX_R1_FILE_SIZE_BYTES) {
      return {
        success: false,
        error: `File size (${(calculatedSize / (1024 * 1024)).toFixed(1)}MB) exceeds the 20MB Cloudflare R1 free tier limit.`,
      };
    }

    const existingIndex = this.items.findIndex((item) => item.path === targetPath);
    if (existingIndex >= 0) {
      // Overwrite file
      const updated: VFSItem = {
        ...this.items[existingIndex],
        content,
        size: calculatedSize,
        mimeType,
        updatedAt: new Date().toISOString(),
      };
      this.items[existingIndex] = updated;
      this.save();
      return { success: true, item: updated };
    }

    const newItem: VFSItem = {
      id: 'file_' + Math.random().toString(36).substring(2, 10),
      name: cleanName,
      path: targetPath,
      type: 'file',
      size: calculatedSize,
      mimeType,
      content,
      parentPath: normalizedParent,
      updatedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };

    this.items.push(newItem);
    this.save();
    return { success: true, item: newItem };
  }

  public updateFileContent(path: string, content: string): boolean {
    const item = this.getItemByPath(path);
    if (!item || item.type !== 'file') return false;

    const newSize = new Blob([content]).size;
    if (newSize > MAX_R1_FILE_SIZE_BYTES) {
      return false;
    }

    item.content = content;
    item.size = newSize;
    item.updatedAt = new Date().toISOString();
    this.save();
    return true;
  }

  public deleteItem(path: string): boolean {
    const normalized = this.normalizePath(path);
    const item = this.getItemByPath(normalized);
    if (!item) return false;
    if (item.isSystem && item.parentPath === '/') {
      return false; // Prevent deleting root system folders
    }

    // Delete item and all descendants if folder
    this.items = this.items.filter((i) => i.path !== normalized && !i.path.startsWith(normalized + '/'));
    this.save();
    return true;
  }

  public renameItem(path: string, newName: string): { success: boolean; item?: VFSItem; error?: string } {
    const normalized = this.normalizePath(path);
    const item = this.getItemByPath(normalized);
    if (!item) return { success: false, error: 'Item not found' };
    if (item.isSystem && item.parentPath === '/') {
      return { success: false, error: 'Cannot rename root system folders' };
    }

    const cleanName = newName.trim().replace(/[/\\?%*:|"<>]/g, '_');
    if (!cleanName) return { success: false, error: 'Invalid name' };

    const parent = item.parentPath;
    const newPath = parent === '/' ? `/${cleanName}` : `${parent}/${cleanName}`;

    if (this.getItemByPath(newPath)) {
      return { success: false, error: 'An item with this name already exists' };
    }

    const oldPath = item.path;
    item.name = cleanName;
    item.path = newPath;
    item.updatedAt = new Date().toISOString();

    // If folder, update all descendant paths
    if (item.type === 'folder') {
      this.items.forEach((child) => {
        if (child.path.startsWith(oldPath + '/')) {
          child.path = newPath + child.path.substring(oldPath.length);
          if (child.parentPath === oldPath) {
            child.parentPath = newPath;
          } else if (child.parentPath.startsWith(oldPath + '/')) {
            child.parentPath = newPath + child.parentPath.substring(oldPath.length);
          }
        }
      });
    }

    this.save();
    return { success: true, item };
  }

  public moveItem(srcPath: string, destParentPath: string): { success: boolean; item?: VFSItem; error?: string } {
    const srcNorm = this.normalizePath(srcPath);
    const destNorm = this.normalizePath(destParentPath);
    const item = this.getItemByPath(srcNorm);
    if (!item) return { success: false, error: 'Source item not found' };

    if (item.isSystem && item.parentPath === '/') {
      return { success: false, error: 'Cannot move root system folders' };
    }

    if (srcNorm === destNorm || destNorm.startsWith(srcNorm + '/')) {
      return { success: false, error: 'Cannot move a folder into itself' };
    }

    const newPath = destNorm === '/' ? `/${item.name}` : `${destNorm}/${item.name}`;
    if (this.getItemByPath(newPath)) {
      return { success: false, error: 'An item with this name already exists in target destination' };
    }

    const oldPath = item.path;
    item.parentPath = destNorm;
    item.path = newPath;
    item.updatedAt = new Date().toISOString();

    if (item.type === 'folder') {
      this.items.forEach((child) => {
        if (child.path.startsWith(oldPath + '/')) {
          child.path = newPath + child.path.substring(oldPath.length);
          if (child.parentPath === oldPath) {
            child.parentPath = newPath;
          } else if (child.parentPath.startsWith(oldPath + '/')) {
            child.parentPath = newPath + child.parentPath.substring(oldPath.length);
          }
        }
      });
    }

    this.save();
    return { success: true, item };
  }

  public async uploadBrowserFile(
    file: File,
    destParentPath: string = '/Desktop'
  ): Promise<{ success: boolean; item?: VFSItem; error?: string }> {
    // Strict 20MB check
    if (file.size > MAX_R1_FILE_SIZE_BYTES) {
      return {
        success: false,
        error: `File "${file.name}" (${(file.size / (1024 * 1024)).toFixed(1)}MB) exceeds the 20MB upload limit!`,
      };
    }

    return new Promise((resolve) => {
      const reader = new FileReader();

      if (file.type.startsWith('text/') || file.name.endsWith('.txt') || file.name.endsWith('.json') || file.name.endsWith('.md') || file.name.endsWith('.js') || file.name.endsWith('.ts') || file.name.endsWith('.html') || file.name.endsWith('.css')) {
        reader.readAsText(file);
        reader.onload = () => {
          const content = (reader.result as string) || '';
          const result = this.createFile(destParentPath, file.name, content, file.type || 'text/plain', file.size);
          resolve(result);
        };
      } else {
        // Read as data URL for images, media, binary
        reader.readAsDataURL(file);
        reader.onload = () => {
          const content = (reader.result as string) || '';
          const result = this.createFile(destParentPath, file.name, content, file.type || 'application/octet-stream', file.size);
          resolve(result);
        };
      }

      reader.onerror = () => {
        resolve({ success: false, error: 'Failed to read uploaded file' });
      };
    });
  }

  // Window Scoped Clipboard Operations
  public setClipboard(action: 'copy' | 'cut', item: VFSItem): void {
    this.localClipboard = { action, item: { ...item } };
  }

  public getClipboard(): { action: 'copy' | 'cut'; item: VFSItem } | null {
    return this.localClipboard;
  }

  public pasteClipboard(destParentPath: string): { success: boolean; item?: VFSItem; error?: string } {
    if (!this.localClipboard) return { success: false, error: 'Clipboard is empty' };
    const { action, item } = this.localClipboard;

    if (action === 'cut') {
      const moveRes = this.moveItem(item.path, destParentPath);
      this.localClipboard = null;
      return moveRes;
    } else {
      // Copy
      let baseName = item.name;
      let ext = '';
      if (item.type === 'file' && baseName.includes('.')) {
        const lastDot = baseName.lastIndexOf('.');
        ext = baseName.substring(lastDot);
        baseName = baseName.substring(0, lastDot);
      }

      let copyName = item.type === 'file' ? `${baseName}_copy${ext}` : `${item.name}_copy`;
      let counter = 1;
      const targetParentNorm = this.normalizePath(destParentPath);

      while (this.getItemByPath(targetParentNorm === '/' ? `/${copyName}` : `${targetParentNorm}/${copyName}`)) {
        counter++;
        copyName = item.type === 'file' ? `${baseName}_copy_${counter}${ext}` : `${item.name}_copy_${counter}`;
      }

      if (item.type === 'folder') {
        const created = this.createFolder(destParentPath, copyName);
        return created;
      } else {
        const created = this.createFile(destParentPath, copyName, item.content, item.mimeType, item.size);
        return created;
      }
    }
  }

  public getStorageStats(): { usedBytes: number; maxBytes: number; percentage: number; fileCount: number } {
    let usedBytes = 0;
    let fileCount = 0;
    this.items.forEach((item) => {
      if (item.type === 'file') {
        usedBytes += item.size || 0;
        fileCount++;
      }
    });

    const totalAllowedBytes = 100 * 1024 * 1024; // 100MB virtual sandbox limit
    const percentage = Math.min(100, Math.round((usedBytes / totalAllowedBytes) * 100));

    return {
      usedBytes,
      maxBytes: totalAllowedBytes,
      percentage,
      fileCount,
    };
  }

  public resetToDefaults(): void {
    this.items = [...DEFAULT_VFS_ITEMS];
    this.save();
  }
}

export const vfs = new VFSService();
