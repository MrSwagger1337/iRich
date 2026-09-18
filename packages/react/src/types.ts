/**
 * @irich/react
 * Types for React bindings, context, and hooks.
 */

import type { ReactNode } from 'react';
import type {
  Breakpoint,
  EditorConfig,
  EditorInstance,
  EditorState,
  IRichDocument,
  NodeId,
} from '@irich/core';

/**
 * Props for the root <IRichProvider /> component.
 */
export interface IRichProviderProps {
  /**
   * An existing EditorInstance. If provided, the provider will not create or destroy its own instance.
   */
  editor?: EditorInstance;

  /**
   * Initial document if creating an internal editor.
   */
  initialDocument?: IRichDocument;

  /**
   * Configuration options if creating an internal editor.
   */
  config?: EditorConfig;

  /**
   * Callback fired whenever the canonical document is updated.
   */
  onChange?: (document: IRichDocument) => void;

  /**
   * Callback fired whenever the selected node ID changes.
   */
  onSelectionChange?: (selectedNodeId: NodeId | null) => void;

  /**
   * Callback fired whenever the active viewport breakpoint changes.
   */
  onBreakpointChange?: (breakpoint: Breakpoint) => void;

  /**
   * Whether global productivity keyboard shortcuts (Cmd+C, Cmd+X, Cmd+V, Cmd+D, Delete, Cmd+Z, etc.)
   * are active. Defaults to true.
   */
  enableKeyboardShortcuts?: boolean;

  /**
   * React children to render within the provider.
   */
  children: ReactNode;
}

/**
 * Context value stored by IRichContext.
 */
export interface IRichContextValue {
  editor: EditorInstance;
}

/**
 * Return type for useIRichSelection().
 */
export interface UseIRichSelectionResult {
  /**
   * The currently selected NodeId, or null if no node is selected.
   */
  selectedNodeId: NodeId | null;

  /**
   * Sets the active selection to the specified node ID, or clears if null.
   */
  selectNode: (nodeId: NodeId | null) => void;

  /**
   * Clears the current node selection.
   */
  clearSelection: () => void;
}

/**
 * Return type for useIRichBreakpoint().
 */
export interface UseIRichBreakpointResult {
  /**
   * The currently active viewport breakpoint in the editor.
   */
  breakpoint: Breakpoint;

  /**
   * Sets the active editor breakpoint.
   */
  setBreakpoint: (breakpoint: Breakpoint) => void;
}

/**
 * Return type for useIRichHistory().
 */
export interface UseIRichHistoryResult {
  /**
   * Whether an undo operation is currently available.
   */
  canUndo: boolean;

  /**
   * Whether a redo operation is currently available.
   */
  canRedo: boolean;

  /**
   * Executes an undo operation.
   */
  undo: () => boolean;

  /**
   * Executes a redo operation.
   */
  redo: () => boolean;

  /**
   * Clears undo/redo transaction history stacks.
   */
  clearHistory: () => void;
}

/**
 * Return type for useIRich().
 */
export interface UseIRichResult
  extends UseIRichSelectionResult,
    UseIRichHistoryResult,
    UseIRichBreakpointResult {
  /**
   * The underlying EditorInstance.
   */
  editor: EditorInstance;

  /**
   * Full current editor state snapshot.
   */
  state: EditorState;

  /**
   * Current document snapshot.
   */
  document: IRichDocument;
}
