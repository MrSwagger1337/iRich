/**
 * @irich/core
 * Unique ID generator for document nodes.
 */

import type { NodeId } from '../types';

let counter = 0;

/**
 * Generates a unique, collision-resistant string ID for a document node.
 * Uses crypto.randomUUID when available, with a reliable random fallback.
 */
export function generateId(prefix: string = 'node'): NodeId {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    const uuid = crypto.randomUUID().replace(/-/g, '').slice(0, 12);
    return `${prefix}_${uuid}`;
  }

  counter = (counter + 1) % 1000000;
  const time = Date.now().toString(36);
  const rand = Math.random().toString(36).substring(2, 8);
  const count = counter.toString(36);
  return `${prefix}_${time}${rand}${count}`;
}

/**
 * Checks whether a value is a valid non-empty string ID.
 */
export function isValidId(id: unknown): id is NodeId {
  return typeof id === 'string' && id.trim().length > 0;
}
