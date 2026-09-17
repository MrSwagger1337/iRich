import { describe, it, expect } from 'vitest';
import { IRichProvider, useIRich, IRichEditor } from './index';

describe('@irich/react', () => {
  it('should export React components and hooks', () => {
    expect(IRichProvider).toBeDefined();
    expect(useIRich).toBeDefined();
    expect(IRichEditor).toBeDefined();
  });
});
