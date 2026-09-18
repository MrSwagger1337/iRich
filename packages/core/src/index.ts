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
  type IRichNode,
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
  type ValidationResult,
  type ValidationErrorDetail,
  type ValidateDocumentOptions,
} from './utils/validation';

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
