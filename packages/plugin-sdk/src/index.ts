/**
 * @irich/plugin-sdk
 * Extensibility API and helper functions for creating iRich plugins.
 */

import type { IRichNode, Editor } from '@irich/core';

export interface PluginContext {
  editor: Editor;
}

export interface IRichPlugin {
  name: string;
  version?: string;
  init?: (context: PluginContext) => void;
  renderNode?: (node: IRichNode) => unknown;
}

export function definePlugin(plugin: IRichPlugin): IRichPlugin {
  return plugin;
}
