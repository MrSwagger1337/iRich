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

  // =========================================================================
  // 9. PHASE 6 NESTED COMPOSITION & COMPONENT SCAFFOLDING INITIALIZATION
  // =========================================================================
  describe('Nested Structural Scaffolding & Placement Validation', () => {
    let editorialEditor: EditorInstance;
    const editorialReg = createComponentRegistry();

    editorialReg.register(
      defineComponent({
        type: 'Column',
        label: 'Column',
        canHaveChildren: true,
        allowedParents: ['Columns'],
        fields: {},
      }),
    );
    editorialReg.register(
      defineComponent({
        type: 'Columns',
        label: 'Columns',
        canHaveChildren: true,
        allowedChildren: ['Column'],
        fields: {
          layout: { type: 'select', defaultValue: 'equal' },
        },
        createInitialState: () => ({
          children: [{ type: 'Column' }, { type: 'Column' }],
        }),
      }),
    );
    editorialReg.register(
      defineComponent({
        type: 'CardGrid',
        label: 'Card Grid',
        canHaveChildren: true,
        allowedChildren: ['Card'],
        fields: {
          columns: { type: 'number', defaultValue: 3 },
        },
      }),
    );
    editorialReg.register(
      defineComponent({
        type: 'Card',
        label: 'Card',
        canHaveChildren: true,
        allowedParents: ['CardGrid'],
        fields: {},
      }),
    );
    editorialReg.register(
      defineComponent({
        type: 'RichText',
        label: 'Rich Text',
        canHaveChildren: false,
        fields: {
          content: { type: 'custom', defaultValue: { type: 'doc', content: [] } },
        },
      }),
    );

    const editorialComponents: ComponentMap = {
      Columns: ({ id, children }) => <div className="test-columns" data-id={id}>{children}</div>,
      Column: ({ id, children }) => <div className="test-column" data-id={id}>{children}</div>,
      CardGrid: ({ id, children }) => <div className="test-card-grid" data-id={id}>{children}</div>,
      Card: ({ id, children }) => <div className="test-card" data-id={id}>{children}</div>,
      RichText: ({ id }) => <div className="test-rich-text" data-id={id}>RichText Content</div>,
    };

    beforeEach(() => {
      const doc = createDocument({
        root: { children: [] },
      });
      editorialEditor = createEditor({
        initialDocument: doc,
        registry: editorialReg,
      });
    });

    afterEach(() => {
      editorialEditor.destroy();
    });

    it('scaffolds Columns with exactly two Column children on palette drag drop', () => {
      const res = resolveInsertionLocation({
        document: editorialEditor.getDocument(),
        target: { targetNodeId: editorialEditor.getDocument().root.id, position: 'inside' },
        registry: editorialReg,
        paletteType: 'Columns',
      });
      expect(res.isAllowed).toBe(true);

      const insertedId = executeDrop({
        editor: editorialEditor,
        document: editorialEditor.getDocument(),
        resolution: res,
        paletteType: 'Columns',
        registry: editorialReg,
      });

      expect(insertedId).toBeTruthy();
      const doc = editorialEditor.getDocument();
      expect(doc.root.children?.length).toBe(1);

      const colsNode = doc.root.children![0];
      expect(colsNode.type).toBe('Columns');
      expect(colsNode.children?.length).toBe(2);

      const [col1, col2] = colsNode.children!;
      expect(col1.type).toBe('Column');
      expect(col2.type).toBe('Column');
      expect(col1.children).toEqual([]);
      expect(col2.children).toEqual([]);
      expect(col1.id).not.toBe(col2.id);
      expect(colsNode.id).not.toBe(col1.id);
    });

    it('scaffolds Columns with exactly two Column children on palette click insertion', () => {
      act(() => {
        root?.render(
          <IRichProvider editor={editorialEditor}>
            <IRichPaletteItem componentType="Columns" label="2 Columns" />
          </IRichProvider>,
        );
      });

      const btn = container?.querySelector('[data-irich-palette-item="Columns"]');
      expect(btn).toBeTruthy();

      act(() => {
        btn?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      });

      const doc = editorialEditor.getDocument();
      expect(doc.root.children?.length).toBe(1);
      const colsNode = doc.root.children![0];
      expect(colsNode.type).toBe('Columns');
      expect(colsNode.children?.length).toBe(2);
      expect(colsNode.children![0].type).toBe('Column');
      expect(colsNode.children![1].type).toBe('Column');
    });

    it('treats Columns scaffolding as one atomic history action: undo removes entire subtree, redo restores it', () => {
      const res = resolveInsertionLocation({
        document: editorialEditor.getDocument(),
        target: { targetNodeId: editorialEditor.getDocument().root.id, position: 'inside' },
        registry: editorialReg,
        paletteType: 'Columns',
      });

      executeDrop({
        editor: editorialEditor,
        document: editorialEditor.getDocument(),
        resolution: res,
        paletteType: 'Columns',
        registry: editorialReg,
      });

      expect(editorialEditor.getDocument().root.children?.length).toBe(1);

      // Single undo removes Columns and its 2 Column children
      act(() => {
        editorialEditor.commands.undo();
      });
      expect(editorialEditor.getDocument().root.children?.length).toBe(0);

      // Single redo restores entire subtree
      act(() => {
        editorialEditor.commands.redo();
      });
      const doc = editorialEditor.getDocument();
      expect(doc.root.children?.length).toBe(1);
      expect(doc.root.children![0].children?.length).toBe(2);
    });

    it('allows RichText drop into generated Column and rejects direct drop under Columns', () => {
      // 1. Scaffold Columns
      const res = resolveInsertionLocation({
        document: editorialEditor.getDocument(),
        target: { targetNodeId: editorialEditor.getDocument().root.id, position: 'inside' },
        registry: editorialReg,
        paletteType: 'Columns',
      });
      executeDrop({
        editor: editorialEditor,
        document: editorialEditor.getDocument(),
        resolution: res,
        paletteType: 'Columns',
        registry: editorialReg,
      });

      const colsNode = editorialEditor.getDocument().root.children![0];
      const col1 = colsNode.children![0];

      // 2. Drop RichText inside Column 1 -> allowed
      const richTextRes = resolveInsertionLocation({
        document: editorialEditor.getDocument(),
        target: { targetNodeId: col1.id, position: 'inside' },
        registry: editorialReg,
        paletteType: 'RichText',
      });
      expect(richTextRes.isAllowed).toBe(true);

      const richTextId = executeDrop({
        editor: editorialEditor,
        document: editorialEditor.getDocument(),
        resolution: richTextRes,
        paletteType: 'RichText',
        registry: editorialReg,
      });
      expect(richTextId).toBeTruthy();

      const updatedDoc = editorialEditor.getDocument();
      const updatedCol1 = updatedDoc.root.children![0].children![0];
      expect(updatedCol1.children?.length).toBe(1);
      expect(updatedCol1.children![0].type).toBe('RichText');

      // 3. Drop RichText directly inside Columns -> rejected by placement rules (only Column allowed)
      const invalidRes = resolveInsertionLocation({
        document: updatedDoc,
        target: { targetNodeId: colsNode.id, position: 'inside' },
        registry: editorialReg,
        paletteType: 'RichText',
      });
      expect(invalidRes.isAllowed).toBe(false);
      expect(invalidRes.code).toBe('CHILD_TYPE_NOT_ALLOWED');
    });

    it('allows moving content between generated Columns', () => {
      // Scaffold Columns
      const res = resolveInsertionLocation({
        document: editorialEditor.getDocument(),
        target: { targetNodeId: editorialEditor.getDocument().root.id, position: 'inside' },
        registry: editorialReg,
        paletteType: 'Columns',
      });
      executeDrop({
        editor: editorialEditor,
        document: editorialEditor.getDocument(),
        resolution: res,
        paletteType: 'Columns',
        registry: editorialReg,
      });

      const col1Id = editorialEditor.getDocument().root.children![0].children![0].id;
      const col2Id = editorialEditor.getDocument().root.children![0].children![1].id;

      // Insert RichText into col1
      const rtRes = resolveInsertionLocation({
        document: editorialEditor.getDocument(),
        target: { targetNodeId: col1Id, position: 'inside' },
        registry: editorialReg,
        paletteType: 'RichText',
      });
      const rtId = executeDrop({
        editor: editorialEditor,
        document: editorialEditor.getDocument(),
        resolution: rtRes,
        paletteType: 'RichText',
        registry: editorialReg,
      })!;

      // Move RichText from col1 to col2
      const moveRes = resolveInsertionLocation({
        document: editorialEditor.getDocument(),
        target: { targetNodeId: col2Id, position: 'inside' },
        registry: editorialReg,
        sourceNodeId: rtId,
      });
      expect(moveRes.isAllowed).toBe(true);

      executeDrop({
        editor: editorialEditor,
        document: editorialEditor.getDocument(),
        resolution: moveRes,
        sourceNodeId: rtId,
        registry: editorialReg,
      });

      const docAfterMove = editorialEditor.getDocument();
      const updatedCol1 = docAfterMove.root.children![0].children![0];
      const updatedCol2 = docAfterMove.root.children![0].children![1];
      expect(updatedCol1.children?.length).toBe(0);
      expect(updatedCol2.children?.length).toBe(1);
      expect(updatedCol2.children![0].id).toBe(rtId);
    });

    it('keeps CardGrid empty initially and displays singular child hint "CardGrid is empty — Drop Card here"', () => {
      // 1. Insert CardGrid
      const gridRes = resolveInsertionLocation({
        document: editorialEditor.getDocument(),
        target: { targetNodeId: editorialEditor.getDocument().root.id, position: 'inside' },
        registry: editorialReg,
        paletteType: 'CardGrid',
      });
      const gridId = executeDrop({
        editor: editorialEditor,
        document: editorialEditor.getDocument(),
        resolution: gridRes,
        paletteType: 'CardGrid',
        registry: editorialReg,
      })!;

      const gridNode = editorialEditor.getDocument().root.children![0];
      expect(gridNode.type).toBe('CardGrid');
      expect(gridNode.children?.length).toBe(0);

      // 2. Render canvas and verify empty slot message
      act(() => {
        root?.render(
          <IRichProvider editor={editorialEditor}>
            <IRichCanvas components={editorialComponents} registry={editorialReg} />
          </IRichProvider>,
        );
      });

      const emptySlot = container?.querySelector('[data-irich-empty-slot="true"]');
      expect(emptySlot).toBeTruthy();
      expect(emptySlot?.textContent).toContain('CardGrid is empty — Drop Card here');

      // 3. Drop Card into CardGrid
      const cardRes = resolveInsertionLocation({
        document: editorialEditor.getDocument(),
        target: { targetNodeId: gridId, position: 'inside' },
        registry: editorialReg,
        paletteType: 'Card',
      });
      expect(cardRes.isAllowed).toBe(true);

      const cardId = executeDrop({
        editor: editorialEditor,
        document: editorialEditor.getDocument(),
        resolution: cardRes,
        paletteType: 'Card',
        registry: editorialReg,
      })!;

      // 4. Drop RichText into Card
      const rtRes = resolveInsertionLocation({
        document: editorialEditor.getDocument(),
        target: { targetNodeId: cardId, position: 'inside' },
        registry: editorialReg,
        paletteType: 'RichText',
      });
      expect(rtRes.isAllowed).toBe(true);

      executeDrop({
        editor: editorialEditor,
        document: editorialEditor.getDocument(),
        resolution: rtRes,
        paletteType: 'RichText',
        registry: editorialReg,
      });

      const doc = editorialEditor.getDocument();
      const updatedCard = doc.root.children![0].children![0];
      expect(updatedCard.type).toBe('Card');
      expect(updatedCard.children?.length).toBe(1);
      expect(updatedCard.children![0].type).toBe('RichText');
    });
  });
});
