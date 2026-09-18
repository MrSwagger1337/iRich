import { describe, it, expect, vi } from 'vitest';
import { createDocument, createNode, StorageError } from '@irich/core';
import { LocalStorageAdapter } from './local-storage';

// Helper to create a mock Storage object
function createMockStorage(): Storage {
  const store = new Map<string, string>();
  return {
    getItem: vi.fn((key: string) => store.get(key) ?? null),
    setItem: vi.fn((key: string, value: string) => store.set(key, value)),
    removeItem: vi.fn((key: string) => store.delete(key)),
    clear: vi.fn(() => store.clear()),
    key: vi.fn((index: number) => Array.from(store.keys())[index] ?? null),
    get length() {
      return store.size;
    },
  };
}

describe('LocalStorageAdapter', () => {
  it('should save, load, delete, and list documents using storage with custom prefix', async () => {
    const mockStorage = createMockStorage();
    const adapter = new LocalStorageAdapter({
      prefix: 'custom:doc:',
      storage: mockStorage,
    });

    const doc = createDocument({
      root: createNode({ id: 'root', type: 'root', props: { title: 'Test' } }),
    });

    await adapter.save('doc-1', doc);
    expect(mockStorage.setItem).toHaveBeenCalledWith('custom:doc:doc-1', JSON.stringify(doc));

    const loaded = await adapter.load('doc-1');
    expect(loaded).toEqual(doc);

    const list = await adapter.list();
    expect(list).toEqual(['doc-1']);

    await adapter.delete('doc-1');
    expect(await adapter.load('doc-1')).toBeNull();
    expect(await adapter.list()).toEqual([]);
  });

  it('should return null for non-existent document ID', async () => {
    const mockStorage = createMockStorage();
    const adapter = new LocalStorageAdapter({ storage: mockStorage });

    const result = await adapter.load('missing');
    expect(result).toBeNull();
  });

  it('should throw StorageError if storage is unavailable in SSR environment', async () => {
    const adapter = new LocalStorageAdapter({
      storage: undefined,
    });

    await expect(adapter.load('any')).rejects.toThrow(StorageError);
    await expect(adapter.save('any', createDocument())).rejects.toThrow(StorageError);
  });

  it('should throw StorageError on JSON parse corruption', async () => {
    const mockStorage = createMockStorage();
    mockStorage.setItem('irich:doc:corrupted', '{ invalid JSON');

    const adapter = new LocalStorageAdapter({ storage: mockStorage });
    await expect(adapter.load('corrupted')).rejects.toThrow(StorageError);
  });
});
