/**
 * @irich/react
 * Interactive canvas node wrapper component providing selection, drop hit testing,
 * drop indicators, and dedicated drag handle integration.
 */

import React, { useState, type ReactNode } from 'react';
import { useIRichDocument, useIRichEditor, useIRichSelection } from '../hooks';
import { IRichNodeActionBar } from './node-action-bar';
import {
  IRICH_DND_MIME,
  type DropIndicatorRenderProps,
  type IRichCanvasNodeProps,
  type NodeActionsRenderProps,
} from './types';
import {
  calculateDropPosition,
  executeDrop,
  resolveInsertionLocation,
  useIRichNodeActions,
} from './use-canvas';

/**
 * Default visual drop indicator component.
 */
function DefaultDropIndicator({
  position,
  isAllowed,
  nodeType,
}: DropIndicatorRenderProps) {
  if (position === 'inside') {
    return (
      <div
        className={`irich-drop-indicator-inside-badge ${
          isAllowed ? 'irich-drop-valid' : 'irich-drop-invalid'
        }`}
        data-irich-drop-indicator="inside"
        data-irich-drop-valid={isAllowed ? 'true' : 'false'}
      >
        <span>
          {isAllowed ? `Drop inside ${nodeType}` : `Cannot drop inside ${nodeType}`}
        </span>
      </div>
    );
  }

  return (
    <div
      className={`irich-drop-indicator irich-drop-indicator-${
        position === 'before' ? 'top' : 'bottom'
      } ${isAllowed ? 'irich-drop-valid' : 'irich-drop-invalid'}`}
      data-irich-drop-indicator={position}
      data-irich-drop-valid={isAllowed ? 'true' : 'false'}
    >
      <div className="irich-drop-indicator-line" />
      <div className="irich-drop-indicator-badge">
        {isAllowed ? 'Insert here' : 'Cannot insert here'}
      </div>
    </div>
  );
}

/**
 * Interactive canvas node wrapper component.
 */
export function IRichCanvasNode({
  node,
  isContainer = false,
  isEditing = false,
  dir,
  lang,
  registry,
  renderNodeActions,
  renderDropIndicator,
  className = '',
  style,
  children,
}: IRichCanvasNodeProps) {
  const editor = useIRichEditor();
  const document = useIRichDocument();
  const { selectedNodeId, selectNode } = useIRichSelection();

  const [dropPosition, setDropPosition] = useState<'before' | 'after' | 'inside' | null>(null);
  const [isDropAllowed, setIsDropAllowed] = useState(true);
  const [isDragging, setIsDragging] = useState(false);

  const isSelected = selectedNodeId === node.id;
  const actionsState = useIRichNodeActions(node.id);

  // Drag handle props passed to the action toolbar (Fulfills Amendment 1: drag starts ONLY from handle)
  const dragHandleProps: NodeActionsRenderProps['dragHandleProps'] = {
    draggable: true,
    onDragStart: (e: React.DragEvent) => {
      e.stopPropagation();
      setIsDragging(true);
      e.dataTransfer.setData(IRICH_DND_MIME.NODE_ID, node.id);
      e.dataTransfer.effectAllowed = 'move';
    },
    onDragEnd: (e: React.DragEvent) => {
      e.stopPropagation();
      setIsDragging(false);
    },
    'data-irich-drag-handle': 'true',
    'aria-label': `Drag handle for ${node.type}`,
    role: 'button',
    tabIndex: 0,
  };

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    selectNode(node.id);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const rect = e.currentTarget.getBoundingClientRect();
    const position = calculateDropPosition(e.clientY, rect, isContainer);

    // Read drag types
    const paletteType = e.dataTransfer.types.includes(IRICH_DND_MIME.PALETTE_TYPE);
    const sourceNodeId = e.dataTransfer.types.includes(IRICH_DND_MIME.NODE_ID);

    if (!paletteType && !sourceNodeId) {
      return;
    }

    const resolution = resolveInsertionLocation({
      document,
      target: {
        targetNodeId: node.id,
        position,
      },
      registry,
    });

    setDropPosition(position);
    setIsDropAllowed(resolution.isAllowed);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.stopPropagation();
    setDropPosition(null);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const currentPosition = dropPosition;
    setDropPosition(null);

    if (!currentPosition) return;

    const paletteType = e.dataTransfer.getData(IRICH_DND_MIME.PALETTE_TYPE) || undefined;
    const sourceNodeId = e.dataTransfer.getData(IRICH_DND_MIME.NODE_ID) || undefined;

    if (!paletteType && !sourceNodeId) return;

    const resolution = resolveInsertionLocation({
      document,
      target: {
        targetNodeId: node.id,
        position: currentPosition,
      },
      registry,
      paletteType,
      sourceNodeId,
    });

    if (resolution.isAllowed) {
      executeDrop({
        editor,
        document,
        resolution,
        paletteType,
        sourceNodeId,
        registry,
      });
    }
  };

  // Render Action Toolbar (optional per Amendment 2)
  let renderedActionToolbar: ReactNode = null;
  if (isSelected && !isEditing) {
    if (renderNodeActions !== undefined) {
      renderedActionToolbar = renderNodeActions({
        ...actionsState,
        dragHandleProps,
      });
    } else {
      renderedActionToolbar = (
        <IRichNodeActionBar state={actionsState} dragHandleProps={dragHandleProps} />
      );
    }
  }

  // Render Drop Indicators
  let renderedIndicator: ReactNode = null;
  if (dropPosition) {
    if (renderDropIndicator) {
      renderedIndicator = renderDropIndicator({
        position: dropPosition,
        isAllowed: isDropAllowed,
        nodeType: node.type,
      });
    } else {
      renderedIndicator = (
        <DefaultDropIndicator
          position={dropPosition}
          isAllowed={isDropAllowed}
          nodeType={node.type}
        />
      );
    }
  }

  return (
    <div
      data-irich-node="true"
      data-irich-node-id={node.id}
      data-irich-node-type={node.type}
      data-irich-selected={isSelected ? 'true' : 'false'}
      data-irich-dragging={isDragging ? 'true' : 'false'}
      data-irich-drop-position={dropPosition ?? undefined}
      data-irich-drop-valid={dropPosition ? (isDropAllowed ? 'true' : 'false') : undefined}
      dir={dir}
      lang={lang}
      className={`irich-canvas-node ${isSelected ? 'irich-canvas-node-selected' : ''} ${
        isDragging ? 'irich-canvas-node-dragging' : ''
      } ${dropPosition === 'inside' ? 'irich-canvas-node-drop-inside' : ''} ${className}`.trim()}
      style={{
        ...style,
        opacity: isDragging ? 0.35 : 1,
      }}
      onClick={handleClick}
      draggable={false} /* Fulfills Amendment 1: Node body is NOT draggable! */
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          if (e.target === e.currentTarget) {
            e.preventDefault();
            selectNode(node.id);
          }
        }
      }}
    >
      {renderedIndicator}
      {renderedActionToolbar}
      {children}
    </div>
  );
}
