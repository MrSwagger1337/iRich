# Changelog

All notable changes to the **iRich** project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## 0.1.0 (2026-09-18)

Initial public release of **iRich** — an embeddable, extensible visual content editor and page builder for React.

### Features & Capabilities

#### Core Document Engine (`@irich/core`)
- **Framework-Independent Core**: Pure TypeScript engine with zero DOM, React, or browser dependencies. Executable in Node.js, workers, edge runtimes, and browsers.
- **JSON-Serializable Document Model**: Strongly-typed tree data structures (`IRichDocument`, `IRichNode`) with stable IDs and strict JSON serializability.
- **Command & Transaction System**: Immutable state mutations dispatched through transactional editor commands (`insertNode`, `removeNode`, `moveNode`, `updateNode`, `duplicateNode`, `replaceDocument`, `batch`).
- **History Management**: Comprehensive undo/redo stack tracking with configurable limits, dirty flags, and snapshot jumping.
- **Component Registry**: Dynamic registry for component definitions with schema-validated fields (`text`, `textarea`, `number`, `boolean`, `select`, `color`, `image`, `custom`).
- **Responsive Values**: First-class responsive values (`ResponsiveValue<T>`) supporting breakpoint overrides (`desktop`, `tablet`, `mobile`) and inheritance fallbacks.
- **Persistence Abstraction**: Pluggable storage interface (`IRichStorageAdapter`, `MemoryStorageAdapter`) for asynchronous document loading and saving without backend lock-in.
- **AI Action Protocol**: Declarative, schema-validated protocol (`validateAIActions`, `applyAIActions`) enabling sandboxed, command-based AI transformations without arbitrary code execution.

#### Production Renderer (`@irich/renderer`)
- **Standalone Lightweight Renderer**: Pure React component (`IRichRenderer`) decoupled from the visual editor and property sidebars.
- **Server-Side Rendering (SSR) & RSC Compatibility**: Renders JSON document trees to semantic HTML without browser APIs.
- **Responsive Resolution**: SSR-safe responsive value resolution based on viewport overrides and default fallback chains.
- **Custom Component Mapping**: Flexible mapping between document node types and React render components.

#### Plugin System (`@irich/plugin-sdk`)
- **Plugin Architecture**: Clean extension model (`IRichPlugin`, `PluginContext`, `PluginManager`) with isolated hooks and event subscriptions.
- **Extension Points**: Register custom commands, field controls, toolbar items, canvas overlays, inspector panels, and lifecycle hooks.
- **Engine Isolation**: Plugins interact exclusively through documented public APIs without direct engine state mutation.

#### Rich Text System (`@irich/rich-text`)
- **Structured Rich Text**: Rich text nodes (`RichTextDocument`, `RichTextNode`, `RichTextMark`) supporting headings, paragraphs, lists, links, bold, italic, underline, code, and alignment.
- **Editor & Floating Toolbar**: Inline rich-text editor (`IRichTextEditor`) with floating formatting toolbar (`RichTextFloatingToolbar`).
- **Renderer**: Pure rich text rendering component (`IRichTextRenderer`).

#### UI Primitives (`@irich/ui`)
- **Accessible Design System**: Base UI component primitives styled with CSS modules / variables (buttons, toolbars, inputs, modals, menus, tabs).
- **Accessibility (a11y)**: Built with proper ARIA attributes, semantic HTML, and keyboard navigation.

#### React Bindings & Visual Editor (`@irich/react`)
- **React Context & State Hooks**: Fine-grained reactive hooks (`useIRich`, `useIRichEditor`, `useIRichDocument`, `useIRichNode`, `useIRichSelection`, `useIRichHistory`, `useIRichBreakpoint`).
- **Full Visual Editor**: Integrated editor canvas (`IRichEditor`, `IRichCanvas`) with visual selection outlines and responsive viewport switching.
- **Property Inspector**: Auto-generating inspector (`IRichInspector`) that adapts field controls to registered component schemas and active breakpoints.
- **Drag and Drop**: Smooth drag-and-drop authoring built with `@dnd-kit` (`IRichDndProvider`, canvas draggables, and component palette dropping).
- **Productivity Commands & Shortcuts**: Built-in clipboard operations (`copyNode`, `cutNode`, `pasteNode`, `duplicateNode`) and keyboard shortcuts (Ctrl/Cmd+C, Ctrl/Cmd+V, Ctrl/Cmd+X, Ctrl/Cmd+D, Delete/Backspace, Ctrl/Cmd+Z, Ctrl/Cmd+Shift+Z) with input focus guard.
- **Browser Persistence & Autosave**: `LocalStorageAdapter` and `useIRichAutosave` hook with debounce, saving states, and error handling.

#### Framework Integrations & Examples
- **Next.js Support**: Compatible with Next.js App Router (SSR renderer + `"use client"` visual editor). Verified with example in `examples/nextjs-basic`.
- **React / Vite Support**: Clean compatibility with standard React + Vite setups. Verified with example in `examples/react-vite`.
- **Documentation Website**: Interactive documentation portal in `apps/docs`.
