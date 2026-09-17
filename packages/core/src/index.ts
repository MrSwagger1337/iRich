/**
 * @irich/core
 * Embeddable, extensible visual content editor and page builder engine.
 * Pure TypeScript, zero React/DOM runtime dependencies.
 */

export const VERSION = '0.1.0';

// Canonical Types
export type {
  JSONPrimitive,
  JSONObject,
  JSONArray,
  JSONValue,
  NodeId,
  IRichNode,
  IRichDocument,
  EditorState,
  EditorConfig,
  EditorCommands,
  InsertNodePayload,
  RemoveNodePayload,
  UpdateNodePayload,
  MoveNodePayload,
  DuplicateNodePayload,
  EditorEventMap,
  EditorEventListener,
} from './types';

// Error Classes
export {
  IRichError,
  DuplicateIdError,
  NodeNotFoundError,
  InvalidMoveError,
  ValidationError,
  CommandExecutionError,
  type ErrorCode,
} from './errors';

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

// Editor Engine
export { Editor, createEditor, type EditorInstance } from './editor';
