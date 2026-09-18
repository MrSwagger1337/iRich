'use client';

import { useState } from 'react';

export function CodeBlock({ code, language = 'typescript' }: { code: string; language?: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="docs-code-container">
      <div className="docs-code-header">
        <span>{language}</span>
        <button onClick={handleCopy} className="docs-copy-btn">
          {copied ? '✓ Copied' : 'Copy'}
        </button>
      </div>
      <pre className="docs-code-block">
        <code>{code}</code>
      </pre>
    </div>
  );
}
