import React, { useEffect, useRef, useCallback } from 'react';

interface Particle {
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
  life: number;
  maxLife: number;
  size: number;
  color: string;
  opacity: number;
}

interface ParticleSystemProps {
  particleCount?: number;
  className?: string;
  theme?: 'cyber' | 'hologram' | 'matrix';
}

const ParticleSystem: React.FC<ParticleSystemProps> = ({ 
  particleCount = 100, 
  className = '',
  theme = 'cyber'
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number>();
  const particlesRef = useRef<Particle[]>([]);
  const mouseRef = useRef({ x: 0, y: 0 });

  const getThemeColors = useCallback(() => {
    switch (theme) {
      case 'cyber':
        return ['#00ffff', '#ff00ff', '#ffff00', '#00ff00'];
      case 'hologram':
        return ['#4facfe', '#00f2fe', '#43e97b', '#38f9d7'];
      case 'matrix':
        return ['#00ff00', '#008000', '#90EE90', '#32CD32'];
      default:
        return ['#00ffff', '#ff00ff', '#ffff00', '#00ff00'];
    }
  }, [theme]);

  const createParticle = useCallback((): Particle => {
    const colors = getThemeColors();
    return {
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      z: Math.random() * 1000,
      vx: (Math.random() - 0.5) * 2,
      vy: (Math.random() - 0.5) * 2,
      vz: (Math.random() - 0.5) * 3,
      life: 0,
      maxLife: Math.random() * 300 + 100,
      size: Math.random() * 3 + 1,
      color: colors[Math.floor(Math.random() * colors.length)],
      opacity: Math.random() * 0.8 + 0.2
    };
  }, [getThemeColors]);

  const initParticles = useCallback(() => {
    particlesRef.current = Array.from({ length: particleCount }, () => createParticle());
  }, [particleCount, createParticle]);

  const updateParticle = useCallback((particle: Particle) => {
    // Update position
    particle.x += particle.vx;
    particle.y += particle.vy;
    particle.z += particle.vz;
    
    // Update life
    particle.life++;
    
    // Mouse interaction
    const dx = mouseRef.current.x - particle.x;
    const dy = mouseRef.current.y - particle.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    if (distance < 100) {
      const force = (100 - distance) / 100;
      particle.vx += (dx / distance) * force * 0.1;
      particle.vy += (dy / distance) * force * 0.1;
    }
    
    // Boundary wrapping
    if (particle.x < 0) particle.x = window.innerWidth;
    if (particle.x > window.innerWidth) particle.x = 0;
    if (particle.y < 0) particle.y = window.innerHeight;
    if (particle.y > window.innerHeight) particle.y = 0;
    
    // Reset particle if life exceeded
    if (particle.life > particle.maxLife) {
      Object.assign(particle, createParticle());
    }
  }, [createParticle]);

  const drawParticle = useCallback((ctx: CanvasRenderingContext2D, particle: Particle) => {
    const progress = particle.life / particle.maxLife;
    const opacity = particle.opacity * (1 - progress);
    const size = particle.size * (1 - progress * 0.5);
    
    // 3D effect
    const perspective = 1000;
    const scale = perspective / (perspective + particle.z);
    const x = particle.x * scale;
    const y = particle.y * scale;
    
    ctx.save();
    ctx.globalAlpha = opacity;
    
    // Glow effect
    ctx.shadowColor = particle.color;
    ctx.shadowBlur = size * 3;
    
    // Draw particle
    ctx.fillStyle = particle.color;
    ctx.beginPath();
    ctx.arc(x, y, size * scale, 0, Math.PI * 2);
    ctx.fill();
    
    // Extra glow for cyber theme
    if (theme === 'cyber') {
      ctx.beginPath();
      ctx.arc(x, y, size * scale * 2, 0, Math.PI * 2);
      ctx.strokeStyle = particle.color;
      ctx.lineWidth = 0.5;
      ctx.stroke();
    }
    
    ctx.restore();
  }, [theme]);

  const connectParticles = useCallback((ctx: CanvasRenderingContext2D, particles: Particle[]) => {
    const maxDistance = 150;
    
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < maxDistance) {
          const opacity = (1 - distance / maxDistance) * 0.3;
          
          ctx.save();
          ctx.globalAlpha = opacity;
          ctx.strokeStyle = theme === 'matrix' ? '#00ff00' : '#00ffff';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.stroke();
          ctx.restore();
        }
      }
    }
  }, [theme]);

  const animate = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Clear canvas with fade effect
    ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Update and draw particles
    particlesRef.current.forEach(particle => {
      updateParticle(particle);
      drawParticle(ctx, particle);
    });
    
    // Connect particles
    if (theme !== 'hologram') {
      connectParticles(ctx, particlesRef.current);
    }
    
    animationFrameRef.current = requestAnimationFrame(animate);
  }, [updateParticle, drawParticle, connectParticles, theme]);

  const handleMouseMove = useCallback((event: MouseEvent) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (rect) {
      mouseRef.current = {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top
      };
    }
  }, []);

  const handleResize = useCallback(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    // Set canvas size
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    // Initialize particles
    initParticles();
    
    // Start animation
    animate();
    
    // Event listeners
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('resize', handleResize);
    
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
    };
  }, [animate, handleMouseMove, handleResize, initParticles]);

  return (
    <canvas
      ref={canvasRef}
      className={`fixed inset-0 pointer-events-none z-0 ${className}`}
      style={{
        background: theme === 'matrix' 
          ? 'radial-gradient(ellipse at center, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.9) 100%)'
          : theme === 'hologram'
          ? 'radial-gradient(ellipse at center, rgba(30,30,60,0.8) 0%, rgba(10,10,30,0.9) 100%)'
          : 'radial-gradient(ellipse at center, rgba(0,0,0,0.8) 0%, rgba(20,0,40,0.9) 100%)'
      }}
    />
  );
};

export default ParticleSystem;