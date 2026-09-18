/**
 * @irich/react
 * Global and contextual keyboard shortcuts for editor productivity.
 * Maps Cmd/Ctrl+C, Cmd/Ctrl+X, Cmd/Ctrl+V, Cmd/Ctrl+D, Delete/Backspace, Cmd/Ctrl+Z, Cmd/Ctrl+Shift+Z.
 */

import { useEffect, useRef } from 'react';
import { useIRichEditor } from '../hooks';

/**
 * Checks whether an event target is an active text input or contenteditable element,
 * guaranteeing editor keyboard shortcuts do NOT interfere with standard text editing.
 */
export function isEditableElement(target: EventTarget | null): boolean {
  if (!target || typeof (target as HTMLElement).tagName !== 'string') {
    return false;
  }

  const el = target as HTMLElement;
  const tagName = el.tagName.toUpperCase();

  if (tagName === 'INPUT' || tagName === 'TEXTAREA' || tagName === 'SELECT') {
    return true;
  }

  if (
    el.isContentEditable ||
    el.contentEditable === 'true' ||
    el.getAttribute?.('contenteditable') === 'true' ||
    el.getAttribute?.('contenteditable') === ''
  ) {
    return true;
  }

  if (
    typeof el.closest === 'function' &&
    el.closest(
      '[contenteditable="true"], [contenteditable=""], .ProseMirror, [data-tiptap-editor], .irich-richtext-editor-active, .irich-inspector-input, .irich-inspector-textarea, .irich-inspector-select',
    )
  ) {
    return true;
  }

  return false;
}

/**
 * Options for configuring keyboard shortcut listening.
 */
export interface UseIRichKeyboardShortcutsOptions {
  /**
   * Whether keyboard shortcut handling is enabled (default: true).
   */
  enabled?: boolean;

  /**
   * Target event listener source (defaults to global window in browser environments).
   */
  target?: EventTarget | null;

  /**
   * Optional callback when an editor shortcut is recognized and executed.
   */
  onShortcut?: (shortcut: string, event: KeyboardEvent) => void;
}

/**
 * React hook that binds productivity keyboard shortcuts to the active iRich editor instance.
 *
 * Supported Shortcuts:
 * - `Cmd/Ctrl + C`: Copy selected node to internal clipboard buffer
 * - `Cmd/Ctrl + X`: Cut selected node
 * - `Cmd/Ctrl + V`: Paste node from clipboard buffer
 * - `Cmd/Ctrl + D`: Duplicate selected node
 * - `Delete` / `Backspace`: Remove selected node
 * - `Cmd/Ctrl + Z`: Undo last transaction
 * - `Cmd/Ctrl + Shift + Z` / `Ctrl + Y`: Redo transaction
 */
export function useIRichKeyboardShortcuts(
  options: UseIRichKeyboardShortcutsOptions = {},
): void {
  const { enabled = true, target, onShortcut } = options;
  const editor = useIRichEditor();

  const onShortcutRef = useRef(onShortcut);
  onShortcutRef.current = onShortcut;

  useEffect(() => {
    if (!enabled) {
      return;
    }

    const eventTarget: EventTarget | null =
      target !== undefined
        ? target
        : typeof window !== 'undefined'
          ? window
          : null;

    if (!eventTarget || typeof eventTarget.addEventListener !== 'function') {
      return;
    }

    const handleKeyDown = (e: Event) => {
      const keyEvent = e as KeyboardEvent;

      // 1. NEVER interfere with text typing inside inputs, textareas, or rich-text editors
      if (isEditableElement(keyEvent.target)) {
        return;
      }

      const isMod = keyEvent.metaKey || keyEvent.ctrlKey;
      const key = keyEvent.key.toLowerCase();
      const selection = editor.getSelection();
      const isRootSelected = selection === editor.getDocument().root.id;

      // Cmd/Ctrl + C: Copy
      if (isMod && !keyEvent.shiftKey && !keyEvent.altKey && key === 'c') {
        if (selection && !isRootSelected) {
          keyEvent.preventDefault();
          editor.commands.copyNode();
          onShortcutRef.current?.('copy', keyEvent);
        }
        return;
      }

      // Cmd/Ctrl + X: Cut
      if (isMod && !keyEvent.shiftKey && !keyEvent.altKey && key === 'x') {
        if (selection && !isRootSelected) {
          keyEvent.preventDefault();
          editor.commands.cutNode();
          onShortcutRef.current?.('cut', keyEvent);
        }
        return;
      }

      // Cmd/Ctrl + V: Paste
      if (isMod && !keyEvent.shiftKey && !keyEvent.altKey && key === 'v') {
        if (editor.canPaste()) {
          keyEvent.preventDefault();
          editor.commands.pasteNode();
          onShortcutRef.current?.('paste', keyEvent);
        }
        return;
      }

      // Cmd/Ctrl + D: Duplicate
      if (isMod && !keyEvent.shiftKey && !keyEvent.altKey && key === 'd') {
        if (selection && !isRootSelected) {
          keyEvent.preventDefault();
          editor.commands.duplicateNode(selection);
          onShortcutRef.current?.('duplicate', keyEvent);
        }
        return;
      }

      // Delete / Backspace: Remove selected node
      if (
        (keyEvent.key === 'Delete' || keyEvent.key === 'Backspace') &&
        !isMod &&
        !keyEvent.altKey &&
        !keyEvent.shiftKey
      ) {
        if (selection && !isRootSelected) {
          keyEvent.preventDefault();
          editor.commands.removeNode(selection);
          onShortcutRef.current?.('delete', keyEvent);
        }
        return;
      }

      // Cmd/Ctrl + Z: Undo
      if (isMod && !keyEvent.shiftKey && !keyEvent.altKey && key === 'z') {
        if (editor.canUndo()) {
          keyEvent.preventDefault();
          editor.commands.undo();
          onShortcutRef.current?.('undo', keyEvent);
        }
        return;
      }

      // Cmd/Ctrl + Shift + Z OR Cmd/Ctrl + Y: Redo
      if (
        (isMod && keyEvent.shiftKey && !keyEvent.altKey && key === 'z') ||
        (isMod && !keyEvent.shiftKey && !keyEvent.altKey && key === 'y')
      ) {
        if (editor.canRedo()) {
          keyEvent.preventDefault();
          editor.commands.redo();
          onShortcutRef.current?.('redo', keyEvent);
        }
        return;
      }
    };

    eventTarget.addEventListener('keydown', handleKeyDown);

    return () => {
      eventTarget.removeEventListener('keydown', handleKeyDown);
    };
  }, [editor, enabled, target]);
}
