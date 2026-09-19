import React from 'react';
import Link from 'next/link';
import { IRichRenderer } from '@irich/renderer';
import { nextjsRenderers } from './components/renderers';
import { initialNextjsDocument } from './components/sample-document';
import { initialArabicDocument } from './components/sample-document-arabic';

/**
 * Genuine Next.js React Server Component (RSC).
 * Demonstrates production rendering of canonical JSON documents with @irich/renderer
 * on the server with zero visual editor dependencies in the client bundle.
 */
export default async function PublishedPage({
  searchParams,
}: {
  searchParams?: Promise<{ fixture?: string }>;
}) {
  const resolvedParams = await searchParams;
  const isArabic = resolvedParams?.fixture === 'arabic';
  const document = isArabic ? initialArabicDocument : initialNextjsDocument;

  return (
    <div className="irich-published-shell">
      {/* 1. TOP NAVBAR */}
      <header className="irich-navbar">
        <div className="irich-nav-left">
          <div className="irich-logo-pill">
            <div className="irich-logo-icon">iR</div>
            <span>iRich</span>
          </div>
          <span className="irich-badge-tag">
            <span className="irich-status-dot" style={{ background: '#10b981' }} />
            Server Component (SSR)
          </span>
          <div className="irich-viewport-controls" style={{ marginLeft: '1rem' }}>
            <Link
              href="/"
              className={`irich-viewport-btn ${!isArabic ? 'active' : ''}`}
            >
              🇬🇧 English LTR
            </Link>
            <Link
              href="/?fixture=arabic"
              className={`irich-viewport-btn ${isArabic ? 'active' : ''}`}
            >
              🇸🇦 Arabic RTL
            </Link>
          </div>
        </div>

        <div className="irich-nav-right">
          <Link href="/editor" className="irich-btn irich-btn-primary irich-btn-sm">
            Open Visual Editor →
          </Link>
        </div>
      </header>

      {/* 2. SSR INFO BANNER */}
      <div className="irich-ssr-notice">
        <p>
          <strong>Server-Side Rendered Page</strong> • Rendered from canonical JSON using{' '}
          <code>@irich/renderer</code>. Zero editor dependencies loaded. Open the{' '}
          <Link href="/editor" style={{ textDecoration: 'underline', color: '#818cf8' }}>
            Visual Editor
          </Link>{' '}
          to edit and customize this layout.
        </p>
      </div>

      {/* 3. SERVER-SIDE PRODUCTION RENDERER */}
      <main className="irich-published-main">
        <IRichRenderer
          document={document}
          components={nextjsRenderers}
        />
      </main>

      {/* 4. FOOTER */}
      <footer className="irich-published-footer">
        <p>
          Rendered with <strong>@irich/renderer</strong> in Next.js App Router • Production bundle size &lt; 5 KB gzipped.
        </p>
      </footer>
    </div>
  );
}

