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
  fallback,
  onUnknownComponent = 'fallback',
  onError,
  className,
  style,
}) => {
  if (!document || !document.root) {
    return null;
  }

  const resolvedComponents: ComponentMap =
    components instanceof RendererRegistry ? components.getAll() : components;

  const content = (
    <RenderNode
      key={document.root.id}
      node={document.root}
      components={resolvedComponents}
      fallback={fallback}
      onUnknownComponent={onUnknownComponent}
      onError={onError}
    />
  );

  if (className || style) {
    return (
      <div className={className} style={style} data-irich-renderer-root="">
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
      fallback={options.fallback}
      onUnknownComponent={options.onUnknownComponent}
      onError={options.onError}
    />
  );
}
