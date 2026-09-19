/**
 * @vitest-environment jsdom
 */

import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  createDocument,
  createEditor,
  createNode,
  defineComponent,
  createComponentRegistry,
  type EditorInstance,
  type IRichDocument,
} from '@irich/core';
import { IRichProvider } from '../provider';
import { IRichDocumentJsonStudio, IRichDocumentJsonModal } from './json-studio';

describe('Document JSON Studio (<IRichDocumentJsonStudio />)', () => {
  let container: HTMLDivElement | null = null;
  let root: ReturnType<typeof createRoot> | null = null;
  let editor: EditorInstance;

  const registry = createComponentRegistry();
  registry.register(
    defineComponent({
      type: 'Hero',
      label: 'Hero Section',
      fields: {
        title: { type: 'text', defaultValue: 'Hero Title' },
      },
    }),
  );
  registry.register(
    defineComponent({
      type: 'Paragraph',
      label: 'Paragraph',
      fields: {
        content: { type: 'text', defaultValue: '' },
      },
    }),
  );

  const initialDoc: IRichDocument = createDocument({
    metadata: { title: 'Initial Doc', locale: 'en', direction: 'ltr' },
    root: {
      children: [
        createNode({ type: 'Hero', id: 'hero-1', props: { title: 'Original Headline' } }),
      ],
    },
  });

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);

    editor = createEditor({
      initialDocument: initialDoc,
      registry,
    });
  });

  afterEach(() => {
    if (root && container) {
      act(() => {
        root?.unmount();
      });
      container.remove();
    }
    container = null;
    root = null;
    editor.destroy();
    vi.restoreAllMocks();
  });

  it('renders with formatted canonical JSON populated in textarea and live snapshot status', () => {
    act(() => {
      root?.render(
        <IRichProvider editor={editor}>
          <IRichDocumentJsonStudio />
        </IRichProvider>,
      );
    });

    const textarea = container?.querySelector('textarea') as HTMLTextAreaElement;
    expect(textarea).toBeTruthy();
    expect(textarea.value).toContain('"Original Headline"');
    expect(textarea.value).toContain('"Hero"');
    expect(textarea.getAttribute('dir')).toBe('ltr');

    const statusBadge = container?.querySelector('[data-testid="irich-json-studio-status"]');
    expect(statusBadge?.textContent).toContain('Live Canonical Snapshot');
  });

  it('editing textarea changes status to Draft Modified and keeps Apply disabled until validated', () => {
    act(() => {
      root?.render(
        <IRichProvider editor={editor}>
          <IRichDocumentJsonStudio />
        </IRichProvider>,
      );
    });

    const textarea = container?.querySelector('textarea') as HTMLTextAreaElement;
    const applyBtn = container?.querySelector('[data-testid="irich-json-apply-btn"]') as HTMLButtonElement;

    expect(applyBtn.disabled).toBe(true);

    // Edit textarea
    act(() => {
      const modified = textarea.value.replace('Original Headline', 'Edited Headline');
      const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
        window.HTMLTextAreaElement.prototype,
        'value',
      )?.set;
      nativeInputValueSetter?.call(textarea, modified);
      textarea.dispatchEvent(new Event('input', { bubbles: true }));
      textarea.dispatchEvent(new Event('change', { bubbles: true }));
    });


    const statusBadge = container?.querySelector('[data-testid="irich-json-studio-status"]');
    expect(statusBadge?.textContent).toContain('Draft Modified');
    expect(applyBtn.disabled).toBe(true);
  });

  it('formats syntactically valid JSON with standard indentation without falsely marking document valid', () => {
    act(() => {
      root?.render(
        <IRichProvider editor={editor}>
          <IRichDocumentJsonStudio />
        </IRichProvider>,
      );
    });

    const textarea = container?.querySelector('textarea') as HTMLTextAreaElement;
    const formatBtn = Array.from(container?.querySelectorAll('button') || []).find((b) =>
      b.textContent?.includes('Format'),
    );

    // Enter minified arbitrary JSON (not necessarily valid iRich doc)
    act(() => {
      const nativeSetter = Object.getOwnPropertyDescriptor(
        window.HTMLTextAreaElement.prototype,
        'value',
      )?.set;
      nativeSetter?.call(textarea, '{"hello":"world","count":10}');
      textarea.dispatchEvent(new Event('change', { bubbles: true }));
    });

    act(() => {
      formatBtn?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });

    expect(textarea.value).toContain('{\n  "hello": "world",\n  "count": 10\n}');

    // Status is dirty, NOT document valid
    const applyBtn = container?.querySelector('[data-testid="irich-json-apply-btn"]') as HTMLButtonElement;
    expect(applyBtn.disabled).toBe(true);
  });

  it('formatting malformed JSON preserves user draft and shows syntax error diagnostic', () => {
    act(() => {
      root?.render(
        <IRichProvider editor={editor}>
          <IRichDocumentJsonStudio />
        </IRichProvider>,
      );
    });

    const textarea = container?.querySelector('textarea') as HTMLTextAreaElement;
    const formatBtn = Array.from(container?.querySelectorAll('button') || []).find((b) =>
      b.textContent?.includes('Format'),
    );

    const brokenJson = '{\n  "broken": unquoted string\n}';
    act(() => {
      const nativeSetter = Object.getOwnPropertyDescriptor(
        window.HTMLTextAreaElement.prototype,
        'value',
      )?.set;
      nativeSetter?.call(textarea, brokenJson);
      textarea.dispatchEvent(new Event('change', { bubbles: true }));
    });

    act(() => {
      formatBtn?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });

    // Draft is preserved exactly
    expect(textarea.value).toBe(brokenJson);
    const feedback = container?.querySelector('[data-testid="irich-json-studio-feedback"]');
    expect(feedback?.textContent).toContain('JSON Syntax Error');
  });

  it('validating invalid document shows structured diagnostics with path, code, and message', () => {
    act(() => {
      root?.render(
        <IRichProvider editor={editor}>
          <IRichDocumentJsonStudio />
        </IRichProvider>,
      );
    });

    const textarea = container?.querySelector('textarea') as HTMLTextAreaElement;
    const validateBtn = Array.from(container?.querySelectorAll('button') || []).find((b) =>
      b.textContent?.includes('Validate'),
    );

    // Missing required fields and unregistered component
    const invalidDoc = JSON.stringify({
      version: '1.0.0',
      root: {
        id: 'root',
        type: 'root',
        props: {},
        children: [
          {
            id: 'unregistered-1',
            type: 'AlienComponent',
            props: {},
          },
        ],
      },
    });

    act(() => {
      const nativeSetter = Object.getOwnPropertyDescriptor(
        window.HTMLTextAreaElement.prototype,
        'value',
      )?.set;
      nativeSetter?.call(textarea, invalidDoc);
      textarea.dispatchEvent(new Event('change', { bubbles: true }));
    });

    act(() => {
      validateBtn?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });

    const diagnostics = container?.querySelector('[data-testid="irich-json-diagnostics"]');
    expect(diagnostics).toBeTruthy();
    expect(diagnostics?.textContent).toContain('UNKNOWN_COMPONENT');
    expect(diagnostics?.textContent).toContain('AlienComponent');
    expect(diagnostics?.textContent).toContain('root.children[0]');
  });

  it('invariant: editing after validation immediately invalidates cached validation and disables Apply', () => {
    act(() => {
      root?.render(
        <IRichProvider editor={editor}>
          <IRichDocumentJsonStudio />
        </IRichProvider>,
      );
    });

    const textarea = container?.querySelector('textarea') as HTMLTextAreaElement;
    const validateBtn = Array.from(container?.querySelectorAll('button') || []).find((b) =>
      b.textContent?.includes('Validate'),
    );
    const applyBtn = container?.querySelector('[data-testid="irich-json-apply-btn"]') as HTMLButtonElement;

    // 1. Valid doc A
    const validDocA = JSON.stringify(
      createDocument({
        root: {
          children: [createNode({ type: 'Hero', id: 'hero-A', props: { title: 'Valid Doc A' } })],
        },
      }),
    );

    act(() => {
      const nativeSetter = Object.getOwnPropertyDescriptor(
        window.HTMLTextAreaElement.prototype,
        'value',
      )?.set;
      nativeSetter?.call(textarea, validDocA);
      textarea.dispatchEvent(new Event('change', { bubbles: true }));
    });

    // 2. Validate A -> status is valid, Apply is enabled
    act(() => {
      validateBtn?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });
    expect(applyBtn.disabled).toBe(false);

    // 3. Mutate text into B
    act(() => {
      const nativeSetter = Object.getOwnPropertyDescriptor(
        window.HTMLTextAreaElement.prototype,
        'value',
      )?.set;
      nativeSetter?.call(textarea, validDocA + ' /* modified text */');
      textarea.dispatchEvent(new Event('change', { bubbles: true }));
    });

    // Invariant: Apply is immediately disabled, cached A cannot be applied
    expect(applyBtn.disabled).toBe(true);
  });

  it('validating valid document enables Apply, and applying updates live editor atomically with 1 undo step', () => {
    act(() => {
      root?.render(
        <IRichProvider editor={editor}>
          <IRichDocumentJsonStudio />
        </IRichProvider>,
      );
    });

    const textarea = container?.querySelector('textarea') as HTMLTextAreaElement;
    const validateBtn = Array.from(container?.querySelectorAll('button') || []).find((b) =>
      b.textContent?.includes('Validate'),
    );
    const applyBtn = container?.querySelector('[data-testid="irich-json-apply-btn"]') as HTMLButtonElement;

    const newDoc = createDocument({
      metadata: { title: 'Restructured Document', locale: 'ar', direction: 'rtl' },
      root: {
        children: [
          createNode({ type: 'Hero', id: 'hero-new', props: { title: 'New Hero Title' } }),
          createNode({ type: 'Paragraph', id: 'p-new', props: { content: 'Arabic paragraph' } }),
        ],
      },
    });

    act(() => {
      const nativeSetter = Object.getOwnPropertyDescriptor(
        window.HTMLTextAreaElement.prototype,
        'value',
      )?.set;
      nativeSetter?.call(textarea, JSON.stringify(newDoc));
      textarea.dispatchEvent(new Event('change', { bubbles: true }));
    });

    act(() => {
      validateBtn?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });

    expect(applyBtn.disabled).toBe(false);

    // Apply document
    act(() => {
      applyBtn.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });

    // Live editor document is updated
    expect(editor.getDocument().metadata?.title).toBe('Restructured Document');
    expect(editor.getDocument().metadata?.direction).toBe('rtl');
    expect(editor.getDocument().root.children?.length).toBe(2);

    // Status reflects applied state
    const statusBadge = container?.querySelector('[data-testid="irich-json-studio-status"]');
    expect(statusBadge?.textContent).toContain('Document Applied');

    // 1 step Undo restores original document
    act(() => {
      editor.commands.undo();
    });
    expect(editor.getDocument().metadata?.title).toBe('Initial Doc');
    expect(editor.getDocument().root.children?.[0]?.id).toBe('hero-1');

    // Redo restores new document
    act(() => {
      editor.commands.redo();
    });
    expect(editor.getDocument().metadata?.title).toBe('Restructured Document');
  });

  it('reset draft restores draft to current live document snapshot', () => {
    act(() => {
      root?.render(
        <IRichProvider editor={editor}>
          <IRichDocumentJsonStudio />
        </IRichProvider>,
      );
    });

    const textarea = container?.querySelector('textarea') as HTMLTextAreaElement;
    const resetBtn = Array.from(container?.querySelectorAll('button') || []).find((b) =>
      b.textContent?.includes('Reset Draft'),
    );

    act(() => {
      const nativeSetter = Object.getOwnPropertyDescriptor(
        window.HTMLTextAreaElement.prototype,
        'value',
      )?.set;
      nativeSetter?.call(textarea, '{"some":"random draft"}');
      textarea.dispatchEvent(new Event('change', { bubbles: true }));
    });

    expect(textarea.value).toContain('"some"');

    act(() => {
      resetBtn?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });

    expect(textarea.value).toContain('"Original Headline"');
    const statusBadge = container?.querySelector('[data-testid="irich-json-studio-status"]');
    expect(statusBadge?.textContent).toContain('Live Canonical Snapshot');
  });

  it('handles dirty-draft close confirmation protection', () => {
    const handleClose = vi.fn();

    act(() => {
      root?.render(
        <IRichProvider editor={editor}>
          <IRichDocumentJsonModal isOpen={true} onClose={handleClose} />
        </IRichProvider>,
      );
    });

    const textarea = container?.querySelector('textarea') as HTMLTextAreaElement;
    const closeBtn = container?.querySelector('.irich-json-studio-close-btn') as HTMLButtonElement;

    // 1. Clean close calls onClose immediately
    act(() => {
      closeBtn.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });
    expect(handleClose).toHaveBeenCalledTimes(1);

    // 2. Dirty close shows discard dialog
    act(() => {
      const nativeSetter = Object.getOwnPropertyDescriptor(
        window.HTMLTextAreaElement.prototype,
        'value',
      )?.set;
      nativeSetter?.call(textarea, '{"draft":"dirty"}');
      textarea.dispatchEvent(new Event('change', { bubbles: true }));
    });

    act(() => {
      closeBtn.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });

    // Confirmation dialog appears
    const discardDialog = container?.querySelector('.irich-json-discard-modal');
    expect(discardDialog).toBeTruthy();
    expect(handleClose).toHaveBeenCalledTimes(1); // not called again yet

    // Confirm discard
    const confirmBtn = container?.querySelector('[data-testid="irich-confirm-discard-btn"]') as HTMLButtonElement;
    act(() => {
      confirmBtn.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });

    expect(handleClose).toHaveBeenCalledTimes(2);
  });

  it('supports RTL UI chrome while keeping JSON textarea strictly LTR', () => {
    act(() => {
      root?.render(
        <IRichProvider editor={editor} uiDirection="rtl">
          <IRichDocumentJsonStudio />
        </IRichProvider>,
      );
    });

    const studio = container?.querySelector('[data-testid="irich-json-studio"]') as HTMLDivElement;
    const textarea = container?.querySelector('textarea') as HTMLTextAreaElement;

    expect(studio.getAttribute('dir')).toBe('rtl');
    expect(textarea.getAttribute('dir')).toBe('ltr');
  });
});
