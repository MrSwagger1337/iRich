import { VERSION } from '@irich/core';

export default function DocsPage() {
  return (
    <main style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <h1>iRich Documentation</h1>
      <p>Version: {VERSION}</p>
      <p>
        iRich is an extensible visual content editor and page builder for React, combining rich-text
        editing capabilities with block-based visual composition.
      </p>
    </main>
  );
}
