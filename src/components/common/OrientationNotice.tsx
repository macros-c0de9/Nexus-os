import React, { useState, useEffect } from 'react';
import { RotateCw, Smartphone, X } from 'lucide-react';
import { devicePermissions } from '../../services/devicePermissions';

export const OrientationNotice: React.FC = () => {
  const [isPortraitMobile, setIsPortraitMobile] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const checkOrientation = () => {
      const isMobile = window.innerWidth < 768;
      const isPortrait = window.innerHeight > window.innerWidth;
      setIsPortraitMobile(isMobile && isPortrait);
    };

    checkOrientation();
    window.addEventListener('resize', checkOrientation);
    window.addEventListener('orientationchange', checkOrientation);

    return () => {
      window.removeEventListener('resize', checkOrientation);
      window.removeEventListener('orientationchange', checkOrientation);
    };
  }, []);

  if (!isPortraitMobile || dismissed) return null;

  const handleRotate = async () => {
    await devicePermissions.lockOrientation('landscape');
    setDismissed(true);
  };

  return (
    <div
      id="orientation-notice-banner"
      className="fixed top-4 left-1/2 -translate-x-1/2 z-[9999] max-w-sm w-[90%] bg-slate-900/95 border border-blue-500/40 text-slate-100 p-3.5 rounded-2xl shadow-2xl backdrop-blur-xl flex items-center justify-between gap-3 animate-in slide-in-from-top-4 duration-300"
    >
      <div className="flex items-center gap-3">
        <div className="p-2 bg-blue-500/20 text-blue-400 rounded-xl">
          <Smartphone className="w-5 h-5 rotate-90" />
        </div>
        <div>
          <p className="text-xs font-semibold text-slate-100">Desktop View Optimizer</p>
          <p className="text-[11px] text-slate-400">Rotate device to landscape for the full desktop OS experience.</p>
        </div>
      </div>
      <div className="flex items-center gap-1.5">
        <button
          id="btn-rotate-landscape"
          onClick={handleRotate}
          className="p-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-medium flex items-center gap-1 transition-colors"
          title="Switch to Landscape"
        >
          <RotateCw className="w-3.5 h-3.5" />
        </button>
        <button
          id="btn-dismiss-rotate"
          onClick={() => setDismissed(true)}
          className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors"
          title="Dismiss"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
