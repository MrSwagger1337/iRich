/**
 * @irich/rich-text
 * Server-safe, lightweight pure AST-to-JSX renderer for RichTextDocument.
 * Zero browser or Tiptap runtime dependencies.
 */

import type { ReactNode } from 'react';
import type { IRichTextRendererProps, RichTextMark, RichTextNode } from './types';
import { ensureRichTextDocument } from './utils';

/**
 * Wraps a text React node with its corresponding inline marks.
 */
function applyMarks(textNode: ReactNode, marks?: readonly RichTextMark[]): ReactNode {
  if (!marks || marks.length === 0) {
    return textNode;
  }

  return marks.reduce<ReactNode>((acc, mark, idx) => {
    const key = `mark-${mark.type}-${idx}`;
    switch (mark.type) {
      case 'bold':
        return <strong key={key}>{acc}</strong>;
      case 'italic':
        return <em key={key}>{acc}</em>;
      case 'strike':
        return <s key={key}>{acc}</s>;
      case 'code':
        return <code key={key} className="irich-inline-code">{acc}</code>;
      case 'link': {
        const href = String(mark.attrs?.href ?? '#');
        const target = mark.attrs?.target ? String(mark.attrs.target) : '_blank';
        return (
          <a
            key={key}
            href={href}
            target={target}
            rel="noopener noreferrer"
            className="irich-rich-link"
          >
            {acc}
          </a>
        );
      }
      default:
        return acc;
    }
  }, textNode);
}

/**
 * Recursively renders an individual AST node and its children.
 */
function renderAstNode(node: RichTextNode, index: number): ReactNode {
  const key = `node-${node.type}-${index}`;

  switch (node.type) {
    case 'text':
      return applyMarks(node.text ?? '', node.marks);

    case 'paragraph': {
      const children = node.content?.map((child, i) => renderAstNode(child, i));
      return (
        <p key={key} className="irich-rich-paragraph">
          {children && children.length > 0 ? children : <br />}
        </p>
      );
    }

    case 'heading': {
      const level = Math.min(Math.max(Number(node.attrs?.level ?? 2), 1), 6) as 1 | 2 | 3 | 4 | 5 | 6;
      const HeadingTag = `h${level}` as const;
      const children = node.content?.map((child, i) => renderAstNode(child, i));
      return (
        <HeadingTag key={key} className={`irich-rich-heading irich-rich-h${level}`}>
          {children}
        </HeadingTag>
      );
    }

    case 'bulletList':
      return (
        <ul key={key} className="irich-rich-bullet-list">
          {node.content?.map((child, i) => renderAstNode(child, i))}
        </ul>
      );

    case 'orderedList':
      return (
        <ol key={key} className="irich-rich-ordered-list">
          {node.content?.map((child, i) => renderAstNode(child, i))}
        </ol>
      );

    case 'listItem':
      return (
        <li key={key} className="irich-rich-list-item">
          {node.content?.map((child, i) => renderAstNode(child, i))}
        </li>
      );

    case 'blockquote':
      return (
        <blockquote key={key} className="irich-rich-blockquote">
          {node.content?.map((child, i) => renderAstNode(child, i))}
        </blockquote>
      );

    case 'codeBlock':
      return (
        <pre
          key={key}
          className="irich-rich-code-block"
          dir={node.attrs?.dir ? String(node.attrs.dir) : 'ltr'}
        >
          <code>{node.content?.map((child, i) => renderAstNode(child, i))}</code>
        </pre>
      );

    case 'horizontalRule':
      return <hr key={key} className="irich-rich-hr" />;

    case 'hardBreak':
      return <br key={key} />;

    default:
      if (node.content && Array.isArray(node.content)) {
        return (
          <div key={key} className={`irich-rich-${node.type}`}>
            {node.content.map((child, i) => renderAstNode(child, i))}
          </div>
        );
      }
      return null;
  }
}

/**
 * Pure, lightweight, SSR-compatible AST-to-JSX renderer for RichTextDocument state.
 */
export function IRichTextRenderer({
  content,
  dir,
  lang,
  className = '',
  style,
}: IRichTextRendererProps) {
  const doc = ensureRichTextDocument(content);
  const nodes = doc.content ?? [];

  return (
    <div
      className={`irich-rich-text-content ${className}`.trim()}
      dir={dir}
      lang={lang}
      style={style}
    >
      {nodes.map((node, index) => renderAstNode(node, index))}
    </div>
  );
}
