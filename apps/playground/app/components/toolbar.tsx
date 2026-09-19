/**
 * Top Toolbar Header for iRich Playground.
 */

'use client';

import React, { useState } from 'react';
import {
  IRichDocumentJsonModal,
  useIRichEditor,
  useIRichHistory,
  useIRichSelection,
} from '@irich/react';
import { createPlaygroundSampleDocument } from './sample-document';

export type ViewportMode = 'desktop' | 'tablet' | 'mobile';

interface ToolbarProps {
  viewport: ViewportMode;
  onViewportChange: (mode: ViewportMode) => void;
}

export function Toolbar({ viewport, onViewportChange }: ToolbarProps) {
  const editor = useIRichEditor();
  const { canUndo, canRedo, undo, redo } = useIRichHistory();
  const { selectedNodeId, clearSelection } = useIRichSelection();
  const [showJsonModal, setShowJsonModal] = useState(false);

  const handleResetDocument = () => {
    if (window.confirm('Reset document to sample template? Any unsaved changes will be lost.')) {
      const sampleDoc = createPlaygroundSampleDocument();
      editor.commands.batch(() => {
        // Clear children
        const currentChildren = [...(editor.getDocument().root.children || [])];
        for (const child of currentChildren) {
          editor.commands.removeNode(child.id);
        }
        // Insert sample children
        for (const sampleChild of sampleDoc.root.children || []) {
          editor.commands.insertNode({
            node: sampleChild,
            parentId: 'root',
          });
        }
        clearSelection();
      });
    }
  };


  return (
    <>
      <header className="irich-toolbar">
        {/* Left: Brand & Badges */}
        <div className="irich-toolbar-section irich-toolbar-left">
          <div className="irich-brand">
            <span className="irich-brand-logo">✦</span>
            <span className="irich-brand-name">iRich</span>
            <span className="irich-brand-badge">Playground</span>
          </div>

          <div className="irich-toolbar-divider" />

          {/* Undo / Redo */}
          <div className="irich-toolbar-group">
            <button
              type="button"
              className="irich-tool-btn"
              onClick={undo}
              disabled={!canUndo}
              title="Undo (Ctrl+Z)"
              aria-label="Undo last action"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 14 4 9l5-5" />
                <path d="M4 9h10.5a5.5 5.5 0 0 1 5.5 5.5v0a5.5 5.5 0 0 1-5.5 5.5H11" />
              </svg>
              <span>Undo</span>
            </button>

            <button
              type="button"
              className="irich-tool-btn"
              onClick={redo}
              disabled={!canRedo}
              title="Redo (Ctrl+Y)"
              aria-label="Redo last action"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="m15 14 5-5-5-5" />
                <path d="M20 9H9.5A5.5 5.5 0 0 0 4 14.5v0A5.5 5.5 0 0 0 9.5 20H13" />
              </svg>
              <span>Redo</span>
            </button>
          </div>
        </div>

        {/* Center: Viewport Switcher */}
        <div className="irich-toolbar-section irich-toolbar-center">
          <div className="irich-viewport-switcher" role="group" aria-label="Viewport device switcher">
            <button
              type="button"
              className={`irich-viewport-btn ${viewport === 'desktop' ? 'active' : ''}`}
              onClick={() => onViewportChange('desktop')}
              title="Desktop view (100%)"
              aria-label="Desktop viewport"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="2" y="3" width="20" height="14" rx="2" />
                <line x1="8" y1="21" x2="16" y2="21" />
                <line x1="12" y1="17" x2="12" y2="21" />
              </svg>
              <span>Desktop</span>
            </button>

            <button
              type="button"
              className={`irich-viewport-btn ${viewport === 'tablet' ? 'active' : ''}`}
              onClick={() => onViewportChange('tablet')}
              title="Tablet view (768px)"
              aria-label="Tablet viewport"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="4" y="2" width="16" height="20" rx="2" />
                <line x1="12" y1="18" x2="12.01" y2="18" strokeWidth="3" />
              </svg>
              <span>Tablet</span>
            </button>

            <button
              type="button"
              className={`irich-viewport-btn ${viewport === 'mobile' ? 'active' : ''}`}
              onClick={() => onViewportChange('mobile')}
              title="Mobile view (375px)"
              aria-label="Mobile viewport"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="5" y="2" width="14" height="20" rx="2" />
                <line x1="12" y1="18" x2="12.01" y2="18" strokeWidth="3" />
              </svg>
              <span>Mobile</span>
            </button>
          </div>
        </div>

        {/* Right: Actions & Modals */}
        <div className="irich-toolbar-section irich-toolbar-right">
          {selectedNodeId && (
            <button
              type="button"
              className="irich-tool-btn irich-tool-btn-highlight"
              onClick={clearSelection}
              title="Deselect currently selected component"
              aria-label="Deselect component"
            >
              <span>Deselect ({selectedNodeId})</span>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          )}

          <button
            type="button"
            className="irich-tool-btn"
            onClick={() => setShowJsonModal(true)}
            title="View JSON document state"
            aria-label="View JSON Document"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="16 18 22 12 16 6" />
              <polyline points="8 6 2 12 8 18" />
            </svg>
            <span>JSON</span>
          </button>

          <button
            type="button"
            className="irich-tool-btn"
            onClick={handleResetDocument}
            title="Reset document to initial template"
            aria-label="Reset document"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
              <path d="M3 3v5h5" />
            </svg>
            <span>Reset</span>
          </button>
        </div>
      </header>

      {/* Canonical Document JSON Studio Modal */}
      {showJsonModal && (
        <IRichDocumentJsonModal
          isOpen={showJsonModal}
          onClose={() => setShowJsonModal(false)}
        />
      )}
    </>
  );
}

