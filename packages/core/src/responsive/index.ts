/**
 * @irich/core
 * Responsive value resolution, cascading inheritance, and breakpoint utilities.
 */

import type { FieldDefinition } from '../component/fields';
import type { Breakpoint, JSONValue, ResponsiveObject, ResponsiveValue } from '../types';
import { BREAKPOINTS, DEFAULT_BREAKPOINT } from '../types';

/**
 * Type guard checking whether a given value is a responsive dictionary object
 * containing breakpoint override keys.
 */
export function isResponsiveObject<T = unknown>(value: unknown): value is ResponsiveObject<T> {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) {
    return false;
  }

  const obj = value as Record<string, unknown>;
  return BREAKPOINTS.some((bp) => bp in obj);
}

/**
 * Resolves a responsive value for a target breakpoint following cascading inheritance:
 * - mobile -> fallback to tablet -> fallback to desktop -> fallback to provided defaultValue
 * - tablet -> fallback to desktop -> fallback to provided defaultValue
 * - desktop -> fallback to provided defaultValue
 *
 * If the value is a scalar or not a responsive object, the scalar value is returned directly.
 */
export function resolveResponsiveValue<T>(
  value: ResponsiveValue<T> | undefined,
  breakpoint: Breakpoint = DEFAULT_BREAKPOINT,
  fallback?: T,
): T | undefined {
  if (value === undefined || value === null) {
    return fallback;
  }

  if (!isResponsiveObject<T>(value)) {
    return value as T;
  }

  if (breakpoint === 'mobile') {
    if (value.mobile !== undefined) {
      return value.mobile;
    }
    if (value.tablet !== undefined) {
      return value.tablet;
    }
    if (value.desktop !== undefined) {
      return value.desktop;
    }
    return fallback;
  }

  if (breakpoint === 'tablet') {
    if (value.tablet !== undefined) {
      return value.tablet;
    }
    if (value.desktop !== undefined) {
      return value.desktop;
    }
    return fallback;
  }

  // Desktop (base)
  if (value.desktop !== undefined) {
    return value.desktop;
  }

  return fallback;
}

/**
 * Retrieves the explicit value configured for a specific breakpoint without cascading.
 */
export function getResponsiveBreakpointValue<T>(
  value: ResponsiveValue<T> | undefined,
  breakpoint: Breakpoint,
): T | undefined {
  if (value === undefined || value === null) {
    return undefined;
  }

  if (isResponsiveObject<T>(value)) {
    return value[breakpoint];
  }

  // If scalar, it acts as the desktop/base value
  return breakpoint === DEFAULT_BREAKPOINT ? (value as T) : undefined;
}

/**
 * Immutably sets a value for a specific breakpoint on a property value.
 * Preserves existing overrides and non-destructively updates the responsive object.
 *
 * @example
 * ```ts
 * // Modifying mobile when current value is scalar "left"
 * setResponsiveBreakpointValue("left", "mobile", "center")
 * // => { desktop: "left", mobile: "center" }
 *
 * // Modifying desktop when current value has mobile override
 * setResponsiveBreakpointValue({ desktop: "left", mobile: "center" }, "desktop", "right")
 * // => { desktop: "right", mobile: "center" }
 * ```
 */
export function setResponsiveBreakpointValue<T>(
  currentValue: ResponsiveValue<T> | undefined,
  breakpoint: Breakpoint,
  newValue: T,
): ResponsiveValue<T> {
  if (isResponsiveObject<T>(currentValue)) {
    return {
      ...currentValue,
      [breakpoint]: newValue,
    };
  }

  // If setting desktop and there are no existing breakpoint overrides
  if (breakpoint === DEFAULT_BREAKPOINT) {
    return newValue;
  }

  // If setting a non-desktop breakpoint from undefined or scalar
  const baseValue = currentValue as T | undefined;
  const result: Record<string, T | undefined> = {
    [breakpoint]: newValue,
  };

  if (baseValue !== undefined && baseValue !== null) {
    result[DEFAULT_BREAKPOINT] = baseValue;
  }

  return result as ResponsiveObject<T>;
}

/**
 * Removes a breakpoint override from a responsive value, reverting it to cascading inheritance.
 */
export function removeResponsiveBreakpointOverride<T>(
  currentValue: ResponsiveValue<T> | undefined,
  breakpoint: Breakpoint,
): ResponsiveValue<T> | undefined {
  if (!isResponsiveObject<T>(currentValue)) {
    return breakpoint === DEFAULT_BREAKPOINT ? undefined : currentValue;
  }

  const updated: Record<string, T | undefined> = { ...currentValue };
  delete updated[breakpoint];

  const keys = Object.keys(updated).filter((k) => updated[k] !== undefined);
  if (keys.length === 0) {
    return undefined;
  }

  // If only desktop remains, can simplify back to scalar if desired, or keep as object
  if (keys.length === 1 && keys[0] === DEFAULT_BREAKPOINT && updated.desktop !== undefined) {
    return updated.desktop;
  }

  return updated as ResponsiveObject<T>;
}

/**
 * Resolves all responsive properties of a node for a given breakpoint.
 */
export function resolveNodeProps(
  props: Record<string, JSONValue> | undefined,
  breakpoint: Breakpoint = DEFAULT_BREAKPOINT,
  fields?: Record<string, FieldDefinition>,
): Record<string, JSONValue> {
  if (!props) {
    return {};
  }

  const resolved: Record<string, JSONValue> = {};

  for (const [key, val] of Object.entries(props)) {
    const fieldDef = fields?.[key];

    // If schema explicitly specifies responsive: false and val is not responsive, pass through
    if (fieldDef && fieldDef.responsive === false && !isResponsiveObject(val)) {
      resolved[key] = val;
      continue;
    }

    if (isResponsiveObject(val)) {
      const fallback = fieldDef?.defaultValue;
      const res = resolveResponsiveValue(val as ResponsiveValue<JSONValue>, breakpoint, fallback);
      resolved[key] = (res !== undefined ? res : null) as JSONValue;
    } else {
      resolved[key] = val;
    }
  }

  return resolved;
}
