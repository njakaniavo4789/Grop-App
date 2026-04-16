import React, { useState, useEffect, useCallback } from 'react';

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  speedX: number;
  speedY: number;
  opacity: number;
}

export function FluidBackground() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [particles, setParticles] = useState<Particle[]>([]);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (isMobile) return;
    const newParticles = Array.from({ length: 40 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 3 + 1,
      speedX: (Math.random() - 0.5) * 0.3,
      speedY: (Math.random() - 0.5) * 0.3,
      opacity: Math.random() * 0.5 + 0.3,
    }));
    setParticles(newParticles);
  }, [isMobile]);

  useEffect(() => {
    if (isMobile) return;
    const interval = setInterval(() => {
      setParticles(prev =>
        prev.map(p => ({
          ...p,
          x: (p.x + p.speedX + 100) % 100,
          y: (p.y + p.speedY + 100) % 100,
        }))
      );
    }, 50);
    return () => clearInterval(interval);
  }, [isMobile]);

  useEffect(() => {
    if (isMobile) return;
    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 30;
      const y = (e.clientY / window.innerHeight - 0.5) * 30;
      setMousePosition({ x, y });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [isMobile]);

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none', overflow: 'hidden' }}>
      {/* Animated Gradient Background */}
      <div style={{ position: 'absolute', inset: 0, opacity: 0.6 }}>
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(to bottom right, #0a1f14, #050508, #0a1520)',
          animation: 'gradient-shift 15s ease-in-out infinite',
        }} />
        <div style={{
          position: 'absolute', inset: 0,
          background: 'radial-gradient(circle at 20% 50%, rgba(34,197,94,0.08) 0%, transparent 50%)',
          animation: 'pulse-slow 4s ease-in-out infinite',
        }} />
        <div style={{
          position: 'absolute', inset: 0,
          background: 'radial-gradient(circle at 80% 20%, rgba(16,185,129,0.06) 0%, transparent 50%)',
          animation: 'pulse-slower 6s ease-in-out infinite',
        }} />
      </div>

      {/* Sphere 1 — Green agri glow (top-left) */}
      <div style={{
        position: 'absolute', top: '10%', left: '15%',
        width: 500, height: 500, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(16,185,129,0.12) 0%, transparent 70%)',
        transform: `translate(${mousePosition.x * 0.3}px, ${mousePosition.y * 0.3}px)`,
        filter: 'blur(80px)',
        transition: 'transform 0.3s ease-out',
        animation: 'pulse-glow 3s ease-in-out infinite',
      }} />

      {/* Sphere 2 — Cyan glow (bottom-right) */}
      <div style={{
        position: 'absolute', bottom: '5%', right: '10%',
        width: 400, height: 400, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(6,182,212,0.08) 0%, transparent 70%)',
        transform: `translate(${mousePosition.x * -0.2}px, ${mousePosition.y * -0.2}px)`,
        filter: 'blur(60px)',
        transition: 'transform 0.3s ease-out',
        animation: 'pulse-glow 4s ease-in-out infinite',
      }} />

      {/* Sphere 3 — Purple AI glow (center) */}
      <div style={{
        position: 'absolute', top: '40%', left: '45%',
        width: 350, height: 350, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(139,92,246,0.06) 0%, transparent 70%)',
        transform: `translate(${mousePosition.x * 0.15}px, ${mousePosition.y * 0.15}px)`,
        filter: 'blur(70px)',
        transition: 'transform 0.3s ease-out',
        animation: 'pulse-glow 5s ease-in-out infinite',
      }} />

      {/* Floating Particles */}
      {!isMobile && particles.map(p => (
        <div
          key={p.id}
          style={{
            position: 'absolute',
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
            borderRadius: '50%',
            background: 'rgba(34, 197, 94, 0.4)',
            boxShadow: '0 0 10px rgba(34, 197, 94, 0.5)',
            filter: 'blur(1px)',
            opacity: p.opacity,
          }}
        />
      ))}

      {/* Noise Texture Overlay */}
      <div style={{
        position: 'absolute', inset: 0,
        opacity: 0.03,
        mixBlendMode: 'overlay',
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
      }} />

      {/* Organic Field Pattern */}
      <div style={{
        position: 'absolute', inset: 0,
        opacity: 0.03,
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0,50 Q25,30 50,50 T100,50' stroke='%2322c55e' stroke-width='0.5' fill='none'/%3E%3Cpath d='M0,60 Q25,80 50,60 T100,60' stroke='%2316a34a' stroke-width='0.5' fill='none'/%3E%3C/svg%3E")`,
        backgroundSize: '100px 100px',
      }} />
    </div>
  );
}
