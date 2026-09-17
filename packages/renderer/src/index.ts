/**
 * @irich/renderer
 * Lightweight, SSR-compatible React renderer for iRich documents.
 * Completely decoupled from visual editor controls, canvas drag/drop, and property inspectors.
 */

// Core types re-export
export type { IRichDocument, IRichNode, NodeId, JSONValue } from '@irich/core';

// Renderer Components & Functions
export { IRichRenderer, renderDocument } from './renderer';
export { RenderNode, renderNode, type RenderOptions } from './render-node';
export { RendererRegistry, createRenderer } from './registry';
export { DefaultUnknownComponent } from './fallback';

// Example Document & Reference Components
export {
  exampleDocument,
  exampleComponents,
  PageComponent,
  HeroComponent,
  ContainerComponent,
  CardComponent,
  type PageProps,
  type HeroProps,
  type ContainerProps,
  type CardProps,
} from './example';

// Types
export type {
  NodeRendererProps,
  ComponentRenderer,
  ComponentMap,
  UnknownComponentProps,
  UnknownComponentBehavior,
  IRichRendererProps,
  RenderNodeProps,
} from './types';
