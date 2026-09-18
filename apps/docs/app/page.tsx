import Link from 'next/link';
import { VERSION } from '@irich/core';
import { CodeBlock } from './components/CodeBlock';

export default function DocsHomePage() {
  const quickStartCode = `import { defineComponent, createEditor, createComponentRegistry } from '@irich/core';
import { IRichProvider, IRichInspector } from '@irich/react';
import { IRichRenderer } from '@irich/renderer';

// 1. Declare component schema
export const Hero = defineComponent({
  type: 'Hero',
  fields: {
    title: { type: 'text', defaultValue: 'Hello iRich' },
    align: { type: 'select', options: [{ label: 'Center', value: 'center' }] }
  }
});

// 2. Mount Visual Studio or SSR Renderer
<IRichProvider editor={editor}>
  <IRichInspector />
</IRichProvider>`;

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '3.5rem 1.5rem 5rem' }}>
      {/* 1. HERO BANNER */}
      <section style={{ textAlign: 'center', marginBottom: '4.5rem' }}>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.35rem 0.85rem',
            borderRadius: '9999px',
            background: 'rgba(99, 102, 241, 0.15)',
            border: '1px solid rgba(99, 102, 241, 0.3)',
            color: '#a5b4fc',
            fontSize: '0.8125rem',
            fontWeight: 600,
            marginBottom: '1.5rem',
          }}
        >
          <span>⚡ iRich v{VERSION} Documentation</span>
        </div>

        <h1
          style={{
            fontSize: 'clamp(2.5rem, 5vw, 4rem)',
            fontWeight: 800,
            letterSpacing: '-0.03em',
            lineHeight: 1.15,
            marginBottom: '1.25rem',
            background: 'linear-gradient(180deg, #ffffff 0%, #cbd5e1 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          Extensible Visual Content Editor & Page Builder
        </h1>

        <p
          style={{
            fontSize: '1.2rem',
            color: 'var(--text-secondary)',
            maxWidth: '720px',
            margin: '0 auto 2.5rem',
            lineHeight: 1.65,
          }}
        >
          Unifying structured rich-text authoring and modular component-based visual page composition into a single, framework-independent engine for React.
        </p>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <Link
            href="/docs/getting-started/quick-start"
            style={{
              padding: '0.75rem 1.75rem',
              borderRadius: 'var(--radius-md)',
              background: 'var(--accent-gradient)',
              color: '#fff',
              fontWeight: 600,
              boxShadow: '0 4px 16px rgba(99, 102, 241, 0.4)',
            }}
          >
            Quick Start (5-min Guide)
          </Link>
          <Link
            href="/docs/getting-started/introduction"
            style={{
              padding: '0.75rem 1.75rem',
              borderRadius: 'var(--radius-md)',
              background: 'var(--bg-surface-elevated)',
              color: 'var(--text-primary)',
              fontWeight: 600,
              border: '1px solid var(--border-muted)',
            }}
          >
            Explore Concepts
          </Link>
          <Link
            href="/docs/api/core"
            style={{
              padding: '0.75rem 1.75rem',
              borderRadius: 'var(--radius-md)',
              background: 'transparent',
              color: 'var(--text-secondary)',
              fontWeight: 600,
            }}
          >
            API Reference →
          </Link>
        </div>
      </section>

      {/* 2. CORE SECTIONS GRID */}
      <section style={{ marginBottom: '5rem' }}>
        <h2 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '1.5rem', textAlign: 'center' }}>
          Documentation Sections
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
          {/* Card 1 */}
          <Link
            href="/docs/getting-started/introduction"
            style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-lg)',
              padding: '1.75rem',
              transition: 'all 0.2s ease',
              display: 'block',
            }}
          >
            <div style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem', color: '#fff' }}>
              🚀 Getting Started
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem', lineHeight: 1.6 }}>
              Introduction, installation, 5-minute quick start, Next.js SSR integration, and standalone React + Vite setups.
            </p>
          </Link>

          {/* Card 2 */}
          <Link
            href="/docs/core-concepts/documents"
            style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-lg)',
              padding: '1.75rem',
              transition: 'all 0.2s ease',
              display: 'block',
            }}
          >
            <div style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem', color: '#fff' }}>
              🧠 Core Concepts
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem', lineHeight: 1.6 }}>
              JSON documents, stable Node IDs, component schemas, commands pipeline, and undo/redo history.
            </p>
          </Link>

          {/* Card 3 */}
          <Link
            href="/docs/visual-editor/canvas"
            style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-lg)',
              padding: '1.75rem',
              transition: 'all 0.2s ease',
              display: 'block',
            }}
          >
            <div style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem', color: '#fff' }}>
              🎨 Visual Editor
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem', lineHeight: 1.6 }}>
              Interactive canvas, component palette, &lt;IRichInspector /&gt;, responsive viewport overrides, and rich-text editing.
            </p>
          </Link>

          {/* Card 4 */}
          <Link
            href="/docs/advanced/plugins"
            style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-lg)',
              padding: '1.75rem',
              transition: 'all 0.2s ease',
              display: 'block',
            }}
          >
            <div style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem', color: '#fff' }}>
              ⚡ Advanced Features
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem', lineHeight: 1.6 }}>
              Plugin SDK, storage persistence adapters, custom multi-zone containers, and experimental AI Action Protocol.
            </p>
          </Link>

          {/* Card 5 */}
          <Link
            href="/docs/api/core"
            style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-lg)',
              padding: '1.75rem',
              transition: 'all 0.2s ease',
              display: 'block',
            }}
          >
            <div style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem', color: '#fff' }}>
              📖 API Reference
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem', lineHeight: 1.6 }}>
              Comprehensive API documentation for @irich/core, @irich/react, @irich/renderer, @irich/rich-text, and @irich/plugin-sdk.
            </p>
          </Link>

          {/* Card 6 */}
          <Link
            href="/docs/visual-editor/responsive"
            style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-lg)',
              padding: '1.75rem',
              transition: 'all 0.2s ease',
              display: 'block',
            }}
          >
            <div style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem', color: '#fff' }}>
              📱 Responsive Breakpoints
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem', lineHeight: 1.6 }}>
              Learn how iRich resolves cascading fallback inheritance across desktop, tablet, and mobile views.
            </p>
          </Link>
        </div>
      </section>

      {/* 3. CODE PREVIEW */}
      <section style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '2.5rem', marginBottom: '5rem' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.75rem' }}>
          Code at a Glance
        </h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '0.9375rem' }}>
          Declarative component definitions in `@irich/core` bind seamlessly to React renderers and visual editor inspectors.
        </p>
        <CodeBlock code={quickStartCode} language="typescript" />
      </section>
    </div>
  );
}
