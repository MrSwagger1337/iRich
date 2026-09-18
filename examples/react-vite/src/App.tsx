import React, { useEffect, useMemo, useState } from 'react';
import {
  createEditor,
  createNode,
  type Breakpoint,
  type EditorInstance,
  type IRichDocument,
  type IRichNode,
  type JSONValue,
} from '@irich/core';
import { IRichRenderer, type ComponentRenderer } from '@irich/renderer';
import {
  IRichProvider,
  IRichInspector,
  useIRichEditor,
  useIRichDocument,
  useIRichSelection,
  useIRichBreakpoint,
  useIRichHistory,
  useIRichKeyboardShortcuts,
  useIRichAutosave,
  LocalStorageAdapter,
} from '@irich/react';
import {
  createViteRegistry,
  viteSampleComponents,
} from './components/definitions';
import { viteRenderers } from './components/renderers';
import { initialViteDocument } from './components/sample-document';

const STORAGE_KEY = 'irich_vite_demo_doc';

// --- INTERACTIVE CANVAS NODE ---

function InteractiveCanvasNode({
  node,
  selectedNodeId,
  onSelect,
  breakpoint,
}: {
  node: IRichNode;
  selectedNodeId: string | null;
  onSelect: (id: string) => void;
  breakpoint: Breakpoint;
}) {
  const isSelected = selectedNodeId === node.id;
  const isRoot = node.type === 'root';

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isRoot) {
      onSelect(node.id);
    }
  };

  const renderChildren = () => {
    if (!node.children || node.children.length === 0) {
      return null;
    }
    return node.children.map((child) => (
      <InteractiveCanvasNode
        key={child.id}
        node={child}
        selectedNodeId={selectedNodeId}
        onSelect={onSelect}
        breakpoint={breakpoint}
      />
    ));
  };

  if (isRoot) {
    return <div style={{ minHeight: '100%' }}>{renderChildren()}</div>;
  }

  const RendererComponent = (viteRenderers as Record<string, ComponentRenderer>)[node.type];

  return (
    <div
      onClick={handleClick}
      style={{
        position: 'relative',
        outline: isSelected ? '2px solid #bd34fe' : '1px dashed transparent',
        outlineOffset: '-1px',
        transition: 'outline 0.15s ease',
        cursor: 'pointer',
      }}
      onMouseEnter={(e) => {
        if (!isSelected) (e.currentTarget as HTMLElement).style.outline = '1px dashed #41d1ff';
      }}
      onMouseLeave={(e) => {
        if (!isSelected) (e.currentTarget as HTMLElement).style.outline = '1px dashed transparent';
      }}
    >
      {isSelected && (
        <div
          style={{
            position: 'absolute',
            top: '-20px',
            left: '8px',
            background: 'linear-gradient(135deg, #bd34fe 0%, #41d1ff 100%)',
            color: '#fff',
            fontSize: '0.6875rem',
            fontWeight: 700,
            padding: '2px 8px',
            borderRadius: '4px 4px 0 0',
            zIndex: 30,
            pointerEvents: 'none',
          }}
        >
          {node.type}
        </div>
      )}

      {RendererComponent ? (
        <RendererComponent
          node={node}
          id={node.id}
          {...node.props}
        >
          {renderChildren()}
        </RendererComponent>
      ) : (
        <div style={{ padding: '1rem', border: '1px dashed #ef4444', color: '#ef4444' }}>
          Unknown component: {node.type}
        </div>
      )}
    </div>
  );
}

// --- VISUAL EDITOR INNER STUDIO ---

function VisualEditorStudio({
  onSwitchToPreview,
  onExportJson,
  onImportJson,
}: {
  onSwitchToPreview: () => void;
  onExportJson: () => void;
  onImportJson: () => void;
}) {
  const editor = useIRichEditor();
  const document = useIRichDocument();
  const { selectedNodeId, selectNode, clearSelection } = useIRichSelection();
  const { breakpoint, setBreakpoint } = useIRichBreakpoint();
  const { canUndo, canRedo, undo, redo } = useIRichHistory();

  // Productivity keyboard shortcuts
  useIRichKeyboardShortcuts();

  // Autosave integration
  const storageAdapter = useMemo(() => new LocalStorageAdapter(), []);
  const autosave = useIRichAutosave({
    documentId: STORAGE_KEY,
    adapter: storageAdapter,
    debounceMs: 400,
  });

  const registry = useMemo(() => createViteRegistry(), []);

  const handleInsertComponent = (type: string) => {
    const compDef = registry.get(type);
    const rawDefaultProps = compDef?.defaultProps ?? {};
    const props: Record<string, JSONValue> = {};
    for (const [k, v] of Object.entries(rawDefaultProps)) {
      if (v !== undefined) {
        props[k] = v;
      }
    }

    const newNode = createNode({
      type,
      props,
    });

    const targetParentId = selectedNodeId ?? document.root.id;
    const parentNode = editor.getNode(targetParentId);

    // If selected node is a leaf, insert as child of root
    if (parentNode && compDef && compDef.canHaveChildren === false && targetParentId !== document.root.id) {
      editor.commands.insertNode({
        node: newNode,
        parentId: document.root.id,
      });
    } else {
      editor.commands.insertNode({
        node: newNode,
        parentId: targetParentId,
      });
    }

    editor.commands.selectNode(newNode.id);
  };

  const getCanvasWidth = () => {
    switch (breakpoint) {
      case 'mobile':
        return '375px';
      case 'tablet':
        return '768px';
      case 'desktop':
      default:
        return '100%';
    }
  };

  return (
    <div className="vite-editor-shell">
      {/* 1. TOP TOOLBAR */}
      <header className="vite-editor-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button
            onClick={onSwitchToPreview}
            className="vite-btn vite-btn-ghost vite-btn-sm"
            title="Switch to Live Published View"
          >
            <span style={{ marginRight: '6px' }}>←</span>
            Live Preview
          </button>

          <div style={{ height: '18px', width: '1px', background: 'var(--border)' }} />

          {/* Undo / Redo */}
          <button
            onClick={undo}
            disabled={!canUndo}
            className="vite-btn vite-btn-ghost vite-btn-sm"
            style={{ opacity: canUndo ? 1 : 0.4 }}
            title="Undo (Cmd/Ctrl+Z)"
          >
            ↺ Undo
          </button>
          <button
            onClick={redo}
            disabled={!canRedo}
            className="vite-btn vite-btn-ghost vite-btn-sm"
            style={{ opacity: canRedo ? 1 : 0.4 }}
            title="Redo (Cmd/Ctrl+Shift+Z)"
          >
            ↻ Redo
          </button>

          {/* Autosave Status */}
          <span
            style={{
              fontSize: '0.75rem',
              color: autosave.isSaving ? '#fbbf24' : '#34d399',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              marginLeft: '0.5rem',
            }}
          >
            <span
              style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                background: autosave.isSaving ? '#fbbf24' : '#34d399',
              }}
            />
            {autosave.isSaving ? 'Saving...' : 'Saved to LocalStorage'}
          </span>
        </div>

        {/* Viewport Breakpoint Controls */}
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
          {(['desktop', 'tablet', 'mobile'] as Breakpoint[]).map((bp) => (
            <button
              key={bp}
              onClick={() => setBreakpoint(bp)}
              className="vite-btn vite-btn-ghost vite-btn-sm"
              style={{
                background: breakpoint === bp ? 'var(--bg-surface)' : 'transparent',
                color: breakpoint === bp ? '#fff' : 'var(--text-sub)',
                fontWeight: breakpoint === bp ? 700 : 500,
                textTransform: 'capitalize',
                padding: '0.2rem 0.65rem',
              }}
            >
              {bp}
            </button>
          ))}
        </div>

        {/* Action Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <button onClick={onExportJson} className="vite-btn vite-btn-secondary vite-btn-sm">
            Export JSON
          </button>
          <button onClick={onImportJson} className="vite-btn vite-btn-secondary vite-btn-sm">
            Import JSON
          </button>
          <button onClick={onSwitchToPreview} className="vite-btn vite-btn-primary vite-btn-sm">
            View Live
          </button>
        </div>
      </header>

      {/* 2. THREE-PANE STUDIO BODY */}
      <div className="vite-editor-body">
        {/* Left: Component Palette */}
        <aside className="vite-editor-sidebar-left">
          <div className="vite-palette-section">
            <h3 className="vite-palette-title">Components</h3>
            <div className="vite-palette-grid">
              {viteSampleComponents.map((comp) => (
                <button
                  key={comp.type}
                  onClick={() => handleInsertComponent(comp.type)}
                  className="vite-palette-item"
                >
                  <div
                    style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '4px',
                      background: 'rgba(189, 52, 254, 0.15)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#bd34fe',
                      fontSize: '0.8125rem',
                      fontWeight: 700,
                    }}
                  >
                    +
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: '0.8125rem' }}>{comp.label}</div>
                    <div
                      style={{
                        fontSize: '0.6875rem',
                        color: 'var(--text-muted)',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {comp.category}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* Center: Interactive Visual Canvas */}
        <main className="vite-editor-canvas-container" onClick={() => clearSelection()}>
          <div
            style={{
              width: getCanvasWidth(),
              transition: 'width 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
              background: 'var(--bg-dark)',
              borderRadius: 'var(--radius-lg)',
              boxShadow: '0 20px 50px rgba(0, 0, 0, 0.6)',
              border: '1px solid var(--border)',
              minHeight: '100%',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <InteractiveCanvasNode
              node={document.root}
              selectedNodeId={selectedNodeId}
              onSelect={selectNode}
              breakpoint={breakpoint}
            />
          </div>
        </main>

        {/* Right: Dynamic Properties Inspector */}
        <aside className="vite-editor-sidebar-right">
          <IRichInspector />
        </aside>
      </div>
    </div>
  );
}

// --- LIVE PUBLISHED PREVIEW ---

function LivePublishedView({
  document,
  onSwitchToEditor,
  onExportJson,
  onReset,
}: {
  document: IRichDocument;
  onSwitchToEditor: () => void;
  onExportJson: () => void;
  onReset: () => void;
}) {
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
          <button onClick={onExportJson} className="vite-btn vite-btn-secondary vite-btn-sm">
            View JSON State
          </button>
          <button onClick={onReset} className="vite-btn vite-btn-ghost vite-btn-sm" title="Reset sample document">
            Reset Sample
          </button>
          <button onClick={onSwitchToEditor} className="vite-btn vite-btn-primary vite-btn-sm">
            Open Visual Studio
          </button>
        </div>
      </header>

      {/* 2. STANDALONE PRODUCTION RENDERER */}
      <main style={{ flex: 1 }}>
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
          Rendered with <strong>@irich/renderer</strong> in React + Vite • Zero Next.js dependencies • Fully standalone.
        </p>
      </footer>
    </div>
  );
}

// --- MAIN APP COMPONENT ---

export default function App() {
  const [viewMode, setViewMode] = useState<'preview' | 'editor'>('preview');
  const [editor, setEditor] = useState<EditorInstance | null>(null);
  const [currentDoc, setCurrentDoc] = useState<IRichDocument>(initialViteDocument);
  const [jsonModalText, setJsonModalText] = useState<string | null>(null);
  const [isImportMode, setIsImportMode] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Initialize Editor & load from LocalStorage
  useEffect(() => {
    const registry = createViteRegistry();
    let initialDoc: IRichDocument = initialViteDocument;

    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.root && parsed.version) {
          initialDoc = parsed;
        }
      }
    } catch {
      // fallback
    }

    setCurrentDoc(initialDoc);

    const ed = createEditor({
      registry,
      initialDocument: initialDoc,
    });

    const unsubscribe = ed.subscribe((state) => {
      setCurrentDoc(state.document);
    });

    setEditor(ed);

    return () => {
      unsubscribe();
      ed.destroy();
    };
  }, []);

  const handleExport = () => {
    const docToExport = editor ? editor.getDocument() : currentDoc;
    setJsonModalText(JSON.stringify(docToExport, null, 2));
    setIsImportMode(false);
    setImportError(null);
  };

  const handleImport = () => {
    setJsonModalText('{\n  "version": "1.0.0",\n  "root": {\n    "id": "root",\n    "type": "root",\n    "props": {},\n    "children": []\n  }\n}');
    setIsImportMode(true);
    setImportError(null);
  };

  const handleApplyImport = () => {
    try {
      if (!jsonModalText) return;
      const parsed = JSON.parse(jsonModalText);
      if (!parsed.root || !parsed.version) {
        throw new Error('Invalid document format: "version" and "root" are required.');
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
      window.location.reload();
    } catch (err) {
      setImportError((err as Error).message);
    }
  };

  const handleResetDocument = () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
    window.location.reload();
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
          document={currentDoc}
          onSwitchToEditor={() => setViewMode('editor')}
          onExportJson={handleExport}
          onReset={handleResetDocument}
        />
      ) : (
        <VisualEditorStudio
          onSwitchToPreview={() => setViewMode('preview')}
          onExportJson={handleExport}
          onImportJson={handleImport}
        />
      )}

      {/* JSON Modal / Drawer */}
      {jsonModalText !== null && (
        <div className="vite-drawer-overlay" onClick={() => setJsonModalText(null)}>
          <div className="vite-drawer-content" onClick={(e) => e.stopPropagation()}>
            <div className="vite-drawer-header">
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>
                  {isImportMode ? 'Import Document JSON' : 'Canonical Document JSON'}
                </h3>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-sub)' }}>
                  {isImportMode
                    ? 'Paste a valid iRich JSON document structure'
                    : 'Strictly serializable JSON state rendered by @irich/renderer'}
                </p>
              </div>
              <button onClick={() => setJsonModalText(null)} className="vite-btn vite-btn-ghost vite-btn-sm">
                ✕
              </button>
            </div>

            {importError && (
              <div
                style={{
                  padding: '0.75rem',
                  marginBottom: '1rem',
                  background: 'rgba(239, 68, 68, 0.15)',
                  border: '1px solid #ef4444',
                  borderRadius: '6px',
                  color: '#fca5a5',
                  fontSize: '0.8125rem',
                }}
              >
                {importError}
              </div>
            )}

            {isImportMode ? (
              <textarea
                value={jsonModalText}
                onChange={(e) => setJsonModalText(e.target.value)}
                className="vite-json-pre"
                style={{ width: '100%', height: '350px', resize: 'vertical' }}
              />
            ) : (
              <pre className="vite-json-pre">{jsonModalText}</pre>
            )}

            <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button onClick={() => setJsonModalText(null)} className="vite-btn vite-btn-secondary vite-btn-md">
                Cancel
              </button>
              {isImportMode ? (
                <button onClick={handleApplyImport} className="vite-btn vite-btn-primary vite-btn-md">
                  Apply Document
                </button>
              ) : (
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(jsonModalText);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                  }}
                  className="vite-btn vite-btn-primary vite-btn-md"
                >
                  {copied ? '✓ Copied JSON' : 'Copy JSON'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </IRichProvider>
  );
}
