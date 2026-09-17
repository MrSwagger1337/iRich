/**
 * @irich/core
 * Core data structures, state machine, and engine for iRich.
 */

export const VERSION = '0.1.0';

export type NodeId = string;

export interface IRichNode {
  id: NodeId;
  type: string;
  props?: Record<string, unknown>;
  children?: IRichNode[];
}

export interface IRichDocument {
  version: string;
  root: IRichNode;
  metadata?: Record<string, unknown>;
}

export interface EditorState {
  document: IRichDocument;
  selection: NodeId | null;
}

export interface EditorConfig {
  initialDocument?: IRichDocument;
}

export class Editor {
  private state: EditorState;

  constructor(config: EditorConfig = {}) {
    this.state = {
      document: config.initialDocument ?? {
        version: VERSION,
        root: {
          id: 'root',
          type: 'root',
          children: [],
        },
      },
      selection: null,
    };
  }

  getState(): EditorState {
    return this.state;
  }

  getDocument(): IRichDocument {
    return this.state.document;
  }

  select(id: NodeId | null): void {
    this.state = {
      ...this.state,
      selection: id,
    };
  }
}
