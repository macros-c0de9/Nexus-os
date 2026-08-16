import React, { useEffect, useRef, useState } from 'react';
import { useOS } from '../../context/OSContext';
import { DynamicIcon } from './DynamicIcon';
import { ChevronRight } from 'lucide-react';
import { ContextMenuItem } from '../../types/os';

export const ContextMenu: React.FC = () => {
  const { contextMenu, closeContextMenu } = useOS();
  const menuRef = useRef<HTMLDivElement>(null);
  const [activeSubmenuId, setActiveSubmenuId] = useState<string | null>(null);
  const [submenuSide, setSubmenuSide] = useState<'right' | 'left'>('right');

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent | TouchEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        closeContextMenu();
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeContextMenu();
      }
    };

    if (contextMenu.isOpen) {
      window.addEventListener('mousedown', handleClickOutside);
      window.addEventListener('touchstart', handleClickOutside);
      window.addEventListener('keydown', handleKeyDown);
      setActiveSubmenuId(null);

      // Check if context menu is near the right edge to flip submenu to left
      const screenWidth = typeof window !== 'undefined' ? window.innerWidth : 1280;
      if (contextMenu.x + 440 > screenWidth) {
        setSubmenuSide('left');
      } else {
        setSubmenuSide('right');
      }
    }

    return () => {
      window.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('touchstart', handleClickOutside);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [contextMenu.isOpen, contextMenu.x, closeContextMenu]);

  if (!contextMenu.isOpen || contextMenu.items.length === 0) return null;

  const renderSubmenu = (submenuItems: ContextMenuItem[]) => {
    return (
      <div
        className={`absolute top-0 z-[10000] min-w-[210px] rounded-xl border border-slate-700/70 bg-slate-900/95 p-1.5 shadow-2xl backdrop-blur-2xl animate-in fade-in duration-100 ${
          submenuSide === 'right' ? 'left-full ml-1.5' : 'right-full mr-1.5'
        }`}
      >
        {submenuItems.map((subItem, sIdx) => {
          if (subItem.divider) {
            return <div key={`sub_div_${sIdx}`} className="my-1.5 h-px bg-slate-800" />;
          }

          return (
            <button
              key={subItem.id || `sub_item_${sIdx}`}
              id={`context-submenu-item-${subItem.id}`}
              disabled={subItem.disabled}
              onClick={(e) => {
                e.stopPropagation();
                if (subItem.disabled) return;
                closeContextMenu();
                if (subItem.onClick) subItem.onClick();
              }}
              className={`flex w-full items-center justify-between gap-3 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                subItem.disabled
                  ? 'cursor-not-allowed text-slate-500'
                  : subItem.danger
                  ? 'text-rose-400 hover:bg-rose-500/20 hover:text-rose-300'
                  : 'text-slate-200 hover:bg-blue-600/30 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2.5 truncate">
                {subItem.icon && <DynamicIcon name={subItem.icon} size={15} className="text-slate-400 flex-shrink-0" />}
                <span className="truncate">{subItem.label}</span>
              </div>
              {subItem.shortcut && (
                <span className="text-[10px] text-slate-500 uppercase font-mono tracking-wider ml-2 flex-shrink-0">
                  {subItem.shortcut}
                </span>
              )}
            </button>
          );
        })}
      </div>
    );
  };

  return (
    <div
      id="os-context-menu"
      ref={menuRef}
      style={{ left: contextMenu.x, top: contextMenu.y }}
      className="fixed z-[9999] min-w-[210px] rounded-xl border border-slate-700/60 bg-slate-900/90 p-1.5 shadow-2xl backdrop-blur-xl animate-in fade-in zoom-in-95 duration-100"
    >
      {contextMenu.items.map((item, idx) => {
        if (item.divider) {
          return <div key={`div_${idx}`} className="my-1.5 h-px bg-slate-800" />;
        }

        const hasSubmenu = item.submenu && item.submenu.length > 0;
        const isSubmenuActive = activeSubmenuId === item.id;

        return (
          <div
            key={item.id || `item_${idx}`}
            className="relative"
            onMouseEnter={() => {
              if (hasSubmenu) {
                setActiveSubmenuId(item.id);
              } else {
                setActiveSubmenuId(null);
              }
            }}
          >
            <button
              id={`context-menu-item-${item.id}`}
              disabled={item.disabled}
              onClick={(e) => {
                if (hasSubmenu) {
                  e.stopPropagation();
                  setActiveSubmenuId((prev) => (prev === item.id ? null : item.id));
                  return;
                }
                if (item.disabled) return;
                closeContextMenu();
                if (item.onClick) item.onClick();
              }}
              className={`flex w-full items-center justify-between gap-3 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                item.disabled
                  ? 'cursor-not-allowed text-slate-500'
                  : item.danger
                  ? 'text-rose-400 hover:bg-rose-500/20 hover:text-rose-300'
                  : isSubmenuActive
                  ? 'bg-blue-600/30 text-white'
                  : 'text-slate-200 hover:bg-blue-600/30 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2.5 truncate">
                {item.icon && <DynamicIcon name={item.icon} size={15} className="text-slate-400 flex-shrink-0" />}
                <span className="truncate">{item.label}</span>
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                {item.shortcut && (
                  <span className="text-[10px] text-slate-500 uppercase font-mono tracking-wider">
                    {item.shortcut}
                  </span>
                )}
                {hasSubmenu && (
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                )}
              </div>
            </button>

            {/* Render Submenu if active */}
            {hasSubmenu && isSubmenuActive && item.submenu && renderSubmenu(item.submenu)}
          </div>
        );
      })}
    </div>
  );
};
