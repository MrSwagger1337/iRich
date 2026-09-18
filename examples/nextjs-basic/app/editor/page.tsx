'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  createEditor,
  createNode,
  type Breakpoint,
  type EditorInstance,
  type IRichDocument,
  type IRichNode,
  type JSONValue,
} from '@irich/core';
import type { ComponentRenderer } from '@irich/renderer';
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
  createNextjsRegistry,
  sampleComponentDefinitions,
} from '../components/definitions';
import { nextjsRenderers } from '../components/renderers';
import { initialNextjsDocument } from '../components/sample-document';

const STORAGE_KEY = 'irich_nextjs_demo_doc';

// --- VISUAL EDITOR INNER SHELL ---

function VisualEditorInner({ onExportJson, onImportJson }: { onExportJson: () => void; onImportJson: () => void }) {
  const editor = useIRichEditor();
  const document = useIRichDocument();
  const { selectedNodeId, selectNode, clearSelection } = useIRichSelection();
  const { breakpoint, setBreakpoint } = useIRichBreakpoint();
  const { canUndo, canRedo, undo, redo } = useIRichHistory();

  // Bind productivity keyboard shortcuts
  useIRichKeyboardShortcuts();

  // Autosave integration
  const storageAdapter = useMemo(() => new LocalStorageAdapter(), []);
  const autosave = useIRichAutosave({
    documentId: STORAGE_KEY,
    adapter: storageAdapter,
    debounceMs: 500,
  });

  const registry = useMemo(() => createNextjsRegistry(), []);

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

    // If selected is a leaf, insert as sibling next to selected
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
    <div className="irich-editor-shell">
      {/* 1. TOP TOOLBAR */}
      <header className="irich-editor-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Link href="/" className="irich-btn irich-btn-ghost irich-btn-sm" title="Back to published live view">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="19" y1="12" x2="5" y2="12" />
              <polyline points="12 19 5 12 12 5" />
            </svg>
            Live View
          </Link>

          <div style={{ height: '18px', width: '1px', background: 'var(--border-muted)' }} />

          {/* Undo / Redo */}
          <button
            onClick={undo}
            disabled={!canUndo}
            className="irich-btn irich-btn-ghost irich-btn-sm"
            style={{ opacity: canUndo ? 1 : 0.4 }}
            title="Undo (Cmd/Ctrl+Z)"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 7v6h6" />
              <path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13" />
            </svg>
          </button>
          <button
            onClick={redo}
            disabled={!canRedo}
            className="irich-btn irich-btn-ghost irich-btn-sm"
            style={{ opacity: canRedo ? 1 : 0.4 }}
            title="Redo (Cmd/Ctrl+Shift+Z)"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 7v6h-6" />
              <path d="M3 17a9 9 0 0 1 9-9 9 9 0 0 1 6 2.3l3 2.7" />
            </svg>
          </button>

          {/* Autosave Status */}
          <span style={{ fontSize: '0.75rem', color: autosave.isSaving ? '#fbbf24' : '#34d399', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: autosave.isSaving ? '#fbbf24' : '#34d399' }} />
            {autosave.isSaving ? 'Saving...' : 'Saved to Storage'}
          </span>
        </div>

        {/* Responsive Viewport Controls */}
        <div style={{ display: 'flex', alignItems: 'center', background: 'var(--bg-main)', padding: '2px', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
          {(['desktop', 'tablet', 'mobile'] as Breakpoint[]).map((bp) => (
            <button
              key={bp}
              onClick={() => setBreakpoint(bp)}
              className="irich-btn irich-btn-ghost irich-btn-sm"
              style={{
                background: breakpoint === bp ? 'var(--bg-surface-elevated)' : 'transparent',
                color: breakpoint === bp ? '#fff' : 'var(--text-muted)',
                fontWeight: breakpoint === bp ? 700 : 500,
                textTransform: 'capitalize',
                padding: '0.25rem 0.65rem',
              }}
            >
              {bp}
            </button>
          ))}
        </div>

        {/* Action Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <button onClick={onExportJson} className="irich-btn irich-btn-secondary irich-btn-sm">
            Export JSON
          </button>
          <button onClick={onImportJson} className="irich-btn irich-btn-secondary irich-btn-sm">
            Import JSON
          </button>
          <Link href="/" className="irich-btn irich-btn-primary irich-btn-sm">
            View Live
          </Link>
        </div>
      </header>

      {/* 2. THREE-PANE EDITOR BODY */}
      <div className="irich-editor-body">
        {/* Left: Component Palette */}
        <aside className="irich-editor-sidebar-left">
          <div className="irich-palette-section">
            <h3 className="irich-palette-title">Add Components</h3>
            <div className="irich-palette-grid">
              {sampleComponentDefinitions.map((comp) => (
                <button
                  key={comp.type}
                  onClick={() => handleInsertComponent(comp.type)}
                  className="irich-palette-item"
                >
                  <div
                    style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '4px',
                      background: 'rgba(99, 102, 241, 0.15)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#818cf8',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                    }}
                  >
                    +
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: '0.8125rem' }}>{comp.label}</div>
                    <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {comp.category}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* Center: Interactive Visual Canvas */}
        <main className="irich-editor-canvas-container" onClick={() => clearSelection()}>
          <div
            style={{
              width: getCanvasWidth(),
              transition: 'width 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
              background: 'var(--bg-main)',
              borderRadius: 'var(--radius-lg)',
              boxShadow: '0 20px 50px rgba(0, 0, 0, 0.6)',
              border: '1px solid var(--border-subtle)',
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
        <aside className="irich-editor-sidebar-right">
          <IRichInspector />
        </aside>
      </div>
    </div>
  );
}

// --- INTERACTIVE CANVAS RENDERER ---

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

  // Look up renderer
  const RendererComponent = (nextjsRenderers as Record<string, ComponentRenderer>)[node.type];

  return (
    <div
      onClick={handleClick}
      style={{
        position: 'relative',
        outline: isSelected ? '2px solid #6366f1' : '1px dashed transparent',
        outlineOffset: '-1px',
        transition: 'outline 0.15s ease',
        cursor: 'pointer',
      }}
      onMouseEnter={(e) => {
        if (!isSelected) (e.currentTarget as HTMLElement).style.outline = '1px dashed #475569';
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
            background: '#6366f1',
            color: '#fff',
            fontSize: '0.6875rem',
            fontWeight: 700,
            padding: '2px 6px',
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

// --- ROOT PAGE COMPONENT ---

export default function EditorPage() {
  const [editor, setEditor] = useState<EditorInstance | null>(null);
  const [jsonModalText, setJsonModalText] = useState<string | null>(null);
  const [isImportMode, setIsImportMode] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);

  useEffect(() => {
    const registry = createNextjsRegistry();
    let initialDoc: IRichDocument = initialNextjsDocument;

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

    const ed = createEditor({
      registry,
      initialDocument: initialDoc,
    });

    setEditor(ed);

    return () => {
      ed.destroy();
    };
  }, []);

  if (!editor) {
    return (
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#090d16' }}>
        <p style={{ color: '#94a3b8' }}>Loading iRich Editor...</p>
      </div>
    );
  }

  const handleExport = () => {
    const doc = editor.getDocument();
    setJsonModalText(JSON.stringify(doc, null, 2));
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

  return (
    <IRichProvider editor={editor}>
      <VisualEditorInner onExportJson={handleExport} onImportJson={handleImport} />

      {/* JSON Import/Export Modal */}
      {jsonModalText !== null && (
        <div className="irich-drawer-overlay" onClick={() => setJsonModalText(null)}>
          <div className="irich-drawer-content" onClick={(e) => e.stopPropagation()}>
            <div className="irich-drawer-header">
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>
                  {isImportMode ? 'Import Document JSON' : 'Export Document JSON'}
                </h3>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                  {isImportMode ? 'Paste a valid iRich JSON document below' : 'Copy canonical document state'}
                </p>
              </div>
              <button onClick={() => setJsonModalText(null)} className="irich-btn irich-btn-ghost irich-btn-sm">
                ✕
              </button>
            </div>

            {importError && (
              <div style={{ padding: '0.75rem', marginBottom: '1rem', background: 'rgba(239, 68, 68, 0.15)', border: '1px solid #ef4444', borderRadius: '6px', color: '#fca5a5', fontSize: '0.8125rem' }}>
                {importError}
              </div>
            )}

            {isImportMode ? (
              <textarea
                value={jsonModalText}
                onChange={(e) => setJsonModalText(e.target.value)}
                className="irich-json-pre"
                style={{ width: '100%', height: '350px', resize: 'vertical' }}
              />
            ) : (
              <pre className="irich-json-pre">{jsonModalText}</pre>
            )}

            <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button onClick={() => setJsonModalText(null)} className="irich-btn irich-btn-secondary irich-btn-md">
                Cancel
              </button>
              {isImportMode ? (
                <button onClick={handleApplyImport} className="irich-btn irich-btn-primary irich-btn-md">
                  Apply Document
                </button>
              ) : (
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(jsonModalText);
                    setJsonModalText(null);
                  }}
                  className="irich-btn irich-btn-primary irich-btn-md"
                >
                  Copy & Close
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </IRichProvider>
  );
}
