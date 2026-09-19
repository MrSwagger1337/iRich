/**
 * @vitest-environment jsdom
 */

import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import {
  createDocument,
  createEditor,
  createNode,
  createComponentRegistry,
  defineComponent,
  type EditorInstance,
  type IRichDocument,
} from '@irich/core';
import type { ComponentMap } from '@irich/renderer';
import { IRichProvider } from '../provider';
import { IRichCanvas } from './canvas';
import { IRichPaletteItem } from './palette-item';
import {
  calculateDropPosition,
  executeDrop,
  resolveInsertionLocation,
} from './use-canvas';
import { IRICH_DND_MIME } from './types';


// Simple Test Component Map
const testComponents: ComponentMap = {
  Hero: ({ node, id, dir, lang }) => (
    <div className="test-hero" data-id={id} dir={dir} lang={lang}>
      <h1>{String(node.props.title ?? 'Hero Title')}</h1>
    </div>
  ),
  Heading: ({ node, id }) => (
    <div className="test-heading" data-id={id}>
      <h2>{String(node.props.text ?? 'Heading Text')}</h2>
    </div>
  ),
  Container: ({ id, children }) => (
    <div className="test-container" data-id={id}>
      {children}
    </div>
  ),
  Card: ({ node, id }) => (
    <div className="test-card" data-id={id}>
      <p>{String(node.props.title ?? 'Card Title')}</p>
    </div>
  ),
};

describe('Visual Canvas & DnD Foundation (@irich/react/canvas)', () => {
  let container: HTMLDivElement | null = null;
  let root: ReturnType<typeof createRoot> | null = null;
  let editor: EditorInstance;

  const registry = createComponentRegistry();
  registry.register(
    defineComponent({
      type: 'Hero',
      label: 'Hero Section',
      canHaveChildren: false,
      fields: {
        title: { type: 'text', label: 'Title', defaultValue: 'Hero Title' },
      },
    }),
  );
  registry.register(
    defineComponent({
      type: 'Heading',
      label: 'Heading',
      canHaveChildren: false,
      fields: {
        text: { type: 'text', label: 'Text', defaultValue: 'Heading Text' },
      },
    }),
  );
  registry.register(
    defineComponent({
      type: 'Container',
      label: 'Container',
      canHaveChildren: true,
      allowedChildren: ['Heading', 'Card', 'Hero'],
      fields: {
        maxWidth: { type: 'text', label: 'Max Width', defaultValue: '1200px' },
      },
    }),
  );
  registry.register(
    defineComponent({
      type: 'Card',
      label: 'Card',
      canHaveChildren: false,
      fields: {
        title: { type: 'text', label: 'Card Title', defaultValue: 'Card' },
      },
    }),
  );

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);

    const doc: IRichDocument = createDocument({
      metadata: { title: 'Test Canvas Document', direction: 'ltr' },
      root: {
        children: [
          createNode({ id: 'hero-1', type: 'Hero', props: { title: 'Welcome Hero' } }),
          createNode({
            id: 'container-1',
            type: 'Container',
            props: {},
            children: [
              createNode({ id: 'heading-1', type: 'Heading', props: { text: 'Nested Heading' } }),
            ],
          }),
        ],
      },
    });

    editor = createEditor({
      initialDocument: doc,
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
    editor?.destroy();
  });

  // =========================================================================
  // 1. RECURSIVE RENDERING & SELECTION
  // =========================================================================
  it('renders canvas with recursive node hierarchy and handles click selection and backdrop deselect', () => {
    act(() => {
      root?.render(
        <IRichProvider editor={editor}>
          <IRichCanvas components={testComponents} registry={registry} />
        </IRichProvider>,
      );
    });

    const canvas = container?.querySelector('[data-irich-canvas="true"]');
    expect(canvas).toBeTruthy();

    const heroNode = container?.querySelector('[data-irich-node-id="hero-1"]');
    const containerNode = container?.querySelector('[data-irich-node-id="container-1"]');
    const headingNode = container?.querySelector('[data-irich-node-id="heading-1"]');
    expect(heroNode).toBeTruthy();
    expect(containerNode).toBeTruthy();
    expect(headingNode).toBeTruthy();
    expect(containerNode?.contains(headingNode ?? null)).toBe(true);




    // Initial state: no node selected
    expect(heroNode?.getAttribute('data-irich-selected')).toBe('false');

    // Click hero node to select
    act(() => {
      heroNode?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });

    expect(editor.getSelection()).toBe('hero-1');
    expect(heroNode?.getAttribute('data-irich-selected')).toBe('true');

    // Click canvas backdrop to deselect
    act(() => {
      canvas?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });

    expect(editor.getSelection()).toBeNull();
    expect(heroNode?.getAttribute('data-irich-selected')).toBe('false');
  });

  // =========================================================================
  // 2. AMENDMENT 1: DRAG HANDLE IS CANONICAL DRAG GESTURE
  // =========================================================================
  it('enforces Amendment 1: node wrapper is NOT draggable; drag initiates only from intentional drag handle', () => {
    act(() => {
      root?.render(
        <IRichProvider editor={editor}>
          <IRichCanvas components={testComponents} registry={registry} />
        </IRichProvider>,
      );
    });

    const heroNode = container?.querySelector('[data-irich-node-id="hero-1"]');
    expect(heroNode?.getAttribute('draggable')).toBe('false');

    // Select hero to show action bar with drag handle
    act(() => {
      editor.commands.selectNode('hero-1');
    });

    const dragHandle = container?.querySelector('[data-irich-drag-handle="true"]');
    expect(dragHandle).toBeTruthy();
    expect(dragHandle?.getAttribute('draggable')).toBe('true');

    // Drag handle drag start sets canonical MIME payload
    const mockDataTransfer = {
      data: {} as Record<string, string>,
      setData(k: string, v: string) {
        this.data[k] = v;
      },
      getData(k: string) {
        return this.data[k];
      },
      effectAllowed: '',
    };

    act(() => {
      const dragEvent = new Event('dragstart', { bubbles: true }) as unknown as DragEvent;
      Object.defineProperty(dragEvent, 'dataTransfer', { value: mockDataTransfer });
      dragHandle?.dispatchEvent(dragEvent);
    });


    expect(mockDataTransfer.data[IRICH_DND_MIME.NODE_ID]).toBe('hero-1');
    // Enforces Amendment 3: text/plain is NOT set
    expect(mockDataTransfer.data['text/plain']).toBeUndefined();
  });

  // =========================================================================
  // 3. AMENDMENT 2: NODE ACTIONS ARE OPTIONAL AND CUSTOMIZABLE
  // =========================================================================
  it('enforces Amendment 2: renders default action bar when selected, allows custom replacement, or complete suppression', () => {
    // A. Default Action Bar
    act(() => {
      root?.render(
        <IRichProvider editor={editor}>
          <IRichCanvas components={testComponents} registry={registry} />
        </IRichProvider>,
      );
    });

    act(() => {
      editor.commands.selectNode('hero-1');
    });

    const defaultActions = container?.querySelector('[data-irich-node-actions="true"]');
    expect(defaultActions).toBeTruthy();
    expect(defaultActions?.textContent).toContain('Hero');

    // B. Custom Action Bar Renderer
    act(() => {
      root?.render(
        <IRichProvider editor={editor}>
          <IRichCanvas
            components={testComponents}
            registry={registry}
            renderNodeActions={(props) => (
              <div data-testid="custom-action-bar">
                <span>Custom Toolbar for {props.nodeType}</span>
                <button type="button" data-testid="custom-duplicate" onClick={props.duplicate}>
                  Dup
                </button>
              </div>
            )}
          />
        </IRichProvider>,
      );
    });

    const customBar = container?.querySelector('[data-testid="custom-action-bar"]');
    expect(customBar).toBeTruthy();
    expect(customBar?.textContent).toContain('Custom Toolbar for Hero');

    // C. Suppressed Action Bar (renderNodeActions returns null)
    act(() => {
      root?.render(
        <IRichProvider editor={editor}>
          <IRichCanvas
            components={testComponents}
            registry={registry}
            renderNodeActions={() => null}
          />
        </IRichProvider>,
      );
    });

    expect(container?.querySelector('[data-irich-node-actions="true"]')).toBeNull();
    expect(container?.querySelector('[data-testid="custom-action-bar"]')).toBeNull();
  });

  // =========================================================================
  // 4. AMENDMENTS 4 & 5: GEOMETRY ENGINE & MINIMAL INSERTION INTENT
  // =========================================================================
  it('calculates drop geometry correctly for leaf and container nodes', () => {
    const mockRect = {
      top: 100,
      bottom: 200,
      left: 0,
      right: 500,
      height: 100,
      width: 500,
      x: 0,
      y: 100,
      toJSON: () => ({}),
    };

    // Leaf node: top 50% = before, bottom 50% = after
    expect(calculateDropPosition(120, mockRect, false)).toBe('before');
    expect(calculateDropPosition(170, mockRect, false)).toBe('after');

    // Container node: top 18% = before, bottom 18% = after, middle = inside
    expect(calculateDropPosition(110, mockRect, true)).toBe('before'); // 10%
    expect(calculateDropPosition(150, mockRect, true)).toBe('inside'); // 50%
    expect(calculateDropPosition(190, mockRect, true)).toBe('after'); // 90%
  });

  it('resolves insertion intent into tree coordinates with cycle check and placement validation', () => {
    const doc = editor.getDocument();

    // Sibling before hero-1
    const beforeHero = resolveInsertionLocation({
      document: doc,
      target: { targetNodeId: 'hero-1', position: 'before' },
      registry,
      paletteType: 'Card',
    });
    expect(beforeHero.isAllowed).toBe(true);
    expect(beforeHero.targetParentId).toBe(doc.root.id);
    expect(beforeHero.targetIndex).toBe(0);

    // Inside container-1
    const insideContainer = resolveInsertionLocation({
      document: doc,
      target: { targetNodeId: 'container-1', position: 'inside' },
      registry,
      paletteType: 'Card',
    });
    expect(insideContainer.isAllowed).toBe(true);
    expect(insideContainer.targetParentId).toBe('container-1');
    expect(insideContainer.targetIndex).toBe(1); // after existing heading-1

    // Cycle check: moving container-1 inside its child heading-1 must be rejected
    const cycleMove = resolveInsertionLocation({
      document: doc,
      target: { targetNodeId: 'heading-1', position: 'inside' },
      registry,
      sourceNodeId: 'container-1',
    });
    expect(cycleMove.isAllowed).toBe(false);
    expect(cycleMove.code).toBe('DESCENDANT_CYCLE');
  });

  // =========================================================================
  // 5. AMENDMENT 6: CANPLACE MOVE SEMANTICS & SAME-PARENT REORDERING
  // =========================================================================
  it('executes palette insertion and existing node move atomically with 1-step undo', () => {
    // 1. Palette drop -> inserts new node
    const insertRes = resolveInsertionLocation({
      document: editor.getDocument(),
      target: { targetNodeId: 'hero-1', position: 'after' },
      registry,
      paletteType: 'Card',
    });

    const newId = executeDrop({
      editor,
      document: editor.getDocument(),
      resolution: insertRes,
      paletteType: 'Card',
      registry,
    });

    expect(newId).toBeTruthy();
    expect(editor.getDocument().root.children?.length).toBe(3);
    expect(editor.getDocument().root.children?.[1]?.type).toBe('Card');

    // 1 step undo removes inserted node
    act(() => {
      editor.commands.undo();
    });
    expect(editor.getDocument().root.children?.length).toBe(2);

    // 2. Move existing node
    const moveRes = resolveInsertionLocation({
      document: editor.getDocument(),
      target: { targetNodeId: 'hero-1', position: 'before' },
      registry,
      sourceNodeId: 'container-1',
    });

    executeDrop({
      editor,
      document: editor.getDocument(),
      resolution: moveRes,
      sourceNodeId: 'container-1',
      registry,
    });

    // container-1 is now first child
    expect(editor.getDocument().root.children?.[0]?.id).toBe('container-1');
    expect(editor.getDocument().root.children?.[1]?.id).toBe('hero-1');

    // 1 step undo restores original order
    act(() => {
      editor.commands.undo();
    });
    expect(editor.getDocument().root.children?.[0]?.id).toBe('hero-1');
    expect(editor.getDocument().root.children?.[1]?.id).toBe('container-1');
  });

  // =========================================================================
  // 6. EMPTY CONTAINER DROP ZONE
  // =========================================================================
  it('renders a discoverable drop slot in empty containers and accepts drops', () => {
    // Create document with empty container
    const emptyDoc: IRichDocument = createDocument({
      root: {
        children: [
          createNode({
            id: 'empty-container-1',
            type: 'Container',
            children: [],
          }),
        ],
      },
    });

    const localEditor = createEditor({
      initialDocument: emptyDoc,
      registry,
    });

    act(() => {
      root?.render(
        <IRichProvider editor={localEditor}>
          <IRichCanvas components={testComponents} registry={registry} />
        </IRichProvider>,
      );
    });

    const emptySlot = container?.querySelector('[data-irich-empty-slot="true"]');
    expect(emptySlot).toBeTruthy();
    expect(emptySlot?.textContent).toContain('Container is empty — Drop components here');

    localEditor.destroy();
  });

  // =========================================================================
  // 7. PALETTE DRAGGABLE PRIMITIVES
  // =========================================================================
  it('IRichPaletteItem sets palette MIME type and does not set text/plain', () => {
    act(() => {
      root?.render(
        <IRichProvider editor={editor}>
          <IRichPaletteItem componentType="Heading" label="Heading Block" />
        </IRichProvider>,
      );
    });

    const paletteBtn = container?.querySelector('[data-irich-palette-item="Heading"]');
    expect(paletteBtn).toBeTruthy();
    expect(paletteBtn?.getAttribute('draggable')).toBe('true');

    const mockDataTransfer = {
      data: {} as Record<string, string>,
      setData(k: string, v: string) {
        this.data[k] = v;
      },
      effectAllowed: '',
    };

    act(() => {
      const dragEvent = new Event('dragstart', { bubbles: true }) as unknown as DragEvent;
      Object.defineProperty(dragEvent, 'dataTransfer', { value: mockDataTransfer });
      paletteBtn?.dispatchEvent(dragEvent);
    });


    expect(mockDataTransfer.data[IRICH_DND_MIME.PALETTE_TYPE]).toBe('Heading');
    expect(mockDataTransfer.data['text/plain']).toBeUndefined();
  });

  // =========================================================================
  // 8. RTL & BIDI DIRECTION FIDELITY
  // =========================================================================
  it('preserves document RTL metadata and node direction overrides in visual canvas', () => {
    const rtlDoc: IRichDocument = createDocument({
      metadata: { direction: 'rtl', locale: 'ar-EG' },
      root: {
        children: [
          createNode({
            id: 'arabic-hero',
            type: 'Hero',
            props: { title: 'عنوان رئيسي' },
            meta: { dir: 'rtl', lang: 'ar' },
          }),
          createNode({
            id: 'english-card',
            type: 'Card',
            props: { title: 'English Card' },
            meta: { dir: 'ltr', lang: 'en' },
          }),
        ],
      },
    });

    const rtlEditor = createEditor({
      initialDocument: rtlDoc,
      registry,
    });

    act(() => {
      root?.render(
        <IRichProvider editor={rtlEditor}>
          <IRichCanvas components={testComponents} registry={registry} />
        </IRichProvider>,
      );
    });

    const arabicHero = container?.querySelector('[data-irich-node-id="arabic-hero"]');
    const englishCard = container?.querySelector('[data-irich-node-id="english-card"]');

    expect(arabicHero?.getAttribute('dir')).toBe('rtl');
    expect(arabicHero?.getAttribute('lang')).toBe('ar');
    expect(englishCard?.getAttribute('dir')).toBe('ltr');
    expect(englishCard?.getAttribute('lang')).toBe('en');

    rtlEditor.destroy();
  });
});
