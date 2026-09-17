/**
 * @irich/react
 * Types and interfaces for the Dynamic Property Inspector.
 */

import type { CSSProperties, ReactNode } from 'react';
import type {
  BooleanFieldDefinition,
  ColorFieldDefinition,
  ComponentDefinition,
  FieldDefinition,
  IRichNode,
  JSONValue,
  NodeId,
  NumberFieldDefinition,
  SelectFieldDefinition,
  TextFieldDefinition,
  TextareaFieldDefinition,
} from '@irich/core';

/**
 * Common props passed to individual field control components.
 */
export interface FieldControlProps<TDef extends FieldDefinition = FieldDefinition> {
  /**
   * Target node being inspected and edited.
   */
  node: IRichNode;

  /**
   * Field key / property name on node.props.
   */
  fieldName: string;

  /**
   * Field schema definition from component registry.
   */
  fieldDefinition: TDef;

  /**
   * Current value of the field (falls back to defaultValue or type default).
   */
  value: JSONValue;

  /**
   * Callback to dispatch value changes back to the editor command pipeline.
   */
  onChange: (value: JSONValue) => void;

  /**
   * Unique HTML ID for accessibility label linking.
   */
  inputId: string;

  /**
   * Optional custom CSS class name.
   */
  className?: string;

  /**
   * Whether the control is disabled / read-only.
   */
  disabled?: boolean;
}

export type TextFieldControlProps = FieldControlProps<TextFieldDefinition>;
export type TextareaFieldControlProps = FieldControlProps<TextareaFieldDefinition>;
export type NumberFieldControlProps = FieldControlProps<NumberFieldDefinition>;
export type BooleanFieldControlProps = FieldControlProps<BooleanFieldDefinition>;
export type SelectFieldControlProps = FieldControlProps<SelectFieldDefinition>;
export type ColorFieldControlProps = FieldControlProps<ColorFieldDefinition>;

/**
 * Props for the root <IRichInspector /> component.
 */
export interface IRichInspectorProps {
  /**
   * Optional CSS class name applied to root inspector container.
   */
  className?: string;

  /**
   * Optional inline styles.
   */
  style?: CSSProperties;

  /**
   * Custom empty state rendered when no node is selected.
   */
  emptyState?: ReactNode;

  /**
   * Custom header renderer.
   */
  renderHeader?: (props: {
    node: IRichNode;
    componentDefinition?: ComponentDefinition;
    selectedNodeId: NodeId;
  }) => ReactNode;

  /**
   * Custom footer renderer.
   */
  renderFooter?: (props: {
    node: IRichNode;
    componentDefinition?: ComponentDefinition;
    selectedNodeId: NodeId;
  }) => ReactNode;

  /**
   * Optional callback fired when any property is modified.
   */
  onPropChange?: (fieldName: string, value: JSONValue, node: IRichNode) => void;
}
