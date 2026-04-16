import React from 'react';

interface UserMessageProps {
  text: string;
}

export function UserMessage({ text }: UserMessageProps) {
  return (
    <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '8px 0' }}>
      <div style={{
        maxWidth: '70%',
        background: 'linear-gradient(135deg, var(--agri-500), var(--cyan-500))',
        color: 'white',
        borderRadius: '18px 18px 4px 18px',
        padding: '10px 16px',
        fontSize: '0.9375rem',
        lineHeight: 1.6,
        boxShadow: '0 4px 20px rgba(6, 182, 212, 0.3)',
      }}>
        {text}
      </div>
    </div>
  );
}
