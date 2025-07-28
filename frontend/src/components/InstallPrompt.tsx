// 🚀 ULTIMATE Install Prompt - 完璧なインストール促進UI
import React, { useState, useEffect } from 'react';
import { usePWA } from '../hooks/usePWA';

interface InstallPromptProps {
  className?: string;
}

const InstallPrompt: React.FC<InstallPromptProps> = ({ className = '' }) => {
  const { 
    isInstallable, 
    isInstalled, 
    isStandalone, 
    install,
    canShare,
    share
  } = usePWA();
  
  const [showPrompt, setShowPrompt] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [installing, setInstalling] = useState(false);

  // プロンプト表示の判定
  useEffect(() => {
    const hasBeenDismissed = localStorage.getItem('pwa-install-dismissed');
    
    if (isInstallable && !isInstalled && !isStandalone && !hasBeenDismissed) {
      // 少し遅延してからプロンプトを表示
      const timer = setTimeout(() => {
        setShowPrompt(true);
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [isInstallable, isInstalled, isStandalone]);

  // インストール処理
  const handleInstall = async () => {
    setInstalling(true);
    try {
      const success = await install();
      if (success) {
        setShowPrompt(false);
        console.log('✅ PWA installed successfully');
      } else {
        console.log('❌ PWA installation cancelled');
      }
    } catch (error) {
      console.error('❌ PWA installation failed:', error);
    } finally {
      setInstalling(false);
    }
  };

  // プロンプト非表示
  const handleDismiss = () => {
    setShowPrompt(false);
    setDismissed(true);
    localStorage.setItem('pwa-install-dismissed', 'true');
  };

  // 共有機能
  const handleShare = async () => {
    if (canShare) {
      await share({
        title: '企業チャットボット',
        text: 'AI知識アシスタントでスマートに質問解決',
        url: window.location.href
      });
    }
  };

  // インストール済みの場合は何も表示しない
  if (isInstalled || isStandalone || !showPrompt || dismissed) {
    return null;
  }

  return (
    <>
      {/* フローティングインストールボタン */}
      <div className={`
        fixed bottom-4 right-4 z-50 
        ${className}
      `}>
        <div className="
          bg-gradient-to-r from-blue-500 to-purple-600 
          text-white rounded-2xl shadow-2xl p-4
          transform transition-all duration-300 hover:scale-105
          max-w-sm
        ">
          <div className="flex items-start space-x-3">
            <div className="
              w-12 h-12 bg-white rounded-xl flex items-center justify-center
              text-2xl flex-shrink-0
            ">
              📱
            </div>
            
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-lg mb-1">
                アプリをインストール
              </h3>
              <p className="text-sm opacity-90 mb-3">
                ホーム画面に追加してネイティブアプリのように使用
              </p>
              
              <div className="flex space-x-2">
                <button
                  onClick={handleInstall}
                  disabled={installing}
                  className="
                    flex-1 bg-white text-blue-600 font-semibold py-2 px-4 
                    rounded-lg transition-colors duration-200
                    hover:bg-gray-100 disabled:opacity-50
                    disabled:cursor-not-allowed
                  "
                >
                  {installing ? (
                    <span className="flex items-center justify-center space-x-2">
                      <span className="animate-spin">⏳</span>
                      <span>インストール中...</span>
                    </span>
                  ) : (
                    'インストール'
                  )}
                </button>
                
                <button
                  onClick={handleDismiss}
                  className="
                    px-3 py-2 text-white opacity-75 hover:opacity-100
                    transition-opacity duration-200
                  "
                >
                  ✕
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* モーダル版インストールプロンプト（大画面用） */}
      <div className="
        fixed inset-0 bg-black bg-opacity-50 z-40 
        flex items-center justify-center p-4
        hidden lg:flex
      ">
        <div className="
          bg-white rounded-3xl shadow-2xl max-w-md w-full p-8
          transform transition-all duration-300
        ">
          <div className="text-center">
            <div className="
              w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600
              rounded-2xl flex items-center justify-center text-4xl text-white
              mx-auto mb-6
            ">
              🚀
            </div>
            
            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              企業チャットボットをインストール
            </h2>
            
            <p className="text-gray-600 mb-6 leading-relaxed">
              デスクトップやモバイルデバイスにインストールして、
              ネイティブアプリのような快適な体験をお楽しみください。
            </p>
            
            <div className="space-y-3 text-left mb-6">
              <div className="flex items-center space-x-3">
                <span className="text-green-500 text-xl">✅</span>
                <span className="text-gray-700">オフライン対応</span>
              </div>
              <div className="flex items-center space-x-3">
                <span className="text-green-500 text-xl">✅</span>
                <span className="text-gray-700">プッシュ通知</span>
              </div>
              <div className="flex items-center space-x-3">
                <span className="text-green-500 text-xl">✅</span>
                <span className="text-gray-700">高速起動</span>
              </div>
              <div className="flex items-center space-x-3">
                <span className="text-green-500 text-xl">✅</span>
                <span className="text-gray-700">デスクトップ統合</span>
              </div>
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={handleInstall}
                disabled={installing}
                className="
                  flex-1 bg-gradient-to-r from-blue-500 to-purple-600
                  text-white font-semibold py-3 px-6 rounded-xl
                  transition-all duration-200 hover:scale-105
                  disabled:opacity-50 disabled:cursor-not-allowed
                  disabled:hover:scale-100
                "
              >
                {installing ? (
                  <span className="flex items-center justify-center space-x-2">
                    <span className="animate-spin">⏳</span>
                    <span>インストール中...</span>
                  </span>
                ) : (
                  <span className="flex items-center justify-center space-x-2">
                    <span>📱</span>
                    <span>今すぐインストール</span>
                  </span>
                )}
              </button>
              
              {canShare && (
                <button
                  onClick={handleShare}
                  className="
                    px-4 py-3 bg-gray-100 text-gray-700 rounded-xl
                    transition-colors duration-200 hover:bg-gray-200
                  "
                >
                  🔗
                </button>
              )}
            </div>
            
            <button
              onClick={handleDismiss}
              className="
                mt-4 text-gray-500 hover:text-gray-700
                transition-colors duration-200 text-sm
              "
            >
              後で
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

// 小さなインストールボタン（ヘッダー用）
export const InstallButton: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { isInstallable, isInstalled, isStandalone, install } = usePWA();
  const [installing, setInstalling] = useState(false);

  if (isInstalled || isStandalone || !isInstallable) {
    return null;
  }

  const handleInstall = async () => {
    setInstalling(true);
    try {
      await install();
    } catch (error) {
      console.error('❌ Install failed:', error);
    } finally {
      setInstalling(false);
    }
  };

  return (
    <button
      onClick={handleInstall}
      disabled={installing}
      className={`
        flex items-center space-x-2 px-3 py-2 
        bg-blue-500 hover:bg-blue-600 text-white
        rounded-lg transition-colors duration-200
        disabled:opacity-50 disabled:cursor-not-allowed
        text-sm font-medium
        ${className}
      `}
    >
      <span className={installing ? 'animate-spin' : ''}>
        {installing ? '⏳' : '📱'}
      </span>
      <span>{installing ? 'インストール中...' : 'インストール'}</span>
    </button>
  );
};

export default InstallPrompt;