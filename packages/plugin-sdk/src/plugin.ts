/**
 * @irich/plugin-sdk
 * Factory and declaration helper for creating plugins.
 */

import type { IRichPlugin } from './types';

/**
 * Defines a strongly typed iRich plugin with runtime metadata validation.
 *
 * @example
 * ```ts
 * export const wordCountPlugin = definePlugin({
 *   name: 'word-count',
 *   version: '1.0.0',
 *   setup(ctx) {
 *     console.log('Word count initialized for document:', ctx.getDocument());
 *   },
 * });
 * ```
 */
export function definePlugin<T extends IRichPlugin>(plugin: T): T {
  if (!plugin || typeof plugin !== 'object') {
    throw new TypeError('Plugin definition must be a non-null object.');
  }

  if (typeof plugin.name !== 'string' || plugin.name.trim() === '') {
    throw new TypeError('Plugin definition must have a valid non-empty string "name".');
  }

  return plugin;
}
