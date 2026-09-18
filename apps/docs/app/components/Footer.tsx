import Link from 'next/link';
import { VERSION } from '@irich/core';

export function Footer() {
  return (
    <footer
      style={{
        borderTop: '1px solid var(--border)',
        padding: '3rem 2rem',
        background: 'var(--bg-surface)',
        marginTop: 'auto',
      }}
    >
      <div
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1.5rem',
        }}
      >
        <div>
          <div style={{ fontWeight: 700, fontSize: '1.125rem', color: 'var(--text-primary)' }}>iRich</div>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            Extensible visual content editor & page builder for React • v{VERSION}
          </div>
        </div>

        <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
          <Link href="/docs/getting-started/introduction">Documentation</Link>
          <Link href="/docs/api/core">API Reference</Link>
          <a href="https://github.com/MrSwagger1337/iRich" target="_blank" rel="noopener noreferrer">
            GitHub Repository
          </a>
        </div>
      </div>
    </footer>
  );
}
