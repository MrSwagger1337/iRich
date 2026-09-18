/**
 * @irich/rich-text
 * Rich-text authoring, inline formatting marks, and server-safe rendering for iRich.
 */

import { definePlugin, type IRichPlugin } from '@irich/plugin-sdk';

export { IRichTextRenderer } from './renderer';
export { IRichTextEditor } from './editor';
export { useIRichText } from './hooks';
export {
  RichTextToolbar,
  RichTextFloatingToolbar,
  type RichTextToolbarProps,
  type RichTextFloatingToolbarProps,
} from './toolbar';

export {
  createEmptyRichText,
  createRichTextFromText,
  ensureRichTextDocument,
  isRichTextDocument,
  richTextToPlainText,
} from './utils';

export type {
  RichTextDocument,
  RichTextNode,
  RichTextMark,
  IRichTextController,
  IRichTextEditorProps,
  IRichTextRendererProps,
  UseIRichTextOptions,
} from './types';

export function createRichTextPlugin(): IRichPlugin {
  return definePlugin({
    name: 'rich-text',
    version: '0.1.0',
  });
}
