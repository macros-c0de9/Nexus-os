import React from 'react';
import { DynamicIcon } from '../common/DynamicIcon';
import { VFSItem } from '../../types/os';

interface DesktopIconProps {
  id: string;
  title: string;
  icon: string;
  iconType?: 'lucide' | 'url';
  customUrl?: string;
  isSelected?: boolean;
  isCustomApp?: boolean;
  fileItem?: VFSItem;
  onClick: (e: React.MouseEvent) => void;
  onDoubleClick: () => void;
  onContextMenu: (e: React.MouseEvent) => void;
}

export const DesktopIcon: React.FC<DesktopIconProps> = ({
  id,
  title,
  icon,
  iconType = 'lucide',
  customUrl,
  isSelected = false,
  isCustomApp = false,
  fileItem,
  onClick,
  onDoubleClick,
  onContextMenu,
}) => {
  return (
    <div
      id={`desktop-icon-${id}`}
      onClick={onClick}
      onDoubleClick={onDoubleClick}
      onContextMenu={onContextMenu}
      className={`group flex flex-col items-center justify-center p-2 rounded-xl text-center cursor-pointer transition-all duration-150 border w-24 h-24 select-none ${
        isSelected
          ? 'bg-blue-600/30 border-blue-400/80 shadow-lg shadow-blue-950/50 backdrop-blur-md'
          : 'bg-transparent border-transparent hover:bg-slate-900/40 hover:border-slate-700/40 hover:backdrop-blur-sm'
      }`}
    >
      <div className="w-11 h-11 flex items-center justify-center mb-1 relative transition-transform duration-150 group-hover:scale-110 drop-shadow-md">
        <DynamicIcon
          name={icon}
          iconType={iconType}
          customUrl={customUrl}
          size={32}
          className={
            isCustomApp
              ? 'text-indigo-400'
              : fileItem?.type === 'folder'
              ? 'text-amber-400 fill-amber-400/20'
              : 'text-blue-400'
          }
        />
        {isCustomApp && (
          <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-blue-600 text-[8px] font-bold text-white rounded-full flex items-center justify-center shadow">
            W
          </span>
        )}
      </div>

      <span className="text-[11px] font-medium text-slate-100 line-clamp-2 leading-tight tracking-tight drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)] px-1 group-hover:text-white">
        {title}
      </span>
    </div>
  );
};
