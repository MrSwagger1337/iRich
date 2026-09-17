'use client';

import { IRichProvider, IRichEditor } from '@irich/react';

export default function NextjsExamplePage() {
  return (
    <main style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <h1>iRich Next.js Basic Example</h1>
      <p>This example demonstrates how to integrate iRich in Next.js.</p>
      <div
        style={{
          marginTop: '1rem',
          border: '1px solid #ccc',
          padding: '1rem',
          borderRadius: '4px',
        }}
      >
        <IRichProvider>
          <IRichEditor />
        </IRichProvider>
      </div>
    </main>
  );
}
