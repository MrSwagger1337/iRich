/**
 * @irich/react
 * React subscription hooks for iRich editor state, document, selection, and nodes.
 */

import { useCallback, useMemo, useSyncExternalStore } from 'react';
import type {
  EditorInstance,
  EditorState,
  IRichDocument,
  IRichNode,
  NodeId,
} from '@irich/core';
import { useIRichContext } from './context';
import type {
  UseIRichHistoryResult,
  UseIRichResult,
  UseIRichSelectionResult,
} from './types';

/**
 * Accesses the stable EditorInstance from context.
 *
 * This hook does NOT subscribe to document or selection updates, ensuring components
 * using it never re-render unnecessarily when document state changes.
 */
export function useIRichEditor(): EditorInstance {
  const { editor } = useIRichContext();
  return editor;
}

/**
 * Subscribes to the canonical IRichDocument.
 *
 * Re-renders ONLY when the document is mutated (not when selection or hover state changes).
 */
export function useIRichDocument(): IRichDocument {
  const editor = useIRichEditor();

  const subscribe = useCallback(
    (onStoreChange: () => void) => {
      return editor.on('document:change', () => {
        onStoreChange();
      });
    },
    [editor],
  );

  const getSnapshot = useCallback((): IRichDocument => {
    return editor.getDocument();
  }, [editor]);

  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

/**
 * Subscribes to active node selection state and provides selection dispatch commands.
 *
 * Re-renders ONLY when selection changes (not when other document properties change).
 */
export function useIRichSelection(): UseIRichSelectionResult {
  const editor = useIRichEditor();

  const subscribe = useCallback(
    (onStoreChange: () => void) => {
      return editor.on('selection:change', () => {
        onStoreChange();
      });
    },
    [editor],
  );

  const getSnapshot = useCallback((): NodeId | null => {
    return editor.getSelection();
  }, [editor]);

  const selectedNodeId = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

  const selectNode = useCallback(
    (nodeId: NodeId | null) => {
      editor.commands.selectNode(nodeId);
    },
    [editor],
  );

  const clearSelection = useCallback(() => {
    editor.commands.clearSelection();
  }, [editor]);

  return useMemo(
    () => ({
      selectedNodeId,
      selectNode,
      clearSelection,
    }),
    [selectedNodeId, selectNode, clearSelection],
  );
}

/**
 * Subscribes to undo/redo transaction availability and history commands.
 */
export function useIRichHistory(): UseIRichHistoryResult {
  const editor = useIRichEditor();

  const subscribe = useCallback(
    (onStoreChange: () => void) => {
      return editor.subscribe(onStoreChange);
    },
    [editor],
  );

  const getSnapshot = useCallback((): string => {
    return `${editor.canUndo()}:${editor.canRedo()}`;
  }, [editor]);

  useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

  const canUndo = editor.canUndo();
  const canRedo = editor.canRedo();

  const undo = useCallback((): boolean => {
    return editor.commands.undo();
  }, [editor]);

  const redo = useCallback((): boolean => {
    return editor.commands.redo();
  }, [editor]);

  const clearHistory = useCallback((): void => {
    editor.clearHistory();
  }, [editor]);

  return useMemo(
    () => ({
      canUndo,
      canRedo,
      undo,
      redo,
      clearHistory,
    }),
    [canUndo, canRedo, undo, redo, clearHistory],
  );
}

/**
 * Subscribes to full editor state, providing convenience properties and commands.
 */
export function useIRich(): UseIRichResult {
  const editor = useIRichEditor();

  const subscribe = useCallback(
    (onStoreChange: () => void) => {
      return editor.subscribe(onStoreChange);
    },
    [editor],
  );

  const getSnapshot = useCallback((): EditorState => {
    return editor.getState();
  }, [editor]);

  const state = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

  const selectNode = useCallback(
    (nodeId: NodeId | null) => {
      editor.commands.selectNode(nodeId);
    },
    [editor],
  );

  const clearSelection = useCallback(() => {
    editor.commands.clearSelection();
  }, [editor]);

  const undo = useCallback((): boolean => {
    return editor.commands.undo();
  }, [editor]);

  const redo = useCallback((): boolean => {
    return editor.commands.redo();
  }, [editor]);

  const clearHistory = useCallback((): void => {
    editor.clearHistory();
  }, [editor]);

  return useMemo(
    () => ({
      editor,
      state,
      document: state.document,
      selectedNodeId: state.selection,
      canUndo: state.canUndo,
      canRedo: state.canRedo,
      selectNode,
      clearSelection,
      undo,
      redo,
      clearHistory,
    }),
    [editor, state, selectNode, clearSelection, undo, redo, clearHistory],
  );
}

/**
 * Granular hook that subscribes ONLY to a single specific node.
 *
 * Changes to other parts of the document tree will NOT trigger re-renders of the calling component.
 */
export function useIRichNode(nodeId: NodeId | null | undefined): IRichNode | undefined {
  const editor = useIRichEditor();

  const subscribe = useCallback(
    (onStoreChange: () => void) => {
      if (!nodeId) {
        return () => {};
      }
      return editor.subscribeToNode(nodeId, () => {
        onStoreChange();
      });
    },
    [editor, nodeId],
  );

  const getSnapshot = useCallback((): IRichNode | undefined => {
    if (!nodeId) {
      return undefined;
    }
    return editor.getNode(nodeId);
  }, [editor, nodeId]);

  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}
