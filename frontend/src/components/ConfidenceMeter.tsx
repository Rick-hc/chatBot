import React, { useState, useEffect, useRef } from 'react';

interface ConfidenceMeterProps {
  confidence: number; // 0-1
  isLoading?: boolean;
  variant?: 'default' | 'cyber' | 'hologram' | 'neon' | 'matrix';
  showValue?: boolean;
  animated?: boolean;
  className?: string;
}

const ConfidenceMeter: React.FC<ConfidenceMeterProps> = ({
  confidence,
  isLoading = false,
  variant = 'default',
  showValue = true,
  animated = true,
  className = ''
}) => {
  const [displayConfidence, setDisplayConfidence] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const animationFrameRef = useRef<number>();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Animate confidence change
  useEffect(() => {
    if (!animated) {
      setDisplayConfidence(confidence);
      return;
    }

    setIsAnimating(true);
    const duration = 2000; // 2 seconds
    const startTime = Date.now();
    const startValue = displayConfidence;
    const targetValue = confidence;

    const animateValue = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function (ease-out-cubic)
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const currentValue = startValue + (targetValue - startValue) * easeOut;
      
      setDisplayConfidence(currentValue);
      
      if (progress < 1) {
        animationFrameRef.current = requestAnimationFrame(animateValue);
      } else {
        setIsAnimating(false);
      }
    };

    animateValue();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [confidence, animated, displayConfidence]);

  // Canvas animation for particle effect
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || variant === 'default') return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const particles: Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      life: number;
      maxLife: number;
      size: number;
      color: string;
    }> = [];

    // Create particles
    const createParticle = () => {
      const colors = variant === 'cyber' ? ['#00ffff', '#ff00ff'] :
                     variant === 'hologram' ? ['#4facfe', '#00f2fe'] :
                     ['#00ff00', '#ffff00'];
      
      return {
        x: Math.random() * canvas.width,
        y: canvas.height,
        vx: (Math.random() - 0.5) * 2,
        vy: -Math.random() * 3 - 1,
        life: 0,
        maxLife: 60,
        size: Math.random() * 2 + 1,
        color: colors[Math.floor(Math.random() * colors.length)]
      };
    };

    // Animation loop
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Add new particles based on confidence
      if (Math.random() < displayConfidence * 0.3) {
        particles.push(createParticle());
      }

      // Update and draw particles
      for (let i = particles.length - 1; i >= 0; i--) {
        const particle = particles[i];
        
        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.life++;
        
        const alpha = 1 - (particle.life / particle.maxLife);
        
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.fillStyle = particle.color;
        ctx.shadowColor = particle.color;
        ctx.shadowBlur = 5;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
        
        if (particle.life >= particle.maxLife) {
          particles.splice(i, 1);
        }
      }

      requestAnimationFrame(animate);
    };

    animate();
  }, [displayConfidence, variant]);

  const getConfidenceColor = (conf: number) => {
    if (conf < 0.3) return variant === 'cyber' ? '#ff0080' : '#ef4444';
    if (conf < 0.6) return variant === 'cyber' ? '#ffff00' : '#f59e0b';
    if (conf < 0.8) return variant === 'cyber' ? '#00ffff' : '#10b981';
    return variant === 'cyber' ? '#00ff00' : '#06d6a0';
  };

  const getVariantClasses = () => {
    switch (variant) {
      case 'cyber':
        return {
          container: 'bg-black/50 border-2 border-cyan-400/50 shadow-[0_0_20px_rgba(0,255,255,0.3)]',
          bar: 'bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500',
          glow: 'shadow-[0_0_10px_rgba(0,255,255,0.8)]'
        };
      case 'hologram':
        return {
          container: 'bg-blue-900/30 border-2 border-blue-400/50 shadow-[0_0_20px_rgba(79,172,254,0.3)]',
          bar: 'bg-gradient-to-r from-blue-400 to-cyan-400',
          glow: 'shadow-[0_0_10px_rgba(79,172,254,0.8)]'
        };
      case 'neon':
        return {
          container: 'bg-black/50 border-2 border-green-400/50 shadow-[0_0_20px_rgba(0,255,0,0.3)]',
          bar: 'bg-gradient-to-r from-green-400 to-yellow-400',
          glow: 'shadow-[0_0_10px_rgba(0,255,0,0.8)]'
        };
      case 'matrix':
        return {
          container: 'bg-black/50 border-2 border-green-400/50 shadow-[0_0_20px_rgba(0,255,0,0.3)]',
          bar: 'bg-gradient-to-r from-green-400 to-emerald-400',
          glow: 'shadow-[0_0_10px_rgba(0,255,0,0.8)]'
        };
      default:
        return {
          container: 'bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600',
          bar: 'bg-blue-500',
          glow: ''
        };
    }
  };

  const variantClasses = getVariantClasses();
  const confidencePercentage = Math.round(displayConfidence * 100);

  return (
    <div className={`relative ${className}`}>
      {/* Particle canvas for special variants */}
      {variant !== 'default' && (
        <canvas
          ref={canvasRef}
          width={200}
          height={20}
          className="absolute inset-0 pointer-events-none"
        />
      )}
      
      <div className={`relative p-3 rounded-lg backdrop-blur-sm ${variantClasses.container}`}>
        {/* Header */}
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-gray-600 dark:text-gray-300">
            AI 信頼度
          </span>
          {showValue && (
            <span 
              className={`text-xs font-bold ${
                variant === 'cyber' ? 'text-cyan-400' :
                variant === 'hologram' ? 'text-blue-400' :
                variant === 'neon' ? 'text-green-400' :
                variant === 'matrix' ? 'text-green-400' :
                'text-gray-700 dark:text-gray-200'
              }`}
            >
              {isLoading ? '--' : `${confidencePercentage}%`}
            </span>
          )}
        </div>

        {/* Progress bar container */}
        <div className="relative h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          {/* Background glow */}
          {variant !== 'default' && (
            <div 
              className="absolute inset-0 opacity-20"
              style={{
                background: `linear-gradient(90deg, ${getConfidenceColor(displayConfidence)} 0%, transparent 100%)`
              }}
            />
          )}
          
          {/* Progress bar */}
          <div
            className={`h-full transition-all duration-1000 ease-out ${variantClasses.bar} ${variantClasses.glow}`}
            style={{
              width: isLoading ? '0%' : `${displayConfidence * 100}%`,
              backgroundColor: variant === 'default' ? getConfidenceColor(displayConfidence) : undefined
            }}
          >
            {/* Animated shine effect */}
            {(isAnimating || isLoading) && variant !== 'default' && (
              <div 
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse"
                style={{ animationDuration: '1.5s' }}
              />
            )}
          </div>

          {/* Loading pulse */}
          {isLoading && (
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-500/30 to-transparent animate-pulse" />
          )}
        </div>

        {/* Confidence level indicator */}
        <div className="flex justify-between text-xs mt-1 opacity-60">
          <span>Low</span>
          <span>Medium</span>
          <span>High</span>
        </div>

        {/* Status indicators */}
        <div className="flex items-center mt-2 space-x-2">
          <div 
            className={`w-2 h-2 rounded-full ${
              displayConfidence > 0.8 ? 'bg-green-400 animate-pulse' :
              displayConfidence > 0.6 ? 'bg-yellow-400' :
              displayConfidence > 0.3 ? 'bg-orange-400' :
              'bg-red-400'
            }`}
          />
          <span className="text-xs text-gray-500">
            {displayConfidence > 0.8 ? '高信頼' :
             displayConfidence > 0.6 ? '中信頼' :
             displayConfidence > 0.3 ? '低信頼' :
             '要確認'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ConfidenceMeter;