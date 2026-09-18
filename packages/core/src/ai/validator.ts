/**
 * @irich/core
 * AI action schema validator and dry-run document simulation engine.
 */

import { canPlaceNode } from '../component/placement';
import type { ComponentRegistry } from '../component/registry';
import type { IRichDocument, IRichNode, JSONValue, NodeId } from '../types';
import { generateId } from '../utils/id';
import {
  cloneNode,
  collectAllNodeIds,
  createDocument,
  createNode,
  findNodeById,
  findParent,
  isDescendantOf,
} from '../utils/tree';
import { isSafeAIValue } from './security';
import type {
  AIAction,
  AIActionType,
  AIValidationError,
  AIValidationResult,
  AIValidationWarning,
  DuplicateNodeAIAction,
  InsertNodeAIAction,
  MoveNodeAIAction,
  RemoveNodeAIAction,
  ReplaceNodeAIAction,
  UpdateMetaAIAction,
  UpdatePropsAIAction,
  ValidateAIActionsOptions,
} from './types';

const ALLOWED_ACTIONS = new Set<AIActionType>([
  'insertNode',
  'updateProps',
  'updateMeta',
  'removeNode',
  'moveNode',
  'duplicateNode',
  'replaceNode',
]);

/**
 * Validates a single action or array of AI actions against document constraints,
 * component registry schemas, placement rules, and security policies.
 *
 * Performs a dry-run execution on an in-memory document clone to ensure multi-step
 * action sequences resolve deterministically without mutating the source document.
 */
export function validateAIActions(options: ValidateAIActionsOptions): AIValidationResult {
  const {
    document: sourceDoc,
    actions: rawActions,
    registry,
    strictProps = false,
    allowUnknownComponents = false,
  } = options;

  const errors: AIValidationError[] = [];
  const warnings: AIValidationWarning[] = [];
  const validatedActions: AIAction[] = [];

  if (!sourceDoc || typeof sourceDoc !== 'object' || !sourceDoc.root) {
    errors.push({
      actionIndex: -1,
      code: 'INVALID_ACTION_PAYLOAD',
      path: '$',
      message: 'Invalid source document provided for AI validation.',
    });
    return {
      valid: false,
      actions: [],
      errors: Object.freeze(errors),
      warnings: Object.freeze(warnings),
    };
  }

  // Normalize single action object to array
  let actionList: unknown[];
  if (Array.isArray(rawActions)) {
    actionList = rawActions;
  } else if (rawActions && typeof rawActions === 'object') {
    actionList = [rawActions];
  } else {
    errors.push({
      actionIndex: -1,
      code: 'INVALID_ACTION_PAYLOAD',
      path: '$',
      message: 'Actions payload must be an array of action objects or a single action object.',
    });
    return {
      valid: false,
      actions: [],
      errors: Object.freeze(errors),
      warnings: Object.freeze(warnings),
    };
  }

  if (actionList.length === 0) {
    return {
      valid: true,
      actions: [],
      errors: Object.freeze([]),
      warnings: Object.freeze([]),
      simulatedDocument: cloneDocument(sourceDoc),
    };
  }

  // Clone document state for dry-run simulation
  let simDoc: IRichDocument = cloneDocument(sourceDoc);

  for (let idx = 0; idx < actionList.length; idx++) {
    const rawItem = actionList[idx];
    const pathPrefix = `actions[${idx}]`;

    // 1. Security & Prototype Pollution Check
    const securityCheck = isSafeAIValue(rawItem, pathPrefix);
    if (!securityCheck.safe) {
      errors.push({
        actionIndex: idx,
        code: securityCheck.code ?? 'DANGEROUS_PAYLOAD',
        path: securityCheck.path ?? pathPrefix,
        message: securityCheck.reason ?? 'Security check failed.',
      });
      continue;
    }

    if (!rawItem || typeof rawItem !== 'object' || Array.isArray(rawItem)) {
      errors.push({
        actionIndex: idx,
        code: 'INVALID_ACTION_PAYLOAD',
        path: pathPrefix,
        message: 'Action must be a non-null plain object.',
      });
      continue;
    }

    const candidate = rawItem as Record<string, unknown>;
    const actionName = candidate.action as AIActionType;

    if (!actionName || typeof actionName !== 'string' || !ALLOWED_ACTIONS.has(actionName)) {
      errors.push({
        actionIndex: idx,
        code: 'UNRECOGNIZED_ACTION',
        path: `${pathPrefix}.action`,
        message: `Unrecognized action type "${String(candidate.action)}". Allowed actions: ${Array.from(ALLOWED_ACTIONS).join(', ')}.`,
      });
      continue;
    }

    // 2. Validate and simulate specific action
    switch (actionName) {
      case 'insertNode': {
        const validated = validateAndSimulateInsert(
          candidate,
          idx,
          pathPrefix,
          simDoc,
          registry,
          strictProps,
          allowUnknownComponents,
          errors,
        );
        if (validated) {
          simDoc = validated.nextDoc;
          validatedActions.push(validated.action);
        }
        break;
      }

      case 'updateProps': {
        const validated = validateAndSimulateUpdateProps(
          candidate,
          idx,
          pathPrefix,
          simDoc,
          registry,
          strictProps,
          errors,
        );
        if (validated) {
          simDoc = validated.nextDoc;
          validatedActions.push(validated.action);
        }
        break;
      }

      case 'updateMeta': {
        const validated = validateAndSimulateUpdateMeta(candidate, idx, pathPrefix, simDoc, errors);
        if (validated) {
          simDoc = validated.nextDoc;
          validatedActions.push(validated.action);
        }
        break;
      }

      case 'removeNode': {
        const validated = validateAndSimulateRemove(candidate, idx, pathPrefix, simDoc, errors);
        if (validated) {
          simDoc = validated.nextDoc;
          validatedActions.push(validated.action);
        }
        break;
      }

      case 'moveNode': {
        const validated = validateAndSimulateMove(
          candidate,
          idx,
          pathPrefix,
          simDoc,
          registry,
          errors,
        );
        if (validated) {
          simDoc = validated.nextDoc;
          validatedActions.push(validated.action);
        }
        break;
      }

      case 'duplicateNode': {
        const validated = validateAndSimulateDuplicate(candidate, idx, pathPrefix, simDoc, errors);
        if (validated) {
          simDoc = validated.nextDoc;
          validatedActions.push(validated.action);
        }
        break;
      }

      case 'replaceNode': {
        const validated = validateAndSimulateReplace(
          candidate,
          idx,
          pathPrefix,
          simDoc,
          registry,
          strictProps,
          allowUnknownComponents,
          errors,
        );
        if (validated) {
          simDoc = validated.nextDoc;
          validatedActions.push(validated.action);
        }
        break;
      }
    }
  }

  const isValid = errors.length === 0;

  return {
    valid: isValid,
    actions: Object.freeze(validatedActions),
    errors: Object.freeze(errors),
    warnings: Object.freeze(warnings),
    simulatedDocument: isValid ? simDoc : undefined,
  };
}

// --- HELPER SIMULATION & VALIDATION FUNCTIONS ---

function cloneDocument(doc: IRichDocument): IRichDocument {
  return createDocument({
    version: doc.version,
    root: cloneNode(doc.root, false),
    metadata: doc.metadata ? { ...doc.metadata } : undefined,
  });
}

function validateAndSimulateInsert(
  raw: Record<string, unknown>,
  actionIndex: number,
  path: string,
  doc: IRichDocument,
  registry?: ComponentRegistry,
  strictProps?: boolean,
  allowUnknownComponents?: boolean,
  errors: AIValidationError[] = [],
): { nextDoc: IRichDocument; action: InsertNodeAIAction } | null {
  const node = raw.node as Partial<IRichNode>;

  if (!node || typeof node !== 'object' || Array.isArray(node)) {
    errors.push({
      actionIndex,
      action: 'insertNode',
      code: 'INVALID_ACTION_PAYLOAD',
      path: `${path}.node`,
      message: 'insertNode requires a valid "node" object.',
    });
    return null;
  }

  if (!node.type || typeof node.type !== 'string' || !node.type.trim()) {
    errors.push({
      actionIndex,
      action: 'insertNode',
      code: 'INVALID_ACTION_PAYLOAD',
      path: `${path}.node.type`,
      message: 'Node must have a non-empty string "type".',
    });
    return null;
  }

  const targetParentId = (raw.parentId as string) ?? doc.root.id;
  const targetParent = findNodeById(doc, targetParentId);
  if (!targetParent) {
    errors.push({
      actionIndex,
      action: 'insertNode',
      code: 'PARENT_NOT_FOUND',
      path: `${path}.parentId`,
      message: `Target parent node "${targetParentId}" not found in document.`,
    });
    return null;
  }

  // Component registry check
  if (registry && node.type !== 'root' && !allowUnknownComponents && !registry.has(node.type)) {
    errors.push({
      actionIndex,
      action: 'insertNode',
      code: 'COMPONENT_NOT_FOUND',
      path: `${path}.node.type`,
      message: `Component type "${node.type}" is not registered in the component registry.`,
    });
    return null;
  }

  const slot = typeof raw.slot === 'string' ? raw.slot : undefined;
  const index = typeof raw.index === 'number' ? raw.index : undefined;

  // Placement check
  if (registry) {
    const placement = canPlaceNode({
      document: doc,
      source: node.type,
      targetParentId,
      targetSlot: slot,
      registry,
    });

    if (!placement.allowed) {
      errors.push({
        actionIndex,
        action: 'insertNode',
        code: 'INVALID_COMPONENT_PLACEMENT',
        path: `${path}`,
        message: placement.reason ?? 'Placement rule violated.',
      });
      return null;
    }
  }

  // Validate props if registry is available
  const props = (node.props as Record<string, JSONValue>) ?? {};
  if (registry && registry.has(node.type)) {
    const propValidation = registry.validateProps(node.type, props);
    if (!propValidation.valid) {
      for (const propErr of propValidation.errors) {
        errors.push({
          actionIndex,
          action: 'insertNode',
          code: 'PROP_VALIDATION_FAILED',
          path: `${path}.node.props`,
          message: propErr,
        });
      }
      if (strictProps || !propValidation.valid) {
        return null;
      }
    }
  }

  // Build sanitized node tree
  const sanitizedNode = buildSanitizedNodeTree(node, doc, errors, actionIndex, `${path}.node`);
  if (!sanitizedNode) {
    return null;
  }

  // Simulate insertion in document
  const nextDoc = insertNodeInDocTree(doc, sanitizedNode, targetParentId, slot, index);

  const action: InsertNodeAIAction = {
    action: 'insertNode',
    ...(raw.parentId ? { parentId: targetParentId } : {}),
    ...(slot ? { slot } : {}),
    ...(index !== undefined ? { index } : {}),
    node: sanitizedNode,
  };

  return { nextDoc, action };
}

function validateAndSimulateUpdateProps(
  raw: Record<string, unknown>,
  actionIndex: number,
  path: string,
  doc: IRichDocument,
  registry?: ComponentRegistry,
  strictProps?: boolean,
  errors: AIValidationError[] = [],
): { nextDoc: IRichDocument; action: UpdatePropsAIAction } | null {
  const nodeId = raw.nodeId as string;
  if (!nodeId || typeof nodeId !== 'string') {
    errors.push({
      actionIndex,
      action: 'updateProps',
      code: 'INVALID_ACTION_PAYLOAD',
      path: `${path}.nodeId`,
      message: 'updateProps requires a valid string "nodeId".',
    });
    return null;
  }

  const targetNode = findNodeById(doc, nodeId);
  if (!targetNode) {
    errors.push({
      actionIndex,
      action: 'updateProps',
      code: 'NODE_NOT_FOUND',
      path: `${path}.nodeId`,
      message: `Node "${nodeId}" not found in document.`,
    });
    return null;
  }

  if (!raw.props || typeof raw.props !== 'object' || Array.isArray(raw.props)) {
    errors.push({
      actionIndex,
      action: 'updateProps',
      code: 'INVALID_ACTION_PAYLOAD',
      path: `${path}.props`,
      message: 'updateProps requires a valid "props" record object.',
    });
    return null;
  }

  const newProps = raw.props as Record<string, JSONValue>;
  const mergedProps = { ...targetNode.props, ...newProps };

  if (registry && registry.has(targetNode.type)) {
    const propValidation = registry.validateProps(targetNode.type, mergedProps);
    if (!propValidation.valid) {
      for (const propErr of propValidation.errors) {
        errors.push({
          actionIndex,
          action: 'updateProps',
          code: 'PROP_VALIDATION_FAILED',
          path: `${path}.props`,
          message: propErr,
        });
      }
      if (strictProps || !propValidation.valid) {
        return null;
      }
    }
  }

  const nextDoc = updateNodeInDocTree(doc, nodeId, (n) => ({
    ...n,
    props: Object.freeze({ ...n.props, ...newProps }),
  }));

  const action: UpdatePropsAIAction = {
    action: 'updateProps',
    nodeId,
    props: Object.freeze({ ...newProps }),
  };

  return { nextDoc, action };
}

function validateAndSimulateUpdateMeta(
  raw: Record<string, unknown>,
  actionIndex: number,
  path: string,
  doc: IRichDocument,
  errors: AIValidationError[] = [],
): { nextDoc: IRichDocument; action: UpdateMetaAIAction } | null {
  const nodeId = raw.nodeId as string;
  if (!nodeId || typeof nodeId !== 'string') {
    errors.push({
      actionIndex,
      action: 'updateMeta',
      code: 'INVALID_ACTION_PAYLOAD',
      path: `${path}.nodeId`,
      message: 'updateMeta requires a valid string "nodeId".',
    });
    return null;
  }

  const targetNode = findNodeById(doc, nodeId);
  if (!targetNode) {
    errors.push({
      actionIndex,
      action: 'updateMeta',
      code: 'NODE_NOT_FOUND',
      path: `${path}.nodeId`,
      message: `Node "${nodeId}" not found in document.`,
    });
    return null;
  }

  if (!raw.meta || typeof raw.meta !== 'object' || Array.isArray(raw.meta)) {
    errors.push({
      actionIndex,
      action: 'updateMeta',
      code: 'INVALID_ACTION_PAYLOAD',
      path: `${path}.meta`,
      message: 'updateMeta requires a valid "meta" record object.',
    });
    return null;
  }

  const newMeta = raw.meta as Record<string, JSONValue>;

  const nextDoc = updateNodeInDocTree(doc, nodeId, (n) => ({
    ...n,
    meta: Object.freeze({ ...(n.meta ?? {}), ...newMeta }),
  }));

  const action: UpdateMetaAIAction = {
    action: 'updateMeta',
    nodeId,
    meta: Object.freeze({ ...newMeta }),
  };

  return { nextDoc, action };
}

function validateAndSimulateRemove(
  raw: Record<string, unknown>,
  actionIndex: number,
  path: string,
  doc: IRichDocument,
  errors: AIValidationError[] = [],
): { nextDoc: IRichDocument; action: RemoveNodeAIAction } | null {
  const nodeId = raw.nodeId as string;
  if (!nodeId || typeof nodeId !== 'string') {
    errors.push({
      actionIndex,
      action: 'removeNode',
      code: 'INVALID_ACTION_PAYLOAD',
      path: `${path}.nodeId`,
      message: 'removeNode requires a valid string "nodeId".',
    });
    return null;
  }

  if (nodeId === doc.root.id) {
    errors.push({
      actionIndex,
      action: 'removeNode',
      code: 'ROOT_MUTATION_FORBIDDEN',
      path: `${path}.nodeId`,
      message: 'Cannot remove the root document node.',
    });
    return null;
  }

  const targetNode = findNodeById(doc, nodeId);
  if (!targetNode) {
    errors.push({
      actionIndex,
      action: 'removeNode',
      code: 'NODE_NOT_FOUND',
      path: `${path}.nodeId`,
      message: `Node "${nodeId}" not found in document.`,
    });
    return null;
  }

  const nextDoc = removeNodeFromDocTree(doc, nodeId);

  const action: RemoveNodeAIAction = {
    action: 'removeNode',
    nodeId,
  };

  return { nextDoc, action };
}

function validateAndSimulateMove(
  raw: Record<string, unknown>,
  actionIndex: number,
  path: string,
  doc: IRichDocument,
  registry?: ComponentRegistry,
  errors: AIValidationError[] = [],
): { nextDoc: IRichDocument; action: MoveNodeAIAction } | null {
  const nodeId = raw.nodeId as string;
  const targetParentId = raw.targetParentId as string;

  if (!nodeId || typeof nodeId !== 'string') {
    errors.push({
      actionIndex,
      action: 'moveNode',
      code: 'INVALID_ACTION_PAYLOAD',
      path: `${path}.nodeId`,
      message: 'moveNode requires a valid string "nodeId".',
    });
    return null;
  }

  if (!targetParentId || typeof targetParentId !== 'string') {
    errors.push({
      actionIndex,
      action: 'moveNode',
      code: 'INVALID_ACTION_PAYLOAD',
      path: `${path}.targetParentId`,
      message: 'moveNode requires a valid string "targetParentId".',
    });
    return null;
  }

  if (nodeId === doc.root.id) {
    errors.push({
      actionIndex,
      action: 'moveNode',
      code: 'ROOT_MUTATION_FORBIDDEN',
      path: `${path}.nodeId`,
      message: 'Cannot move the root document node.',
    });
    return null;
  }

  const sourceNode = findNodeById(doc, nodeId);
  if (!sourceNode) {
    errors.push({
      actionIndex,
      action: 'moveNode',
      code: 'NODE_NOT_FOUND',
      path: `${path}.nodeId`,
      message: `Source node "${nodeId}" not found in document.`,
    });
    return null;
  }

  const targetParent = findNodeById(doc, targetParentId);
  if (!targetParent) {
    errors.push({
      actionIndex,
      action: 'moveNode',
      code: 'PARENT_NOT_FOUND',
      path: `${path}.targetParentId`,
      message: `Target parent node "${targetParentId}" not found in document.`,
    });
    return null;
  }

  if (nodeId === targetParentId) {
    errors.push({
      actionIndex,
      action: 'moveNode',
      code: 'CYCLIC_MOVE_FORBIDDEN',
      path: `${path}.targetParentId`,
      message: 'Cannot move a node into itself.',
    });
    return null;
  }

  if (isDescendantOf(doc, nodeId, targetParentId)) {
    errors.push({
      actionIndex,
      action: 'moveNode',
      code: 'CYCLIC_MOVE_FORBIDDEN',
      path: `${path}.targetParentId`,
      message: 'Cannot move a parent node into one of its own descendants.',
    });
    return null;
  }

  const targetSlot = typeof raw.targetSlot === 'string' ? raw.targetSlot : undefined;
  const targetIndex = typeof raw.targetIndex === 'number' ? raw.targetIndex : undefined;

  if (registry) {
    const placement = canPlaceNode({
      document: doc,
      source: sourceNode,
      targetParentId,
      targetSlot,
      registry,
    });

    if (!placement.allowed) {
      errors.push({
        actionIndex,
        action: 'moveNode',
        code: 'INVALID_COMPONENT_PLACEMENT',
        path,
        message: placement.reason ?? 'Placement rule violated during move.',
      });
      return null;
    }
  }

  // Move node in tree
  const withoutSourceDoc = removeNodeFromDocTree(doc, nodeId);
  const nextDoc = insertNodeInDocTree(
    withoutSourceDoc,
    sourceNode,
    targetParentId,
    targetSlot,
    targetIndex,
  );

  const action: MoveNodeAIAction = {
    action: 'moveNode',
    nodeId,
    targetParentId,
    ...(targetSlot ? { targetSlot } : {}),
    ...(targetIndex !== undefined ? { targetIndex } : {}),
  };

  return { nextDoc, action };
}

function validateAndSimulateDuplicate(
  raw: Record<string, unknown>,
  actionIndex: number,
  path: string,
  doc: IRichDocument,
  errors: AIValidationError[] = [],
): { nextDoc: IRichDocument; action: DuplicateNodeAIAction } | null {
  const nodeId = raw.nodeId as string;
  if (!nodeId || typeof nodeId !== 'string') {
    errors.push({
      actionIndex,
      action: 'duplicateNode',
      code: 'INVALID_ACTION_PAYLOAD',
      path: `${path}.nodeId`,
      message: 'duplicateNode requires a valid string "nodeId".',
    });
    return null;
  }

  if (nodeId === doc.root.id) {
    errors.push({
      actionIndex,
      action: 'duplicateNode',
      code: 'ROOT_MUTATION_FORBIDDEN',
      path: `${path}.nodeId`,
      message: 'Cannot duplicate the root document node.',
    });
    return null;
  }

  const sourceNode = findNodeById(doc, nodeId);
  if (!sourceNode) {
    errors.push({
      actionIndex,
      action: 'duplicateNode',
      code: 'NODE_NOT_FOUND',
      path: `${path}.nodeId`,
      message: `Node "${nodeId}" not found in document.`,
    });
    return null;
  }

  const parentLoc = findParent(doc, nodeId);
  const targetParentId = (raw.targetParentId as string) ?? parentLoc?.parent.id ?? doc.root.id;
  const targetSlot = (raw.targetSlot as string) ?? parentLoc?.slotName;
  const targetIndex =
    typeof raw.targetIndex === 'number'
      ? raw.targetIndex
      : parentLoc
        ? parentLoc.index + 1
        : undefined;

  const clonedSubtree = cloneNode(sourceNode, true);
  const nextDoc = insertNodeInDocTree(
    doc,
    clonedSubtree,
    targetParentId,
    targetSlot,
    targetIndex,
  );

  const action: DuplicateNodeAIAction = {
    action: 'duplicateNode',
    nodeId,
    ...(raw.targetParentId ? { targetParentId } : {}),
    ...(targetSlot ? { targetSlot } : {}),
    ...(targetIndex !== undefined ? { targetIndex } : {}),
  };

  return { nextDoc, action };
}

function validateAndSimulateReplace(
  raw: Record<string, unknown>,
  actionIndex: number,
  path: string,
  doc: IRichDocument,
  registry?: ComponentRegistry,
  strictProps?: boolean,
  allowUnknownComponents?: boolean,
  errors: AIValidationError[] = [],
): { nextDoc: IRichDocument; action: ReplaceNodeAIAction } | null {
  const nodeId = raw.nodeId as string;
  if (!nodeId || typeof nodeId !== 'string') {
    errors.push({
      actionIndex,
      action: 'replaceNode',
      code: 'INVALID_ACTION_PAYLOAD',
      path: `${path}.nodeId`,
      message: 'replaceNode requires a valid string "nodeId".',
    });
    return null;
  }

  if (nodeId === doc.root.id) {
    errors.push({
      actionIndex,
      action: 'replaceNode',
      code: 'ROOT_MUTATION_FORBIDDEN',
      path: `${path}.nodeId`,
      message: 'Cannot replace the root document node.',
    });
    return null;
  }

  const existingNode = findNodeById(doc, nodeId);
  if (!existingNode) {
    errors.push({
      actionIndex,
      action: 'replaceNode',
      code: 'NODE_NOT_FOUND',
      path: `${path}.nodeId`,
      message: `Node "${nodeId}" not found in document.`,
    });
    return null;
  }

  const parentLoc = findParent(doc, nodeId);
  if (!parentLoc) {
    errors.push({
      actionIndex,
      action: 'replaceNode',
      code: 'PARENT_NOT_FOUND',
      path: `${path}.nodeId`,
      message: `Parent for node "${nodeId}" could not be located.`,
    });
    return null;
  }

  const newNodeRaw = raw.node as Partial<IRichNode>;
  if (!newNodeRaw || typeof newNodeRaw !== 'object' || Array.isArray(newNodeRaw)) {
    errors.push({
      actionIndex,
      action: 'replaceNode',
      code: 'INVALID_ACTION_PAYLOAD',
      path: `${path}.node`,
      message: 'replaceNode requires a valid "node" object.',
    });
    return null;
  }

  if (!newNodeRaw.type || typeof newNodeRaw.type !== 'string' || !newNodeRaw.type.trim()) {
    errors.push({
      actionIndex,
      action: 'replaceNode',
      code: 'INVALID_ACTION_PAYLOAD',
      path: `${path}.node.type`,
      message: 'Replacement node must have a non-empty string "type".',
    });
    return null;
  }

  if (registry && !allowUnknownComponents && !registry.has(newNodeRaw.type)) {
    errors.push({
      actionIndex,
      action: 'replaceNode',
      code: 'COMPONENT_NOT_FOUND',
      path: `${path}.node.type`,
      message: `Component type "${newNodeRaw.type}" is not registered.`,
    });
    return null;
  }

  // Placement check against parent
  if (registry) {
    const placement = canPlaceNode({
      document: doc,
      source: newNodeRaw.type,
      targetParentId: parentLoc.parent.id,
      targetSlot: parentLoc.slotName,
      registry,
    });

    if (!placement.allowed) {
      errors.push({
        actionIndex,
        action: 'replaceNode',
        code: 'INVALID_COMPONENT_PLACEMENT',
        path: `${path}.node`,
        message: placement.reason ?? 'Placement rule violated for replacement node.',
      });
      return null;
    }
  }

  // Validate props if registry is available
  const props = (newNodeRaw.props as Record<string, JSONValue>) ?? {};
  if (registry && registry.has(newNodeRaw.type)) {
    const propValidation = registry.validateProps(newNodeRaw.type, props);
    if (!propValidation.valid) {
      for (const propErr of propValidation.errors) {
        errors.push({
          actionIndex,
          action: 'replaceNode',
          code: 'PROP_VALIDATION_FAILED',
          path: `${path}.node.props`,
          message: propErr,
        });
      }
      if (strictProps || !propValidation.valid) {
        return null;
      }
    }
  }

  const sanitizedNode = buildSanitizedNodeTree(
    newNodeRaw,
    doc,
    errors,
    actionIndex,
    `${path}.node`,
  );
  if (!sanitizedNode) {
    return null;
  }

  // Simulate replacement by removing old and inserting new at same location
  const withoutOld = removeNodeFromDocTree(doc, nodeId);
  const nextDoc = insertNodeInDocTree(
    withoutOld,
    sanitizedNode,
    parentLoc.parent.id,
    parentLoc.slotName,
    parentLoc.index,
  );

  const action: ReplaceNodeAIAction = {
    action: 'replaceNode',
    nodeId,
    node: sanitizedNode,
  };

  return { nextDoc, action };
}

// --- TREE SANITIZATION & SIMULATION UTILITIES ---

function buildSanitizedNodeTree(
  candidate: Partial<IRichNode>,
  existingDoc: IRichDocument,
  errors: AIValidationError[],
  actionIndex: number,
  path: string,
): IRichNode | null {
  const existingIds = collectAllNodeIds(existingDoc);
  const type = candidate.type!;
  let id = candidate.id;

  if (!id || typeof id !== 'string' || !id.trim()) {
    id = generateId(type.toLowerCase().replace(/[^a-z0-9]/g, '') || 'node');
  } else if (existingIds.has(id)) {
    errors.push({
      actionIndex,
      code: 'DUPLICATE_ID',
      path: `${path}.id`,
      message: `NodeId "${id}" already exists in the document tree.`,
    });
    return null;
  }

  const props = (candidate.props && typeof candidate.props === 'object' && !Array.isArray(candidate.props))
    ? { ...candidate.props }
    : {};

  const meta = (candidate.meta && typeof candidate.meta === 'object' && !Array.isArray(candidate.meta))
    ? { ...candidate.meta }
    : undefined;

  let children: IRichNode[] | undefined;
  if (Array.isArray(candidate.children)) {
    children = [];
    for (let i = 0; i < candidate.children.length; i++) {
      const child = buildSanitizedNodeTree(
        candidate.children[i],
        existingDoc,
        errors,
        actionIndex,
        `${path}.children[${i}]`,
      );
      if (!child) return null;
      children.push(child);
    }
  }

  let slots: Record<string, IRichNode[]> | undefined;
  if (candidate.slots && typeof candidate.slots === 'object' && !Array.isArray(candidate.slots)) {
    slots = {};
    for (const [slotKey, slotNodes] of Object.entries(candidate.slots)) {
      if (Array.isArray(slotNodes)) {
        slots[slotKey] = [];
        for (let i = 0; i < slotNodes.length; i++) {
          const slotChild = buildSanitizedNodeTree(
            slotNodes[i],
            existingDoc,
            errors,
            actionIndex,
            `${path}.slots.${slotKey}[${i}]`,
          );
          if (!slotChild) return null;
          slots[slotKey].push(slotChild);
        }
      }
    }
  }

  return createNode({
    id,
    type,
    props,
    ...(children ? { children } : {}),
    ...(slots ? { slots } : {}),
    ...(meta ? { meta } : {}),
  });
}

function insertNodeInDocTree(
  doc: IRichDocument,
  nodeToInsert: IRichNode,
  targetParentId: NodeId,
  slot?: string,
  index?: number,
): IRichDocument {
  function insertInNode(current: IRichNode): IRichNode {
    if (current.id === targetParentId) {
      if (slot) {
        const currentSlots = current.slots ?? {};
        const currentSlotList = currentSlots[slot] ?? [];
        const nextSlotList = [...currentSlotList];
        const insertIdx = index !== undefined && index >= 0 && index <= nextSlotList.length
          ? index
          : nextSlotList.length;
        nextSlotList.splice(insertIdx, 0, nodeToInsert);

        return {
          ...current,
          slots: Object.freeze({
            ...currentSlots,
            [slot]: Object.freeze(nextSlotList),
          }),
        };
      }

      const currentChildren = current.children ?? [];
      const nextChildren = [...currentChildren];
      const insertIdx = index !== undefined && index >= 0 && index <= nextChildren.length
        ? index
        : nextChildren.length;
      nextChildren.splice(insertIdx, 0, nodeToInsert);

      return {
        ...current,
        children: Object.freeze(nextChildren),
      };
    }

    let modified = false;

    let nextChildren = current.children;
    if (current.children) {
      const updated = current.children.map((child) => {
        const res = insertInNode(child);
        if (res !== child) modified = true;
        return res;
      });
      if (modified) {
        nextChildren = Object.freeze(updated);
      }
    }

    let nextSlots = current.slots;
    if (current.slots) {
      const updatedSlots: Record<string, readonly IRichNode[]> = {};
      let slotModified = false;
      for (const [k, v] of Object.entries(current.slots)) {
        const updatedList = v.map((child) => {
          const res = insertInNode(child);
          if (res !== child) slotModified = true;
          return res;
        });
        updatedSlots[k] = slotModified ? Object.freeze(updatedList) : v;
      }
      if (slotModified) {
        nextSlots = Object.freeze(updatedSlots);
        modified = true;
      }
    }

    if (!modified) {
      return current;
    }

    return {
      ...current,
      ...(nextChildren !== undefined ? { children: nextChildren } : {}),
      ...(nextSlots !== undefined ? { slots: nextSlots } : {}),
    };
  }

  return {
    ...doc,
    root: insertInNode(doc.root),
  };
}

function updateNodeInDocTree(
  doc: IRichDocument,
  targetId: NodeId,
  updater: (node: IRichNode) => IRichNode,
): IRichDocument {
  function updateInNode(current: IRichNode): IRichNode {
    if (current.id === targetId) {
      return updater(current);
    }

    let modified = false;

    let nextChildren = current.children;
    if (current.children) {
      const updated = current.children.map((child) => {
        const res = updateInNode(child);
        if (res !== child) modified = true;
        return res;
      });
      if (modified) {
        nextChildren = Object.freeze(updated);
      }
    }

    let nextSlots = current.slots;
    if (current.slots) {
      const updatedSlots: Record<string, readonly IRichNode[]> = {};
      let slotModified = false;
      for (const [k, v] of Object.entries(current.slots)) {
        const updatedList = v.map((child) => {
          const res = updateInNode(child);
          if (res !== child) slotModified = true;
          return res;
        });
        updatedSlots[k] = slotModified ? Object.freeze(updatedList) : v;
      }
      if (slotModified) {
        nextSlots = Object.freeze(updatedSlots);
        modified = true;
      }
    }

    if (!modified) {
      return current;
    }

    return {
      ...current,
      ...(nextChildren !== undefined ? { children: nextChildren } : {}),
      ...(nextSlots !== undefined ? { slots: nextSlots } : {}),
    };
  }

  return {
    ...doc,
    root: updateInNode(doc.root),
  };
}

function removeNodeFromDocTree(doc: IRichDocument, targetId: NodeId): IRichDocument {
  function removeInNode(current: IRichNode): IRichNode {
    let modified = false;

    let nextChildren = current.children;
    if (current.children) {
      if (current.children.some((c) => c.id === targetId)) {
        nextChildren = Object.freeze(current.children.filter((c) => c.id !== targetId));
        modified = true;
      } else {
        const updated = current.children.map((child) => {
          const res = removeInNode(child);
          if (res !== child) modified = true;
          return res;
        });
        if (modified) {
          nextChildren = Object.freeze(updated);
        }
      }
    }

    let nextSlots = current.slots;
    if (current.slots) {
      const updatedSlots: Record<string, readonly IRichNode[]> = {};
      let slotModified = false;
      for (const [k, v] of Object.entries(current.slots)) {
        if (v.some((c) => c.id === targetId)) {
          updatedSlots[k] = Object.freeze(v.filter((c) => c.id !== targetId));
          slotModified = true;
        } else {
          const updatedList = v.map((child) => {
            const res = removeInNode(child);
            if (res !== child) slotModified = true;
            return res;
          });
          updatedSlots[k] = slotModified ? Object.freeze(updatedList) : v;
        }
      }
      if (slotModified) {
        nextSlots = Object.freeze(updatedSlots);
        modified = true;
      }
    }

    if (!modified) {
      return current;
    }

    return {
      ...current,
      ...(nextChildren !== undefined ? { children: nextChildren } : {}),
      ...(nextSlots !== undefined ? { slots: nextSlots } : {}),
    };
  }

  return {
    ...doc,
    root: removeInNode(doc.root),
  };
}
