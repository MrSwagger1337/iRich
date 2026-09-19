/**
 * @irich/react
 * Headless canvas logic, geometry calculations, placement validation, and node actions.
 */

import { useMemo } from 'react';
import {
  canPlaceNode,
  createNode,
  findNodeById,
  findParent,
  isDescendantOf,
  type ComponentRegistry,
  type EditorInstance,
  type IRichDocument,
  type IRichNode,
  type JSONValue,
  type NodeId,
} from '@irich/core';
import { useIRichDocument, useIRichEditor, useIRichSelection } from '../hooks';
import type {
  InsertionResolution,
  InsertionTarget,
  NodeActionsState,
} from './types';

/**
 * Internal edge threshold ratios for geometry calculation (private per Amendment 4).
 */
const CONTAINER_EDGE_THRESHOLD_RATIO = 0.18;
const LEAF_EDGE_THRESHOLD_RATIO = 0.5;

/**
 * Calculates semantic drop position relative to a hovered node's bounding rectangle.
 */
export function calculateDropPosition(
  clientY: number,
  rect: DOMRect,
  isContainer: boolean,
): 'before' | 'after' | 'inside' {
  const relativeY = clientY - rect.top;
  const height = rect.height;

  if (isContainer) {
    if (relativeY < height * CONTAINER_EDGE_THRESHOLD_RATIO) {
      return 'before';
    }
    if (relativeY > height * (1 - CONTAINER_EDGE_THRESHOLD_RATIO)) {
      return 'after';
    }
    return 'inside';
  }

  return relativeY < height * LEAF_EDGE_THRESHOLD_RATIO ? 'before' : 'after';
}

export interface ResolveInsertionOptions {
  readonly document: IRichDocument;
  readonly target: InsertionTarget;
  readonly registry?: ComponentRegistry;
  readonly paletteType?: string;
  readonly sourceNodeId?: NodeId;
}

/**
 * Resolves a high-level insertion target into an exact tree location and placement validation result.
 */
export function resolveInsertionLocation(options: ResolveInsertionOptions): InsertionResolution {
  const { document, target, registry, paletteType, sourceNodeId } = options;
  const { targetNodeId, position } = target;

  // Case 1: Root append target (dropping onto bottom canvas drop zone or empty document)
  if (position === 'root' || !targetNodeId) {
    const targetParentId = document.root.id;
    const targetIndex = document.root.children?.length ?? 0;
    const source: IRichNode | string = sourceNodeId
      ? findNodeById(document, sourceNodeId) ?? 'unknown'
      : paletteType ?? 'unknown';

    const placement = canPlaceNode({
      document,
      source,
      targetParentId,
      targetIndex,
      registry,
    });

    return {
      targetParentId,
      targetIndex,
      position: 'root',
      isAllowed: placement.allowed,
      code: placement.code,
      reason: placement.reason,
    };
  }

  // Case 2: Drop inside a container node
  if (position === 'inside') {
    const targetNode = findNodeById(document, targetNodeId);
    const targetParentId = targetNodeId;
    const targetIndex = targetNode?.children?.length ?? 0;
    const source: IRichNode | string = sourceNodeId
      ? findNodeById(document, sourceNodeId) ?? 'unknown'
      : paletteType ?? 'unknown';

    // Cycle check: cannot drop ancestor into descendant or node into itself
    if (sourceNodeId && (sourceNodeId === targetParentId || isDescendantOf(document, sourceNodeId, targetParentId))) {
      return {
        targetNodeId,
        targetParentId,
        targetIndex,
        position: 'inside',
        isAllowed: false,
        code: sourceNodeId === targetParentId ? 'SELF_PLACEMENT' : 'DESCENDANT_CYCLE',
        reason:
          sourceNodeId === targetParentId
            ? 'Cannot drop a node inside itself.'
            : 'Cannot drop a parent node into one of its own descendants.',
      };
    }

    const placement = canPlaceNode({
      document,
      source,
      targetParentId,
      targetIndex,
      registry,
    });

    return {
      targetNodeId,
      targetParentId,
      targetIndex,
      position: 'inside',
      isAllowed: placement.allowed,
      code: placement.code,
      reason: placement.reason,
    };
  }

  // Case 3: Sibling insertion (before or after a target node)
  const parentLoc = findParent(document, targetNodeId);
  const targetParentId = parentLoc ? parentLoc.parent.id : document.root.id;
  const targetSlot = parentLoc?.slotName;
  let targetIndex = parentLoc ? parentLoc.index : 0;

  if (position === 'after') {
    targetIndex += 1;
  }

  const source: IRichNode | string = sourceNodeId
    ? findNodeById(document, sourceNodeId) ?? 'unknown'
    : paletteType ?? 'unknown';

  // Sibling cycle check
  if (sourceNodeId && (sourceNodeId === targetParentId || isDescendantOf(document, sourceNodeId, targetParentId))) {
    return {
      targetNodeId,
      targetParentId,
      targetSlot,
      targetIndex,
      position,
      isAllowed: false,
      code: sourceNodeId === targetParentId ? 'SELF_PLACEMENT' : 'DESCENDANT_CYCLE',
      reason: 'Cannot move parent node into its own descendant.',
    };
  }

  const placement = canPlaceNode({
    document,
    source,
    targetParentId,
    targetSlot,
    targetIndex,
    registry,
  });

  return {
    targetNodeId,
    targetParentId,
    targetSlot,
    targetIndex,
    position,
    isAllowed: placement.allowed,
    code: placement.code,
    reason: placement.reason,
  };
}

export interface ExecuteDropOptions {
  readonly editor: EditorInstance;
  readonly document: IRichDocument;
  readonly resolution: InsertionResolution;
  readonly paletteType?: string;
  readonly sourceNodeId?: NodeId;
  readonly registry?: ComponentRegistry;
}

/**
 * Executes a validated drop operation by dispatching structured editor commands.
 */
export function executeDrop(options: ExecuteDropOptions): NodeId | null {
  const { editor, resolution, paletteType, sourceNodeId, registry } = options;

  if (!resolution.isAllowed) {
    return null;
  }

  // 1. Insertion from component palette
  if (paletteType) {
    const reg = registry ?? editor.getRegistry();
    const defaultProps = reg ? reg.getDefaultProps(paletteType) : {};
    const compDef = reg?.get(paletteType);
    const canHaveChildren = compDef ? compDef.canHaveChildren !== false : false;

    const newNode = createNode({
      type: paletteType,
      props: defaultProps as Record<string, JSONValue>,
      children: canHaveChildren ? [] : undefined,
    });

    editor.commands.insertNode({
      node: newNode,
      parentId: resolution.targetParentId,
      slot: resolution.targetSlot,
      index: resolution.targetIndex,
    });

    editor.commands.selectNode(newNode.id);
    return newNode.id;
  }

  // 2. Move existing canvas node
  if (sourceNodeId) {
    // Avoid moving if destination is identical
    editor.commands.moveNode({
      nodeId: sourceNodeId,
      targetParentId: resolution.targetParentId,
      targetSlot: resolution.targetSlot,
      targetIndex: resolution.targetIndex,
    });

    editor.commands.selectNode(sourceNodeId);
    return sourceNodeId;
  }

  return null;
}

/**
 * Headless hook computing action capabilities and handlers for a node in the visual editor.
 */
export function useIRichNodeActions(nodeId: NodeId): NodeActionsState {
  const editor = useIRichEditor();
  const document = useIRichDocument();
  const { selectNode } = useIRichSelection();

  const parentLoc = useMemo(() => findParent(document, nodeId), [document, nodeId]);
  const node = useMemo(() => findNodeById(document, nodeId), [document, nodeId]);
  const nodeType = node?.type ?? 'Unknown';

  const siblingCount = parentLoc
    ? parentLoc.slotName
      ? (parentLoc.parent.slots?.[parentLoc.slotName]?.length ?? 1)
      : (parentLoc.parent.children?.length ?? 1)
    : 1;

  const canMoveUp = parentLoc ? parentLoc.index > 0 : false;
  const canMoveDown = parentLoc ? parentLoc.index < siblingCount - 1 : false;
  const canDuplicate = nodeId !== document.root.id;
  const canDelete = nodeId !== document.root.id;

  const moveUp = () => {
    if (!parentLoc || !canMoveUp) return;
    editor.commands.moveNode({
      nodeId,
      targetParentId: parentLoc.parent.id,
      targetSlot: parentLoc.slotName,
      targetIndex: parentLoc.index - 1,
    });
  };

  const moveDown = () => {
    if (!parentLoc || !canMoveDown) return;
    editor.commands.moveNode({
      nodeId,
      targetParentId: parentLoc.parent.id,
      targetSlot: parentLoc.slotName,
      targetIndex: parentLoc.index + 2, // account for forward index shift
    });
  };

  const duplicate = () => {
    if (!canDuplicate) return;
    const newId = editor.commands.duplicateNode(nodeId);
    if (newId) {
      selectNode(newId);
    }
  };

  const remove = () => {
    if (!canDelete) return;
    editor.commands.removeNode(nodeId);
  };

  return {
    nodeId,
    nodeType,
    canMoveUp,
    canMoveDown,
    canDuplicate,
    canDelete,
    moveUp,
    moveDown,
    duplicate,
    duplicateNode: duplicate,
    remove,
    deleteNode: remove,
  };
}

