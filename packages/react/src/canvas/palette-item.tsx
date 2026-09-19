/**
 * @irich/react
 * Palette drag-and-drop primitives for component sidebars and insert pickers.
 */

import React from 'react';
import { createNode, type JSONValue } from '@irich/core';
import { useIRichDocument, useIRichEditor, useIRichSelection } from '../hooks';
import {
  IRICH_DND_MIME,
  type IRichPaletteItemProps,
  type UsePaletteDraggableOptions,
  type UsePaletteDraggableResult,
} from './types';

/**
 * Headless hook to equip any palette item or sidebar button with canonical iRich drag behavior.
 */
export function useIRichPaletteDraggable({
  componentType,
  disabled = false,
  onInsert,
}: UsePaletteDraggableOptions): UsePaletteDraggableResult {
  const editor = useIRichEditor();
  const document = useIRichDocument();
  const { selectedNodeId } = useIRichSelection();

  const insert = () => {
    if (disabled) return;

    if (onInsert) {
      onInsert(componentType);
      return;
    }

    const registry = editor.getRegistry();
    const defaultProps = registry ? registry.getDefaultProps(componentType) : {};
    const compDef = registry?.get(componentType);
    const canHaveChildren = compDef ? compDef.canHaveChildren !== false : false;

    const newNode = createNode({
      type: componentType,
      props: defaultProps as Record<string, JSONValue>,
      children: canHaveChildren ? [] : undefined,
    });

    // Default target: inside selected container if one is selected, else root document
    let targetParentId = document.root.id;
    if (selectedNodeId) {
      const selectedNode = editor.getNode(selectedNodeId);
      if (selectedNode) {
        const selectedDef = registry?.get(selectedNode.type);
        if (selectedDef && selectedDef.canHaveChildren !== false) {
          targetParentId = selectedNode.id;
        }
      }
    }

    editor.commands.insertNode({
      node: newNode,
      parentId: targetParentId,
    });

    editor.commands.selectNode(newNode.id);
  };

  const onDragStart = (e: React.DragEvent) => {
    if (disabled) return;
    e.stopPropagation();
    e.dataTransfer.setData(IRICH_DND_MIME.PALETTE_TYPE, componentType);
    e.dataTransfer.effectAllowed = 'copy';
  };

  const onDragEnd = (e: React.DragEvent) => {
    e.stopPropagation();
  };

  return {
    draggableProps: {
      draggable: true,
      onDragStart,
      onDragEnd,
      'data-irich-palette-item': componentType,
    },
    insert,
  };
}

/**
 * Palette Item Button component for inserting components by click or drag.
 */
export function IRichPaletteItem({
  componentType,
  label,
  description,
  icon,
  className = '',
  children,
  onInsert,
}: IRichPaletteItemProps) {
  const { draggableProps, insert } = useIRichPaletteDraggable({
    componentType,
    onInsert,
  });

  const displayLabel = label ?? componentType;

  if (children) {
    return (
      <div
        {...draggableProps}
        className={`irich-palette-item ${className}`.trim()}
        onClick={insert}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            insert();
          }
        }}
      >
        {children}
      </div>
    );
  }

  return (
    <button
      type="button"
      {...draggableProps}
      className={`irich-palette-btn ${className}`.trim()}
      onClick={insert}
      title={`Click or drag to insert ${displayLabel}`}
    >
      {icon && <span className="irich-palette-btn-icon">{icon}</span>}
      <div className="irich-palette-btn-info">
        <span className="irich-palette-btn-label">{displayLabel}</span>
        {description && <span className="irich-palette-btn-desc">{description}</span>}
      </div>
    </button>
  );
}
