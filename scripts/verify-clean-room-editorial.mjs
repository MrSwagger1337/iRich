/**
 * Clean-Room Verification Script for @irich/editorial and @irich/react.
 * Builds real tarballs and installs them into isolated Vite consumers to verify:
 * 1. @irich/react functions independently without @irich/editorial.
 * 2. An editorial consumer successfully composes @irich/react + @irich/editorial.
 */

import { execSync } from 'node:child_process';
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';

const ROOT_DIR = path.resolve('.');
const TEMP_BASE = path.join(os.tmpdir(), `irich-editorial-cleanroom-${Date.now()}`);

console.log(`[Clean-Room] Starting verification in: ${TEMP_BASE}`);
fs.mkdirSync(TEMP_BASE, { recursive: true });

try {
  // 1. Build all packages
  console.log('[Clean-Room] Building packages...');
  execSync('pnpm --filter "@irich/*" build', { cwd: ROOT_DIR, stdio: 'inherit' });

  // 2. Pack real tarballs
  console.log('[Clean-Room] Packing real tarballs...');
  const packages = ['core', 'ui', 'rich-text', 'renderer', 'plugin-sdk', 'react', 'editorial'];
  const tarballs = {};

  for (const pkg of packages) {
    const pkgDir = path.join(ROOT_DIR, 'packages', pkg);
    const packOutput = execSync('pnpm pack', { cwd: pkgDir, encoding: 'utf8' }).trim();
    const tarballFileName = packOutput.split('\n').pop().trim();
    const tarballPath = path.join(pkgDir, tarballFileName);
    tarballs[pkg] = tarballPath;
    console.log(`  Packed @irich/${pkg} -> ${tarballFileName}`);
  }

  // 3. Scenario A: Minimal consumer with ONLY @irich/react (verifying @irich/editorial is optional)
  console.log('\n[Clean-Room] Scenario A: Minimal consumer with @irich/react ONLY...');
  const appADir = path.join(TEMP_BASE, 'app-react-only');
  fs.mkdirSync(appADir, { recursive: true });

  const pkgJsonA = {
    name: 'clean-react-consumer',
    private: true,
    version: '0.0.0',
    type: 'module',
    scripts: { build: 'vite build' },
    dependencies: {
      '@irich/core': `file:${tarballs.core}`,
      '@irich/ui': `file:${tarballs.ui}`,
      '@irich/rich-text': `file:${tarballs['rich-text']}`,
      '@irich/renderer': `file:${tarballs.renderer}`,
      '@irich/plugin-sdk': `file:${tarballs['plugin-sdk']}`,
      '@irich/react': `file:${tarballs.react}`,
      react: '^19.0.0',
      'react-dom': '^19.0.0',
    },
    devDependencies: {
      vite: '^6.2.0',
      '@vitejs/plugin-react': '^4.3.4',
    },
  };
  fs.writeFileSync(path.join(appADir, 'package.json'), JSON.stringify(pkgJsonA, null, 2));

  fs.writeFileSync(
    path.join(appADir, 'vite.config.js'),
    `import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
export default defineConfig({ plugins: [react()] });\n`,
  );

  fs.writeFileSync(
    path.join(appADir, 'index.html'),
    `<!DOCTYPE html><html><body><div id="root"></div><script type="module" src="/src/main.jsx"></script></body></html>\n`,
  );

  fs.mkdirSync(path.join(appADir, 'src'), { recursive: true });
  fs.writeFileSync(
    path.join(appADir, 'src', 'main.jsx'),
    `import React from 'react';
import { createRoot } from 'react-dom/client';
import { IRichProvider, IRichCanvas } from '@irich/react';
import { createEditor } from '@irich/core';
import '@irich/react/styles.css';

const editor = createEditor();
function App() {
  return (
    <IRichProvider editor={editor}>
      <IRichCanvas components={{}} />
    </IRichProvider>
  );
}
createRoot(document.getElementById('root')).render(<App />);\n`,
  );

  console.log('  Installing in Scenario A...');
  execSync('npm install --no-package-lock', { cwd: appADir, stdio: 'inherit' });

  console.log('  Building Scenario A with Vite...');
  execSync('npx vite build', { cwd: appADir, stdio: 'inherit' });
  console.log('  Scenario A passed: @irich/react built cleanly with ZERO editorial dependency.');

  // 4. Scenario B: Full Editorial Consumer
  console.log('\n[Clean-Room] Scenario B: Composing @irich/react + @irich/editorial...');
  const appBDir = path.join(TEMP_BASE, 'app-editorial-consumer');
  fs.mkdirSync(appBDir, { recursive: true });

  const pkgJsonB = {
    name: 'clean-editorial-consumer',
    private: true,
    version: '0.0.0',
    type: 'module',
    scripts: { build: 'vite build' },
    dependencies: {
      ...pkgJsonA.dependencies,
      '@irich/editorial': `file:${tarballs.editorial}`,
    },
    devDependencies: pkgJsonA.devDependencies,
  };
  fs.writeFileSync(path.join(appBDir, 'package.json'), JSON.stringify(pkgJsonB, null, 2));

  fs.writeFileSync(
    path.join(appBDir, 'vite.config.js'),
    `import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
export default defineConfig({ plugins: [react()] });\n`,
  );

  fs.writeFileSync(
    path.join(appBDir, 'index.html'),
    `<!DOCTYPE html><html><body><div id="root"></div><script type="module" src="/src/main.jsx"></script></body></html>\n`,
  );

  fs.mkdirSync(path.join(appBDir, 'src'), { recursive: true });
  fs.writeFileSync(
    path.join(appBDir, 'src', 'main.jsx'),
    `import React from 'react';
import { createRoot } from 'react-dom/client';
import { IRichProvider, IRichCanvas } from '@irich/react';
import { IRichRenderer } from '@irich/renderer';
import { createEditor } from '@irich/core';
import { createEditorialRegistry, createEditorialComponentMap, redesignedEditorialDocument } from '@irich/editorial';
import '@irich/react/styles.css';
import '@irich/editorial/styles.css';

const registry = createEditorialRegistry();
const components = createEditorialComponentMap();
const editor = createEditor({ initialDocument: redesignedEditorialDocument, registry });

function App() {
  return (
    <div>
      <IRichProvider editor={editor}>
        <IRichCanvas components={components} />
      </IRichProvider>
      <hr />
      <IRichRenderer document={redesignedEditorialDocument} components={components} />
    </div>
  );
}
createRoot(document.getElementById('root')).render(<App />);\n`,
  );

  console.log('  Installing in Scenario B...');
  execSync('npm install --no-package-lock', { cwd: appBDir, stdio: 'inherit' });

  console.log('  Building Scenario B with Vite...');
  execSync('npx vite build', { cwd: appBDir, stdio: 'inherit' });

  // Check generated CSS bundle contains both react chrome and editorial rules
  const distAssets = fs.readdirSync(path.join(appBDir, 'dist', 'assets'));
  const cssFile = distAssets.find((f) => f.endsWith('.css'));
  if (!cssFile) {
    throw new Error('No CSS output found in Scenario B dist/assets');
  }

  const outputCss = fs.readFileSync(path.join(appBDir, 'dist', 'assets', cssFile), 'utf8');
  if (!outputCss.includes('.irich-canvas-node') || !outputCss.includes('.irich-editorial-section')) {
    throw new Error('Output CSS missing required selectors');
  }

  console.log(`  Scenario B passed: Output CSS (${cssFile}, ${outputCss.length} bytes) verified.`);
  console.log('\n[Clean-Room] ALL CLEAN-ROOM SCENARIOS PASSED SUCCESSFULLY!');
} finally {
  try {
    fs.rmSync(TEMP_BASE, { recursive: true, force: true });
  } catch {
    // Ignore cleanup error
  }
}
