/**
 * @irich/plugin-sdk
 * Extensibility API, lifecycle manager, and helper functions for creating iRich plugins.
 */

// Plugin Definition
export { definePlugin } from './plugin';

// Plugin Manager & Lifecycle
export { PluginManager, createPluginManager } from './manager';

// Error Classes
export {
  DuplicatePluginError,
  PluginNotFoundError,
  PluginCommandError,
} from './errors';

// Types
export type {
  IRichPlugin,
  PluginContext,
  PluginSetupFn,
  PluginCleanupFn,
  PluginCommandHandler,
  PluginManagerConfig,
} from './types';
