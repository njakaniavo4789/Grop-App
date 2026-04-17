import React from 'react';
import { FluidBackground } from '../ui/FluidBackground';

export function PrevisionPage() {
  return (
    <div className="flex-1 overflow-y-auto" style={{ background: 'transparent', position: 'relative' }}>
      <FluidBackground />
      
      <div style={{ background: 'transparent', padding: '32px 40px 16px', position: 'relative', zIndex: 1 }}>
        <h2 style={{ fontSize: 28, fontWeight: 600, color: 'var(--text-primary)', fontFamily: 'var(--font-display)', letterSpacing: '-0.5px' }}>
          Prévisions
        </h2>
        <p style={{ color: 'var(--text-muted)', marginTop: 4, fontSize: 14 }}>
          Météo agricole et prévisions climatiques pour Madagascar
        </p>
      </div>
      
      <div style={{ padding: '0 40px 48px', position: 'relative', zIndex: 1 }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '60vh',
          color: 'var(--text-muted)',
          fontSize: 14,
        }}>
          Contenu en développement...
        </div>
      </div>
    </div>
  );
}
