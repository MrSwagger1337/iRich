/**
 * @irich/core
 * AI action protocol, validation, and execution module.
 */

export {
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
} from './types';

export {
  isSafeAIValue,
  containsDangerousScript,
  type SecurityCheckResult,
} from './security';

export { validateAIActions } from './validator';
export { applyAIActions } from './executor';
