/**
 * @irich/react
 * Types and interfaces for the Document JSON Studio subsystem.
 */

import type { CSSProperties, ReactNode } from 'react';
import type {
  ComponentRegistry,
  EditorInstance,
  IRichDocument,
  ValidationResult,
} from '@irich/core';
import type { IRichUIDirection } from '../types';


/**
 * State lifecycle status of the Document JSON Studio.
 */
export type JsonStudioStatus =
  | 'idle'
  | 'dirty'
  | 'validating'
  | 'valid'
  | 'invalid'
  | 'applied';

/**
 * Options for configuring the headless `useIRichJsonStudio` hook.
 */
export interface UseIRichJsonStudioOptions {
  /**
   * Initial or active canonical document. Defaults to document from IRichContext if available.
   */
  document?: IRichDocument;

  /**
   * Active editor instance. Defaults to editor from IRichContext if available.
   */
  editor?: EditorInstance | null;

  /**
   * Component registry for schema validation. Defaults to editor.getRegistry() if available.
   */
  registry?: ComponentRegistry;

  /**
   * Callback fired when a validated document is successfully applied.
   */
  onApply?: (document: IRichDocument) => void;

  /**
   * Callback fired when closing the studio is requested.
   */
  onClose?: () => void;
}

/**
 * Return value of the headless `useIRichJsonStudio` hook.
 */
export interface UseIRichJsonStudioResult {
  /**
   * Current editable draft JSON string in the textarea.
   */
  draftText: string;

  /**
   * Sets the draft JSON text directly (e.g. on textarea change).
   */
  setDraftText: (text: string) => void;

  /**
   * State lifecycle status.
   */
  status: JsonStudioStatus;

  /**
   * Whether the draft text diverges meaningfully from the live canonical document snapshot.
   */
  isDirty: boolean;

  /**
   * Detailed validation result, populated on validate().
   */
  validationResult: ValidationResult | null;

  /**
   * Parsed and validated IRichDocument, only present when status is 'valid'.
   */
  validatedDocument: IRichDocument | null;

  /**
   * Feedback message for transient actions (e.g. "✓ Copied Draft JSON", "Error reading file").
   */
  feedbackMessage: string | null;

  /**
   * Formats syntactically valid JSON in the draft without validating document semantics.
   */
  format: () => boolean;

  /**
   * Runs complete core validation against invariants, schemas, and placement rules.
   */
  validate: () => boolean;

  /**
   * Atomically applies the validated document via editor.commands.replaceDocument().
   */
  apply: () => boolean;

  /**
   * Resets the draft JSON back to the live canonical document snapshot.
   */
  resetDraft: () => void;

  /**
   * Copies current draft JSON to the clipboard.
   */
  copyJson: () => Promise<boolean>;

  /**
   * Generates and copies full AI Context prompt with registered component schemas to clipboard.
   */
  copyAiContext: () => Promise<boolean>;

  /**
   * Formats structured validation diagnostics into plain text and copies to clipboard.
   */
  copyErrors: () => Promise<boolean>;

  /**
   * Imports a local JSON file into the draft without auto-applying.
   */
  importFile: (file: File) => Promise<boolean>;

  /**
   * Downloads the live canonical document as a UTF-8 `.irich.json` file.
   */
  exportFile: () => void;

  /**
   * Requests closing the studio with dirty-draft protection.
   */
  requestClose: () => void;

  /**
   * Whether the dirty-draft discard confirmation modal/banner is active.
   */
  isConfirmingDiscard: boolean;

  /**
   * Confirms discarding unapplied draft changes and closes.
   */
  confirmDiscardAndClose: () => void;

  /**
   * Cancels discarding unapplied draft changes to keep editing.
   */
  cancelDiscard: () => void;
}

/**
 * Props for the root `<IRichDocumentJsonStudio />` component.
 */
export interface IRichDocumentJsonStudioProps extends UseIRichJsonStudioOptions {
  /**
   * Optional UI direction override. Defaults to UI direction from IRichContext or 'ltr'.
   */
  uiDirection?: IRichUIDirection;

  /**
   * Optional CSS class name applied to the studio root container.
   */
  className?: string;

  /**
   * Optional inline style applied to the studio root container.
   */
  style?: CSSProperties;

  /**
   * Custom header title.
   */
  title?: string;

  /**
   * Custom header subtitle or description.
   */
  subtitle?: string;

  /**
   * Custom additional toolbar action buttons.
   */
  extraActions?: ReactNode;
}

/**
 * Props for the modal dialog wrapper `<IRichDocumentJsonModal />`.
 */
export interface IRichDocumentJsonModalProps extends IRichDocumentJsonStudioProps {
  /**
   * Whether the modal is visible. Defaults to true.
   */
  isOpen?: boolean;

  /**
   * Required close callback for the modal dialog.
   */
  onClose: () => void;
}
