/**
 * @irich/core
 * Canonical document types, JSON values, and editor interfaces.
 */

import type { ComponentRegistry } from './component';

export type JSONPrimitive = string | number | boolean | null;

export interface JSONObject {
  [key: string]: JSONValue;
}

export type JSONArray = JSONValue[];

export type JSONValue = JSONPrimitive | JSONObject | JSONArray;

/**
 * Unique stable identifier for a node within an iRich document.
 */
export type NodeId = string;

/**
 * An individual node within the iRich document hierarchy.
 */
export interface IRichNode {
  /**
   * Unique and stable identifier.
   */
  readonly id: NodeId;

  /**
   * Component or block type identifier (e.g., 'root', 'Hero', 'Heading', 'Grid').
   */
  readonly type: string;

  /**
   * JSON-serializable component properties.
   */
  readonly props: Record<string, JSONValue>;

  /**
   * Default children for linear/single-zone containers.
   */
  readonly children?: readonly IRichNode[];

  /**
   * Named multi-zone slots for layout containers (e.g., { left: [...], right: [...] }).
   */
  readonly slots?: Readonly<Record<string, readonly IRichNode[]>>;

  /**
   * Non-rendered node metadata (e.g. collapsed, locked, label).
   */
  readonly meta?: Readonly<Record<string, JSONValue>>;
}

/**
 * Canonical JSON-serializable iRich document.
 */
export interface IRichDocument {
  /**
   * Document schema version (SemVer format, e.g. "1.0.0").
   */
  readonly version: string;

  /**
   * Root node of the document hierarchy.
   */
  readonly root: IRichNode;

  /**
   * Document-level metadata (e.g., title, author, description).
   */
  readonly metadata?: Readonly<Record<string, JSONValue>>;
}

/**
 * State snapshot of the editor instance.
 */
export interface EditorState {
  readonly document: IRichDocument;
  readonly selection: NodeId | null;
  readonly hoveredNodeId: NodeId | null;
  readonly canUndo: boolean;
  readonly canRedo: boolean;
}

/**
 * Options for configuring an editor instance.
 */
export interface EditorConfig {
  initialDocument?: IRichDocument;
  initialSelection?: NodeId | null;
  maxHistorySize?: number;
  enableHistory?: boolean;
  registry?: ComponentRegistry;
}

/**
 * Command payload for inserting a node.
 */
export interface InsertNodePayload {
  node: IRichNode;
  parentId?: NodeId;
  slot?: string;
  index?: number;
}

/**
 * Command payload for removing a node.
 */
export interface RemoveNodePayload {
  nodeId: NodeId;
}

/**
 * Command payload for updating node properties and/or metadata.
 */
export interface UpdateNodePayload {
  nodeId: NodeId;
  props?: Record<string, JSONValue>;
  meta?: Record<string, JSONValue>;
}

/**
 * Command payload for moving a node to a new parent, slot, or index.
 */
export interface MoveNodePayload {
  nodeId: NodeId;
  targetParentId: NodeId;
  targetSlot?: string;
  targetIndex?: number;
}

/**
 * Command payload for duplicating a node.
 */
export interface DuplicateNodePayload {
  nodeId: NodeId;
  targetParentId?: NodeId;
  targetSlot?: string;
  targetIndex?: number;
}

/**
 * Public commands interface exposed by the editor instance.
 */
export interface EditorCommands {
  insertNode(payload: InsertNodePayload): NodeId;
  removeNode(nodeId: NodeId): void;
  updateNode(payload: UpdateNodePayload): void;
  moveNode(payload: MoveNodePayload): void;
  duplicateNode(payload: DuplicateNodePayload | NodeId): NodeId;
  selectNode(nodeId: NodeId | null): void;
  hoverNode(nodeId: NodeId | null): void;
  undo(): boolean;
  redo(): boolean;
  batch(callback: () => void): void;
}

/**
 * Map of event names to their respective payload types.
 */
export interface EditorEventMap {
  'document:change': {
    document: IRichDocument;
    previousDocument: IRichDocument;
  };
  'node:insert': {
    node: IRichNode;
    parentId: NodeId;
    slot?: string;
    index: number;
  };
  'node:remove': {
    node: IRichNode;
    parentId: NodeId;
    slot?: string;
    index: number;
  };
  'node:update': {
    nodeId: NodeId;
    previousProps: Record<string, JSONValue>;
    nextProps: Record<string, JSONValue>;
    previousMeta?: Record<string, JSONValue>;
    nextMeta?: Record<string, JSONValue>;
  };
  'node:move': {
    nodeId: NodeId;
    fromParentId: NodeId;
    fromSlot?: string;
    fromIndex: number;
    toParentId: NodeId;
    toSlot?: string;
    toIndex: number;
  };
  'selection:change': {
    selection: NodeId | null;
    previousSelection: NodeId | null;
  };
  'history:undo': {
    document: IRichDocument;
    selection: NodeId | null;
  };
  'history:redo': {
    document: IRichDocument;
    selection: NodeId | null;
  };
}

export type EditorEventListener<E extends keyof EditorEventMap> = (
  payload: EditorEventMap[E],
) => void;
