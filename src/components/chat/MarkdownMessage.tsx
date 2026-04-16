import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface MarkdownMessageProps {
  content: string;
}

export function MarkdownMessage({ content }: MarkdownMessageProps) {
  return (
    <div style={{ color: '#CBD5E1', lineHeight: 1.8, fontSize: 15, fontFamily: 'var(--font-body)' }}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ children }) => <h1 style={{ fontSize: '1.35rem', fontWeight: 700, margin: '1.25rem 0 0.75rem', color: '#FFFFFF', lineHeight: 1.3, fontFamily: 'var(--font-display)' }}>{children}</h1>,
          h2: ({ children }) => <h2 style={{ fontSize: '1.15rem', fontWeight: 600, margin: '1rem 0 0.5rem', color: '#F1F5F9', lineHeight: 1.3, fontFamily: 'var(--font-display)' }}>{children}</h2>,
          h3: ({ children }) => <h3 style={{ fontSize: '1.05rem', fontWeight: 600, margin: '0.85rem 0 0.4rem', color: '#E2E8F0', lineHeight: 1.3 }}>{children}</h3>,
          p: ({ children }) => <p style={{ margin: '0 0 0.85rem', color: '#CBD5E1', lineHeight: 1.8, fontSize: '0.95rem' }}>{children}</p>,
          ul: ({ children }) => <ul style={{ margin: '0.5rem 0 1rem 1.5rem', paddingLeft: '0.5rem', color: '#CBD5E1', listStyleType: 'disc' }}>{children}</ul>,
          ol: ({ children }) => <ol style={{ margin: '0.5rem 0 1rem 1.5rem', paddingLeft: '0.5rem', color: '#CBD5E1', listStyleType: 'decimal' }}>{children}</ol>,
          li: ({ children, ...props }) => <li style={{ margin: '0.4rem 0', lineHeight: 1.75, fontSize: '0.95rem', color: '#CBD5E1', paddingLeft: '0.25rem' }} {...props}>{children}</li>,
          strong: ({ children }) => <strong style={{ fontWeight: 700, color: '#FFFFFF', background: 'rgba(16,185,129,0.15)', padding: '0.1rem 0.4rem', borderRadius: '0.25rem' }}>{children}</strong>,
          em: ({ children }) => <em style={{ fontStyle: 'italic', color: '#94A3B8' }}>{children}</em>,
          code: ({ className, children, ...props }) => {
            const isBlock = className?.startsWith('language-');
            if (isBlock) {
              return <code style={{ display: 'block', background: '#0F0F14', color: '#22D3EE', padding: '1rem', borderRadius: '0.5rem', overflowX: 'auto', fontSize: '0.8125rem', fontFamily: 'var(--font-mono)', lineHeight: 1.6, border: '1px solid #1E293B', margin: '0.75rem 0' }} {...props}>{children}</code>;
            }
            return <code style={{ background: 'rgba(16,185,129,0.15)', color: '#34D399', padding: '0.15rem 0.4rem', borderRadius: '0.25rem', fontSize: '0.8125rem', fontFamily: 'var(--font-mono)', fontWeight: 500 }} {...props}>{children}</code>;
          },
          pre: ({ children }) => <pre style={{ background: '#0F0F14', borderRadius: '0.5rem', overflow: 'hidden', margin: '0.75rem 0', border: '1px solid #1E293B' }}>{children}</pre>,
          blockquote: ({ children }) => <blockquote style={{ borderLeft: '3px solid #8B5CF6', paddingLeft: '1rem', margin: '0.75rem 0', color: '#A78BFA', fontStyle: 'italic', background: 'rgba(139,92,246,0.1)', padding: '12px 16px', borderRadius: '0 8px 8px 0' }}>{children}</blockquote>,
          a: ({ href, children }) => <a href={href} style={{ color: '#22D3EE', textDecoration: 'underline', fontWeight: 500 }} target="_blank" rel="noopener noreferrer">{children}</a>,
          hr: () => <hr style={{ border: 'none', borderTop: '1px solid #1E293B', margin: '1.25rem 0' }} />,
          table: ({ children }) => (
            <div style={{ overflowX: 'auto', margin: '0.75rem 0', borderRadius: 8, border: '1px solid #1E293B' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>{children}</table>
            </div>
          ),
          thead: ({ children }) => <thead style={{ background: '#0F0F14' }}>{children}</thead>,
          th: ({ children }) => <th style={{ border: '1px solid #1E293B', padding: '0.65rem 0.75rem', textAlign: 'left', fontWeight: 600, color: '#FFFFFF', fontSize: '0.8125rem', background: '#0A0A0F' }}>{children}</th>,
          td: ({ children }) => <td style={{ border: '1px solid #1E293B', padding: '0.5rem 0.75rem', color: '#CBD5E1', fontSize: '0.875rem' }}>{children}</td>,
          tr: ({ children }) => <tr style={{ borderBottom: '1px solid #1E293B' }}>{children}</tr>,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
