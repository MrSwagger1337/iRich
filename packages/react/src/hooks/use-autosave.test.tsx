/**
 * @vitest-environment jsdom
 */

import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  createDocument,
  createNode,
  createEditor,
  MemoryStorageAdapter,
  StorageError,
} from '@irich/core';
import { IRichProvider } from '../provider';
import { useIRichAutosave, type UseIRichAutosaveResult } from './use-autosave';

// Configure React act() environment
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;

describe('useIRichAutosave', () => {
  let container: HTMLDivElement | null = null;
  let root: Root | null = null;

  beforeEach(() => {
    vi.useFakeTimers();
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    if (root) {
      act(() => {
        root?.unmount();
      });
      root = null;
    }
    if (container && container.parentNode) {
      container.parentNode.removeChild(container);
      container = null;
    }
    vi.useRealTimers();
  });

  it('should initialize with idle status and default values', () => {
    const adapter = new MemoryStorageAdapter();
    let hookResult!: UseIRichAutosaveResult;

    function TestComponent() {
      hookResult = useIRichAutosave({
        documentId: 'doc-1',
        adapter,
        debounceMs: 500,
      });
      return <div>Status: {hookResult.status}</div>;
    }

    act(() => {
      root!.render(
        <IRichProvider>
          <TestComponent />
        </IRichProvider>,
      );
    });

    expect(hookResult.status).toBe('idle');
    expect(hookResult.isSaving).toBe(false);
    expect(hookResult.lastSavedAt).toBeNull();
    expect(hookResult.error).toBeNull();
    expect(container?.textContent).toContain('Status: idle');
  });

  it('should debounce save on document mutation and transition to saved', async () => {
    const adapter = new MemoryStorageAdapter();
    const editor = createEditor({
      initialDocument: createDocument({
        root: createNode({ id: 'root', type: 'root' }),
      }),
    });

    const onSaveSuccess = vi.fn();
    let hookResult!: UseIRichAutosaveResult;

    function TestComponent() {
      hookResult = useIRichAutosave({
        documentId: 'doc-1',
        adapter,
        debounceMs: 500,
        onSaveSuccess,
      });
      return <div>Status: {hookResult.status}</div>;
    }

    act(() => {
      root!.render(
        <IRichProvider editor={editor}>
          <TestComponent />
        </IRichProvider>,
      );
    });

    // Mutate document
    act(() => {
      editor.commands.insertNode({
        node: createNode({ id: 'node-1', type: 'Card' }),
      });
    });

    // Before debounce timer fires: still idle or waiting
    expect(await adapter.load('doc-1')).toBeNull();
    expect(onSaveSuccess).not.toHaveBeenCalled();

    // Fast-forward debounce timer
    await act(async () => {
      vi.advanceTimersByTime(500);
    });

    expect(hookResult.status).toBe('saved');
    expect(hookResult.isSaving).toBe(false);
    expect(hookResult.lastSavedAt).toBeInstanceOf(Date);
    expect(hookResult.error).toBeNull();
    expect(onSaveSuccess).toHaveBeenCalledTimes(1);

    const savedDoc = await adapter.load('doc-1');
    expect(savedDoc?.root.children?.[0]?.id).toBe('node-1');
  });

  it('should handle save failures and set error status', async () => {
    const failingAdapter = {
      load: vi.fn(),
      save: vi.fn().mockRejectedValue(new StorageError('save', 'Network timeout')),
    };

    const editor = createEditor();
    const onSaveError = vi.fn();
    let hookResult!: UseIRichAutosaveResult;

    function TestComponent() {
      hookResult = useIRichAutosave({
        documentId: 'doc-fail',
        adapter: failingAdapter,
        debounceMs: 300,
        onSaveError,
      });
      return <div>Status: {hookResult.status}</div>;
    }

    act(() => {
      root!.render(
        <IRichProvider editor={editor}>
          <TestComponent />
        </IRichProvider>,
      );
    });

    act(() => {
      editor.commands.insertNode({
        node: createNode({ id: 'node-err', type: 'Text' }),
      });
    });

    await act(async () => {
      vi.advanceTimersByTime(300);
    });

    expect(hookResult.status).toBe('error');
    expect(hookResult.isSaving).toBe(false);
    expect(hookResult.error).toBeInstanceOf(Error);
    expect(hookResult.error?.message).toContain('Network timeout');
    expect(onSaveError).toHaveBeenCalledTimes(1);
  });

  it('should allow immediate save via saveNow without waiting for debounce', async () => {
    const adapter = new MemoryStorageAdapter();
    const editor = createEditor();
    let hookResult!: UseIRichAutosaveResult;

    function TestComponent() {
      hookResult = useIRichAutosave({
        documentId: 'doc-instant',
        adapter,
        debounceMs: 5000,
      });
      return <div>Status: {hookResult.status}</div>;
    }

    act(() => {
      root!.render(
        <IRichProvider editor={editor}>
          <TestComponent />
        </IRichProvider>,
      );
    });

    act(() => {
      editor.commands.insertNode({
        node: createNode({ id: 'instant-node', type: 'Hero' }),
      });
    });

    // Manually trigger saveNow
    await act(async () => {
      await hookResult.saveNow();
    });

    expect(hookResult.status).toBe('saved');
    const saved = await adapter.load('doc-instant');
    expect(saved?.root.children?.[0]?.id).toBe('instant-node');
  });

  it('should not save when enabled is false', async () => {
    const adapter = new MemoryStorageAdapter();
    const editor = createEditor();
    let hookResult!: UseIRichAutosaveResult;

    function TestComponent() {
      hookResult = useIRichAutosave({
        documentId: 'doc-disabled',
        adapter,
        debounceMs: 200,
        enabled: false,
      });
      return <div>Status: {hookResult.status}</div>;
    }

    act(() => {
      root!.render(
        <IRichProvider editor={editor}>
          <TestComponent />
        </IRichProvider>,
      );
    });

    act(() => {
      editor.commands.insertNode({
        node: createNode({ id: 'ignored', type: 'Text' }),
      });
    });

    await act(async () => {
      vi.advanceTimersByTime(500);
    });

    expect(hookResult.status).toBe('idle');
    expect(await adapter.load('doc-disabled')).toBeNull();
  });
});
