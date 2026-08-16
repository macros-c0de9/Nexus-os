export interface DevicePermissionStatus {
  notifications: PermissionState | 'unsupported';
  fullscreen: boolean;
  wakeLock: boolean;
  orientation: string;
  clipboard: boolean;
}

class DevicePermissionsService {
  private wakeLockSentinel: any = null;

  public async registerServiceWorker(): Promise<boolean> {
    if ('serviceWorker' in navigator) {
      try {
        const reg = await navigator.serviceWorker.register('/sw.js');
        console.log('AuraOS Service Worker registered:', reg.scope);
        return true;
      } catch (err) {
        console.warn('Service Worker registration failed:', err);
        return false;
      }
    }
    return false;
  }

  public async requestNotificationPermission(): Promise<NotificationPermission | 'unsupported'> {
    if (!('Notification' in window)) {
      return 'unsupported';
    }
    try {
      const permission = await Notification.requestPermission();
      return permission;
    } catch (e) {
      console.warn('Error requesting notification permission:', e);
      return 'denied';
    }
  }

  public showNotification(title: string, options?: NotificationOptions): void {
    if ('Notification' in window && Notification.permission === 'granted') {
      try {
        new Notification(title, {
          icon: '/manifest.json',
          badge: '/manifest.json',
          ...options,
        });
      } catch (e) {
        console.log('Notification delivery fallback:', e);
      }
    }
  }

  public async toggleFullscreen(): Promise<boolean> {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
        return true;
      } else {
        await document.exitFullscreen();
        return false;
      }
    } catch (e) {
      console.warn('Fullscreen error:', e);
      return false;
    }
  }

  public isFullscreen(): boolean {
    return !!document.fullscreenElement;
  }

  public async toggleWakeLock(): Promise<boolean> {
    if ('wakeLock' in navigator) {
      try {
        if (!this.wakeLockSentinel) {
          this.wakeLockSentinel = await (navigator as any).wakeLock.request('screen');
          this.wakeLockSentinel.addEventListener('release', () => {
            this.wakeLockSentinel = null;
          });
          return true;
        } else {
          await this.wakeLockSentinel.release();
          this.wakeLockSentinel = null;
          return false;
        }
      } catch (err) {
        console.warn('Wake Lock error:', err);
        return false;
      }
    }
    return false;
  }

  public isWakeLockActive(): boolean {
    return this.wakeLockSentinel !== null;
  }

  public async lockOrientation(orientation: 'landscape' | 'portrait' | 'any'): Promise<boolean> {
    try {
      if (screen.orientation && (screen.orientation as any).lock) {
        await (screen.orientation as any).lock(orientation);
        return true;
      }
    } catch (e) {
      console.warn('Screen orientation lock unsupported or requires fullscreen:', e);
    }
    return false;
  }

  public getOrientation(): string {
    if (screen.orientation && screen.orientation.type) {
      return screen.orientation.type;
    }
    return window.innerWidth > window.innerHeight ? 'landscape-primary' : 'portrait-primary';
  }
}

export const devicePermissions = new DevicePermissionsService();
