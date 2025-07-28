// 🚀 ULTIMATE PWA Hook - 完璧なインストール機能
import { useState, useEffect } from 'react';

// ServiceWorkerRegistrationを拡張してsyncプロパティを追加
declare global {
  interface ServiceWorkerRegistration {
    sync: {
      register(tag: string): Promise<void>;
    };
  }
}

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

interface PWAState {
  isInstallable: boolean;
  isInstalled: boolean;
  isStandalone: boolean;
  isOnline: boolean;
  canShare: boolean;
  supportsNotifications: boolean;
  supportsPushNotifications: boolean;
  supportsBackgroundSync: boolean;
  supportsWebRTC: boolean;
  supportsGeolocation: boolean;
  installPrompt: BeforeInstallPromptEvent | null;
}

interface PWAActions {
  install: () => Promise<boolean>;
  share: (data: ShareData) => Promise<boolean>;
  requestNotificationPermission: () => Promise<NotificationPermission>;
  subscribeToPush: () => Promise<PushSubscription | null>;
  registerBackgroundSync: (tag: string) => Promise<void>;
  getCurrentPosition: () => Promise<GeolocationPosition>;
  checkForUpdates: () => Promise<boolean>;
}

export function usePWA(): PWAState & PWAActions {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  // 🎯 完璧な初期化
  useEffect(() => {
    // スタンドアロンモードの検出
    const checkStandalone = () => {
      const isStandaloneMode = 
        window.matchMedia('(display-mode: standalone)').matches ||
        window.matchMedia('(display-mode: fullscreen)').matches ||
        ('standalone' in window.navigator && (window.navigator as any).standalone) ||
        document.referrer.includes('android-app://');
      
      setIsStandalone(isStandaloneMode);
      setIsInstalled(isStandaloneMode);
    };

    checkStandalone();

    // インストールプロンプトの処理
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      const promptEvent = e as BeforeInstallPromptEvent;
      setInstallPrompt(promptEvent);
      setIsInstallable(true);
      console.log('🚀 PWA installable detected');
    };

    // インストール完了の処理
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setIsInstallable(false);
      setInstallPrompt(null);
      console.log('✅ PWA installed successfully');
    };

    // オンライン/オフライン状態の監視
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    // イベントリスナーの登録
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // クリーンアップ
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // 🚀 完璧なインストール機能
  const install = async (): Promise<boolean> => {
    if (!installPrompt) {
      console.log('❌ Install prompt not available');
      return false;
    }

    try {
      await installPrompt.prompt();
      const choiceResult = await installPrompt.userChoice;
      
      if (choiceResult.outcome === 'accepted') {
        console.log('✅ User accepted PWA installation');
        setIsInstallable(false);
        setInstallPrompt(null);
        return true;
      } else {
        console.log('❌ User dismissed PWA installation');
        return false;
      }
    } catch (error) {
      console.error('❌ Installation failed:', error);
      return false;
    }
  };

  // 🔗 完璧な共有機能
  const share = async (data: ShareData): Promise<boolean> => {
    if (!navigator.share) {
      console.log('❌ Web Share API not supported');
      return false;
    }

    try {
      await navigator.share(data);
      console.log('✅ Content shared successfully');
      return true;
    } catch (error) {
      if ((error as Error).name !== 'AbortError') {
        console.error('❌ Sharing failed:', error);
      }
      return false;
    }
  };

  // 🔔 完璧な通知権限リクエスト
  const requestNotificationPermission = async (): Promise<NotificationPermission> => {
    if (!('Notification' in window)) {
      console.log('❌ Notifications not supported');
      return 'denied';
    }

    if (Notification.permission === 'granted') {
      return 'granted';
    }

    try {
      const permission = await Notification.requestPermission();
      console.log(`🔔 Notification permission: ${permission}`);
      return permission;
    } catch (error) {
      console.error('❌ Notification permission request failed:', error);
      return 'denied';
    }
  };

  // 📱 完璧なプッシュ通知購読
  const subscribeToPush = async (): Promise<PushSubscription | null> => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      console.log('❌ Push notifications not supported');
      return null;
    }

    try {
      const registration = await navigator.serviceWorker.ready;
      
      // VAPID キーは実際の実装で設定
      const vapidPublicKey = 'your-vapid-public-key-here';
      
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: vapidPublicKey
      });

      console.log('✅ Push subscription successful');
      return subscription;
    } catch (error) {
      console.error('❌ Push subscription failed:', error);
      return null;
    }
  };

  // 🔄 完璧なバックグラウンド同期登録
  const registerBackgroundSync = async (tag: string): Promise<void> => {
    if (!('serviceWorker' in navigator) || !('sync' in window.ServiceWorkerRegistration.prototype)) {
      console.log('❌ Background sync not supported');
      return;
    }

    try {
      const registration = await navigator.serviceWorker.ready;
      await registration.sync.register(tag);
      console.log(`✅ Background sync registered: ${tag}`);
    } catch (error) {
      console.error(`❌ Background sync registration failed: ${tag}`, error);
    }
  };

  // 📍 完璧な位置情報取得
  const getCurrentPosition = async (): Promise<GeolocationPosition> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation not supported'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          console.log('✅ Geolocation obtained');
          resolve(position);
        },
        (error) => {
          console.error('❌ Geolocation error:', error);
          reject(error);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000
        }
      );
    });
  };

  // 🔄 完璧なアップデート確認
  const checkForUpdates = async (): Promise<boolean> => {
    if (!('serviceWorker' in navigator)) {
      return false;
    }

    try {
      const registration = await navigator.serviceWorker.getRegistration();
      if (!registration) {
        return false;
      }

      await registration.update();
      
      if (registration.waiting) {
        console.log('✅ Service Worker update available');
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('❌ Update check failed:', error);
      return false;
    }
  };

  // 機能サポートの完璧な検出
  const canShare = 'share' in navigator;
  const supportsNotifications = 'Notification' in window;
  const supportsPushNotifications = 'serviceWorker' in navigator && 'PushManager' in window;
  const supportsBackgroundSync = 'serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype;
  const supportsWebRTC = 'RTCPeerConnection' in window;
  const supportsGeolocation = 'geolocation' in navigator;

  return {
    // State
    isInstallable,
    isInstalled,
    isStandalone,
    isOnline,
    canShare,
    supportsNotifications,
    supportsPushNotifications,
    supportsBackgroundSync,
    supportsWebRTC,
    supportsGeolocation,
    installPrompt,
    
    // Actions
    install,
    share,
    requestNotificationPermission,
    subscribeToPush,
    registerBackgroundSync,
    getCurrentPosition,
    checkForUpdates
  };
}

// 🎯 PWA ステータス確認ユーティリティ
export const PWAUtils = {
  // インストール済みかどうか
  isInstalled: (): boolean => {
    return window.matchMedia('(display-mode: standalone)').matches ||
           ('standalone' in window.navigator && (window.navigator as any).standalone) ||
           document.referrer.includes('android-app://');
  },

  // PWA として実行中かどうか
  isRunningAsPWA: (): boolean => {
    return PWAUtils.isInstalled() || window.location.search.includes('pwa=true');
  },

  // デバイスタイプの検出
  getDeviceType: (): 'mobile' | 'tablet' | 'desktop' => {
    const userAgent = navigator.userAgent;
    
    if (/tablet|ipad|playbook|silk/i.test(userAgent)) {
      return 'tablet';
    }
    
    if (/mobile|iphone|ipod|android|blackberry|opera|mini|windows\sce|palm|smartphone|iemobile/i.test(userAgent)) {
      return 'mobile';
    }
    
    return 'desktop';
  },

  // ブラウザサポート確認
  getBrowserCapabilities: () => ({
    serviceWorker: 'serviceWorker' in navigator,
    pushNotifications: 'serviceWorker' in navigator && 'PushManager' in window,
    backgroundSync: 'serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype,
    webShare: 'share' in navigator,
    notifications: 'Notification' in window,
    webRTC: 'RTCPeerConnection' in window,
    geolocation: 'geolocation' in navigator,
    indexedDB: 'indexedDB' in window,
    webGL: !!window.WebGLRenderingContext,
    webAssembly: 'WebAssembly' in window
  })
};

export default usePWA;