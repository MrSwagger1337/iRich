/**
 * @irich/core
 * Strong type definitions and schemas for the AI action protocol.
 */

import type { ComponentRegistry } from '../component';
import type { EditorInstance } from '../editor';
import type { IRichDocument, IRichNode, JSONValue, NodeId } from '../types';

/**
 * Action discriminator strings recognized by the AI action engine.
 */
export type AIActionType =
  | 'insertNode'
  | 'updateProps'
  | 'updateMeta'
  | 'removeNode'
  | 'moveNode'
  | 'duplicateNode'
  | 'replaceNode';

/**
 * AI action to insert a new node into the document hierarchy.
 */
export interface InsertNodeAIAction {
  readonly action: 'insertNode';
  readonly parentId?: NodeId;
  readonly slot?: string;
  readonly index?: number;
  readonly node: IRichNode;
}

/**
 * AI action to update properties on an existing node.
 */
export interface UpdatePropsAIAction {
  readonly action: 'updateProps';
  readonly nodeId: NodeId;
  readonly props: Record<string, JSONValue>;
}

/**
 * AI action to update metadata on an existing node.
 */
export interface UpdateMetaAIAction {
  readonly action: 'updateMeta';
  readonly nodeId: NodeId;
  readonly meta: Record<string, JSONValue>;
}

/**
 * AI action to remove an existing node from the document.
 */
export interface RemoveNodeAIAction {
  readonly action: 'removeNode';
  readonly nodeId: NodeId;
}

/**
 * AI action to move a node to a new parent, slot, or index.
 */
export interface MoveNodeAIAction {
  readonly action: 'moveNode';
  readonly nodeId: NodeId;
  readonly targetParentId: NodeId;
  readonly targetSlot?: string;
  readonly targetIndex?: number;
}

/**
 * AI action to duplicate an existing node.
 */
export interface DuplicateNodeAIAction {
  readonly action: 'duplicateNode';
  readonly nodeId: NodeId;
  readonly targetParentId?: NodeId;
  readonly targetSlot?: string;
  readonly targetIndex?: number;
}

/**
 * AI action to replace an existing node in-place with a new node.
 */
export interface ReplaceNodeAIAction {
  readonly action: 'replaceNode';
  readonly nodeId: NodeId;
  readonly node: IRichNode;
}

/**
 * Discriminated union of all supported AI actions.
 */
export type AIAction =
  | InsertNodeAIAction
  | UpdatePropsAIAction
  | UpdateMetaAIAction
  | RemoveNodeAIAction
  | MoveNodeAIAction
  | DuplicateNodeAIAction
  | ReplaceNodeAIAction;

/**
 * Diagnostic error codes emitted during AI action validation.
 */
export type AIValidationErrorCode =
  | 'INVALID_ACTION_PAYLOAD'
  | 'UNRECOGNIZED_ACTION'
  | 'DANGEROUS_PAYLOAD'
  | 'NON_JSON_VALUE'
  | 'PROTOTYPE_POLLUTION'
  | 'NODE_NOT_FOUND'
  | 'PARENT_NOT_FOUND'
  | 'ROOT_MUTATION_FORBIDDEN'
  | 'CYCLIC_MOVE_FORBIDDEN'
  | 'COMPONENT_NOT_FOUND'
  | 'INVALID_COMPONENT_PLACEMENT'
  | 'PROP_VALIDATION_FAILED'
  | 'DUPLICATE_ID';

/**
 * Diagnostic validation error detail.
 */
export interface AIValidationError {
  readonly actionIndex: number;
  readonly action?: string;
  readonly code: AIValidationErrorCode;
  readonly path: string;
  readonly message: string;
}

/**
 * Non-blocking validation warning.
 */
export interface AIValidationWarning {
  readonly actionIndex: number;
  readonly path: string;
  readonly message: string;
}

/**
 * Options for dry-run and pre-flight validation of AI actions.
 */
export interface ValidateAIActionsOptions {
  /**
   * The canonical document against which actions are evaluated.
   */
  readonly document: IRichDocument;

  /**
   * Raw or structured action(s) provided by an AI assistant or upstream payload.
   */
  readonly actions: unknown;

  /**
   * Component registry used to validate component types, slots, and field prop schemas.
   */
  readonly registry?: ComponentRegistry;

  /**
   * When true, enforces strict field prop validation (rejecting undefined props or schema mismatches).
   */
  readonly strictProps?: boolean;

  /**
   * When true, permits component types not found in the component registry. Defaults to false.
   */
  readonly allowUnknownComponents?: boolean;
}

/**
 * Result of AI action validation, including simulation output.
 */
export interface AIValidationResult {
  readonly valid: boolean;
  readonly actions: readonly AIAction[];
  readonly errors: readonly AIValidationError[];
  readonly warnings: readonly AIValidationWarning[];
  readonly simulatedDocument?: IRichDocument;
}

/**
 * Options for applying AI actions to an active editor instance.
 */
export interface ApplyAIActionsOptions {
  /**
   * Target editor instance whose document state will be mutated.
   */
  readonly editor: EditorInstance;

  /**
   * Raw or structured AI action(s).
   */
  readonly actions: unknown;

  /**
   * Optional component registry (defaults to editor's registry if configured).
   */
  readonly registry?: ComponentRegistry;

  /**
   * Whether to validate and simulate actions prior to applying mutations. Defaults to true.
   */
  readonly validateFirst?: boolean;

  /**
   * When true, enforces strict field prop validation during validation.
   */
  readonly strictProps?: boolean;

  /**
   * When true, permits unknown component types. Defaults to false.
   */
  readonly allowUnknownComponents?: boolean;
}

/**
 * Result returned after attempting to apply AI actions.
 */
export interface AIApplyResult {
  readonly success: boolean;
  readonly appliedCount: number;
  readonly errors?: readonly AIValidationError[];
  readonly affectedNodeIds: readonly NodeId[];
}
