import { describe, it, expect } from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';

describe('@irich/editorial CSS Asset & Package Exports Contract', () => {
  const packageDir = path.resolve(__dirname, '..');
  const packageJsonPath = path.join(packageDir, 'package.json');
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

  it('declares ./styles.css in exports map', () => {
    expect(packageJson.exports).toBeDefined();
    expect(packageJson.exports['./styles.css']).toBe('./dist/styles.css');
  });

  it('preserves CSS side effects for bundler tree shaking', () => {
    expect(packageJson.sideEffects).toBeDefined();
    expect(Array.isArray(packageJson.sideEffects)).toBe(true);
    expect(packageJson.sideEffects).toContain('*.css');
  });

  it('source stylesheet exists and contains core editorial selectors', () => {
    const srcCssPath = path.join(packageDir, 'src', 'styles.css');
    expect(fs.existsSync(srcCssPath)).toBe(true);

    const cssContent = fs.readFileSync(srcCssPath, 'utf8');
    expect(cssContent.length).toBeGreaterThan(500);

    // Verify key editorial selectors
    expect(cssContent).toContain('.irich-editorial-section');
    expect(cssContent).toContain('.irich-editorial-columns');
    expect(cssContent).toContain('.irich-editorial-column');
    expect(cssContent).toContain('.irich-editorial-figure');
    expect(cssContent).toContain('.irich-editorial-callout');
    expect(cssContent).toContain('.irich-editorial-quote');
    expect(cssContent).toContain('.irich-editorial-takeaway');
    expect(cssContent).toContain('.irich-editorial-card');
    expect(cssContent).toContain('.irich-editorial-card-grid');
    expect(cssContent).toContain('.irich-editorial-btn');
    expect(cssContent).toContain('.irich-editorial-cta');

    // Verify logical CSS & CSS variables
    expect(cssContent).toContain('--irich-content-accent');
    expect(cssContent).toContain('border-inline-start');
    expect(cssContent).toContain('padding-block');
  });
});
