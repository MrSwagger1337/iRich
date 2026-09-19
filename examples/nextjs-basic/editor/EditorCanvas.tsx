/**
 * Visual Canvas using canonical IRichCanvas from @irich/react.
 */

'use client';

import React, { useEffect, useMemo, useState } from 'react';
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
import { createNextjsRegistry } from '../app/components/definitions';
import {
  ButtonRenderer,
  CardRenderer,
  ContainerRenderer,
  HeadingRenderer,
  HeroRenderer,
} from '../app/components/renderers';

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
      className={`irich-richtext-interactive ${isEditing ? 'editing' : 'view'}`}
      onDoubleClick={(e) => {
        e.stopPropagation();
        setIsEditing(true);
      }}
    >
      {isEditing ? (
        <div className="irich-richtext-editor-box">
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
          <div className="irich-richtext-editor-footer">
            <span className="irich-richtext-hint">Double-click or format text inline</span>
            <button
              type="button"
              className="irich-btn irich-btn-primary irich-btn-sm"
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
        <div className="irich-richtext-view-box" title="Double click to edit">
          <IRichTextRenderer content={content} dir={dir} lang={lang} />
          {isSelected && (
            <div className="irich-richtext-edit-overlay">
              <button
                type="button"
                className="irich-btn irich-btn-secondary irich-btn-sm"
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

const interactiveRenderers: ComponentMap = {
  Hero: HeroRenderer,
  Heading: HeadingRenderer,
  RichText: InteractiveRichTextRenderer,
  Container: ContainerRenderer,
  Card: CardRenderer,
  Button: ButtonRenderer,
};

export function EditorCanvas() {
  const { breakpoint } = useIRichBreakpoint();
  const registry = useMemo(() => createNextjsRegistry(), []);

  return (
    <IRichCanvas
      components={interactiveRenderers}
      registry={registry}
      breakpoint={breakpoint}
      className="irich-editor-canvas-container"
    />
  );
}

