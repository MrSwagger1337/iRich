# @irich/editorial

> Standard editorial component vocabulary and renderers for **iRich**.

---

## Features

- **Semantic Editorial Components**: Sections, Columns, Figures, Callouts, Quotes, Key Takeaways, Card Grids, Buttons, and CTAs.
- **Pure JSON Serializable**: Conforms to standard iRich document models without arbitrary CSS strings, raw HTML, or JavaScript callbacks.
- **SSR & RSC Ready**: Lightweight production renderers for `@irich/renderer` with zero visual editor overhead.
- **Built-in Security**: Strict URL validation blocking `javascript:`, `vbscript:`, and unsafe data URIs.
- **RTL & Multilingual**: Direction-aware layout semantics with CSS logical properties.

---

## Installation

```bash
pnpm add @irich/editorial
```

---

## Usage

```tsx
import { IRichRenderer } from '@irich/renderer';
import { createEditorialComponentMap } from '@irich/editorial';
import '@irich/editorial/styles.css';

const components = createEditorialComponentMap();

export function ArticleView({ document }) {
  return <IRichRenderer document={document} components={components} />;
}
```

---

## License

MIT
