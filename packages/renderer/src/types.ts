/**
 * @irich/renderer
 * Types and interfaces for the lightweight React renderer.
 */

import type React from 'react';
import type { IRichDocument, IRichNode, NodeId } from '@irich/core';
import type { RendererRegistry } from './registry';

/**
 * Standard props passed to custom React component renderers.
 */
export type NodeRendererProps<Props = Record<string, unknown>> = Props & {
  /**
   * The canonical node data model.
   */
  readonly node: IRichNode;

  /**
   * Unique ID of the node.
   */
  readonly id: NodeId;

  /**
   * Rendered child components for default children array.
   */
  readonly children?: React.ReactNode;

  /**
   * Rendered slot nodes for named multi-zone layout slots.
   */
  readonly slots?: Readonly<Record<string, React.ReactNode>>;
};

/**
 * React component type for rendering an individual node type.
 */
export type ComponentRenderer<Props = Record<string, unknown>> = React.ComponentType<
  NodeRendererProps<Props>
>;

/**
 * Dictionary mapping node types to their React component renderers.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ComponentMap = Record<string, ComponentRenderer<any>>;

/**
 * Properties passed to the fallback component when an unregistered component is encountered.
 */
export interface UnknownComponentProps {
  readonly node: IRichNode;
  readonly availableComponents: readonly string[];
}

/**
 * Strategy for handling unknown / unregistered component types:
 * - 'fallback' (default): Render a visual placeholder (DefaultUnknownComponent).
 * - 'ignore': Render nothing (null).
 * - 'throw': Throw an error.
 * - custom function: Return a custom ReactNode.
 */
export type UnknownComponentBehavior =
  | 'fallback'
  | 'ignore'
  | 'throw'
  | ((node: IRichNode, availableComponents: readonly string[]) => React.ReactNode);

/**
 * Props for the root <IRichRenderer /> component.
 */
export interface IRichRendererProps {
  /**
   * The canonical JSON-serializable iRich document to render.
   */
  readonly document: IRichDocument;

  /**
   * Dictionary or registry mapping component types to React component renderers.
   */
  readonly components: ComponentMap | RendererRegistry;

  /**
   * Custom fallback component rendered when encountering an unregistered component type.
   */
  readonly fallback?: React.ComponentType<UnknownComponentProps>;

  /**
   * Strategy for handling unknown component types (default: 'fallback').
   */
  readonly onUnknownComponent?: UnknownComponentBehavior;

  /**
   * Optional callback when an error occurs during rendering a node.
   */
  readonly onError?: (error: Error, node: IRichNode) => void;

  /**
   * Optional wrapper container class name.
   */
  readonly className?: string;

  /**
   * Optional wrapper container inline styles.
   */
  readonly style?: React.CSSProperties;
}

/**
 * Props for the standalone / internal <RenderNode /> component.
 */
export interface RenderNodeProps {
  readonly node: IRichNode;
  readonly components: ComponentMap;
  readonly fallback?: React.ComponentType<UnknownComponentProps>;
  readonly onUnknownComponent?: UnknownComponentBehavior;
  readonly onError?: (error: Error, node: IRichNode) => void;
}

/**
 * Optional settings for functional render helpers.
 */
export interface RenderOptions {
  readonly fallback?: React.ComponentType<UnknownComponentProps>;
  readonly onUnknownComponent?: UnknownComponentBehavior;
  readonly onError?: (error: Error, node: IRichNode) => void;
}
