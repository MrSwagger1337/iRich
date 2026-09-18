/**
 * @irich/core
 * Placement rules and hierarchy validation engine.
 * Pure framework-independent logic for drag-and-drop hit validation and tree mutation safety.
 */

import type { IRichDocument, IRichNode, NodeId } from '../types';
import { findNodeById, isDescendantOf } from '../utils/tree';
import type { ComponentRegistry } from './registry';

/**
 * Options for evaluating if a component or node can be placed inside a target parent.
 */
export interface CanPlaceNodeOptions {
  /**
   * The canonical document state.
   */
  readonly document: IRichDocument;

  /**
   * Either an existing document node being moved, or a component type string being inserted from the palette.
   */
  readonly source: IRichNode | string;

  /**
   * Node ID of the prospective parent container or root.
   */
  readonly targetParentId: NodeId;

  /**
   * Optional named slot within the target parent.
   */
  readonly targetSlot?: string;

  /**
   * Optional index position in the target children or slot array.
   */
  readonly targetIndex?: number;

  /**
   * Optional component registry containing placement schemas.
   */
  readonly registry?: ComponentRegistry;
}

/**
 * Result of placement validation.
 */
export interface PlacementResult {
  /**
   * Whether the placement is permissible.
   */
  readonly allowed: boolean;

  /**
   * Human-readable diagnostic reason if placement is disallowed.
   */
  readonly reason?: string;

  /**
   * Error code identifier for programmatic error handling.
   */
  readonly code?:
    | 'PARENT_NOT_FOUND'
    | 'SELF_PLACEMENT'
    | 'DESCENDANT_CYCLE'
    | 'CANNOT_HAVE_CHILDREN'
    | 'CHILD_TYPE_NOT_ALLOWED'
    | 'PARENT_TYPE_NOT_ALLOWED'
    | 'INVALID_SLOT'
    | 'SLOT_TYPE_NOT_ALLOWED'
    | 'SLOT_MAX_CHILDREN_EXCEEDED';
}

/**
 * Determines whether a node or component type can be placed into a designated parent/slot.
 *
 * @example
 * ```typescript
 * const result = canPlaceNode({
 *   document,
 *   source: 'Button',
 *   targetParentId: 'container-1',
 *   registry,
 * });
 * if (!result.allowed) {
 *   console.warn(result.reason);
 * }
 * ```
 */
export function canPlaceNode(options: CanPlaceNodeOptions): PlacementResult {
  const { document, source, targetParentId, targetSlot, registry } = options;

  // 1. Locate target parent node in document
  const targetParent = findNodeById(document, targetParentId);
  if (!targetParent) {
    return {
      allowed: false,
      reason: `Target parent node "${targetParentId}" does not exist in document.`,
      code: 'PARENT_NOT_FOUND',
    };
  }

  // 2. Extract source node type and existing node (if moving)
  const isExistingNode = typeof source !== 'string';
  const sourceNode: IRichNode | undefined = isExistingNode ? source : undefined;
  const sourceType = isExistingNode ? source.type : source;

  // 3. Cycle & self-placement prevention for existing nodes
  if (sourceNode) {
    // Cannot drop a node inside itself
    if (sourceNode.id === targetParentId) {
      return {
        allowed: false,
        reason: 'Cannot drop a node inside itself.',
        code: 'SELF_PLACEMENT',
      };
    }

    // Cannot drop an ancestor into one of its descendants
    if (isDescendantOf(document, sourceNode.id, targetParentId)) {
      return {
        allowed: false,
        reason: 'Cannot drop a parent node into one of its own descendants.',
        code: 'DESCENDANT_CYCLE',
      };
    }
  }

  // 4. Validate slot constraints (if dropping into a named slot)
  if (targetSlot) {
    if (targetParent.type === 'root') {
      return {
        allowed: false,
        reason: 'Root document node does not contain named slots.',
        code: 'INVALID_SLOT',
      };
    }

    const parentDef = registry?.get(targetParent.type);
    if (parentDef) {
      const slotDef = parentDef.slots?.[targetSlot];
      if (!slotDef) {
        return {
          allowed: false,
          reason: `Component "${targetParent.type}" has no declared slot "${targetSlot}".`,
          code: 'INVALID_SLOT',
        };
      }

      // Check slot allowed types
      if (slotDef.allowedTypes && slotDef.allowedTypes.length > 0) {
        if (!slotDef.allowedTypes.includes(sourceType)) {
          return {
            allowed: false,
            reason: `Slot "${targetSlot}" on "${targetParent.type}" only allows types: ${slotDef.allowedTypes.join(', ')}.`,
            code: 'SLOT_TYPE_NOT_ALLOWED',
          };
        }
      }

      // Check slot maxChildren limit
      if (typeof slotDef.maxChildren === 'number' && slotDef.maxChildren > 0) {
        const currentSlotChildren = targetParent.slots?.[targetSlot] ?? [];
        // If moving an existing child already in this slot, count does not increase
        const alreadyInSlot = sourceNode
          ? currentSlotChildren.some((child) => child.id === sourceNode.id)
          : false;

        if (!alreadyInSlot && currentSlotChildren.length >= slotDef.maxChildren) {
          return {
            allowed: false,
            reason: `Slot "${targetSlot}" has reached its maximum capacity of ${slotDef.maxChildren} children.`,
            code: 'SLOT_MAX_CHILDREN_EXCEEDED',
          };
        }
      }
    }
  } else {
    // 5. Validate standard children placement
    if (targetParent.type !== 'root') {
      const parentDef = registry?.get(targetParent.type);
      if (parentDef) {
        // canHaveChildren rule
        if (parentDef.canHaveChildren === false) {
          return {
            allowed: false,
            reason: `Component "${targetParent.type}" is a leaf component and cannot accept child nodes.`,
            code: 'CANNOT_HAVE_CHILDREN',
          };
        }

        // allowedChildren rule on target parent
        if (parentDef.allowedChildren && parentDef.allowedChildren.length > 0) {
          if (!parentDef.allowedChildren.includes(sourceType)) {
            return {
              allowed: false,
              reason: `Component "${targetParent.type}" does not permit child nodes of type "${sourceType}". Allowed: ${parentDef.allowedChildren.join(', ')}.`,
              code: 'CHILD_TYPE_NOT_ALLOWED',
            };
          }
        }
      }
    }
  }

  // 6. Validate allowedParents rule on source component
  const sourceDef = registry?.get(sourceType);
  if (sourceDef && sourceDef.allowedParents && sourceDef.allowedParents.length > 0) {
    if (!sourceDef.allowedParents.includes(targetParent.type)) {
      return {
        allowed: false,
        reason: `Component "${sourceType}" can only be placed inside: ${sourceDef.allowedParents.join(', ')}. Target is "${targetParent.type}".`,
        code: 'PARENT_TYPE_NOT_ALLOWED',
      };
    }
  }

  return {
    allowed: true,
  };
}
