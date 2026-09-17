'use client';

import { IRichProvider, IRichEditor } from '@irich/react';

export default function PlaygroundPage() {
  return (
    <main style={{ padding: '2rem', maxWidth: '1000px', margin: '0 auto' }}>
      <h1>iRich Editor Playground</h1>
      <p>Live sandbox environment for iRich components and plugins.</p>
      <div
        style={{
          marginTop: '1.5rem',
          border: '1px solid #e2e8f0',
          borderRadius: '8px',
          padding: '1.5rem',
        }}
      >
        <IRichProvider>
          <IRichEditor />
        </IRichProvider>
      </div>
    </main>
  );
}
