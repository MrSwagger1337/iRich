import { describe, it, expect } from 'vitest';
import { Editor, VERSION } from './index';

describe('@irich/core', () => {
  it('should export version', () => {
    expect(VERSION).toBe('0.1.0');
  });

  it('should initialize with default document', () => {
    const editor = new Editor();
    const state = editor.getState();

    expect(state.document.root.id).toBe('root');
    expect(state.selection).toBeNull();
  });

  it('should handle node selection', () => {
    const editor = new Editor();
    editor.select('test-node');
    expect(editor.getState().selection).toBe('test-node');
  });
});
