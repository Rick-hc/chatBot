import React, { useState, useEffect } from 'react';
import GlassmorphicCard from './GlassmorphicCard';
import TypingAnimation from './TypingAnimation';
import ConfidenceMeter from './ConfidenceMeter';
import FuturisticLoader from './FuturisticLoader';
import { useTextToSpeech } from '../hooks/useSpeech';

interface FuturisticChatMessageProps {
  message: string;
  isUser: boolean;
  timestamp: Date;
  isLoading?: boolean;
  confidence?: number;
  variant?: 'cyber' | 'hologram' | 'matrix' | 'neon';
  enableVoice?: boolean;
  candidates?: any[];
  onCandidateSelected?: (candidate: any) => void;
}

const FuturisticChatMessage: React.FC<FuturisticChatMessageProps> = ({
  message,
  isUser,
  timestamp,
  isLoading = false,
  confidence = 0.85,
  variant = 'cyber',
  enableVoice = true,
  candidates,
  onCandidateSelected
}) => {
  const [showTyping, setShowTyping] = useState(!isUser && !isLoading);
  const [displayMessage, setDisplayMessage] = useState(isUser ? message : '');
  const [isHovered, setIsHovered] = useState(false);
  const { speak, isSpeaking } = useTextToSpeech();

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('ja-JP', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const getVariantConfig = () => {
    switch (variant) {
      case 'cyber':
        return {
          theme: 'cyber' as const,
          avatarGradient: 'from-cyan-400 via-purple-500 to-pink-500',
          messageGradient: isUser ? 'from-purple-600 to-pink-600' : 'from-cyan-500/20 to-purple-500/20',
          borderColor: 'border-cyan-400/30',
          glowColor: 'shadow-cyan-500/25',
          textColor: isUser ? 'text-white' : 'text-cyan-100'
        };
      case 'hologram':
        return {
          theme: 'hologram' as const,
          avatarGradient: 'from-blue-400 to-cyan-400',
          messageGradient: isUser ? 'from-blue-600 to-cyan-600' : 'from-blue-400/20 to-cyan-400/20',
          borderColor: 'border-blue-400/40',
          glowColor: 'shadow-blue-400/25',
          textColor: isUser ? 'text-white' : 'text-blue-100'
        };
      case 'matrix':
        return {
          theme: 'matrix' as const,
          avatarGradient: 'from-green-400 to-emerald-400',
          messageGradient: isUser ? 'from-green-600 to-emerald-600' : 'from-green-400/20 to-emerald-400/20',
          borderColor: 'border-green-400/40',
          glowColor: 'shadow-green-400/25',
          textColor: isUser ? 'text-white' : 'text-green-100'
        };
      case 'neon':
        return {
          theme: 'neon' as const,
          avatarGradient: 'from-yellow-400 via-pink-400 to-purple-400',
          messageGradient: isUser ? 'from-pink-600 to-purple-600' : 'from-yellow-400/20 to-pink-400/20',
          borderColor: 'border-pink-400/40',
          glowColor: 'shadow-pink-400/25',
          textColor: isUser ? 'text-white' : 'text-pink-100'
        };
    }
  };

  const config = getVariantConfig();

  useEffect(() => {
    if (!isUser && !isLoading && message) {
      setShowTyping(true);
      setDisplayMessage('');
    }
  }, [message, isUser, isLoading]);

  const handleTypingComplete = () => {
    setShowTyping(false);
    setDisplayMessage(message);
  };

  const handleSpeakMessage = () => {
    if (message && enableVoice) {
      speak(message, {
        rate: 0.9,
        pitch: isUser ? 1.1 : 0.9
      });
    }
  };

  if (isLoading) {
    return (
      <div className={`flex items-start space-x-4 mb-8 ${isUser ? 'flex-row-reverse space-x-reverse' : ''}`}>
        {/* Avatar */}
        <div className={`flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-br ${config.avatarGradient} flex items-center justify-center relative overflow-hidden`}>
          <div className="absolute inset-0 bg-black/20" />
          <FuturisticLoader variant={variant} size="small" />
        </div>

        {/* Loading Message */}
        <GlassmorphicCard 
          variant={variant} 
          intensity="high" 
          animated={true}
          className="flex-1 max-w-2xl"
        >
          <div className="flex items-center space-x-3">
            <FuturisticLoader variant="quantum" size="small" />
            <span className={`text-sm ${config.textColor}`}>
              AIが最適な回答を生成中...
            </span>
          </div>
        </GlassmorphicCard>
      </div>
    );
  }

  return (
    <div 
      className={`flex items-start space-x-4 mb-8 ${isUser ? 'flex-row-reverse space-x-reverse' : ''} transition-all duration-500 transform hover:scale-[1.01]`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Avatar with 3D effect */}
      <div className={`flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-br ${config.avatarGradient} flex items-center justify-center relative overflow-hidden transform transition-all duration-300 ${isHovered ? 'scale-110 rotate-3' : ''} ${config.glowColor}`}>
        {/* Hologram scan lines */}
        {variant === 'hologram' && (
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/20 to-transparent animate-pulse" />
        )}
        
        {/* Matrix rain effect */}
        {variant === 'matrix' && (
          <div className="absolute inset-0 opacity-30">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="absolute text-green-300 text-xs animate-bounce"
                style={{
                  left: `${20 + i * 20}%`,
                  top: `${10 + i * 20}%`,
                  animationDelay: `${i * 0.5}s`
                }}
              >
                {Math.random() > 0.5 ? '1' : '0'}
              </div>
            ))}
          </div>
        )}
        
        {/* Avatar Icon */}
        {isUser ? (
          <svg className="w-6 h-6 text-white relative z-10" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
          </svg>
        ) : (
          <svg className="w-6 h-6 text-white relative z-10" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
        )}
      </div>

      {/* Message Container */}
      <div className="flex-1 max-w-3xl">
        <GlassmorphicCard 
          variant={variant} 
          intensity="high" 
          animated={true}
          interactive={true}
          className="message-enter"
        >
          {/* Message Content */}
          <div className={`${config.textColor} leading-relaxed`}>
            {showTyping && !isUser ? (
              <TypingAnimation
                text={message}
                speed={50}
                onComplete={handleTypingComplete}
                variant={variant}
                soundEnabled={true}
              />
            ) : (
              <div className="whitespace-pre-wrap">
                {displayMessage || message}
              </div>
            )}
          </div>

          {/* Message Actions */}
          <div className="flex items-center justify-between mt-4 pt-3 border-t border-white/10">
            <div className="flex items-center space-x-3">
              {/* Timestamp */}
              <span className="text-xs opacity-60">
                {formatTime(timestamp)}
              </span>

              {/* Voice Button */}
              {enableVoice && message && (
                <button
                  onClick={handleSpeakMessage}
                  className={`p-1.5 rounded-full transition-all duration-200 hover:scale-110 ${
                    isSpeaking 
                      ? `bg-${variant === 'cyber' ? 'cyan' : variant === 'hologram' ? 'blue' : variant === 'matrix' ? 'green' : 'pink'}-400/30 animate-pulse` 
                      : 'hover:bg-white/10'
                  }`}
                  title="音声で読み上げ"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 14.142M9 9a1 1 0 000 2v3a1 1 0 001 1h4a1 1 0 100-2V9a1 1 0 00-1-1H9z" />
                  </svg>
                </button>
              )}
            </div>

            {/* Confidence Meter for AI messages */}
            {!isUser && (
              <ConfidenceMeter
                confidence={confidence}
                variant={variant}
                showValue={true}
                animated={true}
                className="w-32"
              />
            )}
          </div>
        </GlassmorphicCard>

        {/* Candidates Display */}
        {candidates && candidates.length > 0 && (
          <div className="mt-4">
            <GlassmorphicCard variant={variant} intensity="medium" className="p-4">
              <h4 className={`text-sm font-medium mb-3 ${config.textColor}`}>
                関連する回答候補 ({candidates.length}件)
              </h4>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {candidates.map((candidate, index) => (
                  <button
                    key={candidate.id}
                    onClick={() => onCandidateSelected?.(candidate)}
                    className={`w-full p-3 text-left rounded-lg transition-all duration-200 hover:scale-[1.02] ${config.borderColor} border bg-white/5 hover:bg-white/10`}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <span className={`text-xs font-medium ${config.textColor}`}>
                        #{index + 1}
                      </span>
                      <span className="text-xs opacity-60">
                        類似度: {(candidate.similarity * 100).toFixed(1)}%
                      </span>
                    </div>
                    <p className={`text-sm font-medium mb-1 ${config.textColor}`}>
                      {candidate.question}
                    </p>
                    <p className="text-xs opacity-70 line-clamp-2">
                      {candidate.answer.length > 80 
                        ? `${candidate.answer.substring(0, 80)}...` 
                        : candidate.answer
                      }
                    </p>
                  </button>
                ))}
              </div>
            </GlassmorphicCard>
          </div>
        )}
      </div>
    </div>
  );
};

export default FuturisticChatMessage;