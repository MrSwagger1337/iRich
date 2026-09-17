/**
 * @irich/react
 * React components, hooks, and context bindings for iRich visual content editor.
 */

import React, { createContext, useContext, useMemo, useState } from 'react';
import { Editor, type EditorConfig, type EditorState } from '@irich/core';
import { RendererRegistry } from '@irich/renderer';

export * from '@irich/core';
export * from '@irich/plugin-sdk';
export * from '@irich/renderer';
export * from '@irich/rich-text';
export * from '@irich/ui';

export interface IRichContextValue {
  editor: Editor;
  state: EditorState;
  renderer: RendererRegistry;
}

const IRichContext = createContext<IRichContextValue | null>(null);

export interface IRichProviderProps {
  config?: EditorConfig;
  children: React.ReactNode;
}

export const IRichProvider: React.FC<IRichProviderProps> = ({ config, children }) => {
  const [editor] = useState(() => new Editor(config));
  const [state] = useState<EditorState>(() => editor.getState());
  const [renderer] = useState(() => new RendererRegistry());

  const value = useMemo(
    () => ({
      editor,
      state,
      renderer,
    }),
    [editor, state, renderer],
  );

  return React.createElement(IRichContext.Provider, { value }, children);
};

export function useIRich(): IRichContextValue {
  const context = useContext(IRichContext);
  if (!context) {
    throw new Error('useIRich must be used within an IRichProvider');
  }
  return context;
}

export interface IRichEditorProps {
  className?: string;
}

export const IRichEditor: React.FC<IRichEditorProps> = ({ className }) => {
  return React.createElement(
    'div',
    {
      className: className ? `irich-editor ${className}` : 'irich-editor',
      'data-testid': 'irich-editor',
    },
    'iRich Editor Placeholder',
  );
};
