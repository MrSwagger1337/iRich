/**
 * @irich/core
 * Component registry providing registration, lookup, prop default computation,
 * and extensible field type validation.
 */

import { DuplicateComponentError, InvalidComponentError } from '../errors';
import type { JSONValue } from '../types';
import { defineComponent, type ComponentDefinition } from './definition';
import {
  BUILT_IN_FIELD_TYPES,
  type FieldTypeDefinition,
  type FieldValidationResult,
} from './fields';

/**
 * Options for registering a component.
 */
export interface RegisterComponentOptions {
  /**
   * If true, allows replacing an already registered component of the same type without throwing an error.
   * Default: false.
   */
  allowOverride?: boolean;
}

/**
 * Options for initializing a component registry instance.
 */
export interface ComponentRegistryOptions {
  /**
   * Initial list of component definitions to register.
   */
  components?: readonly ComponentDefinition[];

  /**
   * Initial list of custom field type handlers to register.
   */
  fieldTypes?: readonly FieldTypeDefinition[];
}

/**
 * Result of validating a component props payload against its registered schema.
 */
export interface PropValidationResult {
  readonly valid: boolean;
  readonly errors: readonly string[];
}

/**
 * Public component registry interface.
 */
export interface ComponentRegistry {
  /**
   * Registers a new component definition.
   * Throws `DuplicateComponentError` if a component with the same type exists and `allowOverride` is false.
   */
  register<Props extends Record<string, JSONValue> = Record<string, JSONValue>>(
    component: ComponentDefinition<Props>,
    options?: RegisterComponentOptions,
  ): void;

  /**
   * Unregisters a component by type.
   * Returns true if the component was found and removed, false otherwise.
   */
  unregister(type: string): boolean;

  /**
   * Retrieves a component definition by type, or undefined if not registered.
   */
  get<Props extends Record<string, JSONValue> = Record<string, JSONValue>>(
    type: string,
  ): ComponentDefinition<Props> | undefined;

  /**
   * Checks whether a component type is registered.
   */
  has(type: string): boolean;

  /**
   * Returns an array of all registered component definitions.
   */
  getAll(): readonly ComponentDefinition[];

  /**
   * Clears all registered component definitions.
   */
  clear(): void;

  /**
   * Computes the complete default props object for a component type by merging
   * field default values and component defaultProps.
   */
  getDefaultProps(type: string): Record<string, JSONValue>;

  /**
   * Validates a props dictionary against the schema fields of a registered component.
   */
  validateProps(type: string, props: Record<string, unknown>): PropValidationResult;

  /**
   * Registers a custom field type definition with custom validation/defaults.
   */
  registerFieldType(fieldType: FieldTypeDefinition): void;

  /**
   * Retrieves a field type definition by name.
   */
  getFieldType(type: string): FieldTypeDefinition | undefined;

  /**
   * Returns all registered field type definitions.
   */
  getAllFieldTypes(): readonly FieldTypeDefinition[];
}

class ComponentRegistryImpl implements ComponentRegistry {
  private components = new Map<string, ComponentDefinition>();
  private fieldTypes = new Map<string, FieldTypeDefinition>();

  constructor(options: ComponentRegistryOptions = {}) {
    // Register standard built-in field types
    for (const handler of Object.values(BUILT_IN_FIELD_TYPES)) {
      this.fieldTypes.set(handler.type, handler);
    }

    // Register initial custom field types
    if (options.fieldTypes) {
      for (const ft of options.fieldTypes) {
        this.registerFieldType(ft);
      }
    }

    // Register initial components
    if (options.components) {
      for (const comp of options.components) {
        this.register(comp);
      }
    }
  }

  public register<Props extends Record<string, JSONValue> = Record<string, JSONValue>>(
    component: ComponentDefinition<Props>,
    options: RegisterComponentOptions = {},
  ): void {
    if (!component || typeof component !== 'object') {
      throw new InvalidComponentError('Cannot register non-object component definition.');
    }

    // Ensure valid definition structure
    const validatedDef = defineComponent(component) as ComponentDefinition;

    if (this.components.has(validatedDef.type) && !options.allowOverride) {
      throw new DuplicateComponentError(
        validatedDef.type,
        'Use { allowOverride: true } if you explicitly wish to overwrite an existing component definition.',
      );
    }

    this.components.set(validatedDef.type, validatedDef);
  }

  public unregister(type: string): boolean {
    return this.components.delete(type);
  }

  public get<Props extends Record<string, JSONValue> = Record<string, JSONValue>>(
    type: string,
  ): ComponentDefinition<Props> | undefined {
    return this.components.get(type) as ComponentDefinition<Props> | undefined;
  }

  public has(type: string): boolean {
    return this.components.has(type);
  }

  public getAll(): readonly ComponentDefinition[] {
    return Array.from(this.components.values());
  }

  public clear(): void {
    this.components.clear();
  }

  public getDefaultProps(type: string): Record<string, JSONValue> {
    const comp = this.components.get(type);
    if (!comp) {
      return {};
    }

    const result: Record<string, JSONValue> = {};

    // 1. Gather field-level defaults
    if (comp.fields) {
      for (const [fieldName, fieldDef] of Object.entries(comp.fields)) {
        if (fieldDef.defaultValue !== undefined) {
          result[fieldName] = fieldDef.defaultValue;
        } else {
          const handler = this.fieldTypes.get(fieldDef.type);
          if (handler && handler.getDefaultValue) {
            const val = handler.getDefaultValue(fieldDef);
            if (val !== undefined) {
              result[fieldName] = val;
            }
          }
        }
      }
    }

    // 2. Merge component-level defaultProps override
    if (comp.defaultProps) {
      for (const [key, val] of Object.entries(comp.defaultProps)) {
        if (val !== undefined) {
          result[key] = val as JSONValue;
        }
      }
    }

    return result;
  }

  public validateProps(type: string, props: Record<string, unknown>): PropValidationResult {
    const comp = this.components.get(type);
    if (!comp) {
      return {
        valid: false,
        errors: [`Component type "${type}" is not registered.`],
      };
    }

    const errors: string[] = [];

    for (const [fieldName, fieldDef] of Object.entries(comp.fields)) {
      const value = props[fieldName];
      const handler = this.fieldTypes.get(fieldDef.type);

      if (handler && handler.validate) {
        const res: FieldValidationResult = handler.validate(value, fieldDef);
        if (!res.valid) {
          errors.push(
            `Field "${fieldName}" on component "${type}": ${res.error ?? 'Invalid value'}`,
          );
        }
      }
    }

    return {
      valid: errors.length === 0,
      errors: Object.freeze(errors),
    };
  }

  public registerFieldType(fieldType: FieldTypeDefinition): void {
    if (!fieldType || typeof fieldType.type !== 'string' || !fieldType.type.trim()) {
      throw new InvalidComponentError('Field type definition must have a non-empty string "type".');
    }
    this.fieldTypes.set(fieldType.type, fieldType);
  }

  public getFieldType(type: string): FieldTypeDefinition | undefined {
    return this.fieldTypes.get(type);
  }

  public getAllFieldTypes(): readonly FieldTypeDefinition[] {
    return Array.from(this.fieldTypes.values());
  }
}

/**
 * Creates a new instance of the framework-independent ComponentRegistry.
 */
export function createComponentRegistry(
  options: ComponentRegistryOptions = {},
): ComponentRegistry {
  return new ComponentRegistryImpl(options);
}
