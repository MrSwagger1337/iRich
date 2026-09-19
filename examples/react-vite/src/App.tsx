import { useEffect, useState } from 'react';
import {
  createEditor,
  type EditorInstance,
  type IRichDocument,
} from '@irich/core';
import { IRichRenderer } from '@irich/renderer';
import { IRichDocumentJsonModal, IRichProvider } from '@irich/react';
import { createViteRegistry } from './components/definitions';
import { viteRenderers } from './components/renderers';
import { initialViteDocument } from './components/sample-document';
import { initialArabicViteDocument } from './components/sample-document-arabic';
import { EditorStudio } from './editor/EditorStudio';

type FixtureKey = 'english' | 'arabic';

function getInitialDocument(fixture: FixtureKey): IRichDocument {
  const base = fixture === 'arabic' ? initialArabicViteDocument : initialViteDocument;
  const storageKey = `irich:vite-example:${fixture}`;

  try {
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed && parsed.root && parsed.version) {
        return parsed as IRichDocument;
      }
    }
  } catch {
    // Fallback to sample
  }

  return base;
}

// --- LIVE PUBLISHED PREVIEW ---

function LivePublishedView({
  document,
  currentFixture,
  onSwitchFixture,
  onSwitchToEditor,
  onOpenJsonModal,
  onReset,
}: {
  document: IRichDocument;
  currentFixture: FixtureKey;
  onSwitchFixture: (fixture: FixtureKey) => void;
  onSwitchToEditor: () => void;
  onOpenJsonModal: () => void;
  onReset: () => void;
}) {
  const docDirection = document.metadata?.direction || 'ltr';

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* 1. TOP NAVBAR */}
      <header className="vite-navbar">
        <div className="vite-nav-left">
          <div className="vite-logo-pill">
            <div className="vite-logo-icon">⚡</div>
            <span>iRich + Vite</span>
          </div>
          <span className="vite-badge-tag">
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#41d1ff' }} />
            Live Published View (Standalone SPA)
          </span>
        </div>

        <div className="vite-nav-right">
          {/* Fixture Selector */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              background: 'var(--bg-dark)',
              padding: '2px',
              borderRadius: '8px',
              border: '1px solid var(--border)',
            }}
          >
            <button
              type="button"
              onClick={() => onSwitchFixture('english')}
              className="vite-btn vite-btn-ghost vite-btn-sm"
              style={{
                background: currentFixture === 'english' ? 'var(--bg-surface)' : 'transparent',
                color: currentFixture === 'english' ? '#fff' : 'var(--text-sub)',
                fontWeight: currentFixture === 'english' ? 700 : 500,
                padding: '0.2rem 0.65rem',
              }}
            >
              EN (LTR)
            </button>
            <button
              type="button"
              onClick={() => onSwitchFixture('arabic')}
              className="vite-btn vite-btn-ghost vite-btn-sm"
              style={{
                background: currentFixture === 'arabic' ? 'var(--bg-surface)' : 'transparent',
                color: currentFixture === 'arabic' ? '#fff' : 'var(--text-sub)',
                fontWeight: currentFixture === 'arabic' ? 700 : 500,
                padding: '0.2rem 0.65rem',
              }}
            >
              AR (RTL)
            </button>
          </div>

          <button
            type="button"
            onClick={onOpenJsonModal}
            className="vite-btn vite-btn-secondary vite-btn-sm"
          >
            View JSON State
          </button>
          <button
            type="button"
            onClick={onReset}
            className="vite-btn vite-btn-ghost vite-btn-sm"
            title="Reset sample document"
          >
            Reset Sample
          </button>
          <button
            type="button"
            onClick={onSwitchToEditor}
            className="vite-btn vite-btn-primary vite-btn-sm"
          >
            Open Visual Studio
          </button>
        </div>
      </header>

      {/* 2. STANDALONE PRODUCTION RENDERER */}
      <main style={{ flex: 1 }} dir={docDirection}>
        <IRichRenderer
          document={document}
          components={viteRenderers}
        />
      </main>

      {/* 3. FOOTER */}
      <footer
        style={{
          borderTop: '1px solid var(--border)',
          padding: '2rem 1.5rem',
          textAlign: 'center',
          color: 'var(--text-muted)',
          fontSize: '0.875rem',
          background: 'var(--bg-card)',
        }}
      >
        <p>
          Rendered with <strong>@irich/renderer</strong> in React 19 + Vite 6 • Zero Next.js dependencies • Fully standalone.
        </p>
      </footer>
    </div>
  );
}

// --- MAIN APP COMPONENT ---

export default function App() {
  const [viewMode, setViewMode] = useState<'preview' | 'editor'>('preview');
  const [currentFixture, setCurrentFixture] = useState<FixtureKey>('english');
  const [editor, setEditor] = useState<EditorInstance | null>(null);
  const [publishedDoc, setPublishedDoc] = useState<IRichDocument>(() => getInitialDocument('english'));
  const [showJsonModal, setShowJsonModal] = useState(false);

  // Initialize and isolate Editor instance per fixture
  useEffect(() => {
    const registry = createViteRegistry();
    const doc = getInitialDocument(currentFixture);

    setPublishedDoc(doc);

    const ed = createEditor({
      registry,
      initialDocument: doc,
    });

    const unsubscribe = ed.subscribe((state) => {
      setPublishedDoc(state.document);
    });

    setEditor(ed);

    return () => {
      unsubscribe();
      ed.destroy();
    };
  }, [currentFixture]);

  const handleSwitchFixture = (fixture: FixtureKey) => {
    if (fixture !== currentFixture) {
      setCurrentFixture(fixture);
    }
  };

  const handleResetDocument = () => {
    const storageKey = `irich:vite-example:${currentFixture}`;
    try {
      localStorage.removeItem(storageKey);
    } catch {
      // ignore
    }

    const base = currentFixture === 'arabic' ? initialArabicViteDocument : initialViteDocument;
    setPublishedDoc(base);

    if (editor) {
      editor.commands.batch(() => {
        const currentChildren = [...(editor.getDocument().root.children || [])];
        for (const child of currentChildren) {
          editor.commands.removeNode(child.id);
        }
        for (const child of base.root.children || []) {
          editor.commands.insertNode({
            node: child,
            parentId: editor.getDocument().root.id,
          });
        }
        editor.commands.clearSelection();
      });
    }
  };

  if (!editor) {
    return (
      <div
        style={{
          height: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'var(--bg-dark)',
          color: 'var(--text-sub)',
        }}
      >
        <p>Loading iRich Vite Studio...</p>
      </div>
    );
  }

  return (
    <IRichProvider editor={editor}>
      {viewMode === 'preview' ? (
        <LivePublishedView
          document={publishedDoc}
          currentFixture={currentFixture}
          onSwitchFixture={handleSwitchFixture}
          onSwitchToEditor={() => setViewMode('editor')}
          onOpenJsonModal={() => setShowJsonModal(true)}
          onReset={handleResetDocument}
        />
      ) : (
        <EditorStudio
          currentFixture={currentFixture}
          onSwitchFixture={handleSwitchFixture}
          onSwitchToPreview={() => setViewMode('preview')}
        />
      )}

      {/* JSON Studio modal for LivePublishedView */}
      <IRichDocumentJsonModal
        isOpen={showJsonModal}
        onClose={() => setShowJsonModal(false)}
      />
    </IRichProvider>
  );
}
