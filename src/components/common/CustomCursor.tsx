import React, { useEffect } from 'react';

export type CursorVariant =
  | 'default'
  | 'pointer'
  | 'text'
  | 'grab'
  | 'grabbing'
  | 'not-allowed'
  | 'ns-resize'
  | 'ew-resize'
  | 'nesw-resize'
  | 'nwse-resize'
  | 'wait'
  | 'crosshair';

/**
 * CustomCursor is disabled in favor of the native OS / browser system mouse pointer.
 */
export const CustomCursor: React.FC = () => {
  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.classList.remove('custom-cursor-active');
    }
  }, []);

  return null;
};
