/**
 * @irich/react
 * Browser-based LocalStorageAdapter implementing IRichStorageAdapter.
 */

import { StorageError, type IRichDocument, type IRichStorageAdapter } from '@irich/core';

/**
 * Options for configuring LocalStorageAdapter.
 */
export interface LocalStorageAdapterOptions {
  /**
   * Custom key prefix for localStorage entries.
   * Defaults to 'irich:doc:'.
   */
  prefix?: string;

  /**
   * Optional custom Storage implementation (useful for tests or sessionStorage).
   */
  storage?: Storage;
}

/**
 * Browser LocalStorage adapter for persisting iRich documents.
 * Safe for server-side rendering (SSR) environments with explicit runtime checks.
 */
export class LocalStorageAdapter implements IRichStorageAdapter {
  private prefix: string;
  private customStorage?: Storage;

  constructor(options: LocalStorageAdapterOptions = {}) {
    this.prefix = options.prefix ?? 'irich:doc:';
    this.customStorage = options.storage;
  }

  private getKey(id: string): string {
    return `${this.prefix}${id}`;
  }

  private getStorage(operation: 'load' | 'save' | 'delete' | 'list'): Storage {
    if (this.customStorage) {
      return this.customStorage;
    }

    if (typeof window !== 'undefined' && window.localStorage) {
      return window.localStorage;
    }

    throw new StorageError(
      operation,
      'localStorage is not available in the current runtime environment (SSR or storage disabled).',
    );
  }

  public async load(id: string): Promise<IRichDocument | null> {
    if (!id || typeof id !== 'string') {
      throw new StorageError('load', 'Document ID must be a non-empty string.', String(id));
    }

    const storage = this.getStorage('load');
    let raw: string | null = null;

    try {
      raw = storage.getItem(this.getKey(id));
    } catch (err) {
      throw new StorageError(
        'load',
        `Failed to read from localStorage: ${(err as Error).message}`,
        id,
      );
    }

    if (raw === null) {
      return null;
    }

    try {
      return JSON.parse(raw) as IRichDocument;
    } catch (err) {
      throw new StorageError(
        'load',
        `Corrupted JSON document state in localStorage: ${(err as Error).message}`,
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

    const storage = this.getStorage('save');

    try {
      const raw = JSON.stringify(document);
      storage.setItem(this.getKey(id), raw);
    } catch (err) {
      throw new StorageError(
        'save',
        `Failed to save document to localStorage: ${(err as Error).message}`,
        id,
      );
    }
  }

  public async delete(id: string): Promise<void> {
    if (!id || typeof id !== 'string') {
      throw new StorageError('delete', 'Document ID must be a non-empty string.', String(id));
    }

    const storage = this.getStorage('delete');

    try {
      storage.removeItem(this.getKey(id));
    } catch (err) {
      throw new StorageError(
        'delete',
        `Failed to delete document from localStorage: ${(err as Error).message}`,
        id,
      );
    }
  }

  public async list(): Promise<string[]> {
    const storage = this.getStorage('list');
    const ids: string[] = [];

    try {
      for (let i = 0; i < storage.length; i++) {
        const key = storage.key(i);
        if (key && key.startsWith(this.prefix)) {
          ids.push(key.slice(this.prefix.length));
        }
      }
    } catch (err) {
      throw new StorageError(
        'list',
        `Failed to list documents in localStorage: ${(err as Error).message}`,
      );
    }

    return ids;
  }

  public async clear(): Promise<void> {
    const ids = await this.list();
    for (const id of ids) {
      await this.delete(id);
    }
  }
}
