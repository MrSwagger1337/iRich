import { describe, expect, it, vi } from 'vitest';
import {
  createComponentRegistry,
  createDocument,
  createEditor,
  createNode,
  defineComponent,
} from './index';

describe('Clipboard & Productivity Commands (@irich/core)', () => {
  const ContainerComp = defineComponent({
    type: 'Container',
    label: 'Container',
    canHaveChildren: true,
    fields: {},
  });

  const ButtonComp = defineComponent({
    type: 'Button',
    label: 'Button',
    canHaveChildren: false,
    fields: {
      label: { type: 'text', defaultValue: 'Click Me' },
    },
  });

  const CardComp = defineComponent({
    type: 'Card',
    label: 'Card',
    canHaveChildren: true,
    fields: {
      title: { type: 'text', defaultValue: 'Card Title' },
    },
  });

  const setupEditor = () => {
    const registry = createComponentRegistry();
    registry.register(ContainerComp);
    registry.register(ButtonComp);
    registry.register(CardComp);

    const doc = createDocument({
      root: createNode({
        id: 'root',
        type: 'root',
        children: [
          createNode({
            id: 'card-1',
            type: 'Card',
            props: { title: 'First Card' },
            children: [
              createNode({
                id: 'btn-1',
                type: 'Button',
                props: { label: 'Submit' },
              }),
            ],
          }),
          createNode({
            id: 'btn-2',
            type: 'Button',
            props: { label: 'Cancel' },
          }),
        ],
      }),
    });

    const editor = createEditor({
      initialDocument: doc,
      registry,
    });

    return { editor, registry };
  };

  describe('copyNode', () => {
    it('copies selected node to clipboard without modifying document', () => {
      const { editor } = setupEditor();
      editor.commands.selectNode('card-1');

      const copyListener = vi.fn();
      editor.on('clipboard:copy', copyListener);

      expect(editor.canPaste()).toBe(false);
      const success = editor.commands.copyNode();
      expect(success).toBe(true);
      expect(editor.canPaste()).toBe(true);

      const clipboard = editor.getClipboard();
      expect(clipboard).toBeDefined();
      expect(clipboard?.id).toBe('card-1');
      expect(clipboard?.props.title).toBe('First Card');
      expect(clipboard?.children?.[0].id).toBe('btn-1');

      expect(copyListener).toHaveBeenCalledWith(
        expect.objectContaining({
          node: expect.objectContaining({ id: 'card-1' }),
        }),
      );

      // Document unchanged
      expect(editor.getDocument().root.children).toHaveLength(2);
    });

    it('returns false when copying root node or when selection is empty', () => {
      const { editor } = setupEditor();
      expect(editor.commands.copyNode('root')).toBe(false);
      expect(editor.commands.copyNode()).toBe(false);
    });
  });

  describe('cutNode', () => {
    it('copies node to clipboard and removes it from document with history support', () => {
      const { editor } = setupEditor();
      editor.commands.selectNode('card-1');

      const cutListener = vi.fn();
      editor.on('clipboard:cut', cutListener);

      const success = editor.commands.cutNode();
      expect(success).toBe(true);
      expect(editor.canPaste()).toBe(true);
      expect(editor.getClipboard()?.id).toBe('card-1');

      // Node removed from document
      expect(editor.getNode('card-1')).toBeUndefined();
      expect(editor.getDocument().root.children).toHaveLength(1);
      expect(cutListener).toHaveBeenCalled();

      // Undo restores the node
      expect(editor.canUndo()).toBe(true);
      editor.commands.undo();
      expect(editor.getNode('card-1')).toBeDefined();
      expect(editor.getDocument().root.children).toHaveLength(2);
    });

    it('prevents cutting the root node', () => {
      const { editor } = setupEditor();
      expect(() => editor.commands.cutNode('root')).toThrowError(/Cannot cut the root node/);
    });
  });

  describe('pasteNode', () => {
    it('returns undefined if clipboard is empty', () => {
      const { editor } = setupEditor();
      expect(editor.commands.pasteNode()).toBeUndefined();
    });

    it('pastes node generating fresh IDs for root and all descendants', () => {
      const { editor } = setupEditor();

      // Copy card-1 containing btn-1
      editor.commands.copyNode('card-1');

      // Select btn-2 and paste
      editor.commands.selectNode('btn-2');
      const pasteListener = vi.fn();
      editor.on('clipboard:paste', pasteListener);

      const pastedId = editor.commands.pasteNode();
      expect(pastedId).toBeDefined();
      expect(pastedId).not.toBe('card-1'); // Fresh ID!

      const pastedNode = editor.getNode(pastedId!);
      expect(pastedNode).toBeDefined();
      expect(pastedNode?.type).toBe('Card');
      expect(pastedNode?.props.title).toBe('First Card'); // Preserved props

      // Descendant received fresh ID as well!
      const pastedChild = pastedNode?.children?.[0];
      expect(pastedChild).toBeDefined();
      expect(pastedChild?.id).not.toBe('btn-1');
      expect(pastedChild?.type).toBe('Button');
      expect(pastedChild?.props.label).toBe('Submit');

      // Newly pasted node is automatically selected
      expect(editor.getSelection()).toBe(pastedId);

      // Event was emitted
      expect(pasteListener).toHaveBeenCalledWith(
        expect.objectContaining({
          node: expect.objectContaining({ id: pastedId }),
          parentId: 'root',
        }),
      );

      // Participates in undo/redo
      editor.commands.undo();
      expect(editor.getNode(pastedId!)).toBeUndefined();

      editor.commands.redo();
      expect(editor.getNode(pastedId!)).toBeDefined();
    });

    it('pastes into explicit target parent when payload provided', () => {
      const { editor } = setupEditor();

      // Copy btn-2
      editor.commands.copyNode('btn-2');

      // Paste inside card-1
      const pastedId = editor.commands.pasteNode({ targetParentId: 'card-1' });
      expect(pastedId).toBeDefined();

      const card = editor.getNode('card-1');
      expect(card?.children).toHaveLength(2);
      expect(card?.children?.[1].id).toBe(pastedId);
    });

    it('rejects invalid paste target when placement is forbidden', () => {
      const { editor } = setupEditor();

      // Copy card-1
      editor.commands.copyNode('card-1');

      // Attempt to paste inside btn-2 which cannot have children
      const result = editor.commands.pasteNode({ targetParentId: 'btn-2' });
      expect(result).toBeUndefined();
    });
  });

  describe('duplicateNode', () => {
    it('duplicates node with fresh IDs and selects the duplicate', () => {
      const { editor } = setupEditor();

      const dupId = editor.commands.duplicateNode('card-1');
      expect(dupId).toBeDefined();
      expect(dupId).not.toBe('card-1');

      const dupNode = editor.getNode(dupId);
      expect(dupNode?.type).toBe('Card');
      expect(dupNode?.props.title).toBe('First Card');
      expect(dupNode?.children?.[0].id).not.toBe('btn-1');

      expect(editor.getDocument().root.children).toHaveLength(3);
    });
  });
});
