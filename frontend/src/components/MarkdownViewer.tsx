import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface Props {
  content: string;
  className?: string;
  compact?: boolean;
}

export const MarkdownViewer: React.FC<Props> = ({ content, className = '', compact = false }) => {
  return (
    <div className={`markdown-content ${className}`} style={{ color: '#cbd5e1', lineHeight: 1.6, fontSize: compact ? '0.85rem' : '0.95rem' }}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          table: ({ children }) => (
            <div style={{ overflowX: 'auto', margin: compact ? '8px 0' : '14px 0', borderRadius: '8px', border: '1px solid #334155' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: compact ? '0.8rem' : '0.88rem' }}>
                {children}
              </table>
            </div>
          ),
          thead: ({ children }) => (
            <thead style={{ background: '#1e293b', borderBottom: '2px solid #475569' }}>
              {children}
            </thead>
          ),
          tbody: ({ children }) => <tbody>{children}</tbody>,
          tr: ({ children }) => (
            <tr style={{ borderBottom: '1px solid #334155' }}>
              {children}
            </tr>
          ),
          th: ({ children }) => (
            <th style={{ padding: compact ? '6px 10px' : '10px 14px', color: '#38bdf8', fontWeight: 600, whiteSpace: 'nowrap' }}>
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td style={{ padding: compact ? '6px 10px' : '9px 14px', color: '#e2e8f0' }}>
              {children}
            </td>
          ),
          blockquote: ({ children }) => (
            <blockquote
              style={{
                borderLeft: '4px solid #38bdf8',
                background: 'rgba(56, 189, 248, 0.08)',
                padding: '8px 14px',
                margin: '10px 0',
                borderRadius: '0 6px 6px 0',
                color: '#94a3b8',
                fontStyle: 'italic',
              }}
            >
              {children}
            </blockquote>
          ),
          h1: ({ children }) => (
            <h1 style={{ fontSize: compact ? '1.15rem' : '1.35rem', fontWeight: 700, color: '#f8fafc', margin: '14px 0 8px 0' }}>
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 style={{ fontSize: compact ? '1.05rem' : '1.2rem', fontWeight: 600, color: '#f8fafc', margin: '12px 0 6px 0' }}>
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 style={{ fontSize: compact ? '0.95rem' : '1.05rem', fontWeight: 600, color: '#f8fafc', margin: '10px 0 4px 0' }}>
              {children}
            </h3>
          ),
          h4: ({ children }) => (
            <h4 style={{ fontSize: compact ? '0.9rem' : '0.95rem', fontWeight: 600, color: '#f8fafc', margin: '8px 0 4px 0' }}>
              {children}
            </h4>
          ),
          p: ({ children }) => (
            <p style={{ margin: '6px 0', whiteSpace: 'pre-line' }}>
              {children}
            </p>
          ),
          ul: ({ children }) => (
            <ul style={{ margin: '6px 0', paddingLeft: '20px', listStyleType: 'disc' }}>
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol style={{ margin: '6px 0', paddingLeft: '20px', listStyleType: 'decimal' }}>
              {children}
            </ol>
          ),
          li: ({ children }) => (
            <li style={{ margin: '2px 0' }}>
              {children}
            </li>
          ),
          code: ({ children }) => (
            <code
              style={{
                background: '#0f172a',
                border: '1px solid #334155',
                padding: '1px 5px',
                borderRadius: '4px',
                color: '#f472b6',
                fontSize: '0.85em',
                fontFamily: 'monospace',
              }}
            >
              {children}
            </code>
          ),
          hr: () => (
            <hr style={{ border: 'none', borderTop: '1px solid #334155', margin: '14px 0' }} />
          ),
          a: ({ href, children }) => (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: '#38bdf8', textDecoration: 'underline' }}
            >
              {children}
            </a>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};
