import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts', 'src/styles.css'],
  format: ['esm', 'cjs'],
  dts: true,
  splitting: false,
  sourcemap: true,
  clean: true,
  external: ['react', 'react-dom'],
  outExtension({ format }) {
    return {
      js: format === 'esm' ? '.js' : '.cjs',
      dts: format === 'esm' ? '.d.ts' : '.d.cts',
    };
  },
});
