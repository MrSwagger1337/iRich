/**
 * @irich/react
 * Types and interfaces for the iRich Drag and Drop subsystem.
 */

import type { ReactNode } from 'react';
import type { NodeId } from '@irich/core';

/**
 * Payload attached to draggable items originating from the component palette.
 */
export interface PaletteDragData {
  readonly type: 'palette-item';
  readonly componentType: string;
  readonly label?: string;
  readonly icon?: string;
}

/**
 * Payload attached to draggable nodes already present on the canvas.
 */
export interface CanvasNodeDragData {
  readonly type: 'canvas-node';
  readonly nodeId: NodeId;
  readonly componentType: string;
  readonly parentId: NodeId;
  readonly index: number;
  readonly slot?: string;
}

/**
 * Union type for all active draggable items in the editor.
 */
export type IRichDragData = PaletteDragData | CanvasNodeDragData;

/**
 * Drop target classification.
 */
export type DropEdge = 'top' | 'bottom' | 'inside';

/**
 * Payload attached to drop zones and candidate target targets.
 */
export interface DropTargetData {
  readonly type: 'container' | 'node-edge';
  readonly parentId: NodeId;
  readonly slot?: string;
  readonly index?: number;
  readonly edge?: DropEdge;
  readonly nodeId?: NodeId;
  readonly isContainer?: boolean;
}

/**
 * Live drag-and-drop interaction state.
 */
export interface IRichDndState {
  readonly activeData: IRichDragData | null;
  readonly overTarget: DropTargetData | null;
  readonly isAllowed: boolean;
  readonly reason?: string;
}

/**
 * Props for the root IRichDndProvider.
 */
export interface IRichDndProviderProps {
  readonly children: ReactNode;
  /**
   * Custom preview renderer rendered inside the DragOverlay.
   */
  readonly renderDragOverlay?: (data: IRichDragData, isAllowed: boolean) => ReactNode;
  /**
   * Distance in pixels pointer must move before drag gesture activates (defaults to 5px).
   */
  readonly activationDistance?: number;
  /**
   * Optional callback triggered when a drop operation completes successfully.
   */
  readonly onDropSuccess?: (data: {
    source: IRichDragData;
    targetParentId: NodeId;
    targetSlot?: string;
    targetIndex?: number;
  }) => void;
}
