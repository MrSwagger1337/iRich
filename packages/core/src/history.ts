/**
 * @irich/core
 * History manager implementing bounded undo/redo stacks with structural snapshot sharing.
 */

import type { IRichDocument, NodeId } from './types';
import { generateId } from './utils/id';

/**
 * An individual snapshot pair representing a state transition in the history journal.
 */
export interface HistoryEntry {
  readonly id: string;
  readonly timestamp: number;
  readonly commandName?: string;
  readonly before: {
    readonly document: IRichDocument;
    readonly selection: NodeId | null;
  };
  readonly after: {
    readonly document: IRichDocument;
    readonly selection: NodeId | null;
  };
}

export interface HistoryOptions {
  /**
   * Maximum number of undoable history entries retained in memory.
   * Default: 100.
   */
  maxSize?: number;

  /**
   * Whether history tracking is enabled.
   * Default: true.
   */
  enabled?: boolean;
}

export const DEFAULT_MAX_HISTORY_SIZE = 100;

export class HistoryManager {
  private undoStack: HistoryEntry[] = [];
  private redoStack: HistoryEntry[] = [];
  private readonly maxSize: number;
  private readonly enabled: boolean;

  constructor(options: HistoryOptions = {}) {
    this.maxSize = Math.max(1, options.maxSize ?? DEFAULT_MAX_HISTORY_SIZE);
    this.enabled = options.enabled ?? true;
  }

  /**
   * Returns whether an undo operation can be performed.
   */
  public canUndo(): boolean {
    return this.enabled && this.undoStack.length > 0;
  }

  /**
   * Returns whether a redo operation can be performed.
   */
  public canRedo(): boolean {
    return this.enabled && this.redoStack.length > 0;
  }

  /**
   * Records a new state transition. Clears the redo stack and bounds the undo stack.
   */
  public record(
    before: { document: IRichDocument; selection: NodeId | null },
    after: { document: IRichDocument; selection: NodeId | null },
    commandName?: string,
  ): void {
    if (!this.enabled) {
      return;
    }

    // No-op check: do not record if document hasn't changed
    if (before.document === after.document) {
      return;
    }

    const entry: HistoryEntry = {
      id: generateId('hist'),
      timestamp: Date.now(),
      commandName,
      before: Object.freeze({
        document: before.document,
        selection: before.selection,
      }),
      after: Object.freeze({
        document: after.document,
        selection: after.selection,
      }),
    };

    this.undoStack.push(entry);

    // Evict oldest entries if capacity exceeded
    if (this.undoStack.length > this.maxSize) {
      this.undoStack.shift();
    }

    // New mutations clear any divergent redo branch
    this.redoStack = [];
  }

  /**
   * Undoes the most recent mutation, popping from undoStack and pushing to redoStack.
   */
  public undo(): HistoryEntry | null {
    if (!this.canUndo()) {
      return null;
    }

    const entry = this.undoStack.pop()!;
    this.redoStack.push(entry);
    return entry;
  }

  /**
   * Redoes the most recently undone mutation, popping from redoStack and pushing to undoStack.
   */
  public redo(): HistoryEntry | null {
    if (!this.canRedo()) {
      return null;
    }

    const entry = this.redoStack.pop()!;
    this.undoStack.push(entry);
    return entry;
  }

  /**
   * Clears all history entries from both stacks.
   */
  public clear(): void {
    this.undoStack = [];
    this.redoStack = [];
  }

  /**
   * Returns count of entries on the undo stack.
   */
  public getUndoCount(): number {
    return this.undoStack.length;
  }

  /**
   * Returns count of entries on the redo stack.
   */
  public getRedoCount(): number {
    return this.redoStack.length;
  }
}
