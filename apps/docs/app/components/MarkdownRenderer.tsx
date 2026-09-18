'use client';

import React from 'react';
import { CodeBlock } from './CodeBlock';

interface MarkdownRendererProps {
  content: string;
}

export function MarkdownRenderer({ content }: MarkdownRendererProps) {
  // Simple, robust custom parser for documentation markdown
  const lines = content.split('\n');
  const elements: React.ReactNode[] = [];

  let inCodeBlock = false;
  let codeLanguage = '';
  let codeBuffer: string[] = [];
  let inTable = false;
  let tableRows: string[][] = [];
  let inList = false;
  let listItems: string[] = [];

  const flushList = (key: string) => {
    if (listItems.length > 0) {
      elements.push(
        <ul key={key} style={{ margin: '1rem 0 1.5rem 1.5rem', color: 'var(--text-secondary)' }}>
          {listItems.map((item, idx) => (
            <li key={idx} dangerouslySetInnerHTML={{ __html: formatInline(item) }} />
          ))}
        </ul>,
      );
      listItems = [];
      inList = false;
    }
  };

  const flushTable = (key: string) => {
    if (tableRows.length > 0) {
      const [header, , ...body] = tableRows;
      elements.push(
        <div key={key} className="docs-table-wrapper">
          <table className="docs-table">
            <thead>
              <tr>
                {header.map((col, idx) => (
                  <th key={idx} dangerouslySetInnerHTML={{ __html: formatInline(col.trim()) }} />
                ))}
              </tr>
            </thead>
            <tbody>
              {body.map((row, rIdx) => (
                <tr key={rIdx}>
                  {row.map((cell, cIdx) => (
                    <td key={cIdx} dangerouslySetInnerHTML={{ __html: formatInline(cell.trim()) }} />
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>,
      );
      tableRows = [];
      inTable = false;
    }
  };

  const formatInline = (text: string): string => {
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/`([^`]+)`/g, '<code>$1</code>')
      .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" style="color: #818cf8; text-decoration: underline;">$1</a>');
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Handle Code Blocks
    if (line.startsWith('```')) {
      if (inCodeBlock) {
        elements.push(
          <CodeBlock
            key={`code-${i}`}
            code={codeBuffer.join('\n')}
            language={codeLanguage || 'text'}
          />,
        );
        codeBuffer = [];
        inCodeBlock = false;
        codeLanguage = '';
      } else {
        if (inList) flushList(`list-${i}`);
        if (inTable) flushTable(`table-${i}`);
        inCodeBlock = true;
        codeLanguage = line.slice(3).trim();
      }
      continue;
    }

    if (inCodeBlock) {
      codeBuffer.push(line);
      continue;
    }

    // Handle Tables
    if (line.startsWith('|')) {
      if (inList) flushList(`list-${i}`);
      inTable = true;
      const cols = line
        .split('|')
        .slice(1, -1)
        .map((c) => c.trim());
      tableRows.push(cols);
      continue;
    } else if (inTable) {
      flushTable(`table-${i}`);
    }

    // Handle Lists
    if (line.startsWith('- ') || line.startsWith('* ')) {
      inList = true;
      listItems.push(line.slice(2));
      continue;
    } else if (inList && !line.trim()) {
      flushList(`list-${i}`);
    }

    // Handle Headings
    if (line.startsWith('## ')) {
      if (inList) flushList(`list-${i}`);
      const text = line.slice(3).trim();
      const id = text
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      elements.push(
        <h2 key={`h2-${i}`} id={id}>
          {text}
        </h2>,
      );
      continue;
    }

    if (line.startsWith('### ')) {
      if (inList) flushList(`list-${i}`);
      const text = line.slice(4).trim();
      const id = text
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      elements.push(
        <h3 key={`h3-${i}`} id={id}>
          {text}
        </h3>,
      );
      continue;
    }

    // Handle Callout Quotes
    if (line.startsWith('> ')) {
      if (inList) flushList(`list-${i}`);
      const content = line.slice(2).trim();
      let calloutClass = 'docs-callout-note';
      if (content.includes('[Experimental API]')) calloutClass = 'docs-callout-experimental';
      else if (content.toLowerCase().includes('important')) calloutClass = 'docs-callout-warning';
      else if (content.toLowerCase().includes('tip')) calloutClass = 'docs-callout-tip';

      elements.push(
        <div key={`callout-${i}`} className={`docs-callout ${calloutClass}`}>
          <div dangerouslySetInnerHTML={{ __html: formatInline(content) }} />
        </div>,
      );
      continue;
    }

    // Handle Dividers
    if (line.trim() === '---') {
      if (inList) flushList(`list-${i}`);
      elements.push(<hr key={`hr-${i}`} style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '2rem 0' }} />);
      continue;
    }

    // Handle Paragraphs
    if (line.trim()) {
      if (!inList && !inTable) {
        elements.push(
          <p
            key={`p-${i}`}
            dangerouslySetInnerHTML={{ __html: formatInline(line) }}
          />,
        );
      }
    }
  }

  if (inList) flushList('list-end');
  if (inTable) flushTable('table-end');

  return <div className="docs-prose">{elements}</div>;
}
