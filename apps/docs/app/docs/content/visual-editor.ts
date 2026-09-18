import type { DocPage } from '../types';

export const visualEditorPages: DocPage[] = [
  {
    slug: 'canvas',
    category: 'visual-editor',
    categoryTitle: 'Visual Editor',
    title: 'Visual Canvas & Node Overlays',
    description: 'Interactive canvas layout, selection boundaries, hover outlines, and click-to-select interactions.',
    badge: 'React',
    sections: [
      { id: 'canvas-architecture', title: 'Canvas Architecture' },
      { id: 'interactive-node-wrapper', title: 'Interactive Node Wrapper' },
      { id: 'selection-and-hover-states', title: 'Selection & Hover States' },
    ],
    content: `
## Canvas Architecture

The visual canvas is the central workspace where users interact with live preview components.

In iRich, canvas components are normal React components wrapped with lightweight interaction handlers that listen for clicks, hover states, and drag-and-drop actions.

---

## Interactive Node Wrapper

You can build interactive canvas nodes using \`useIRichSelection()\` and \`useIRichEditor()\`:

\`\`\`tsx
import React from 'react';
import type { IRichNode } from '@irich/core';
import { useIRichSelection } from '@irich/react';

export function InteractiveNode({
  node,
  renderers,
}: {
  node: IRichNode;
  renderers: Record<string, React.ComponentType<any>>;
}) {
  const { selectedNodeId, selectNode } = useIRichSelection();
  const isSelected = selectedNodeId === node.id;
  const Renderer = renderers[node.type];

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    selectNode(node.id);
  };

  return (
    <div
      onClick={handleClick}
      style={{
        position: 'relative',
        outline: isSelected ? '2px solid #6366f1' : '1px dashed transparent',
        cursor: 'pointer',
        margin: '0.5rem 0',
      }}
    >
      {isSelected && (
        <div className="selection-badge">
          {node.type}
        </div>
      )}

      {Renderer ? <Renderer node={node} {...node.props} /> : <div>Unknown component</div>}
    </div>
  );
}
\`\`\`

---

## Selection & Hover States

When a node is selected on the canvas:
1. \`useIRichSelection()\` updates with \`selectedNodeId\`.
2. The property inspector (\`<IRichInspector />\`) resolves the node definition and displays dynamic field controls.
3. Keyboard shortcuts (Delete, Duplicate, Copy, Cut) target the active selection.
`,
  },
  {
    slug: 'palette',
    category: 'visual-editor',
    categoryTitle: 'Visual Editor',
    title: 'Component Palette & Insertion',
    description: 'Building a component palette from registered schemas for 1-click and drag-and-drop insertion.',
    badge: 'React',
    sections: [
      { id: 'palette-generation', title: 'Dynamic Palette Generation' },
      { id: 'insert-action-handler', title: 'Handling Component Insertion' },
      { id: 'drag-and-drop-insertion', title: 'Drag and Drop Insertion' },
    ],
    content: `
## Dynamic Palette Generation

The component palette queries all registered definitions from \`registry.getAll()\`:

\`\`\`tsx
import { useMemo } from 'react';
import { useIRichEditor, useIRichDocument, useIRichSelection } from '@irich/react';
import { createNode } from '@irich/core';

export function ComponentPalette() {
  const editor = useIRichEditor();
  const document = useIRichDocument();
  const { selectedNodeId } = useIRichSelection();
  const registry = editor.getRegistry();

  const components = useMemo(() => {
    return registry ? registry.getAll() : [];
  }, [registry]);

  const handleInsert = (type: string) => {
    const compDef = registry?.get(type);
    const defaultProps = compDef?.defaultProps ?? {};

    const newNode = createNode({
      type,
      props: defaultProps as any,
    });

    const targetParentId = selectedNodeId ?? document.root.id;

    editor.commands.insertNode({
      node: newNode,
      parentId: targetParentId,
    });

    editor.commands.selectNode(newNode.id);
  };

  return (
    <div className="palette-grid">
      {components.map((comp) => (
        <button
          key={comp.type}
          onClick={() => handleInsert(comp.type)}
          className="palette-button"
        >
          <span>{comp.label}</span>
          <small>{comp.category}</small>
        </button>
      ))}
    </div>
  );
}
\`\`\`

---

## Drag and Drop Insertion

\`@irich/react\` exports \`useIRichPaletteDraggable\` and \`useIRichDroppableContainer\` for smooth drag-and-drop insertion from the palette into the canvas.
`,
  },
  {
    slug: 'inspector',
    category: 'visual-editor',
    categoryTitle: 'Visual Editor',
    title: 'Property Inspector (<IRichInspector />)',
    description: 'Dynamic schema-driven form generation, accessible controls, and live property mutations.',
    badge: 'React',
    sections: [
      { id: 'inspector-overview', title: 'Inspector Overview' },
      { id: 'irich-inspector-component', title: '<IRichInspector /> Primitive' },
      { id: 'dynamic-field-generation', title: 'Dynamic Field Generation' },
      { id: 'empty-states', title: 'Empty State Handling' },
    ],
    content: `
## Inspector Overview

\`<IRichInspector />\` automatically generates accessible editing controls for whichever node is currently selected on the canvas.

When a user selects a node:
1. Resolves the active \`node.type\` from the component registry.
2. Iterates over \`definition.fields\` (\`text\`, \`textarea\`, \`number\`, \`boolean\`, \`select\`, \`color\`).
3. Reads current prop values (or field defaults).
4. Dispatches mutations through \`editor.commands.updateNode()\`.

---

## <IRichInspector /> Primitive

\`\`\`tsx
import { IRichInspector } from '@irich/react';

export function SidebarPanel() {
  return (
    <aside style={{ width: '320px', padding: '1rem', background: '#0f172a' }}>
      <h3 style={{ fontSize: '0.875rem', fontWeight: 700, color: '#94a3b8' }}>Properties</h3>
      <IRichInspector />
    </aside>
  );
}
\`\`\`

---

## Dynamic Field Generation

Every field descriptor maps to an accessible control:

- **\`text\`**: Renders \`<TextFieldControl />\` with validation patterns.
- **\`textarea\`**: Renders \`<TextareaFieldControl />\` with multi-line rows.
- **\`number\`**: Renders \`<NumberFieldControl />\` with min/max/step stepper.
- **\`boolean\`**: Renders \`<BooleanFieldControl />\` with switch toggle.
- **\`select\`**: Renders \`<SelectFieldControl />\` with dropdown options.
- **\`color\`**: Renders \`<ColorFieldControl />\` with color picker swatch.

---

## Empty State Handling

When no node is selected, \`<IRichInspector />\` displays a sensible empty state prompting the user to click a block on the canvas to inspect its properties.
`,
  },
  {
    slug: 'responsive',
    category: 'visual-editor',
    categoryTitle: 'Visual Editor',
    title: 'Responsive Breakpoints & Cascading Overrides',
    description: 'Desktop, tablet, and mobile editing, cascading inheritance, and non-destructive property overrides.',
    badge: 'Core',
    sections: [
      { id: 'breakpoints-overview', title: 'Breakpoints Overview' },
      { id: 'cascading-inheritance', title: 'Cascading Fallback Inheritance' },
      { id: 'viewport-controls', title: 'Viewport Switcher Toolbar' },
      { id: 'non-destructive-editing', title: 'Non-Destructive Overrides' },
    ],
    content: `
## Breakpoints Overview

iRich provides 3 standard editor breakpoints:

| Breakpoint | Target Device | Width |
| :--- | :--- | :--- |
| \`desktop\` | Large Screens / Base | \`100%\` |
| \`tablet\` | Tablets / Medium Screens | \`768px\` |
| \`mobile\` | Mobile Devices | \`375px\` |

---

## Cascading Fallback Inheritance

When resolving property values for a given breakpoint, iRich follows a cascading fallback sequence:

\`\`\`
Desktop (Base) ──> Tablet (Override) ──> Mobile (Override)
\`\`\`

- **Mobile View**: Resolves \`mobile\` override ➔ falls back to \`tablet\` ➔ falls back to \`desktop\` ➔ falls back to \`defaultValue\`.
- **Tablet View**: Resolves \`tablet\` override ➔ falls back to \`desktop\` ➔ falls back to \`defaultValue\`.
- **Desktop View**: Resolves base \`desktop\` value ➔ falls back to \`defaultValue\`.

---

## Viewport Switcher Toolbar

Use \`useIRichBreakpoint()\` to switch the active editor viewport:

\`\`\`tsx
import { useIRichBreakpoint, type Breakpoint } from '@irich/react';

export function ViewportControls() {
  const { breakpoint, setBreakpoint } = useIRichBreakpoint();

  return (
    <div style={{ display: 'flex', gap: '4px' }}>
      {(['desktop', 'tablet', 'mobile'] as Breakpoint[]).map((bp) => (
        <button
          key={bp}
          onClick={() => setBreakpoint(bp)}
          style={{
            fontWeight: breakpoint === bp ? 700 : 400,
            background: breakpoint === bp ? '#6366f1' : 'transparent',
            color: '#fff',
          }}
        >
          {bp}
        </button>
      ))}
    </div>
  );
}
\`\`\`

---

## Non-Destructive Overrides

When an editor modifies a responsive property while in **Mobile Mode**, iRich saves the override under \`props[key].mobile\` without altering or destroying the Desktop value!
`,
  },
  {
    slug: 'rich-text',
    category: 'visual-editor',
    categoryTitle: 'Visual Editor',
    title: 'Rich Text Editing (@irich/rich-text)',
    description: 'Formatted multi-line text, typography marks, Tiptap abstraction, and inline editing.',
    badge: 'Stable',
    sections: [
      { id: 'rich-text-overview', title: 'Rich Text Overview' },
      { id: 'rich-text-renderer', title: '<IRichTextRenderer />' },
      { id: 'inline-rich-text-editor', title: 'Inline Rich Text Editor' },
      { id: 'json-serializable-marks', title: 'JSON Serializable Marks' },
    ],
    content: `
## Rich Text Overview

\`@irich/rich-text\` provides rich formatted text editing within visual components:

- Supports headings, bold, italic, strikethrough, links, bullet lists, ordered lists, blockquotes, and code blocks.
- **Tiptap Decoupling**: Tiptap is used as an underlying engine implementation detail; consumers interact exclusively through clean iRich APIs.
- **Strict JSON**: Rich-text state is strictly stored as ProseMirror-compatible JSON, never raw unsafe HTML strings.

---

## <IRichTextRenderer />

Render formatted rich-text blocks in both SSR and client environments:

\`\`\`tsx
import { IRichTextRenderer, isRichTextDocument, type RichTextDocument } from '@irich/rich-text';

export function MyRichTextBlock({ content }: { content: RichTextDocument }) {
  if (isRichTextDocument(content)) {
    return <IRichTextRenderer content={content} />;
  }

  return <p>{String(content)}</p>;
}
\`\`\`

---

## Inline Rich Text Editor

\`\`\`tsx
import { IRichTextEditor } from '@irich/rich-text';

export function EditableRichText({
  value,
  onChange,
}: {
  value: any;
  onChange: (doc: any) => void;
}) {
  return (
    <IRichTextEditor
      value={value}
      onChange={onChange}
      placeholder="Type formatted text..."
    />
  );
}
\`\`\`
`,
  },
];
