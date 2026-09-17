import { describe, it, expect, vi } from 'vitest';
import {
  createDocument,
  createNode,
  createEditor,
  cloneNode,
  findNodeById,
  findParent,
  walkDocument,
  isDescendantOf,
  validateDocument,
  isJSONValue,
  DuplicateIdError,
  NodeNotFoundError,
  InvalidMoveError,
  CommandExecutionError,
  ValidationError,
  VERSION,
} from './index';
import type { IRichDocument } from './types';

describe('@irich/core', () => {
  it('should export VERSION', () => {
    expect(VERSION).toBe('0.1.0');
  });

  describe('Document & Node Creation Utilities', () => {
    it('creates a default document with root container', () => {
      const doc = createDocument();
      expect(doc.version).toBe('1.0.0');
      expect(doc.root.id).toBe('root');
      expect(doc.root.type).toBe('root');
      expect(doc.root.children).toEqual([]);
    });

    it('creates a node with generated unique ID', () => {
      const node = createNode({ type: 'Hero', props: { title: 'Hello World' } });
      expect(node.id).toBeDefined();
      expect(node.type).toBe('Hero');
      expect(node.props.title).toBe('Hello World');
    });

    it('creates a node with explicit ID and slots', () => {
      const child = createNode({ id: 'child-1', type: 'Button', props: { label: 'Click' } });
      const container = createNode({
        id: 'container-1',
        type: 'Card',
        props: { border: true },
        slots: {
          header: [child],
        },
      });

      expect(container.id).toBe('container-1');
      expect(container.slots?.header).toHaveLength(1);
      expect(container.slots?.header[0].id).toBe('child-1');
    });
  });

  describe('Tree Traversal and Inspection Utilities', () => {
    function createSampleDocument(): IRichDocument {
      return createDocument({
        root: {
          children: [
            createNode({
              id: 'section-1',
              type: 'Section',
              children: [
                createNode({ id: 'heading-1', type: 'Heading', props: { text: 'Title' } }),
                createNode({ id: 'para-1', type: 'Paragraph', props: { text: 'Body' } }),
              ],
            }),
            createNode({
              id: 'grid-1',
              type: 'Grid',
              slots: {
                left: [createNode({ id: 'item-left', type: 'Text', props: { text: 'Left' } })],
                right: [createNode({ id: 'item-right', type: 'Text', props: { text: 'Right' } })],
              },
            }),
          ],
        },
      });
    }

    it('finds node by ID in nested children and slots', () => {
      const doc = createSampleDocument();
      const heading = findNodeById(doc, 'heading-1');
      expect(heading).toBeDefined();
      expect(heading?.type).toBe('Heading');

      const itemRight = findNodeById(doc, 'item-right');
      expect(itemRight).toBeDefined();
      expect(itemRight?.type).toBe('Text');

      expect(findNodeById(doc, 'non-existent')).toBeUndefined();
    });

    it('finds parent and slot location of nested nodes', () => {
      const doc = createSampleDocument();

      const headingParent = findParent(doc, 'heading-1');
      expect(headingParent).toBeDefined();
      expect(headingParent?.parent.id).toBe('section-1');
      expect(headingParent?.slotName).toBeUndefined();
      expect(headingParent?.index).toBe(0);

      const slotParent = findParent(doc, 'item-right');
      expect(slotParent).toBeDefined();
      expect(slotParent?.parent.id).toBe('grid-1');
      expect(slotParent?.slotName).toBe('right');
      expect(slotParent?.index).toBe(0);

      expect(findParent(doc, 'root')).toBeUndefined();
    });

    it('correctly determines descendant relationships', () => {
      const doc = createSampleDocument();
      expect(isDescendantOf(doc, 'section-1', 'heading-1')).toBe(true);
      expect(isDescendantOf(doc, 'grid-1', 'item-right')).toBe(true);
      expect(isDescendantOf(doc, 'root', 'item-right')).toBe(true);

      // Sibling / inverse relationships are false
      expect(isDescendantOf(doc, 'heading-1', 'section-1')).toBe(false);
      expect(isDescendantOf(doc, 'section-1', 'item-left')).toBe(false);
    });

    it('walks entire document tree', () => {
      const doc = createSampleDocument();
      const visitedTypes: string[] = [];

      walkDocument(doc, (node) => {
        visitedTypes.push(node.type);
      });

      expect(visitedTypes).toEqual([
        'root',
        'Section',
        'Heading',
        'Paragraph',
        'Grid',
        'Text',
        'Text',
      ]);
    });
  });

  describe('Deep Cloning & ID Regeneration', () => {
    it('clones a node subtree and generates new unique IDs recursively', () => {
      const subtree = createNode({
        id: 'orig-parent',
        type: 'Card',
        props: { title: 'Card' },
        children: [
          createNode({ id: 'orig-child-1', type: 'Heading', props: { text: 'H1' } }),
          createNode({ id: 'orig-child-2', type: 'Text', props: { text: 'P1' } }),
        ],
        slots: {
          footer: [createNode({ id: 'orig-footer', type: 'Button', props: { label: 'Go' } })],
        },
      });

      const cloned = cloneNode(subtree, true);

      expect(cloned.id).not.toBe('orig-parent');
      expect(cloned.type).toBe('Card');
      expect(cloned.children?.[0].id).not.toBe('orig-child-1');
      expect(cloned.children?.[1].id).not.toBe('orig-child-2');
      expect(cloned.slots?.footer[0].id).not.toBe('orig-footer');

      // Preserves props
      expect(cloned.props.title).toBe('Card');
      expect(cloned.children?.[0].props.text).toBe('H1');
    });
  });

  describe('Document Validation', () => {
    it('passes for a valid canonical document', () => {
      const doc = createDocument({
        root: {
          children: [createNode({ id: 'n1', type: 'Text', props: { value: 'Hello' } })],
        },
      });

      const result = validateDocument(doc);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('fails when document version is invalid', () => {
      const result = validateDocument({
        version: '',
        root: { id: 'root', type: 'root', props: {} },
      });
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes('version'))).toBe(true);
    });

    it('fails on duplicate NodeIds in tree', () => {
      const doc = {
        version: '1.0.0',
        root: {
          id: 'root',
          type: 'root',
          props: {},
          children: [
            { id: 'dup-id', type: 'Text', props: {} },
            { id: 'dup-id', type: 'Text', props: {} },
          ],
        },
      };

      const result = validateDocument(doc);
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes('Duplicate NodeId detected'))).toBe(true);
    });

    it('detects non-JSON serializable values in props (functions, undefined, symbols)', () => {
      expect(isJSONValue('string')).toBe(true);
      expect(isJSONValue(123)).toBe(true);
      expect(isJSONValue(null)).toBe(true);
      expect(isJSONValue({ a: 1, b: [true, 'ok'] })).toBe(true);

      expect(isJSONValue(undefined)).toBe(false);
      expect(isJSONValue(() => {})).toBe(false);
      expect(isJSONValue(Symbol('test'))).toBe(false);
      expect(isJSONValue(NaN)).toBe(false);

      const circularObj: Record<string, unknown> = {};
      circularObj.self = circularObj;
      expect(isJSONValue(circularObj)).toBe(false);

      const doc = {
        version: '1.0.0',
        root: {
          id: 'root',
          type: 'root',
          props: {
            fn: () => {},
          },
        },
      };

      const result = validateDocument(doc);
      expect(result.valid).toBe(false);
    });
  });

  describe('Editor Engine & Commands', () => {
    it('initializes editor with valid document and emits events', () => {
      const editor = createEditor();
      expect(editor.getDocument().root.id).toBe('root');
      expect(editor.getState().selection).toBeNull();
    });

    it('throws ValidationError when initialized with invalid document', () => {
      expect(() => {
        createEditor({
          initialDocument: {
            version: '',
            root: { id: 'root', type: 'root', props: {} },
          },
        });
      }).toThrow(ValidationError);
    });

    it('inserts node into root and emits events', () => {
      const editor = createEditor();
      const onDocChange = vi.fn();
      const onNodeInsert = vi.fn();

      editor.on('document:change', onDocChange);
      editor.on('node:insert', onNodeInsert);

      const newNode = createNode({ id: 'hero-1', type: 'Hero', props: { title: 'Welcome' } });
      const insertedId = editor.commands.insertNode({ node: newNode });

      expect(insertedId).toBe('hero-1');
      expect(editor.getDocument().root.children).toHaveLength(1);
      expect(editor.getDocument().root.children?.[0].id).toBe('hero-1');

      expect(onDocChange).toHaveBeenCalledTimes(1);
      expect(onNodeInsert).toHaveBeenCalledWith({
        node: newNode,
        parentId: 'root',
        slot: undefined,
        index: 0,
      });
    });

    it('inserts node into named slot and specific index', () => {
      const editor = createEditor({
        initialDocument: createDocument({
          root: {
            children: [createNode({ id: 'grid-1', type: 'Grid', props: {}, slots: { left: [] } })],
          },
        }),
      });

      const slotChild = createNode({ id: 'text-1', type: 'Text', props: { text: 'Inside Slot' } });
      editor.commands.insertNode({
        node: slotChild,
        parentId: 'grid-1',
        slot: 'left',
      });

      const gridNode = editor.getNode('grid-1');
      expect(gridNode?.slots?.left).toHaveLength(1);
      expect(gridNode?.slots?.left[0].id).toBe('text-1');
    });

    it('rejects inserting duplicate IDs with DuplicateIdError', () => {
      const editor = createEditor({
        initialDocument: createDocument({
          root: {
            children: [createNode({ id: 'existing-id', type: 'Text', props: {} })],
          },
        }),
      });

      expect(() => {
        editor.commands.insertNode({
          node: createNode({ id: 'existing-id', type: 'Hero', props: {} }),
        });
      }).toThrow(DuplicateIdError);
    });

    it('removes node and clears selection if selected node was removed', () => {
      const editor = createEditor({
        initialDocument: createDocument({
          root: {
            children: [
              createNode({ id: 'block-1', type: 'Text', props: {} }),
              createNode({ id: 'block-2', type: 'Text', props: {} }),
            ],
          },
        }),
      });

      editor.commands.selectNode('block-1');
      expect(editor.getSelection()).toBe('block-1');

      editor.commands.removeNode('block-1');

      expect(editor.getDocument().root.children).toHaveLength(1);
      expect(editor.getDocument().root.children?.[0].id).toBe('block-2');
      expect(editor.getSelection()).toBeNull();
    });

    it('throws NodeNotFoundError when attempting to remove or update non-existent node', () => {
      const editor = createEditor();
      expect(() => {
        editor.commands.removeNode('unknown-node');
      }).toThrow(NodeNotFoundError);

      expect(() => {
        editor.commands.updateNode({
          nodeId: 'unknown-node',
          props: { text: 'fail' },
        });
      }).toThrow(NodeNotFoundError);
    });

    it('forbids removing root node', () => {
      const editor = createEditor();
      expect(() => {
        editor.commands.removeNode('root');
      }).toThrow(CommandExecutionError);
    });

    it('updates node props and metadata immutably without altering ID', () => {
      const editor = createEditor({
        initialDocument: createDocument({
          root: {
            children: [
              createNode({ id: 'node-1', type: 'Heading', props: { level: 1, text: 'Old' } }),
            ],
          },
        }),
      });

      const prevDoc = editor.getDocument();
      editor.commands.updateNode({
        nodeId: 'node-1',
        props: { text: 'New Headline' },
        meta: { locked: true },
      });

      const nextDoc = editor.getDocument();
      expect(prevDoc).not.toBe(nextDoc);

      const updatedNode = editor.getNode('node-1');
      expect(updatedNode?.id).toBe('node-1');
      expect(updatedNode?.props).toEqual({ level: 1, text: 'New Headline' });
      expect(updatedNode?.meta).toEqual({ locked: true });
    });

    it('moves a node across parents and slots', () => {
      const editor = createEditor({
        initialDocument: createDocument({
          root: {
            children: [
              createNode({
                id: 'card-1',
                type: 'Card',
                children: [createNode({ id: 'moveable-item', type: 'Text', props: {} })],
              }),
              createNode({
                id: 'card-2',
                type: 'Card',
                slots: { body: [] },
              }),
            ],
          },
        }),
      });

      editor.commands.moveNode({
        nodeId: 'moveable-item',
        targetParentId: 'card-2',
        targetSlot: 'body',
        targetIndex: 0,
      });

      const card1 = editor.getNode('card-1');
      const card2 = editor.getNode('card-2');

      expect(card1?.children).toHaveLength(0);
      expect(card2?.slots?.body).toHaveLength(1);
      expect(card2?.slots?.body[0].id).toBe('moveable-item');
    });

    it('strictly forbids moving a parent into its descendant', () => {
      const editor = createEditor({
        initialDocument: createDocument({
          root: {
            children: [
              createNode({
                id: 'parent-section',
                type: 'Section',
                children: [
                  createNode({
                    id: 'child-container',
                    type: 'Container',
                    children: [createNode({ id: 'grandchild-leaf', type: 'Leaf', props: {} })],
                  }),
                ],
              }),
            ],
          },
        }),
      });

      expect(() => {
        editor.commands.moveNode({
          nodeId: 'parent-section',
          targetParentId: 'grandchild-leaf',
        });
      }).toThrow(InvalidMoveError);

      expect(() => {
        editor.commands.moveNode({
          nodeId: 'parent-section',
          targetParentId: 'parent-section',
        });
      }).toThrow(InvalidMoveError);
    });

    it('duplicates a node and all its descendants with fresh IDs', () => {
      const editor = createEditor({
        initialDocument: createDocument({
          root: {
            children: [
              createNode({
                id: 'orig-block',
                type: 'Section',
                props: { bg: 'blue' },
                children: [
                  createNode({ id: 'orig-inner', type: 'Text', props: { text: 'Copy me' } }),
                ],
              }),
            ],
          },
        }),
      });

      const newId = editor.commands.duplicateNode('orig-block');

      expect(newId).not.toBe('orig-block');
      expect(editor.getDocument().root.children).toHaveLength(2);

      const duplicatedNode = editor.getNode(newId);
      expect(duplicatedNode?.type).toBe('Section');
      expect(duplicatedNode?.props.bg).toBe('blue');
      expect(duplicatedNode?.children).toHaveLength(1);
      expect(duplicatedNode?.children?.[0].id).not.toBe('orig-inner');
      expect(duplicatedNode?.children?.[0].props.text).toBe('Copy me');
    });

    it('supports batching multiple commands into a single document:change emission', () => {
      const editor = createEditor();
      const docChangeSpy = vi.fn();
      editor.on('document:change', docChangeSpy);

      editor.commands.batch(() => {
        editor.commands.insertNode({
          node: createNode({ id: 'n1', type: 'Text', props: {} }),
        });
        editor.commands.insertNode({
          node: createNode({ id: 'n2', type: 'Text', props: {} }),
        });
        editor.commands.updateNode({
          nodeId: 'n1',
          props: { text: 'Updated' },
        });
      });

      expect(docChangeSpy).toHaveBeenCalledTimes(1);
      expect(editor.getDocument().root.children).toHaveLength(2);
    });

    it('supports selective node subscriptions without notifying on unrelated updates', () => {
      const editor = createEditor({
        initialDocument: createDocument({
          root: {
            children: [
              createNode({ id: 'node-A', type: 'Text', props: { text: 'A' } }),
              createNode({ id: 'node-B', type: 'Text', props: { text: 'B' } }),
            ],
          },
        }),
      });

      const nodeAListener = vi.fn();
      const nodeBListener = vi.fn();

      const unsubA = editor.subscribeToNode('node-A', nodeAListener);
      editor.subscribeToNode('node-B', nodeBListener);

      editor.commands.updateNode({
        nodeId: 'node-A',
        props: { text: 'A-Modified' },
      });

      expect(nodeAListener).toHaveBeenCalledTimes(1);
      expect(nodeBListener).not.toHaveBeenCalled();

      unsubA();
      editor.commands.updateNode({
        nodeId: 'node-A',
        props: { text: 'A-Second-Mod' },
      });
      expect(nodeAListener).toHaveBeenCalledTimes(1);
    });

    it('preserves structural sharing for untouched subtrees on mutation', () => {
      const sibling1 = createNode({ id: 'sib-1', type: 'Text', props: { val: 1 } });
      const sibling2 = createNode({ id: 'sib-2', type: 'Text', props: { val: 2 } });

      const editor = createEditor({
        initialDocument: createDocument({
          root: {
            children: [sibling1, sibling2],
          },
        }),
      });

      const rootBefore = editor.getDocument().root;
      const sib2Before = rootBefore.children![1];

      editor.commands.updateNode({
        nodeId: 'sib-1',
        props: { val: 999 },
      });

      const rootAfter = editor.getDocument().root;
      const sib2After = rootAfter.children![1];

      // Sibling 2 was untouched and must retain identical reference
      expect(sib2Before).toBe(sib2After);
      expect(rootBefore.children![0]).not.toBe(rootAfter.children![0]);
    });
  });
});
