/**
 * Visual Canvas for Vite example using canonical IRichCanvas from @irich/react.
 * Zero duplicate recursive traversal or DnD logic.
 */

import { useEffect, useMemo, useState } from 'react';
import type { JSONValue } from '@irich/core';
import type { ComponentMap, NodeRendererProps } from '@irich/renderer';
import {
  IRichCanvas,
  IRichTextEditor,
  IRichTextRenderer,
  useIRichBreakpoint,
  useIRichEditor,
  useIRichSelection,
  type RichTextDocument,
} from '@irich/react';
import { createViteRegistry } from '../components/definitions';
import { viteRenderers } from '../components/renderers';

/**
 * Interactive RichText renderer for visual canvas editing mode.
 * Provides double-click and inline editing with Tiptap floating toolbar.
 */
function InteractiveRichTextRenderer({
  node,
  content,
  placeholder = 'Click to edit formatted prose...',
  dir,
  lang,
}: NodeRendererProps<{
  content?: RichTextDocument | string;
  placeholder?: string;
}>) {
  const editor = useIRichEditor();
  const { selectedNodeId } = useIRichSelection();
  const isSelected = selectedNodeId === node.id;
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (!isSelected && isEditing) {
      setIsEditing(false);
    }
  }, [isSelected, isEditing]);

  const handleContentChange = (newDoc: RichTextDocument) => {
    editor.commands.updateNode({
      nodeId: node.id,
      props: {
        content: newDoc as unknown as JSONValue,
      },
    });
  };

  return (
    <div
      className={`vite-richtext-interactive ${isEditing ? 'editing' : 'view'}`}
      onDoubleClick={(e) => {
        e.stopPropagation();
        setIsEditing(true);
      }}
      dir={dir}
      lang={lang}
    >
      {isEditing ? (
        <div className="vite-richtext-editor-box">
          <IRichTextEditor
            content={content}
            dir={dir}
            lang={lang}
            onChange={handleContentChange}
            placeholder={placeholder}
            editable={true}
            showFloatingToolbar={true}
            autoFocus={true}
          />
          <div className="vite-richtext-editor-footer">
            <span className="vite-richtext-hint">Format text inline with toolbar</span>
            <button
              type="button"
              className="vite-btn vite-btn-primary vite-btn-sm"
              onClick={(e) => {
                e.stopPropagation();
                setIsEditing(false);
              }}
            >
              ✓ Done
            </button>
          </div>
        </div>
      ) : (
        <div className="vite-richtext-view-box" title="Double-click to edit">
          <IRichTextRenderer content={content} dir={dir} lang={lang} />
          {isSelected && (
            <div className="vite-richtext-edit-overlay">
              <button
                type="button"
                className="vite-btn vite-btn-secondary vite-btn-sm"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsEditing(true);
                }}
              >
                ✎ Edit Prose
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * Creates the Vite visual editor component map, composing the complete
 * published editorial renderers with the interactive RichText editing component.
 */
export function createViteEditorComponentMap(): ComponentMap {
  return {
    ...viteRenderers,
    RichText: InteractiveRichTextRenderer,
  };
}

export const viteEditorRenderers: ComponentMap = createViteEditorComponentMap();

export function EditorCanvas() {
  const { breakpoint } = useIRichBreakpoint();
  const registry = useMemo(() => createViteRegistry(), []);

  return (
    <main className="vite-editor-canvas-container" aria-label="Visual Canvas">
      <IRichCanvas
        components={viteEditorRenderers}
        registry={registry}
        breakpoint={breakpoint}
        className="vite-canvas-viewport"
      />
    </main>
  );
}
