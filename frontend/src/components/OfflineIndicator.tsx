// 🚀 ULTIMATE Offline Indicator - 完璧なオフライン状態表示
import React, { useState, useEffect } from 'react';
import { usePWA } from '../hooks/usePWA';
import { indexedDBService } from '../services/IndexedDBService';

interface OfflineIndicatorProps {
  className?: string;
}

const OfflineIndicator: React.FC<OfflineIndicatorProps> = ({ className = '' }) => {
  const { isOnline, registerBackgroundSync } = usePWA();
  const [pendingCount, setPendingCount] = useState(0);
  const [lastSync, setLastSync] = useState<Date | null>(null);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'error'>('idle');

  // 未同期データの監視
  useEffect(() => {
    const updatePendingCount = async () => {
      try {
        const actions = await indexedDBService.getPendingActions();
        setPendingCount(actions.length);
      } catch (error) {
        console.error('❌ Failed to get pending actions:', error);
      }
    };

    updatePendingCount();
    const interval = setInterval(updatePendingCount, 5000);
    return () => clearInterval(interval);
  }, []);

  // オンライン復旧時の自動同期
  useEffect(() => {
    if (isOnline && pendingCount > 0) {
      handleSync();
    }
  }, [isOnline, pendingCount]);

  // 同期処理
  const handleSync = async () => {
    if (syncStatus === 'syncing') return;

    setSyncStatus('syncing');
    try {
      await registerBackgroundSync('offline-actions');
      setLastSync(new Date());
      setSyncStatus('idle');
      
      // 同期後にカウントを更新
      setTimeout(async () => {
        const actions = await indexedDBService.getPendingActions();
        setPendingCount(actions.length);
      }, 2000);
    } catch (error) {
      console.error('❌ Sync failed:', error);
      setSyncStatus('error');
    }
  };

  // スタイルの決定
  const getStatusStyle = () => {
    if (!isOnline) {
      return 'bg-red-500 text-white';
    }
    if (pendingCount > 0) {
      return 'bg-yellow-500 text-white';
    }
    return 'bg-green-500 text-white';
  };

  const getStatusIcon = () => {
    if (!isOnline) return '🔌';
    if (syncStatus === 'syncing') return '🔄';
    if (pendingCount > 0) return '⏳';
    return '🌐';
  };

  const getStatusText = () => {
    if (!isOnline) return 'オフライン';
    if (syncStatus === 'syncing') return '同期中...';
    if (pendingCount > 0) return `未同期: ${pendingCount}件`;
    return 'オンライン';
  };

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      {/* メインステータス表示 */}
      <div className={`
        flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-medium
        transition-all duration-300 shadow-sm
        ${getStatusStyle()}
      `}>
        <span className={`
          ${syncStatus === 'syncing' ? 'animate-spin' : ''}
          text-lg
        `}>
          {getStatusIcon()}
        </span>
        <span>{getStatusText()}</span>
      </div>

      {/* 詳細情報ポップオーバー */}
      {(pendingCount > 0 || !isOnline) && (
        <div className="relative group">
          <button className="text-gray-500 hover:text-gray-700 text-sm">
            ℹ️
          </button>
          <div className="
            absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2
            bg-gray-900 text-white text-xs rounded py-2 px-3 w-64
            opacity-0 group-hover:opacity-100 transition-opacity duration-200
            pointer-events-none group-hover:pointer-events-auto
            z-50
          ">
            <div className="space-y-1">
              {!isOnline && (
                <div className="flex items-center space-x-2">
                  <span>🔌</span>
                  <span>インターネット接続がありません</span>
                </div>
              )}
              {pendingCount > 0 && (
                <div className="flex items-center space-x-2">
                  <span>⏳</span>
                  <span>{pendingCount}件のデータが同期待ちです</span>
                </div>
              )}
              {lastSync && (
                <div className="flex items-center space-x-2 text-xs opacity-75">
                  <span>🕒</span>
                  <span>最終同期: {lastSync.toLocaleTimeString()}</span>
                </div>
              )}
              <div className="mt-2 pt-1 border-t border-gray-700">
                <div className="text-xs opacity-75">
                  オフライン時も質問・回答の閲覧が可能です
                </div>
              </div>
            </div>
            {/* ツールチップの矢印 */}
            <div className="
              absolute top-full left-1/2 transform -translate-x-1/2
              border-4 border-transparent border-t-gray-900
            "></div>
          </div>
        </div>
      )}

      {/* 手動同期ボタン */}
      {isOnline && pendingCount > 0 && (
        <button
          onClick={handleSync}
          disabled={syncStatus === 'syncing'}
          className="
            px-2 py-1 text-xs bg-blue-500 hover:bg-blue-600 text-white
            rounded transition-colors duration-200 disabled:opacity-50
            disabled:cursor-not-allowed
          "
        >
          {syncStatus === 'syncing' ? (
            <span className="flex items-center space-x-1">
              <span className="animate-spin">🔄</span>
              <span>同期中</span>
            </span>
          ) : (
            '同期'
          )}
        </button>
      )}
    </div>
  );
};

export default OfflineIndicator;