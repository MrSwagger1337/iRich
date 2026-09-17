/**
 * React Component Renderers for iRich Playground with interactive canvas selection.
 */

import React, { type CSSProperties, type ReactNode } from 'react';
import type { ComponentMap, NodeRendererProps } from '@irich/renderer';
import { useIRichSelection } from '@irich/react';

/**
 * Interactive canvas node wrapper providing click-to-select, hover outlines, and selection badges.
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
  const isSelected = selectedNodeId === id;

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    selectNode(id);
  };

  return (
    <div
      data-irich-node-id={id}
      data-irich-node-type={type}
      data-irich-selected={isSelected ? 'true' : 'false'}
      className={`irich-canvas-node ${isSelected ? 'irich-canvas-node-selected' : ''} ${className ?? ''}`}
      style={style}
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
      {/* Node selection badge */}
      <div className="irich-node-badge">
        <span className="irich-node-badge-type">{type}</span>
      </div>
      {children}
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

  return (
    <NodeWrapper id={node.id} type="Container" className="irich-container-node">
      <div
        className={`irich-container-inner bg-${background ?? 'transparent'}`}
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
          {children}
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
  return (
    <NodeWrapper id={node.id} type="Card" className="irich-card-wrapper">
      <div className={`irich-card irich-card-${variant ?? 'elevated'}`}>
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

// 7. Root Renderer
export const RootRenderer: React.FC<NodeRendererProps> = ({ children }) => {
  return <div className="irich-root-container">{children}</div>;
};

/**
 * Map of React component renderers for the playground canvas.
 */
export const playgroundComponentRenderers: ComponentMap = {
  root: RootRenderer,
  Container: ContainerRenderer,
  Heading: HeadingRenderer,
  Text: TextRenderer,
  Button: ButtonRenderer,
  Card: CardRenderer,
  Hero: HeroRenderer,
};
