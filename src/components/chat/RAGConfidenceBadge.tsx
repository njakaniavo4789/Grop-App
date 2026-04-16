import React from 'react';
import { Brain } from 'lucide-react';

interface RAGConfidenceBadgeProps {
  score: number;
}

export function RAGConfidenceBadge({ score }: RAGConfidenceBadgeProps) {
  const getColor = () => {
    if (score >= 80) return { bg: 'rgba(16,185,129,0.15)', text: 'var(--agri-400)' };
    if (score >= 50) return { bg: 'rgba(245,158,11,0.15)', text: 'var(--warning-500)' };
    return { bg: 'rgba(239,68,68,0.15)', text: 'var(--error-500)' };
  };

  const color = getColor();

  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      padding: '3px 8px', borderRadius: 9999, fontSize: 11, fontWeight: 600,
      background: color.bg, color: color.text,
    }}>
      <Brain size={10} />
      RAG {score}%
    </span>
  );
}
