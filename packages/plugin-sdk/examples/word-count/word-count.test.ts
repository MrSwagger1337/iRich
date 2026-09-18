import { describe, it, expect, vi } from 'vitest';
import { createDocument, createNode, createEditor } from '@irich/core';
import { createPluginManager } from '../../src';
import {
  calculateDocumentStats,
  createWordCountPlugin,
  type WordCountStats,
} from './index';

describe('Word Count Plugin Example', () => {
  it('should calculate initial document statistics accurately', () => {
    const doc = createDocument({
      root: createNode({
        id: 'root',
        type: 'root',
        children: [
          createNode({
            id: 'h1',
            type: 'Heading',
            props: {
              text: 'Welcome to iRich',
            },
          }),
          createNode({
            id: 'p1',
            type: 'Paragraph',
            props: {
              text: 'A visual editor and page builder for React.',
            },
          }),
        ],
      }),
    });

    const stats = calculateDocumentStats(doc);

    // root (1) + h1 (1) + p1 (1) = 3 nodes
    expect(stats.nodes).toBe(3);
    // 'Welcome to iRich' (3) + 'A visual editor and page builder for React.' (8) = 11 words
    expect(stats.words).toBe(11);
    expect(stats.characters).toBe(
      'Welcome to iRich'.length + 'A visual editor and page builder for React.'.length,
    );
  });

  it('should update live stats via onStatsChange when editor document mutates', () => {
    const statsHistory: WordCountStats[] = [];

    const plugin = createWordCountPlugin({
      onStatsChange: (stats) => {
        statsHistory.push(stats);
      },
    });

    const editor = createEditor({
      initialDocument: createDocument({
        root: createNode({
          id: 'root',
          type: 'root',
          children: [
            createNode({
              id: 'text-1',
              type: 'Text',
              props: { text: 'Hello world' },
            }),
          ],
        }),
      }),
    });

    const manager = createPluginManager({ editor, plugins: [plugin] });

    // Initial stats captured
    expect(statsHistory.length).toBe(1);
    expect(statsHistory[0].words).toBe(2);
    expect(statsHistory[0].nodes).toBe(2);

    // Add another node via editor commands
    editor.commands.insertNode({
      node: createNode({
        id: 'text-2',
        type: 'Text',
        props: { text: 'Next-gen visual block authoring.' },
      }),
    });

    expect(statsHistory.length).toBe(2);
    // 'Hello world' (2) + 'Next-gen visual block authoring.' (4) = 6 words
    expect(statsHistory[1].words).toBe(6);
    expect(statsHistory[1].nodes).toBe(3);

    // Update node props
    editor.commands.updateNode({
      nodeId: 'text-1',
      props: { text: 'Good morning world' },
    });

    expect(statsHistory.length).toBe(3);
    // 'Good morning world' (3) + 'Next-gen visual block authoring.' (4) = 7 words
    expect(statsHistory[2].words).toBe(7);

    manager.destroy();
  });

  it('should expose custom plugin commands to query word count and stats', () => {
    const plugin = createWordCountPlugin();
    const editor = createEditor({
      initialDocument: createDocument({
        root: createNode({
          id: 'root',
          type: 'root',
          children: [
            createNode({
              id: 'card',
              type: 'Card',
              props: {
                title: 'Design System',
                description: 'Build fast accessible interfaces.',
              },
            }),
          ],
        }),
      }),
    });

    const manager = createPluginManager({ editor, plugins: [plugin] });

    expect(manager.hasCommand('wordCount:getStats')).toBe(true);
    expect(manager.hasCommand('wordCount:getCount')).toBe(true);

    const stats = manager.executeCommand<WordCountStats>('wordCount:getStats');
    const wordCount = manager.executeCommand<number>('wordCount:getCount');

    // 'Design System' (2) + 'Build fast accessible interfaces.' (4) = 6 words
    expect(wordCount).toBe(6);
    expect(stats.words).toBe(6);
    expect(stats.nodes).toBe(2);
  });

  it('should clean up subscriptions when plugin is unregistered', () => {
    const statsSpy = vi.fn();
    const plugin = createWordCountPlugin({
      onStatsChange: statsSpy,
    });

    const editor = createEditor();
    const manager = createPluginManager({ editor, plugins: [plugin] });

    expect(statsSpy).toHaveBeenCalledTimes(1);

    manager.unregister('word-count');

    // Mutation after unregister should not trigger statsSpy
    editor.commands.insertNode({
      node: createNode({ id: 'text-1', type: 'Text', props: { text: 'Ignored' } }),
    });

    expect(statsSpy).toHaveBeenCalledTimes(1);
  });
});
