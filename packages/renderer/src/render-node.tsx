/**
 * @irich/renderer
 * Recursive node renderer component and traversal helper.
 */

import React from 'react';
import { resolveNodeProps, type IRichNode } from '@irich/core';
import { DefaultUnknownComponent } from './fallback';
import type { ComponentMap, RenderNodeProps, RenderOptions } from './types';

export type { RenderOptions } from './types';

/**
 * Recursively renders an individual IRichNode with its children and slots.
 */
export const RenderNode: React.FC<RenderNodeProps> = ({
  node,
  components,
  breakpoint = 'desktop',
  fallback,
  onUnknownComponent = 'fallback',
  onError,
}) => {
  if (!node || !node.id) {
    return null;
  }

  // 1. Render default children recursively
  let renderedChildren: React.ReactNode = undefined;
  if (node.children && node.children.length > 0) {
    renderedChildren = node.children.map((child) => (
      <RenderNode
        key={child.id}
        node={child}
        components={components}
        breakpoint={breakpoint}
        fallback={fallback}
        onUnknownComponent={onUnknownComponent}
        onError={onError}
      />
    ));
  }

  // 2. Render named slots recursively
  let renderedSlots: Record<string, React.ReactNode> | undefined = undefined;
  if (node.slots) {
    renderedSlots = {};
    for (const [slotName, slotNodes] of Object.entries(node.slots)) {
      if (slotNodes && slotNodes.length > 0) {
        renderedSlots[slotName] = slotNodes.map((child) => (
          <RenderNode
            key={child.id}
            node={child}
            components={components}
            breakpoint={breakpoint}
            fallback={fallback}
            onUnknownComponent={onUnknownComponent}
            onError={onError}
          />
        ));
      } else {
        renderedSlots[slotName] = null;
      }
    }
  }

  // 3. Resolve responsive props for active breakpoint
  const resolvedProps = resolveNodeProps(node.props, breakpoint);

  // 4. Special handling for root container if not explicitly mapped
  if (node.type === 'root') {
    const RootComponent = components[node.type];
    if (RootComponent) {
      return (
        <RootComponent
          {...resolvedProps}
          node={node}
          id={node.id}
          children={renderedChildren}
          slots={renderedSlots}
        />
      );
    }

    // Default root pass-through
    return <React.Fragment>{renderedChildren}</React.Fragment>;
  }

  // 5. Resolve registered component
  const Component = components[node.type];

  if (Component) {
    try {
      return (
        <Component
          {...resolvedProps}
          node={node}
          id={node.id}
          children={renderedChildren}
          slots={renderedSlots}
        />
      );
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      if (onError) {
        onError(error, node);
      } else {
        // Re-throw in dev for easy debugging
        throw error;
      }
      return null;
    }
  }

  // 6. Unknown component handling
  const availableComponents = Object.keys(components);

  if (onUnknownComponent === 'ignore') {
    return null;
  }

  if (onUnknownComponent === 'throw') {
    const error = new Error(
      `[iRich Renderer] Unregistered component type "${node.type}" (ID: "${node.id}"). Available: [${availableComponents.join(', ')}]`,
    );
    if (onError) {
      onError(error, node);
      return null;
    }
    throw error;
  }

  if (typeof onUnknownComponent === 'function') {
    return <React.Fragment>{onUnknownComponent(node, availableComponents)}</React.Fragment>;
  }

  // Fallback visual placeholder
  const FallbackComponent = fallback ?? DefaultUnknownComponent;
  return <FallbackComponent node={node} availableComponents={availableComponents} />;
};

/**
 * Functional helper to render a single IRichNode to React elements.
 */
export function renderNode(
  node: IRichNode,
  components: ComponentMap,
  options: RenderOptions = {},
): React.ReactElement | null {
  return (
    <RenderNode
      key={node.id}
      node={node}
      components={components}
      breakpoint={options.breakpoint}
      fallback={options.fallback}
      onUnknownComponent={options.onUnknownComponent}
      onError={options.onError}
    />
  );
}
