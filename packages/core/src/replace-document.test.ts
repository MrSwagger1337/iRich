import { describe, it, expect, vi } from 'vitest';
import {
  createDocument,
  createNode,
  createEditor,
  createComponentRegistry,
  defineComponent,
  ValidationError,
  type IRichDocument,
} from './index';

describe('replaceDocument Command (@irich/core)', () => {
  function setupRegistry() {
    const registry = createComponentRegistry();
    registry.register(
      defineComponent({
        type: 'Hero',
        label: 'Hero',
        fields: {
          title: { type: 'text', defaultValue: 'Hero Title' },
        },
      }),
    );
    registry.register(
      defineComponent({
        type: 'Quote',
        label: 'Quote',
        fields: {
          text: { type: 'text', defaultValue: 'Quote text' },
        },
      }),
    );
    registry.register(
      defineComponent({
        type: 'Callout',
        label: 'Callout',
        fields: {
          variant: {
            type: 'select',
            options: [
              { label: 'Insight', value: 'insight' },
              { label: 'Warning', value: 'warning' },
            ],
            defaultValue: 'insight',
          },
        },
      }),
    );
    return registry;
  }

  it('atomically replaces the current document with a new valid document', () => {
    const registry = setupRegistry();
    const docA = createDocument({
      metadata: { locale: 'en', direction: 'ltr', title: 'Doc A' },
      root: {
        children: [createNode({ id: 'hero-1', type: 'Hero', props: { title: 'First Hero' } })],
      },
    });

    const docB = createDocument({
      metadata: { locale: 'ar', direction: 'rtl', title: 'Doc B' },
      root: {
        children: [
          createNode({ id: 'callout-1', type: 'Callout', props: { variant: 'insight' } }),
          createNode({ id: 'quote-1', type: 'Quote', props: { text: 'Arabic quote' } }),
        ],
      },
    });

    const editor = createEditor({ initialDocument: docA, registry });
    expect(editor.getDocument().metadata?.title).toBe('Doc A');
    expect(editor.getDocument().root.children).toHaveLength(1);

    editor.commands.replaceDocument(docB);

    expect(editor.getDocument().metadata?.title).toBe('Doc B');
    expect(editor.getDocument().metadata?.direction).toBe('rtl');
    expect(editor.getDocument().root.children).toHaveLength(2);
    expect(editor.canUndo()).toBe(true);
  });

  it('restores previous document and selection in exactly ONE undo step', () => {
    const registry = setupRegistry();
    const docA = createDocument({
      metadata: { title: 'Initial English Article', locale: 'en' },
      root: {
        children: [createNode({ id: 'hero-1', type: 'Hero', props: { title: 'Original' } })],
      },
    });

    const docB = createDocument({
      metadata: { title: 'AI Restructured Arabic Article', locale: 'ar', direction: 'rtl' },
      root: {
        children: [
          createNode({ id: 'quote-1', type: 'Quote', props: { text: 'AI generated' } }),
        ],
      },
    });

    const editor = createEditor({ initialDocument: docA, registry, initialSelection: 'hero-1' });
    expect(editor.getSelection()).toBe('hero-1');

    // Execute replaceDocument
    editor.commands.replaceDocument(docB);
    expect(editor.getDocument().metadata?.title).toBe('AI Restructured Arabic Article');
    expect(editor.getSelection()).toBeNull(); // hero-1 does not exist in docB

    // Single Undo step
    const undoSuccess = editor.commands.undo();
    expect(undoSuccess).toBe(true);
    expect(editor.getDocument().metadata?.title).toBe('Initial English Article');
    expect(editor.getDocument().metadata?.locale).toBe('en');
    expect(editor.getDocument().root.children?.[0].id).toBe('hero-1');
    expect(editor.getSelection()).toBe('hero-1'); // Restored selection

    // Redo step
    const redoSuccess = editor.commands.redo();
    expect(redoSuccess).toBe(true);
    expect(editor.getDocument().metadata?.title).toBe('AI Restructured Arabic Article');
    expect(editor.getDocument().metadata?.direction).toBe('rtl');
    expect(editor.getDocument().root.children?.[0].id).toBe('quote-1');
  });

  it('clears redo branch when a new mutation is executed after undoing replaceDocument', () => {
    const registry = setupRegistry();
    const docA = createDocument({ metadata: { title: 'Doc A' } });
    const docB = createDocument({ metadata: { title: 'Doc B' } });

    const editor = createEditor({ initialDocument: docA, registry });
    editor.commands.replaceDocument(docB);
    expect(editor.canUndo()).toBe(true);
    expect(editor.canRedo()).toBe(false);

    // Undo back to docA
    editor.commands.undo();
    expect(editor.canRedo()).toBe(true);

    // Insert a new node while on docA
    editor.commands.insertNode({
      node: createNode({ id: 'hero-new', type: 'Hero', props: { title: 'New Hero' } }),
    });

    // Redo branch must be cleared
    expect(editor.canRedo()).toBe(false);
  });

  it('rejects invalid document atomically without mutating editor state or history', () => {
    const registry = setupRegistry();
    const docA = createDocument({
      metadata: { title: 'Valid Document' },
      root: {
        children: [createNode({ id: 'hero-1', type: 'Hero', props: { title: 'Valid' } })],
      },
    });

    const editor = createEditor({ initialDocument: docA, registry });
    const snapshotBefore = editor.getState();

    // Invalid document: unregistered component 'UnknownBanner' and duplicate IDs
    const invalidDoc: IRichDocument = {
      version: '1.0.0',
      root: {
        id: 'root',
        type: 'root',
        props: {},
        children: [
          createNode({ id: 'hero-1', type: 'Hero', props: { title: '1' } }),
          createNode({ id: 'hero-1', type: 'Hero', props: { title: 'Duplicate' } }), // Duplicate ID
        ],
      },
    };

    expect(() => {
      editor.commands.replaceDocument(invalidDoc);
    }).toThrow(ValidationError);

    // State remains 100% intact
    expect(editor.getDocument()).toBe(snapshotBefore.document);
    expect(editor.getState().document.metadata?.title).toBe('Valid Document');
    expect(editor.canUndo()).toBe(false);
  });

  it('emits document:replace and document:change events on successful replacement', () => {
    const registry = setupRegistry();
    const docA = createDocument({ metadata: { title: 'Doc A' } });
    const docB = createDocument({ metadata: { title: 'Doc B' } });

    const editor = createEditor({ initialDocument: docA, registry });

    const replaceSpy = vi.fn();
    const changeSpy = vi.fn();

    editor.on('document:replace', replaceSpy);
    editor.on('document:change', changeSpy);

    editor.commands.replaceDocument(docB);

    expect(replaceSpy).toHaveBeenCalledTimes(1);
    expect(replaceSpy).toHaveBeenCalledWith({
      document: docB,
      previousDocument: docA,
    });

    expect(changeSpy).toHaveBeenCalledTimes(1);
    expect(changeSpy).toHaveBeenCalledWith({
      document: docB,
      previousDocument: docA,
    });
  });

  it('preserves active selection if selected node still exists in replacement document', () => {
    const registry = setupRegistry();
    const docA = createDocument({
      root: {
        children: [
          createNode({ id: 'hero-persistent', type: 'Hero', props: { title: 'Hero' } }),
          createNode({ id: 'quote-removed', type: 'Quote', props: { text: 'Old quote' } }),
        ],
      },
    });

    const docB = createDocument({
      root: {
        children: [
          createNode({ id: 'hero-persistent', type: 'Hero', props: { title: 'Updated Hero' } }),
          createNode({ id: 'callout-new', type: 'Callout', props: { variant: 'warning' } }),
        ],
      },
    });

    const editor = createEditor({ initialDocument: docA, registry, initialSelection: 'hero-persistent' });
    expect(editor.getSelection()).toBe('hero-persistent');

    editor.commands.replaceDocument(docB);

    // hero-persistent exists in docB, so selection is preserved
    expect(editor.getSelection()).toBe('hero-persistent');
  });
});
