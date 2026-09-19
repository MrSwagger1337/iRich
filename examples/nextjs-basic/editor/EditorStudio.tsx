/**
 * EditorStudio: 3-pane layout shell connecting toolbar, palette, canvas, and inspector.
 */

'use client';

import React, { useMemo, useState } from 'react';
import {
  IRichInspector,
  LocalStorageAdapter,
  useIRichAutosave,
  useIRichDocument,
  useIRichEditor,
  useIRichUIDirection,
} from '@irich/react';
import { initialNextjsDocument } from '../app/components/sample-document';
import { initialArabicDocument } from '../app/components/sample-document-arabic';
import { ComponentPalette } from './ComponentPalette';
import { EditorCanvas } from './EditorCanvas';
import { EditorToolbar } from './EditorToolbar';
import { JsonModal } from './JsonModal';

interface EditorStudioProps {
  currentFixture: 'english' | 'arabic';
  onSwitchFixture: (fixture: 'english' | 'arabic') => void;
}

export function EditorStudio({ currentFixture, onSwitchFixture }: EditorStudioProps) {
  const editor = useIRichEditor();
  const document = useIRichDocument();
  const { uiDirection } = useIRichUIDirection();
  const [showJsonModal, setShowJsonModal] = useState(false);

  const storageKey = `irich_nextjs_demo_doc_${currentFixture}`;

  // Autosave configuration
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

    const initialDoc =
      currentFixture === 'arabic' ? initialArabicDocument : initialNextjsDocument;

    // Reset document by replacing root children with sample document children
    editor.commands.batch(() => {
      // Remove all current root children
      const currentChildren = [...(editor.getDocument().root.children || [])];
      for (const child of currentChildren) {
        editor.commands.removeNode(child.id);
      }

      // Insert initial sample children
      for (const child of initialDoc.root.children || []) {
        editor.commands.insertNode({
          node: child,
          parentId: editor.getDocument().root.id,
        });
      }

      editor.commands.clearSelection();
    });
  };

  return (
    <div className="irich-editor-shell" dir={uiDirection}>
      {/* 1. TOP TOOLBAR */}
      <EditorToolbar
        isSaving={autosave.isSaving}
        currentFixture={currentFixture}
        onSwitchFixture={onSwitchFixture}
        onOpenJsonModal={() => setShowJsonModal(true)}
        onResetDraft={handleResetDraft}
      />

      {/* 2. 3-PANE WORKSPACE BODY */}
      <div className="irich-editor-body">
        {/* Left: Component Palette */}
        <ComponentPalette />

        {/* Center: Interactive Visual Canvas */}
        <EditorCanvas />

        {/* Right: Property Inspector */}
        <aside className="irich-editor-sidebar-right" aria-label="Properties Inspector">
          <div className="irich-inspector-header">
            <h2 className="irich-inspector-heading">Inspector</h2>
          </div>
          <IRichInspector />
        </aside>
      </div>

      {/* 3. JSON STATE MODAL */}
      {showJsonModal && (
        <JsonModal
          document={document}
          onClose={() => setShowJsonModal(false)}
        />
      )}
    </div>
  );
}

