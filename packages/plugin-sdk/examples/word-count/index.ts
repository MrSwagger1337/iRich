/**
 * Word Count Example Plugin for iRich
 *
 * Demonstrates:
 * 1. Safe, read-only inspection of the document tree via walkDocument.
 * 2. Event subscription to 'document:change'.
 * 3. Contributing custom plugin commands ('wordCount:getStats', 'wordCount:getCount').
 * 4. Zero direct state mutation.
 */

import { walkDocument, type IRichDocument, type IRichNode } from '@irich/core';
import { definePlugin, type IRichPlugin, type PluginContext } from '../../src';

export interface WordCountStats {
  readonly words: number;
  readonly characters: number;
  readonly nodes: number;
}

export interface WordCountPluginOptions {
  /**
   * Optional callback fired whenever document stats change.
   */
  readonly onStatsChange?: (stats: WordCountStats) => void;
}

/**
 * Extracts plain text contents from an individual node's props.
 */
function extractNodeText(node: IRichNode): string {
  const parts: string[] = [];

  for (const value of Object.values(node.props)) {
    if (typeof value === 'string') {
      parts.push(value);
    } else if (value && typeof value === 'object') {
      // Check for nested rich text AST or objects with text properties
      try {
        const str = JSON.stringify(value);
        // Match string literals inside JSON AST
        const matches = str.match(/"text":"([^"]+)"/g);
        if (matches) {
          for (const m of matches) {
            const val = m.replace(/^"text":"/, '').replace(/"$/, '');
            parts.push(val);
          }
        }
      } catch {
        // Ignore unparseable values
      }
    }
  }

  return parts.join(' ');
}

/**
 * Calculates words, characters, and total node count for a document.
 */
export function calculateDocumentStats(doc: IRichDocument): WordCountStats {
  let words = 0;
  let characters = 0;
  let nodes = 0;

  walkDocument(doc, (node) => {
    nodes += 1;
    const text = extractNodeText(node).trim();
    if (text.length > 0) {
      characters += text.length;
      // Split on contiguous whitespace
      const tokens = text.split(/\s+/).filter((t) => t.length > 0);
      words += tokens.length;
    }
  });

  return { words, characters, nodes };
}

/**
 * Creates a word-count plugin instance for iRich.
 */
export function createWordCountPlugin(options: WordCountPluginOptions = {}): IRichPlugin {
  let currentStats: WordCountStats = { words: 0, characters: 0, nodes: 0 };

  return definePlugin({
    name: 'word-count',
    version: '1.0.0',

    setup(ctx: PluginContext) {
      // Calculate initial stats from canonical document
      currentStats = calculateDocumentStats(ctx.getDocument());
      options.onStatsChange?.(currentStats);

      // Listen to document changes to recalculate stats dynamically
      const unsubscribe = ctx.on('document:change', (payload) => {
        currentStats = calculateDocumentStats(payload.document);
        options.onStatsChange?.(currentStats);
      });

      return () => {
        unsubscribe();
      };
    },

    commands: {
      'wordCount:getStats': (ctx: PluginContext): WordCountStats => {
        // Re-read directly from canonical document
        return calculateDocumentStats(ctx.getDocument());
      },
      'wordCount:getCount': (ctx: PluginContext): number => {
        const stats = calculateDocumentStats(ctx.getDocument());
        return stats.words;
      },
    },
  });
}
