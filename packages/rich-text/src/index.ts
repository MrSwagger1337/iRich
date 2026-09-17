/**
 * @irich/rich-text
 * Rich-text extensions, marks, and text blocks for iRich.
 */

import { definePlugin, type IRichPlugin } from '@irich/plugin-sdk';

export interface TextMark {
  type: 'bold' | 'italic' | 'underline' | 'strike' | 'code' | 'link';
  attrs?: Record<string, unknown>;
}

export interface TextSpan {
  text: string;
  marks?: TextMark[];
}

export function createRichTextPlugin(): IRichPlugin {
  return definePlugin({
    name: 'rich-text',
    version: '0.1.0',
  });
}
