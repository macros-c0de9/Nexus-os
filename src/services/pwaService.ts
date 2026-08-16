export interface PWAState {
  isInstalled: boolean;
  isInstallable: boolean;
  isIOS: boolean;
  isAndroid: boolean;
  isDesktop: boolean;
  platformName: string;
  browserName: string;
  hasServiceWorker: boolean;
  swRegistration: ServiceWorkerRegistration | null;
}

type PWAStateListener = (state: PWAState) => void;

class PWAService {
  private deferredPrompt: any = null;
  private listeners: Set<PWAStateListener> = new Set();
  private state: PWAState;
  private showIOSModalListeners: Set<(show: boolean) => void> = new Set();

  constructor() {
    this.state = this.detectInitialState();
    this.init();
  }

  private detectInitialState(): PWAState {
    const isClient = typeof window !== 'undefined';
    if (!isClient) {
      return {
        isInstalled: false,
        isInstallable: false,
        isIOS: false,
        isAndroid: false,
        isDesktop: true,
        platformName: 'Desktop',
        browserName: 'Browser',
        hasServiceWorker: false,
        swRegistration: null,
      };
    }

    const ua = navigator.userAgent;
    const isIOS =
      (/iPad|iPhone|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)) &&
      !(window as any).MSStream;
    const isAndroid = /Android/i.test(ua);
    const isWindows = /Windows/i.test(ua);
    const isMac = /Macintosh|Mac OS X/i.test(ua) && !isIOS;
    const isLinux = /Linux/i.test(ua) && !isAndroid;
    const isDesktop = !isIOS && !isAndroid;

    let platformName = 'Desktop';
    if (isIOS) platformName = 'Apple iOS (iPhone/iPad)';
    else if (isAndroid) platformName = 'Android Mobile';
    else if (isWindows) platformName = 'Windows Desktop';
    else if (isMac) platformName = 'macOS Desktop';
    else if (isLinux) platformName = 'Linux Desktop';

    let browserName = 'Browser';
    if (/Edg/i.test(ua)) browserName = 'Microsoft Edge';
    else if (/Chrome/i.test(ua)) browserName = 'Google Chrome';
    else if (/Safari/i.test(ua) && !/Chrome/i.test(ua)) browserName = 'Apple Safari';
    else if (/Firefox/i.test(ua)) browserName = 'Mozilla Firefox';
    else if (/SamsungBrowser/i.test(ua)) browserName = 'Samsung Internet';

    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true ||
      document.referrer.includes('android-app://');

    return {
      isInstalled: isStandalone,
      isInstallable: false,
      isIOS,
      isAndroid,
      isDesktop,
      platformName,
      browserName,
      hasServiceWorker: 'serviceWorker' in navigator,
      swRegistration: null,
    };
  }

  private init() {
    if (typeof window === 'undefined') return;

    // Register Service Worker
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker
          .register('/sw.js', { scope: '/' })
          .then((registration) => {
            this.state.swRegistration = registration;
            this.notify();
          })
          .catch((err) => {
            console.warn('[PWA] ServiceWorker registration error:', err);
          });
      });
    }

    // Capture Native Browser BeforeInstallPrompt (Chrome, Edge, Android Chrome, Samsung Internet)
    window.addEventListener('beforeinstallprompt', (e: Event) => {
      e.preventDefault();
      this.deferredPrompt = e;
      this.state.isInstallable = true;
      this.notify();
    });

    // Detect app installation completion
    window.addEventListener('appinstalled', () => {
      this.deferredPrompt = null;
      this.state.isInstalled = true;
      this.state.isInstallable = false;
      this.notify();
    });

    // Track display mode changes dynamically
    const mediaQuery = window.matchMedia('(display-mode: standalone)');
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', (e) => {
        this.state.isInstalled = e.matches;
        this.notify();
      });
    }
  }

  public getState(): PWAState {
    return { ...this.state };
  }

  public subscribe(listener: PWAStateListener): () => void {
    this.listeners.add(listener);
    listener(this.getState());
    return () => {
      this.listeners.delete(listener);
    };
  }

  public subscribeIOSModal(listener: (show: boolean) => void): () => void {
    this.showIOSModalListeners.add(listener);
    return () => {
      this.showIOSModalListeners.delete(listener);
    };
  }

  public openIOSGuide() {
    this.showIOSModalListeners.forEach((fn) => fn(true));
  }

  public closeIOSGuide() {
    this.showIOSModalListeners.forEach((fn) => fn(false));
  }

  private notify() {
    const currentState = this.getState();
    this.listeners.forEach((listener) => listener(currentState));
  }

  /**
   * Trigger Native or Platform-Aware PWA Installation Flow
   */
  public async promptInstall(): Promise<'accepted' | 'dismissed' | 'unsupported' | 'ios_guide' | 'already_installed'> {
    if (this.state.isInstalled) {
      return 'already_installed';
    }

    // iOS Safari requires Add to Home Screen manual flow
    if (this.state.isIOS) {
      this.openIOSGuide();
      return 'ios_guide';
    }

    // If browser triggered beforeinstallprompt
    if (this.deferredPrompt) {
      try {
        this.deferredPrompt.prompt();
        const choiceResult = await this.deferredPrompt.userChoice;
        if (choiceResult.outcome === 'accepted') {
          this.state.isInstalled = true;
          this.state.isInstallable = false;
          this.deferredPrompt = null;
          this.notify();
          return 'accepted';
        } else {
          return 'dismissed';
        }
      } catch (err) {
        console.warn('[PWA] prompt error:', err);
        return 'unsupported';
      }
    }

    return 'unsupported';
  }
}

export const pwaService = new PWAService();
