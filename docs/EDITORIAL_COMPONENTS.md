# Editorial Component Foundation (`@irich/editorial`)

## 1. Overview & Philosophy

iRich addresses the common CMS "content degeneration" problem, where rich articles inevitably deteriorate into monotonous, flat sequences of `Heading -> Paragraph -> Image`. 

`@irich/editorial` introduces a standard, structured editorial vocabulary that empowers content authors and external AI agents to transform flat content into expressive, layout-rich documents (Sections, 2-Column Grids, Figures with Captions, Callouts, Pull Quotes, Key Takeaways, Card Grids, and CTAs) using pure, JSON-serializable state without embedding arbitrary CSS strings, raw HTML, or JavaScript callbacks.

---

## 2. Component Vocabulary & Semantics

| Component | Category | Semantic Purpose | Allowed Children | Max Children |
| :--- | :--- | :--- | :--- | :--- |
| **`Section`** | `Layout` | Structural container grouping themed content. | Any editorial / custom | Unbounded |
| **`Columns`** | `Layout` | 2-column editorial grid. | `['Column']` | `2` |
| **`Column`** | `Layout (Internal)` | Internal column slot inside `Columns`. Allowed parent: `Columns`. | Any editorial content | Unbounded |
| **`Image`** | `Media` | Structured figure with required alt text, caption, credit, and aspect ratios. | None (`false`) | `0` |
| **`Callout`** | `Editorial` | Contextual aside, notice, or highlighted supporting information. | `['Heading', 'RichText']` | Unbounded |
| **`Quote`** | `Editorial` | Pull quote with structured attribution/source metadata. | `['RichText']` | Unbounded |
| **`KeyTakeaway`**| `Editorial` | Concise central lesson, core finding, or executive summary. | `['Heading', 'RichText']` | Unbounded |
| **`Card`** | `Editorial` | Compositional card with surface framing. | `['Heading', 'RichText', 'Button', 'Image']` | Unbounded |
| **`CardGrid`** | `Layout` | Responsive grid for peer cards. | `['Card']` | Unbounded |
| **`Button`** | `Interactive` | Published navigation link styled as a button. | None (`false`) | `0` |
| **`CTA`** | `Marketing` | Action-oriented concluding or promotional region. | `['Heading', 'RichText', 'Button']` | Unbounded |
| **`Heading`** | `Typography` | Semantic heading with level (`h1`-`h4`), alignment, and color. | None (`false`) | `0` |
| **`RichText`** | `Typography` | Multi-line formatted rich text block. | None (`false`) | `0` |
| **`Container`**| `Layout` | Constrained width layout wrapper. | Any content | Unbounded |

---

## 3. Semantic Distinction: Callout vs. KeyTakeaway vs. CTA

- **`Callout`**: An aside or informational callout providing auxiliary, contextual, or cautionary details (`info`, `insight`, `warning`, `success`).
- **`KeyTakeaway`**: An executive summary highlighting the primary lesson or central conclusion of an article.
- **`CTA`**: A prominent concluding region designed to guide the reader to an action or destination URL via an editorial `Button`.

---

## 4. Columns & Placement Grammar

1. **Columns Cardinality**: In Phase 6, `Columns` represents exactly two columns (`maxChildren: 2`).
2. **Direction-Aware Layouts**:
   - `equal`: `1fr / 1fr`
   - `start-narrow`: `1fr / 2fr` (narrower at the logical start)
   - `end-narrow`: `2fr / 1fr` (narrower at the logical end)
3. **Internal Node Behavior**: `Column` has `allowedParents: ['Columns']` to prevent accidental insertion at root.
4. **CardGrid Grammar**: `CardGrid` strictly allows only `Card` children. Arbitrary text or buttons cannot be placed directly inside a `CardGrid`.

---

## 5. Security & URL Validation

1. **Schema Validation (Primary)**:
   - `Button.href` must be a safe web URL (`https:`, `http:`, `mailto:`, `tel:`, `#`, or relative path).
   - `Image.src` must be a safe web or relative URL (`https:`, `http:`, relative paths). `data:`, `blob:`, `javascript:`, and `vbscript:` are strictly rejected.
2. **Defense-in-Depth (Render Time)**:
   - If an unvalidated or mutated document contains dangerous protocols, `sanitizeHref()` returns `'#'` and `sanitizeImageSrc()` returns `''`.

---

## 6. RTL & Multilingual Support

- Extracted styles strictly use CSS logical properties (`margin-inline`, `padding-inline`, `border-inline-start`, `text-align: start`, `text-align: end`).
- Document metadata `metadata.direction = 'rtl'` and node overrides `node.meta.dir` propagate automatically through `IRichRenderer` and `IRichCanvas`.

---

## 7. Responsive Behavior

- **Columns**: Automatically collapse from 2 columns to a stacked single-column layout on screens `≤ 768px`.
- **CardGrid**: Automatically transitions from 4/3 columns to 2 columns on tablets (`≤ 1024px`) and 1 column on mobile (`≤ 768px`).
- **Image**: Fully responsive with aspect-ratio preservation (`16:9`, `4:3`, `1:1`, `21:9`) and zero horizontal overflow.

---

## 8. Theme Boundary & Custom Properties

Editorial components define customizable CSS custom properties:
```css
:root {
  --irich-content-text: #f8fafc;
  --irich-content-muted: #94a3b8;
  --irich-content-surface: #1e293b;
  --irich-content-surface-muted: #0f172a;
  --irich-content-border: rgba(255, 255, 255, 0.1);
  --irich-content-accent: #6366f1;
  --irich-content-radius: 8px;
  --irich-content-gap: 24px;
}
```

---

## 9. Custom Component Extension Pattern

Consumers can easily extend the standard vocabulary:
```ts
import { createEditorialRegistry } from '@irich/editorial';
import { createEditorialComponentMap } from '@irich/editorial';
import { defineComponent } from '@irich/core';

// 1. Define custom component
export const RecipeComponent = defineComponent({
  type: 'Recipe',
  label: 'Recipe Block',
  category: 'Editorial',
  fields: {
    prepTime: { type: 'text', label: 'Prep Time', defaultValue: '15 mins' },
  },
});

// 2. Extend Registry
export function createAppRegistry() {
  const registry = createEditorialRegistry();
  registry.register(RecipeComponent);
  return registry;
}

// 3. Extend Component Map
export const appComponentMap = createEditorialComponentMap({
  Recipe: RecipeRenderer,
});
```
