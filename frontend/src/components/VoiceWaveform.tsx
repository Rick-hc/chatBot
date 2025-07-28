import React, { useEffect, useRef, useCallback } from 'react';

interface VoiceWaveformProps {
  audioLevel: number;
  isActive: boolean;
  variant?: 'default' | 'cyber' | 'hologram' | 'neon' | 'matrix';
  size?: 'small' | 'medium' | 'large';
  className?: string;
}

const VoiceWaveform: React.FC<VoiceWaveformProps> = ({
  audioLevel,
  isActive,
  variant = 'default',
  size = 'medium',
  className = ''
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number>();
  const waveDataRef = useRef<number[]>([]);

  const getSizeConfig = () => {
    switch (size) {
      case 'small':
        return { width: 120, height: 40, bars: 20 };
      case 'medium':
        return { width: 200, height: 60, bars: 30 };
      case 'large':
        return { width: 300, height: 80, bars: 40 };
    }
  };

  const getVariantColors = () => {
    switch (variant) {
      case 'cyber':
        return {
          primary: '#00ffff',
          secondary: '#ff00ff',
          glow: 'rgba(0, 255, 255, 0.8)'
        };
      case 'hologram':
        return {
          primary: '#4facfe',
          secondary: '#00f2fe',
          glow: 'rgba(79, 172, 254, 0.8)'
        };
      case 'neon':
        return {
          primary: '#00ff00',
          secondary: '#ffff00',
          glow: 'rgba(0, 255, 0, 0.8)'
        };
      case 'matrix':
        return {
          primary: '#00ff00',
          secondary: '#008000',
          glow: 'rgba(0, 255, 0, 0.8)'
        };
      default:
        return {
          primary: '#3b82f6',
          secondary: '#8b5cf6',
          glow: 'rgba(59, 130, 246, 0.8)'
        };
    }
  };

  const animate = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { width, height, bars } = getSizeConfig();
    const colors = getVariantColors();

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Update wave data
    if (isActive) {
      waveDataRef.current.push(audioLevel);
      if (waveDataRef.current.length > bars) {
        waveDataRef.current.shift();
      }
    } else {
      // Fade out effect
      waveDataRef.current = waveDataRef.current.map(value => value * 0.95);
    }

    // Fill with default values if needed
    while (waveDataRef.current.length < bars) {
      waveDataRef.current.unshift(0);
    }

    const barWidth = width / bars;
    const centerY = height / 2;

    waveDataRef.current.forEach((level, index) => {
      const x = index * barWidth;
      const barHeight = level * height * 0.8;
      const y = centerY - barHeight / 2;

      // Create gradient
      const gradient = ctx.createLinearGradient(0, y, 0, y + barHeight);
      gradient.addColorStop(0, colors.primary);
      gradient.addColorStop(1, colors.secondary);

      // Set glow effect
      ctx.shadowColor = colors.glow;
      ctx.shadowBlur = variant === 'cyber' ? 15 : variant === 'neon' ? 20 : 10;

      // Draw bar
      ctx.fillStyle = gradient;
      ctx.fillRect(x + 1, y, barWidth - 2, barHeight);

      // Add reflection for hologram variant
      if (variant === 'hologram') {
        const reflectionGradient = ctx.createLinearGradient(0, y + barHeight, 0, y + barHeight * 1.5);
        reflectionGradient.addColorStop(0, colors.primary + '40');
        reflectionGradient.addColorStop(1, 'transparent');
        
        ctx.fillStyle = reflectionGradient;
        ctx.fillRect(x + 1, y + barHeight, barWidth - 2, barHeight * 0.3);
      }

      // Add glitch effect for cyber variant
      if (variant === 'cyber' && Math.random() < 0.1) {
        ctx.fillStyle = '#ff0080';
        ctx.fillRect(x + 1, y + Math.random() * 10 - 5, barWidth - 2, 2);
      }
    });

    // Reset shadow
    ctx.shadowBlur = 0;

    animationFrameRef.current = requestAnimationFrame(animate);
  }, [audioLevel, isActive, variant, size]);

  useEffect(() => {
    animate();
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [animate]);

  const { width, height } = getSizeConfig();

  return (
    <div className={`relative ${className}`}>
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        className="block"
        style={{
          background: variant === 'hologram' 
            ? 'linear-gradient(180deg, rgba(0,0,0,0.1) 0%, rgba(79,172,254,0.1) 100%)'
            : 'transparent'
        }}
      />
      
      {/* Animated border for active state */}
      {isActive && (
        <div 
          className={`absolute inset-0 rounded-lg border-2 ${
            variant === 'cyber' ? 'border-cyan-400 animate-pulse' :
            variant === 'hologram' ? 'border-blue-400 animate-ping' :
            variant === 'neon' ? 'border-green-400 animate-bounce' :
            variant === 'matrix' ? 'border-green-400 animate-pulse' :
            'border-blue-400 animate-pulse'
          }`}
          style={{
            boxShadow: variant === 'cyber' ? '0 0 20px rgba(0, 255, 255, 0.5)' :
                       variant === 'hologram' ? '0 0 20px rgba(79, 172, 254, 0.5)' :
                       variant === 'neon' ? '0 0 20px rgba(0, 255, 0, 0.5)' :
                       variant === 'matrix' ? '0 0 20px rgba(0, 255, 0, 0.5)' :
                       '0 0 20px rgba(59, 130, 246, 0.5)'
          }}
        />
      )}
    </div>
  );
};

export default VoiceWaveform;