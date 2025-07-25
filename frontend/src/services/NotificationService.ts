// 🚀 ULTIMATE Notification Service - 完璧な通知システム
class NotificationService {
  private vapidPublicKey: string = 'your-vapid-public-key-here';
  private registration: ServiceWorkerRegistration | null = null;
  private subscription: PushSubscription | null = null;
  private notificationQueue: Array<{
    title: string;
    options: NotificationOptions;
    timestamp: number;
  }> = [];

  constructor() {
    this.initialize();
  }

  // 🎯 完璧な初期化
  private async initialize(): Promise<void> {
    try {
      if ('serviceWorker' in navigator) {
        this.registration = await navigator.serviceWorker.ready;
        console.log('✅ Notification service initialized');
      } else {
        console.warn('⚠️ Service Worker not supported');
      }
    } catch (error) {
      console.error('❌ Failed to initialize notification service:', error);
    }
  }

  // 🔔 権限確認と要求
  async requestPermission(): Promise<NotificationPermission> {
    if (!('Notification' in window)) {
      console.error('❌ Notifications not supported');
      return 'denied';
    }

    // 既に許可されている場合
    if (Notification.permission === 'granted') {
      console.log('✅ Notification permission already granted');
      return 'granted';
    }

    // 明示的に拒否されている場合
    if (Notification.permission === 'denied') {
      console.log('❌ Notification permission denied');
      return 'denied';
    }

    try {
      // 権限要求
      const permission = await Notification.requestPermission();
      console.log(`🔔 Notification permission result: ${permission}`);
      
      if (permission === 'granted') {
        // 権限取得後にテスト通知
        this.showWelcomeNotification();
      }
      
      return permission;
    } catch (error) {
      console.error('❌ Failed to request notification permission:', error);
      return 'denied';
    }
  }

  // 🎉 ウェルカム通知
  private showWelcomeNotification(): void {
    this.showNotification('通知が有効になりました！', {
      body: 'チャットボットからの重要な更新を受け取れます',
      icon: '/icons/icon-192x192.png',
      badge: '/icons/badge-72x72.png',
      tag: 'welcome',
      silent: false,
      vibrate: [200, 100, 200],
      actions: [
        {
          action: 'settings',
          title: '設定',
          icon: '/icons/settings.png'
        }
      ]
    });
  }

  // 📱 基本通知の表示
  async showNotification(
    title: string, 
    options: NotificationOptions = {}
  ): Promise<boolean> {
    // 権限確認
    if (Notification.permission !== 'granted') {
      console.log('⚠️ Notification permission not granted');
      return false;
    }

    // デフォルトオプションの設定
    const defaultOptions: NotificationOptions = {
      icon: '/icons/icon-192x192.png',
      badge: '/icons/badge-72x72.png',
      vibrate: [100, 50, 100],
      timestamp: Date.now(),
      requireInteraction: false,
      silent: false,
      ...options
    };

    try {
      if (this.registration) {
        // Service Worker経由での通知
        await this.registration.showNotification(title, defaultOptions);
        console.log('✅ Service Worker notification shown:', title);
      } else {
        // 直接通知
        new Notification(title, defaultOptions);
        console.log('✅ Direct notification shown:', title);
      }

      // 通知履歴に追加
      this.addToQueue(title, defaultOptions);
      return true;
    } catch (error) {
      console.error('❌ Failed to show notification:', error);
      return false;
    }
  }

  // 💬 チャット通知
  async showChatNotification(
    message: string,
    sender: string = 'チャットボット',
    conversationId?: string
  ): Promise<boolean> {
    return this.showNotification(`${sender}からのメッセージ`, {
      body: message,
      tag: `chat-${conversationId || 'default'}`,
      data: {
        type: 'chat',
        conversationId,
        sender,
        message,
        timestamp: Date.now()
      },
      actions: [
        {
          action: 'reply',
          title: '返信',
          icon: '/icons/reply.png'
        },
        {
          action: 'view',
          title: '表示',
          icon: '/icons/view.png'
        }
      ],
      vibrate: [200, 100, 200, 100, 200]
    });
  }

  // 🚨 重要通知
  async showImportantNotification(
    title: string,
    message: string,
    priority: 'high' | 'urgent' = 'high'
  ): Promise<boolean> {
    return this.showNotification(title, {
      body: message,
      tag: `important-${Date.now()}`,
      requireInteraction: true,
      silent: false,
      vibrate: priority === 'urgent' ? [300, 100, 300, 100, 300] : [200, 100, 200],
      data: {
        type: 'important',
        priority,
        timestamp: Date.now()
      },
      actions: [
        {
          action: 'acknowledge',
          title: '確認',
          icon: '/icons/check.png'
        },
        {
          action: 'dismiss',
          title: '閉じる',
          icon: '/icons/close.png'
        }
      ]
    });
  }

  // 📊 進捗通知
  async showProgressNotification(
    title: string,
    progress: number,
    total: number,
    taskId: string
  ): Promise<boolean> {
    const percentage = Math.round((progress / total) * 100);
    
    return this.showNotification(title, {
      body: `進行中... (${progress}/${total}) - ${percentage}%完了`,
      tag: `progress-${taskId}`,
      silent: true,
      data: {
        type: 'progress',
        taskId,
        progress,
        total,
        percentage,
        timestamp: Date.now()
      },
      actions: percentage < 100 ? [
        {
          action: 'cancel',
          title: 'キャンセル',
          icon: '/icons/cancel.png'
        }
      ] : [
        {
          action: 'view-result',
          title: '結果を表示',
          icon: '/icons/view.png'
        }
      ]
    });
  }

  // 📅 リマインダー通知
  async scheduleReminder(
    title: string,
    message: string,
    scheduledTime: Date,
    reminderId: string
  ): Promise<boolean> {
    const delay = scheduledTime.getTime() - Date.now();
    
    if (delay <= 0) {
      console.error('❌ Scheduled time is in the past');
      return false;
    }

    setTimeout(() => {
      this.showNotification(title, {
        body: message,
        tag: `reminder-${reminderId}`,
        requireInteraction: true,
        data: {
          type: 'reminder',
          reminderId,
          scheduledTime: scheduledTime.toISOString(),
          timestamp: Date.now()
        },
        actions: [
          {
            action: 'snooze',
            title: 'スヌーズ',
            icon: '/icons/snooze.png'
          },
          {
            action: 'complete',
            title: '完了',
            icon: '/icons/complete.png'
          }
        ]
      });
    }, delay);

    console.log(`⏰ Reminder scheduled for: ${scheduledTime.toLocaleString()}`);
    return true;
  }

  // 🔄 プッシュ通知の購読
  async subscribeToPushNotifications(): Promise<PushSubscription | null> {
    if (!this.registration) {
      console.error('❌ Service Worker registration not available');
      return null;
    }

    if (!('PushManager' in window)) {
      console.error('❌ Push notifications not supported');
      return null;
    }

    try {
      // 既存の購読確認
      this.subscription = await this.registration.pushManager.getSubscription();
      
      if (!this.subscription) {
        // 新規購読
        this.subscription = await this.registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: this.urlBase64ToUint8Array(this.vapidPublicKey)
        });
        
        console.log('✅ Push subscription created');
      } else {
        console.log('✅ Push subscription already exists');
      }

      // サーバーに購読情報を送信
      await this.sendSubscriptionToServer(this.subscription);
      
      return this.subscription;
    } catch (error) {
      console.error('❌ Failed to subscribe to push notifications:', error);
      return null;
    }
  }

  // 🔕 プッシュ通知の購読解除
  async unsubscribeFromPushNotifications(): Promise<boolean> {
    if (!this.subscription) {
      console.log('⚠️ No active push subscription');
      return true;
    }

    try {
      const success = await this.subscription.unsubscribe();
      
      if (success) {
        console.log('✅ Push subscription cancelled');
        this.subscription = null;
        
        // サーバーに購読停止を通知
        await this.removeSubscriptionFromServer();
      }
      
      return success;
    } catch (error) {
      console.error('❌ Failed to unsubscribe from push notifications:', error);
      return false;
    }
  }

  // 📡 購読情報をサーバーに送信
  private async sendSubscriptionToServer(subscription: PushSubscription): Promise<void> {
    try {
      const response = await fetch('/api/v1/push-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          subscription: subscription.toJSON(),
          userId: this.getUserId(),
          timestamp: Date.now()
        })
      });

      if (response.ok) {
        console.log('✅ Subscription sent to server');
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      console.error('❌ Failed to send subscription to server:', error);
    }
  }

  // 🗑️ サーバーから購読情報を削除
  private async removeSubscriptionFromServer(): Promise<void> {
    try {
      const response = await fetch('/api/v1/push-subscription', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId: this.getUserId()
        })
      });

      if (response.ok) {
        console.log('✅ Subscription removed from server');
      }
    } catch (error) {
      console.error('❌ Failed to remove subscription from server:', error);
    }
  }

  // 🆔 ユーザーID取得（実装依存）
  private getUserId(): string {
    // 実際の実装ではユーザー認証システムから取得
    return localStorage.getItem('userId') || 'anonymous';
  }

  // 🔧 VAPID キーの変換
  private urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }

    return outputArray;
  }

  // 📝 通知履歴に追加
  private addToQueue(title: string, options: NotificationOptions): void {
    this.notificationQueue.unshift({
      title,
      options,
      timestamp: Date.now()
    });

    // 履歴は最新50件まで保持
    if (this.notificationQueue.length > 50) {
      this.notificationQueue = this.notificationQueue.slice(0, 50);
    }
  }

  // 📚 通知履歴の取得
  getNotificationHistory(limit: number = 20): Array<{
    title: string;
    options: NotificationOptions;
    timestamp: number;
  }> {
    return this.notificationQueue.slice(0, limit);
  }

  // 🧹 通知履歴のクリア
  clearNotificationHistory(): void {
    this.notificationQueue = [];
    console.log('🧹 Notification history cleared');
  }

  // 📊 通知統計の取得
  getNotificationStats(): {
    totalNotifications: number;
    todayNotifications: number;
    permissionStatus: NotificationPermission;
    pushSubscriptionActive: boolean;
  } {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayTimestamp = today.getTime();

    const todayCount = this.notificationQueue.filter(
      notification => notification.timestamp >= todayTimestamp
    ).length;

    return {
      totalNotifications: this.notificationQueue.length,
      todayNotifications: todayCount,
      permissionStatus: Notification.permission,
      pushSubscriptionActive: !!this.subscription
    };
  }

  // 🔕 全ての通知を閉じる
  async closeAllNotifications(): Promise<void> {
    if (!this.registration) {
      return;
    }

    try {
      const notifications = await this.registration.getNotifications();
      notifications.forEach(notification => notification.close());
      console.log(`🔕 Closed ${notifications.length} notifications`);
    } catch (error) {
      console.error('❌ Failed to close notifications:', error);
    }
  }

  // 🎯 通知設定の管理
  async updateNotificationSettings(settings: {
    chatNotifications?: boolean;
    importantNotifications?: boolean;
    reminderNotifications?: boolean;
    soundEnabled?: boolean;
    vibrationEnabled?: boolean;
  }): Promise<void> {
    try {
      localStorage.setItem('notificationSettings', JSON.stringify(settings));
      console.log('✅ Notification settings updated:', settings);
    } catch (error) {
      console.error('❌ Failed to update notification settings:', error);
    }
  }

  // ⚙️ 通知設定の取得
  getNotificationSettings(): {
    chatNotifications: boolean;
    importantNotifications: boolean;
    reminderNotifications: boolean;
    soundEnabled: boolean;
    vibrationEnabled: boolean;
  } {
    try {
      const saved = localStorage.getItem('notificationSettings');
      const settings = saved ? JSON.parse(saved) : {};
      
      return {
        chatNotifications: settings.chatNotifications ?? true,
        importantNotifications: settings.importantNotifications ?? true,
        reminderNotifications: settings.reminderNotifications ?? true,
        soundEnabled: settings.soundEnabled ?? true,
        vibrationEnabled: settings.vibrationEnabled ?? true
      };
    } catch (error) {
      console.error('❌ Failed to get notification settings:', error);
      return {
        chatNotifications: true,
        importantNotifications: true,
        reminderNotifications: true,
        soundEnabled: true,
        vibrationEnabled: true
      };
    }
  }

  // 🔍 機能サポート確認
  static checkNotificationSupport(): {
    basic: boolean;
    serviceWorker: boolean;
    push: boolean;
    actions: boolean;
    vibration: boolean;
  } {
    return {
      basic: 'Notification' in window,
      serviceWorker: 'serviceWorker' in navigator,
      push: 'serviceWorker' in navigator && 'PushManager' in window,
      actions: 'Notification' in window && 'actions' in Notification.prototype,
      vibration: 'vibrate' in navigator
    };
  }
}

// シングルトンインスタンス
export const notificationService = new NotificationService();

export default NotificationService;