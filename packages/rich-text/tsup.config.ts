import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm', 'cjs'],
  dts: true,
  splitting: true,
  sourcemap: true,
  clean: true,
  external: ['react', 'react-dom'],
  banner: {
    js: "'use client';",
  },
  outExtension({ format }) {
    return {
      js: format === 'esm' ? '.js' : '.cjs',
      dts: format === 'esm' ? '.d.ts' : '.d.cts',
    };
  },
});
