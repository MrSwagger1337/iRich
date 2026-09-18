# @irich/renderer

> Lightweight, SSR-compatible production rendering engine for **iRich** documents.

`@irich/renderer` compiles canonical iRich JSON documents into standard React component trees with **zero visual editor or canvas bundle overhead** (< 15kB gzipped).

---

## Features

- **Decoupled Production Rendering**: Zero editor studio code, canvas overlays, or property inspectors loaded on published pages.
- **SSR & RSC Ready**: Executes cleanly in Next.js Server Components, Remix, Astro, Vite, and standard client SPAs.
- **Deterministic Responsive Resolution**: Resolves breakpoint overrides on the server or client without DOM measurements.

---

## Installation

\`\`\`bash
pnpm add @irich/core @irich/renderer
\`\`\`

---

## Basic Usage

\`\`\`tsx
import { IRichRenderer, type ComponentRenderer, type NodeRendererProps } from '@irich/renderer';

interface HeroProps {
  title?: string;
}

const HeroRenderer: ComponentRenderer<HeroProps> = ({
  node,
  title = (node.props.title as string) || 'Hero Title',
}: NodeRendererProps<HeroProps>) => {
  return (
    <section>
      <h1>{title}</h1>
    </section>
  );
};

const components = {
  Hero: HeroRenderer,
};

export function PublishedPage({ document }: { document: any }) {
  return <IRichRenderer document={document} components={components} />;
}
\`\`\`

---

## License

MIT
