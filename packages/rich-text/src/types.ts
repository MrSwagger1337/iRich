/**
 * @irich/rich-text
 * Types and interfaces for rich-text AST, editor controller, and rendering primitives.
 */

import type { CSSProperties, ReactNode } from 'react';
import type { JSONValue } from '@irich/core';

/**
 * Inline mark applied to a text span (e.g. bold, italic, strike, code, link).
 */
export interface RichTextMark {
  readonly type: string;
  readonly attrs?: Record<string, JSONValue>;
}

/**
 * Node within a rich-text document AST (e.g. paragraph, heading, list, text).
 */
export interface RichTextNode {
  readonly type: string;
  readonly text?: string;
  readonly marks?: readonly RichTextMark[];
  readonly attrs?: Record<string, JSONValue>;
  readonly content?: readonly RichTextNode[];
}

/**
 * Canonical JSON-serializable rich-text document AST root.
 */
export interface RichTextDocument {
  readonly type: 'doc';
  readonly content?: readonly RichTextNode[];
}

/**
 * Framework-independent controller interface for interacting with rich-text editor instances.
 */
export interface IRichTextController {
  /**
   * Whether the editor is currently editable.
   */
  readonly isEditable: boolean;

  /**
   * Checks if a format or block type is currently active at selection.
   */
  readonly isActive: (name: string, attrs?: Record<string, unknown>) => boolean;

  /**
   * Whether undo operation is available in the local history.
   */
  readonly canUndo: () => boolean;

  /**
   * Whether redo operation is available in the local history.
   */
  readonly canRedo: () => boolean;

  /**
   * Toggles bold mark on selected text.
   */
  readonly toggleBold: () => void;

  /**
   * Toggles italic mark on selected text.
   */
  readonly toggleItalic: () => void;

  /**
   * Toggles strikethrough mark on selected text.
   */
  readonly toggleStrike: () => void;

  /**
   * Toggles inline code mark on selected text.
   */
  readonly toggleCode: () => void;

  /**
   * Toggles blockquote format on the current block.
   */
  readonly toggleBlockquote: () => void;

  /**
   * Toggles heading level (1-6) on the current block.
   */
  readonly toggleHeading: (level: 1 | 2 | 3 | 4 | 5 | 6) => void;

  /**
   * Converts the current block back to a normal paragraph.
   */
  readonly setParagraph: () => void;

  /**
   * Toggles unordered bullet list format.
   */
  readonly toggleBulletList: () => void;

  /**
   * Toggles ordered numbered list format.
   */
  readonly toggleOrderedList: () => void;

  /**
   * Applies hyperlink URL to the selected text.
   */
  readonly setLink: (url: string) => void;

  /**
   * Removes hyperlink mark from selected text.
   */
  readonly unsetLink: () => void;

  /**
   * Undoes the last rich-text mutation.
   */
  readonly undo: () => void;

  /**
   * Redoes the previously undone mutation.
   */
  readonly redo: () => void;

  /**
   * Programmatically replaces editor content.
   */
  readonly setContent: (content: RichTextDocument | string) => void;

  /**
   * Retrieves canonical JSON-serializable AST.
   */
  readonly getJSON: () => RichTextDocument;

  /**
   * Retrieves plain text representation.
   */
  readonly getPlainText: () => string;

  /**
   * Focuses the editor input.
   */
  readonly focus: () => void;

  /**
   * Blurs the editor input.
   */
  readonly blur: () => void;
}

/**
 * Options for initializing the useIRichText hook.
 */
export interface UseIRichTextOptions {
  /**
   * Initial or controlled rich-text AST content (or plain text string fallback).
   */
  readonly content?: RichTextDocument | string;

  /**
   * Whether the editor is in interactive editing mode.
   */
  readonly editable?: boolean;

  /**
   * Placeholder text shown when editor is empty.
   */
  readonly placeholder?: string;

  /**
   * Callback fired when document content changes.
   */
  readonly onChange?: (doc: RichTextDocument) => void;

  /**
   * Callback fired when editor gains focus.
   */
  readonly onFocus?: () => void;

  /**
   * Callback fired when editor loses focus.
   */
  readonly onBlur?: () => void;

  /**
   * Whether to automatically focus editor upon mount.
   */
  readonly autoFocus?: boolean;
}

/**
 * Props for the interactive <IRichTextEditor /> component.
 */
export interface IRichTextEditorProps {
  /**
   * Rich-text content AST or plain text string.
   */
  readonly content?: RichTextDocument | string;

  /**
   * Callback fired upon content changes.
   */
  readonly onChange?: (doc: RichTextDocument) => void;

  /**
   * Whether the editor is editable.
   */
  readonly editable?: boolean;

  /**
   * Placeholder text shown when empty.
   */
  readonly placeholder?: string;

  /**
   * Whether to display the floating contextual formatting toolbar.
   */
  readonly showFloatingToolbar?: boolean;

  /**
   * Whether to display the static top formatting toolbar.
   */
  readonly showToolbar?: boolean;

  /**
   * Custom toolbar render prop.
   */
  readonly renderToolbar?: (controller: IRichTextController) => ReactNode;

  /**
   * Optional custom CSS class name.
   */
  readonly className?: string;

  /**
   * Optional custom CSS styles.
   */
  readonly style?: CSSProperties;

  /**
   * Blur event handler.
   */
  readonly onBlur?: () => void;

  /**
   * Focus event handler.
   */
  readonly onFocus?: () => void;

  /**
   * Whether to auto-focus editor.
   */
  readonly autoFocus?: boolean;
}

/**
 * Props for the lightweight, server-side compatible <IRichTextRenderer /> component.
 */
export interface IRichTextRendererProps {
  /**
   * Rich-text document AST to render as React elements.
   */
  readonly content?: RichTextDocument | string | null;

  /**
   * Optional CSS class name.
   */
  readonly className?: string;

  /**
   * Optional CSS inline styles.
   */
  readonly style?: CSSProperties;
}
