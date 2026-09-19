/**
 * @irich/renderer
 * Root <IRichRenderer /> component for rendering complete iRich documents.
 */

import React from 'react';
import type { IRichDocument } from '@irich/core';
import { RendererRegistry } from './registry';
import { RenderNode, type RenderOptions } from './render-node';
import type { ComponentMap, IRichRendererProps } from './types';

/**
 * Root React component for rendering an IRichDocument.
 *
 * @example
 * ```tsx
 * import { IRichRenderer } from '@irich/renderer';
 *
 * const components = {
 *   Hero: HeroComponent,
 *   Card: CardComponent,
 * };
 *
 * <IRichRenderer document={doc} components={components} />
 * ```
 */
export const IRichRenderer: React.FC<IRichRendererProps> = ({
  document,
  components,
  breakpoint = 'desktop',
  direction: explicitDirection,
  lang: explicitLang,
  fallback,
  onUnknownComponent = 'fallback',
  onError,
  className,
  style,
}) => {
  if (!document || !document.root) {
    return null;
  }

  // Direction precedence:
  // 1. explicit renderer direction
  // 2. document.metadata.direction
  // 3. undefined -> inherit naturally from host DOM (do NOT force LTR fallback)
  const resolvedDir = explicitDirection ?? document.metadata?.direction;

  // Language precedence:
  // 1. explicit renderer lang
  // 2. document.metadata.locale
  // 3. undefined -> inherit naturally from host DOM
  const resolvedLang = explicitLang ?? document.metadata?.locale;

  const resolvedComponents: ComponentMap =
    components instanceof RendererRegistry ? components.getAll() : components;

  const content = (
    <RenderNode
      key={document.root.id}
      node={document.root}
      components={resolvedComponents}
      breakpoint={breakpoint}
      fallback={fallback}
      onUnknownComponent={onUnknownComponent}
      onError={onError}
    />
  );

  // If root container attributes are present (dir, lang, className, style), render root container element
  if (resolvedDir !== undefined || resolvedLang !== undefined || className || style) {
    return (
      <div
        className={className}
        style={style}
        dir={resolvedDir}
        lang={resolvedLang}
        data-irich-renderer-root=""
      >
        {content}
      </div>
    );
  }

  return content;
};

/**
 * Helper function to render an IRichDocument into a React element tree.
 */
export function renderDocument(
  document: IRichDocument,
  components: ComponentMap | RendererRegistry,
  options: RenderOptions = {},
): React.ReactElement | null {
  return (
    <IRichRenderer
      document={document}
      components={components}
      breakpoint={options.breakpoint}
      direction={options.direction}
      lang={options.lang}
      fallback={options.fallback}
      onUnknownComponent={options.onUnknownComponent}
      onError={options.onError}
    />
  );
}
