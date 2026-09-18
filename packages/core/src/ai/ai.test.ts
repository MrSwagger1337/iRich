import { describe, expect, it } from 'vitest';
import { createComponentRegistry, defineComponent } from '../component';
import { createEditor } from '../editor';
import { createDocument, createNode } from '../utils/tree';
import { applyAIActions } from './executor';
import { containsDangerousScript, isSafeAIValue } from './security';
import type { AIAction } from './types';
import { validateAIActions } from './validator';

describe('AI Action Protocol: Security & Sandboxing', () => {
  describe('isSafeAIValue', () => {
    it('allows valid JSON primitives, arrays, and plain objects', () => {
      expect(isSafeAIValue(null).safe).toBe(true);
      expect(isSafeAIValue('hello world').safe).toBe(true);
      expect(isSafeAIValue(42).safe).toBe(true);
      expect(isSafeAIValue(true).safe).toBe(true);
      expect(isSafeAIValue([1, 'two', { three: 3 }]).safe).toBe(true);
      expect(isSafeAIValue({ nested: { key: 'value', count: 10 } }).safe).toBe(true);
    });

    it('rejects prototype pollution attempts (__proto__, constructor, prototype)', () => {
      const pollutedProto = JSON.parse('{"__proto__": {"admin": true}}');
      const res1 = isSafeAIValue(pollutedProto);
      expect(res1.safe).toBe(false);
      expect(res1.code).toBe('PROTOTYPE_POLLUTION');

      const pollutedConstructor = { constructor: { prototype: { evil: true } } };
      const res2 = isSafeAIValue(pollutedConstructor);
      expect(res2.safe).toBe(false);
      expect(res2.code).toBe('PROTOTYPE_POLLUTION');

      const pollutedPrototype = { prototype: { polluted: true } };
      const res3 = isSafeAIValue(pollutedPrototype);
      expect(res3.safe).toBe(false);
      expect(res3.code).toBe('PROTOTYPE_POLLUTION');
    });

    it('rejects functions, symbols, undefined, and non-finite numbers', () => {
      expect(isSafeAIValue(() => {}).safe).toBe(false);
      expect(isSafeAIValue({ fn: () => {} }).safe).toBe(false);
      expect(isSafeAIValue(Symbol('secret')).safe).toBe(false);
      expect(isSafeAIValue(undefined).safe).toBe(false);
      expect(isSafeAIValue(NaN).safe).toBe(false);
      expect(isSafeAIValue(Infinity).safe).toBe(false);
      expect(isSafeAIValue(-Infinity).safe).toBe(false);
    });

    it('rejects non-plain objects and class instances', () => {
      expect(isSafeAIValue(new Date()).safe).toBe(false);
      expect(isSafeAIValue(new RegExp('test')).safe).toBe(false);
      expect(isSafeAIValue(new Set()).safe).toBe(false);
      expect(isSafeAIValue(new Map()).safe).toBe(false);
    });

    it('rejects circular object references', () => {
      const circular: Record<string, unknown> = { name: 'loop' };
      circular.self = circular;
      const res = isSafeAIValue(circular);
      expect(res.safe).toBe(false);
      expect(res.code).toBe('NON_JSON_VALUE');
    });
  });

  describe('containsDangerousScript', () => {
    it('detects executable script tags and pseudo-protocols', () => {
      expect(containsDangerousScript('<script>alert("xss")</script>')).toBe(true);
      expect(containsDangerousScript('javascript:evil()')).toBe(true);
      expect(containsDangerousScript('vbscript:msgbox')).toBe(true);
      expect(containsDangerousScript('<img src="x" onerror=alert(1)>')).toBe(true);
      expect(containsDangerousScript('https://example.com/image.png')).toBe(false);
      expect(containsDangerousScript('Standard harmless paragraph content.')).toBe(false);
    });
  });
});

describe('AI Action Protocol: validateAIActions()', () => {
  const CardComponent = defineComponent({
    type: 'Card',
    label: 'Card',
    fields: {
      title: { type: 'text', label: 'Title' },
      rating: { type: 'number', label: 'Rating', min: 1, max: 5 },
      theme: {
        type: 'select',
        label: 'Theme',
        options: [
          { label: 'Light', value: 'light' },
          { label: 'Dark', value: 'dark' },
        ],
      },
    },
  });

  const LeafComponent = defineComponent({
    type: 'Leaf',
    label: 'Leaf Node',
    canHaveChildren: false,
    fields: {
      text: { type: 'text', label: 'Text' },
    },
  });

  const LayoutComponent = defineComponent({
    type: 'Layout',
    label: 'Layout',
    slots: {
      header: { label: 'Header', maxChildren: 1, allowedTypes: ['Card'] },
      main: { label: 'Main' },
    },
    fields: {},
  });

  const registry = createComponentRegistry();
  registry.register(CardComponent);
  registry.register(LeafComponent);
  registry.register(LayoutComponent);

  function createTestDocument() {
    return createDocument({
      root: {
        id: 'root',
        type: 'root',
        children: [
          createNode({ id: 'card-1', type: 'Card', props: { title: 'First Card', rating: 5, theme: 'dark' } }),
          createNode({ id: 'leaf-1', type: 'Leaf', props: { text: 'Leaf text' } }),
        ],
      },
    });
  }

  it('validates a valid insertNode action with registry prop verification', () => {
    const doc = createTestDocument();
    const result = validateAIActions({
      document: doc,
      registry,
      actions: [
        {
          action: 'insertNode',
          parentId: 'root',
          node: {
            id: 'card-2',
            type: 'Card',
            props: { title: 'New Card', rating: 4, theme: 'light' },
          },
        },
      ],
    });

    expect(result.valid).toBe(true);
    expect(result.errors.length).toBe(0);
    expect(result.actions.length).toBe(1);
    expect(result.simulatedDocument?.root.children?.length).toBe(3);
    expect(result.simulatedDocument?.root.children?.[2]?.id).toBe('card-2');
  });

  it('rejects unrecognized action names', () => {
    const doc = createTestDocument();
    const result = validateAIActions({
      document: doc,
      registry,
      actions: [
        {
          action: 'evalJavascript',
          code: 'alert(1)',
        },
      ],
    });

    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.code === 'UNRECOGNIZED_ACTION')).toBe(true);
  });

  it('rejects prototype pollution within action props', () => {
    const doc = createTestDocument();
    const result = validateAIActions({
      document: doc,
      registry,
      actions: [
        {
          action: 'updateProps',
          nodeId: 'card-1',
          props: JSON.parse('{"__proto__": {"isAdmin": true}}'),
        },
      ],
    });

    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.code === 'PROTOTYPE_POLLUTION')).toBe(true);
  });

  it('rejects unregistered component types when allowUnknownComponents is false', () => {
    const doc = createTestDocument();
    const result = validateAIActions({
      document: doc,
      registry,
      actions: [
        {
          action: 'insertNode',
          node: {
            id: 'malicious-1',
            type: 'UnregisteredCustomWidget',
            props: {},
          },
        },
      ],
    });

    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.code === 'COMPONENT_NOT_FOUND')).toBe(true);
  });

  it('rejects prop validation schema mismatches (e.g. invalid select option, number out of bounds)', () => {
    const doc = createTestDocument();
    const result = validateAIActions({
      document: doc,
      registry,
      actions: [
        {
          action: 'updateProps',
          nodeId: 'card-1',
          props: {
            rating: 10, // Max allowed is 5
            theme: 'invalid-neon-theme',
          },
        },
      ],
    });

    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.code === 'PROP_VALIDATION_FAILED')).toBe(true);
  });

  it('rejects root node deletion, move, or replacement', () => {
    const doc = createTestDocument();

    const deleteRootResult = validateAIActions({
      document: doc,
      actions: [{ action: 'removeNode', nodeId: 'root' }],
    });
    expect(deleteRootResult.valid).toBe(false);
    expect(deleteRootResult.errors.some((e) => e.code === 'ROOT_MUTATION_FORBIDDEN')).toBe(true);

    const moveRootResult = validateAIActions({
      document: doc,
      actions: [{ action: 'moveNode', nodeId: 'root', targetParentId: 'card-1' }],
    });
    expect(moveRootResult.valid).toBe(false);
    expect(moveRootResult.errors.some((e) => e.code === 'ROOT_MUTATION_FORBIDDEN')).toBe(true);
  });

  it('rejects cyclic tree moves (moving parent into child)', () => {
    const doc = createDocument({
      root: {
        id: 'root',
        type: 'root',
        children: [
          createNode({
            id: 'parent-container',
            type: 'Card',
            children: [
              createNode({ id: 'child-item', type: 'Card' }),
            ],
          }),
        ],
      },
    });

    const result = validateAIActions({
      document: doc,
      actions: [
        {
          action: 'moveNode',
          nodeId: 'parent-container',
          targetParentId: 'child-item',
        },
      ],
    });

    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.code === 'CYCLIC_MOVE_FORBIDDEN')).toBe(true);
  });

  it('rejects placement inside leaf containers (canHaveChildren === false)', () => {
    const doc = createTestDocument();
    const result = validateAIActions({
      document: doc,
      registry,
      actions: [
        {
          action: 'insertNode',
          parentId: 'leaf-1', // Leaf cannot accept children
          node: {
            id: 'nested-card',
            type: 'Card',
            props: {},
          },
        },
      ],
    });

    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.code === 'INVALID_COMPONENT_PLACEMENT')).toBe(true);
  });

  it('simulates multi-step dependent actions correctly without mutating source document', () => {
    const doc = createTestDocument();
    const originalDocSnapshot = JSON.stringify(doc);

    const actions: AIAction[] = [
      // 1. Insert Layout container
      {
        action: 'insertNode',
        parentId: 'root',
        node: { id: 'layout-1', type: 'Layout', props: {} },
      },
      // 2. Insert Card into layout header slot
      {
        action: 'insertNode',
        parentId: 'layout-1',
        slot: 'header',
        node: { id: 'card-header', type: 'Card', props: { title: 'Header Card', rating: 5, theme: 'dark' } },
      },
      // 3. Update Card props
      {
        action: 'updateProps',
        nodeId: 'card-header',
        props: { title: 'Updated Header Card' },
      },
    ];

    const result = validateAIActions({
      document: doc,
      registry,
      actions,
    });

    expect(result.valid).toBe(true);
    expect(result.actions.length).toBe(3);
    expect(result.errors.length).toBe(0);

    // Source document remains completely unchanged
    expect(JSON.stringify(doc)).toBe(originalDocSnapshot);

    // Simulated document reflects all 3 sequential operations
    const simLayout = result.simulatedDocument?.root.children?.find((n) => n.id === 'layout-1');
    expect(simLayout).toBeDefined();
    expect(simLayout?.slots?.header?.[0]?.id).toBe('card-header');
    expect(simLayout?.slots?.header?.[0]?.props.title).toBe('Updated Header Card');
  });
});

describe('AI Action Protocol: applyAIActions()', () => {
  const CardComponent = defineComponent({
    type: 'Card',
    label: 'Card',
    fields: {
      title: { type: 'text', label: 'Title' },
    },
  });

  const registry = createComponentRegistry();
  registry.register(CardComponent);

  function createTestEditor() {
    return createEditor({
      registry,
      initialDocument: createDocument({
        root: {
          id: 'root',
          type: 'root',
          children: [
            createNode({ id: 'card-1', type: 'Card', props: { title: 'Initial Card' } }),
          ],
        },
      }),
    });
  }

  it('applies validated actions atomically and creates a single undoable transaction', () => {
    const editor = createTestEditor();

    const result = applyAIActions({
      editor,
      actions: [
        {
          action: 'insertNode',
          parentId: 'root',
          node: { id: 'card-2', type: 'Card', props: { title: 'Second Card' } },
        },
        {
          action: 'updateProps',
          nodeId: 'card-1',
          props: { title: 'Updated First Card' },
        },
      ],
    });

    expect(result.success).toBe(true);
    expect(result.appliedCount).toBe(2);
    expect(result.affectedNodeIds).toContain('card-2');
    expect(result.affectedNodeIds).toContain('card-1');

    // Verify mutations took effect
    expect(editor.getDocument().root.children?.length).toBe(2);
    expect(editor.getNode('card-1')?.props.title).toBe('Updated First Card');
    expect(editor.getNode('card-2')?.props.title).toBe('Second Card');

    // History: A SINGLE undo reverts both AI operations atomically
    expect(editor.canUndo()).toBe(true);
    editor.commands.undo();

    expect(editor.getDocument().root.children?.length).toBe(1);
    expect(editor.getNode('card-1')?.props.title).toBe('Initial Card');
    expect(editor.getNode('card-2')).toBeUndefined();

    // Redo restores both AI operations
    editor.commands.redo();
    expect(editor.getDocument().root.children?.length).toBe(2);
    expect(editor.getNode('card-1')?.props.title).toBe('Updated First Card');
  });

  it('aborts and performs zero mutations if any action in the batch is invalid', () => {
    const editor = createTestEditor();
    const docSnapshot = JSON.stringify(editor.getDocument());

    const result = applyAIActions({
      editor,
      actions: [
        {
          action: 'insertNode',
          parentId: 'root',
          node: { id: 'valid-card', type: 'Card', props: { title: 'Will Not Be Inserted' } },
        },
        {
          action: 'removeNode',
          nodeId: 'non-existent-node-id', // Causes validation failure
        },
      ],
    });

    expect(result.success).toBe(false);
    expect(result.appliedCount).toBe(0);
    expect(result.errors?.length).toBeGreaterThan(0);

    // Document in editor must remain untouched
    expect(JSON.stringify(editor.getDocument())).toBe(docSnapshot);
    expect(editor.getNode('valid-card')).toBeUndefined();
  });
});
