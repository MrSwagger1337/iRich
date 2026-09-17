import { describe, it, expect } from 'vitest';
import { RendererRegistry, renderNodeTree } from './index';
import type { IRichNode } from '@irich/core';

describe('@irich/renderer', () => {
  it('should register and retrieve components', () => {
    const registry = new RendererRegistry();
    const dummyComponent = () => 'test';
    registry.register('heading', dummyComponent);

    expect(registry.has('heading')).toBe(true);
    expect(registry.get('heading')).toBe(dummyComponent);
    expect(registry.has('paragraph')).toBe(false);
  });

  it('should traverse node tree', () => {
    const node: IRichNode = {
      id: '1',
      type: 'container',
      children: [
        { id: '2', type: 'text', props: { text: 'Hello' } },
        { id: '3', type: 'text', props: { text: 'World' } },
      ],
    };

    const result = renderNodeTree(node, (n, children) => ({
      id: n.id,
      children,
    }));

    expect(result).toEqual({
      id: '1',
      children: [
        { id: '2', children: [] },
        { id: '3', children: [] },
      ],
    });
  });
});
