/**
 * @irich/core
 * Embeddable, extensible visual content editor and page builder engine.
 * Pure TypeScript, zero React/DOM runtime dependencies.
 */

export const VERSION = '0.1.0';

// Canonical Types
export {
  BREAKPOINTS,
  DEFAULT_BREAKPOINT,
  type Breakpoint,
  type ResponsiveObject,
  type ResponsiveValue,
  type JSONPrimitive,
  type JSONObject,
  type JSONArray,
  type JSONValue,
  type NodeId,
  type IRichDirection,
  type IRichNodeMeta,
  type IRichNode,
  type IRichDocumentMetadata,
  type IRichDocument,
  type EditorState,
  type EditorConfig,
  type EditorCommands,
  type InsertNodePayload,
  type RemoveNodePayload,
  type UpdateNodePayload,
  type MoveNodePayload,
  type DuplicateNodePayload,
  type PasteNodePayload,
  type EditorEventMap,
  type EditorEventListener,
} from './types';

// Responsive Utilities
export {
  isResponsiveObject,
  resolveResponsiveValue,
  getResponsiveBreakpointValue,
  setResponsiveBreakpointValue,
  removeResponsiveBreakpointOverride,
  resolveNodeProps,
} from './responsive';

// Error Classes
export {
  IRichError,
  DuplicateIdError,
  NodeNotFoundError,
  InvalidMoveError,
  ValidationError,
  CommandExecutionError,
  DuplicateComponentError,
  ComponentNotFoundError,
  InvalidComponentError,
  StorageError,
  type ErrorCode,
} from './errors';

// Persistence & Storage
export {
  MemoryStorageAdapter,
  type IRichStorageAdapter,
  type MemoryStorageAdapterOptions,
} from './storage';

// Utilities
export { generateId, isValidId } from './utils/id';
export {
  CURRENT_DOCUMENT_VERSION,
  createNode,
  createDocument,
  cloneNode,
  walkDocument,
  findNode,
  findNodeById,
  findParent,
  isDescendantOf,
  collectAllNodeIds,
  type CreateNodeOptions,
  type CreateDocumentOptions,
  type WalkContext,
  type ParentLocation,
} from './utils/tree';
export {
  isJSONValue,
  validateDocument,
  type ValidationErrorCode,
  type ValidationResult,
  type ValidationErrorDetail,
  type ValidateDocumentOptions,
} from './utils/validation';

// Headless JSON Utilities
export {
  parseDocumentJSON,
  validateDocumentJSON,
  formatDocumentJSON,
  type ParseJSONResult,
  type FormatDocumentOptions,
} from './json';

// AI Context Generator
export {
  generateDocumentAIContext,
  type GenerateAIContextOptions,
} from './ai-context';


// Events
export { EventEmitter } from './events';

// History
export {
  HistoryManager,
  DEFAULT_MAX_HISTORY_SIZE,
  type HistoryEntry,
  type HistoryOptions,
} from './history';

// Component & Field System
export {
  defineComponent,
  createComponentRegistry,
  canPlaceNode,
  BUILT_IN_FIELD_TYPES,
  type ComponentDefinition,
  type SlotDefinition,
  type ComponentRegistry,
  type RegisterComponentOptions,
  type ComponentRegistryOptions,
  type PropValidationResult,
  type FieldType,
  type BuiltInFieldType,
  type BaseFieldDefinition,
  type TextFieldDefinition,
  type TextareaFieldDefinition,
  type NumberFieldDefinition,
  type BooleanFieldDefinition,
  type SelectOption,
  type SelectFieldDefinition,
  type ColorFieldDefinition,
  type CustomFieldDefinition,
  type FieldDefinition,
  type FieldValidationResult,
  type FieldTypeDefinition,
  type CanPlaceNodeOptions,
  type PlacementResult,
} from './component';

// Editor Engine
export { Editor, createEditor, type EditorInstance } from './editor';

// AI Action Protocol & Sandboxing
export {
  validateAIActions,
  applyAIActions,
  isSafeAIValue,
  containsDangerousScript,
  type AIActionType,
  type InsertNodeAIAction,
  type UpdatePropsAIAction,
  type UpdateMetaAIAction,
  type RemoveNodeAIAction,
  type MoveNodeAIAction,
  type DuplicateNodeAIAction,
  type ReplaceNodeAIAction,
  type AIAction,
  type AIValidationErrorCode,
  type AIValidationError,
  type AIValidationWarning,
  type ValidateAIActionsOptions,
  type AIValidationResult,
  type ApplyAIActionsOptions,
  type AIApplyResult,
  type SecurityCheckResult,
} from './ai';
