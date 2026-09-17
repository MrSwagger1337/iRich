/**
 * @irich/core
 * Core Editor instance, command pipeline, state management, and subscriptions.
 */

import type {
  DuplicateNodePayload,
  EditorCommands,
  EditorConfig,
  EditorEventListener,
  EditorEventMap,
  EditorState,
  InsertNodePayload,
  IRichDocument,
  IRichNode,
  MoveNodePayload,
  NodeId,
  UpdateNodePayload,
} from './types';
import {
  CommandExecutionError,
  DuplicateIdError,
  InvalidMoveError,
  NodeNotFoundError,
  ValidationError,
} from './errors';
import { EventEmitter } from './events';
import {
  cloneNode,
  collectAllNodeIds,
  createDocument,
  findNodeById,
  findParent,
  isDescendantOf,
} from './utils/tree';
import { validateDocument } from './utils/validation';

export interface EditorInstance {
  getState(): EditorState;
  getDocument(): IRichDocument;
  getSelection(): NodeId | null;
  getNode(nodeId: NodeId): IRichNode | undefined;
  commands: EditorCommands;
  on<K extends keyof EditorEventMap>(event: K, listener: EditorEventListener<K>): () => void;
  off<K extends keyof EditorEventMap>(event: K, listener: EditorEventListener<K>): void;
  subscribe(listener: (state: EditorState) => void): () => void;
  subscribeToNode(nodeId: NodeId, listener: (node: IRichNode | undefined) => void): () => void;
  destroy(): void;
}

export class Editor implements EditorInstance {
  private state: EditorState;
  private emitter = new EventEmitter();
  private stateSubscribers = new Set<(state: EditorState) => void>();
  private nodeSubscribers = new Map<NodeId, Set<(node: IRichNode | undefined) => void>>();
  private isBatching = false;
  private pendingDocChange: { previous: IRichDocument; current: IRichDocument } | null = null;

  constructor(config: EditorConfig = {}) {
    const doc = config.initialDocument ?? createDocument();

    const validation = validateDocument(doc);
    if (!validation.valid) {
      throw new ValidationError([...validation.errors]);
    }

    this.state = {
      document: doc,
      selection: config.initialSelection ?? null,
      hoveredNodeId: null,
    };
  }

  public getState(): EditorState {
    return this.state;
  }

  public getDocument(): IRichDocument {
    return this.state.document;
  }

  public getSelection(): NodeId | null {
    return this.state.selection;
  }

  public getNode(nodeId: NodeId): IRichNode | undefined {
    return findNodeById(this.state.document, nodeId);
  }

  public on<K extends keyof EditorEventMap>(
    event: K,
    listener: EditorEventListener<K>,
  ): () => void {
    return this.emitter.on(event, listener);
  }

  public off<K extends keyof EditorEventMap>(event: K, listener: EditorEventListener<K>): void {
    this.emitter.off(event, listener);
  }

  public subscribe(listener: (state: EditorState) => void): () => void {
    this.stateSubscribers.add(listener);
    return () => {
      this.stateSubscribers.delete(listener);
    };
  }

  public subscribeToNode(
    nodeId: NodeId,
    listener: (node: IRichNode | undefined) => void,
  ): () => void {
    if (!this.nodeSubscribers.has(nodeId)) {
      this.nodeSubscribers.set(nodeId, new Set());
    }
    const set = this.nodeSubscribers.get(nodeId)!;
    set.add(listener);

    return () => {
      set.delete(listener);
      if (set.size === 0) {
        this.nodeSubscribers.delete(nodeId);
      }
    };
  }

  public destroy(): void {
    this.emitter.clear();
    this.stateSubscribers.clear();
    this.nodeSubscribers.clear();
  }

  public readonly commands: EditorCommands = {
    insertNode: (payload: InsertNodePayload): NodeId => {
      return this.executeInsertNode(payload);
    },
    removeNode: (nodeId: NodeId): void => {
      this.executeRemoveNode(nodeId);
    },
    updateNode: (payload: UpdateNodePayload): void => {
      this.executeUpdateNode(payload);
    },
    moveNode: (payload: MoveNodePayload): void => {
      this.executeMoveNode(payload);
    },
    duplicateNode: (payload: DuplicateNodePayload | NodeId): NodeId => {
      const normalizedPayload: DuplicateNodePayload =
        typeof payload === 'string' ? { nodeId: payload } : payload;
      return this.executeDuplicateNode(normalizedPayload);
    },
    selectNode: (nodeId: NodeId | null): void => {
      this.executeSelectNode(nodeId);
    },
    hoverNode: (nodeId: NodeId | null): void => {
      this.executeHoverNode(nodeId);
    },
    batch: (callback: () => void): void => {
      this.executeBatch(callback);
    },
  };

  // --- COMMAND IMPLEMENTATIONS ---

  private executeInsertNode(payload: InsertNodePayload): NodeId {
    const nodeToInsert = payload.node;
    if (!nodeToInsert || !nodeToInsert.id || !nodeToInsert.type) {
      throw new CommandExecutionError(
        'Cannot insert invalid node structure.',
        'INVALID_NODE_STRUCTURE',
      );
    }

    const existingIds = collectAllNodeIds(this.state.document);
    const newSubtreeIds = collectAllNodeIds(nodeToInsert);

    for (const id of newSubtreeIds) {
      if (existingIds.has(id)) {
        throw new DuplicateIdError(
          id,
          `Cannot insert node because ID "${id}" already exists in the document.`,
        );
      }
    }

    const parentId = payload.parentId ?? this.state.document.root.id;
    const parentNode = findNodeById(this.state.document, parentId);
    if (!parentNode) {
      throw new NodeNotFoundError(parentId, 'Cannot insert node into non-existent parent.');
    }

    const slotName = payload.slot;
    const prevDoc = this.state.document;

    const newRoot = this.insertChildIntoNode(
      prevDoc.root,
      parentId,
      nodeToInsert,
      slotName,
      payload.index,
    );

    const nextDoc: IRichDocument = {
      ...prevDoc,
      root: newRoot,
    };

    // Calculate actual insertion index for event payload
    const updatedParent = findNodeById(nextDoc, parentId);
    let insertedIndex = 0;
    if (updatedParent) {
      const list = slotName ? updatedParent.slots?.[slotName] : updatedParent.children;
      if (list) {
        insertedIndex = list.findIndex((n) => n.id === nodeToInsert.id);
        if (insertedIndex === -1) insertedIndex = list.length - 1;
      }
    }

    this.updateDocumentState(nextDoc, () => {
      this.emitter.emit('node:insert', {
        node: nodeToInsert,
        parentId,
        slot: slotName,
        index: insertedIndex,
      });
    });

    return nodeToInsert.id;
  }

  private executeRemoveNode(nodeId: NodeId): void {
    if (nodeId === this.state.document.root.id) {
      throw new CommandExecutionError(
        'Cannot remove root document node.',
        'ROOT_DELETION_FORBIDDEN',
      );
    }

    const targetNode = findNodeById(this.state.document, nodeId);
    if (!targetNode) {
      throw new NodeNotFoundError(nodeId, 'Cannot remove non-existent node.');
    }

    const parentLoc = findParent(this.state.document, nodeId);
    if (!parentLoc) {
      throw new CommandExecutionError(
        `Parent of node "${nodeId}" could not be located.`,
        'PARENT_NOT_FOUND',
      );
    }

    const prevDoc = this.state.document;
    const newRoot = this.removeChildFromNode(
      prevDoc.root,
      parentLoc.parent.id,
      nodeId,
      parentLoc.slotName,
    );

    const nextDoc: IRichDocument = {
      ...prevDoc,
      root: newRoot,
    };

    // Deselect if removed node or any of its descendants was selected
    const removedIds = collectAllNodeIds(targetNode);
    let nextSelection = this.state.selection;
    if (nextSelection && removedIds.has(nextSelection)) {
      nextSelection = null;
    }

    this.updateDocumentState(nextDoc, () => {
      this.emitter.emit('node:remove', {
        node: targetNode,
        parentId: parentLoc.parent.id,
        slot: parentLoc.slotName,
        index: parentLoc.index,
      });

      if (nextSelection !== this.state.selection) {
        this.executeSelectNode(nextSelection);
      }
    });
  }

  private executeUpdateNode(payload: UpdateNodePayload): void {
    const targetNode = findNodeById(this.state.document, payload.nodeId);
    if (!targetNode) {
      throw new NodeNotFoundError(payload.nodeId, 'Cannot update non-existent node.');
    }

    const previousProps = targetNode.props;
    const nextProps = payload.props
      ? Object.freeze({ ...previousProps, ...payload.props })
      : previousProps;

    const previousMeta = targetNode.meta;
    const nextMeta = payload.meta
      ? Object.freeze({ ...(previousMeta ?? {}), ...payload.meta })
      : previousMeta;

    const prevDoc = this.state.document;
    const newRoot = this.modifyNodeInTree(prevDoc.root, payload.nodeId, (node) => ({
      ...node,
      props: nextProps,
      ...(nextMeta ? { meta: nextMeta } : {}),
    }));

    const nextDoc: IRichDocument = {
      ...prevDoc,
      root: newRoot,
    };

    this.updateDocumentState(nextDoc, () => {
      this.emitter.emit('node:update', {
        nodeId: payload.nodeId,
        previousProps,
        nextProps,
        previousMeta,
        nextMeta,
      });
      this.notifyNodeSubscribers(payload.nodeId, findNodeById(nextDoc, payload.nodeId));
    });
  }

  private executeMoveNode(payload: MoveNodePayload): void {
    const { nodeId, targetParentId, targetSlot, targetIndex } = payload;

    if (nodeId === this.state.document.root.id) {
      throw new CommandExecutionError('Cannot move root document node.', 'ROOT_MOVE_FORBIDDEN');
    }

    if (nodeId === targetParentId) {
      throw new InvalidMoveError(nodeId, targetParentId, 'Cannot move a node into itself.');
    }

    if (isDescendantOf(this.state.document, nodeId, targetParentId)) {
      throw new InvalidMoveError(
        nodeId,
        targetParentId,
        'Cannot move a parent node into one of its own descendants.',
      );
    }

    const nodeToMove = findNodeById(this.state.document, nodeId);
    if (!nodeToMove) {
      throw new NodeNotFoundError(nodeId, 'Cannot move non-existent source node.');
    }

    const targetParent = findNodeById(this.state.document, targetParentId);
    if (!targetParent) {
      throw new NodeNotFoundError(
        targetParentId,
        'Cannot move node into non-existent target parent.',
      );
    }

    const parentLoc = findParent(this.state.document, nodeId);
    if (!parentLoc) {
      throw new CommandExecutionError(
        `Cannot locate current parent of node "${nodeId}".`,
        'PARENT_NOT_FOUND',
      );
    }

    const fromParentId = parentLoc.parent.id;
    const fromSlot = parentLoc.slotName;
    const fromIndex = parentLoc.index;

    // Remove from source location
    const intermediateRoot = this.removeChildFromNode(
      this.state.document.root,
      fromParentId,
      nodeId,
      fromSlot,
    );

    // Calculate insertion index
    let adjustedIndex = targetIndex;
    if (fromParentId === targetParentId && fromSlot === targetSlot && targetIndex !== undefined) {
      if (fromIndex < targetIndex) {
        adjustedIndex = targetIndex - 1;
      }
    }

    // Insert into destination location
    const finalRoot = this.insertChildIntoNode(
      intermediateRoot,
      targetParentId,
      nodeToMove,
      targetSlot,
      adjustedIndex,
    );

    const prevDoc = this.state.document;
    const nextDoc: IRichDocument = {
      ...prevDoc,
      root: finalRoot,
    };

    // Find actual final index
    const updatedTargetParent = findNodeById(nextDoc, targetParentId);
    let finalIndex = 0;
    if (updatedTargetParent) {
      const list = targetSlot
        ? updatedTargetParent.slots?.[targetSlot]
        : updatedTargetParent.children;
      if (list) {
        finalIndex = list.findIndex((n) => n.id === nodeId);
        if (finalIndex === -1) finalIndex = list.length - 1;
      }
    }

    this.updateDocumentState(nextDoc, () => {
      this.emitter.emit('node:move', {
        nodeId,
        fromParentId,
        fromSlot,
        fromIndex,
        toParentId: targetParentId,
        toSlot: targetSlot,
        toIndex: finalIndex,
      });
      this.notifyNodeSubscribers(nodeId, findNodeById(nextDoc, nodeId));
    });
  }

  private executeDuplicateNode(payload: DuplicateNodePayload): NodeId {
    const { nodeId, targetParentId, targetSlot, targetIndex } = payload;

    if (nodeId === this.state.document.root.id) {
      throw new CommandExecutionError('Cannot duplicate the root node.', 'ROOT_DELETION_FORBIDDEN');
    }

    const originalNode = findNodeById(this.state.document, nodeId);
    if (!originalNode) {
      throw new NodeNotFoundError(nodeId, 'Cannot duplicate non-existent node.');
    }

    const parentLoc = findParent(this.state.document, nodeId);
    if (!parentLoc && !targetParentId) {
      throw new CommandExecutionError(
        `Cannot locate parent for node "${nodeId}".`,
        'PARENT_NOT_FOUND',
      );
    }

    const finalParentId = targetParentId ?? parentLoc!.parent.id;
    const finalSlot = targetSlot ?? parentLoc!.slotName;
    const finalIndex = targetIndex !== undefined ? targetIndex : parentLoc!.index + 1;

    // Deep clone with fresh IDs for the node and all its descendants
    const clonedSubtree = cloneNode(originalNode, true);

    return this.executeInsertNode({
      node: clonedSubtree,
      parentId: finalParentId,
      slot: finalSlot,
      index: finalIndex,
    });
  }

  private executeSelectNode(nodeId: NodeId | null): void {
    if (nodeId !== null) {
      const node = findNodeById(this.state.document, nodeId);
      if (!node) {
        throw new NodeNotFoundError(nodeId, 'Cannot select non-existent node.');
      }
    }

    if (this.state.selection === nodeId) {
      return;
    }

    const previousSelection = this.state.selection;
    this.state = {
      ...this.state,
      selection: nodeId,
    };

    this.emitter.emit('selection:change', {
      selection: nodeId,
      previousSelection,
    });

    this.notifyStateSubscribers();
  }

  private executeHoverNode(nodeId: NodeId | null): void {
    if (this.state.hoveredNodeId === nodeId) {
      return;
    }

    this.state = {
      ...this.state,
      hoveredNodeId: nodeId,
    };

    this.notifyStateSubscribers();
  }

  private executeBatch(callback: () => void): void {
    if (this.isBatching) {
      callback();
      return;
    }

    this.isBatching = true;
    const startDoc = this.state.document;

    try {
      callback();
    } finally {
      this.isBatching = false;
      const finalDoc = this.state.document;
      if (startDoc !== finalDoc) {
        this.emitter.emit('document:change', {
          document: finalDoc,
          previousDocument: startDoc,
        });
        this.notifyStateSubscribers();
      }
    }
  }

  // --- IMMUTABLE TREE TRANSFORM HELPERS ---

  private updateDocumentState(nextDoc: IRichDocument, afterEffects?: () => void): void {
    const prevDoc = this.state.document;
    this.state = {
      ...this.state,
      document: nextDoc,
    };

    if (afterEffects) {
      afterEffects();
    }

    if (this.isBatching) {
      if (!this.pendingDocChange) {
        this.pendingDocChange = { previous: prevDoc, current: nextDoc };
      } else {
        this.pendingDocChange.current = nextDoc;
      }
    } else {
      this.emitter.emit('document:change', {
        document: nextDoc,
        previousDocument: prevDoc,
      });
      this.notifyStateSubscribers();
    }
  }

  private notifyStateSubscribers(): void {
    for (const sub of Array.from(this.stateSubscribers)) {
      try {
        sub(this.state);
      } catch (err) {
        console.error('Error in iRich state subscriber:', err);
      }
    }
  }

  private notifyNodeSubscribers(nodeId: NodeId, node: IRichNode | undefined): void {
    const subscribers = this.nodeSubscribers.get(nodeId);
    if (subscribers) {
      for (const sub of Array.from(subscribers)) {
        try {
          sub(node);
        } catch (err) {
          console.error(`Error in iRich node subscriber for "${nodeId}":`, err);
        }
      }
    }
  }

  private modifyNodeInTree(
    current: IRichNode,
    targetId: NodeId,
    transform: (node: IRichNode) => IRichNode,
  ): IRichNode {
    if (current.id === targetId) {
      return Object.freeze(transform(current));
    }

    let modifiedChildren = current.children;
    let hasChildChange = false;

    if (current.children) {
      const newChildren = current.children.map((child) => {
        const updatedChild = this.modifyNodeInTree(child, targetId, transform);
        if (updatedChild !== child) {
          hasChildChange = true;
        }
        return updatedChild;
      });
      if (hasChildChange) {
        modifiedChildren = Object.freeze(newChildren);
      }
    }

    let modifiedSlots = current.slots;
    let hasSlotChange = false;

    if (current.slots) {
      const newSlots: Record<string, readonly IRichNode[]> = {};
      for (const [slotKey, slotNodes] of Object.entries(current.slots)) {
        let slotModified = false;
        const updatedSlotNodes = slotNodes.map((child) => {
          const updatedChild = this.modifyNodeInTree(child, targetId, transform);
          if (updatedChild !== child) {
            slotModified = true;
            hasSlotChange = true;
          }
          return updatedChild;
        });
        newSlots[slotKey] = slotModified ? Object.freeze(updatedSlotNodes) : slotNodes;
      }
      if (hasSlotChange) {
        modifiedSlots = Object.freeze(newSlots);
      }
    }

    if (!hasChildChange && !hasSlotChange) {
      return current;
    }

    return Object.freeze({
      ...current,
      ...(modifiedChildren ? { children: modifiedChildren } : {}),
      ...(modifiedSlots ? { slots: modifiedSlots } : {}),
    });
  }

  private insertChildIntoNode(
    current: IRichNode,
    parentId: NodeId,
    newNode: IRichNode,
    slotName?: string,
    index?: number,
  ): IRichNode {
    if (current.id === parentId) {
      if (slotName) {
        const currentSlotList = current.slots?.[slotName] ?? [];
        const targetIndex =
          index === undefined || index < 0 || index > currentSlotList.length
            ? currentSlotList.length
            : index;

        const nextSlotList = [
          ...currentSlotList.slice(0, targetIndex),
          newNode,
          ...currentSlotList.slice(targetIndex),
        ];

        const nextSlots = {
          ...(current.slots ?? {}),
          [slotName]: Object.freeze(nextSlotList),
        };

        return Object.freeze({
          ...current,
          slots: Object.freeze(nextSlots),
        });
      } else {
        const currentChildren = current.children ?? [];
        const targetIndex =
          index === undefined || index < 0 || index > currentChildren.length
            ? currentChildren.length
            : index;

        const nextChildren = [
          ...currentChildren.slice(0, targetIndex),
          newNode,
          ...currentChildren.slice(targetIndex),
        ];

        return Object.freeze({
          ...current,
          children: Object.freeze(nextChildren),
        });
      }
    }

    return this.modifyNodeInTree(current, parentId, (node) =>
      this.insertChildIntoNode(node, parentId, newNode, slotName, index),
    );
  }

  private removeChildFromNode(
    current: IRichNode,
    parentId: NodeId,
    targetChildId: NodeId,
    slotName?: string,
  ): IRichNode {
    if (current.id === parentId) {
      if (slotName) {
        const currentSlotList = current.slots?.[slotName] ?? [];
        const nextSlotList = currentSlotList.filter((child) => child.id !== targetChildId);

        const nextSlots = {
          ...(current.slots ?? {}),
          [slotName]: Object.freeze(nextSlotList),
        };

        return Object.freeze({
          ...current,
          slots: Object.freeze(nextSlots),
        });
      } else {
        const currentChildren = current.children ?? [];
        const nextChildren = currentChildren.filter((child) => child.id !== targetChildId);

        return Object.freeze({
          ...current,
          children: Object.freeze(nextChildren),
        });
      }
    }

    return this.modifyNodeInTree(current, parentId, (node) =>
      this.removeChildFromNode(node, parentId, targetChildId, slotName),
    );
  }
}

/**
 * Creates an instance of the iRich Editor.
 */
export function createEditor(config?: EditorConfig): EditorInstance {
  return new Editor(config);
}
