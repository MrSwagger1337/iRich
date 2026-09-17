/**
 * @irich/core
 * Field type definitions, prop schemas, and extensible validation for component fields.
 */

import type { JSONValue } from '../types';

/**
 * Supported built-in field type names, open to custom string extension.
 */
export type BuiltInFieldType = 'text' | 'textarea' | 'number' | 'boolean' | 'select' | 'color';

export type FieldType = BuiltInFieldType | (string & {});

/**
 * Base configuration common to all component field schemas.
 */
export interface BaseFieldDefinition {
  readonly type: FieldType;
  readonly label?: string;
  readonly description?: string;
  readonly placeholder?: string;
  readonly defaultValue?: JSONValue;
  readonly hidden?: boolean;
  readonly readOnly?: boolean;
}

/**
 * Single-line text input field.
 */
export interface TextFieldDefinition extends BaseFieldDefinition {
  readonly type: 'text';
  readonly defaultValue?: string;
  readonly placeholder?: string;
  readonly minLength?: number;
  readonly maxLength?: number;
  readonly pattern?: string;
}

/**
 * Multi-line textarea input field.
 */
export interface TextareaFieldDefinition extends BaseFieldDefinition {
  readonly type: 'textarea';
  readonly defaultValue?: string;
  readonly placeholder?: string;
  readonly rows?: number;
  readonly minLength?: number;
  readonly maxLength?: number;
}

/**
 * Numeric input field with optional min, max, and step boundaries.
 */
export interface NumberFieldDefinition extends BaseFieldDefinition {
  readonly type: 'number';
  readonly defaultValue?: number;
  readonly min?: number;
  readonly max?: number;
  readonly step?: number;
  readonly unit?: string;
}

/**
 * Boolean checkbox / toggle switch field.
 */
export interface BooleanFieldDefinition extends BaseFieldDefinition {
  readonly type: 'boolean';
  readonly defaultValue?: boolean;
}

/**
 * Select option choice.
 */
export interface SelectOption {
  readonly label: string;
  readonly value: string | number | boolean;
}

/**
 * Select dropdown field.
 */
export interface SelectFieldDefinition extends BaseFieldDefinition {
  readonly type: 'select';
  readonly options: readonly SelectOption[] | SelectOption[];
  readonly defaultValue?: string | number | boolean;
}

/**
 * Color picker field.
 */
export interface ColorFieldDefinition extends BaseFieldDefinition {
  readonly type: 'color';
  readonly defaultValue?: string;
  readonly presetColors?: readonly string[] | string[];
}

/**
 * Generic custom field definition for third-party plugin extensions.
 */
export interface CustomFieldDefinition extends BaseFieldDefinition {
  readonly type: string;
  readonly [key: string]: unknown;
}

/**
 * Discriminated union of all supported field definitions.
 */
export type FieldDefinition =
  | TextFieldDefinition
  | TextareaFieldDefinition
  | NumberFieldDefinition
  | BooleanFieldDefinition
  | SelectFieldDefinition
  | ColorFieldDefinition
  | CustomFieldDefinition;

/**
 * Validation result for an individual field value.
 */
export interface FieldValidationResult {
  readonly valid: boolean;
  readonly error?: string;
}

/**
 * Extension descriptor for registering a custom field type with custom validation/defaults.
 */
export interface FieldTypeDefinition<T = JSONValue> {
  /**
   * Unique name of the field type (e.g. 'text', 'color', 'date-picker', 'icon-select').
   */
  readonly type: string;

  /**
   * Validates whether a given runtime value matches the field's schema constraints.
   */
  validate?(value: unknown, field: FieldDefinition): FieldValidationResult;

  /**
   * Computes the default value for this field type if one is not explicitly configured.
   */
  getDefaultValue?(field: FieldDefinition): T | undefined;

  /**
   * Sanitizes or coerces input values before storing into document state.
   */
  sanitize?(value: unknown, field: FieldDefinition): T | undefined;
}

/**
 * Built-in standard field type definitions.
 */
export const BUILT_IN_FIELD_TYPES: Record<BuiltInFieldType, FieldTypeDefinition> = {
  text: {
    type: 'text',
    validate(value: unknown, field: FieldDefinition): FieldValidationResult {
      if (value === undefined || value === null) {
        return { valid: true };
      }
      if (typeof value !== 'string') {
        return { valid: false, error: `Expected a string, got ${typeof value}` };
      }
      const tf = field as TextFieldDefinition;
      if (tf.minLength !== undefined && value.length < tf.minLength) {
        return { valid: false, error: `Minimum length is ${tf.minLength} (got ${value.length})` };
      }
      if (tf.maxLength !== undefined && value.length > tf.maxLength) {
        return { valid: false, error: `Maximum length is ${tf.maxLength} (got ${value.length})` };
      }
      if (tf.pattern && !new RegExp(tf.pattern).test(value)) {
        return { valid: false, error: `Value does not match required pattern "${tf.pattern}"` };
      }
      return { valid: true };
    },
    getDefaultValue(field: FieldDefinition): JSONValue {
      return (field as TextFieldDefinition).defaultValue ?? '';
    },
  },

  textarea: {
    type: 'textarea',
    validate(value: unknown, field: FieldDefinition): FieldValidationResult {
      if (value === undefined || value === null) {
        return { valid: true };
      }
      if (typeof value !== 'string') {
        return { valid: false, error: `Expected a string, got ${typeof value}` };
      }
      const tf = field as TextareaFieldDefinition;
      if (tf.minLength !== undefined && value.length < tf.minLength) {
        return { valid: false, error: `Minimum length is ${tf.minLength} (got ${value.length})` };
      }
      if (tf.maxLength !== undefined && value.length > tf.maxLength) {
        return { valid: false, error: `Maximum length is ${tf.maxLength} (got ${value.length})` };
      }
      return { valid: true };
    },
    getDefaultValue(field: FieldDefinition): JSONValue {
      return (field as TextareaFieldDefinition).defaultValue ?? '';
    },
  },

  number: {
    type: 'number',
    validate(value: unknown, field: FieldDefinition): FieldValidationResult {
      if (value === undefined || value === null) {
        return { valid: true };
      }
      if (typeof value !== 'number' || Number.isNaN(value)) {
        return { valid: false, error: `Expected a number, got ${typeof value}` };
      }
      const nf = field as NumberFieldDefinition;
      if (nf.min !== undefined && value < nf.min) {
        return { valid: false, error: `Value must be at least ${nf.min} (got ${value})` };
      }
      if (nf.max !== undefined && value > nf.max) {
        return { valid: false, error: `Value must be at most ${nf.max} (got ${value})` };
      }
      return { valid: true };
    },
    getDefaultValue(field: FieldDefinition): JSONValue {
      return (field as NumberFieldDefinition).defaultValue ?? 0;
    },
  },

  boolean: {
    type: 'boolean',
    validate(value: unknown): FieldValidationResult {
      if (value === undefined || value === null) {
        return { valid: true };
      }
      if (typeof value !== 'boolean') {
        return { valid: false, error: `Expected a boolean, got ${typeof value}` };
      }
      return { valid: true };
    },
    getDefaultValue(field: FieldDefinition): JSONValue {
      return (field as BooleanFieldDefinition).defaultValue ?? false;
    },
  },

  select: {
    type: 'select',
    validate(value: unknown, field: FieldDefinition): FieldValidationResult {
      if (value === undefined || value === null) {
        return { valid: true };
      }
      const sf = field as SelectFieldDefinition;
      const validOptions = (sf.options ?? []).map((opt) => opt.value);
      if (validOptions.length > 0 && !validOptions.includes(value as string | number | boolean)) {
        return {
          valid: false,
          error: `Value "${String(value)}" is not a valid option. Allowed: ${validOptions.map(String).join(', ')}`,
        };
      }
      return { valid: true };
    },
    getDefaultValue(field: FieldDefinition): JSONValue {
      const sf = field as SelectFieldDefinition;
      if (sf.defaultValue !== undefined) {
        return sf.defaultValue;
      }
      if (sf.options && sf.options.length > 0) {
        return sf.options[0].value;
      }
      return '';
    },
  },

  color: {
    type: 'color',
    validate(value: unknown): FieldValidationResult {
      if (value === undefined || value === null) {
        return { valid: true };
      }
      if (typeof value !== 'string') {
        return { valid: false, error: `Expected a string for color, got ${typeof value}` };
      }
      return { valid: true };
    },
    getDefaultValue(field: FieldDefinition): JSONValue {
      return (field as ColorFieldDefinition).defaultValue ?? '#000000';
    },
  },
};
