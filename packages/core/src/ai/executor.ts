/**
 * @irich/core
 * AI action execution engine.
 * Dispatches validated actions through standard editor commands wrapped in atomic batch transactions.
 */

import type { NodeId } from '../types';
import { findParent } from '../utils/tree';
import type { AIApplyResult, ApplyAIActionsOptions } from './types';
import { validateAIActions } from './validator';

/**
 * Applies a single action or batch of AI actions to an active editor instance.
 *
 * Pre-validates all actions by default, ensuring atomicity. If validation succeeds,
 * mutations are executed inside `editor.commands.batch()` to form a single cohesive
 * undoable transaction in history.
 */
export function applyAIActions(options: ApplyAIActionsOptions): AIApplyResult {
  const {
    editor,
    actions: rawActions,
    registry = editor.getRegistry(),
    validateFirst = true,
    strictProps = false,
    allowUnknownComponents = false,
  } = options;

  if (!editor) {
    return {
      success: false,
      appliedCount: 0,
      errors: [
        {
          actionIndex: -1,
          code: 'INVALID_ACTION_PAYLOAD',
          path: '$',
          message: 'Editor instance is required to apply AI actions.',
        },
      ],
      affectedNodeIds: [],
    };
  }

  // 1. Pre-flight dry-run validation
  if (validateFirst) {
    const validation = validateAIActions({
      document: editor.getDocument(),
      actions: rawActions,
      registry,
      strictProps,
      allowUnknownComponents,
    });

    if (!validation.valid) {
      return {
        success: false,
        appliedCount: 0,
        errors: validation.errors,
        affectedNodeIds: [],
      };
    }

    const actionsToApply = validation.actions;
    if (actionsToApply.length === 0) {
      return {
        success: true,
        appliedCount: 0,
        affectedNodeIds: [],
      };
    }

    const affectedNodeIds: NodeId[] = [];

    // 2. Atomic batch transaction execution
    editor.commands.batch(() => {
      for (const action of actionsToApply) {
        switch (action.action) {
          case 'insertNode': {
            const newId = editor.commands.insertNode({
              node: action.node,
              parentId: action.parentId,
              slot: action.slot,
              index: action.index,
            });
            affectedNodeIds.push(newId);
            break;
          }

          case 'updateProps': {
            editor.commands.updateNode({
              nodeId: action.nodeId,
              props: action.props,
            });
            affectedNodeIds.push(action.nodeId);
            break;
          }

          case 'updateMeta': {
            editor.commands.updateNode({
              nodeId: action.nodeId,
              meta: action.meta,
            });
            affectedNodeIds.push(action.nodeId);
            break;
          }

          case 'removeNode': {
            editor.commands.removeNode(action.nodeId);
            affectedNodeIds.push(action.nodeId);
            break;
          }

          case 'moveNode': {
            editor.commands.moveNode({
              nodeId: action.nodeId,
              targetParentId: action.targetParentId,
              targetSlot: action.targetSlot,
              targetIndex: action.targetIndex,
            });
            affectedNodeIds.push(action.nodeId);
            break;
          }

          case 'duplicateNode': {
            const duplicatedId = editor.commands.duplicateNode({
              nodeId: action.nodeId,
              targetParentId: action.targetParentId,
              targetSlot: action.targetSlot,
              targetIndex: action.targetIndex,
            });
            affectedNodeIds.push(duplicatedId);
            break;
          }

          case 'replaceNode': {
            const parentLoc = findParent(editor.getDocument(), action.nodeId);
            if (parentLoc) {
              const { index, slotName } = parentLoc;
              const parentId = parentLoc.parent.id;
              editor.commands.removeNode(action.nodeId);
              const replacedId = editor.commands.insertNode({
                node: action.node,
                parentId,
                slot: slotName,
                index,
              });
              affectedNodeIds.push(replacedId);
            }
            break;
          }
        }
      }
    });

    return {
      success: true,
      appliedCount: actionsToApply.length,
      affectedNodeIds: Object.freeze(affectedNodeIds),
    };
  }

  // If validateFirst is explicitly false, apply raw actions assuming caller pre-validated
  const list = Array.isArray(rawActions) ? rawActions : [rawActions];
  const affectedNodeIds: NodeId[] = [];

  editor.commands.batch(() => {
    for (const raw of list) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const act = raw as any;
      if (act.action === 'insertNode') {
        affectedNodeIds.push(editor.commands.insertNode(act));
      } else if (act.action === 'updateProps') {
        editor.commands.updateNode({ nodeId: act.nodeId, props: act.props });
        affectedNodeIds.push(act.nodeId);
      } else if (act.action === 'updateMeta') {
        editor.commands.updateNode({ nodeId: act.nodeId, meta: act.meta });
        affectedNodeIds.push(act.nodeId);
      } else if (act.action === 'removeNode') {
        editor.commands.removeNode(act.nodeId);
        affectedNodeIds.push(act.nodeId);
      } else if (act.action === 'moveNode') {
        editor.commands.moveNode(act);
        affectedNodeIds.push(act.nodeId);
      } else if (act.action === 'duplicateNode') {
        affectedNodeIds.push(editor.commands.duplicateNode(act));
      }
    }
  });

  return {
    success: true,
    appliedCount: list.length,
    affectedNodeIds: Object.freeze(affectedNodeIds),
  };
}
