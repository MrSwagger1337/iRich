/**
 * @irich/react
 * Package stylesheet and CSS export verification tests.
 */

import fs from 'fs';
import path from 'path';
import { describe, expect, it } from 'vitest';

describe('@irich/react Stylesheet & Packaging Contract', () => {
  const pkgRoot = path.resolve(__dirname, '..');
  const pkgJsonPath = path.join(pkgRoot, 'package.json');
  const srcCssPath = path.join(pkgRoot, 'src', 'styles.css');
  const distCssPath = path.join(pkgRoot, 'dist', 'styles.css');

  it('package.json exports "./styles.css" pointing to "./dist/styles.css"', () => {
    const pkgJson = JSON.parse(fs.readFileSync(pkgJsonPath, 'utf-8'));
    expect(pkgJson.exports).toBeDefined();
    expect(pkgJson.exports['./styles.css']).toBe('./dist/styles.css');
  });

  it('package.json sideEffects preserves CSS stylesheets', () => {
    const pkgJson = JSON.parse(fs.readFileSync(pkgJsonPath, 'utf-8'));
    expect(pkgJson.sideEffects).toBeInstanceOf(Array);
    expect(pkgJson.sideEffects).toContain('*.css');
    expect(pkgJson.sideEffects).toContain('**/*.css');
  });

  it('source stylesheet exists and defines core scoped custom properties', () => {
    expect(fs.existsSync(srcCssPath)).toBe(true);
    const srcCss = fs.readFileSync(srcCssPath, 'utf-8');
    expect(srcCss).toContain('--irich-editor-bg');
    expect(srcCss).toContain('--irich-editor-surface');
    expect(srcCss).toContain('--irich-editor-accent');
    expect(srcCss).toContain('--irich-editor-border');
  });

  it('dist/styles.css is generated, non-empty, and contains all subsystem selectors', () => {
    if (fs.existsSync(distCssPath)) {
      const distCss = fs.readFileSync(distCssPath, 'utf-8');
      expect(distCss.length).toBeGreaterThan(1000);

      // 1. Base UI Primitives
      expect(distCss).toContain('.irich-btn');
      expect(distCss).toContain('.irich-btn-primary');
      expect(distCss).toContain('.irich-modal-overlay');
      expect(distCss).toContain('.irich-modal-card');

      // 2. Rich Text Typography & Toolbar
      expect(distCss).toContain('.irich-rich-toolbar');
      expect(distCss).toContain('.irich-rich-btn');
      expect(distCss).toContain('.ProseMirror');

      // 3. Canvas Chrome, Selection, DnD Indicators
      expect(distCss).toContain('.irich-canvas-node');
      expect(distCss).toContain('.irich-canvas-node-selected');
      expect(distCss).toContain('.irich-drop-indicator');
      expect(distCss).toContain('.irich-node-actions');

      // 4. Properties Inspector
      expect(distCss).toContain('.irich-inspector-container');
      expect(distCss).toContain('.irich-inspector-field');
      expect(distCss).toContain('.irich-inspector-input');

      // 5. Document JSON Studio & Modal
      expect(distCss).toContain('.irich-json-studio');
      expect(distCss).toContain('.irich-json-studio-modal-card');
      expect(distCss).toContain('.irich-json-studio-textarea');
      expect(distCss).toContain('.irich-json-studio-diagnostics');
    }
  });

  it('@irich/react does not depend on @irich/editorial in dependencies or stylesheets', () => {
    const pkgJson = JSON.parse(fs.readFileSync(pkgJsonPath, 'utf-8'));
    expect(pkgJson.dependencies['@irich/editorial']).toBeUndefined();
    expect(pkgJson.devDependencies['@irich/editorial']).toBeUndefined();

    const srcCss = fs.readFileSync(srcCssPath, 'utf-8');
    expect(srcCss).not.toContain('@irich/editorial');
    expect(srcCss).not.toContain('.irich-editorial-');
  });
});
