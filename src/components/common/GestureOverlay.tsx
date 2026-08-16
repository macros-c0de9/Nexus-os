import React, { useEffect, useRef } from 'react';
import { useOS } from '../../context/OSContext';

export const GestureOverlay: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  const {
    openContextMenu,
    toggleTaskView,
    settings,
    openApp,
  } = useOS();

  const touchCountRef = useRef<number>(0);
  const touchStartPos = useRef<{ x: number; y: number }[]>([]);
  const longPressTimer = useRef<any>(null);

  useEffect(() => {
    if (!settings.deviceGesturesEnabled) return;

    const handleTouchStart = (e: TouchEvent) => {
      touchCountRef.current = e.touches.length;
      touchStartPos.current = Array.from(e.touches).map((t) => ({ x: t.clientX, y: t.clientY }));

      // 2-finger tap triggers context menu
      if (e.touches.length === 2) {
        const t1 = e.touches[0];
        const t2 = e.touches[1];
        const midX = (t1.clientX + t2.clientX) / 2;
        const midY = (t1.clientY + t2.clientY) / 2;

        openContextMenu(
          midX,
          midY,
          [
            { id: 'app-maker', label: 'Create Web App (App Maker)', icon: 'PlusSquare', onClick: () => openApp('app-maker') },
            { id: 'file-exp', label: 'File Explorer', icon: 'FolderKanban', onClick: () => openApp('file-explorer') },
            { id: 'terminal', label: 'Linux Terminal', icon: 'Terminal', onClick: () => openApp('terminal') },
            { id: 'task-view', label: 'Task View (All Tabs)', icon: 'Layers', onClick: () => toggleTaskView() },
            { id: 'div1', label: '', divider: true },
            { id: 'settings', label: 'OS Settings', icon: 'Settings', onClick: () => openApp('settings') },
          ],
          'desktop'
        );
      } else if (e.touches.length === 3) {
        // 3-Finger Gesture: Toggle Task View (All Tab View)
        toggleTaskView();
      }
    };

    const handleTouchEnd = () => {
      touchCountRef.current = 0;
      touchStartPos.current = [];
      if (longPressTimer.current) {
        clearTimeout(longPressTimer.current);
      }
    };

    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchend', handleTouchEnd);
      if (longPressTimer.current) {
        clearTimeout(longPressTimer.current);
      }
    };
  }, [settings.deviceGesturesEnabled, openContextMenu, toggleTaskView, openApp]);

  return <>{children}</>;
};
