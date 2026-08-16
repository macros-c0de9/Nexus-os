import React from 'react';
import { useOS } from '../../context/OSContext';
import { WindowFrame } from './WindowFrame';
import { AppMaker } from '../apps/AppMaker';
import { FileExplorer } from '../apps/FileExplorer';
import { LinuxTerminal } from '../apps/LinuxTerminal';
import { TextEditor } from '../apps/TextEditor';
import { PDFViewer } from '../apps/PDFViewer';
import { ImageViewer } from '../apps/ImageViewer';
import { MediaPlayer } from '../apps/MediaPlayer';
import { WebBrowser } from '../apps/WebBrowser';
import { SettingsApp } from '../apps/SettingsApp';
import { TaskManager } from '../apps/TaskManager';
import { Calculator } from '../apps/Calculator';

export const WindowManager: React.FC = () => {
  const { windows, getAppDefinition } = useOS();

  const renderAppContent = (win: (typeof windows)[0]) => {
    // Check if it is a custom web app created via App Maker
    const appDef = getAppDefinition(win.appId);
    if (appDef?.isCustomApp && !win.data?.filePath) {
      return <WebBrowser initialUrl={win.data?.url || appDef?.customUrl} appTitle={win.title} />;
    }

    switch (win.appId) {
      case 'app-maker':
        return <AppMaker />;
      case 'file-explorer':
        return <FileExplorer initialPath={win.data?.initialPath} />;
      case 'terminal':
        return (
          <LinuxTerminal
            initialPath={win.data?.initialPath}
            initialCommand={win.data?.initialCommand}
          />
        );
      case 'text-editor':
        return <TextEditor filePath={win.data?.filePath} />;
      case 'pdf-viewer':
        return <PDFViewer filePath={win.data?.filePath} />;
      case 'image-viewer':
        return <ImageViewer filePath={win.data?.filePath} />;
      case 'media-player':
        return <MediaPlayer filePath={win.data?.filePath} />;
      case 'browser':
        return (
          <WebBrowser
            initialUrl={win.data?.url}
            filePath={win.data?.filePath}
            appTitle={win.title}
          />
        );
      case 'settings':
        return <SettingsApp />;
      case 'task-manager':
        return <TaskManager />;
      case 'calculator':
        return <Calculator />;
      default:
        return (
          <div className="p-6 text-center text-slate-400 text-xs">
            Unknown application: {win.appId}
          </div>
        );
    }
  };

  return (
    <div id="os-window-manager-layer" className="absolute inset-0 pointer-events-none">
      {windows.map((win) => (
        <div key={win.id} className="pointer-events-auto">
          <WindowFrame window={win}>
            {renderAppContent(win)}
          </WindowFrame>
        </div>
      ))}
    </div>
  );
};
