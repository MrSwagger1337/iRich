# iRich Component Definition API

> Schema definitions, field descriptors, slot declarations, component registry, and renderer decoupling for **iRich** components.

---

## 1. Architectural Separation

To adhere to iRich's **Framework-Independent Core** principle:
- **`@irich/core`** defines the pure data schema, prop fields, default prop derivation, slot constraints, and `ComponentRegistry`. `@irich/core` contains zero React or DOM runtime dependencies.
- **`@irich/renderer`** & **`@irich/react`** bind React rendering components and canvas overlays to these core component definitions.

```
+-------------------------------------------------------------+
|                     @irich/core                             |
|  - ComponentDefinition (type, label, fields, slots, meta)   |
|  - FieldDefinition (text, textarea, number, boolean, etc.)   |
|  - createComponentRegistry()                                |
|  - defineComponent()                                        |
+-------------------------------------------------------------+
                              |
                              v
+-------------------------------------------------------------+
|              @irich/react / @irich/renderer                 |
|  - RendererRegistry.register(type, ReactComponent)          |
|  - Visual Canvas Overlays & Dropzones                       |
|  - Property Inspector Auto-Generation                       |
+-------------------------------------------------------------+
```

---

## 2. Core Component Definition (`@irich/core`)

All components in iRich declare their schema and inspector fields through `defineComponent(...)`:

```typescript
import { defineComponent } from '@irich/core';

export const HeroComponent = defineComponent({
  type: 'Hero',
  label: 'Hero Section',
  category: 'Marketing',
  description: 'Main landing page header banner.',

  fields: {
    title: {
      type: 'text',
      label: 'Title',
      defaultValue: 'Welcome to iRich',
    },
    subtitle: {
      type: 'textarea',
      label: 'Subtitle',
      defaultValue: 'A visual editor for modern React applications.',
    },
    alignment: {
      type: 'select',
      label: 'Alignment',
      options: [
        { label: 'Left', value: 'left' },
        { label: 'Center', value: 'center' },
        { label: 'Right', value: 'right' },
      ],
      defaultValue: 'center',
    },
    backgroundColor: {
      type: 'color',
      label: 'Background Color',
      defaultValue: '#0f172a',
    },
    showButton: {
      type: 'boolean',
      label: 'Show CTA Button',
      defaultValue: true,
    },
    padding: {
      type: 'number',
      label: 'Vertical Padding (px)',
      min: 16,
      max: 128,
      step: 8,
      defaultValue: 64,
    },
  },

  defaultProps: {
    title: 'Welcome to iRich',
    alignment: 'center',
  },

  slots: {
    actions: { label: 'Call to Action Slot', maxChildren: 2 },
  },
});
```

---

## 3. Initial Supported Field Types

The `@irich/core` schema system supports the following built-in field types:

| Field Type | Schema Interface | Supported Options | Default Value Behavior |
| :--- | :--- | :--- | :--- |
| **`text`** | `TextFieldDefinition` | `defaultValue`, `placeholder`, `minLength`, `maxLength`, `pattern` | `""` or `defaultValue` |
| **`textarea`** | `TextareaFieldDefinition` | `defaultValue`, `placeholder`, `rows`, `minLength`, `maxLength` | `""` or `defaultValue` |
| **`number`** | `NumberFieldDefinition` | `defaultValue`, `min`, `max`, `step`, `unit` | `0` or `defaultValue` |
| **`boolean`** | `BooleanFieldDefinition` | `defaultValue` | `false` or `defaultValue` |
| **`select`** | `SelectFieldDefinition` | `options: Array<{ label, value }>`, `defaultValue` | First option or `defaultValue` |
| **`color`** | `ColorFieldDefinition` | `defaultValue`, `presetColors: string[]` | `"#000000"` or `defaultValue` |

### Extensible Field Types (Plugin SDK)

Third-party plugins can register custom field types (e.g. `icon-picker`, `rich-text`, `date-range`) via `registry.registerFieldType(...)`:

```typescript
registry.registerFieldType({
  type: 'date',
  validate(value, field) {
    if (typeof value !== 'string' || Number.isNaN(Date.parse(value))) {
      return { valid: false, error: 'Expected valid ISO date string' };
    }
    return { valid: true };
  },
  getDefaultValue() {
    return new Date().toISOString();
  },
});
```

---

## 4. Component Registry API (`@irich/core`)

The `ComponentRegistry` manages all registered component definitions, default prop calculation, prop validation, and field handlers.

```typescript
import { createComponentRegistry, defineComponent } from '@irich/core';

const registry = createComponentRegistry();

// 1. Register component (throws DuplicateComponentError on collision unless allowOverride: true)
registry.register(HeroComponent);

// 2. Query registry
registry.has('Hero'); // true
const heroDef = registry.get('Hero');
const allComponents = registry.getAll();

// 3. Compute default props (combines field defaults + component defaultProps)
const defaultProps = registry.getDefaultProps('Hero');

// 4. Validate props against registered schema
const result = registry.validateProps('Hero', {
  title: 'My Title',
  padding: 200, // Invalid: exceeds max 128
});
// result.valid === false, result.errors contains formatted validation issue

// 5. Unregister
registry.unregister('Hero');
```

---

## 5. React Rendering Binding (`@irich/renderer` / `@irich/react`)

In application and presentation layers, React renderers map directly to core component types:

```typescript
import { RendererRegistry, type NodeRendererProps } from '@irich/renderer';
import { HeroComponent } from './components/Hero';

const renderer = new RendererRegistry();

renderer.register('Hero', ({ props, dir, lang, slots }: NodeRendererProps) => {
  return (
    <section
      dir={dir}
      lang={lang}
      style={{
        backgroundColor: props.backgroundColor as string,
        textAlign: props.alignment === 'left' ? 'start' : props.alignment === 'right' ? 'end' : 'center',
        padding: '4rem 2rem',
      }}
    >
      <h1>{props.title as string}</h1>
      <p>{props.subtitle as string}</p>
      {slots?.actions}
    </section>
  );
});
```

---

## 6. Multilingual Rendering & CSS Logical Properties

When implementing component renderers:

1. **Accept `dir` and `lang` from `NodeRendererProps`**: Forward `dir` and `lang` to the semantic root container element (e.g. `<section dir={dir} lang={lang}>` or `<blockquote dir={dir} lang={lang}>`).
2. **Use CSS Logical Properties**: Always use logical properties instead of physical left/right rules:
   - Use `margin-inline-start` / `margin-inline-end` instead of `margin-left` / `margin-right`
   - Use `padding-inline-start` / `padding-inline-end` instead of `padding-left` / `padding-right`
   - Use `border-inline-start` / `border-inline-end` instead of `border-left` / `border-right`
   - Use `inset-inline-start` / `inset-inline-end` instead of `left` / `right`
   - Use `text-align: start` / `text-align: end` instead of `text-align: left` / `text-align: right`
3. **Avoid Synthetic Wrappers**: Do not wrap components in synthetic `<div style={{ display: 'contents' }}>` tags, which can interfere with screen readers, drag-and-drop measurements, and selection overlays.

