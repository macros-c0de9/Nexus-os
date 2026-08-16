/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { OSProvider } from './context/OSContext';
import { Desktop } from './components/desktop/Desktop';
import { WindowManager } from './components/window/WindowManager';
import { Taskbar } from './components/taskbar/Taskbar';
import { StartMenu } from './components/taskbar/StartMenu';
import { TaskView } from './components/window/TaskView';
import { ContextMenu } from './components/common/ContextMenu';
import { GestureOverlay } from './components/common/GestureOverlay';
import { OrientationNotice } from './components/common/OrientationNotice';
import { NotificationToast } from './components/common/NotificationToast';
import { PWAInstallBanner } from './components/common/PWAInstallBanner';

function DesktopWorkspace() {
  return (
    <div
      id="aura-os-root"
      className="relative w-screen h-screen overflow-hidden bg-slate-950 text-slate-100 font-sans select-none antialiased"
    >
      {/* Mobile Horizontal Auto-Orientation Banner */}
      <OrientationNotice />

      {/* PWA Smart Install Banner & Device Guides (Desktop, Android, iOS Safari) */}
      <PWAInstallBanner />

      {/* Touch & Multi-Finger Gesture Handler (1-finger click, 2-finger context menu, 3-finger task view) */}
      <GestureOverlay>
        {/* Desktop Surface with Wallpapers and Icons */}
        <Desktop />

        {/* Multi-Window Manager (Floating, Snapping, Draggable, Resizable Windows) */}
        <WindowManager />

        {/* Start Menu Popup */}
        <StartMenu />

        {/* Windows Taskbar & System Tray */}
        <Taskbar />

        {/* Task View / All Tabs Exposé Overlay */}
        <TaskView />

        {/* Global Context Menus */}
        <ContextMenu />

        {/* Toast Notifications Stack */}
        <NotificationToast />
      </GestureOverlay>
    </div>
  );
}

export default function App() {
  return (
    <OSProvider>
      <DesktopWorkspace />
    </OSProvider>
  );
}
