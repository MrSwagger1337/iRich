# @irich/react

> Primary React developer API: visual editor provider, dynamic property inspector, fine-grained subscription hooks, and drag-and-drop orchestration for **iRich**.

---

## Features

- **`<IRichProvider />`**: Context provider binding an active `EditorInstance` to React.
- **`<IRichInspector />`**: Schema-driven dynamic property inspector with accessible controls (`text`, `textarea`, `number`, `boolean`, `select`, `color`).
- **Fine-Grained Hooks**: `useIRichEditor()`, `useIRichDocument()`, `useIRichSelection()`, `useIRichBreakpoint()`, `useIRichHistory()`, `useIRichNode(id)`, `useIRichAutosave()`, `useIRichKeyboardShortcuts()`.
- **Drag & Drop Orchestration**: Canvas draggable and container dropzone helpers.
- **Keyboard Shortcuts**: Undo (`Cmd/Ctrl+Z`), Redo (`Cmd/Ctrl+Shift+Z`), Copy, Cut, Paste, Duplicate, Delete.

---

## Installation

\`\`\`bash
pnpm add @irich/core @irich/react @irich/renderer
```

---

## Basic Usage

```tsx
import { useMemo } from 'react';
import { createEditor, createComponentRegistry, createDocument } from '@irich/core';
import { IRichProvider, IRichInspector } from '@irich/react';
import '@irich/react/styles.css';

export function Studio() {
  const editor = useMemo(() => {
    return createEditor({
      initialDocument: createDocument(),
    });
  }, []);

  return (
    <IRichProvider editor={editor}>
      <div style={{ display: 'flex' }}>
        <main style={{ flex: 1 }}>
          {/* Interactive Visual Canvas */}
        </main>
        <aside style={{ width: 320 }}>
          <IRichInspector />
        </aside>
      </div>
    </IRichProvider>
  );
}
\`\`\`

---

## License

MIT
