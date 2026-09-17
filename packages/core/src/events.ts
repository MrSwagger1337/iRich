/**
 * @irich/core
 * Type-safe, dependency-free Event Emitter for editor mutations and lifecycle events.
 */

import type { EditorEventListener, EditorEventMap } from './types';

export class EventEmitter {
  private listeners: {
    [K in keyof EditorEventMap]?: Set<EditorEventListener<K>>;
  } = {};

  /**
   * Registers a callback for a specific event type.
   * Returns an unsubscribe function.
   */
  on<K extends keyof EditorEventMap>(event: K, listener: EditorEventListener<K>): () => void {
    if (!this.listeners[event]) {
      this.listeners[event] = new Set() as never;
    }
    this.listeners[event]!.add(listener);

    return () => {
      this.off(event, listener);
    };
  }

  /**
   * Unregisters a callback for a specific event type.
   */
  off<K extends keyof EditorEventMap>(event: K, listener: EditorEventListener<K>): void {
    const set = this.listeners[event];
    if (set) {
      set.delete(listener);
      if (set.size === 0) {
        delete this.listeners[event];
      }
    }
  }

  /**
   * Emits an event to all registered listeners.
   */
  emit<K extends keyof EditorEventMap>(event: K, payload: EditorEventMap[K]): void {
    const set = this.listeners[event];
    if (set) {
      // Iterate over a shallow copy to prevent issues if a listener unsubscribes during emit
      for (const listener of Array.from(set)) {
        try {
          listener(payload);
        } catch (err) {
          console.error(`Error in iRich event listener for "${event}":`, err);
        }
      }
    }
  }

  /**
   * Clears all registered listeners.
   */
  clear(): void {
    this.listeners = {};
  }
}
