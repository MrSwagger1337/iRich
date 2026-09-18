/**
 * @irich/react
 * React hook for automated document persistence with debounced dispatch and status tracking.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import type { IRichDocument, IRichStorageAdapter } from '@irich/core';
import { useIRichEditor } from '../hooks';

/**
 * Current status state of the autosave pipeline.
 */
export type AutosaveStatus = 'idle' | 'saving' | 'saved' | 'error';

/**
 * Options for configuring the useIRichAutosave hook.
 */
export interface UseIRichAutosaveOptions {
  /**
   * Unique document ID to persist under.
   */
  readonly documentId: string;

  /**
   * Asynchronous storage adapter instance.
   */
  readonly adapter: IRichStorageAdapter;

  /**
   * Debounce delay in milliseconds before dispatching save (defaults to 1000ms).
   */
  readonly debounceMs?: number;

  /**
   * Whether autosave is currently active (defaults to true).
   */
  readonly enabled?: boolean;

  /**
   * Callback fired upon successful save.
   */
  readonly onSaveSuccess?: (document: IRichDocument) => void;

  /**
   * Callback fired upon save failure.
   */
  readonly onSaveError?: (error: Error) => void;
}

/**
 * Return state and controls for the useIRichAutosave hook.
 */
export interface UseIRichAutosaveResult {
  /**
   * Current autosave lifecycle status.
   */
  readonly status: AutosaveStatus;

  /**
   * Boolean flag indicating whether a save request is currently in-flight.
   */
  readonly isSaving: boolean;

  /**
   * Timestamp of the most recent successful save, or null if not yet saved.
   */
  readonly lastSavedAt: Date | null;

  /**
   * The most recent error encountered during save, or null.
   */
  readonly error: Error | null;

  /**
   * Immediately saves the current document without waiting for the debounce delay.
   */
  readonly saveNow: () => Promise<void>;
}

/**
 * Automatically persists editor document changes to an IRichStorageAdapter with configurable debouncing.
 *
 * @example
 * ```tsx
 * const { status, isSaving, lastSavedAt, error, saveNow } = useIRichAutosave({
 *   documentId: 'page-123',
 *   adapter: storageAdapter,
 *   debounceMs: 1500,
 * });
 * ```
 */
export function useIRichAutosave(options: UseIRichAutosaveOptions): UseIRichAutosaveResult {
  const {
    documentId,
    adapter,
    debounceMs = 1000,
    enabled = true,
    onSaveSuccess,
    onSaveError,
  } = options;

  const editor = useIRichEditor();
  const [status, setStatus] = useState<AutosaveStatus>('idle');
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const [error, setError] = useState<Error | null>(null);

  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const optionsRef = useRef({
    documentId,
    adapter,
    enabled,
    onSaveSuccess,
    onSaveError,
  });

  // Keep options ref updated
  useEffect(() => {
    optionsRef.current = {
      documentId,
      adapter,
      enabled,
      onSaveSuccess,
      onSaveError,
    };
  }, [documentId, adapter, enabled, onSaveSuccess, onSaveError]);

  const performSave = useCallback(
    async (docToSave: IRichDocument): Promise<void> => {
      const { documentId: docId, adapter: currentAdapter, onSaveSuccess: onSuccess, onSaveError: onError } =
        optionsRef.current;

      if (!docId) {
        return;
      }

      setIsSaving(true);
      setStatus('saving');
      setError(null);

      try {
        await currentAdapter.save(docId, docToSave);
        const now = new Date();
        setLastSavedAt(now);
        setStatus('saved');
        setIsSaving(false);
        onSuccess?.(docToSave);
      } catch (err) {
        const errorObj = err instanceof Error ? err : new Error(String(err));
        setError(errorObj);
        setStatus('error');
        setIsSaving(false);
        onError?.(errorObj);
      }
    },
    [],
  );

  const saveNow = useCallback(async (): Promise<void> => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }
    const currentDoc = editor.getDocument();
    await performSave(currentDoc);
  }, [editor, performSave]);

  // Subscribe to document changes and schedule debounced save
  useEffect(() => {
    if (!enabled || !documentId) {
      return;
    }

    const unsubscribe = editor.on('document:change', (payload) => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      debounceTimerRef.current = setTimeout(() => {
        debounceTimerRef.current = null;
        void performSave(payload.document);
      }, debounceMs);
    });

    return () => {
      unsubscribe();
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
        debounceTimerRef.current = null;
      }
    };
  }, [editor, enabled, documentId, debounceMs, performSave]);

  return {
    status,
    isSaving,
    lastSavedAt,
    error,
    saveNow,
  };
}
