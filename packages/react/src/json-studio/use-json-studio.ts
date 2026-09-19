/**
 * @irich/react
 * Headless state machine and business logic hook for Document JSON Studio.
 * Handles draft editing, formatting, validation, atomic application, clipboard, and import/export.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  formatDocumentJSON,
  generateDocumentAIContext,
  parseDocumentJSON,
  validateDocumentJSON,
  type IRichDocument,
  type ValidationResult,
} from '@irich/core';
import { useOptionalIRichContext } from '../context';
import type {
  UseIRichJsonStudioOptions,
  UseIRichJsonStudioResult,
  JsonStudioStatus,
} from './types';

/**
 * Sanitizes a title string for use as a safe, cross-platform file name.
 */
function sanitizeFilename(title: string): string {
  const sanitized = title
    .toLowerCase()
    .trim()
    .replace(/[<>:"/\\|?*]/g, '')
    .split('')
    .filter((char) => char.charCodeAt(0) >= 32)
    .join('')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
  return sanitized.length > 0 ? sanitized : 'document';
}

/**
 * Headless hook managing all state and actions for the Document JSON Studio.
 */
export function useIRichJsonStudio(
  options: UseIRichJsonStudioOptions = {},
): UseIRichJsonStudioResult {
  const context = useOptionalIRichContext();
  const editor = options.editor !== undefined ? options.editor : context?.editor ?? null;

  // Resolve initial canonical document snapshot
  const initialDoc = useMemo(() => {
    if (options.document) return options.document;
    if (editor) return editor.getDocument();
    return {
      version: '1.0.0',
      root: { id: 'root', type: 'root', props: {}, children: [] },
    } as IRichDocument;
  }, [options.document, editor]);

  // Live canonical document snapshot in editor
  const [liveSnapshot, setLiveSnapshot] = useState<IRichDocument>(initialDoc);

  // Synchronize live snapshot if editor document changes externally
  useEffect(() => {
    if (!editor) {
      if (options.document) setLiveSnapshot(options.document);
      return;
    }

    const unsubscribe = editor.on('document:change', () => {
      setLiveSnapshot(editor.getDocument());
    });

    return () => {
      unsubscribe();
    };
  }, [editor, options.document]);

  // Derive canonical formatted text for comparison
  const canonicalFormatted = useMemo(() => {
    return formatDocumentJSON(liveSnapshot, { indent: 2 });
  }, [liveSnapshot]);

  // Draft state
  const [draftText, setDraftTextState] = useState<string>(canonicalFormatted);
  const [status, setStatus] = useState<JsonStudioStatus>('idle');
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [validatedDocument, setValidatedDocument] = useState<IRichDocument | null>(null);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const [isConfirmingDiscard, setIsConfirmingDiscard] = useState<boolean>(false);

  // Timer ref for transient feedback messages
  const feedbackTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showFeedback = useCallback((msg: string, durationMs = 3000) => {
    if (feedbackTimerRef.current) {
      clearTimeout(feedbackTimerRef.current);
    }
    setFeedbackMessage(msg);
    feedbackTimerRef.current = setTimeout(() => {
      setFeedbackMessage(null);
    }, durationMs);
  }, []);

  useEffect(() => {
    return () => {
      if (feedbackTimerRef.current) {
        clearTimeout(feedbackTimerRef.current);
      }
    };
  }, []);

  // Update draft text and invalidate previous validation
  const setDraftText = useCallback(
    (nextText: string) => {
      setDraftTextState(nextText);
      // Invalidate any previously cached validation result
      setValidatedDocument(null);
      setValidationResult(null);

      if (nextText === canonicalFormatted) {
        setStatus('idle');
      } else {
        setStatus('dirty');
      }
    },
    [canonicalFormatted],
  );

  // Calculate true dirty state
  const isDirty = useMemo(() => {
    return draftText.trim() !== canonicalFormatted.trim();
  }, [draftText, canonicalFormatted]);

  // Active ComponentRegistry
  const registry = useMemo(() => {
    if (options.registry) return options.registry;
    if (editor && typeof editor.getRegistry === 'function') return editor.getRegistry();
    return undefined;
  }, [options.registry, editor]);

  // 1. FORMAT
  const format = useCallback((): boolean => {
    const parsed = parseDocumentJSON(draftText);
    if (!parsed.success) {
      setValidationResult({
        valid: false,
        errors: [`[${parsed.error.path}] ${parsed.error.message}`],
        details: [parsed.error],
      });
      setStatus('invalid');
      showFeedback('JSON Syntax Error — Draft not reformatted');
      return false;
    }

    const formatted = JSON.stringify(parsed.data, null, 2);
    setDraftTextState(formatted);
    // Invalidate cached document object because text changed, but don't mark as document valid
    setValidatedDocument(null);
    setValidationResult(null);

    if (formatted === canonicalFormatted) {
      setStatus('idle');
    } else {
      setStatus('dirty');
    }

    showFeedback('✓ JSON Formatted');
    return true;
  }, [draftText, canonicalFormatted, showFeedback]);

  // 2. VALIDATE
  const validate = useCallback((): boolean => {
    setStatus('validating');
    const result = validateDocumentJSON(draftText, { registry });

    if (result.valid) {
      const parsed = parseDocumentJSON<IRichDocument>(draftText);
      if (parsed.success) {
        setValidatedDocument(parsed.data);
        setValidationResult(result);
        setStatus('valid');
        showFeedback('✓ Document Valid — Ready to Apply');
        return true;
      }
    }

    setValidatedDocument(null);
    setValidationResult(result);
    setStatus('invalid');
    showFeedback(`Validation Failed (${result.errors.length} errors found)`);
    return false;
  }, [draftText, registry, showFeedback]);

  // 3. APPLY
  const apply = useCallback((): boolean => {
    if (status !== 'valid' || !validatedDocument) {
      showFeedback('Cannot apply: validate current draft first');
      return false;
    }

    try {
      if (editor) {
        editor.commands.replaceDocument(validatedDocument);
      }
      if (options.onApply) {
        options.onApply(validatedDocument);
      }

      setLiveSnapshot(validatedDocument);
      const appliedFormatted = formatDocumentJSON(validatedDocument, { indent: 2 });
      setDraftTextState(appliedFormatted);
      setValidatedDocument(null);
      setValidationResult(null);
      setStatus('applied');
      showFeedback('✓ Document Applied to Canvas');
      return true;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      showFeedback(`Failed to apply document: ${msg}`);
      return false;
    }
  }, [status, validatedDocument, editor, options, showFeedback]);

  // 4. RESET DRAFT
  const resetDraft = useCallback(() => {
    setDraftTextState(canonicalFormatted);
    setValidatedDocument(null);
    setValidationResult(null);
    setStatus('idle');
    showFeedback('Draft Reset to Live Document');
  }, [canonicalFormatted, showFeedback]);

  // 5. COPY DRAFT JSON
  const copyJson = useCallback(async (): Promise<boolean> => {
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText(draftText);
        showFeedback('✓ Copied Draft JSON');
        return true;
      }
      showFeedback('Clipboard API not available');
      return false;
    } catch {
      showFeedback('Failed to copy JSON to clipboard');
      return false;
    }
  }, [draftText, showFeedback]);

  // 6. COPY AI CONTEXT
  const copyAiContext = useCallback(async (): Promise<boolean> => {
    try {
      const prompt = generateDocumentAIContext(liveSnapshot, { registry });
      if (typeof navigator !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText(prompt);
        showFeedback('✓ Copied AI Context Prompt');
        return true;
      }
      showFeedback('Clipboard API not available');
      return false;
    } catch {
      showFeedback('Failed to copy AI Context');
      return false;
    }
  }, [liveSnapshot, registry, showFeedback]);

  // 7. COPY ERRORS
  const copyErrors = useCallback(async (): Promise<boolean> => {
    if (!validationResult || validationResult.details.length === 0) {
      showFeedback('No validation errors to copy');
      return false;
    }

    const lines: string[] = [
      `iRich Document Validation Failed (${validationResult.details.length} issue${validationResult.details.length > 1 ? 's' : ''} found):`,
      '',
    ];

    validationResult.details.forEach((d, idx) => {
      lines.push(`${idx + 1}. [${d.code}] at ${d.path || '$'}`);
      if (d.nodeId) lines.push(`   Node ID: ${d.nodeId}`);
      if (d.nodeType) lines.push(`   Node Type: ${d.nodeType}`);
      if (d.propName) lines.push(`   Property: ${d.propName}`);
      lines.push(`   Message: ${d.message}`);
      lines.push('');
    });

    lines.push('Please correct the document structure and return strictly valid iRich JSON only.');

    const errorText = lines.join('\n');

    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText(errorText);
        showFeedback('✓ Copied Error Diagnostics');
        return true;
      }
      showFeedback('Clipboard API not available');
      return false;
    } catch {
      showFeedback('Failed to copy errors');
      return false;
    }
  }, [validationResult, showFeedback]);

  // 8. IMPORT LOCAL JSON FILE
  const importFile = useCallback(
    async (file: File): Promise<boolean> => {
      return new Promise<boolean>((resolve) => {
        const reader = new FileReader();

        reader.onload = (e) => {
          const content = e.target?.result;
          if (typeof content === 'string') {
            setDraftTextState(content);
            setValidatedDocument(null);
            setValidationResult(null);
            setStatus('dirty');
            showFeedback(`Loaded "${file.name}" into draft (Validate before applying)`);
            resolve(true);
          } else {
            showFeedback(`Failed to read "${file.name}" as text.`);
            resolve(false);
          }
        };

        reader.onerror = () => {
          showFeedback(`Error reading file "${file.name}".`);
          resolve(false);
        };

        reader.readAsText(file, 'UTF-8');
      });
    },
    [showFeedback],
  );

  // 9. EXPORT (DOWNLOAD) LIVE CANONICAL DOCUMENT
  const exportFile = useCallback(() => {
    try {
      const docTitle = liveSnapshot.metadata?.title;
      const baseName = typeof docTitle === 'string' && docTitle.trim() ? sanitizeFilename(docTitle) : 'document';
      const fileName = `${baseName}.irich.json`;

      const jsonStr = formatDocumentJSON(liveSnapshot, { indent: 2 });
      const blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8' });

      if (typeof window !== 'undefined' && typeof document !== 'undefined') {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        showFeedback(`✓ Exported "${fileName}"`);
      }
    } catch {
      showFeedback('Failed to export document file');
    }
  }, [liveSnapshot, showFeedback]);

  // 10. CLOSE REQUEST & CONFIRMATION
  const requestClose = useCallback(() => {
    if (isDirty) {
      setIsConfirmingDiscard(true);
    } else {
      options.onClose?.();
    }
  }, [isDirty, options]);

  const confirmDiscardAndClose = useCallback(() => {
    setIsConfirmingDiscard(false);
    options.onClose?.();
  }, [options]);

  const cancelDiscard = useCallback(() => {
    setIsConfirmingDiscard(false);
  }, []);

  return {
    draftText,
    setDraftText,
    status,
    isDirty,
    validationResult,
    validatedDocument,
    feedbackMessage,
    format,
    validate,
    apply,
    resetDraft,
    copyJson,
    copyAiContext,
    copyErrors,
    importFile,
    exportFile,
    requestClose,
    isConfirmingDiscard,
    confirmDiscardAndClose,
    cancelDiscard,
  };
}
