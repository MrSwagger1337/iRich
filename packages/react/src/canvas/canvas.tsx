/**
 * @irich/react
 * Reusable visual canvas with unified recursive editing rendering, selection, and DnD insertion.
 */

import React, { useState, type ReactNode } from 'react';
import {
  resolveNodeProps,
  type Breakpoint,
  type ComponentRegistry,
  type IRichNode,
} from '@irich/core';
import type { ComponentMap } from '@irich/renderer';
import { useIRichBreakpoint, useIRichDocument, useIRichEditor, useIRichSelection } from '../hooks';
import { IRichCanvasNode } from './canvas-node';
import {
  IRICH_DND_MIME,
  type EmptySlotRenderProps,
  type IRichCanvasProps,
  type NodeActionsRenderProps,
} from './types';
import { executeDrop, resolveInsertionLocation } from './use-canvas';

/**
 * Default empty container slot component.
 */
function DefaultEmptySlot({
  parentId,
  parentType,
  registry,
}: EmptySlotRenderProps & { registry?: ComponentRegistry }) {
  const editor = useIRichEditor();
  const document = useIRichDocument();
  const [isOver, setIsOver] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.stopPropagation();
    setIsOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsOver(false);

    const paletteType = e.dataTransfer.getData(IRICH_DND_MIME.PALETTE_TYPE) || undefined;
    const sourceNodeId = e.dataTransfer.getData(IRICH_DND_MIME.NODE_ID) || undefined;

    if (!paletteType && !sourceNodeId) return;

    const resolution = resolveInsertionLocation({
      document,
      target: {
        targetNodeId: parentId,
        position: 'inside',
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

  const reg = registry ?? editor.getRegistry();
  const parentDef = reg?.get(parentType);
  let emptyMessage = `${parentType} is empty — Drop components here`;
  if (parentDef?.allowedChildren && parentDef.allowedChildren.length === 1) {
    const allowedChildType = parentDef.allowedChildren[0];
    const childDef = reg?.get(allowedChildType);
    const childLabel = childDef?.label ?? allowedChildType;
    emptyMessage = `${parentType} is empty — Drop ${childLabel} here`;
  }

  return (
    <div
      className={`irich-container-empty-slot ${isOver ? 'active' : ''}`}
      data-irich-empty-slot="true"
      data-irich-empty-parent-id={parentId}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <span className="irich-slot-icon">+</span>
      <span className="irich-slot-text">
        {emptyMessage}
      </span>
    </div>
  );
}

interface RecursiveCanvasNodeProps {
  node: IRichNode;
  components: ComponentMap;
  registry?: ComponentRegistry;
  breakpoint: Breakpoint;
  renderNodeActions?: (props: NodeActionsRenderProps) => ReactNode;
  renderEmptySlot?: (props: EmptySlotRenderProps) => ReactNode;
}

/**
 * Recursive editing renderer rendering each node and its child slots wrapped with interactive canvas nodes.
 */
function RecursiveCanvasNode({
  node,
  components,
  registry,
  breakpoint,
  renderNodeActions,
  renderEmptySlot,
}: RecursiveCanvasNodeProps) {
  const compDef = registry?.get(node.type);
  const canHaveChildren = compDef ? compDef.canHaveChildren !== false : true;

  // 1. Render default children recursively
  let renderedChildren: ReactNode = undefined;
  if (node.children && node.children.length > 0) {
    renderedChildren = node.children.map((child) => (
      <RecursiveCanvasNode
        key={child.id}
        node={child}
        components={components}
        registry={registry}
        breakpoint={breakpoint}
        renderNodeActions={renderNodeActions}
        renderEmptySlot={renderEmptySlot}
      />
    ));
  } else if (canHaveChildren && node.type !== 'root') {
    // Render empty container slot when container has 0 children
    if (renderEmptySlot) {
      renderedChildren = renderEmptySlot({
        parentId: node.id,
        parentType: node.type,
      });
    } else {
      renderedChildren = (
        <DefaultEmptySlot
          parentId={node.id}
          parentType={node.type}
          registry={registry}
        />
      );
    }
  }

  // 2. Render named slots recursively
  let renderedSlots: Record<string, ReactNode> | undefined = undefined;
  if (node.slots) {
    renderedSlots = {};
    for (const [slotName, slotNodes] of Object.entries(node.slots)) {
      if (slotNodes && slotNodes.length > 0) {
        renderedSlots[slotName] = slotNodes.map((child) => (
          <RecursiveCanvasNode
            key={child.id}
            node={child}
            components={components}
            registry={registry}
            breakpoint={breakpoint}
            renderNodeActions={renderNodeActions}
            renderEmptySlot={renderEmptySlot}
          />
        ));
      } else {
        renderedSlots[slotName] = null;
      }
    }
  }

  // 3. Resolve responsive props and metadata
  const resolvedProps = resolveNodeProps(node.props, breakpoint);
  const nodeDir = node.meta?.dir;
  const nodeLang = node.meta?.lang;

  // 4. Root node handling
  if (node.type === 'root') {
    const RootComponent = components[node.type];
    if (RootComponent) {
      return (
        <RootComponent
          {...resolvedProps}
          node={node}
          id={node.id}
          dir={nodeDir}
          lang={nodeLang}
          children={renderedChildren}
          slots={renderedSlots}
        />
      );
    }

    if (nodeDir !== undefined || nodeLang !== undefined) {
      return (
        <div dir={nodeDir} lang={nodeLang} data-irich-root-meta="">
          {renderedChildren}
        </div>
      );
    }

    return <React.Fragment>{renderedChildren}</React.Fragment>;
  }

  // 5. Component Renderer from ComponentMap
  const Component = components[node.type];
  const renderedElement = Component ? (
    <Component
      {...resolvedProps}
      node={node}
      id={node.id}
      dir={nodeDir}
      lang={nodeLang}
      children={renderedChildren}
      slots={renderedSlots}
    />
  ) : (
    <div
      className="irich-unknown-component-fallback"
      style={{
        padding: '16px',
        border: '1px dashed #f59e0b',
        borderRadius: '6px',
        color: '#fbbf24',
        fontSize: '13px',
      }}
    >
      Unknown Component &ldquo;{node.type}&rdquo;
    </div>
  );

  return (
    <IRichCanvasNode
      node={node}
      isContainer={canHaveChildren}
      dir={nodeDir}
      lang={nodeLang}
      components={components}
      registry={registry}
      renderNodeActions={renderNodeActions}
      renderEmptySlot={renderEmptySlot}
      breakpoint={breakpoint}
    >
      {renderedElement}
    </IRichCanvasNode>
  );
}

/**
 * Visual canvas component for editing iRich documents.
 */
export function IRichCanvas({
  components,
  registry: explicitRegistry,
  renderNodeActions,
  renderEmptySlot,
  dropZoneLabel = '+ Drag & drop components here to append to page',
  breakpoint: explicitBreakpoint,
  className = '',
  style,
  children,
}: IRichCanvasProps) {
  const editor = useIRichEditor();
  const document = useIRichDocument();
  const { breakpoint: contextBreakpoint } = useIRichBreakpoint();
  const { clearSelection } = useIRichSelection();

  const [isBottomOver, setIsBottomOver] = useState(false);

  const registry = explicitRegistry ?? editor.getRegistry();
  const breakpoint = explicitBreakpoint ?? contextBreakpoint ?? 'desktop';

  const handleCanvasBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      clearSelection();
    }
  };

  const handleBottomDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsBottomOver(false);

    const paletteType = e.dataTransfer.getData(IRICH_DND_MIME.PALETTE_TYPE) || undefined;
    const sourceNodeId = e.dataTransfer.getData(IRICH_DND_MIME.NODE_ID) || undefined;

    if (!paletteType && !sourceNodeId) return;

    const resolution = resolveInsertionLocation({
      document,
      target: {
        position: 'root',
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

  const getFrameWidth = () => {
    switch (breakpoint) {
      case 'mobile':
        return '375px';
      case 'tablet':
        return '768px';
      case 'desktop':
      default:
        return '100%';
    }
  };

  return (
    <main
      className={`irich-canvas-viewport ${className}`.trim()}
      style={style}
      onClick={handleCanvasBackdropClick}
      data-irich-canvas="true"
      role="region"
      aria-label="Visual Content Canvas"
    >
      {/* Responsive Canvas Frame Container */}
      <div
        className={`irich-canvas-frame irich-canvas-frame-${breakpoint}`}
        style={{
          width: getFrameWidth(),
          maxWidth: breakpoint === 'desktop' ? '1100px' : '100%',
        }}
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            clearSelection();
          }
        }}
      >
        <div className="irich-canvas-paper">
          {/* Recursive Editing Tree */}
          <RecursiveCanvasNode
            node={document.root}
            components={components}
            registry={registry}
            breakpoint={breakpoint}
            renderNodeActions={renderNodeActions}
            renderEmptySlot={renderEmptySlot}
          />

          {/* Root Append Drop Zone */}
          <div
            className={`irich-canvas-bottom-drop-zone ${isBottomOver ? 'active' : ''}`}
            data-irich-bottom-drop="true"
            onDragOver={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setIsBottomOver(true);
            }}
            onDragLeave={(e) => {
              e.stopPropagation();
              setIsBottomOver(false);
            }}
            onDrop={handleBottomDrop}
          >
            <span>{dropZoneLabel}</span>
          </div>

          {children}
        </div>
      </div>
    </main>
  );
}
