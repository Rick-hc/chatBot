import React, { useEffect, useRef } from 'react';

interface FuturisticLoaderProps {
  variant?: 'orbit' | 'dna' | 'matrix' | 'quantum' | 'hologram' | 'cyber' | 'neon';
  size?: 'small' | 'medium' | 'large';
  color?: string;
  speed?: number;
  className?: string;
}

const FuturisticLoader: React.FC<FuturisticLoaderProps> = ({
  variant = 'orbit',
  size = 'medium',
  color,
  speed = 1,
  className = ''
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number>();
  const startTimeRef = useRef<number>(Date.now());

  const getSizeConfig = () => {
    switch (size) {
      case 'small':
        return { width: 40, height: 40, scale: 0.7 };
      case 'medium':
        return { width: 60, height: 60, scale: 1 };
      case 'large':
        return { width: 80, height: 80, scale: 1.3 };
    }
  };

  const getColorScheme = () => {
    if (color) return [color];
    
    switch (variant) {
      case 'orbit':
        return ['#00ffff', '#ff00ff', '#ffff00'];
      case 'dna':
        return ['#00ff00', '#0080ff'];
      case 'matrix':
        return ['#00ff00', '#008000'];
      case 'quantum':
        return ['#8b5cf6', '#06d6a0', '#f59e0b'];
      case 'hologram':
        return ['#4facfe', '#00f2fe'];
      case 'cyber':
        return ['#00ffff', '#ff00ff', '#ffff00'];
      case 'neon':
        return ['#00ff00', '#ffff00', '#ff00ff'];
      default:
        return ['#3b82f6'];
    }
  };

  const drawOrbitLoader = (ctx: CanvasRenderingContext2D, time: number, config: any) => {
    const { width, height, scale } = config;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = 15 * scale;
    const colors = getColorScheme();

    // Draw orbiting particles
    for (let i = 0; i < 3; i++) {
      const angle = (time * speed + i * (Math.PI * 2 / 3)) * 0.002;
      const x = centerX + Math.cos(angle) * radius;
      const y = centerY + Math.sin(angle) * radius;
      
      ctx.save();
      ctx.globalAlpha = 0.8;
      ctx.shadowColor = colors[i % colors.length];
      ctx.shadowBlur = 10;
      ctx.fillStyle = colors[i % colors.length];
      ctx.beginPath();
      ctx.arc(x, y, 3 * scale, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // Draw center glow
    const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, 8 * scale);
    gradient.addColorStop(0, colors[0] + '80');
    gradient.addColorStop(1, 'transparent');
    ctx.fillStyle = gradient;
    ctx.fillRect(centerX - 8 * scale, centerY - 8 * scale, 16 * scale, 16 * scale);
  };

  const drawDNALoader = (ctx: CanvasRenderingContext2D, time: number, config: any) => {
    const { width, height, scale } = config;
    const centerX = width / 2;
    const centerY = height / 2;
    const colors = getColorScheme();

    // Draw DNA helix
    for (let i = 0; i < 20; i++) {
      const progress = i / 19;
      const angle = (time * speed * 0.003 + progress * Math.PI * 4);
      const y = centerY - 20 * scale + progress * 40 * scale;
      
      // Left strand
      const x1 = centerX + Math.sin(angle) * 8 * scale;
      ctx.save();
      ctx.globalAlpha = 0.8;
      ctx.shadowColor = colors[0];
      ctx.shadowBlur = 5;
      ctx.fillStyle = colors[0];
      ctx.beginPath();
      ctx.arc(x1, y, 2 * scale, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
      
      // Right strand
      const x2 = centerX - Math.sin(angle) * 8 * scale;
      ctx.save();
      ctx.globalAlpha = 0.8;
      ctx.shadowColor = colors[1] || colors[0];
      ctx.shadowBlur = 5;
      ctx.fillStyle = colors[1] || colors[0];
      ctx.beginPath();
      ctx.arc(x2, y, 2 * scale, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
      
      // Connection lines
      if (i % 3 === 0) {
        ctx.save();
        ctx.globalAlpha = 0.4;
        ctx.strokeStyle = colors[0];
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(x1, y);
        ctx.lineTo(x2, y);
        ctx.stroke();
        ctx.restore();
      }
    }
  };

  const drawMatrixLoader = (ctx: CanvasRenderingContext2D, time: number, config: any) => {
    const { width, height, scale } = config;
    const colors = getColorScheme();
    const chars = '01';

    // Draw falling characters
    for (let x = 0; x < width; x += 8 * scale) {
      for (let y = 0; y < height; y += 8 * scale) {
        const char = chars[Math.floor((time * speed * 0.01 + x + y) % chars.length)];
        const alpha = Math.sin(time * speed * 0.005 + x * 0.1 + y * 0.1) * 0.5 + 0.5;
        
        ctx.save();
        ctx.globalAlpha = alpha * 0.8;
        ctx.fillStyle = colors[0];
        ctx.font = `${6 * scale}px monospace`;
        ctx.fillText(char, x, y);
        ctx.restore();
      }
    }

    // Center glow
    const gradient = ctx.createRadialGradient(width/2, height/2, 0, width/2, height/2, 20 * scale);
    gradient.addColorStop(0, colors[0] + '40');
    gradient.addColorStop(1, 'transparent');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
  };

  const drawQuantumLoader = (ctx: CanvasRenderingContext2D, time: number, config: any) => {
    const { width, height, scale } = config;
    const centerX = width / 2;
    const centerY = height / 2;
    const colors = getColorScheme();

    // Draw quantum rings
    for (let ring = 0; ring < 3; ring++) {
      const radius = (8 + ring * 6) * scale;
      const rotation = time * speed * 0.001 * (ring % 2 === 0 ? 1 : -1);
      
      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(rotation);
      
      // Draw ring particles
      for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2;
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;
        
        const alpha = Math.sin(time * speed * 0.01 + i + ring) * 0.5 + 0.5;
        
        ctx.globalAlpha = alpha;
        ctx.shadowColor = colors[ring % colors.length];
        ctx.shadowBlur = 8;
        ctx.fillStyle = colors[ring % colors.length];
        ctx.beginPath();
        ctx.arc(x, y, 2 * scale, 0, Math.PI * 2);
        ctx.fill();
      }
      
      ctx.restore();
    }
  };

  const drawHologramLoader = (ctx: CanvasRenderingContext2D, time: number, config: any) => {
    const { width, height, scale } = config;
    const centerX = width / 2;
    const centerY = height / 2;
    const colors = getColorScheme();

    // Draw hologram grid
    ctx.save();
    ctx.globalAlpha = 0.3;
    ctx.strokeStyle = colors[0];
    ctx.lineWidth = 1;
    
    // Horizontal lines
    for (let y = 0; y < height; y += 4 * scale) {
      const wave = Math.sin(time * speed * 0.005 + y * 0.1) * 2;
      ctx.beginPath();
      ctx.moveTo(0, y + wave);
      ctx.lineTo(width, y + wave);
      ctx.stroke();
    }
    
    ctx.restore();

    // Draw central projection
    const projection = Math.sin(time * speed * 0.003) * 0.5 + 0.5;
    const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, 15 * scale);
    gradient.addColorStop(0, colors[0] + Math.floor(projection * 255).toString(16).padStart(2, '0'));
    gradient.addColorStop(1, 'transparent');
    
    ctx.fillStyle = gradient;
    ctx.fillRect(centerX - 15 * scale, centerY - 15 * scale, 30 * scale, 30 * scale);

    // Draw scanning line
    const scanY = centerY + Math.sin(time * speed * 0.004) * 20 * scale;
    ctx.save();
    ctx.globalAlpha = 0.8;
    ctx.strokeStyle = colors[1] || colors[0];
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(centerX - 20 * scale, scanY);
    ctx.lineTo(centerX + 20 * scale, scanY);
    ctx.stroke();
    ctx.restore();
  };

  const animate = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const config = getSizeConfig();
    const currentTime = Date.now() - startTimeRef.current;

    // Clear canvas
    ctx.clearRect(0, 0, config.width, config.height);

    // Draw based on variant
    switch (variant) {
      case 'orbit':
        drawOrbitLoader(ctx, currentTime, config);
        break;
      case 'dna':
        drawDNALoader(ctx, currentTime, config);
        break;
      case 'matrix':
        drawMatrixLoader(ctx, currentTime, config);
        break;
      case 'quantum':
        drawQuantumLoader(ctx, currentTime, config);
        break;
      case 'hologram':
        drawHologramLoader(ctx, currentTime, config);
        break;
      case 'cyber':
        drawOrbitLoader(ctx, currentTime, config);
        break;
      case 'neon':
        drawQuantumLoader(ctx, currentTime, config);
        break;
    }

    animationFrameRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    animate();
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [variant, size, speed]);

  const { width, height } = getSizeConfig();

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        className="block"
      />
    </div>
  );
};

export default FuturisticLoader;