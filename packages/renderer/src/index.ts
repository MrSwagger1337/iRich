/**
 * @irich/renderer
 * Block and node rendering abstractions for iRich documents.
 */

import type { IRichDocument, IRichNode } from '@irich/core';

export type NodeComponent<P = Record<string, unknown>> = (props: P) => unknown;

export class RendererRegistry {
  private components = new Map<string, NodeComponent>();

  register(type: string, component: NodeComponent): void {
    this.components.set(type, component);
  }

  get(type: string): NodeComponent | undefined {
    return this.components.get(type);
  }

  has(type: string): boolean {
    return this.components.has(type);
  }
}

export function renderNodeTree<T>(
  node: IRichNode,
  renderFn: (node: IRichNode, children: T[]) => T,
): T {
  const renderedChildren: T[] = (node.children ?? []).map((child: IRichNode) =>
    renderNodeTree(child, renderFn),
  );
  return renderFn(node, renderedChildren);
}

export function createRenderer(): RendererRegistry {
  return new RendererRegistry();
}

export type { IRichDocument, IRichNode };
