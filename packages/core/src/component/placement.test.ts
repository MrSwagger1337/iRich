import { describe, expect, it } from 'vitest';
import { createDocument, createNode } from '../utils/tree';
import { defineComponent } from './definition';
import { createComponentRegistry } from './registry';
import { canPlaceNode } from './placement';

describe('Placement Rules & canPlaceNode', () => {
  const ContainerDef = defineComponent({
    type: 'Container',
    label: 'Container',
    canHaveChildren: true,
    fields: {},
  });

  const LeafDef = defineComponent({
    type: 'Heading',
    label: 'Heading',
    canHaveChildren: false,
    fields: {},
  });

  const StrictParentDef = defineComponent({
    type: 'StrictParent',
    label: 'Strict Parent',
    canHaveChildren: true,
    allowedChildren: ['AllowedChild'],
    fields: {},
  });

  const StrictChildDef = defineComponent({
    type: 'StrictChild',
    label: 'Strict Child',
    allowedParents: ['Container'],
    fields: {},
  });

  const SlotComponentDef = defineComponent({
    type: 'SlotBox',
    label: 'Slot Box',
    fields: {},
    slots: {
      header: {
        label: 'Header Slot',
        allowedTypes: ['Heading'],
        maxChildren: 1,
      },
    },
  });

  const registry = createComponentRegistry();
  registry.register(ContainerDef);
  registry.register(LeafDef);
  registry.register(StrictParentDef);
  registry.register(StrictChildDef);
  registry.register(SlotComponentDef);

  it('allows valid placement into root', () => {
    const doc = createDocument();
    const result = canPlaceNode({
      document: doc,
      source: 'Heading',
      targetParentId: 'root',
      registry,
    });

    expect(result.allowed).toBe(true);
  });

  it('allows valid placement into a container', () => {
    const container = createNode({ id: 'c1', type: 'Container', children: [] });
    const doc = createDocument({ root: { children: [container] } });

    const result = canPlaceNode({
      document: doc,
      source: 'Heading',
      targetParentId: 'c1',
      registry,
    });

    expect(result.allowed).toBe(true);
  });

  it('rejects placement into non-existent parent', () => {
    const doc = createDocument();
    const result = canPlaceNode({
      document: doc,
      source: 'Heading',
      targetParentId: 'non-existent-id',
      registry,
    });

    expect(result.allowed).toBe(false);
    expect(result.code).toBe('PARENT_NOT_FOUND');
  });

  it('prevents dropping a node inside itself', () => {
    const container = createNode({ id: 'c1', type: 'Container', children: [] });
    const doc = createDocument({ root: { children: [container] } });

    const result = canPlaceNode({
      document: doc,
      source: container,
      targetParentId: 'c1',
      registry,
    });

    expect(result.allowed).toBe(false);
    expect(result.code).toBe('SELF_PLACEMENT');
  });

  it('prevents dropping an ancestor into its own descendants', () => {
    const leaf = createNode({ id: 'leaf-1', type: 'Heading' });
    const childContainer = createNode({ id: 'c2', type: 'Container', children: [leaf] });
    const parentContainer = createNode({ id: 'c1', type: 'Container', children: [childContainer] });
    const doc = createDocument({ root: { children: [parentContainer] } });

    // Moving parentContainer c1 into its grandchild leaf-1 or child c2
    const result = canPlaceNode({
      document: doc,
      source: parentContainer,
      targetParentId: 'c2',
      registry,
    });

    expect(result.allowed).toBe(false);
    expect(result.code).toBe('DESCENDANT_CYCLE');
  });

  it('rejects placement into a component where canHaveChildren is false', () => {
    const heading = createNode({ id: 'h1', type: 'Heading' });
    const doc = createDocument({ root: { children: [heading] } });

    const result = canPlaceNode({
      document: doc,
      source: 'Heading',
      targetParentId: 'h1',
      registry,
    });

    expect(result.allowed).toBe(false);
    expect(result.code).toBe('CANNOT_HAVE_CHILDREN');
  });

  it('enforces allowedChildren whitelist on parent', () => {
    const strictParent = createNode({ id: 'sp1', type: 'StrictParent', children: [] });
    const doc = createDocument({ root: { children: [strictParent] } });

    // Heading is not in allowedChildren (['AllowedChild'])
    const disallowedResult = canPlaceNode({
      document: doc,
      source: 'Heading',
      targetParentId: 'sp1',
      registry,
    });
    expect(disallowedResult.allowed).toBe(false);
    expect(disallowedResult.code).toBe('CHILD_TYPE_NOT_ALLOWED');

    const allowedResult = canPlaceNode({
      document: doc,
      source: 'AllowedChild',
      targetParentId: 'sp1',
      registry,
    });
    expect(allowedResult.allowed).toBe(true);
  });

  it('enforces allowedParents whitelist on child', () => {
    const doc = createDocument();

    // StrictChild is only allowed inside Container, not root
    const rootResult = canPlaceNode({
      document: doc,
      source: 'StrictChild',
      targetParentId: 'root',
      registry,
    });
    expect(rootResult.allowed).toBe(false);
    expect(rootResult.code).toBe('PARENT_TYPE_NOT_ALLOWED');

    const container = createNode({ id: 'c1', type: 'Container', children: [] });
    const docWithContainer = createDocument({ root: { children: [container] } });

    const containerResult = canPlaceNode({
      document: docWithContainer,
      source: 'StrictChild',
      targetParentId: 'c1',
      registry,
    });
    expect(containerResult.allowed).toBe(true);
  });

  it('validates slot constraints and maxChildren limits', () => {
    const existingHeading = createNode({ id: 'h1', type: 'Heading' });
    const slotBox = createNode({
      id: 'box1',
      type: 'SlotBox',
      slots: { header: [existingHeading] },
    });
    const doc = createDocument({ root: { children: [slotBox] } });

    // Disallowed type in slot
    const wrongTypeResult = canPlaceNode({
      document: doc,
      source: 'Container',
      targetParentId: 'box1',
      targetSlot: 'header',
      registry,
    });
    expect(wrongTypeResult.allowed).toBe(false);
    expect(wrongTypeResult.code).toBe('SLOT_TYPE_NOT_ALLOWED');

    // Slot capacity exceeded (maxChildren: 1 and already has 1)
    const capacityExceededResult = canPlaceNode({
      document: doc,
      source: 'Heading',
      targetParentId: 'box1',
      targetSlot: 'header',
      registry,
    });
    expect(capacityExceededResult.allowed).toBe(false);
    expect(capacityExceededResult.code).toBe('SLOT_MAX_CHILDREN_EXCEEDED');

    // Moving the same node within the slot does not exceed capacity
    const sameNodeMoveResult = canPlaceNode({
      document: doc,
      source: existingHeading,
      targetParentId: 'box1',
      targetSlot: 'header',
      registry,
    });
    expect(sameNodeMoveResult.allowed).toBe(true);
  });
});
