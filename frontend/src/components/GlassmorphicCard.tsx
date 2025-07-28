import React, { ReactNode } from 'react';

interface GlassmorphicCardProps {
  children: ReactNode;
  className?: string;
  intensity?: 'low' | 'medium' | 'high' | 'extreme';
  variant?: 'default' | 'cyber' | 'hologram' | 'neon' | 'matrix';
  animated?: boolean;
  interactive?: boolean;
}

const GlassmorphicCard: React.FC<GlassmorphicCardProps> = ({
  children,
  className = '',
  intensity = 'medium',
  variant = 'default',
  animated = true,
  interactive = true
}) => {
  const getIntensityStyles = () => {
    switch (intensity) {
      case 'low':
        return {
          backdropBlur: 'backdrop-blur-sm',
          background: 'bg-white/10 dark:bg-white/5',
          border: 'border border-white/20 dark:border-white/10'
        };
      case 'medium':
        return {
          backdropBlur: 'backdrop-blur-md',
          background: 'bg-white/20 dark:bg-white/10',
          border: 'border border-white/30 dark:border-white/20'
        };
      case 'high':
        return {
          backdropBlur: 'backdrop-blur-lg',
          background: 'bg-white/30 dark:bg-white/15',
          border: 'border border-white/40 dark:border-white/25'
        };
      case 'extreme':
        return {
          backdropBlur: 'backdrop-blur-xl',
          background: 'bg-white/40 dark:bg-white/20',
          border: 'border border-white/50 dark:border-white/30'
        };
    }
  };

  const getVariantStyles = () => {
    switch (variant) {
      case 'cyber':
        return {
          background: 'bg-gradient-to-br from-cyan-500/20 via-purple-500/20 to-pink-500/20',
          shadow: 'shadow-2xl shadow-cyan-500/25',
          glow: 'before:absolute before:inset-0 before:rounded-2xl before:bg-gradient-to-r before:from-cyan-400/20 before:to-purple-400/20 before:blur-xl before:-z-10',
          border: 'border border-cyan-400/30'
        };
      case 'hologram':
        return {
          background: 'bg-gradient-to-br from-blue-400/20 via-cyan-400/20 to-teal-400/20',
          shadow: 'shadow-2xl shadow-blue-400/25',
          glow: 'before:absolute before:inset-0 before:rounded-2xl before:bg-gradient-to-r before:from-blue-400/20 before:to-cyan-400/20 before:blur-xl before:-z-10',
          border: 'border border-blue-400/40'
        };
      case 'neon':
        return {
          background: 'bg-gradient-to-br from-green-400/20 via-yellow-400/20 to-pink-400/20',
          shadow: 'shadow-2xl shadow-green-400/25',
          glow: 'before:absolute before:inset-0 before:rounded-2xl before:bg-gradient-to-r before:from-green-400/20 before:to-pink-400/20 before:blur-xl before:-z-10',
          border: 'border border-green-400/40'
        };
      case 'matrix':
        return {
          background: 'bg-gradient-to-br from-green-400/20 via-emerald-400/20 to-green-600/20',
          shadow: 'shadow-2xl shadow-green-400/25',
          glow: 'before:absolute before:inset-0 before:rounded-2xl before:bg-gradient-to-r before:from-green-400/20 before:to-emerald-400/20 before:blur-xl before:-z-10',
          border: 'border border-green-400/40'
        };
      default:
        return {
          background: '',
          shadow: 'shadow-2xl shadow-black/10 dark:shadow-black/30',
          glow: '',
          border: ''
        };
    }
  };

  const intensityStyles = getIntensityStyles();
  const variantStyles = getVariantStyles();

  const baseClasses = `
    relative rounded-2xl
    ${intensityStyles.backdropBlur}
    ${variantStyles.background || intensityStyles.background}
    ${variantStyles.border || intensityStyles.border}
    ${variantStyles.shadow}
    ${animated ? 'transition-all duration-500 ease-in-out' : ''}
    ${interactive ? 'transform hover:scale-[1.02] hover:rotate-1 hover:shadow-3xl' : ''}
    ${variantStyles.glow ? variantStyles.glow : ''}
  `;

  const innerGlowClass = `
    absolute inset-0 rounded-2xl
    bg-gradient-to-br from-white/10 via-transparent to-transparent
    pointer-events-none
  `;

  const reflectionClass = `
    absolute top-0 left-0 right-0 h-1/2 rounded-t-2xl
    bg-gradient-to-b from-white/20 to-transparent
    pointer-events-none
  `;

  return (
    <div 
      className={`${baseClasses} ${className}`}
      style={{
        backdropFilter: `blur(${intensity === 'extreme' ? '20px' : intensity === 'high' ? '16px' : intensity === 'medium' ? '12px' : '8px'})`,
        WebkitBackdropFilter: `blur(${intensity === 'extreme' ? '20px' : intensity === 'high' ? '16px' : intensity === 'medium' ? '12px' : '8px'})`
      }}
    >
      {/* Inner glow effect */}
      <div className={innerGlowClass} />
      
      {/* Reflection effect */}
      <div className={reflectionClass} />
      
      {/* Content */}
      <div className="relative z-10 p-6">
        {children}
      </div>
      
      {/* Animated border glow for cyber variant */}
      {variant === 'cyber' && animated && (
        <div className="absolute inset-0 rounded-2xl">
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-cyan-400/0 via-cyan-400/50 to-cyan-400/0 animate-pulse" />
        </div>
      )}
      
      {/* Hologram scan lines */}
      {variant === 'hologram' && (
        <div className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none">
          <div 
            className="absolute inset-0 opacity-20"
            style={{
              background: `repeating-linear-gradient(
                0deg,
                transparent,
                transparent 2px,
                rgba(0, 255, 255, 0.1) 2px,
                rgba(0, 255, 255, 0.1) 4px
              )`
            }}
          />
        </div>
      )}
      
      {/* Matrix digital rain effect */}
      {variant === 'matrix' && (
        <div className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none">
          <div 
            className="absolute inset-0 opacity-10"
            style={{
              background: `repeating-linear-gradient(
                90deg,
                transparent,
                transparent 10px,
                rgba(0, 255, 0, 0.1) 10px,
                rgba(0, 255, 0, 0.1) 12px
              )`
            }}
          />
        </div>
      )}
    </div>
  );
};

export default GlassmorphicCard;