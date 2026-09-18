/**
 * @irich/plugin-sdk
 * Custom error classes for the plugin subsystem.
 */

import { IRichError } from '@irich/core';

/**
 * Thrown when attempting to register a plugin whose name is already registered.
 */
export class DuplicatePluginError extends IRichError {
  constructor(public readonly pluginName: string, message?: string) {
    super(
      message ?? `Plugin "${pluginName}" is already registered in the plugin manager.`,
      'DUPLICATE_PLUGIN',
    );
    this.name = 'DuplicatePluginError';
  }
}

/**
 * Thrown when querying or unregistering a plugin that does not exist in the manager.
 */
export class PluginNotFoundError extends IRichError {
  constructor(public readonly pluginName: string, message?: string) {
    super(
      message ?? `Plugin "${pluginName}" was not found in the plugin manager.`,
      'PLUGIN_NOT_FOUND',
    );
    this.name = 'PluginNotFoundError';
  }
}

/**
 * Thrown when a plugin command fails during execution or is not registered.
 */
export class PluginCommandError extends IRichError {
  constructor(public readonly commandName: string, message: string) {
    super(
      `Plugin command "${commandName}" failed: ${message}`,
      'PLUGIN_COMMAND_ERROR',
    );
    this.name = 'PluginCommandError';
  }
}
