  /**
 * @irich/core
 * Headless JSON parsing, validation, and deterministic formatting utilities.
 * Zero browser or UI dependencies.
 */

import type { IRichDocument } from './types';
import {
  validateDocument,
  type ValidateDocumentOptions,
  type ValidationErrorDetail,
  type ValidationResult,
} from './utils/validation';

/**
 * Result of parsing a raw JSON document string.
 */
export type ParseJSONResult<T = unknown> =
  | { readonly success: true; readonly data: T }
  | { readonly success: false; readonly error: ValidationErrorDetail };

/**
 * Parses a raw JSON string safely, wrapping syntax errors in structured diagnostics.
 *
 * @param jsonString - Raw JSON string to parse.
 * @returns ParseJSONResult with parsed data or structured error diagnostic.
 */
export function parseDocumentJSON<T = unknown>(jsonString: string): ParseJSONResult<T> {
  if (typeof jsonString !== 'string') {
    return {
      success: false,
      error: {
        code: 'INVALID_JSON',
        path: '$',
        message: `Expected JSON string input, received ${typeof jsonString}.`,
      },
    };
  }

  const trimmed = jsonString.trim();
  if (trimmed === '') {
    return {
      success: false,
      error: {
        code: 'INVALID_JSON',
        path: '$',
        message: 'Cannot parse empty JSON string.',
      },
    };
  }

  try {
    const data = JSON.parse(trimmed) as T;
    return {
      success: true,
      data,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return {
      success: false,
      error: {
        code: 'INVALID_JSON',
        path: '$',
        message: `JSON syntax error: ${message}`,
      },
    };
  }
}

/**
 * Validates a document from either a raw JSON string or an in-memory object.
 *
 * 1. If string is provided, parses JSON safely.
 * 2. Runs structural invariant checks (root, unique IDs, cycle detection).
 * 3. Validates document version, metadata, and direction enums.
 * 4. Filters out forbidden prototype-pollution keys.
 * 5. If ComponentRegistry is supplied, validates component types, prop schemas, and placement rules.
 *
 * @param input - Raw JSON string or in-memory document candidate.
 * @param options - Optional validation options (e.g. ComponentRegistry).
 * @returns Comprehensive ValidationResult with structured diagnostics.
 */
export function validateDocumentJSON(
  input: unknown,
  options: ValidateDocumentOptions = {},
): ValidationResult {
  if (typeof input === 'string') {
    const parsed = parseDocumentJSON(input);
    if (!parsed.success) {
      return {
        valid: false,
        errors: Object.freeze([`[${parsed.error.path}] ${parsed.error.message}`]),
        details: Object.freeze([parsed.error]),
      };
    }
    return validateDocument(parsed.data, options);
  }

  return validateDocument(input, options);
}

export interface FormatDocumentOptions {
  /**
   * Number of space characters for indentation (default: 2). Set to 0 or null for minified JSON.
   */
  readonly indent?: number;
}

/**
 * Formats an IRichDocument into a deterministic, human-readable JSON string suitable
 * for copy-pasting, AI processing, and persistence.
 *
 * @param document - Canonical iRich document.
 * @param options - Formatting options (e.g. indentation).
 * @returns Standardized JSON string representation.
 */
export function formatDocumentJSON(
  document: IRichDocument,
  options: FormatDocumentOptions = {},
): string {
  const indent = options.indent !== undefined ? options.indent : 2;
  return JSON.stringify(document, null, indent);
}
