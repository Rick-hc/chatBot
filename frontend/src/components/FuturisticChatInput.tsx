import React, { useState, useRef, useEffect, useCallback } from 'react';
import GlassmorphicCard from './GlassmorphicCard';
import VoiceWaveform from './VoiceWaveform';
import { useSpeech } from '../hooks/useSpeech';

interface FuturisticChatInputProps {
  onSendMessage: (message: string) => void;
  isLoading: boolean;
  variant?: 'cyber' | 'hologram' | 'matrix' | 'neon';
  placeholder?: string;
  enableVoice?: boolean;
}

const FuturisticChatInput: React.FC<FuturisticChatInputProps> = ({
  onSendMessage,
  isLoading,
  variant = 'cyber',
  placeholder = "未来への質問を入力...",
  enableVoice = true
}) => {
  const [message, setMessage] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [showVoicePanel, setShowVoicePanel] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const {
    isListening,
    transcript,
    confidence,
    audioLevel,
    startListening,
    stopListening,
    resetTranscript,
    isSupported: speechSupported
  } = useSpeech({
    onFinalTranscript: (text) => {
      setMessage(prev => prev + text);
      setShowVoicePanel(false);
      textareaRef.current?.focus();
    },
    continuous: false,
    language: 'ja-JP'
  });

  const getVariantConfig = () => {
    switch (variant) {
      case 'cyber':
        return {
          theme: 'cyber' as const,
          borderColor: 'border-cyan-400/50',
          focusBorder: 'border-cyan-400',
          buttonGradient: 'from-cyan-500 to-purple-600',
          glowColor: 'shadow-cyan-500/50',
          textColor: 'text-cyan-100',
          placeholder: 'placeholder-cyan-300/50'
        };
      case 'hologram':
        return {
          theme: 'hologram' as const,
          borderColor: 'border-blue-400/50',
          focusBorder: 'border-blue-400',
          buttonGradient: 'from-blue-500 to-cyan-600',
          glowColor: 'shadow-blue-500/50',
          textColor: 'text-blue-100',
          placeholder: 'placeholder-blue-300/50'
        };
      case 'matrix':
        return {
          theme: 'matrix' as const,
          borderColor: 'border-green-400/50',
          focusBorder: 'border-green-400',
          buttonGradient: 'from-green-500 to-emerald-600',
          glowColor: 'shadow-green-500/50',
          textColor: 'text-green-100',
          placeholder: 'placeholder-green-300/50'
        };
      case 'neon':
        return {
          theme: 'neon' as const,
          borderColor: 'border-pink-400/50',
          focusBorder: 'border-pink-400',
          buttonGradient: 'from-pink-500 to-purple-600',
          glowColor: 'shadow-pink-500/50',
          textColor: 'text-pink-100',
          placeholder: 'placeholder-pink-300/50'
        };
    }
  };

  const config = getVariantConfig();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !isLoading) {
      onSendMessage(message.trim());
      setMessage('');
      adjustTextareaHeight();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const adjustTextareaHeight = useCallback(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      const scrollHeight = textarea.scrollHeight;
      const maxHeight = 120;
      textarea.style.height = `${Math.min(scrollHeight, maxHeight)}px`;
    }
  }, []);

  const handleVoiceToggle = () => {
    if (isListening) {
      stopListening();
      setShowVoicePanel(false);
    } else {
      setShowVoicePanel(true);
      startListening();
    }
  };

  useEffect(() => {
    adjustTextareaHeight();
  }, [message, adjustTextareaHeight]);

  useEffect(() => {
    if (transcript && isListening) {
      setMessage(transcript);
    }
  }, [transcript, isListening]);

  const canSend = message.trim().length > 0 && !isLoading;

  return (
    <div className="relative">
      {/* Voice Panel */}
      {showVoicePanel && (
        <div className="absolute bottom-full left-0 right-0 mb-4">
          <GlassmorphicCard variant={variant} intensity="high" className="p-6">
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <VoiceWaveform
                  audioLevel={audioLevel}
                  isActive={isListening}
                  variant={variant}
                  size="large"
                />
              </div>
              
              <p className={`text-sm mb-2 ${config.textColor}`}>
                {isListening ? 'マイクで話してください...' : '音声認識を準備中...'}
              </p>
              
              {confidence > 0 && (
                <div className="mb-3">
                  <div className={`text-xs mb-1 ${config.textColor} opacity-70`}>
                    信頼度: {Math.round(confidence * 100)}%
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-1">
                    <div 
                      className={`h-1 rounded-full bg-gradient-to-r ${config.buttonGradient} transition-all duration-300`}
                      style={{ width: `${confidence * 100}%` }}
                    />
                  </div>
                </div>
              )}
              
              <div className="flex justify-center space-x-3">
                <button
                  onClick={handleVoiceToggle}
                  className={`px-4 py-2 rounded-lg text-sm transition-all duration-200 ${
                    isListening 
                      ? 'bg-red-500 hover:bg-red-600 text-white' 
                      : `bg-gradient-to-r ${config.buttonGradient} text-white hover:scale-105`
                  }`}
                >
                  {isListening ? '停止' : '再開'}
                </button>
                
                <button
                  onClick={() => {
                    resetTranscript();
                    setShowVoicePanel(false);
                  }}
                  className="px-4 py-2 rounded-lg text-sm bg-white/10 hover:bg-white/20 transition-all duration-200"
                >
                  キャンセル
                </button>
              </div>
            </div>
          </GlassmorphicCard>
        </div>
      )}

      {/* Main Input */}
      <GlassmorphicCard 
        variant={variant} 
        intensity="high" 
        animated={true}
        className="p-4"
      >
        <form onSubmit={handleSubmit} className="relative">
          <div className={`
            relative border-2 rounded-2xl transition-all duration-300
            ${isFocused ? config.focusBorder : config.borderColor}
            ${isFocused ? config.glowColor : ''}
            bg-black/20 backdrop-blur-sm
          `}>
            <textarea
              ref={textareaRef}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              placeholder={placeholder}
              disabled={isLoading}
              className={`
                w-full px-4 py-3 pr-20
                bg-transparent border-none outline-none resize-none
                ${config.textColor} ${config.placeholder}
                min-h-[50px] max-h-[120px]
                scrollbar-thin
              `}
              rows={1}
            />
            
            {/* Button Container */}
            <div className="absolute right-2 bottom-2 flex items-center space-x-2">
              {/* Voice Button */}
              {enableVoice && speechSupported && (
                <button
                  type="button"
                  onClick={handleVoiceToggle}
                  className={`
                    w-8 h-8 rounded-full flex items-center justify-center
                    transition-all duration-200 transform hover:scale-110
                    ${isListening 
                      ? 'bg-red-500 animate-pulse' 
                      : `bg-gradient-to-r ${config.buttonGradient} hover:shadow-lg`
                    }
                    text-white
                  `}
                  title="音声入力"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                  </svg>
                </button>
              )}

              {/* Send Button */}
              <button
                type="submit"
                disabled={!canSend}
                className={`
                  w-8 h-8 rounded-full flex items-center justify-center
                  transition-all duration-200 transform
                  ${canSend 
                    ? `bg-gradient-to-r ${config.buttonGradient} hover:scale-110 hover:shadow-xl text-white shadow-lg` 
                    : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                  }
                `}
                title="送信"
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                )}
              </button>
            </div>
          </div>
          
          {/* Helper Text */}
          <div className="flex justify-between items-center mt-3 px-2">
            <span className="text-xs opacity-60">
              {enableVoice && speechSupported ? 'Shift + Enter で改行 | 音声入力対応' : 'Shift + Enter で改行'}
            </span>
            
            <div className="flex items-center space-x-3">
              {/* Character Counter */}
              <span className={`text-xs transition-colors ${
                message.length > 800 
                  ? 'text-red-400' 
                  : message.length > 600 
                    ? 'text-yellow-400' 
                    : 'opacity-50'
              }`}>
                {message.length}/1000
              </span>
              
              {/* Voice Status Indicator */}
              {isListening && (
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse" />
                  <span className="text-xs text-red-400">音声認識中</span>
                </div>
              )}
            </div>
          </div>
        </form>
      </GlassmorphicCard>
    </div>
  );
};

export default FuturisticChatInput;