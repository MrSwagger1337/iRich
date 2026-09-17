import { describe, it, expect } from 'vitest';
import { Button, Toolbar } from './index';

describe('@irich/ui', () => {
  it('should export Button and Toolbar components', () => {
    expect(Button).toBeDefined();
    expect(Toolbar).toBeDefined();
  });
});
