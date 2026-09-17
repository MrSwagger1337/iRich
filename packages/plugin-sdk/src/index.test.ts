import { describe, it, expect } from 'vitest';
import { definePlugin } from './index';

describe('@irich/plugin-sdk', () => {
  it('should define a plugin successfully', () => {
    const plugin = definePlugin({
      name: 'test-plugin',
      version: '1.0.0',
    });

    expect(plugin.name).toBe('test-plugin');
    expect(plugin.version).toBe('1.0.0');
  });
});
