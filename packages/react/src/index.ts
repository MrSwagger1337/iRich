/**
 * @irich/react
 * React bindings, context provider, and fine-grained subscription hooks for iRich.
 */

export { IRichContext, useIRichContext } from './context';
export { IRichProvider } from './provider';
export { IRichEditor, type IRichEditorProps } from './editor';
export {
  useIRich,
  useIRichDocument,
  useIRichEditor,
  useIRichHistory,
  useIRichNode,
  useIRichSelection,
} from './hooks';

export type {
  IRichContextValue,
  IRichProviderProps,
  UseIRichHistoryResult,
  UseIRichResult,
  UseIRichSelectionResult,
} from './types';
