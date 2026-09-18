'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { IRichRenderer } from '@irich/renderer';
import type { IRichDocument } from '@irich/core';
import { nextjsRenderers } from './components/renderers';
import { initialNextjsDocument } from './components/sample-document';

const STORAGE_KEY = 'irich_nextjs_demo_doc';

export default function PublishedPage() {
  const [documentState, setDocumentState] = useState<IRichDocument>(initialNextjsDocument);
  const [showJsonDrawer, setShowJsonDrawer] = useState(false);
  const [copied, setCopied] = useState(false);

  // Load latest saved document from localStorage if available
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.root && parsed.version) {
          setDocumentState(parsed);
        }
      }
    } catch {
      // fallback to initial sample
    }
  }, []);

  const handleResetDocument = () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
    setDocumentState(initialNextjsDocument);
  };

  const handleCopyJson = () => {
    navigator.clipboard.writeText(JSON.stringify(documentState, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* 1. TOP NAVBAR */}
      <header className="irich-navbar">
        <div className="irich-nav-left">
          <div className="irich-logo-pill">
            <div className="irich-logo-icon">iR</div>
            <span>iRich</span>
          </div>
          <span className="irich-badge-tag">
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981' }} />
            Live Published View (SSR)
          </span>
        </div>

        <div className="irich-nav-right">
          <button
            onClick={() => setShowJsonDrawer(true)}
            className="irich-btn irich-btn-secondary irich-btn-sm"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ marginRight: '6px' }}
            >
              <polyline points="16 18 22 12 16 6" />
              <polyline points="8 6 2 12 8 18" />
            </svg>
            View JSON State
          </button>

          <button
            onClick={handleResetDocument}
            className="irich-btn irich-btn-ghost irich-btn-sm"
            title="Reset document to default sample"
          >
            Reset Sample
          </button>

          <Link href="/editor" className="irich-btn irich-btn-primary irich-btn-sm">
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ marginRight: '6px' }}
            >
              <path d="M12 20h9" />
              <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
            </svg>
            Open Visual Editor
          </Link>
        </div>
      </header>

      {/* 2. SSR-COMPATIBLE PRODUCTION RENDERER */}
      <main style={{ flex: 1 }}>
        <IRichRenderer
          document={documentState}
          components={nextjsRenderers}
        />
      </main>

      {/* 3. FOOTER */}
      <footer
        style={{
          borderTop: '1px solid var(--border-subtle)',
          padding: '2rem 1.5rem',
          textAlign: 'center',
          color: 'var(--text-muted)',
          fontSize: '0.875rem',
        }}
      >
        <p>
          Rendered with <strong>@irich/renderer</strong> in Next.js • Zero visual editor code loaded on published page.
        </p>
      </footer>

      {/* 4. JSON DRAWER MODAL */}
      {showJsonDrawer && (
        <div className="irich-drawer-overlay" onClick={() => setShowJsonDrawer(false)}>
          <div className="irich-drawer-content" onClick={(e) => e.stopPropagation()}>
            <div className="irich-drawer-header">
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Canonical Document JSON</h3>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                  Strictly serializable JSON state rendered by @irich/renderer
                </p>
              </div>
              <button
                onClick={() => setShowJsonDrawer(false)}
                className="irich-btn irich-btn-ghost irich-btn-sm"
              >
                ✕
              </button>
            </div>

            <pre className="irich-json-pre">
              {JSON.stringify(documentState, null, 2)}
            </pre>

            <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button
                onClick={handleCopyJson}
                className="irich-btn irich-btn-secondary irich-btn-md"
              >
                {copied ? '✓ Copied JSON' : 'Copy JSON to Clipboard'}
              </button>
              <Link
                href="/editor"
                className="irich-btn irich-btn-primary irich-btn-md"
              >
                Edit in Visual Editor
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
