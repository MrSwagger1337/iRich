import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const rootDir = path.resolve('c:/Users/moham/Downloads/irich');
const scratchDir = path.resolve(rootDir, 'packages/react/test-clean-room-scratch');

if (fs.existsSync(scratchDir)) {
  fs.rmSync(scratchDir, { recursive: true, force: true });
}
fs.mkdirSync(scratchDir, { recursive: true });

console.log('1. Packing real tarballs for all packages...');
const packages = ['core', 'plugin-sdk', 'renderer', 'ui', 'rich-text', 'react'];
const tarballs = {};

for (const pkg of packages) {
  const pkgDir = path.join(rootDir, 'packages', pkg);
  const packOutput = execSync('pnpm pack --pack-destination ' + scratchDir, { cwd: pkgDir, encoding: 'utf-8' });
  const tgzFile = packOutput.trim().split('\n').pop().trim();
  tarballs[pkg] = path.isAbsolute(tgzFile) ? tgzFile : path.join(scratchDir, tgzFile);
  console.log(`  - Packed @irich/${pkg}: ${tarballs[pkg]}`);
}

console.log('\n2. Verifying tarball contents for CSS static assets...');
for (const [pkg, tgzPath] of Object.entries(tarballs)) {
  const list = execSync(`tar -tf "${tgzPath}"`, { encoding: 'utf-8' });
  if (['ui', 'rich-text', 'react'].includes(pkg)) {
    if (!list.includes('package/dist/styles.css')) {
      throw new Error(`MISSING dist/styles.css in ${pkg} tarball! List:\n${list}`);
    }
    console.log(`  ✓ ${pkg} tarball contains package/dist/styles.css`);
  }
}

console.log('\n3. Creating clean minimal Vite consumer...');
const consumerDir = path.join(scratchDir, 'vite-consumer');
fs.mkdirSync(consumerDir, { recursive: true });
fs.mkdirSync(path.join(consumerDir, 'src'), { recursive: true });

const pkgJson = {
  name: 'test-clean-room-vite-consumer',
  private: true,
  type: 'module',
  scripts: {
    build: 'vite build'
  },
  dependencies: {
    react: '^19.0.0',
    'react-dom': '^19.0.0',
    '@irich/core': `file:${tarballs.core}`,
    '@irich/renderer': `file:${tarballs.renderer}`,
    '@irich/ui': `file:${tarballs.ui}`,
    '@irich/rich-text': `file:${tarballs['rich-text']}`,
    '@irich/plugin-sdk': `file:${tarballs['plugin-sdk']}`,
    '@irich/react': `file:${tarballs.react}`,
    '@dnd-kit/core': '^6.3.1',
    '@dnd-kit/sortable': '^10.0.0',
    '@dnd-kit/utilities': '^3.2.2',
    '@tiptap/core': '^3.31.3',
    '@tiptap/extension-link': '^3.31.3',
    '@tiptap/react': '^3.31.3',
    '@tiptap/starter-kit': '^3.31.3'
  },
  devDependencies: {
    '@vitejs/plugin-react': '^4.3.4',
    vite: '^6.2.0'
  }
};

fs.writeFileSync(path.join(consumerDir, 'package.json'), JSON.stringify(pkgJson, null, 2));

fs.writeFileSync(path.join(consumerDir, 'vite.config.ts'), `
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
});
`);

fs.writeFileSync(path.join(consumerDir, 'index.html'), `
<!DOCTYPE html>
<html>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
`);

fs.writeFileSync(path.join(consumerDir, 'src/main.tsx'), `
import React from 'react';
import { createRoot } from 'react-dom/client';
import '@irich/react/styles.css';
import { IRichProvider, IRichDocumentJsonStudio } from '@irich/react';
import { createEditor } from '@irich/core';

const editor = createEditor();

function App() {
  return (
    <IRichProvider editor={editor}>
      <div className="consumer-app">
        <IRichDocumentJsonStudio />
      </div>
    </IRichProvider>
  );
}

const root = document.getElementById('root');
if (root) {
  createRoot(root).render(<App />);
}
`);

console.log('\n4. Installing packaged tarballs into consumer...');
// Use npm install to ensure completely isolated node_modules without workspace resolution
execSync('npm install --no-package-lock', { cwd: consumerDir, stdio: 'inherit' });

console.log('\n5. Running Vite production build in clean-room consumer...');
execSync('npx vite build', { cwd: consumerDir, stdio: 'inherit' });

console.log('\n6. Inspecting Vite production CSS artifact...');
const distAssets = fs.readdirSync(path.join(consumerDir, 'dist/assets'));
const cssFile = distAssets.find(f => f.endsWith('.css'));
if (!cssFile) {
  throw new Error('No CSS bundle emitted in clean-room Vite production build!');
}
const cssContent = fs.readFileSync(path.join(consumerDir, 'dist/assets', cssFile), 'utf-8');
console.log(`  ✓ Emitted CSS bundle: ${cssFile} (${cssContent.length} bytes)`);

const requiredSelectors = [
  '.irich-json-studio',
  '.irich-json-studio-modal-card',
  '.irich-json-studio-textarea',
  '.irich-inspector-container',
  '.irich-btn',
  '.irich-canvas-node',
  '.irich-rich-toolbar'
];

for (const sel of requiredSelectors) {
  if (!cssContent.includes(sel)) {
    throw new Error(`Clean-room CSS bundle missing expected selector: ${sel}`);
  }
  console.log(`  ✓ Verified selector present: ${sel}`);
}

console.log('\n========================================');
console.log('CLEAN-ROOM CONSUMER VERIFICATION PASSED!');
console.log('========================================\n');

// Clean up scratch dir
fs.rmSync(scratchDir, { recursive: true, force: true });
