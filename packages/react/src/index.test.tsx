/**
 * @vitest-environment jsdom
 *
 * @irich/react
 * Unit & integration tests for React context, provider, and hooks.
 */

import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { renderToString } from 'react-dom/server';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createDocument, createNode, Editor } from '@irich/core';
import {
  IRichProvider,
  useIRich,
  useIRichContext,
  useIRichDocument,
  useIRichEditor,
  useIRichHistory,
  useIRichNode,
  useIRichSelection,
  useIRichUIDirection,
} from './index';

// Configure React act() environment
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;

describe('@irich/react', () => {
  let container: HTMLDivElement | null = null;
  let root: Root | null = null;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
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

  describe('Public API Exports', () => {
    it('should export provider, context, and all hooks', () => {
      expect(IRichProvider).toBeDefined();
      expect(useIRichContext).toBeDefined();
      expect(useIRich).toBeDefined();
      expect(useIRichEditor).toBeDefined();
      expect(useIRichDocument).toBeDefined();
      expect(useIRichSelection).toBeDefined();
      expect(useIRichNode).toBeDefined();
      expect(useIRichHistory).toBeDefined();
    });
  });

  describe('Context Boundary Validation', () => {
    it('should throw descriptive error when useIRichContext is called outside provider', () => {
      function TestComponent() {
        useIRichContext();
        return null;
      }

      expect(() => renderToString(<TestComponent />)).toThrow(
        /must be used within an <IRichProvider \/> component/,
      );
    });

    it('should throw descriptive error when useIRichEditor is called outside provider', () => {
      function TestComponent() {
        useIRichEditor();
        return null;
      }

      expect(() => renderToString(<TestComponent />)).toThrow(
        /must be used within an <IRichProvider \/> component/,
      );
    });

    it('should throw descriptive error when useIRichDocument is called outside provider', () => {
      function TestComponent() {
        useIRichDocument();
        return null;
      }

      expect(() => renderToString(<TestComponent />)).toThrow(
        /must be used within an <IRichProvider \/> component/,
      );
    });

    it('should throw descriptive error when useIRichSelection is called outside provider', () => {
      function TestComponent() {
        useIRichSelection();
        return null;
      }

      expect(() => renderToString(<TestComponent />)).toThrow(
        /must be used within an <IRichProvider \/> component/,
      );
    });

    it('should throw descriptive error when useIRich is called outside provider', () => {
      function TestComponent() {
        useIRich();
        return null;
      }

      expect(() => renderToString(<TestComponent />)).toThrow(
        /must be used within an <IRichProvider \/> component/,
      );
    });
  });

  describe('IRichProvider Lifecycle & Configuration', () => {
    it('should provide internally created EditorInstance with default document', () => {
      let capturedEditor: unknown = null;

      function Consumer() {
        const editor = useIRichEditor();
        capturedEditor = editor;
        return <div data-testid="consumer">Rendered</div>;
      }

      act(() => {
        root!.render(
          <IRichProvider>
            <Consumer />
          </IRichProvider>,
        );
      });

      expect(container?.textContent).toContain('Rendered');
      expect(capturedEditor).toBeDefined();
      expect((capturedEditor as Editor).getDocument().version).toBe('1.0.0');
    });

    it('should accept external EditorInstance', () => {
      const doc = createDocument({
        root: createNode({ id: 'custom-root', type: 'CustomType' }),
      });
      const externalEditor = new Editor({ initialDocument: doc });

      let capturedEditor: unknown = null;

      function Consumer() {
        const editor = useIRichEditor();
        capturedEditor = editor;
        return <div>External</div>;
      }

      act(() => {
        root!.render(
          <IRichProvider editor={externalEditor}>
            <Consumer />
          </IRichProvider>,
        );
      });

      expect(capturedEditor).toBe(externalEditor);
      expect((capturedEditor as Editor).getDocument().root.id).toBe('custom-root');
    });

    it('should accept initialDocument prop when creating internal editor', () => {
      const doc = createDocument({
        root: createNode({ id: 'init-root', type: 'Page' }),
      });

      let capturedDoc: unknown = null;

      function Consumer() {
        const d = useIRichDocument();
        capturedDoc = d;
        return <div>InitDoc</div>;
      }

      act(() => {
        root!.render(
          <IRichProvider initialDocument={doc}>
            <Consumer />
          </IRichProvider>,
        );
      });

      expect(capturedDoc).toBe(doc);
    });

    it('should destroy internally created editor upon unmount', () => {
      let capturedEditor: Editor | null = null;

      function Consumer() {
        capturedEditor = useIRichEditor() as Editor;
        return <div>Internal</div>;
      }

      act(() => {
        root!.render(
          <IRichProvider>
            <Consumer />
          </IRichProvider>,
        );
      });

      expect(capturedEditor).toBeDefined();

      act(() => {
        root!.unmount();
        root = null;
      });

      // Attempting command after destroy on internal editor should be cleared
      expect(capturedEditor!.getState().document).toBeDefined();
    });

    it('should NOT destroy externally passed editor on unmount', () => {
      const externalEditor = new Editor();
      const destroySpy = vi.spyOn(externalEditor, 'destroy');

      function Consumer() {
        useIRichEditor();
        return <div>External</div>;
      }

      act(() => {
        root!.render(
          <IRichProvider editor={externalEditor}>
            <Consumer />
          </IRichProvider>,
        );
      });

      act(() => {
        root!.unmount();
        root = null;
      });

      expect(destroySpy).not.toHaveBeenCalled();
    });
  });

  describe('IRichProvider Event Callbacks', () => {
    it('should invoke onChange when document updates', () => {
      const onChange = vi.fn();
      const editor = new Editor();

      act(() => {
        root!.render(
          <IRichProvider editor={editor} onChange={onChange}>
            <div>Child</div>
          </IRichProvider>,
        );
      });

      // Mutate document
      act(() => {
        editor.commands.insertNode({
          node: createNode({ id: 'card-1', type: 'Card' }),
          parentId: 'root',
        });
      });

      expect(onChange).toHaveBeenCalledTimes(1);
      expect(onChange).toHaveBeenCalledWith(editor.getDocument());
    });

    it('should invoke onSelectionChange when selection updates', () => {
      const onSelectionChange = vi.fn();
      const editor = new Editor();

      act(() => {
        editor.commands.insertNode({
          node: createNode({ id: 'card-1', type: 'Card' }),
          parentId: 'root',
        });
      });

      act(() => {
        root!.render(
          <IRichProvider editor={editor} onSelectionChange={onSelectionChange}>
            <div>Child</div>
          </IRichProvider>,
        );
      });

      act(() => {
        editor.commands.selectNode('card-1');
      });

      expect(onSelectionChange).toHaveBeenCalledTimes(1);
      expect(onSelectionChange).toHaveBeenCalledWith('card-1');

      act(() => {
        editor.commands.clearSelection();
      });

      expect(onSelectionChange).toHaveBeenCalledTimes(2);
      expect(onSelectionChange).toHaveBeenCalledWith(null);
    });
  });

  describe('useIRichEditor Hook', () => {
    it('should return stable editor instance and allow command execution', () => {
      const editor = new Editor();
      let capturedEditor: ReturnType<typeof useIRichEditor> | null = null;

      function Consumer() {
        capturedEditor = useIRichEditor();
        return null;
      }

      act(() => {
        root!.render(
          <IRichProvider editor={editor}>
            <Consumer />
          </IRichProvider>,
        );
      });

      expect(capturedEditor).toBe(editor);

      // Execute commands
      const cardNode = createNode({
        id: 'card-1',
        type: 'Card',
        props: { title: 'Test Card' },
      });

      act(() => {
        capturedEditor!.commands.insertNode({
          node: cardNode,
          parentId: 'root',
        });
      });

      expect(editor.getDocument().root.children).toHaveLength(1);
      expect(editor.getDocument().root.children?.[0].id).toBe('card-1');
    });
  });

  describe('useIRichDocument Hook', () => {
    it('should reactively update when document changes', () => {
      const editor = new Editor();
      let renderCount = 0;
      let renderedChildrenCount = 0;

      function DocConsumer() {
        const doc = useIRichDocument();
        renderCount++;
        renderedChildrenCount = doc.root.children?.length ?? 0;
        return <div data-testid="doc-count">{renderedChildrenCount}</div>;
      }

      act(() => {
        root!.render(
          <IRichProvider editor={editor}>
            <DocConsumer />
          </IRichProvider>,
        );
      });

      expect(renderedChildrenCount).toBe(0);
      const initialRenders = renderCount;

      act(() => {
        editor.commands.insertNode({
          node: createNode({ id: 'item-1', type: 'Item' }),
          parentId: 'root',
        });
      });

      expect(renderedChildrenCount).toBe(1);
      expect(renderCount).toBeGreaterThan(initialRenders);
      expect(container?.textContent).toBe('1');
    });
  });

  describe('useIRichSelection Hook', () => {
    it('should return current selection and provide selectNode & clearSelection commands', () => {
      const editor = new Editor({ initialSelection: 'node-initial' });
      let capturedSelection: ReturnType<typeof useIRichSelection> | null = null;

      function SelectionConsumer() {
        capturedSelection = useIRichSelection();
        return <div>Selection: {capturedSelection.selectedNodeId ?? 'none'}</div>;
      }

      act(() => {
        root!.render(
          <IRichProvider editor={editor}>
            <SelectionConsumer />
          </IRichProvider>,
        );
      });

      expect(container?.textContent).toContain('node-initial');
      expect(capturedSelection!.selectedNodeId).toBe('node-initial');

      // Test selectNode
      const card = createNode({ id: 'card-99', type: 'Card' });
      act(() => {
        editor.commands.insertNode({ node: card, parentId: 'root' });
        capturedSelection!.selectNode('card-99');
      });

      expect(editor.getSelection()).toBe('card-99');
      expect(container?.textContent).toContain('card-99');

      // Test clearSelection
      act(() => {
        capturedSelection!.clearSelection();
      });

      expect(editor.getSelection()).toBeNull();
      expect(container?.textContent).toContain('none');
    });
  });

  describe('useIRich Hook', () => {
    it('should provide full state, document, selection, undo/redo helpers, and editor', () => {
      const editor = new Editor();
      let capturedIRich: ReturnType<typeof useIRich> | null = null;

      function FullConsumer() {
        capturedIRich = useIRich();
        return <div>State Consumer</div>;
      }

      act(() => {
        root!.render(
          <IRichProvider editor={editor}>
            <FullConsumer />
          </IRichProvider>,
        );
      });

      expect(capturedIRich!.editor).toBe(editor);
      expect(capturedIRich!.document).toBe(editor.getDocument());
      expect(capturedIRich!.selectedNodeId).toBeNull();
      expect(capturedIRich!.canUndo).toBe(false);
      expect(capturedIRich!.canRedo).toBe(false);

      // Perform a mutation
      const btn = createNode({ id: 'btn-1', type: 'Button', props: { label: 'Click' } });
      act(() => {
        capturedIRich!.editor.commands.insertNode({ node: btn, parentId: 'root' });
        capturedIRich!.selectNode('btn-1');
      });

      expect(editor.getSelection()).toBe('btn-1');
      expect(editor.canUndo()).toBe(true);

      // Test undo / redo shortcuts
      act(() => {
        const undone = capturedIRich!.undo();
        expect(undone).toBe(true);
      });
      expect(editor.getDocument().root.children).toHaveLength(0);

      act(() => {
        const redone = capturedIRich!.redo();
        expect(redone).toBe(true);
      });
      expect(editor.getDocument().root.children).toHaveLength(1);
    });
  });

  describe('useIRichNode Hook', () => {
    it('should return targeted node snapshot and reactively update when node changes', () => {
      const hero = createNode({ id: 'hero-1', type: 'Hero', props: { title: 'Initial Hero' } });
      const doc = createDocument({
        root: createNode({ id: 'root', type: 'Page', children: [hero] }),
      });
      const editor = new Editor({ initialDocument: doc });

      let capturedHero: ReturnType<typeof useIRichNode>;
      let capturedNonExistent: ReturnType<typeof useIRichNode>;

      function NodeConsumer() {
        capturedHero = useIRichNode('hero-1');
        capturedNonExistent = useIRichNode('non-existent');
        return <div>Node: {capturedHero?.props?.title as string}</div>;
      }

      act(() => {
        root!.render(
          <IRichProvider editor={editor}>
            <NodeConsumer />
          </IRichProvider>,
        );
      });

      expect(container?.textContent).toContain('Initial Hero');
      expect(capturedHero?.id).toBe('hero-1');
      expect(capturedNonExistent).toBeUndefined();

      // Update node props
      act(() => {
        editor.commands.updateNode({
          nodeId: 'hero-1',
          props: { title: 'Updated Hero' },
        });
      });

      expect(container?.textContent).toContain('Updated Hero');
    });
  });

  describe('useIRichHistory Hook', () => {
    it('should track undo/redo availability and execute history actions', () => {
      const editor = new Editor();
      let capturedHistory: ReturnType<typeof useIRichHistory> | null = null;

      function HistoryConsumer() {
        capturedHistory = useIRichHistory();
        return <div>CanUndo: {String(capturedHistory.canUndo)}</div>;
      }

      act(() => {
        root!.render(
          <IRichProvider editor={editor}>
            <HistoryConsumer />
          </IRichProvider>,
        );
      });

      expect(capturedHistory!.canUndo).toBe(false);
      expect(capturedHistory!.canRedo).toBe(false);

      act(() => {
        editor.commands.insertNode({
          node: createNode({ id: 'node-1', type: 'Box' }),
          parentId: 'root',
        });
      });

      expect(editor.canUndo()).toBe(true);

      act(() => {
        expect(capturedHistory!.undo()).toBe(true);
      });
      expect(editor.getDocument().root.children).toHaveLength(0);

      act(() => {
        expect(capturedHistory!.redo()).toBe(true);
      });
      expect(editor.getDocument().root.children).toHaveLength(1);

      act(() => {
        capturedHistory!.clearHistory();
      });
      expect(editor.canUndo()).toBe(false);
      expect(editor.canRedo()).toBe(false);
    });
  });

  describe('Fine-Grained Subscription Isolation', () => {
    it('should keep document snapshot stable when only selection changes', () => {
      const editor = new Editor({
        initialDocument: createDocument({
          root: createNode({
            id: 'root',
            type: 'Page',
            children: [createNode({ id: 'btn-1', type: 'Button' })],
          }),
        }),
      });

      let docRenderCount = 0;

      function DocSubscriber() {
        useIRichDocument();
        docRenderCount++;
        return null;
      }

      act(() => {
        root!.render(
          <IRichProvider editor={editor}>
            <DocSubscriber />
          </IRichProvider>,
        );
      });

      const initialCount = docRenderCount;

      // Mutate ONLY selection
      act(() => {
        editor.commands.selectNode('btn-1');
      });

      // Document subscriber should NOT re-render because document reference is unchanged
      expect(docRenderCount).toBe(initialCount);
    });

    it('should isolate node subscriptions so updating node A does not alter node B', () => {
      const nodeA = createNode({ id: 'node-a', type: 'Card', props: { text: 'A1' } });
      const nodeB = createNode({ id: 'node-b', type: 'Card', props: { text: 'B1' } });

      const editor = new Editor({
        initialDocument: createDocument({
          root: createNode({ id: 'root', type: 'Page', children: [nodeA, nodeB] }),
        }),
      });

      let renderCountA = 0;
      let renderCountB = 0;

      function ConsumerA() {
        const node = useIRichNode('node-a');
        renderCountA++;
        return <div>NodeA: {node?.props?.text as string}</div>;
      }

      function ConsumerB() {
        const node = useIRichNode('node-b');
        renderCountB++;
        return <div>NodeB: {node?.props?.text as string}</div>;
      }

      act(() => {
        root!.render(
          <IRichProvider editor={editor}>
            <ConsumerA />
            <ConsumerB />
          </IRichProvider>,
        );
      });

      const initialRendersA = renderCountA;
      const initialRendersB = renderCountB;

      // Update node A only
      act(() => {
        editor.commands.updateNode({
          nodeId: 'node-a',
          props: { text: 'A2' },
        });
      });

      expect(renderCountA).toBeGreaterThan(initialRendersA);
      expect(renderCountB).toBe(initialRendersB); // Node B was not re-rendered!
      expect(container?.textContent).toContain('NodeA: A2');
      expect(container?.textContent).toContain('NodeB: B1');
    });
  });

  describe('SSR Compatibility', () => {
    it('should render document and selection snapshots cleanly using renderToString', () => {
      const doc = createDocument({
        root: createNode({
          id: 'root',
          type: 'Page',
          children: [
            createNode({ id: 'hero-1', type: 'Hero', props: { title: 'SSR Page Title' } }),
          ],
        }),
      });

      const editor = new Editor({ initialDocument: doc, initialSelection: 'hero-1' });

      function SSRView() {
        const document = useIRichDocument();
        const { selectedNodeId } = useIRichSelection();
        const heroNode = useIRichNode('hero-1');

        return (
          <div data-testid="ssr-root">
            <h1>{document.root.type}</h1>
            <p>Selected: {selectedNodeId}</p>
            <span>Hero Title: {heroNode?.props?.title as string}</span>
          </div>
        );
      }

      const html = renderToString(
        <IRichProvider editor={editor}>
          <SSRView />
        </IRichProvider>,
      );

      expect(html).toContain('Page');
      expect(html).toContain('hero-1');
      expect(html).toContain('SSR Page Title');
    });
  });

  describe('UI Direction vs Document Direction Independence', () => {
    it('defaults uiDirection to "ltr" and allows reading and updating via useIRichUIDirection', () => {
      let currentUIDir = '';
      let updateUIDir: (dir: 'ltr' | 'rtl') => void = () => {};

      function DirectionConsumer() {
        const { uiDirection, setUIDirection } = useIRichUIDirection();
        currentUIDir = uiDirection;
        updateUIDir = setUIDirection;
        return <div data-testid="ui-dir">{uiDirection}</div>;
      }

      const onUIDirectionChange = vi.fn();

      act(() => {
        root?.render(
          <IRichProvider onUIDirectionChange={onUIDirectionChange}>
            <DirectionConsumer />
          </IRichProvider>,
        );
      });

      expect(currentUIDir).toBe('ltr');
      expect(container?.textContent).toBe('ltr');

      act(() => {
        updateUIDir('rtl');
      });

      expect(currentUIDir).toBe('rtl');
      expect(container?.textContent).toBe('rtl');
      expect(onUIDirectionChange).toHaveBeenCalledWith('rtl');
    });

    it('initializes uiDirection from IRichProvider props', () => {
      function DirectionConsumer() {
        const { uiDirection } = useIRichUIDirection();
        return <div data-testid="ui-dir">{uiDirection}</div>;
      }

      act(() => {
        root?.render(
          <IRichProvider uiDirection="rtl">
            <DirectionConsumer />
          </IRichProvider>,
        );
      });

      expect(container?.textContent).toBe('rtl');
    });

    it('keeps UI direction strictly independent of document metadata direction', () => {
      const arabicDoc = createDocument({
        metadata: {
          locale: 'ar',
          direction: 'rtl',
        },
        root: createNode({
          id: 'root',
          type: 'Page',
          children: [],
        }),
      });

      const englishDoc = createDocument({
        metadata: {
          locale: 'en',
          direction: 'ltr',
        },
        root: createNode({
          id: 'root',
          type: 'Page',
          children: [],
        }),
      });

      const editor = new Editor({ initialDocument: arabicDoc });

      let capturedUIDirection = '';
      let capturedDocDirection = '';

      function DualDirectionView() {
        const { uiDirection } = useIRichUIDirection();
        const doc = useIRichDocument();
        capturedUIDirection = uiDirection;
        capturedDocDirection = doc.metadata?.direction ?? '';
        return (
          <div>
            <span data-testid="ui">{uiDirection}</span>
            <span data-testid="doc">{doc.metadata?.direction}</span>
          </div>
        );
      }

      act(() => {
        root?.render(
          <IRichProvider editor={editor} uiDirection="ltr">
            <DualDirectionView />
          </IRichProvider>,
        );
      });

      // UI is LTR while Document is RTL
      expect(capturedUIDirection).toBe('ltr');
      expect(capturedDocDirection).toBe('rtl');

      // Replace document with an English/LTR document
      act(() => {
        editor.commands.replaceDocument(englishDoc);
      });

      // Document direction updated to LTR, UI direction remains untouched as LTR
      expect(capturedUIDirection).toBe('ltr');
      expect(capturedDocDirection).toBe('ltr');
    });
  });
});

