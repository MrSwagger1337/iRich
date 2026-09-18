/**
 * @irich/core
 * Storage adapter interface, errors, and memory storage implementation.
 */

import type { IRichDocument } from '../types';
import { StorageError } from '../errors';

/**
 * Common contract for asynchronous document persistence backends.
 */
export interface IRichStorageAdapter {
  /**
   * Loads an IRichDocument by its unique ID.
   * Returns null if the document does not exist.
   */
  load(id: string): Promise<IRichDocument | null>;

  /**
   * Persists an IRichDocument under the given unique ID.
   */
  save(id: string, document: IRichDocument): Promise<void>;

  /**
   * Deletes a document by ID.
   */
  delete?(id: string): Promise<void>;

  /**
   * Lists all available document IDs in the storage.
   */
  list?(): Promise<string[]>;
}

/**
 * Options for configuring MemoryStorageAdapter.
 */
export interface MemoryStorageAdapterOptions {
  /**
   * Initial map of document IDs to IRichDocument objects.
   */
  initialData?: Record<string, IRichDocument>;
}

/**
 * In-memory storage adapter for unit tests, headless Node.js, and transient sessions.
 * Stores JSON-serialized copies to enforce JSON-serializability and isolation.
 */
export class MemoryStorageAdapter implements IRichStorageAdapter {
  private storage = new Map<string, string>();

  constructor(options: MemoryStorageAdapterOptions = {}) {
    if (options.initialData) {
      for (const [id, doc] of Object.entries(options.initialData)) {
        this.storage.set(id, JSON.stringify(doc));
      }
    }
  }

  public async load(id: string): Promise<IRichDocument | null> {
    if (!id || typeof id !== 'string') {
      throw new StorageError('load', 'Document ID must be a non-empty string.', String(id));
    }

    const raw = this.storage.get(id);
    if (raw === undefined) {
      return null;
    }

    try {
      return JSON.parse(raw) as IRichDocument;
    } catch (err) {
      throw new StorageError(
        'load',
        `Corrupted JSON document state in memory: ${(err as Error).message}`,
        id,
      );
    }
  }

  public async save(id: string, document: IRichDocument): Promise<void> {
    if (!id || typeof id !== 'string') {
      throw new StorageError('save', 'Document ID must be a non-empty string.', String(id));
    }

    if (!document || typeof document !== 'object' || !document.root) {
      throw new StorageError('save', 'Invalid document structure provided to save.', id);
    }

    try {
      const raw = JSON.stringify(document);
      this.storage.set(id, raw);
    } catch (err) {
      throw new StorageError(
        'save',
        `Failed to serialize document to JSON: ${(err as Error).message}`,
        id,
      );
    }
  }

  public async delete(id: string): Promise<void> {
    if (!id || typeof id !== 'string') {
      throw new StorageError('delete', 'Document ID must be a non-empty string.', String(id));
    }

    this.storage.delete(id);
  }

  public async list(): Promise<string[]> {
    return Array.from(this.storage.keys());
  }

  public clear(): void {
    this.storage.clear();
  }

  public size(): number {
    return this.storage.size;
  }
}
