/**
 * @irich/core
 * Security, sanitization, and prototype pollution defenses for AI-generated payloads.
 */

import type { AIValidationErrorCode } from './types';

export interface SecurityCheckResult {
  readonly safe: boolean;
  readonly reason?: string;
  readonly code?: AIValidationErrorCode;
  readonly path?: string;
}

const FORBIDDEN_OBJECT_KEYS = new Set(['__proto__', 'constructor', 'prototype']);

const DANGEROUS_STRING_PATTERNS = [
  /<\s*script\b[^>]*>/i,
  /javascript\s*:/i,
  /vbscript\s*:/i,
  /data\s*:\s*text\/html/i,
  /on\w+\s*=/i, // inline event handlers e.g. onload=, onerror=
];

/**
 * Checks if a string contains executable script or dangerous HTML injection patterns.
 */
export function containsDangerousScript(value: string): boolean {
  if (typeof value !== 'string') {
    return false;
  }
  return DANGEROUS_STRING_PATTERNS.some((pattern) => pattern.test(value));
}

/**
 * Recursively validates that a value is strictly serializable JSON, contains zero prototype
 * pollution attempts, has no circular references, and contains no executable functions or classes.
 */
export function isSafeAIValue(
  value: unknown,
  path: string = '$',
  seen: WeakSet<object> = new WeakSet<object>(),
): SecurityCheckResult {
  if (value === null) {
    return { safe: true };
  }

  const type = typeof value;

  if (type === 'string') {
    return { safe: true };
  }

  if (type === 'number') {
    if (!Number.isFinite(value as number)) {
      return {
        safe: false,
        code: 'NON_JSON_VALUE',
        path,
        reason: `Value at "${path}" is not a finite number (${String(value)}).`,
      };
    }
    return { safe: true };
  }

  if (type === 'boolean') {
    return { safe: true };
  }

  if (type === 'undefined' || type === 'function' || type === 'symbol' || type === 'bigint') {
    return {
      safe: false,
      code: 'NON_JSON_VALUE',
      path,
      reason: `Forbidden data type "${type}" detected at "${path}". Only plain JSON primitives, arrays, and objects are permitted.`,
    };
  }

  if (type === 'object') {
    const obj = value as object;

    if (seen.has(obj)) {
      return {
        safe: false,
        code: 'NON_JSON_VALUE',
        path,
        reason: `Circular reference detected at "${path}".`,
      };
    }
    seen.add(obj);

    if (Array.isArray(obj)) {
      for (let i = 0; i < obj.length; i++) {
        const itemResult = isSafeAIValue(obj[i], `${path}[${i}]`, seen);
        if (!itemResult.safe) {
          return itemResult;
        }
      }
      return { safe: true };
    }

    // Check prototype safety: only plain objects (Object.prototype or Object.create(null)) are allowed
    const proto = Object.getPrototypeOf(obj);
    if (proto !== null && proto !== Object.prototype) {
      return {
        safe: false,
        code: 'NON_JSON_VALUE',
        path,
        reason: `Complex class instance or non-plain object (${proto?.constructor?.name ?? 'unknown'}) detected at "${path}".`,
      };
    }

    // Inspect own property keys for prototype pollution attempts
    const ownKeys = Object.getOwnPropertyNames(obj);
    for (const key of ownKeys) {
      if (FORBIDDEN_OBJECT_KEYS.has(key)) {
        return {
          safe: false,
          code: 'PROTOTYPE_POLLUTION',
          path: `${path}.${key}`,
          reason: `Prototype pollution attempt detected with forbidden key "${key}" at "${path}".`,
        };
      }

      const propValue = (obj as Record<string, unknown>)[key];
      const propResult = isSafeAIValue(propValue, `${path}.${key}`, seen);
      if (!propResult.safe) {
        return propResult;
      }
    }

    return { safe: true };
  }

  return {
    safe: false,
    code: 'NON_JSON_VALUE',
    path,
    reason: `Unsupported type at "${path}".`,
  };
}
