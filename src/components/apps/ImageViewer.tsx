import React, { useState, useEffect } from 'react';
import { useOS } from '../../context/OSContext';
import { vfs } from '../../services/vfs';
import { VFSItem } from '../../types/os';
import {
  ZoomIn,
  ZoomOut,
  RotateCw,
  FlipHorizontal,
  Wallpaper,
  Maximize2,
  ChevronLeft,
  ChevronRight,
  Info,
  Check
} from 'lucide-react';

interface ImageViewerProps {
  filePath?: string;
}

export const ImageViewer: React.FC<ImageViewerProps> = ({ filePath }) => {
  const { updateSettings, addNotification } = useOS();
  const [imageItems, setImageItems] = useState<VFSItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [zoom, setZoom] = useState(100);
  const [rotation, setRotation] = useState(0);
  const [flipH, setFlipH] = useState(false);
  const [isWallpaperSet, setIsWallpaperSet] = useState(false);

  useEffect(() => {
    // Find all images across VFS
    const all = vfs.getAllItems().filter((item) => {
      if (item.type !== 'file') return false;
      const lower = item.name.toLowerCase();
      return (
        lower.endsWith('.jpg') ||
        lower.endsWith('.jpeg') ||
        lower.endsWith('.png') ||
        lower.endsWith('.webp') ||
        lower.endsWith('.svg') ||
        lower.endsWith('.gif') ||
        item.content.startsWith('http') ||
        item.content.startsWith('data:image')
      );
    });

    setImageItems(all);

    if (filePath) {
      const idx = all.findIndex((i) => i.path === filePath);
      if (idx !== -1) {
        setCurrentIndex(idx);
      }
    }
  }, [filePath]);

  const currentItem = imageItems[currentIndex];

  const handleNext = () => {
    if (imageItems.length === 0) return;
    setCurrentIndex((prev) => (prev + 1) % imageItems.length);
    setRotation(0);
    setZoom(100);
    setIsWallpaperSet(false);
  };

  const handlePrev = () => {
    if (imageItems.length === 0) return;
    setCurrentIndex((prev) => (prev - 1 + imageItems.length) % imageItems.length);
    setRotation(0);
    setZoom(100);
    setIsWallpaperSet(false);
  };

  const handleSetWallpaper = () => {
    if (!currentItem) return;
    const url = currentItem.content;
    if (url) {
      updateSettings({ wallpaperUrl: url });
      setIsWallpaperSet(true);
      addNotification('Wallpaper Updated', `Desktop wallpaper set to "${currentItem.name}"`, 'success');
      setTimeout(() => setIsWallpaperSet(false), 3000);
    }
  };

  if (!currentItem) {
    return (
      <div className="h-full flex items-center justify-center bg-slate-950 text-slate-500 text-xs">
        No images found. Upload or select an image file to view.
      </div>
    );
  }

  return (
    <div id="image-viewer-container" className="h-full flex flex-col bg-slate-950 text-slate-100 select-none overflow-hidden">
      {/* Top Toolbar */}
      <div className="p-2 border-b border-slate-800 bg-slate-900/90 flex flex-wrap items-center justify-between gap-2 flex-shrink-0">
        <div className="flex items-center gap-1.5">
          <button
            onClick={handlePrev}
            className="p-1.5 rounded-lg text-slate-300 hover:bg-slate-800"
            title="Previous Image"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-xs text-slate-300 font-mono">
            {currentIndex + 1} / {imageItems.length}
          </span>
          <button
            onClick={handleNext}
            className="p-1.5 rounded-lg text-slate-300 hover:bg-slate-800"
            title="Next Image"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
          <span className="text-xs text-slate-400 font-medium ml-2 truncate max-w-[150px] sm:max-w-[220px]">
            {currentItem.name}
          </span>
        </div>

        {/* Transformation & Wallpaper Action */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setZoom((z) => Math.max(25, z - 20))}
            className="p-1.5 rounded-lg text-slate-300 hover:bg-slate-800"
            title="Zoom Out"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <span className="text-xs text-slate-400 font-mono w-10 text-center">{zoom}%</span>
          <button
            onClick={() => setZoom((z) => Math.min(300, z + 20))}
            className="p-1.5 rounded-lg text-slate-300 hover:bg-slate-800"
            title="Zoom In"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => setRotation((r) => (r + 90) % 360)}
            className="p-1.5 rounded-lg text-slate-300 hover:bg-slate-800 ml-1"
            title="Rotate 90°"
          >
            <RotateCw className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => setFlipH((f) => !f)}
            className="p-1.5 rounded-lg text-slate-300 hover:bg-slate-800"
            title="Flip Horizontal"
          >
            <FlipHorizontal className="w-3.5 h-3.5" />
          </button>

          <button
            id="btn-set-as-wallpaper"
            onClick={handleSetWallpaper}
            className={`px-2.5 py-1.5 rounded-lg text-xs flex items-center gap-1.5 transition-colors font-medium ml-2 ${
              isWallpaperSet
                ? 'bg-emerald-600 text-white'
                : 'bg-blue-600 hover:bg-blue-500 text-white shadow'
            }`}
            title="Set as Desktop Wallpaper"
          >
            {isWallpaperSet ? <Check className="w-3.5 h-3.5" /> : <Wallpaper className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{isWallpaperSet ? 'Wallpaper Set' : 'Set as Wallpaper'}</span>
          </button>
        </div>
      </div>

      {/* Main Image Canvas View */}
      <div className="flex-1 bg-slate-950 flex items-center justify-center p-4 overflow-hidden relative">
        <img
          src={currentItem.content}
          alt={currentItem.name}
          style={{
            transform: `scale(${zoom / 100}) rotate(${rotation}deg) scaleX(${flipH ? -1 : 1})`,
            transition: 'transform 0.15s ease-out',
            maxHeight: '100%',
            maxWidth: '100%',
          }}
          className="object-contain rounded-lg shadow-2xl"
        />
      </div>

      {/* Thumbnail Strip */}
      <div className="p-2 border-t border-slate-800 bg-slate-900/90 flex items-center gap-2 overflow-x-auto flex-shrink-0">
        {imageItems.map((item, idx) => (
          <button
            key={item.id}
            onClick={() => {
              setCurrentIndex(idx);
              setRotation(0);
              setZoom(100);
            }}
            className={`w-12 h-10 rounded-md overflow-hidden border-2 flex-shrink-0 transition-all ${
              idx === currentIndex
                ? 'border-blue-500 ring-2 ring-blue-500/40 scale-105'
                : 'border-transparent opacity-60 hover:opacity-100'
            }`}
          >
            <img src={item.content} alt="" className="w-full h-full object-cover" />
          </button>
        ))}
      </div>
    </div>
  );
};
