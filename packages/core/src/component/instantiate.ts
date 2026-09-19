/**
 * @irich/core
 * Centralized component node instantiation from component definitions and registry defaults.
 * Single canonical creation path for palette click insertion, drag-and-drop, and programmatic creation.
 */

import type { IRichNode, JSONValue, NodeId } from '../types';
import { createNode } from '../utils/tree';
import type { ComponentDefinition, InitialChildBlueprint } from './definition';
import type { ComponentRegistry } from './registry';

/**
 * Options for instantiating an IRichNode from a component definition.
 */
export interface InstantiateComponentNodeOptions<
  Props extends Record<string, JSONValue> = Record<string, JSONValue>,
> {
  /**
   * Optional custom node ID override (if omitted, generated automatically).
   */
  readonly id?: NodeId;

  /**
   * Optional props overrides to merge on top of field defaults and component defaultProps.
   */
  readonly props?: Partial<Props>;

  /**
   * Optional children override.
   */
  readonly children?: readonly IRichNode[];

  /**
   * Optional slots override.
   */
  readonly slots?: Record<string, readonly IRichNode[]>;
}

/**
 * Recursively resolves a child blueprint or existing node into a valid IRichNode with generated unique IDs.
 */
function resolveChildBlueprint(
  child: InitialChildBlueprint | IRichNode,
  registry?: ComponentRegistry,
): IRichNode {
  // If it's already a complete IRichNode with an ID, return it as is
  if ('id' in child && typeof child.id === 'string' && child.id.trim()) {
    return child as IRichNode;
  }

  const blueprint = child as InitialChildBlueprint;
  return instantiateComponentNode(blueprint.type, registry, {
    props: blueprint.props,
    children: blueprint.children
      ? blueprint.children.map((c) => resolveChildBlueprint(c, registry))
      : undefined,
    slots: blueprint.slots
      ? Object.fromEntries(
          Object.entries(blueprint.slots).map(([slotName, slotChildren]) => [
            slotName,
            slotChildren.map((slotChild) => resolveChildBlueprint(slotChild, registry)),
          ]),
        )
      : undefined,
  });
}

/**
 * Instantiates a valid, canonical IRichNode from a component definition or registered component type.
 * Automatically resolves field defaults, component defaultProps, and structural child scaffolding
 * declared in `createInitialState()`, ensuring unique ID generation across the entire subtree.
 *
 * This is the SINGLE canonical instantiation path used across palette click insertion,
 * drag-and-drop insertion, and programmatic node instantiation.
 */
export function instantiateComponentNode<
  Props extends Record<string, JSONValue> = Record<string, JSONValue>,
>(
  typeOrDef: string | ComponentDefinition<Props>,
  registry?: ComponentRegistry,
  options?: InstantiateComponentNodeOptions<Props>,
): IRichNode {
  const compDef: ComponentDefinition<Props> | undefined =
    typeof typeOrDef === 'string'
      ? (registry?.get<Props>(typeOrDef) as ComponentDefinition<Props> | undefined)
      : typeOrDef;

  const type = typeof typeOrDef === 'string' ? typeOrDef : typeOrDef.type;
  const defaultProps = registry ? registry.getDefaultProps(type) : (compDef?.defaultProps ?? {});

  const initialState = compDef?.createInitialState ? compDef.createInitialState() : undefined;

  const mergedProps = {
    ...defaultProps,
    ...(initialState?.props ?? {}),
    ...(options?.props ?? {}),
  } as Record<string, JSONValue>;

  let resolvedChildren: readonly IRichNode[] | undefined;
  if (options?.children !== undefined) {
    resolvedChildren = options.children;
  } else if (initialState?.children !== undefined) {
    resolvedChildren = initialState.children.map((child) =>
      resolveChildBlueprint(child, registry),
    );
  } else if (compDef && compDef.canHaveChildren === false) {
    resolvedChildren = undefined;
  } else {
    resolvedChildren = [];
  }

  let resolvedSlots: Record<string, readonly IRichNode[]> | undefined;
  if (options?.slots !== undefined) {
    resolvedSlots = options.slots;
  } else if (initialState?.slots !== undefined) {
    resolvedSlots = Object.fromEntries(
      Object.entries(initialState.slots).map(([slotName, slotChildren]) => [
        slotName,
        slotChildren.map((slotChild) => resolveChildBlueprint(slotChild, registry)),
      ]),
    );
  }

  return createNode({
    id: options?.id,
    type,
    props: mergedProps,
    children: resolvedChildren,
    slots: resolvedSlots,
  });
}
