/**
 * @irich/react
 * Standard field control components for dynamic property inspector.
 */

import type { FC, ReactNode } from 'react';
import type {
  BooleanFieldControlProps,
  ColorFieldControlProps,
  FieldControlProps,
  NumberFieldControlProps,
  SelectFieldControlProps,
  TextFieldControlProps,
  TextareaFieldControlProps,
} from './types';

/**
 * Accessible wrapper container for individual inspector fields.
 */
export const FieldControlWrapper: FC<{
  inputId: string;
  label?: string;
  description?: string;
  className?: string;
  children: ReactNode;
}> = ({ inputId, label, description, className, children }) => {
  return (
    <div className={`irich-inspector-field ${className ?? ''}`}>
      {label && (
        <label htmlFor={inputId} className="irich-inspector-label">
          {label}
        </label>
      )}
      <div className="irich-inspector-control-container">{children}</div>
      {description && (
        <p id={`${inputId}-desc`} className="irich-inspector-description">
          {description}
        </p>
      )}
    </div>
  );
};

/**
 * Single-line text input control.
 */
export const TextFieldControl: FC<TextFieldControlProps> = ({
  fieldDefinition,
  value,
  onChange,
  inputId,
  disabled,
}) => {
  const stringValue = value !== null && value !== undefined ? String(value) : '';

  return (
    <input
      id={inputId}
      type="text"
      className="irich-inspector-input irich-inspector-text"
      value={stringValue}
      placeholder={fieldDefinition.placeholder}
      minLength={fieldDefinition.minLength}
      maxLength={fieldDefinition.maxLength}
      disabled={disabled || fieldDefinition.readOnly}
      aria-describedby={fieldDefinition.description ? `${inputId}-desc` : undefined}
      onChange={(e) => onChange(e.target.value)}
    />
  );
};

/**
 * Multi-line textarea input control.
 */
export const TextareaFieldControl: FC<TextareaFieldControlProps> = ({
  fieldDefinition,
  value,
  onChange,
  inputId,
  disabled,
}) => {
  const stringValue = value !== null && value !== undefined ? String(value) : '';

  return (
    <textarea
      id={inputId}
      className="irich-inspector-input irich-inspector-textarea"
      value={stringValue}
      rows={fieldDefinition.rows ?? 3}
      placeholder={fieldDefinition.placeholder}
      minLength={fieldDefinition.minLength}
      maxLength={fieldDefinition.maxLength}
      disabled={disabled || fieldDefinition.readOnly}
      aria-describedby={fieldDefinition.description ? `${inputId}-desc` : undefined}
      onChange={(e) => onChange(e.target.value)}
    />
  );
};

/**
 * Numeric input control with min, max, step boundaries.
 */
export const NumberFieldControl: FC<NumberFieldControlProps> = ({
  fieldDefinition,
  value,
  onChange,
  inputId,
  disabled,
}) => {
  const numValue =
    typeof value === 'number' && !Number.isNaN(value)
      ? value
      : fieldDefinition.defaultValue !== undefined
        ? Number(fieldDefinition.defaultValue)
        : 0;

  return (
    <div className="irich-inspector-number-wrapper">
      <input
        id={inputId}
        type="number"
        className="irich-inspector-input irich-inspector-number"
        value={numValue}
        min={fieldDefinition.min}
        max={fieldDefinition.max}
        step={fieldDefinition.step}
        disabled={disabled || fieldDefinition.readOnly}
        aria-describedby={fieldDefinition.description ? `${inputId}-desc` : undefined}
        onChange={(e) => {
          const val = parseFloat(e.target.value);
          onChange(Number.isNaN(val) ? 0 : val);
        }}
      />
      {fieldDefinition.unit && (
        <span className="irich-inspector-unit-badge">{fieldDefinition.unit}</span>
      )}
    </div>
  );
};

/**
 * Boolean toggle / checkbox control.
 */
export const BooleanFieldControl: FC<BooleanFieldControlProps> = ({
  fieldDefinition,
  value,
  onChange,
  inputId,
  disabled,
}) => {
  const boolValue = Boolean(value ?? fieldDefinition.defaultValue ?? false);

  return (
    <label htmlFor={inputId} className="irich-inspector-checkbox-label">
      <input
        id={inputId}
        type="checkbox"
        className="irich-inspector-checkbox"
        checked={boolValue}
        disabled={disabled || fieldDefinition.readOnly}
        aria-describedby={fieldDefinition.description ? `${inputId}-desc` : undefined}
        onChange={(e) => onChange(e.target.checked)}
      />
      <span className="irich-inspector-checkbox-text">
        {boolValue ? 'Enabled' : 'Disabled'}
      </span>
    </label>
  );
};

/**
 * Select dropdown control.
 */
export const SelectFieldControl: FC<SelectFieldControlProps> = ({
  fieldDefinition,
  value,
  onChange,
  inputId,
  disabled,
}) => {
  const stringValue = value !== null && value !== undefined ? String(value) : '';
  const options = fieldDefinition.options || [];

  return (
    <select
      id={inputId}
      className="irich-inspector-input irich-inspector-select"
      value={stringValue}
      disabled={disabled || fieldDefinition.readOnly}
      aria-describedby={fieldDefinition.description ? `${inputId}-desc` : undefined}
      onChange={(e) => {
        const rawVal = e.target.value;
        // Match option to preserve numeric/boolean values if applicable
        const matched = options.find((opt) => String(opt.value) === rawVal);
        onChange(matched ? matched.value : rawVal);
      }}
    >
      {options.map((opt) => (
        <option key={String(opt.value)} value={String(opt.value)}>
          {opt.label}
        </option>
      ))}
    </select>
  );
};

/**
 * Color picker input control.
 */
export const ColorFieldControl: FC<ColorFieldControlProps> = ({
  fieldDefinition,
  value,
  onChange,
  inputId,
  disabled,
}) => {
  const hexValue =
    typeof value === 'string' && value.startsWith('#')
      ? value
      : String(fieldDefinition.defaultValue ?? '#000000');

  return (
    <div className="irich-inspector-color-wrapper">
      <div className="irich-inspector-color-input-row">
        <input
          id={`${inputId}-picker`}
          type="color"
          className="irich-inspector-color-swatch"
          value={hexValue}
          disabled={disabled || fieldDefinition.readOnly}
          onChange={(e) => onChange(e.target.value)}
          aria-label="Color Picker"
        />
        <input
          id={inputId}
          type="text"
          className="irich-inspector-input irich-inspector-color-text"
          value={hexValue}
          placeholder="#000000"
          disabled={disabled || fieldDefinition.readOnly}
          aria-describedby={fieldDefinition.description ? `${inputId}-desc` : undefined}
          onChange={(e) => onChange(e.target.value)}
        />
      </div>

      {fieldDefinition.presetColors && fieldDefinition.presetColors.length > 0 && (
        <div className="irich-inspector-color-presets" role="group" aria-label="Preset colors">
          {fieldDefinition.presetColors.map((preset) => (
            <button
              key={preset}
              type="button"
              className={`irich-inspector-preset-btn ${preset === hexValue ? 'active' : ''}`}
              style={{ backgroundColor: preset }}
              onClick={() => onChange(preset)}
              title={preset}
              aria-label={`Select preset color ${preset}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

/**
 * Universal field renderer mapping built-in field types to their respective controls.
 */
export const RenderFieldControl: FC<FieldControlProps> = (props) => {
  const { fieldDefinition, inputId } = props;

  const control = (() => {
    switch (fieldDefinition.type) {
      case 'text':
        return <TextFieldControl {...(props as TextFieldControlProps)} />;
      case 'textarea':
        return <TextareaFieldControl {...(props as TextareaFieldControlProps)} />;
      case 'number':
        return <NumberFieldControl {...(props as NumberFieldControlProps)} />;
      case 'boolean':
        return <BooleanFieldControl {...(props as BooleanFieldControlProps)} />;
      case 'select':
        return <SelectFieldControl {...(props as SelectFieldControlProps)} />;
      case 'color':
        return <ColorFieldControl {...(props as ColorFieldControlProps)} />;
      default:
        // Generic text input fallback
        return <TextFieldControl {...(props as TextFieldControlProps)} />;
    }
  })();

  return (
    <FieldControlWrapper
      inputId={inputId}
      label={fieldDefinition.label || props.fieldName}
      description={fieldDefinition.description}
    >
      {control}
    </FieldControlWrapper>
  );
};
