/**
 * @irich/rich-text
 * Interactive rich-text editor component.
 */

import { useEffect, useState } from 'react';
import { EditorContent } from '@tiptap/react';
import { useIRichText } from './hooks';
import { RichTextFloatingToolbar, RichTextToolbar } from './toolbar';
import type { IRichTextEditorProps } from './types';
import { IRichTextRenderer } from './renderer';

/**
 * Interactive rich-text editor component with formatting toolbars.
 */
export function IRichTextEditor({
  content,
  onChange,
  editable = true,
  placeholder = 'Write something...',
  showFloatingToolbar = true,
  showToolbar = false,
  renderToolbar,
  className = '',
  style,
  onBlur,
  onFocus,
  autoFocus = false,
}: IRichTextEditorProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const { editor, controller } = useIRichText({
    content,
    editable,
    placeholder,
    onChange,
    onFocus,
    onBlur,
    autoFocus,
  });

  // During SSR or before client hydration, render static safe representation
  if (!isMounted || !editor) {
    return (
      <IRichTextRenderer
        content={content}
        className={`irich-rich-editor-ssr ${className}`.trim()}
        style={style}
      />
    );
  }

  return (
    <div
      className={`irich-rich-editor-container ${editable ? 'editable' : 'readonly'} ${className}`.trim()}
      style={style}
    >
      {/* Top Static Toolbar */}
      {showToolbar && editable && (
        renderToolbar ? renderToolbar(controller) : <RichTextToolbar controller={controller} />
      )}

      {/* Floating Contextual Toolbar */}
      {showFloatingToolbar && editable && (
        <RichTextFloatingToolbar controller={controller} />
      )}

      {/* Tiptap ProseMirror Content */}
      <EditorContent editor={editor} className="irich-rich-prosemirror-wrapper" />
    </div>
  );
}
