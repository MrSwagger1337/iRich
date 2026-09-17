/**
 * @irich/core
 * Framework-independent component definition schema and declaration helper.
 * Strictly decoupled from React and DOM execution environments.
 */

import { InvalidComponentError } from '../errors';
import type { JSONValue } from '../types';
import type { FieldDefinition } from './fields';

/**
 * Slot / Dropzone specification for nesting child components inside multi-zone layouts.
 */
export interface SlotDefinition {
  /**
   * Human-readable label displayed in visual editor breadcrumbs and outlines.
   */
  readonly label?: string;

  /**
   * Optional array of component type names permitted in this slot.
   * If omitted, any registered component type can be placed here.
   */
  readonly allowedTypes?: readonly string[];

  /**
   * Maximum number of child nodes permitted in this slot.
   */
  readonly maxChildren?: number;
}

/**
 * Framework-independent component specification in iRich.
 * Contains purely serializable schema, field descriptors, and metadata.
 */
export interface ComponentDefinition<
  Props extends Record<string, JSONValue> = Record<string, JSONValue>,
> {
  /**
   * Unique component type identifier (matches `node.type`).
   */
  readonly type: string;

  /**
   * Human-readable title shown in component palettes and inspector headers.
   */
  readonly label: string;

  /**
   * Optional category grouping in block pickers (e.g. 'Marketing', 'Layout', 'Typography').
   */
  readonly category?: string;

  /**
   * Optional description of the component's purpose.
   */
  readonly description?: string;

  /**
   * Optional icon identifier or name.
   */
  readonly icon?: string;

  /**
   * Declarative fields / prop schemas used for inspector generation and prop validation.
   */
  readonly fields: Record<string, FieldDefinition>;

  /**
   * Optional default props assigned upon insertion.
   * Merged with individual field default values.
   */
  readonly defaultProps?: Partial<Props>;

  /**
   * Optional named slot definitions for nesting child components.
   */
  readonly slots?: Readonly<Record<string, SlotDefinition>>;

  /**
   * Non-rendered component metadata or tags.
   */
  readonly meta?: Readonly<Record<string, JSONValue>>;
}

/**
 * Declares and validates a framework-independent component definition.
 *
 * @example
 * ```typescript
 * export const HeroComponent = defineComponent({
 *   type: 'Hero',
 *   label: 'Hero Section',
 *   category: 'Marketing',
 *   fields: {
 *     title: { type: 'text', label: 'Title', defaultValue: 'Hello World' },
 *     alignment: {
 *       type: 'select',
 *       options: [
 *         { label: 'Left', value: 'left' },
 *         { label: 'Center', value: 'center' },
 *       ],
 *     },
 *   },
 * });
 * ```
 */
export function defineComponent<
  Props extends Record<string, JSONValue> = Record<string, JSONValue>,
>(definition: ComponentDefinition<Props>): ComponentDefinition<Props> {
  if (!definition || typeof definition !== 'object') {
    throw new InvalidComponentError('Component definition must be a non-null object.');
  }

  if (!definition.type || typeof definition.type !== 'string' || !definition.type.trim()) {
    throw new InvalidComponentError('Component definition must have a non-empty string "type".');
  }

  if (!definition.label || typeof definition.label !== 'string' || !definition.label.trim()) {
    throw new InvalidComponentError(
      `Component definition "${definition.type}" must have a non-empty string "label".`,
    );
  }

  if (
    !definition.fields ||
    typeof definition.fields !== 'object' ||
    Array.isArray(definition.fields)
  ) {
    throw new InvalidComponentError(
      `Component definition "${definition.type}" must have a "fields" record object.`,
    );
  }

  return Object.freeze({
    ...definition,
    fields: Object.freeze({ ...definition.fields }),
    defaultProps: definition.defaultProps
      ? Object.freeze({ ...definition.defaultProps })
      : undefined,
    slots: definition.slots ? Object.freeze({ ...definition.slots }) : undefined,
    meta: definition.meta ? Object.freeze({ ...definition.meta }) : undefined,
  });
}
