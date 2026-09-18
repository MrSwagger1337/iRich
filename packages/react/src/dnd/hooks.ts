/**
 * @irich/react
 * Reusable Drag and Drop hooks for palette items, canvas nodes, and container droppables.
 */

import { createContext, useContext } from 'react';
import { useDraggable, useDroppable } from '@dnd-kit/core';
import type { NodeId } from '@irich/core';
import type {
  CanvasNodeDragData,
  DropTargetData,
  IRichDndState,
  PaletteDragData,
} from './types';

export const IRichDndContext = createContext<IRichDndState>({
  activeData: null,
  overTarget: null,
  isAllowed: true,
});

/**
 * Accesses current live drag-and-drop state across the editor.
 */
export function useIRichDndState(): IRichDndState {
  return useContext(IRichDndContext);
}

export interface UsePaletteDraggableOptions {
  readonly componentType: string;
  readonly label?: string;
  readonly icon?: string;
  readonly disabled?: boolean;
}

/**
 * Attaches drag behavior to a component palette item.
 */
export function useIRichPaletteDraggable({
  componentType,
  label,
  icon,
  disabled = false,
}: UsePaletteDraggableOptions) {
  const data: PaletteDragData = {
    type: 'palette-item',
    componentType,
    label,
    icon,
  };

  const draggable = useDraggable({
    id: `palette:${componentType}`,
    data,
    disabled,
  });

  return {
    setNodeRef: draggable.setNodeRef,
    attributes: draggable.attributes,
    listeners: draggable.listeners,
    isDragging: draggable.isDragging,
    transform: draggable.transform,
  };
}

export interface UseCanvasDraggableOptions {
  readonly nodeId: NodeId;
  readonly componentType: string;
  readonly parentId: NodeId;
  readonly index: number;
  readonly slot?: string;
  readonly disabled?: boolean;
}

/**
 * Attaches drag behavior to an existing canvas component node.
 */
export function useIRichCanvasDraggable({
  nodeId,
  componentType,
  parentId,
  index,
  slot,
  disabled = false,
}: UseCanvasDraggableOptions) {
  const data: CanvasNodeDragData = {
    type: 'canvas-node',
    nodeId,
    componentType,
    parentId,
    index,
    slot,
  };

  const draggable = useDraggable({
    id: `node:${nodeId}`,
    data,
    disabled,
  });

  return {
    setNodeRef: draggable.setNodeRef,
    attributes: draggable.attributes,
    listeners: draggable.listeners,
    isDragging: draggable.isDragging,
    transform: draggable.transform,
  };
}

export interface UseDroppableContainerOptions {
  readonly parentId: NodeId;
  readonly slot?: string;
  readonly disabled?: boolean;
}

/**
 * Registers a container or root node as an interactive drop target.
 */
export function useIRichDroppableContainer({
  parentId,
  slot,
  disabled = false,
}: UseDroppableContainerOptions) {
  const data: DropTargetData = {
    type: 'container',
    parentId,
    slot,
    edge: 'inside',
    isContainer: true,
  };

  const droppable = useDroppable({
    id: `container:${parentId}${slot ? `:${slot}` : ''}`,
    data,
    disabled,
  });

  return {
    setNodeRef: droppable.setNodeRef,
    isOver: droppable.isOver,
  };
}

export interface UseNodeDropTargetOptions {
  readonly nodeId: NodeId;
  readonly parentId: NodeId;
  readonly index: number;
  readonly slot?: string;
  readonly edge: 'top' | 'bottom';
  readonly disabled?: boolean;
}

/**
 * Registers a specific edge (top/bottom) of a canvas node for precise sibling insertion.
 */
export function useIRichNodeDropTarget({
  nodeId,
  parentId,
  index,
  slot,
  edge,
  disabled = false,
}: UseNodeDropTargetOptions) {
  const targetIndex = edge === 'top' ? index : index + 1;
  const data: DropTargetData = {
    type: 'node-edge',
    parentId,
    slot,
    index: targetIndex,
    edge,
    nodeId,
  };

  const droppable = useDroppable({
    id: `edge:${nodeId}:${edge}`,
    data,
    disabled,
  });

  return {
    setNodeRef: droppable.setNodeRef,
    isOver: droppable.isOver,
  };
}
