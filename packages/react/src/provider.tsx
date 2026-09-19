/**
 * @irich/react
 * IRichProvider component connecting @irich/core editor instance to React context.
 */

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Editor, type EditorInstance } from '@irich/core';
import { IRichContext } from './context';
import type { IRichContextValue, IRichProviderProps } from './types';

import { useIRichKeyboardShortcuts } from './hooks/use-keyboard-shortcuts';

const KeyboardShortcutsManager: React.FC<{ enabled?: boolean }> = ({ enabled = true }) => {
  useIRichKeyboardShortcuts({ enabled });
  return null;
};

/**
 * Root context provider for iRich React applications.
 *
 * Provides a shared, stable EditorInstance to descendant components and selector hooks.
 * Does NOT duplicate document state in React; components subscribe reactively through hooks.
 */
export const IRichProvider: React.FC<IRichProviderProps> = ({
  editor: externalEditor,
  initialDocument,
  config,
  uiDirection: propUIDirection = 'ltr',
  onUIDirectionChange,
  onChange,
  onSelectionChange,
  onBreakpointChange,
  enableKeyboardShortcuts = true,
  children,
}) => {
  // Store callbacks in refs to avoid re-binding event listeners on every render
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  const onSelectionChangeRef = useRef(onSelectionChange);
  onSelectionChangeRef.current = onSelectionChange;

  const onBreakpointChangeRef = useRef(onBreakpointChange);
  onBreakpointChangeRef.current = onBreakpointChange;

  const onUIDirectionChangeRef = useRef(onUIDirectionChange);
  onUIDirectionChangeRef.current = onUIDirectionChange;

  // Manage UI chrome direction state
  const [uiDirection, setUIDirectionState] = useState(propUIDirection);

  useEffect(() => {
    setUIDirectionState(propUIDirection);
  }, [propUIDirection]);

  const setUIDirection = React.useCallback((dir: typeof propUIDirection) => {
    setUIDirectionState(dir);
    onUIDirectionChangeRef.current?.(dir);
  }, []);

  // Track whether the editor instance was internally created
  const isInternalEditorRef = useRef(false);

  // Lazy-instantiate internal editor if external instance is omitted
  const [internalEditor] = useState<EditorInstance>(() => {
    if (externalEditor) {
      return externalEditor;
    }
    isInternalEditorRef.current = true;
    return new Editor({
      ...config,
      initialDocument: initialDocument ?? config?.initialDocument,
    });
  });

  const activeEditor = externalEditor ?? internalEditor;

  // Cleanup internally created editor on unmount
  useEffect(() => {
    return () => {
      if (isInternalEditorRef.current) {
        internalEditor.destroy();
      }
    };
  }, [internalEditor]);

  // Subscribe to document change events for onChange callback
  useEffect(() => {
    return activeEditor.on('document:change', ({ document }) => {
      onChangeRef.current?.(document);
    });
  }, [activeEditor]);

  // Subscribe to selection change events for onSelectionChange callback
  useEffect(() => {
    return activeEditor.on('selection:change', ({ selection }) => {
      onSelectionChangeRef.current?.(selection);
    });
  }, [activeEditor]);

  // Subscribe to breakpoint change events for onBreakpointChange callback
  useEffect(() => {
    return activeEditor.on('breakpoint:change', ({ breakpoint }) => {
      onBreakpointChangeRef.current?.(breakpoint);
    });
  }, [activeEditor]);

  const contextValue = useMemo<IRichContextValue>(
    () => ({
      editor: activeEditor,
      uiDirection,
      setUIDirection,
    }),
    [activeEditor, uiDirection, setUIDirection],
  );

  return (
    <IRichContext.Provider value={contextValue}>
      <KeyboardShortcutsManager enabled={enableKeyboardShortcuts} />
      {children}
    </IRichContext.Provider>
  );
};
