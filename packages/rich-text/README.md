# @irich/rich-text

> Rich-text authoring, inline formatting marks, and server-safe rendering for **iRich**.

---

## Features

- **Inline Typography & Marks**: Bold, italic, strikethrough, link, headings, bullet list, ordered list, blockquote, and code blocks.
- **Headless Tiptap Integration**: Tiptap is an implementation detail; consumers interact strictly with clean iRich APIs.
- **Strict JSON-Serializable Documents**: Stores rich-text as canonical JSON, preventing raw unsafe HTML strings in state.

---

## Installation

\`\`\`bash
pnpm add @irich/core @irich/plugin-sdk @irich/rich-text
\`\`\`

---

## Basic Usage

\`\`\`tsx
import { IRichTextEditor, IRichTextRenderer, isRichTextDocument } from '@irich/rich-text';

// Render formatted rich text
export function RichTextDisplay({ content }: { content: any }) {
  if (isRichTextDocument(content)) {
    return <IRichTextRenderer content={content} />;
  }
  return <p>{String(content)}</p>;
}
\`\`\`

---

## License

MIT
