/**
 * 3-Pane Editor Studio connecting Toolbar, ComponentPalette, EditorCanvas, and IRichInspector.
 * Uses public @irich/react primitives with UI direction isolation and autosave persistence.
 */

import { useMemo, useState } from 'react';
import {
  IRichDocumentJsonModal,
  IRichInspector,
  LocalStorageAdapter,
  useIRichAutosave,
  useIRichEditor,
  useIRichKeyboardShortcuts,
  useIRichUIDirection,
} from '@irich/react';
import { initialViteDocument } from '../components/sample-document';
import { initialArabicViteDocument } from '../components/sample-document-arabic';
import { ComponentPalette } from './ComponentPalette';
import { EditorCanvas } from './EditorCanvas';
import { EditorToolbar } from './EditorToolbar';

interface EditorStudioProps {
  currentFixture: 'english' | 'arabic';
  onSwitchFixture: (fixture: 'english' | 'arabic') => void;
  onSwitchToPreview: () => void;
}

export function EditorStudio({
  currentFixture,
  onSwitchFixture,
  onSwitchToPreview,
}: EditorStudioProps) {
  const editor = useIRichEditor();
  const { uiDirection } = useIRichUIDirection();
  const [showJsonModal, setShowJsonModal] = useState(false);

  // Enable productivity keyboard shortcuts (Undo, Redo, Cut, Copy, Paste, Duplicate, Delete)
  useIRichKeyboardShortcuts();

  // Namespaced storage key preventing fixture collisions
  const storageKey = `irich:vite-example:${currentFixture}`;

  const storageAdapter = useMemo(() => new LocalStorageAdapter(), []);
  const autosave = useIRichAutosave({
    documentId: storageKey,
    adapter: storageAdapter,
    debounceMs: 500,
  });

  const handleResetDraft = () => {
    try {
      localStorage.removeItem(storageKey);
    } catch {
      // ignore
    }

    const targetInitialDoc =
      currentFixture === 'arabic' ? initialArabicViteDocument : initialViteDocument;

    // Reset current document tree to fixture root children
    editor.commands.batch(() => {
      const currentChildren = [...(editor.getDocument().root.children || [])];
      for (const child of currentChildren) {
        editor.commands.removeNode(child.id);
      }

      for (const child of targetInitialDoc.root.children || []) {
        editor.commands.insertNode({
          node: child,
          parentId: editor.getDocument().root.id,
        });
      }

      editor.commands.clearSelection();
    });
  };

  return (
    <div className="vite-editor-shell" dir={uiDirection}>
      {/* 1. TOP TOOLBAR */}
      <EditorToolbar
        isSaving={autosave.isSaving}
        currentFixture={currentFixture}
        onSwitchFixture={onSwitchFixture}
        onOpenJsonModal={() => setShowJsonModal(true)}
        onResetDraft={handleResetDraft}
        onSwitchToPreview={onSwitchToPreview}
      />

      {/* 2. 3-PANE WORKSPACE BODY */}
      <div className="vite-editor-body">
        {/* Left: Component Palette */}
        <ComponentPalette />

        {/* Center: Interactive Visual Canvas */}
        <EditorCanvas />

        {/* Right: Property Inspector */}
        <aside className="vite-editor-sidebar-right" aria-label="Properties Inspector">
          <div
            style={{
              padding: '0.875rem 1rem',
              borderBottom: '1px solid var(--border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <h3 style={{ fontSize: '0.8125rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)' }}>
              Inspector
            </h3>
          </div>
          <div style={{ padding: '0.75rem 1rem' }}>
            <IRichInspector />
          </div>
        </aside>
      </div>

      {/* 3. DOCUMENT JSON STUDIO MODAL */}
      <IRichDocumentJsonModal
        isOpen={showJsonModal}
        onClose={() => setShowJsonModal(false)}
      />
    </div>
  );
}
