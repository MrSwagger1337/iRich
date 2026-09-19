/**
 * @irich/react
 * Types and interfaces for the visual canvas, recursive editor renderer, and drag-and-drop subsystem.
 */

import type { CSSProperties, ReactNode } from 'react';
import type { Breakpoint, ComponentRegistry, IRichNode, NodeId } from '@irich/core';
import type { ComponentMap } from '@irich/renderer';

/**
 * Standard MIME types for internal iRich drag-and-drop dataTransfer payloads.
 */
export const IRICH_DND_MIME = {
  PALETTE_TYPE: 'application/x-irich-palette-type',
  NODE_ID: 'application/x-irich-node-id',
} as const;

/**
 * Relative drop insertion position relative to a target node or container.
 */
export type InsertionPosition = 'before' | 'after' | 'inside' | 'root';

/**
 * Semantic insertion target describing user intent.
 */
export interface InsertionTarget {
  /**
   * Node ID of the hovered target node (undefined when dropping onto root/canvas background).
   */
  readonly targetNodeId?: NodeId;

  /**
   * Relative insertion position.
   */
  readonly position: InsertionPosition;
}

/**
 * Detailed resolved insertion location and placement validation result (internal/derived).
 */
export interface InsertionResolution {
  readonly targetNodeId?: NodeId;
  readonly targetParentId: NodeId;
  readonly targetSlot?: string;
  readonly targetIndex: number;
  readonly position: InsertionPosition;
  readonly isAllowed: boolean;
  readonly code?: string;
  readonly reason?: string;
}

/**
 * Action capabilities and command handlers for a selected node.
 */
export interface NodeActionsState {
  readonly nodeId: NodeId;
  readonly nodeType: string;
  readonly canMoveUp: boolean;
  readonly canMoveDown: boolean;
  readonly canDuplicate: boolean;
  readonly canDelete: boolean;
  readonly moveUp: () => void;
  readonly moveDown: () => void;
  readonly duplicate: () => void;
  readonly duplicateNode: () => void;
  readonly remove: () => void;
  readonly deleteNode: () => void;
}


/**
 * Props passed to custom node action bar render callback.
 */
export interface NodeActionsRenderProps extends NodeActionsState {
  readonly dragHandleProps: {
    readonly draggable: true;
    readonly onDragStart: (e: React.DragEvent) => void;
    readonly onDragEnd: (e: React.DragEvent) => void;
    readonly 'data-irich-drag-handle': 'true';
    readonly 'aria-label': string;
    readonly role: 'button';
    readonly tabIndex: 0;
  };
}

/**
 * Props passed to custom empty container slot render callback.
 */
export interface EmptySlotRenderProps {
  readonly parentId: NodeId;
  readonly parentType: string;
  readonly slotName?: string;
  readonly dir?: string;
  readonly lang?: string;
}

/**
 * Props passed to custom drop indicator render callback.
 */
export interface DropIndicatorRenderProps {
  readonly position: 'before' | 'after' | 'inside';
  readonly isAllowed: boolean;
  readonly nodeType: string;
}

/**
 * Props for the primary `<IRichCanvas />` component.
 */
export interface IRichCanvasProps {
  /**
   * Component renderers mapped by component type.
   */
  readonly components: ComponentMap;

  /**
   * Optional component registry. Defaults to `editor.getRegistry()`.
   */
  readonly registry?: ComponentRegistry;

  /**
   * Optional custom node action toolbar renderer.
   * Return `null` to disable node action toolbars entirely.
   */
  readonly renderNodeActions?: (props: NodeActionsRenderProps) => ReactNode;

  /**
   * Optional customizer for empty container slots.
   */
  readonly renderEmptySlot?: (props: EmptySlotRenderProps) => ReactNode;

  /**
   * Optional customizer for drop indicators.
   */
  readonly renderDropIndicator?: (props: DropIndicatorRenderProps) => ReactNode;

  /**
   * Optional label for root append drop zone at bottom of canvas.
   * @default "+ Drag & drop components here to append to page"
   */
  readonly dropZoneLabel?: string;

  /**
   * Current responsive breakpoint mode ('desktop' | 'tablet' | 'mobile').
   * If omitted, attempts to read from `useIRichBreakpoint()` or defaults to 'desktop'.
   */
  readonly breakpoint?: Breakpoint;

  /**
   * Optional CSS class name and inline styles for the canvas container.
   */
  readonly className?: string;
  readonly style?: CSSProperties;

  /**
   * Optional children rendered after the canvas tree (e.g. overlays or annotations).
   */
  readonly children?: ReactNode;
}

/**
 * Props for `<IRichCanvasNode />` interactive wrapper.
 */
export interface IRichCanvasNodeProps {
  readonly node: IRichNode;
  readonly isContainer?: boolean;
  readonly isEditing?: boolean;
  readonly dir?: string;
  readonly lang?: string;
  readonly components: ComponentMap;
  readonly registry?: ComponentRegistry;
  readonly renderNodeActions?: (props: NodeActionsRenderProps) => ReactNode;
  readonly renderEmptySlot?: (props: EmptySlotRenderProps) => ReactNode;
  readonly renderDropIndicator?: (props: DropIndicatorRenderProps) => ReactNode;
  readonly breakpoint?: Breakpoint;
  readonly className?: string;
  readonly style?: CSSProperties;
  readonly children?: ReactNode;
}

/**
 * Props for `<IRichNodeActionBar />`.
 */
export interface IRichNodeActionBarProps {
  readonly state: NodeActionsState;
  readonly dragHandleProps?: React.HTMLAttributes<HTMLElement>;
  readonly className?: string;
}

/**
 * Props for `<IRichPaletteItem />`.
 */
export interface IRichPaletteItemProps {
  readonly componentType: string;
  readonly label?: string;
  readonly description?: string;
  readonly icon?: ReactNode;
  readonly className?: string;
  readonly children?: ReactNode;
  readonly onInsert?: (type: string) => void;
}

/**
 * Options for `useIRichPaletteDraggable` hook.
 */
export interface UsePaletteDraggableOptions {
  readonly componentType: string;
  readonly disabled?: boolean;
  readonly onInsert?: (type: string) => void;
}

/**
 * Result returned by `useIRichPaletteDraggable`.
 */
export interface UsePaletteDraggableResult {
  readonly draggableProps: {
    readonly draggable: true;
    readonly onDragStart: (e: React.DragEvent) => void;
    readonly onDragEnd: (e: React.DragEvent) => void;
    readonly 'data-irich-palette-item': string;
  };
  readonly insert: () => void;
}
