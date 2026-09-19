/**
 * React Component Renderers for iRich Playground.
 */

'use client';

import React, { useEffect, useState } from 'react';
import type { JSONValue } from '@irich/core';
import type { ComponentMap, NodeRendererProps } from '@irich/renderer';
import {
  IRichTextEditor,
  IRichTextRenderer,
  useIRichEditor,
  useIRichSelection,
  type RichTextDocument,
} from '@irich/react';

// 1. Container Renderer
export const ContainerRenderer: React.FC<
  NodeRendererProps<{
    padding?: string;
    maxWidth?: string;
    background?: string;
    layout?: string;
  }>
> = ({ padding, maxWidth, background, layout, children, dir, lang }) => {
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
    <div
      className={`irich-container-node bg-${background ?? 'transparent'}`}
      dir={dir}
      lang={lang}
    >
      <div
        className="irich-container-inner"
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
    </div>
  );
};

// 2. Heading Renderer
export const HeadingRenderer: React.FC<
  NodeRendererProps<{
    text?: string;
    level?: string;
    align?: 'left' | 'center' | 'right';
  }>
> = ({ text, level, align, dir, lang }) => {
  const Tag = (level || 'h2') as 'h1' | 'h2' | 'h3' | 'h4';
  const alignment = align || 'left';

  return (
    <Tag
      className={`irich-heading irich-heading-${Tag}`}
      style={{ textAlign: alignment, margin: '0.5rem 0' }}
      dir={dir}
      lang={lang}
    >
      {text ?? 'Heading Text'}
    </Tag>
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
> = ({ content, size, color, align, dir, lang }) => {
  return (
    <p
      className={`irich-text irich-text-${size ?? 'md'} irich-text-${color ?? 'primary'}`}
      style={{
        textAlign: align ?? 'left',
        margin: '0.5rem 0 1rem 0',
        lineHeight: 1.6,
      }}
      dir={dir}
      lang={lang}
    >
      {content ?? 'Paragraph content...'}
    </p>
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
> = ({ label, variant, size, dir, lang }) => {
  return (
    <button
      type="button"
      className={`irich-btn irich-btn-${variant ?? 'primary'} irich-btn-${size ?? 'md'}`}
      onClick={(e) => e.preventDefault()}
      dir={dir}
      lang={lang}
    >
      {label ?? 'Button'}
    </button>
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
> = ({ title, description, tag, variant, children, dir, lang }) => {
  return (
    <div className={`irich-card irich-card-${variant ?? 'elevated'}`} dir={dir} lang={lang}>
      {tag && <div className="irich-card-tag">{tag}</div>}
      <h3 className="irich-card-title">{title ?? 'Card Title'}</h3>
      {description && <p className="irich-card-desc">{description}</p>}
      {children && <div className="irich-card-body">{children}</div>}
    </div>
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
  badge,
  title,
  subtitle,
  align,
  primaryActionLabel,
  secondaryActionLabel,
  dir,
  lang,
}) => {
  const isCenter = align === 'center';

  return (
    <header
      className={`irich-hero ${isCenter ? 'irich-hero-center' : 'irich-hero-left'}`}
      dir={dir}
      lang={lang}
    >
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
  );
};

// 7. RichText Renderer
export const RichTextRenderer: React.FC<
  NodeRendererProps<{
    content?: RichTextDocument | string;
    placeholder?: string;
  }>
> = ({ node, content, placeholder, dir, lang }) => {
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
    <div
      className={`irich-richtext-container ${isEditing ? 'editing' : 'view'}`}
      onDoubleClick={handleDoubleClick}
      dir={dir}
      lang={lang}
    >
      {isEditing ? (
        <div className="irich-richtext-editor-active">
          <IRichTextEditor
            content={content}
            dir={dir}
            lang={lang}
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
          <IRichTextRenderer content={content} dir={dir} lang={lang} />
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
  );
};

/**
 * Map of React component renderers for the playground canvas.
 */
export const playgroundComponentRenderers: ComponentMap = {
  Container: ContainerRenderer,
  Heading: HeadingRenderer,
  Text: TextRenderer,
  RichText: RichTextRenderer,
  Button: ButtonRenderer,
  Card: CardRenderer,
  Hero: HeroRenderer,
};


