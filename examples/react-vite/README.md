# iRich React + Vite Example

> Standalone single-page application (SPA) demonstrating **iRich** integration with **Vite 6** and **React 19**, verifying that iRich operates natively with **zero Next.js dependencies**.

---

## Overview

This example demonstrates how an external client-side React application consumes iRich packages directly from a standard Vite workspace.

### Demonstrated Capabilities

1. **Framework-Independent Component Registration**:
   - Custom component definitions declared via `defineComponent` in [`src/components/definitions.ts`](./src/components/definitions.ts).
   - Component registry created via `createComponentRegistry()`.
   - Responsive field schemas (`padding`, `align`, etc.) defined with multi-breakpoint fallback support.

2. **Decoupled Production Rendering**:
   - Published pages render documents using `<IRichRenderer />` from `@irich/renderer`.
   - Lightweight, standalone rendering with **zero** visual editor or inspector JavaScript loaded on the published page.

3. **Interactive Visual Studio Editor**:
   - Three-pane visual studio layout with component palette, interactive canvas, and `<IRichInspector />`.
   - Component drag/click insertion with automatic default props initialization.
   - Dynamic schema-driven property inspector modifying node props in real-time through `editor.commands.updateNode()`.
   - Responsive viewport switcher (Desktop, Tablet, Mobile) with live responsive prop previewing.
   - Productivity keyboard shortcuts (`Cmd/Ctrl+Z`, `Cmd/Ctrl+Shift+Z`, `Cmd/Ctrl+C`, `Cmd/Ctrl+V`, `Cmd/Ctrl+D`, `Delete`).

4. **Persistence & Autosave**:
   - Real-time debounced persistence to browser `localStorage` via `LocalStorageAdapter` and `useIRichAutosave()`.
   - Interactive JSON Drawer supporting full export and live import of canonical JSON documents.

---

## Architectural Verification: Zero Next.js Coupling

A primary design requirement of iRich (Principle #1 and #3 in `AGENTS.md`) is that `@irich/core`, `@irich/renderer`, `@irich/react`, `@irich/rich-text`, and `@irich/ui` must **never require or depend on Next.js**.

This project verifies:
- Production bundle builds cleanly via standard Vite and Rollup (`vite build`).
- TypeScript typechecks with `tsc --noEmit` without any Next.js ambient types or runtimes.
- No compatibility shims or polyfills needed in `@irich/core`.

---

## Project Structure

```
examples/react-vite/
├── src/
│   ├── components/
│   │   ├── definitions.ts       # iRich component definitions & registry (Hero, Card, Alert, Container, RichText, Heading, Button)
│   │   ├── renderers.tsx         # Standalone React renderers for components
│   │   └── sample-document.ts   # Canonical initial JSON document
│   ├── App.tsx                  # Main SPA switching between Live Published Preview and Visual Studio
│   ├── main.tsx                 # Vite React entrypoint
│   └── index.css                # Vite-themed dark-mode stylesheet
├── index.html                   # HTML entry
├── vite.config.ts               # Vite 6 configuration
├── package.json
└── tsconfig.json
```

---

## Running the Example

### Development Mode

Start the Vite dev server with hot-module replacement (HMR):

```bash
pnpm --filter example-react-vite dev
```

Then open `http://localhost:5173` in your browser.

### Production Build

Run the TypeScript typecheck and Vite production build:

```bash
pnpm --filter example-react-vite build
```

Preview the production build locally:

```bash
pnpm --filter example-react-vite preview
```
