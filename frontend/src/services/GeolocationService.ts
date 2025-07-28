// 🚀 ULTIMATE Geolocation Service - 完璧な位置情報サービス
interface LocationData {
  latitude: number;
  longitude: number;
  accuracy: number;
  altitude?: number;
  altitudeAccuracy?: number;
  heading?: number;
  speed?: number;
  timestamp: number;
}

interface LocationSettings {
  enableHighAccuracy: boolean;
  timeout: number;
  maximumAge: number;
  trackingEnabled: boolean;
  autoUpdate: boolean;
  updateInterval: number;
}

class GeolocationService {
  private currentPosition: LocationData | null = null;
  private watchId: number | null = null;
  private isTracking: boolean = false;
  private settings: LocationSettings;
  private listeners: Array<(location: LocationData) => void> = [];
  private errorListeners: Array<(error: GeolocationPositionError) => void> = [];

  constructor() {
    this.settings = {
      enableHighAccuracy: true,
      timeout: 15000,
      maximumAge: 300000, // 5分
      trackingEnabled: false,
      autoUpdate: false,
      updateInterval: 60000 // 1分
    };

    this.checkGeolocationSupport();
  }

  // 🔍 位置情報サポート確認
  private checkGeolocationSupport(): boolean {
    if (!('geolocation' in navigator)) {
      console.error('❌ Geolocation is not supported');
      return false;
    }
    
    console.log('✅ Geolocation is supported');
    return true;
  }

  // 🎯 現在位置の取得
  async getCurrentPosition(options?: Partial<LocationSettings>): Promise<LocationData> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation not supported'));
        return;
      }

      const settings = { ...this.settings, ...options };
      
      const positionOptions: PositionOptions = {
        enableHighAccuracy: settings.enableHighAccuracy,
        timeout: settings.timeout,
        maximumAge: settings.maximumAge
      };

      console.log('🌍 Getting current position...');

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const locationData: LocationData = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            altitude: position.coords.altitude || undefined,
            altitudeAccuracy: position.coords.altitudeAccuracy || undefined,
            heading: position.coords.heading || undefined,
            speed: position.coords.speed || undefined,
            timestamp: position.timestamp
          };

          this.currentPosition = locationData;
          console.log('✅ Current position obtained:', locationData);
          resolve(locationData);
        },
        (error) => {
          console.error('❌ Failed to get current position:', error);
          this.notifyErrorListeners(error);
          reject(error);
        },
        positionOptions
      );
    });
  }

  // 🔄 位置情報の継続追跡開始
  startTracking(options?: Partial<LocationSettings>): Promise<LocationData> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation not supported'));
        return;
      }

      if (this.isTracking) {
        console.log('⚠️ Already tracking location');
        if (this.currentPosition) {
          resolve(this.currentPosition);
        } else {
          reject(new Error('Tracking active but no position available'));
        }
        return;
      }

      const settings = { ...this.settings, ...options };
      
      const positionOptions: PositionOptions = {
        enableHighAccuracy: settings.enableHighAccuracy,
        timeout: settings.timeout,
        maximumAge: settings.maximumAge
      };

      console.log('🎯 Starting location tracking...');

      this.watchId = navigator.geolocation.watchPosition(
        (position) => {
          const locationData: LocationData = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            altitude: position.coords.altitude || undefined,
            altitudeAccuracy: position.coords.altitudeAccuracy || undefined,
            heading: position.coords.heading || undefined,
            speed: position.coords.speed || undefined,
            timestamp: position.timestamp
          };

          const isFirstPosition = !this.currentPosition;
          this.currentPosition = locationData;
          this.isTracking = true;

          console.log('📍 Location updated:', locationData);
          this.notifyListeners(locationData);

          // 最初の位置取得時にPromiseを解決
          if (isFirstPosition) {
            resolve(locationData);
          }
        },
        (error) => {
          console.error('❌ Location tracking error:', error);
          this.notifyErrorListeners(error);
          
          if (!this.isTracking) {
            reject(error);
          }
        },
        positionOptions
      );
    });
  }

  // ⏹️ 位置情報追跡停止
  stopTracking(): void {
    if (this.watchId !== null) {
      navigator.geolocation.clearWatch(this.watchId);
      this.watchId = null;
      this.isTracking = false;
      console.log('⏹️ Location tracking stopped');
    }
  }

  // 📍 最後に取得した位置情報
  getLastKnownPosition(): LocationData | null {
    return this.currentPosition;
  }

  // 🔄 位置情報リスナーの追加
  addLocationListener(callback: (location: LocationData) => void): void {
    this.listeners.push(callback);
    console.log('👂 Location listener added');
  }

  // 🔇 位置情報リスナーの削除
  removeLocationListener(callback: (location: LocationData) => void): void {
    const index = this.listeners.indexOf(callback);
    if (index > -1) {
      this.listeners.splice(index, 1);
      console.log('🔇 Location listener removed');
    }
  }

  // ❌ エラーリスナーの追加
  addErrorListener(callback: (error: GeolocationPositionError) => void): void {
    this.errorListeners.push(callback);
    console.log('👂 Error listener added');
  }

  // 🔇 エラーリスナーの削除
  removeErrorListener(callback: (error: GeolocationPositionError) => void): void {
    const index = this.errorListeners.indexOf(callback);
    if (index > -1) {
      this.errorListeners.splice(index, 1);
      console.log('🔇 Error listener removed');
    }
  }

  // 📡 リスナーへの通知
  private notifyListeners(location: LocationData): void {
    this.listeners.forEach(callback => {
      try {
        callback(location);
      } catch (error) {
        console.error('❌ Error in location listener:', error);
      }
    });
  }

  // ❌ エラーリスナーへの通知
  private notifyErrorListeners(error: GeolocationPositionError): void {
    this.errorListeners.forEach(callback => {
      try {
        callback(error);
      } catch (err) {
        console.error('❌ Error in error listener:', err);
      }
    });
  }

  // 📏 2点間の距離計算（ハバーサイン公式）
  static calculateDistance(
    pos1: { latitude: number; longitude: number },
    pos2: { latitude: number; longitude: number }
  ): number {
    const R = 6371e3; // 地球の半径（メートル）
    const φ1 = pos1.latitude * Math.PI / 180;
    const φ2 = pos2.latitude * Math.PI / 180;
    const Δφ = (pos2.latitude - pos1.latitude) * Math.PI / 180;
    const Δλ = (pos2.longitude - pos1.longitude) * Math.PI / 180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return R * c; // メートル単位
  }

  // 🧭 2点間の方角計算
  static calculateBearing(
    pos1: { latitude: number; longitude: number },
    pos2: { latitude: number; longitude: number }
  ): number {
    const φ1 = pos1.latitude * Math.PI / 180;
    const φ2 = pos2.latitude * Math.PI / 180;
    const Δλ = (pos2.longitude - pos1.longitude) * Math.PI / 180;

    const y = Math.sin(Δλ) * Math.cos(φ2);
    const x = Math.cos(φ1) * Math.sin(φ2) - Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ);

    const θ = Math.atan2(y, x);
    return (θ * 180 / Math.PI + 360) % 360; // 0-360度
  }

  // 🎯 指定位置からの距離チェック
  isWithinRange(
    targetPosition: { latitude: number; longitude: number },
    rangeMeters: number
  ): boolean {
    if (!this.currentPosition) {
      return false;
    }

    const distance = GeolocationService.calculateDistance(this.currentPosition, targetPosition);
    return distance <= rangeMeters;
  }

  // 📍 ジオフェンシング
  addGeofence(
    name: string,
    center: { latitude: number; longitude: number },
    radius: number,
    onEnter?: () => void,
    onExit?: () => void
  ): string {
    const geofenceId = `geofence_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    let wasInside = this.currentPosition ? 
      GeolocationService.calculateDistance(this.currentPosition, center) <= radius : false;

    const checkGeofence = (location: LocationData) => {
      const distance = GeolocationService.calculateDistance(location, center);
      const isInside = distance <= radius;

      if (!wasInside && isInside) {
        // エリアに入った
        console.log(`📍 Entered geofence: ${name}`);
        if (onEnter) onEnter();
      } else if (wasInside && !isInside) {
        // エリアから出た
        console.log(`📍 Exited geofence: ${name}`);
        if (onExit) onExit();
      }

      wasInside = isInside;
    };

    this.addLocationListener(checkGeofence);
    console.log(`✅ Geofence added: ${name} (radius: ${radius}m)`);
    
    return geofenceId;
  }

  // 🗺️ 住所の逆ジオコーディング（概念実装）
  async reverseGeocode(
    latitude: number,
    longitude: number
  ): Promise<{
    address: string;
    city: string;
    country: string;
    postalCode?: string;
  } | null> {
    try {
      // 実際の実装では地図サービスAPIを使用
      // 例: Google Maps Geocoding API, OpenStreetMap Nominatim等
      
      console.log(`🗺️ Reverse geocoding: ${latitude}, ${longitude}`);
      
      // モック実装
      return {
        address: '東京都千代田区丸の内1-1',
        city: '東京都千代田区',
        country: '日本',
        postalCode: '100-0005'
      };
    } catch (error) {
      console.error('❌ Reverse geocoding failed:', error);
      return null;
    }
  }

  // 🏢 近くの場所検索（概念実装）
  async findNearbyPlaces(
    type: 'restaurant' | 'hospital' | 'gas_station' | 'atm' | 'store',
    radius: number = 1000
  ): Promise<Array<{
    name: string;
    latitude: number;
    longitude: number;
    distance: number;
    type: string;
  }>> {
    if (!this.currentPosition) {
      throw new Error('Current position not available');
    }

    try {
      console.log(`🔍 Searching for nearby ${type} within ${radius}m`);
      
      // モック実装
      const mockPlaces = [
        {
          name: 'サンプル施設1',
          latitude: this.currentPosition.latitude + 0.001,
          longitude: this.currentPosition.longitude + 0.001,
          distance: 150,
          type
        },
        {
          name: 'サンプル施設2',
          latitude: this.currentPosition.latitude - 0.002,
          longitude: this.currentPosition.longitude + 0.001,
          distance: 300,
          type
        }
      ];

      return mockPlaces.filter(place => place.distance <= radius);
    } catch (error) {
      console.error('❌ Nearby places search failed:', error);
      return [];
    }
  }

  // ⚙️ 設定の更新
  updateSettings(newSettings: Partial<LocationSettings>): void {
    this.settings = { ...this.settings, ...newSettings };
    console.log('⚙️ Geolocation settings updated:', this.settings);
  }

  // 📊 位置情報統計
  getLocationStats(): {
    isTracking: boolean;
    hasCurrentPosition: boolean;
    accuracy?: number;
    lastUpdate?: Date;
    listenerCount: number;
  } {
    return {
      isTracking: this.isTracking,
      hasCurrentPosition: !!this.currentPosition,
      accuracy: this.currentPosition?.accuracy,
      lastUpdate: this.currentPosition ? new Date(this.currentPosition.timestamp) : undefined,
      listenerCount: this.listeners.length
    };
  }

  // 🔍 位置情報権限の確認
  async checkPermission(): Promise<{
    state: PermissionState;
    canRequest: boolean;
  }> {
    if (!('permissions' in navigator)) {
      return {
        state: 'prompt',
        canRequest: true
      };
    }

    try {
      const permission = await navigator.permissions.query({ name: 'geolocation' });
      
      return {
        state: permission.state,
        canRequest: permission.state !== 'denied'
      };
    } catch (error) {
      console.error('❌ Failed to check geolocation permission:', error);
      return {
        state: 'prompt',
        canRequest: true
      };
    }
  }

  // 🧹 クリーンアップ
  cleanup(): void {
    this.stopTracking();
    this.listeners = [];
    this.errorListeners = [];
    this.currentPosition = null;
    console.log('🧹 Geolocation service cleaned up');
  }

  // 🔍 機能サポート確認
  static checkGeolocationSupport(): {
    basic: boolean;
    watchPosition: boolean;
    permissions: boolean;
  } {
    return {
      basic: 'geolocation' in navigator,
      watchPosition: 'geolocation' in navigator && 'watchPosition' in navigator.geolocation,
      permissions: 'permissions' in navigator
    };
  }

  // 📱 デバイス向きの取得（可能な場合）
  async getDeviceOrientation(): Promise<{
    alpha: number | null;
    beta: number | null;
    gamma: number | null;
  } | null> {
    return new Promise((resolve) => {
      if (!('DeviceOrientationEvent' in window)) {
        resolve(null);
        return;
      }

      const handleOrientation = (event: DeviceOrientationEvent) => {
        resolve({
          alpha: event.alpha, // Z軸周りの回転
          beta: event.beta,   // X軸周りの回転
          gamma: event.gamma  // Y軸周りの回転
        });
        
        window.removeEventListener('deviceorientation', handleOrientation);
      };

      window.addEventListener('deviceorientation', handleOrientation);
      
      // 3秒後にタイムアウト
      setTimeout(() => {
        window.removeEventListener('deviceorientation', handleOrientation);
        resolve(null);
      }, 3000);
    });
  }
}

// シングルトンインスタンス
export const geolocationService = new GeolocationService();

export default GeolocationService;