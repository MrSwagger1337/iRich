import { describe, it, expect } from 'vitest';
import { createRichTextPlugin } from './index';

describe('@irich/rich-text', () => {
  it('should create rich text plugin instance', () => {
    const plugin = createRichTextPlugin();
    expect(plugin.name).toBe('rich-text');
    expect(plugin.version).toBe('0.1.0');
  });
});
