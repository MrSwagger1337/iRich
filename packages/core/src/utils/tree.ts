/**
 * @irich/core
 * Document creation, tree traversal, node searching, and cloning utilities.
 */

import type { IRichDocument, IRichNode, JSONValue, NodeId } from '../types';
import { generateId } from './id';

export const CURRENT_DOCUMENT_VERSION = '1.0.0';

/**
 * Options for creating an IRichNode.
 */
export interface CreateNodeOptions {
  type: string;
  id?: NodeId;
  props?: Record<string, JSONValue>;
  children?: IRichNode[];
  slots?: Record<string, IRichNode[]>;
  meta?: Record<string, JSONValue>;
}

/**
 * Creates a valid, immutable IRichNode.
 */
export function createNode(options: CreateNodeOptions): IRichNode {
  return {
    id: options.id ?? generateId(options.type.toLowerCase().replace(/[^a-z0-9]/g, '') || 'node'),
    type: options.type,
    props: Object.freeze({ ...(options.props ?? {}) }),
    ...(options.children ? { children: Object.freeze([...options.children]) } : {}),
    ...(options.slots
      ? {
          slots: Object.freeze(
            Object.fromEntries(
              Object.entries(options.slots).map(([k, v]) => [k, Object.freeze([...v])]),
            ),
          ),
        }
      : {}),
    ...(options.meta ? { meta: Object.freeze({ ...options.meta }) } : {}),
  };
}

/**
 * Options for creating an IRichDocument.
 */
export interface CreateDocumentOptions {
  version?: string;
  root?: Partial<CreateNodeOptions>;
  metadata?: Record<string, JSONValue>;
}

/**
 * Creates a valid IRichDocument with a root container node.
 */
export function createDocument(options: CreateDocumentOptions = {}): IRichDocument {
  const rootNode = createNode({
    type: 'root',
    id: 'root',
    props: {},
    children: [],
    ...(options.root ?? {}),
  });

  return {
    version: options.version ?? CURRENT_DOCUMENT_VERSION,
    root: rootNode,
    ...(options.metadata ? { metadata: Object.freeze({ ...options.metadata }) } : {}),
  };
}

/**
 * Contextual information provided to tree visitors during traversal.
 */
export interface WalkContext {
  parent: IRichNode | null;
  slotName?: string;
  index?: number;
  depth: number;
}

/**
 * Recursively traverses a document or subtree, invoking the visitor callback for each node.
 * Returning `false` from the visitor halts traversal into that node's children.
 */
export function walkDocument(
  docOrNode: IRichDocument | IRichNode,
  visitor: (node: IRichNode, context: WalkContext) => boolean | void,
): void {
  const rootNode = 'root' in docOrNode && 'version' in docOrNode ? docOrNode.root : docOrNode;

  function traverse(
    currentNode: IRichNode,
    parent: IRichNode | null,
    slotName: string | undefined,
    index: number | undefined,
    depth: number,
  ): void {
    const shouldContinue = visitor(currentNode, { parent, slotName, index, depth });
    if (shouldContinue === false) {
      return;
    }

    if (currentNode.children) {
      for (let i = 0; i < currentNode.children.length; i++) {
        traverse(currentNode.children[i], currentNode, undefined, i, depth + 1);
      }
    }

    if (currentNode.slots) {
      for (const [slot, slotNodes] of Object.entries(currentNode.slots)) {
        for (let i = 0; i < slotNodes.length; i++) {
          traverse(slotNodes[i], currentNode, slot, i, depth + 1);
        }
      }
    }
  }

  traverse(rootNode, null, undefined, undefined, 0);
}

/**
 * Finds a node matching a custom predicate.
 */
export function findNode(
  docOrNode: IRichDocument | IRichNode,
  predicate: (node: IRichNode, context: WalkContext) => boolean,
): IRichNode | undefined {
  let found: IRichNode | undefined;

  walkDocument(docOrNode, (node, context) => {
    if (predicate(node, context)) {
      found = node;
      return false; // Stop further descent
    }
    return true;
  });

  return found;
}

/**
 * Finds a node by its unique NodeId.
 */
export function findNodeById(
  docOrNode: IRichDocument | IRichNode,
  id: NodeId,
): IRichNode | undefined {
  return findNode(docOrNode, (node) => node.id === id);
}

/**
 * Result of finding a parent node.
 */
export interface ParentLocation {
  parent: IRichNode;
  slotName?: string;
  index: number;
}

/**
 * Finds the parent node and slot/index location of a given target NodeId.
 */
export function findParent(
  docOrNode: IRichDocument | IRichNode,
  targetId: NodeId,
): ParentLocation | undefined {
  let result: ParentLocation | undefined;

  walkDocument(docOrNode, (node, context) => {
    if (node.id === targetId && context.parent) {
      result = {
        parent: context.parent,
        slotName: context.slotName,
        index: context.index ?? 0,
      };
      return false;
    }
    return true;
  });

  return result;
}

/**
 * Determines whether candidateChildId is a descendant of ancestorNodeId.
 */
export function isDescendantOf(
  docOrNode: IRichDocument | IRichNode,
  ancestorNodeId: NodeId,
  candidateChildId: NodeId,
): boolean {
  if (ancestorNodeId === candidateChildId) {
    return true;
  }

  const ancestorNode = findNodeById(docOrNode, ancestorNodeId);
  if (!ancestorNode) {
    return false;
  }

  return findNodeById(ancestorNode, candidateChildId) !== undefined;
}

/**
 * Collects a Set containing all unique NodeIds present in a document or subtree.
 */
export function collectAllNodeIds(docOrNode: IRichDocument | IRichNode): Set<NodeId> {
  const ids = new Set<NodeId>();
  walkDocument(docOrNode, (node) => {
    ids.add(node.id);
  });
  return ids;
}

/**
 * Deep clones a node and its descendants, optionally generating fresh unique IDs for all cloned nodes.
 */
export function cloneNode(node: IRichNode, regenerateIds: boolean = false): IRichNode {
  const newId = regenerateIds
    ? generateId(node.type.toLowerCase().replace(/[^a-z0-9]/g, '') || 'node')
    : node.id;

  const clonedChildren = node.children
    ? node.children.map((child) => cloneNode(child, regenerateIds))
    : undefined;

  const clonedSlots = node.slots
    ? Object.fromEntries(
        Object.entries(node.slots).map(([slotName, slotNodes]) => [
          slotName,
          slotNodes.map((child) => cloneNode(child, regenerateIds)),
        ]),
      )
    : undefined;

  return {
    id: newId,
    type: node.type,
    props: { ...node.props },
    ...(clonedChildren ? { children: Object.freeze(clonedChildren) } : {}),
    ...(clonedSlots
      ? {
          slots: Object.freeze(
            Object.fromEntries(Object.entries(clonedSlots).map(([k, v]) => [k, Object.freeze(v)])),
          ),
        }
      : {}),
    ...(node.meta ? { meta: { ...node.meta } } : {}),
  };
}
