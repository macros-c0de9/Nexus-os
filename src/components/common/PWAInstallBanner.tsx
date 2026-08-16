import React, { useState, useEffect } from 'react';
import { pwaService, PWAState } from '../../services/pwaService';
import { useOS } from '../../context/OSContext';
import {
  Download,
  Smartphone,
  Monitor,
  Share2,
  PlusSquare,
  X,
  Sparkles,
  CheckCircle2,
  HelpCircle,
  ExternalLink,
  Laptop,
  Layers,
  ArrowRight
} from 'lucide-react';

export const PWAInstallBanner: React.FC = () => {
  const { addNotification } = useOS();
  const [pwaState, setPwaState] = useState<PWAState>(pwaService.getState());
  const [showIOSModal, setShowIOSModal] = useState(false);
  const [showDesktopGuideModal, setShowDesktopGuideModal] = useState(false);
  const [isBannerDismissed, setIsBannerDismissed] = useState(() => {
    try {
      return sessionStorage.getItem('auraos_pwa_banner_dismissed') === 'true';
    } catch {
      return false;
    }
  });

  useEffect(() => {
    const unsubPWA = pwaService.subscribe((state) => {
      setPwaState(state);
    });

    const unsubIOS = pwaService.subscribeIOSModal((show) => {
      setShowIOSModal(show);
    });

    return () => {
      unsubPWA();
      unsubIOS();
    };
  }, []);

  const handleInstallClick = async () => {
    const result = await pwaService.promptInstall();
    if (result === 'accepted') {
      addNotification('Installation Started', 'AuraOS is now installing to your device!', 'success');
      setIsBannerDismissed(true);
    } else if (result === 'ios_guide') {
      setShowIOSModal(true);
    } else if (result === 'already_installed') {
      addNotification('AuraOS Installed', 'You are already running the standalone AuraOS app.', 'info');
    } else if (result === 'unsupported') {
      // Show manual desktop/browser install guide modal
      setShowDesktopGuideModal(true);
    }
  };

  const handleDismissBanner = () => {
    setIsBannerDismissed(true);
    try {
      sessionStorage.setItem('auraos_pwa_banner_dismissed', 'true');
    } catch {}
  };

  // If already running standalone PWA, don't show prompt banner
  if (pwaState.isInstalled) {
    return (
      <>
        {/* iOS Guide Modal (in case triggered manually from settings) */}
        {showIOSModal && <IOSInstallModal onClose={() => setShowIOSModal(false)} />}
        {showDesktopGuideModal && <DesktopGuideModal onClose={() => setShowDesktopGuideModal(false)} pwaState={pwaState} />}
      </>
    );
  }

  return (
    <>
      {/* 1. Sleek Top-Right Floating Install Prompt Card (Auto-hides when dismissed) */}
      {!isBannerDismissed && (
        <aside
          id="pwa-install-floating-banner"
          aria-label="Install AuraOS Desktop and Mobile App"
          className="fixed top-3 right-3 z-[9950] max-w-[380px] w-[calc(100vw-24px)] bg-slate-900/95 border border-blue-500/40 rounded-2xl p-3.5 shadow-2xl shadow-black/80 backdrop-blur-xl animate-in fade-in slide-in-from-top-4 duration-300 select-none text-slate-100"
        >
          <div className="flex items-start gap-3">
            {/* App Icon Glow */}
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 p-0.5 shadow-lg shadow-blue-900/40 flex-shrink-0 flex items-center justify-center">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                {pwaState.isIOS || pwaState.isAndroid ? (
                  <Smartphone className="w-5 h-5 text-sky-400" />
                ) : (
                  <Laptop className="w-5 h-5 text-sky-400" />
                )}
              </div>
            </div>

            {/* Info Body */}
            <div className="flex-1 min-w-0 pr-1">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-white tracking-tight">Install AuraOS</span>
                <span className="px-1.5 py-0.2 bg-blue-500/20 text-blue-300 text-[9px] font-bold rounded-full border border-blue-500/30">
                  {pwaState.isIOS ? 'iOS App' : pwaState.isAndroid ? 'Android' : 'Desktop PWA'}
                </span>
              </div>
              <p className="text-[11px] text-slate-300 mt-1 leading-snug">
                {pwaState.isIOS
                  ? 'Add to Home Screen for fullscreen native app with offline capabilities.'
                  : pwaState.isAndroid
                  ? 'Install on your Android phone for full offline web OS access.'
                  : 'Install standalone desktop app with fast launch and multi-window workspace.'}
              </p>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 mt-2.5">
                <button
                  id="btn-pwa-banner-install"
                  onClick={handleInstallClick}
                  className="px-3 py-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md shadow-blue-950 transition-all active:scale-95"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>{pwaState.isIOS ? 'Add to Home Screen' : 'Install App'}</span>
                </button>

                <button
                  onClick={handleDismissBanner}
                  className="px-2.5 py-1.5 text-slate-400 hover:text-slate-200 text-xs rounded-lg hover:bg-slate-800 transition-colors"
                >
                  Later
                </button>
              </div>
            </div>

            {/* Close Button */}
            <button
              onClick={handleDismissBanner}
              className="text-slate-500 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
              title="Dismiss"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </aside>
      )}

      {/* 2. iOS Safari Visual Installation Guide Modal */}
      {showIOSModal && <IOSInstallModal onClose={() => setShowIOSModal(false)} />}

      {/* 3. Desktop / Browser Manual Installation Guide Modal */}
      {showDesktopGuideModal && <DesktopGuideModal onClose={() => setShowDesktopGuideModal(false)} pwaState={pwaState} />}
    </>
  );
};

interface ModalProps {
  onClose: () => void;
  pwaState?: PWAState;
}

/**
 * iOS Safari Visual Step-by-Step Add to Home Screen Modal
 */
const IOSInstallModal: React.FC<ModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-[10000] bg-black/70 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-5 shadow-2xl shadow-black space-y-4 text-slate-100 relative"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 bg-slate-800 hover:bg-slate-700 rounded-xl text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-lg">
            <Smartphone className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Install AuraOS on iPhone / iPad</h3>
            <p className="text-xs text-slate-400">Step-by-step iOS Safari installation guide</p>
          </div>
        </div>

        <div className="space-y-3 pt-2">
          {/* Step 1 */}
          <div className="flex items-start gap-3 p-3 bg-slate-950/80 border border-slate-800/80 rounded-2xl">
            <div className="w-6 h-6 rounded-full bg-blue-600/20 text-blue-400 font-bold text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
              1
            </div>
            <div className="text-xs space-y-1">
              <p className="font-semibold text-slate-200 flex items-center gap-1.5">
                <span>Tap the Safari <strong>Share</strong> button</span>
                <Share2 className="w-4 h-4 text-blue-400 inline" />
              </p>
              <p className="text-slate-400 text-[11px]">
                Located in the bottom toolbar on iPhone or top right on iPad.
              </p>
            </div>
          </div>

          {/* Step 2 */}
          <div className="flex items-start gap-3 p-3 bg-slate-950/80 border border-slate-800/80 rounded-2xl">
            <div className="w-6 h-6 rounded-full bg-indigo-600/20 text-indigo-400 font-bold text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
              2
            </div>
            <div className="text-xs space-y-1">
              <p className="font-semibold text-slate-200 flex items-center gap-1.5">
                <span>Scroll down and tap <strong>"Add to Home Screen"</strong></span>
                <PlusSquare className="w-4 h-4 text-slate-300 inline" />
              </p>
              <p className="text-slate-400 text-[11px]">
                This packages AuraOS into a standalone fullscreen mobile app.
              </p>
            </div>
          </div>

          {/* Step 3 */}
          <div className="flex items-start gap-3 p-3 bg-slate-950/80 border border-slate-800/80 rounded-2xl">
            <div className="w-6 h-6 rounded-full bg-emerald-600/20 text-emerald-400 font-bold text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
              3
            </div>
            <div className="text-xs space-y-1">
              <p className="font-semibold text-slate-200">
                Tap <strong>"Add"</strong> in the top-right corner
              </p>
              <p className="text-slate-400 text-[11px]">
                Open AuraOS from your home screen anytime without browser bars.
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-all shadow-md"
        >
          Got it!
        </button>
      </div>
    </div>
  );
};

/**
 * Desktop / Edge / Chrome Manual Installation Guide Modal
 */
const DesktopGuideModal: React.FC<ModalProps> = ({ onClose, pwaState }) => {
  return (
    <div className="fixed inset-0 z-[10000] bg-black/70 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl shadow-black space-y-4 text-slate-100 relative"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 bg-slate-800 hover:bg-slate-700 rounded-xl text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-lg">
            <Laptop className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Install AuraOS Desktop App</h3>
            <p className="text-xs text-slate-400">Detected: {pwaState?.browserName || 'Web Browser'} on {pwaState?.platformName || 'Desktop'}</p>
          </div>
        </div>

        <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-2xl space-y-3 text-xs">
          <h4 className="font-semibold text-slate-200 flex items-center gap-2">
            <Download className="w-4 h-4 text-blue-400" />
            <span>Install directly via Browser Address Bar:</span>
          </h4>
          <ol className="space-y-2 text-slate-300 list-decimal pl-4 text-[11px] leading-relaxed">
            <li>
              Look at the <strong>right side of your browser URL address bar</strong> for the <strong>Install icon (🖥️ or ⬇️)</strong>.
            </li>
            <li>
              Click the install icon and select <strong>"Install AuraOS"</strong>.
            </li>
            <li>
              Alternatively, click the browser menu <strong>(⋮ or ⋯)</strong> &gt; <strong>"Save and Share" / "Install AuraOS"</strong>.
            </li>
          </ol>
        </div>

        <div className="flex items-center justify-end gap-2 pt-2">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-all"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
