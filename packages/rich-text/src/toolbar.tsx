'use client';

/**
 * @irich/rich-text
 * Formatting toolbars (docked and floating bubble) for rich-text authoring.
 */

import { useState, type FormEvent, type ReactNode } from 'react';
import type { IRichTextController } from './types';

export interface RichTextToolbarProps {
  readonly controller: IRichTextController;
  readonly className?: string;
  readonly onDone?: () => void;
  readonly extraActions?: ReactNode;
}

/**
 * Standard or floating formatting toolbar for rich text.
 */
export function RichTextToolbar({
  controller,
  className = '',
  onDone,
  extraActions,
}: RichTextToolbarProps) {
  const [isLinkPromptOpen, setIsLinkPromptOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');

  const handleLinkSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (linkUrl.trim()) {
      controller.setLink(linkUrl.trim());
    } else {
      controller.unsetLink();
    }
    setIsLinkPromptOpen(false);
    setLinkUrl('');
  };

  const handleOpenLinkPrompt = () => {
    if (controller.isActive('link')) {
      controller.unsetLink();
    } else {
      setIsLinkPromptOpen(true);
    }
  };

  return (
    <div className={`irich-rich-toolbar ${className}`.trim()} role="toolbar" aria-label="Rich text formatting">
      {/* Block Type Buttons */}
      <div className="irich-rich-toolbar-group">
        <button
          type="button"
          className={`irich-rich-btn ${controller.isActive('paragraph') ? 'active' : ''}`}
          onClick={() => controller.setParagraph()}
          title="Normal text (Paragraph)"
          aria-label="Normal text"
        >
          ¶
        </button>
        <button
          type="button"
          className={`irich-rich-btn ${controller.isActive('heading', { level: 1 }) ? 'active' : ''}`}
          onClick={() => controller.toggleHeading(1)}
          title="Heading 1"
          aria-label="Heading 1"
        >
          H1
        </button>
        <button
          type="button"
          className={`irich-rich-btn ${controller.isActive('heading', { level: 2 }) ? 'active' : ''}`}
          onClick={() => controller.toggleHeading(2)}
          title="Heading 2"
          aria-label="Heading 2"
        >
          H2
        </button>
        <button
          type="button"
          className={`irich-rich-btn ${controller.isActive('heading', { level: 3 }) ? 'active' : ''}`}
          onClick={() => controller.toggleHeading(3)}
          title="Heading 3"
          aria-label="Heading 3"
        >
          H3
        </button>
      </div>

      <div className="irich-rich-toolbar-divider" />

      {/* Inline Marks */}
      <div className="irich-rich-toolbar-group">
        <button
          type="button"
          className={`irich-rich-btn ${controller.isActive('bold') ? 'active' : ''}`}
          onClick={() => controller.toggleBold()}
          title="Bold (Ctrl+B)"
          aria-label="Bold"
        >
          <strong>B</strong>
        </button>
        <button
          type="button"
          className={`irich-rich-btn ${controller.isActive('italic') ? 'active' : ''}`}
          onClick={() => controller.toggleItalic()}
          title="Italic (Ctrl+I)"
          aria-label="Italic"
        >
          <em>I</em>
        </button>
        <button
          type="button"
          className={`irich-rich-btn ${controller.isActive('strike') ? 'active' : ''}`}
          onClick={() => controller.toggleStrike()}
          title="Strikethrough"
          aria-label="Strikethrough"
        >
          <s>S</s>
        </button>
        <button
          type="button"
          className={`irich-rich-btn ${controller.isActive('code') ? 'active' : ''}`}
          onClick={() => controller.toggleCode()}
          title="Inline code"
          aria-label="Inline code"
        >
          &lt;/&gt;
        </button>
        <button
          type="button"
          className={`irich-rich-btn ${controller.isActive('link') ? 'active' : ''}`}
          onClick={handleOpenLinkPrompt}
          title={controller.isActive('link') ? 'Remove link' : 'Add link'}
          aria-label="Link"
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
          </svg>
        </button>
      </div>

      <div className="irich-rich-toolbar-divider" />

      {/* Lists and Quotes */}
      <div className="irich-rich-toolbar-group">
        <button
          type="button"
          className={`irich-rich-btn ${controller.isActive('bulletList') ? 'active' : ''}`}
          onClick={() => controller.toggleBulletList()}
          title="Bullet list"
          aria-label="Bullet list"
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="8" y1="6" x2="21" y2="6" />
            <line x1="8" y1="12" x2="21" y2="12" />
            <line x1="8" y1="18" x2="21" y2="18" />
            <circle cx="4" cy="6" r="1.5" fill="currentColor" />
            <circle cx="4" cy="12" r="1.5" fill="currentColor" />
            <circle cx="4" cy="18" r="1.5" fill="currentColor" />
          </svg>
        </button>
        <button
          type="button"
          className={`irich-rich-btn ${controller.isActive('orderedList') ? 'active' : ''}`}
          onClick={() => controller.toggleOrderedList()}
          title="Numbered list"
          aria-label="Numbered list"
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="10" y1="6" x2="21" y2="6" />
            <line x1="10" y1="12" x2="21" y2="12" />
            <line x1="10" y1="18" x2="21" y2="18" />
            <path d="M4 6h1.5v4" />
            <path d="M3 10h3.5" />
            <path d="M3 14h2a1.5 1.5 0 0 1 1.5 1.5c0 .7-.5 1.2-1 1.5H3v1h4" />
          </svg>
        </button>
        <button
          type="button"
          className={`irich-rich-btn ${controller.isActive('blockquote') ? 'active' : ''}`}
          onClick={() => controller.toggleBlockquote()}
          title="Blockquote"
          aria-label="Blockquote"
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
            <path d="M6 17h3l2-4V7H5v6h3zm8 0h3l2-4V7h-6v6h3z" />
          </svg>
        </button>
      </div>

      <div className="irich-rich-toolbar-divider" />

      {/* History Actions */}
      <div className="irich-rich-toolbar-group">
        <button
          type="button"
          className="irich-rich-btn"
          onClick={() => controller.undo()}
          disabled={!controller.canUndo()}
          title="Undo (Ctrl+Z)"
          aria-label="Undo"
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 7v6h6" />
            <path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13" />
          </svg>
        </button>
        <button
          type="button"
          className="irich-rich-btn"
          onClick={() => controller.redo()}
          disabled={!controller.canRedo()}
          title="Redo (Ctrl+Y)"
          aria-label="Redo"
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 7v6h-6" />
            <path d="M3 17a9 9 0 0 1 9-9 9 9 0 0 1 6 2.3l3 2.7" />
          </svg>
        </button>
      </div>

      {extraActions}

      {/* Optional Done button */}
      {onDone && (
        <button
          type="button"
          className="irich-rich-btn irich-rich-btn-done"
          onClick={onDone}
          title="Finish editing"
          aria-label="Finish editing"
        >
          ✓ Done
        </button>
      )}

      {/* Link Input Popover */}
      {isLinkPromptOpen && (
        <form onSubmit={handleLinkSubmit} className="irich-rich-link-popover">
          <input
            type="url"
            className="irich-rich-link-input"
            placeholder="https://example.com"
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            autoFocus
          />
          <button type="submit" className="irich-rich-link-submit-btn">
            Apply
          </button>
          <button
            type="button"
            className="irich-rich-link-cancel-btn"
            onClick={() => setIsLinkPromptOpen(false)}
          >
            ✕
          </button>
        </form>
      )}
    </div>
  );
}

export interface RichTextFloatingToolbarProps {
  readonly controller: IRichTextController;
  readonly visible?: boolean;
  readonly onDone?: () => void;
}

/**
 * Floating contextual toolbar appearing right above the active editor.
 */
export function RichTextFloatingToolbar({
  controller,
  visible = true,
  onDone,
}: RichTextFloatingToolbarProps) {
  if (!visible) {
    return null;
  }

  return (
    <div className="irich-rich-floating-wrapper">
      <RichTextToolbar controller={controller} onDone={onDone} />
    </div>
  );
}
