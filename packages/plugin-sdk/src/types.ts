/**
 * @irich/plugin-sdk
 * Types and interfaces for plugins, lifecycle hooks, commands, and plugin context.
 */

import type {
  ComponentDefinition,
  EditorCommands,
  EditorEventListener,
  EditorEventMap,
  EditorInstance,
  EditorState,
  IRichDocument,
  IRichNode,
  NodeId,
} from '@irich/core';

/**
 * Cleanup callback returned by a plugin's setup function.
 */
export type PluginCleanupFn = () => void;

/**
 * Setup lifecycle function executed when a plugin is registered and initialized.
 */
export type PluginSetupFn = (
  ctx: PluginContext,
) => void | PluginCleanupFn | Promise<void | PluginCleanupFn>;

/**
 * Custom command handler contributed by a plugin.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type PluginCommandHandler<TPayload = any, TResult = any> = (
  ctx: PluginContext,
  payload: TPayload,
) => TResult;

/**
 * Safe, isolated context provided to a plugin instance.
 * Exposes read-only queries, transaction commands, and managed event listeners.
 */
export interface PluginContext {
  /**
   * Unique name identifier of the plugin.
   */
  readonly pluginName: string;

  /**
   * Retrieves an immutable snapshot of current editor state.
   */
  getState(): EditorState;

  /**
   * Retrieves the canonical document AST.
   */
  getDocument(): IRichDocument;

  /**
   * Retrieves the currently selected node ID (or null if none).
   */
  getSelection(): NodeId | null;

  /**
   * Retrieves an individual node by its ID from the document hierarchy.
   */
  getNode(nodeId: NodeId): IRichNode | undefined;

  /**
   * Core editor mutation commands (dispatched via immutable transaction pipeline).
   */
  readonly commands: EditorCommands;

  /**
   * Executes a custom plugin command registered in the plugin manager.
   */
  executeCommand<TResult = unknown>(commandName: string, payload?: unknown): TResult;

  /**
   * Checks if a plugin command is registered.
   */
  hasCommand(commandName: string): boolean;

  /**
   * Subscribes to editor lifecycle and mutation events.
   * Listeners are automatically tracked and unbound when the plugin is destroyed.
   */
  on<K extends keyof EditorEventMap>(
    event: K,
    listener: EditorEventListener<K>,
  ): () => void;

  /**
   * Subscribes to editor state transitions.
   * Listeners are automatically tracked and unbound when the plugin is destroyed.
   */
  subscribe(listener: (state: EditorState) => void): () => void;
}

/**
 * Declaration contract for an iRich plugin.
 */
export interface IRichPlugin {
  /**
   * Unique identifier for the plugin (e.g. 'word-count', 'autosave', 'analytics').
   */
  readonly name: string;

  /**
   * Optional SemVer string (e.g. '1.0.0').
   */
  readonly version?: string;

  /**
   * Setup lifecycle hook executed when the plugin is initialized.
   * May return a cleanup function to tear down timers, streams, or listeners.
   */
  readonly setup?: PluginSetupFn;

  /**
   * Cleanup lifecycle hook executed when the plugin is unregistered or the editor is destroyed.
   */
  readonly destroy?: (ctx: PluginContext) => void;

  /**
   * Component definitions contributed by this plugin.
   * Automatically registered in the editor's ComponentRegistry if present.
   */
  readonly components?: readonly ComponentDefinition[];

  /**
   * Custom commands contributed by this plugin.
   */
  readonly commands?: Record<string, PluginCommandHandler>;

  /**
   * Event handlers automatically bound on initialization and cleaned up on unregistration.
   */
  readonly events?: {
    readonly [K in keyof EditorEventMap]?: (
      payload: EditorEventMap[K],
      ctx: PluginContext,
    ) => void;
  };

  /**
   * Reserved for future UI panel contributions.
   */
  readonly panels?: readonly unknown[];

  /**
   * Reserved for future custom field type contributions.
   */
  readonly fieldTypes?: readonly unknown[];
}

/**
 * Configuration options for creating a PluginManager instance.
 */
export interface PluginManagerConfig {
  /**
   * Optional initial EditorInstance to bind plugins to.
   */
  editor?: EditorInstance;

  /**
   * Initial array of plugins to register.
   */
  plugins?: readonly IRichPlugin[];
}
