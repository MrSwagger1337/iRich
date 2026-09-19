/**
 * @irich/react
 * Reusable Document JSON Studio component and Modal wrapper.
 * Provides complete visual interface for the Copy -> AI -> Paste -> Validate -> Apply -> Undo workflow.
 */

'use client';

import React, { useRef } from 'react';
import { useOptionalIRichContext } from '../context';
import type {
  IRichDocumentJsonModalProps,
  IRichDocumentJsonStudioProps,
  JsonStudioStatus,
} from './types';
import { useIRichJsonStudio } from './use-json-studio';

/**
 * Returns a human-friendly label and color badge class for a studio status.
 */
function getStatusBadge(status: JsonStudioStatus, isDirty: boolean): { label: string; bg: string; color: string } {
  if (status === 'valid') {
    return { label: '✓ Valid & Ready to Apply', bg: 'rgba(16, 185, 129, 0.15)', color: '#34d399' };
  }
  if (status === 'invalid') {
    return { label: '✕ Validation Errors', bg: 'rgba(239, 68, 68, 0.15)', color: '#f87171' };
  }
  if (status === 'applied') {
    return { label: '✓ Document Applied', bg: 'rgba(99, 102, 241, 0.15)', color: '#818cf8' };
  }
  if (status === 'validating') {
    return { label: '⏳ Validating...', bg: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24' };
  }
  if (isDirty) {
    return { label: '✎ Draft Modified', bg: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24' };
  }
  return { label: '● Live Canonical Snapshot', bg: 'rgba(107, 114, 128, 0.15)', color: '#9ca3af' };
}

/**
 * Reusable Document JSON Studio workbench component.
 */
export const IRichDocumentJsonStudio: React.FC<IRichDocumentJsonStudioProps> = ({
  document,
  editor,
  registry,
  uiDirection: propUIDirection,
  className,
  style,
  title = 'Document JSON Studio',
  subtitle = 'Inspect, format, validate, AI-restructure, and atomically apply canonical JSON document state.',
  extraActions,
  onApply,
  onClose,
}) => {
  const context = useOptionalIRichContext();
  const uiDirection = propUIDirection ?? context?.uiDirection ?? 'ltr';

  const studio = useIRichJsonStudio({
    document,
    editor,
    registry,
    onApply,
    onClose,
  });

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      studio.importFile(file);
      // Reset input value so the same file can be selected again
      e.target.value = '';
    }
  };

  const badge = getStatusBadge(studio.status, studio.isDirty);

  return (
    <div
      className={`irich-json-studio ${className ?? ''}`}
      style={style}
      dir={uiDirection}
      data-testid="irich-json-studio"
    >
      {/* 1. STUDIO HEADER */}
      <div className="irich-json-studio-header">
        <div className="irich-json-studio-title-group">
          <div className="irich-json-studio-title-row">
            <h2 id="irich-json-studio-title" className="irich-json-studio-title">
              {title}
            </h2>
            <span
              className="irich-json-studio-status-badge"
              style={{ background: badge.bg, color: badge.color }}
              data-testid="irich-json-studio-status"
            >
              {badge.label}
            </span>
          </div>
          {subtitle && <p className="irich-json-studio-subtitle">{subtitle}</p>}
        </div>

        {onClose && (
          <button
            type="button"
            onClick={studio.requestClose}
            className="irich-btn irich-btn-ghost irich-btn-sm irich-json-studio-close-btn"
            title="Close Document JSON Studio"
            aria-label="Close JSON Studio"
          >
            ✕
          </button>
        )}
      </div>

      {/* 2. TRANSIENT FEEDBACK ALERT */}
      {studio.feedbackMessage && (
        <div
          className="irich-json-studio-feedback-bar"
          role="status"
          aria-live="polite"
          data-testid="irich-json-studio-feedback"
        >
          <span>{studio.feedbackMessage}</span>
        </div>
      )}

      {/* 3. TOOLBAR ACTIONS */}
      <div className="irich-json-studio-toolbar" role="toolbar" aria-label="JSON Studio Actions">
        <div className="irich-json-studio-toolbar-group">
          <button
            type="button"
            onClick={studio.copyJson}
            className="irich-btn irich-btn-secondary irich-btn-sm"
            title="Copy current draft JSON payload to clipboard"
          >
            📋 Copy JSON
          </button>

          <button
            type="button"
            onClick={studio.copyAiContext}
            className="irich-btn irich-btn-secondary irich-btn-sm"
            title="Copy structured AI prompt with component schemas and document JSON"
          >
            ✨ Copy AI Context
          </button>

          <button
            type="button"
            onClick={studio.format}
            className="irich-btn irich-btn-ghost irich-btn-sm"
            title="Reformat draft JSON syntax with standard 2-space indentation"
          >
            ⚡ Format
          </button>

          <button
            type="button"
            onClick={studio.validate}
            className="irich-btn irich-btn-secondary irich-btn-sm"
            title="Validate draft JSON against iRich invariants and component schemas"
          >
            🔍 Validate
          </button>
        </div>

        <div className="irich-json-studio-toolbar-group">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="irich-btn irich-btn-ghost irich-btn-sm"
            title="Load local .json or .irich.json file into draft without applying"
          >
            📁 Load File
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json,.irich.json"
            onChange={handleFileInputChange}
            style={{ display: 'none' }}
            aria-label="Upload JSON file"
            data-testid="irich-json-file-input"
          />

          <button
            type="button"
            onClick={studio.exportFile}
            className="irich-btn irich-btn-ghost irich-btn-sm"
            title="Download live canonical document as UTF-8 .irich.json"
          >
            💾 Download JSON
          </button>

          <button
            type="button"
            onClick={studio.resetDraft}
            disabled={!studio.isDirty && studio.status !== 'invalid'}
            className="irich-btn irich-btn-ghost irich-btn-sm"
            title="Reset draft JSON to live canonical document snapshot"
          >
            ↺ Reset Draft
          </button>

          <button
            type="button"
            onClick={studio.apply}
            disabled={studio.status !== 'valid' || !studio.validatedDocument}
            className="irich-btn irich-btn-primary irich-btn-sm irich-json-studio-apply-btn"
            title="Atomically apply validated JSON to live document (supports 1-step undo)"
            data-testid="irich-json-apply-btn"
          >
            ✓ Apply Document
          </button>

          {extraActions}
        </div>
      </div>

      {/* 4. MAIN EDITING SURFACE (Always LTR code orientation) */}
      <div className="irich-json-studio-editor-container">
        <label htmlFor="irich-json-studio-textarea" className="irich-sr-only">
          Canonical Document JSON Editor
        </label>
        <textarea
          id="irich-json-studio-textarea"
          dir="ltr"
          spellCheck={false}
          autoCapitalize="none"
          autoCorrect="off"
          value={studio.draftText}
          onChange={(e) => studio.setDraftText(e.target.value)}
          className="irich-json-studio-textarea"
          data-testid="irich-json-textarea"
          placeholder="Paste or edit canonical iRich JSON here..."
          aria-invalid={studio.status === 'invalid'}
        />
      </div>

      {/* 5. STRUCTURED DIAGNOSTICS PANEL */}
      {studio.validationResult && !studio.validationResult.valid && (
        <div
          className="irich-json-studio-diagnostics"
          role="region"
          aria-label="Validation Errors"
          data-testid="irich-json-diagnostics"
        >
          <div className="irich-json-diagnostics-header">
            <div className="irich-json-diagnostics-title-row">
              <span className="irich-json-diagnostics-icon">⚠️</span>
              <strong className="irich-json-diagnostics-title">
                Document Validation Failed ({studio.validationResult.details.length} issue
                {studio.validationResult.details.length > 1 ? 's' : ''})
              </strong>
            </div>
            <button
              type="button"
              onClick={studio.copyErrors}
              className="irich-btn irich-btn-secondary irich-btn-sm"
              title="Copy formatted diagnostic error text for external AI prompts"
            >
              📋 Copy Errors
            </button>
          </div>

          <div className="irich-json-diagnostics-list">
            {studio.validationResult.details.map((detail, idx) => (
              <div key={idx} className="irich-json-diagnostic-card">
                <div className="irich-json-diagnostic-top">
                  <span className="irich-json-diagnostic-code">{detail.code}</span>
                  <span className="irich-json-diagnostic-path">Path: <code>{detail.path || '$'}</code></span>
                  {detail.nodeId && (
                    <span className="irich-json-diagnostic-meta">Node: <code>{detail.nodeId}</code></span>
                  )}
                  {detail.nodeType && (
                    <span className="irich-json-diagnostic-meta">Type: <code>{detail.nodeType}</code></span>
                  )}
                  {detail.propName && (
                    <span className="irich-json-diagnostic-meta">Property: <code>{detail.propName}</code></span>
                  )}
                </div>
                <div className="irich-json-diagnostic-message">{detail.message}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 6. VALIDATION SUCCESS BANNER */}
      {studio.status === 'valid' && (
        <div className="irich-json-studio-success-banner" data-testid="irich-json-valid-banner">
          <span>✓ Document passed all schema and structural checks. Click <strong>Apply Document</strong> to update the live editor.</span>
        </div>
      )}

      {/* 7. DISCARD CONFIRMATION DIALOG */}
      {studio.isConfirmingDiscard && (
        <div
          className="irich-modal-overlay irich-json-discard-modal"
          role="dialog"
          aria-modal="true"
          aria-labelledby="irich-discard-title"
        >
          <div className="irich-modal-card irich-discard-card" onClick={(e) => e.stopPropagation()}>
            <h3 id="irich-discard-title" className="irich-modal-title">
              Discard Unapplied Changes?
            </h3>
            <p className="irich-modal-subtitle">
              You have modified the JSON draft without applying it to the document. Closing will discard your unapplied edits.
            </p>
            <div className="irich-modal-footer">
              <button
                type="button"
                onClick={studio.cancelDiscard}
                className="irich-btn irich-btn-secondary irich-btn-md"
              >
                Keep Editing
              </button>
              <button
                type="button"
                onClick={studio.confirmDiscardAndClose}
                className="irich-btn irich-btn-danger irich-btn-md"
                data-testid="irich-confirm-discard-btn"
              >
                Discard & Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * Modal dialog wrapper for Document JSON Studio.
 */
export const IRichDocumentJsonModal: React.FC<IRichDocumentJsonModalProps> = ({
  isOpen = true,
  onClose,
  ...studioProps
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="irich-modal-overlay irich-json-studio-modal-overlay"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="irich-json-studio-title"
    >
      <div
        className="irich-modal-card irich-json-studio-modal-card"
        onClick={(e) => e.stopPropagation()}
      >
        <IRichDocumentJsonStudio {...studioProps} onClose={onClose} />
      </div>
    </div>
  );
};
