/**
 * @irich/plugin-sdk
 * Plugin lifecycle manager, command executor, and safe context provider.
 */

import type {
  ComponentDefinition,
  EditorEventListener,
  EditorEventMap,
  EditorInstance,
  EditorState,
  IRichDocument,
  IRichNode,
  NodeId,
} from '@irich/core';
import { DuplicatePluginError, PluginCommandError, PluginNotFoundError } from './errors';
import type {
  IRichPlugin,
  PluginCommandHandler,
  PluginContext,
  PluginManagerConfig,
} from './types';

interface ActivePluginSession {
  readonly plugin: IRichPlugin;
  readonly context: PluginContext;
  cleanupFn?: () => void;
  readonly unbindListeners: Array<() => void>;
  readonly registeredComponents: Array<ComponentDefinition>;
  readonly registeredCommands: string[];
}

export class PluginManager {
  private editor?: EditorInstance;
  private plugins = new Map<string, IRichPlugin>();
  private activeSessions = new Map<string, ActivePluginSession>();
  private commands = new Map<
    string,
    { handler: PluginCommandHandler; pluginName: string }
  >();
  private isDestroyed = false;

  constructor(config: PluginManagerConfig = {}) {
    if (config.editor) {
      this.editor = config.editor;
    }

    if (config.plugins) {
      for (const plugin of config.plugins) {
        this.register(plugin);
      }
    }
  }

  /**
   * Initializes the plugin manager with an active EditorInstance.
   * If plugins were registered prior to init, they will be set up in order.
   */
  public init(editor: EditorInstance): void {
    if (this.isDestroyed) {
      throw new Error('Cannot initialize a destroyed PluginManager.');
    }

    this.editor = editor;

    // Activate all currently registered plugins
    for (const plugin of this.plugins.values()) {
      if (!this.activeSessions.has(plugin.name)) {
        this.activatePlugin(plugin);
      }
    }
  }

  /**
   * Registers a new plugin into the manager.
   * If the manager is already initialized with an editor, the plugin is activated immediately.
   */
  public register(plugin: IRichPlugin): void {
    if (this.isDestroyed) {
      throw new Error('Cannot register plugins in a destroyed PluginManager.');
    }

    if (!plugin || typeof plugin.name !== 'string' || plugin.name.trim() === '') {
      throw new TypeError('Plugin definition must have a valid non-empty string "name".');
    }

    if (this.plugins.has(plugin.name)) {
      throw new DuplicatePluginError(plugin.name);
    }

    this.plugins.set(plugin.name, plugin);

    if (this.editor) {
      this.activatePlugin(plugin);
    }
  }

  /**
   * Unregisters an existing plugin, tearing down all its listeners, commands, and components.
   */
  public unregister(pluginName: string): void {
    const plugin = this.plugins.get(pluginName);
    if (!plugin) {
      throw new PluginNotFoundError(pluginName);
    }

    this.deactivatePlugin(pluginName);
    this.plugins.delete(pluginName);
  }

  /**
   * Checks if a plugin is registered.
   */
  public has(pluginName: string): boolean {
    return this.plugins.has(pluginName);
  }

  /**
   * Retrieves a registered plugin by name.
   */
  public get(pluginName: string): IRichPlugin | undefined {
    return this.plugins.get(pluginName);
  }

  /**
   * Returns a list of all registered plugins.
   */
  public getAll(): IRichPlugin[] {
    return Array.from(this.plugins.values());
  }

  /**
   * Checks if a custom plugin command is registered.
   */
  public hasCommand(commandName: string): boolean {
    return this.commands.has(commandName);
  }

  /**
   * Returns a list of all registered plugin command names.
   */
  public getCommands(): string[] {
    return Array.from(this.commands.keys());
  }

  /**
   * Executes a registered plugin command.
   */
  public executeCommand<TResult = unknown>(
    commandName: string,
    payload?: unknown,
  ): TResult {
    const entry = this.commands.get(commandName);
    if (!entry) {
      throw new PluginCommandError(commandName, 'Command is not registered.');
    }

    const session = this.activeSessions.get(entry.pluginName);
    if (!session) {
      throw new PluginCommandError(
        commandName,
        `Host plugin "${entry.pluginName}" is not currently active.`,
      );
    }

    return entry.handler(session.context, payload) as TResult;
  }

  /**
   * Destroys the plugin manager and tears down all active plugin sessions in reverse order.
   */
  public destroy(): void {
    if (this.isDestroyed) {
      return;
    }

    this.isDestroyed = true;

    // Deactivate in reverse registration order
    const pluginNames = Array.from(this.plugins.keys()).reverse();
    for (const name of pluginNames) {
      this.deactivatePlugin(name);
    }

    this.plugins.clear();
    this.commands.clear();
    this.editor = undefined;
  }

  // --- INTERNAL LIFECYCLE MANAGEMENT ---

  private activatePlugin(plugin: IRichPlugin): void {
    if (!this.editor) {
      return;
    }

    const editor = this.editor;
    const unbindListeners: Array<() => void> = [];
    const registeredComponents: Array<ComponentDefinition> = [];
    const registeredCommands: string[] = [];

    // 1. Construct safe plugin context
    const context: PluginContext = {
      pluginName: plugin.name,
      getState: (): EditorState => editor.getState(),
      getDocument: (): IRichDocument => editor.getDocument(),
      getSelection: (): NodeId | null => editor.getSelection(),
      getNode: (nodeId: NodeId): IRichNode | undefined => editor.getNode(nodeId),
      commands: editor.commands,
      executeCommand: <TResult = unknown>(commandName: string, payload?: unknown): TResult => {
        return this.executeCommand<TResult>(commandName, payload);
      },
      hasCommand: (commandName: string): boolean => {
        return this.hasCommand(commandName);
      },
      on: <K extends keyof EditorEventMap>(
        event: K,
        listener: EditorEventListener<K>,
      ): (() => void) => {
        const unsubscribe = editor.on(event, listener);
        unbindListeners.push(unsubscribe);
        return () => {
          unsubscribe();
          const idx = unbindListeners.indexOf(unsubscribe);
          if (idx !== -1) unbindListeners.splice(idx, 1);
        };
      },
      subscribe: (listener: (state: EditorState) => void): (() => void) => {
        const unsubscribe = editor.subscribe(listener);
        unbindListeners.push(unsubscribe);
        return () => {
          unsubscribe();
          const idx = unbindListeners.indexOf(unsubscribe);
          if (idx !== -1) unbindListeners.splice(idx, 1);
        };
      },
    };

    // 2. Register contributed components
    if (plugin.components && plugin.components.length > 0) {
      const registry = editor.getRegistry();
      if (registry) {
        for (const comp of plugin.components) {
          registry.register(comp);
          registeredComponents.push(comp);
        }
      }
    }

    // 3. Register contributed commands
    if (plugin.commands) {
      for (const [cmdName, handler] of Object.entries(plugin.commands)) {
        if (this.commands.has(cmdName)) {
          const existing = this.commands.get(cmdName)!;
          console.warn(
            `Plugin command "${cmdName}" from "${plugin.name}" overrides previous command from "${existing.pluginName}".`,
          );
        }
        this.commands.set(cmdName, { handler, pluginName: plugin.name });
        registeredCommands.push(cmdName);
      }
    }

    // 4. Bind declarative event listeners
    if (plugin.events) {
      for (const [eventName, handler] of Object.entries(plugin.events)) {
        if (handler) {
          const unsubscribe = editor.on(
            eventName as keyof EditorEventMap,
            (payload) => {
              try {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                (handler as any)(payload, context);
              } catch (err) {
                console.error(
                  `Error in plugin "${plugin.name}" event handler for "${eventName}":`,
                  err,
                );
              }
            },
          );
          unbindListeners.push(unsubscribe);
        }
      }
    }

    // 5. Create active session record
    const session: ActivePluginSession = {
      plugin,
      context,
      unbindListeners,
      registeredComponents,
      registeredCommands,
    };
    this.activeSessions.set(plugin.name, session);

    // 6. Execute setup lifecycle hook
    if (plugin.setup) {
      try {
        const result = plugin.setup(context);
        if (typeof result === 'function') {
          session.cleanupFn = result;
        } else if (result && typeof (result as Promise<unknown>).then === 'function') {
          (result as Promise<void | (() => void)>)
            .then((resolvedCleanup) => {
              if (typeof resolvedCleanup === 'function' && this.activeSessions.has(plugin.name)) {
                session.cleanupFn = resolvedCleanup;
              }
            })
            .catch((err) => {
              console.error(`Error in async setup for plugin "${plugin.name}":`, err);
            });
        }
      } catch (err) {
        console.error(`Error during setup for plugin "${plugin.name}":`, err);
      }
    }
  }

  private deactivatePlugin(pluginName: string): void {
    const session = this.activeSessions.get(pluginName);
    if (!session) {
      return;
    }

    const { plugin, context, cleanupFn, unbindListeners, registeredComponents, registeredCommands } =
      session;

    // 1. Execute setup cleanup function
    if (cleanupFn) {
      try {
        cleanupFn();
      } catch (err) {
        console.error(`Error during cleanup callback for plugin "${pluginName}":`, err);
      }
    }

    // 2. Execute destroy lifecycle hook
    if (plugin.destroy) {
      try {
        plugin.destroy(context);
      } catch (err) {
        console.error(`Error during destroy hook for plugin "${pluginName}":`, err);
      }
    }

    // 3. Unbind all tracked event and state listeners
    for (const unbind of unbindListeners) {
      try {
        unbind();
      } catch (err) {
        console.error(`Error unbinding event listener for plugin "${pluginName}":`, err);
      }
    }
    unbindListeners.length = 0;

    // 4. Unregister contributed components from ComponentRegistry
    if (this.editor && registeredComponents.length > 0) {
      const registry = this.editor.getRegistry();
      if (registry) {
        for (const comp of registeredComponents) {
          try {
            registry.unregister(comp.type);
          } catch (err) {
            console.error(`Error unregistering component "${comp.type}" for plugin "${pluginName}":`, err);
          }
        }
      }
    }

    // 5. Remove contributed commands
    for (const cmdName of registeredCommands) {
      this.commands.delete(cmdName);
    }

    this.activeSessions.delete(pluginName);
  }
}

/**
 * Factory helper for instantiating a PluginManager.
 */
export function createPluginManager(config?: PluginManagerConfig): PluginManager {
  return new PluginManager(config);
}
