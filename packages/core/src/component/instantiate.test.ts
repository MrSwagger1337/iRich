import { describe, it, expect } from 'vitest';
import { createComponentRegistry } from './registry';
import { defineComponent } from './definition';
import { instantiateComponentNode } from './instantiate';
import { collectAllNodeIds } from '../utils/tree';
import { validateDocument } from '../utils/validation';
import { createDocument } from '../utils/tree';

describe('instantiateComponentNode', () => {
  it('instantiates a basic component with default props and unique ID', () => {
    const registry = createComponentRegistry();
    registry.register(
      defineComponent({
        type: 'Heading',
        label: 'Heading',
        canHaveChildren: false,
        fields: {
          level: { type: 'number', defaultValue: 2 },
          text: { type: 'text', defaultValue: 'Default Heading' },
        },
      }),
    );

    const node = instantiateComponentNode('Heading', registry);
    expect(node.id).toBeDefined();
    expect(node.id.startsWith('heading_')).toBe(true);
    expect(node.type).toBe('Heading');
    expect(node.props).toEqual({
      level: 2,
      text: 'Default Heading',
    });
    expect(node.children).toBeUndefined();
  });

  it('instantiates a container component with empty children by default', () => {
    const registry = createComponentRegistry();
    registry.register(
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

    const node = instantiateComponentNode('CardGrid', registry);
    expect(node.type).toBe('CardGrid');
    expect(node.props).toEqual({ columns: 3 });
    expect(node.children).toEqual([]);
  });

  it('recursively initializes nested child blueprints via createInitialState', () => {
    const registry = createComponentRegistry();
    registry.register(
      defineComponent({
        type: 'Column',
        label: 'Column',
        canHaveChildren: true,
        allowedParents: ['Columns'],
        fields: {
          span: { type: 'number', defaultValue: 1 },
        },
      }),
    );
    registry.register(
      defineComponent({
        type: 'Columns',
        label: 'Columns',
        canHaveChildren: true,
        allowedChildren: ['Column'],
        fields: {
          layout: { type: 'text', defaultValue: 'equal' },
        },
        createInitialState: () => ({
          children: [{ type: 'Column' }, { type: 'Column' }],
        }),
      }),
    );

    const node = instantiateComponentNode('Columns', registry);
    expect(node.type).toBe('Columns');
    expect(node.props).toEqual({ layout: 'equal' });
    expect(node.children).toHaveLength(2);

    const col1 = node.children![0];
    const col2 = node.children![1];

    expect(col1.type).toBe('Column');
    expect(col2.type).toBe('Column');
    expect(col1.props).toEqual({ span: 1 });
    expect(col2.props).toEqual({ span: 1 });
    expect(col1.children).toEqual([]);
    expect(col2.children).toEqual([]);

    // Unique IDs
    expect(node.id).not.toBe(col1.id);
    expect(node.id).not.toBe(col2.id);
    expect(col1.id).not.toBe(col2.id);

    // Tree validity check
    const doc = createDocument({
      root: {
        id: 'root-1',
        type: 'root',
        props: {},
        children: [node],
      },
    });
    const allIds = collectAllNodeIds(doc);
    expect(allIds.size).toBe(4); // root, Columns, Column1, Column2
    const validation = validateDocument(doc);
    expect(validation.valid).toBe(true);
  });

  it('supports deeply nested scaffolds and initial props from blueprint', () => {
    const registry = createComponentRegistry();
    registry.register(
      defineComponent({
        type: 'Leaf',
        label: 'Leaf',
        canHaveChildren: false,
        fields: { text: { type: 'text', defaultValue: 'Leaf' } },
      }),
    );
    registry.register(
      defineComponent({
        type: 'Inner',
        label: 'Inner',
        canHaveChildren: true,
        fields: {},
        createInitialState: () => ({
          children: [{ type: 'Leaf', props: { text: 'Custom text' } }],
        }),
      }),
    );
    registry.register(
      defineComponent({
        type: 'Outer',
        label: 'Outer',
        canHaveChildren: true,
        fields: {},
        createInitialState: () => ({
          children: [{ type: 'Inner' }],
        }),
      }),
    );

    const outer = instantiateComponentNode('Outer', registry);
    expect(outer.children).toHaveLength(1);
    const inner = outer.children![0];
    expect(inner.type).toBe('Inner');
    expect(inner.children).toHaveLength(1);
    const leaf = inner.children![0];
    expect(leaf.type).toBe('Leaf');
    expect(leaf.props).toEqual({ text: 'Custom text' });

    expect(outer.id).not.toBe(inner.id);
    expect(inner.id).not.toBe(leaf.id);
  });

  it('allows instantiateComponentNode options to override initial props and children', () => {
    const registry = createComponentRegistry();
    registry.register(
      defineComponent({
        type: 'Columns',
        label: 'Columns',
        canHaveChildren: true,
        fields: { layout: { type: 'text', defaultValue: 'equal' } },
        createInitialState: () => ({
          children: [{ type: 'Column' }, { type: 'Column' }],
        }),
      }),
    );

    const customNode = instantiateComponentNode('Columns', registry, {
      props: { layout: 'sidebar-left' },
      children: [],
    });
    expect(customNode.props).toEqual({ layout: 'sidebar-left' });
    expect(customNode.children).toEqual([]);
  });

  it('handles unregistered component gracefully', () => {
    const node = instantiateComponentNode('UnknownType');
    expect(node.type).toBe('UnknownType');
    expect(node.props).toEqual({});
    expect(node.id.startsWith('unknowntype_')).toBe(true);
  });
});
