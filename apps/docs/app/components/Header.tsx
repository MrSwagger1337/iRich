'use client';

import { useState } from 'react';
import Link from 'next/link';
import { VERSION } from '@irich/core';
import { SearchModal } from './SearchModal';

export function Header() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  return (
    <>
      <header className="docs-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
          <Link href="/" className="docs-logo">
            <div className="docs-logo-icon">iR</div>
            <span>iRich Docs</span>
          </Link>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', background: 'var(--bg-surface-elevated)', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>
            v{VERSION}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button onClick={() => setIsSearchOpen(true)} className="docs-search-btn">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <span>Search docs...</span>
            <kbd className="docs-kbd">⌘K</kbd>
          </button>

          <nav style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '0.875rem' }}>
            <Link href="/docs/getting-started/introduction" style={{ color: 'var(--text-secondary)' }}>
              Docs
            </Link>
            <Link href="/docs/api/core" style={{ color: 'var(--text-secondary)' }}>
              API
            </Link>
            <a
              href="https://github.com/MrSwagger1337/iRich"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                color: 'var(--text-secondary)',
              }}
            >
              GitHub ↗
            </a>
          </nav>
        </div>
      </header>

      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  );
}
