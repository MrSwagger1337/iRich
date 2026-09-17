# iRich Plugin Architecture & Extension API

> Extension model, lifecycle hooks, middleware pipeline, and custom plugin definitions for **iRich**.

---

## 1. Plugin System Overview

iRich plugins enable modular expansion of the editor engine, canvas controls, commands, and UI panels. All plugins are declared through `@irich/plugin-sdk` and must interact strictly through defined public APIs and event dispatchers.

```
+-------------------------------------------------------------------------+
|                              IRichPlugin                                |
+-------------------------------------------------------------------------+
|  - Metadata (name, version)                                             |
|  - Extension Points:                                                    |
|      * Components & Blocks (register custom components)                 |
|      * Commands (register custom transaction commands)                  |
|      * Middleware (beforeCommand / afterCommand interception)           |
|      * UI Injections (Toolbar actions, Inspector panels, Sidebar tabs)  |
|      * Canvas Overlays (custom hover boxes, resize handles)             |
|      * External Adapters (autosave, analytics, AI generation, CRDT)     |
+-------------------------------------------------------------------------+
```

---

## 2. Plugin Definition Contract (`@irich/plugin-sdk`)

```typescript
import type React from 'react';
import type { EditorInstance, EditorState, IRichDocument, IRichNode } from '@irich/core';

export interface PluginContext {
  editor: EditorInstance;
  getState: () => EditorState;
  dispatch: (commandName: string, payload: unknown) => void;
}

export interface MiddlewareNext {
  (): void;
}

export interface CommandMiddlewareContext {
  commandName: string;
  payload: unknown;
  state: EditorState;
}

export type CommandMiddleware = (context: CommandMiddlewareContext, next: MiddlewareNext) => void;

export interface ToolbarItemContribution {
  id: string;
  label: string;
  icon?: React.ReactNode;
  position?: 'start' | 'center' | 'end';
  onClick: (context: PluginContext) => void;
  isActive?: (state: EditorState) => boolean;
  isDisabled?: (state: EditorState) => boolean;
}

export interface InspectorTabContribution {
  id: string;
  label: string;
  render: (props: { selectedNode: IRichNode; context: PluginContext }) => React.ReactNode;
}

export interface IRichPlugin {
  /**
   * Unique plugin identifier (e.g., 'core:history', 'plugin:autosave', 'plugin:ai-assistant').
   */
  name: string;

  /**
   * SemVer string.
   */
  version?: string;

  /**
   * Lifecycle initializer invoked when the editor mounts.
   */
  init?: (context: PluginContext) => void;

  /**
   * Lifecycle cleanup invoked when the editor unmounts.
   */
  destroy?: (context: PluginContext) => void;

  /**
   * Command interception and validation middleware.
   */
  middleware?: CommandMiddleware[];

  /**
   * UI Contributions to toolbar primitives.
   */
  toolbarItems?: ToolbarItemContribution[];

  /**
   * Custom Inspector tabs.
   */
  inspectorTabs?: InspectorTabContribution[];
}

export function definePlugin(plugin: IRichPlugin): IRichPlugin {
  return plugin;
}
```

---

## 3. Concrete Plugin Examples

### Example 1: `AutoSavePlugin` (Document Persistence)

```typescript
import { definePlugin, type PluginContext } from '@irich/plugin-sdk';
import type { IRichDocument } from '@irich/core';

export interface AutoSaveOptions {
  debounceMs?: number;
  onSave: (doc: IRichDocument) => Promise<void> | void;
}

export function createAutoSavePlugin(options: AutoSaveOptions) {
  let timer: NodeJS.Timeout | null = null;
  let unsubscribe: (() => void) | null = null;

  return definePlugin({
    name: 'plugin:autosave',
    version: '1.0.0',
    init(context: PluginContext) {
      unsubscribe = context.editor.subscribe((state) => {
        if (timer) clearTimeout(timer);
        timer = setTimeout(() => {
          options.onSave(state.document);
        }, options.debounceMs ?? 1000);
      });
    },
    destroy() {
      if (timer) clearTimeout(timer);
      if (unsubscribe) unsubscribe();
    },
  });
}
```

---

### Example 2: `AIAssistantPlugin` (AI Command Extension)

```typescript
import React from 'react';
import { definePlugin, type PluginContext } from '@irich/plugin-sdk';

export function createAIAssistantPlugin(endpointUrl: string) {
  return definePlugin({
    name: 'plugin:ai-assistant',
    version: '1.0.0',
    toolbarItems: [
      {
        id: 'ai-generate-block',
        label: 'Ask AI',
        onClick: async (context: PluginContext) => {
          const state = context.getState();
          const selectedId = state.selection;

          const prompt = window.prompt('Describe the block or content you want to generate:');
          if (!prompt) return;

          // Dispatch asynchronous AI generation
          const response = await fetch(endpointUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt, currentDoc: state.document }),
          });

          const generatedNode = await response.json();
          if (generatedNode && selectedId) {
            context.editor.commands.insertNode({
              node: generatedNode,
              parentId: selectedId,
            });
          }
        },
      },
    ],
  });
}
```

---

## 4. Plugin Isolation & Security Principles

1. **No Direct State Mutation**: Plugins never mutate `state.document` directly; they must dispatch transactions through `context.editor.dispatch()`.
2. **Deterministic Cleanup**: Plugins must register all timers, DOM listeners, or network streams in `init` and tear them down completely in `destroy`.
3. **No Private Internal Access**: Plugins cannot access internal transaction indexes, uncommitted buffers, or private DOM nodes.
