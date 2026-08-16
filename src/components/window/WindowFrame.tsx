import React, { useState, useRef, useEffect, ReactNode } from 'react';
import { useOS } from '../../context/OSContext';
import { WindowState, SnapLayoutType } from '../../types/os';
import { DynamicIcon } from '../common/DynamicIcon';
import {
  X,
  Minus,
  Square,
  Copy,
  Maximize2,
  Minimize2,
  Grid,
  Columns,
  Layout,
  Move
} from 'lucide-react';

interface WindowFrameProps {
  window: WindowState;
  children: ReactNode;
}

export const WindowFrame: React.FC<WindowFrameProps> = ({ window: win, children }) => {
  const {
    activeWindowId,
    focusWindow,
    closeWindow,
    minimizeWindow,
    maximizeWindow,
    snapWindow,
    updateWindowBounds,
  } = useOS();

  const isActive = activeWindowId === win.id;
  const isDragging = useRef(false);
  const isResizing = useRef<string | null>(null);
  const dragStartPos = useRef({ x: 0, y: 0 });
  const initialWinBounds = useRef({ x: win.x, y: win.y, width: win.width, height: win.height });
  const [showSnapMenu, setShowSnapMenu] = useState(false);
  const snapMenuTimer = useRef<any>(null);

  // Calculate snap geometry
  const getSnapStyles = (): React.CSSProperties => {
    if (win.isMinimized) {
      return { display: 'none' };
    }

    const screenW = typeof window !== 'undefined' ? window.innerWidth : 1280;
    const taskbarHeight = 48;
    const screenH = (typeof window !== 'undefined' ? window.innerHeight : 800) - taskbarHeight;

    if (win.isMaximized || win.snapState === 'maximize') {
      return {
        transform: 'none',
        left: 0,
        top: 0,
        width: `${screenW}px`,
        height: `${screenH}px`,
        zIndex: win.zIndex,
        borderRadius: 0,
      };
    }

    if (win.snapState === 'left-half') {
      return {
        transform: 'none',
        left: 0,
        top: 0,
        width: `${Math.floor(screenW * 0.5)}px`,
        height: `${screenH}px`,
        zIndex: win.zIndex,
        borderRadius: 0,
      };
    }

    if (win.snapState === 'right-half') {
      return {
        transform: 'none',
        left: `${Math.floor(screenW * 0.5)}px`,
        top: 0,
        width: `${Math.ceil(screenW * 0.5)}px`,
        height: `${screenH}px`,
        zIndex: win.zIndex,
        borderRadius: 0,
      };
    }

    // 1.5 : 0.5 Ratio Split (60% / 40%)
    if (win.snapState === 'left-wide') {
      return {
        transform: 'none',
        left: 0,
        top: 0,
        width: `${Math.floor(screenW * 0.6)}px`,
        height: `${screenH}px`,
        zIndex: win.zIndex,
        borderRadius: 0,
      };
    }

    if (win.snapState === 'right-slim') {
      return {
        transform: 'none',
        left: `${Math.floor(screenW * 0.6)}px`,
        top: 0,
        width: `${Math.ceil(screenW * 0.4)}px`,
        height: `${screenH}px`,
        zIndex: win.zIndex,
        borderRadius: 0,
      };
    }

    // 4-Quadrant 2x2 Layout
    const halfH = Math.floor(screenH / 2);
    const halfW = Math.floor(screenW / 2);

    if (win.snapState === 'top-left') {
      return {
        transform: 'none',
        left: 0,
        top: 0,
        width: `${halfW}px`,
        height: `${halfH}px`,
        zIndex: win.zIndex,
        borderRadius: 0,
      };
    }
    if (win.snapState === 'top-right') {
      return {
        transform: 'none',
        left: `${halfW}px`,
        top: 0,
        width: `${Math.ceil(screenW - halfW)}px`,
        height: `${halfH}px`,
        zIndex: win.zIndex,
        borderRadius: 0,
      };
    }
    if (win.snapState === 'bottom-left') {
      return {
        transform: 'none',
        left: 0,
        top: `${halfH}px`,
        width: `${halfW}px`,
        height: `${Math.ceil(screenH - halfH)}px`,
        zIndex: win.zIndex,
        borderRadius: 0,
      };
    }
    if (win.snapState === 'bottom-right') {
      return {
        transform: 'none',
        left: `${halfW}px`,
        top: `${halfH}px`,
        width: `${Math.ceil(screenW - halfW)}px`,
        height: `${Math.ceil(screenH - halfH)}px`,
        zIndex: win.zIndex,
        borderRadius: 0,
      };
    }

    // Normal Floating Window
    return {
      transform: 'none',
      left: `${win.x}px`,
      top: `${win.y}px`,
      width: `${win.width}px`,
      height: `${win.height}px`,
      zIndex: win.zIndex,
    };
  };

  // Drag Titlebar handlers
  const handleTitlebarPointerDown = (e: React.PointerEvent) => {
    // Only allow dragging on titlebar (not controls)
    if ((e.target as HTMLElement).closest('.window-control-btn')) return;

    focusWindow(win.id);
    isDragging.current = true;
    dragStartPos.current = { x: e.clientX, y: e.clientY };
    initialWinBounds.current = { x: win.x, y: win.y, width: win.width, height: win.height };

    // Prevent text selection
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (isDragging.current) {
      const dx = e.clientX - dragStartPos.current.x;
      const dy = e.clientY - dragStartPos.current.y;

      const screenW = typeof window !== 'undefined' ? window.innerWidth : 1280;
      const screenH = (typeof window !== 'undefined' ? window.innerHeight : 800) - 48;

      const nextX = Math.max(0, Math.min(screenW - 100, initialWinBounds.current.x + dx));
      const nextY = Math.max(0, Math.min(screenH - 40, initialWinBounds.current.y + dy));

      updateWindowBounds(win.id, { x: nextX, y: nextY });
    } else if (isResizing.current) {
      const dir = isResizing.current;
      const dx = e.clientX - dragStartPos.current.x;
      const dy = e.clientY - dragStartPos.current.y;

      let nextX = initialWinBounds.current.x;
      let nextY = initialWinBounds.current.y;
      let nextW = initialWinBounds.current.width;
      let nextH = initialWinBounds.current.height;

      if (dir.includes('e')) nextW = Math.max(win.minWidth, initialWinBounds.current.width + dx);
      if (dir.includes('s')) nextH = Math.max(win.minHeight, initialWinBounds.current.height + dy);
      if (dir.includes('w')) {
        const potentialW = initialWinBounds.current.width - dx;
        if (potentialW >= win.minWidth) {
          nextW = potentialW;
          nextX = initialWinBounds.current.x + dx;
        }
      }
      if (dir.includes('n')) {
        const potentialH = initialWinBounds.current.height - dy;
        if (potentialH >= win.minHeight) {
          nextH = potentialH;
          nextY = initialWinBounds.current.y + dy;
        }
      }

      updateWindowBounds(win.id, { x: nextX, y: nextY, width: nextW, height: nextH });
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (isDragging.current) {
      isDragging.current = false;
      try {
        (e.target as HTMLElement).releasePointerCapture(e.pointerId);
      } catch {}
    }
    if (isResizing.current) {
      isResizing.current = null;
    }
  };

  const startResize = (dir: string, e: React.PointerEvent) => {
    e.stopPropagation();
    focusWindow(win.id);
    isResizing.current = dir;
    dragStartPos.current = { x: e.clientX, y: e.clientY };
    initialWinBounds.current = { x: win.x, y: win.y, width: win.width, height: win.height };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const isSnappedOrMaximized = win.isMaximized || win.snapState !== 'none';

  return (
    <div
      id={`window-frame-${win.id}`}
      style={getSnapStyles()}
      onMouseDown={() => focusWindow(win.id)}
      onTouchStart={() => focusWindow(win.id)}
      className={`fixed flex flex-col overflow-hidden transition-shadow duration-200 select-none ${
        isSnappedOrMaximized ? 'rounded-none' : 'rounded-2xl shadow-2xl'
      } ${
        isActive
          ? 'ring-1 ring-blue-500/60 shadow-blue-950/40'
          : 'ring-1 ring-slate-700/50 opacity-95'
      }`}
    >
      {/* Titlebar Window Manager Header */}
      <div
        id={`titlebar-${win.id}`}
        onPointerDown={handleTitlebarPointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onDoubleClick={() => maximizeWindow(win.id)}
        className={`h-10 px-3 flex items-center justify-between gap-2 border-b flex-shrink-0 cursor-default select-none ${
          isActive
            ? 'bg-slate-900 border-slate-700/80 text-white'
            : 'bg-slate-950/90 border-slate-800 text-slate-400'
        }`}
      >
        {/* Left: Window Icon & Title */}
        <div className="flex items-center gap-2 min-w-0 flex-1 pointer-events-none">
          <div className="w-4 h-4 flex items-center justify-center flex-shrink-0">
            <DynamicIcon
              name={win.icon}
              iconType={win.iconType}
              size={15}
              className={isActive ? 'text-blue-400' : 'text-slate-500'}
            />
          </div>
          <span className="text-xs font-semibold truncate tracking-tight">
            {win.title}
          </span>
        </div>

        {/* Right: Window Controls Bar */}
        <div className="flex items-center gap-1 flex-shrink-0">
          {/* Minimize Button */}
          <button
            id={`btn-minimize-${win.id}`}
            onClick={(e) => {
              e.stopPropagation();
              minimizeWindow(win.id);
            }}
            className="window-control-btn w-8 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title="Minimize"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>

          {/* Maximize / Restore & Snap Layout Dropdown */}
          <div
            className="relative"
            onMouseEnter={() => {
              snapMenuTimer.current = setTimeout(() => setShowSnapMenu(true), 250);
            }}
            onMouseLeave={() => {
              if (snapMenuTimer.current) clearTimeout(snapMenuTimer.current);
              setShowSnapMenu(false);
            }}
          >
            <button
              id={`btn-maximize-${win.id}`}
              onClick={(e) => {
                e.stopPropagation();
                maximizeWindow(win.id);
              }}
              className="window-control-btn w-8 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title={win.isMaximized ? 'Restore' : 'Maximize'}
            >
              {win.isMaximized ? <Copy className="w-3 h-3 rotate-180" /> : <Square className="w-3 h-3" />}
            </button>

            {/* Windows 11-style Snap Layout Menu on Hover */}
            {showSnapMenu && (
              <div className="absolute right-0 top-8 z-50 w-56 p-2 bg-slate-900/95 border border-slate-700/80 rounded-xl shadow-2xl backdrop-blur-xl animate-in fade-in zoom-in-95 space-y-2">
                <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400 px-1">
                  Snap Window Layout
                </p>

                <div className="grid grid-cols-2 gap-1.5">
                  {/* Snap 50/50 Dual Left & Right */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      snapWindow(win.id, 'left-half');
                      setShowSnapMenu(false);
                    }}
                    className="p-1.5 bg-slate-950/80 hover:bg-blue-600/30 border border-slate-800 hover:border-blue-500 rounded-lg flex gap-1 h-12 transition-all"
                    title="Snap 50% Left"
                  >
                    <div className="w-1/2 h-full bg-blue-500/40 rounded-sm" />
                    <div className="w-1/2 h-full bg-slate-800/40 rounded-sm" />
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      snapWindow(win.id, 'right-half');
                      setShowSnapMenu(false);
                    }}
                    className="p-1.5 bg-slate-950/80 hover:bg-blue-600/30 border border-slate-800 hover:border-blue-500 rounded-lg flex gap-1 h-12 transition-all"
                    title="Snap 50% Right"
                  >
                    <div className="w-1/2 h-full bg-slate-800/40 rounded-sm" />
                    <div className="w-1/2 h-full bg-blue-500/40 rounded-sm" />
                  </button>

                  {/* Snap 1.5 : 0.5 Ratio Split (60% / 40%) */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      snapWindow(win.id, 'left-wide');
                      setShowSnapMenu(false);
                    }}
                    className="p-1.5 bg-slate-950/80 hover:bg-indigo-600/30 border border-slate-800 hover:border-indigo-500 rounded-lg flex gap-1 h-12 transition-all"
                    title="Snap Wide 1.5 (60% Left)"
                  >
                    <div className="w-[65%] h-full bg-indigo-500/50 rounded-sm" />
                    <div className="w-[35%] h-full bg-slate-800/40 rounded-sm" />
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      snapWindow(win.id, 'right-slim');
                      setShowSnapMenu(false);
                    }}
                    className="p-1.5 bg-slate-950/80 hover:bg-indigo-600/30 border border-slate-800 hover:border-indigo-500 rounded-lg flex gap-1 h-12 transition-all"
                    title="Snap Slim 0.5 (40% Right)"
                  >
                    <div className="w-[35%] h-full bg-slate-800/40 rounded-sm" />
                    <div className="w-[65%] h-full bg-indigo-500/50 rounded-sm" />
                  </button>

                  {/* 4 Quadrants (Top-Left / Bottom-Right) */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      snapWindow(win.id, 'top-left');
                      setShowSnapMenu(false);
                    }}
                    className="p-1.5 bg-slate-950/80 hover:bg-emerald-600/30 border border-slate-800 hover:border-emerald-500 rounded-lg grid grid-cols-2 gap-1 h-12 transition-all"
                    title="Top-Left Quadrant"
                  >
                    <div className="bg-emerald-500/50 rounded-sm" />
                    <div className="bg-slate-800/40 rounded-sm" />
                    <div className="bg-slate-800/40 rounded-sm" />
                    <div className="bg-slate-800/40 rounded-sm" />
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      snapWindow(win.id, 'maximize');
                      setShowSnapMenu(false);
                    }}
                    className="p-1.5 bg-slate-950/80 hover:bg-blue-600/30 border border-slate-800 hover:border-blue-500 rounded-lg flex h-12 transition-all"
                    title="Full Maximize"
                  >
                    <div className="w-full h-full bg-blue-500/40 rounded-sm" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Close Button */}
          <button
            id={`btn-close-${win.id}`}
            onClick={(e) => {
              e.stopPropagation();
              closeWindow(win.id);
            }}
            className="window-control-btn w-8 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:text-white hover:bg-rose-600 transition-colors"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Window Body Container */}
      <div className="flex-1 overflow-hidden relative bg-slate-950">
        {children}
      </div>

      {/* 8-Directional Resize Edge Handles (Disabled if maximized or snapped) */}
      {!isSnappedOrMaximized && (
        <>
          <div
            onPointerDown={(e) => startResize('n', e)}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            className="absolute top-0 left-2 right-2 h-1.5 cursor-n-resize"
          />
          <div
            onPointerDown={(e) => startResize('s', e)}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            className="absolute bottom-0 left-2 right-2 h-1.5 cursor-s-resize"
          />
          <div
            onPointerDown={(e) => startResize('w', e)}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            className="absolute top-2 bottom-2 left-0 w-1.5 cursor-w-resize"
          />
          <div
            onPointerDown={(e) => startResize('e', e)}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            className="absolute top-2 bottom-2 right-0 w-1.5 cursor-e-resize"
          />

          <div
            onPointerDown={(e) => startResize('nw', e)}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            className="absolute top-0 left-0 w-3 h-3 cursor-nw-resize z-10"
          />
          <div
            onPointerDown={(e) => startResize('ne', e)}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            className="absolute top-0 right-0 w-3 h-3 cursor-ne-resize z-10"
          />
          <div
            onPointerDown={(e) => startResize('sw', e)}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            className="absolute bottom-0 left-0 w-3 h-3 cursor-sw-resize z-10"
          />
          <div
            onPointerDown={(e) => startResize('se', e)}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            className="absolute bottom-0 right-0 w-3 h-3 cursor-se-resize z-10"
          />
        </>
      )}
    </div>
  );
};
