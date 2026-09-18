/**
 * @vitest-environment jsdom
 */

import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  createDocument,
  createNode,
  createEditor,
  type EditorInstance,
} from '@irich/core';
import { IRichProvider } from '../provider';
import {
  isEditableElement,
  useIRichKeyboardShortcuts,
} from './use-keyboard-shortcuts';

// Configure React act() environment
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;

describe('isEditableElement', () => {
  it('should return true for standard form controls', () => {
    const input = document.createElement('input');
    const textarea = document.createElement('textarea');
    const select = document.createElement('select');

    expect(isEditableElement(input)).toBe(true);
    expect(isEditableElement(textarea)).toBe(true);
    expect(isEditableElement(select)).toBe(true);
  });

  it('should return true for contenteditable elements', () => {
    const div = document.createElement('div');
    div.contentEditable = 'true';
    expect(isEditableElement(div)).toBe(true);
  });

  it('should return true for elements nested inside rich-text and inspector editors', () => {
    const tiptapContainer = document.createElement('div');
    tiptapContainer.className = 'ProseMirror';
    const span = document.createElement('span');
    tiptapContainer.appendChild(span);
    document.body.appendChild(tiptapContainer);

    expect(isEditableElement(span)).toBe(true);

    const inspectorDiv = document.createElement('div');
    inspectorDiv.className = 'irich-inspector-input';
    const subSpan = document.createElement('span');
    inspectorDiv.appendChild(subSpan);
    document.body.appendChild(inspectorDiv);

    expect(isEditableElement(subSpan)).toBe(true);

    tiptapContainer.remove();
    inspectorDiv.remove();
  });

  it('should return false for regular HTML elements and null', () => {
    const div = document.createElement('div');
    const button = document.createElement('button');
    const section = document.createElement('section');

    expect(isEditableElement(null)).toBe(false);
    expect(isEditableElement(div)).toBe(false);
    expect(isEditableElement(button)).toBe(false);
    expect(isEditableElement(section)).toBe(false);
  });
});

describe('useIRichKeyboardShortcuts', () => {
  let container: HTMLDivElement | null = null;
  let root: Root | null = null;
  let editor: EditorInstance;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);

    editor = createEditor({
      initialDocument: createDocument({
        root: createNode({
          id: 'root',
          type: 'root',
          children: [
            createNode({ id: 'card-1', type: 'Card', props: { title: 'First Card' } }),
            createNode({ id: 'card-2', type: 'Card', props: { title: 'Second Card' } }),
          ],
        }),
      }),
    });
  });

  afterEach(() => {
    if (root) {
      act(() => {
        root?.unmount();
      });
      root = null;
    }
    if (container && container.parentNode) {
      container.parentNode.removeChild(container);
      container = null;
    }
  });

  function dispatchKey(
    key: string,
    modifiers: { metaKey?: boolean; ctrlKey?: boolean; shiftKey?: boolean; altKey?: boolean } = {},
    target: EventTarget = window,
  ) {
    const event = new KeyboardEvent('keydown', {
      key,
      code: `Key${key.toUpperCase()}`,
      bubbles: true,
      cancelable: true,
      ...modifiers,
    });
    target.dispatchEvent(event);
    return event;
  }

  it('should trigger copy, cut, and paste shortcuts on selected node', () => {
    const onShortcut = vi.fn();

    function TestComponent() {
      useIRichKeyboardShortcuts({ onShortcut });
      return <div>Editor Active</div>;
    }

    act(() => {
      root!.render(
        <IRichProvider editor={editor} enableKeyboardShortcuts={false}>
          <TestComponent />
        </IRichProvider>,
      );
    });

    // Select card-1
    editor.commands.selectNode('card-1');

    // 1. Copy (Cmd/Ctrl + C)
    dispatchKey('c', { ctrlKey: true });
    expect(onShortcut).toHaveBeenCalledWith('copy', expect.any(KeyboardEvent));
    expect(editor.getClipboard()?.id).toBe('card-1');
    expect(editor.canPaste()).toBe(true);

    // 2. Paste (Cmd/Ctrl + V)
    dispatchKey('v', { ctrlKey: true });
    expect(onShortcut).toHaveBeenCalledWith('paste', expect.any(KeyboardEvent));
    expect(editor.getDocument().root.children?.length).toBe(3);
    const newPastedId = editor.getSelection();
    expect(newPastedId).not.toBe('card-1');
    expect(editor.getNode(newPastedId!)?.props).toEqual({ title: 'First Card' });

    // 3. Cut (Cmd/Ctrl + X)
    editor.commands.selectNode('card-2');
    dispatchKey('x', { ctrlKey: true });
    expect(onShortcut).toHaveBeenCalledWith('cut', expect.any(KeyboardEvent));
    expect(editor.getClipboard()?.id).toBe('card-2');
    expect(editor.getNode('card-2')).toBeUndefined();
  });

  it('should duplicate selected node on Cmd/Ctrl + D', () => {
    const onShortcut = vi.fn();

    function TestComponent() {
      useIRichKeyboardShortcuts({ onShortcut });
      return <div>Editor Active</div>;
    }

    act(() => {
      root!.render(
        <IRichProvider editor={editor} enableKeyboardShortcuts={false}>
          <TestComponent />
        </IRichProvider>,
      );
    });

    editor.commands.selectNode('card-1');
    dispatchKey('d', { metaKey: true });

    expect(onShortcut).toHaveBeenCalledWith('duplicate', expect.any(KeyboardEvent));
    expect(editor.getDocument().root.children?.length).toBe(3);
    const duplicatedNodeId = editor.getSelection();
    expect(duplicatedNodeId).not.toBe('card-1');
    expect(editor.getNode(duplicatedNodeId!)?.type).toBe('Card');
  });

  it('should delete selected node on Delete or Backspace', () => {
    const onShortcut = vi.fn();

    function TestComponent() {
      useIRichKeyboardShortcuts({ onShortcut });
      return <div>Editor Active</div>;
    }

    act(() => {
      root!.render(
        <IRichProvider editor={editor} enableKeyboardShortcuts={false}>
          <TestComponent />
        </IRichProvider>,
      );
    });

    editor.commands.selectNode('card-1');
    dispatchKey('Delete');

    expect(onShortcut).toHaveBeenCalledWith('delete', expect.any(KeyboardEvent));
    expect(editor.getNode('card-1')).toBeUndefined();
    expect(editor.getDocument().root.children?.length).toBe(1);

    editor.commands.selectNode('card-2');
    dispatchKey('Backspace');

    expect(onShortcut).toHaveBeenCalledWith('delete', expect.any(KeyboardEvent));
    expect(editor.getNode('card-2')).toBeUndefined();
    expect(editor.getDocument().root.children?.length).toBe(0);
  });

  it('should undo and redo using Cmd/Ctrl+Z and Cmd/Ctrl+Shift+Z / Ctrl+Y', () => {
    const onShortcut = vi.fn();

    function TestComponent() {
      useIRichKeyboardShortcuts({ onShortcut });
      return <div>Editor Active</div>;
    }

    act(() => {
      root!.render(
        <IRichProvider editor={editor} enableKeyboardShortcuts={false}>
          <TestComponent />
        </IRichProvider>,
      );
    });

    // Remove node
    editor.commands.removeNode('card-2');
    expect(editor.getNode('card-2')).toBeUndefined();
    expect(editor.canUndo()).toBe(true);

    // Undo (Cmd/Ctrl + Z)
    dispatchKey('z', { ctrlKey: true });
    expect(onShortcut).toHaveBeenCalledWith('undo', expect.any(KeyboardEvent));
    expect(editor.getNode('card-2')).toBeDefined();
    expect(editor.canRedo()).toBe(true);

    // Redo (Cmd/Ctrl + Shift + Z)
    dispatchKey('z', { ctrlKey: true, shiftKey: true });
    expect(onShortcut).toHaveBeenCalledWith('redo', expect.any(KeyboardEvent));
    expect(editor.getNode('card-2')).toBeUndefined();

    // Undo again, then Redo with Ctrl+Y
    dispatchKey('z', { ctrlKey: true });
    expect(editor.getNode('card-2')).toBeDefined();

    dispatchKey('y', { ctrlKey: true });
    expect(onShortcut).toHaveBeenCalledWith('redo', expect.any(KeyboardEvent));
    expect(editor.getNode('card-2')).toBeUndefined();
  });

  it('should NOT execute commands when the event target is inside an input, textarea, or contenteditable element', () => {
    const onShortcut = vi.fn();

    function TestComponent() {
      useIRichKeyboardShortcuts({ onShortcut });
      return (
        <div>
          <input data-testid="test-input" type="text" defaultValue="some text" />
          <textarea data-testid="test-textarea" defaultValue="some long text" />
          <div data-testid="test-editable" contentEditable={true}>
            Editable content
          </div>
        </div>
      );
    }

    act(() => {
      root!.render(
        <IRichProvider editor={editor} enableKeyboardShortcuts={false}>
          <TestComponent />
        </IRichProvider>,
      );
    });

    const input = container!.querySelector('input')!;
    const textarea = container!.querySelector('textarea')!;
    const editable = container!.querySelector('[contenteditable="true"]')!;

    editor.commands.selectNode('card-1');

    // Attempt Delete inside input
    const delEvent = new KeyboardEvent('keydown', { key: 'Delete', bubbles: true, cancelable: true });
    input.dispatchEvent(delEvent);
    expect(onShortcut).not.toHaveBeenCalled();
    expect(editor.getNode('card-1')).toBeDefined();

    // Attempt Cmd+C inside textarea
    const copyEvent = new KeyboardEvent('keydown', { key: 'c', ctrlKey: true, bubbles: true, cancelable: true });
    textarea.dispatchEvent(copyEvent);
    expect(onShortcut).not.toHaveBeenCalled();
    expect(editor.getClipboard()).toBeNull();

    // Attempt Cmd+Z inside contenteditable
    const undoEvent = new KeyboardEvent('keydown', { key: 'z', ctrlKey: true, bubbles: true, cancelable: true });
    editable.dispatchEvent(undoEvent);
    expect(onShortcut).not.toHaveBeenCalled();
  });

  it('should NOT perform destructive/clipboard actions on the root node', () => {
    const onShortcut = vi.fn();

    function TestComponent() {
      useIRichKeyboardShortcuts({ onShortcut });
      return <div>Editor Active</div>;
    }

    act(() => {
      root!.render(
        <IRichProvider editor={editor} enableKeyboardShortcuts={false}>
          <TestComponent />
        </IRichProvider>,
      );
    });

    // Select root
    editor.commands.selectNode('root');

    // Attempt Copy
    dispatchKey('c', { ctrlKey: true });
    expect(editor.getClipboard()).toBeNull();

    // Attempt Cut
    dispatchKey('x', { ctrlKey: true });
    expect(editor.getNode('root')).toBeDefined();

    // Attempt Delete
    dispatchKey('Delete');
    expect(editor.getNode('root')).toBeDefined();

    // Attempt Duplicate
    dispatchKey('d', { ctrlKey: true });
    expect(editor.getDocument().root.children?.length).toBe(2);
  });
});
