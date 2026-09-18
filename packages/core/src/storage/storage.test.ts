import { describe, it, expect } from 'vitest';
import { createDocument, createNode } from '../utils/tree';
import { StorageError } from '../errors';
import { MemoryStorageAdapter } from './index';

describe('MemoryStorageAdapter', () => {
  it('should save, load, and list documents accurately', async () => {
    const adapter = new MemoryStorageAdapter();
    const doc1 = createDocument({
      root: createNode({ id: 'root-1', type: 'root', props: { title: 'Doc 1' } }),
    });
    const doc2 = createDocument({
      root: createNode({ id: 'root-2', type: 'root', props: { title: 'Doc 2' } }),
    });

    await adapter.save('doc-1', doc1);
    await adapter.save('doc-2', doc2);

    expect(await adapter.list()).toEqual(['doc-1', 'doc-2']);
    expect(adapter.size()).toBe(2);

    const loaded1 = await adapter.load('doc-1');
    expect(loaded1).toEqual(doc1);
    expect(loaded1).not.toBe(doc1); // Returns a deep cloned/serialized instance

    const loaded2 = await adapter.load('doc-2');
    expect(loaded2).toEqual(doc2);
  });

  it('should return null for non-existent document ID', async () => {
    const adapter = new MemoryStorageAdapter();
    const result = await adapter.load('missing-id');
    expect(result).toBeNull();
  });

  it('should initialize with initialData', async () => {
    const doc = createDocument();
    const adapter = new MemoryStorageAdapter({
      initialData: {
        'initial-doc': doc,
      },
    });

    expect(await adapter.list()).toEqual(['initial-doc']);
    const loaded = await adapter.load('initial-doc');
    expect(loaded).toEqual(doc);
  });

  it('should delete documents and clear storage', async () => {
    const adapter = new MemoryStorageAdapter();
    const doc = createDocument();

    await adapter.save('doc-to-delete', doc);
    expect(await adapter.list()).toEqual(['doc-to-delete']);

    await adapter.delete('doc-to-delete');
    expect(await adapter.load('doc-to-delete')).toBeNull();
    expect(await adapter.list()).toEqual([]);

    await adapter.save('doc-a', doc);
    await adapter.save('doc-b', doc);
    expect(adapter.size()).toBe(2);

    adapter.clear();
    expect(adapter.size()).toBe(0);
  });

  it('should throw StorageError on invalid document or empty ID', async () => {
    const adapter = new MemoryStorageAdapter();

    await expect(adapter.load('')).rejects.toThrow(StorageError);
    await expect(adapter.save('', createDocument())).rejects.toThrow(StorageError);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await expect(adapter.save('bad-doc', null as any)).rejects.toThrow(StorageError);
    await expect(adapter.delete('')).rejects.toThrow(StorageError);
  });
});
