/**
 * @irich/react
 * React bindings, context provider, property inspector, and fine-grained subscription hooks for iRich.
 */

export { IRichContext, useIRichContext } from './context';
export { IRichProvider } from './provider';
export { IRichEditor, type IRichEditorProps } from './editor';
export {
  useIRich,
  useIRichDocument,
  useIRichEditor,
  useIRichHistory,
  useIRichNode,
  useIRichSelection,
} from './hooks';

export {
  BooleanFieldControl,
  ColorFieldControl,
  DefaultInspectorEmptyState,
  FieldControlWrapper,
  IRichInspector,
  NumberFieldControl,
  RenderFieldControl,
  SelectFieldControl,
  TextFieldControl,
  TextareaFieldControl,
} from './inspector';

export type {
  BooleanFieldControlProps,
  ColorFieldControlProps,
  FieldControlProps,
  IRichInspectorProps,
  NumberFieldControlProps,
  SelectFieldControlProps,
  TextFieldControlProps,
  TextareaFieldControlProps,
} from './inspector';

export type {
  IRichContextValue,
  IRichProviderProps,
  UseIRichHistoryResult,
  UseIRichResult,
  UseIRichSelectionResult,
} from './types';

export {
  IRichDndContext,
  IRichDndProvider,
  InsertionIndicator,
  useIRichCanvasDraggable,
  useIRichDndState,
  useIRichDroppableContainer,
  useIRichNodeDropTarget,
  useIRichPaletteDraggable,
} from './dnd';

export type {
  CanvasNodeDragData,
  DropEdge,
  DropTargetData,
  IRichDndProviderProps,
  IRichDndState,
  IRichDragData,
  InsertionIndicatorProps,
  PaletteDragData,
  UseCanvasDraggableOptions,
  UseDroppableContainerOptions,
  UseNodeDropTargetOptions,
  UsePaletteDraggableOptions,
} from './dnd';
