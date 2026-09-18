/**
 * React Component Renderers for iRich Playground with interactive canvas selection and DnD reordering.
 */

'use client';

import React, { useEffect, useMemo, useState, type CSSProperties, type ReactNode } from 'react';
import { findParent, type JSONValue } from '@irich/core';
import type { ComponentMap, NodeRendererProps } from '@irich/renderer';
import {
  IRichTextEditor,
  IRichTextRenderer,
  InsertionIndicator,
  useIRichCanvasDraggable,
  useIRichDndState,
  useIRichDocument,
  useIRichDroppableContainer,
  useIRichEditor,
  useIRichNodeDropTarget,
  useIRichSelection,
  type RichTextDocument,
} from '@irich/react';

/**
 * Interactive canvas node wrapper providing click-to-select, drag handle, hover outlines,
 * selection badges, and top/bottom insertion drop targets.
 */
interface NodeWrapperProps {
  id: string;
  type: string;
  children: ReactNode;
  style?: CSSProperties;
  className?: string;
}

export function NodeWrapper({ id, type, children, style, className }: NodeWrapperProps) {
  const { selectedNodeId, selectNode } = useIRichSelection();
  const document = useIRichDocument();
  const dndState = useIRichDndState();
  const isSelected = selectedNodeId === id;

  const parentLoc = useMemo(() => findParent(document, id), [document, id]);
  const parentId = parentLoc?.parent.id ?? 'root';
  const index = parentLoc?.index ?? 0;
  const slot = parentLoc?.slotName;

  const { setNodeRef: setDragRef, attributes, listeners, isDragging } = useIRichCanvasDraggable({
    nodeId: id,
    componentType: type,
    parentId,
    index,
    slot,
  });

  const { setNodeRef: setTopDropRef, isOver: isTopOver } = useIRichNodeDropTarget({
    nodeId: id,
    parentId,
    index,
    slot,
    edge: 'top',
  });

  const { setNodeRef: setBottomDropRef, isOver: isBottomOver } = useIRichNodeDropTarget({
    nodeId: id,
    parentId,
    index,
    slot,
    edge: 'bottom',
  });

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    selectNode(id);
  };

  return (
    <div
      ref={setDragRef}
      data-irich-node-id={id}
      data-irich-node-type={type}
      data-irich-selected={isSelected ? 'true' : 'false'}
      className={`irich-canvas-node ${isSelected ? 'irich-canvas-node-selected' : ''} ${
        isDragging ? 'irich-canvas-node-dragging' : ''
      } ${className ?? ''}`}
      style={{
        ...style,
        opacity: isDragging ? 0.35 : 1,
      }}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.stopPropagation();
          selectNode(id);
        }
      }}
    >
      {/* Top Drop Edge Target & Indicator */}
      <div ref={setTopDropRef} className="irich-node-edge-target irich-node-edge-top">
        <InsertionIndicator edge="top" visible={isTopOver} allowed={dndState.isAllowed} />
      </div>

      {/* Node selection badge & drag handle */}
      <div className="irich-node-badge" {...attributes} {...listeners} title="Drag to move">
        <span className="irich-node-badge-drag-icon">⋮⋮</span>
        <span className="irich-node-badge-type">{type}</span>
      </div>

      {children}

      {/* Bottom Drop Edge Target & Indicator */}
      <div ref={setBottomDropRef} className="irich-node-edge-target irich-node-edge-bottom">
        <InsertionIndicator edge="bottom" visible={isBottomOver} allowed={dndState.isAllowed} />
      </div>
    </div>
  );
}

// 1. Container Renderer
export const ContainerRenderer: React.FC<
  NodeRendererProps<{
    padding?: string;
    maxWidth?: string;
    background?: string;
    layout?: string;
  }>
> = ({ node, padding, maxWidth, background, layout, children }) => {
  const { setNodeRef, isOver } = useIRichDroppableContainer({
    parentId: node.id,
  });

  const paddingMap: Record<string, string> = {
    none: '0',
    small: '1rem',
    medium: '2rem',
    large: '3.5rem',
  };

  const maxWidthMap: Record<string, string> = {
    narrow: '720px',
    medium: '960px',
    wide: '1200px',
    full: '100%',
  };

  const isGrid2 = layout === 'grid-2';
  const isGrid3 = layout === 'grid-3';
  const hasChildren = node.children && node.children.length > 0;

  return (
    <NodeWrapper id={node.id} type="Container" className="irich-container-node">
      <div
        ref={setNodeRef}
        className={`irich-container-inner bg-${background ?? 'transparent'} ${
          isOver ? 'irich-container-droppable-active' : ''
        }`}
        style={{
          padding: paddingMap[padding ?? 'medium'] ?? '2rem',
          maxWidth: maxWidthMap[maxWidth ?? 'wide'] ?? '1200px',
          margin: '0 auto',
          width: '100%',
          boxSizing: 'border-box',
        }}
      >
        <div
          className={
            isGrid3
              ? 'irich-layout-grid-3'
              : isGrid2
                ? 'irich-layout-grid-2'
                : 'irich-layout-vertical'
          }
        >
          {hasChildren ? (
            children
          ) : (
            <div className="irich-empty-container-dropzone">
              <span>Drop components inside Container</span>
            </div>
          )}
        </div>
      </div>
    </NodeWrapper>
  );
};

// 2. Heading Renderer
export const HeadingRenderer: React.FC<
  NodeRendererProps<{
    text?: string;
    level?: string;
    align?: 'left' | 'center' | 'right';
  }>
> = ({ node, text, level, align }) => {
  const Tag = (level || 'h2') as 'h1' | 'h2' | 'h3' | 'h4';
  const alignment = align || 'left';

  return (
    <NodeWrapper id={node.id} type="Heading">
      <Tag
        className={`irich-heading irich-heading-${Tag}`}
        style={{ textAlign: alignment, margin: '0.5rem 0' }}
      >
        {text ?? 'Heading Text'}
      </Tag>
    </NodeWrapper>
  );
};

// 3. Text Renderer
export const TextRenderer: React.FC<
  NodeRendererProps<{
    content?: string;
    size?: string;
    color?: string;
    align?: 'left' | 'center' | 'right';
  }>
> = ({ node, content, size, color, align }) => {
  return (
    <NodeWrapper id={node.id} type="Text">
      <p
        className={`irich-text irich-text-${size ?? 'md'} irich-text-${color ?? 'primary'}`}
        style={{
          textAlign: align ?? 'left',
          margin: '0.5rem 0 1rem 0',
          lineHeight: 1.6,
        }}
      >
        {content ?? 'Paragraph content...'}
      </p>
    </NodeWrapper>
  );
};

// 4. Button Renderer
export const ButtonRenderer: React.FC<
  NodeRendererProps<{
    label?: string;
    variant?: string;
    size?: string;
    url?: string;
  }>
> = ({ node, label, variant, size }) => {
  return (
    <NodeWrapper id={node.id} type="Button" style={{ display: 'inline-block' }}>
      <button
        type="button"
        className={`irich-btn irich-btn-${variant ?? 'primary'} irich-btn-${size ?? 'md'}`}
        onClick={(e) => e.preventDefault()}
      >
        {label ?? 'Button'}
      </button>
    </NodeWrapper>
  );
};

// 5. Card Renderer
export const CardRenderer: React.FC<
  NodeRendererProps<{
    title?: string;
    description?: string;
    tag?: string;
    variant?: string;
  }>
> = ({ node, title, description, tag, variant, children }) => {
  const { setNodeRef, isOver } = useIRichDroppableContainer({
    parentId: node.id,
  });

  return (
    <NodeWrapper id={node.id} type="Card" className="irich-card-wrapper">
      <div
        ref={setNodeRef}
        className={`irich-card irich-card-${variant ?? 'elevated'} ${
          isOver ? 'irich-container-droppable-active' : ''
        }`}
      >
        {tag && <div className="irich-card-tag">{tag}</div>}
        <h3 className="irich-card-title">{title ?? 'Card Title'}</h3>
        {description && <p className="irich-card-desc">{description}</p>}
        {children && <div className="irich-card-body">{children}</div>}
      </div>
    </NodeWrapper>
  );
};

// 6. Hero Renderer
export const HeroRenderer: React.FC<
  NodeRendererProps<{
    badge?: string;
    title?: string;
    subtitle?: string;
    align?: string;
    primaryActionLabel?: string;
    secondaryActionLabel?: string;
  }>
> = ({
  node,
  badge,
  title,
  subtitle,
  align,
  primaryActionLabel,
  secondaryActionLabel,
}) => {
  const isCenter = align === 'center';

  return (
    <NodeWrapper id={node.id} type="Hero" className="irich-hero-wrapper">
      <header className={`irich-hero ${isCenter ? 'irich-hero-center' : 'irich-hero-left'}`}>
        {badge && <div className="irich-hero-badge">{badge}</div>}
        <h1 className="irich-hero-title">{title ?? 'Hero Title'}</h1>
        {subtitle && <p className="irich-hero-subtitle">{subtitle}</p>}
        {(primaryActionLabel || secondaryActionLabel) && (
          <div className="irich-hero-actions">
            {primaryActionLabel && (
              <button type="button" className="irich-btn irich-btn-primary irich-btn-lg">
                {primaryActionLabel}
              </button>
            )}
            {secondaryActionLabel && (
              <button type="button" className="irich-btn irich-btn-outline irich-btn-lg">
                {secondaryActionLabel}
              </button>
            )}
          </div>
        )}
      </header>
    </NodeWrapper>
  );
};

// 7. RichText Renderer
export const RichTextRenderer: React.FC<
  NodeRendererProps<{
    content?: RichTextDocument | string;
    placeholder?: string;
  }>
> = ({ node, content, placeholder }) => {
  const editor = useIRichEditor();
  const { selectedNodeId } = useIRichSelection();
  const isSelected = selectedNodeId === node.id;
  const [isEditing, setIsEditing] = useState(false);

  // If node gets deselected, exit editing mode
  useEffect(() => {
    if (!isSelected && isEditing) {
      setIsEditing(false);
    }
  }, [isSelected, isEditing]);

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditing(true);
  };

  const handleContentChange = (newDoc: RichTextDocument) => {
    editor.commands.updateNode({
      nodeId: node.id,
      props: {
        content: newDoc as unknown as JSONValue,
      },
    });
  };

  return (
    <NodeWrapper id={node.id} type="RichText" className="irich-richtext-wrapper">
      <div
        className={`irich-richtext-container ${isEditing ? 'editing' : 'view'}`}
        onDoubleClick={handleDoubleClick}
      >
        {isEditing ? (
          <div className="irich-richtext-editor-active">
            <IRichTextEditor
              content={content}
              onChange={handleContentChange}
              placeholder={placeholder ?? 'Start typing rich text...'}
              editable={true}
              showFloatingToolbar={true}
              autoFocus={true}
            />
            <div className="irich-richtext-editing-hint">
              <span>Editing Rich Text • Click outside or press Done to finish</span>
              <button
                type="button"
                className="irich-richtext-done-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsEditing(false);
                }}
              >
                ✓ Done
              </button>
            </div>
          </div>
        ) : (
          <div className="irich-richtext-preview" title="Double click to edit">
            <IRichTextRenderer content={content} />
            {isSelected && !isEditing && (
              <div className="irich-richtext-click-prompt">
                <button
                  type="button"
                  className="irich-richtext-edit-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsEditing(true);
                  }}
                >
                  ✎ Edit Rich Text
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </NodeWrapper>
  );
};

// 8. Root Renderer
export const RootRenderer: React.FC<NodeRendererProps> = ({ node, children }) => {
  const { setNodeRef, isOver } = useIRichDroppableContainer({
    parentId: 'root',
  });
  const hasChildren = node.children && node.children.length > 0;

  return (
    <div
      ref={setNodeRef}
      className={`irich-root-container ${isOver ? 'irich-root-droppable-active' : ''}`}
    >
      {hasChildren ? (
        children
      ) : (
        <div className="irich-empty-canvas-dropzone">
          <p>Drag components here to start building your page.</p>
        </div>
      )}
    </div>
  );
};

/**
 * Map of React component renderers for the playground canvas.
 */
export const playgroundComponentRenderers: ComponentMap = {
  root: RootRenderer,
  Container: ContainerRenderer,
  Heading: HeadingRenderer,
  Text: TextRenderer,
  RichText: RichTextRenderer,
  Button: ButtonRenderer,
  Card: CardRenderer,
  Hero: HeroRenderer,
};

