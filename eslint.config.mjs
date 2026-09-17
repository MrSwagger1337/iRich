import js from '@eslint/js';
import tsPlugin from 'typescript-eslint';
import prettierConfig from 'eslint-config-prettier';

export default tsPlugin.config(
  js.configs.recommended,
  ...tsPlugin.configs.recommended,
  prettierConfig,
  {
    ignores: [
      '**/node_modules/**',
      '**/dist/**',
      '**/build/**',
      '**/.next/**',
      '**/.turbo/**',
      '**/coverage/**',
    ],
  },
  {
    files: ['**/*.{ts,tsx,js,jsx,mjs}'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
    },
  },
);
