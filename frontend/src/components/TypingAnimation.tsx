import React, { useState, useEffect, useRef, useCallback } from 'react';

interface TypingAnimationProps {
  text: string;
  speed?: number;
  onComplete?: () => void;
  showCursor?: boolean;
  soundEnabled?: boolean;
  variant?: 'default' | 'glitch' | 'matrix' | 'hologram' | 'cyber' | 'neon';
}

const TypingAnimation: React.FC<TypingAnimationProps> = ({
  text,
  speed = 50,
  onComplete,
  showCursor = true,
  soundEnabled = true,
  variant = 'default'
}) => {
  const [displayText, setDisplayText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTyping, setIsTyping] = useState(true);
  const [showGlitch, setShowGlitch] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize audio context
  const initAudio = useCallback(() => {
    if (!soundEnabled || audioContextRef.current) return;
    try {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    } catch (error) {
      console.warn('Web Audio API not supported');
    }
  }, [soundEnabled]);

  // Generate typing sound
  const playTypingSound = useCallback(() => {
    if (!soundEnabled || !audioContextRef.current) return;
    
    const audioContext = audioContextRef.current;
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    // Random frequency for typing variety
    oscillator.frequency.setValueAtTime(800 + Math.random() * 200, audioContext.currentTime);
    oscillator.type = 'square';
    
    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.1);
  }, [soundEnabled]);

  // Generate glitch text for matrix/glitch variants
  const generateGlitchChar = useCallback(() => {
    const glitchChars = '!@#$%^&*()_+-=[]{}|;:,.<>?~`';
    const matrixChars = 'ﾊﾐﾋｰｳｼﾅﾓﾆｻﾜﾂｵﾘｱﾎﾃﾏｹﾒｴｶｷﾑﾕﾗｾﾈｽﾀﾇﾍｦｲｸｺｿﾁﾄﾉﾌﾔﾖﾙﾚﾛﾝ';
    
    return variant === 'matrix' 
      ? matrixChars[Math.floor(Math.random() * matrixChars.length)]
      : glitchChars[Math.floor(Math.random() * glitchChars.length)];
  }, [variant]);

  // Typing effect
  useEffect(() => {
    if (currentIndex >= text.length) {
      setIsTyping(false);
      onComplete?.();
      return;
    }

    const currentSpeed = variant === 'glitch' 
      ? speed + Math.random() * 100 
      : variant === 'matrix'
      ? speed * 0.7
      : speed;

    intervalRef.current = setTimeout(() => {
      // Glitch effect
      if ((variant === 'glitch' || variant === 'matrix') && Math.random() < 0.1) {
        setShowGlitch(true);
        setDisplayText(text.slice(0, currentIndex) + generateGlitchChar());
        
        setTimeout(() => {
          setShowGlitch(false);
          setDisplayText(text.slice(0, currentIndex + 1));
          setCurrentIndex(prev => prev + 1);
          playTypingSound();
        }, 50);
      } else {
        setDisplayText(text.slice(0, currentIndex + 1));
        setCurrentIndex(prev => prev + 1);
        playTypingSound();
      }
    }, currentSpeed);

    return () => {
      if (intervalRef.current) {
        clearTimeout(intervalRef.current);
      }
    };
  }, [currentIndex, text, speed, variant, generateGlitchChar, playTypingSound, onComplete]);

  // Initialize audio on first interaction
  useEffect(() => {
    const handleUserInteraction = () => {
      initAudio();
      document.removeEventListener('click', handleUserInteraction);
      document.removeEventListener('keydown', handleUserInteraction);
    };

    document.addEventListener('click', handleUserInteraction);
    document.addEventListener('keydown', handleUserInteraction);

    return () => {
      document.removeEventListener('click', handleUserInteraction);
      document.removeEventListener('keydown', handleUserInteraction);
    };
  }, [initAudio]);

  const getVariantClasses = () => {
    switch (variant) {
      case 'glitch':
        return `
          ${showGlitch ? 'animate-pulse text-red-500' : ''}
          filter ${showGlitch ? 'hue-rotate-180 saturate-200' : ''}
        `;
      case 'matrix':
        return `
          text-green-400 font-mono
          ${showGlitch ? 'animate-bounce' : ''}
          drop-shadow-[0_0_10px_rgba(0,255,0,0.8)]
        `;
      case 'hologram':
        return `
          text-cyan-400 
          drop-shadow-[0_0_10px_rgba(0,255,255,0.6)]
          animate-pulse
        `;
      case 'cyber':
        return `
          text-cyan-400 
          drop-shadow-[0_0_10px_rgba(0,255,255,0.8)]
          filter brightness-110
        `;
      case 'neon':
        return `
          text-pink-400 
          drop-shadow-[0_0_10px_rgba(255,0,255,0.8)]
          animate-pulse
        `;
      default:
        return '';
    }
  };

  const getCursorClass = () => {
    switch (variant) {
      case 'matrix':
        return 'animate-ping text-green-400 drop-shadow-[0_0_5px_rgba(0,255,0,1)]';
      case 'hologram':
        return 'animate-pulse text-cyan-400 drop-shadow-[0_0_5px_rgba(0,255,255,1)]';
      case 'glitch':
        return 'animate-bounce text-red-500';
      case 'cyber':
        return 'animate-pulse text-cyan-400 drop-shadow-[0_0_5px_rgba(0,255,255,1)]';
      case 'neon':
        return 'animate-pulse text-pink-400 drop-shadow-[0_0_5px_rgba(255,0,255,1)]';
      default:
        return 'animate-pulse text-blue-500';
    }
  };

  return (
    <span className={`relative ${getVariantClasses()}`}>
      {/* Main text */}
      <span className="relative z-10">
        {displayText}
        {showCursor && isTyping && (
          <span className={`ml-1 ${getCursorClass()}`}>|</span>
        )}
      </span>
      
      {/* Hologram scan effect */}
      {variant === 'hologram' && (
        <span 
          className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-400/30 to-transparent animate-ping"
          style={{ animationDuration: '2s' }}
        />
      )}
      
      {/* Matrix rain effect */}
      {variant === 'matrix' && (
        <span className="absolute -top-1 -bottom-1 left-0 right-0 overflow-hidden pointer-events-none">
          {Array.from({ length: 5 }).map((_, i) => (
            <span
              key={i}
              className="absolute text-green-300/30 animate-bounce text-xs"
              style={{
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: '3s'
              }}
            >
              {generateGlitchChar()}
            </span>
          ))}
        </span>
      )}
      
      {/* Glitch overlay */}
      {variant === 'glitch' && showGlitch && (
        <>
          <span 
            className="absolute inset-0 text-red-500 opacity-70"
            style={{ transform: 'translateX(2px)' }}
          >
            {displayText}
          </span>
          <span 
            className="absolute inset-0 text-cyan-500 opacity-70"
            style={{ transform: 'translateX(-2px)' }}
          >
            {displayText}
          </span>
        </>
      )}
    </span>
  );
};

export default TypingAnimation;