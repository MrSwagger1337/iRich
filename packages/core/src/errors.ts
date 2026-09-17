/**
 * @irich/core
 * Strongly typed error classes for document validation and editor operations.
 */

export type ErrorCode =
  | 'DUPLICATE_ID'
  | 'NODE_NOT_FOUND'
  | 'PARENT_NOT_FOUND'
  | 'INVALID_MOVE_DESCENDANT'
  | 'ROOT_DELETION_FORBIDDEN'
  | 'ROOT_MOVE_FORBIDDEN'
  | 'INVALID_DOCUMENT_VERSION'
  | 'INVALID_NODE_STRUCTURE'
  | 'NON_JSON_VALUE'
  | 'VALIDATION_FAILED'
  | 'COMMAND_FAILED'
  | 'DUPLICATE_COMPONENT'
  | 'COMPONENT_NOT_FOUND'
  | 'INVALID_COMPONENT_DEFINITION';

/**
 * Base class for all iRich engine errors.
 */
export class IRichError extends Error {
  public readonly code: ErrorCode;

  constructor(message: string, code: ErrorCode) {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

/**
 * Thrown when an operation would introduce a duplicate NodeId into the document tree.
 */
export class DuplicateIdError extends IRichError {
  public readonly duplicateId: string;

  constructor(id: string, details?: string) {
    super(`Duplicate NodeId detected: "${id}".${details ? ` ${details}` : ''}`, 'DUPLICATE_ID');
    this.duplicateId = id;
  }
}

/**
 * Thrown when an operation references a NodeId that does not exist in the document.
 */
export class NodeNotFoundError extends IRichError {
  public readonly targetNodeId: string;

  constructor(nodeId: string, context?: string) {
    super(
      `Node with ID "${nodeId}" was not found.${context ? ` Context: ${context}` : ''}`,
      'NODE_NOT_FOUND',
    );
    this.targetNodeId = nodeId;
  }
}

/**
 * Thrown when a move operation violates document tree hierarchy (e.g. moving a parent into its descendant).
 */
export class InvalidMoveError extends IRichError {
  public readonly sourceNodeId: string;
  public readonly targetParentId: string;

  constructor(sourceNodeId: string, targetParentId: string, reason: string) {
    super(
      `Cannot move node "${sourceNodeId}" into target "${targetParentId}": ${reason}`,
      'INVALID_MOVE_DESCENDANT',
    );
    this.sourceNodeId = sourceNodeId;
    this.targetParentId = targetParentId;
  }
}

/**
 * Thrown when document validation fails.
 */
export class ValidationError extends IRichError {
  public readonly errors: readonly string[];

  constructor(errors: string[]) {
    super(
      `Document validation failed with ${errors.length} error(s):\n${errors.map((e) => ` - ${e}`).join('\n')}`,
      'VALIDATION_FAILED',
    );
    this.errors = Object.freeze([...errors]);
  }
}

/**
 * Thrown when attempting an invalid document mutation command.
 */
export class CommandExecutionError extends IRichError {
  constructor(message: string, code: ErrorCode = 'COMMAND_FAILED') {
    super(message, code);
  }
}

/**
 * Thrown when attempting to register a component whose type is already registered without allowOverride.
 */
export class DuplicateComponentError extends IRichError {
  public readonly componentType: string;

  constructor(componentType: string, details?: string) {
    super(
      `Component type "${componentType}" is already registered.${details ? ` ${details}` : ''}`,
      'DUPLICATE_COMPONENT',
    );
    this.componentType = componentType;
  }
}

/**
 * Thrown when attempting to access an unregistered component type.
 */
export class ComponentNotFoundError extends IRichError {
  public readonly componentType: string;

  constructor(componentType: string) {
    super(`Component type "${componentType}" was not found in the registry.`, 'COMPONENT_NOT_FOUND');
    this.componentType = componentType;
  }
}

/**
 * Thrown when a component definition is invalid or malformed.
 */
export class InvalidComponentError extends IRichError {
  constructor(message: string) {
    super(message, 'INVALID_COMPONENT_DEFINITION');
  }
}
