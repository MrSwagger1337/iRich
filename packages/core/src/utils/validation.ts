import type { ComponentRegistry } from '../component';
import type { IRichDocument, IRichDocumentMetadata, IRichNode, IRichNodeMeta } from '../types';

/**
 * Diagnostic error codes emitted during document validation.
 */
export type ValidationErrorCode =
  | 'INVALID_JSON'
  | 'INVALID_DOCUMENT_STRUCTURE'
  | 'INVALID_DOCUMENT_VERSION'
  | 'INVALID_METADATA'
  | 'INVALID_DIRECTION'
  | 'INVALID_NODE_STRUCTURE'
  | 'DUPLICATE_NODE_ID'
  | 'UNKNOWN_COMPONENT'
  | 'INVALID_PROP'
  | 'INVALID_PLACEMENT'
  | 'UNSAFE_VALUE'
  | 'NON_JSON_VALUE'
  | 'CYCLIC_REFERENCE';

/**
 * Structured diagnostic detail for an individual validation error.
 */
export interface ValidationErrorDetail {
  readonly code: ValidationErrorCode;
  readonly path: string;
  readonly message: string;
  readonly nodeId?: string;
  readonly nodeType?: string;
  readonly propName?: string;
}

/**
 * Options for validating an iRich document.
 */
export interface ValidateDocumentOptions {
  /**
   * Optional ComponentRegistry to validate component types, prop schemas, and placement rules.
   */
  registry?: ComponentRegistry;
}

/**
 * Result returned by document validation.
 */
export interface ValidationResult {
  readonly valid: boolean;
  readonly errors: readonly string[];
  readonly details: readonly ValidationErrorDetail[];
  readonly document?: IRichDocument;
}

const VALID_DIRECTIONS = new Set<string>(['ltr', 'rtl', 'auto']);
const FORBIDDEN_KEYS = new Set<string>(['__proto__', 'constructor', 'prototype']);

/**
 * Validates whether an arbitrary JavaScript value is strictly serializable to JSON.
 * Detects undefined, functions, symbols, BigInt, and circular references.
 */
export function isJSONValue(value: unknown, seen = new WeakSet<object>()): boolean {
  if (value === null) {
    return true;
  }

  const type = typeof value;
  if (type === 'string' || type === 'number' || type === 'boolean') {
    if (type === 'number' && !Number.isFinite(value as number)) {
      return false; // NaN, Infinity, -Infinity are not valid in JSON
    }
    return true;
  }

  if (type === 'undefined' || type === 'function' || type === 'symbol' || type === 'bigint') {
    return false;
  }

  if (type === 'object') {
    if (seen.has(value as object)) {
      return false; // Circular reference detected
    }
    seen.add(value as object);

    if (Array.isArray(value)) {
      for (const item of value) {
        if (!isJSONValue(item, seen)) {
          return false;
        }
      }
      return true;
    }

    // Check if it's a plain object (not Date, RegExp, Map, Set, Promise, DOM Node, etc.)
    const proto = Object.getPrototypeOf(value);
    if (proto !== null && proto !== Object.prototype) {
      return false;
    }

    for (const key of Object.keys(value as object)) {
      if (FORBIDDEN_KEYS.has(key)) {
        return false;
      }
      const propVal = (value as Record<string, unknown>)[key];
      if (!isJSONValue(propVal, seen)) {
        return false;
      }
    }

    return true;
  }

  return false;
}

/**
 * Validates an iRich document against all canonical document model invariants,
 * security rules, metadata standards, and optional ComponentRegistry schemas.
 */
export function validateDocument(
  doc: unknown,
  options: ValidateDocumentOptions = {},
): ValidationResult {
  const details: ValidationErrorDetail[] = [];
  const seenIds = new Set<string>();

  function addError(
    code: ValidationErrorCode,
    path: string,
    message: string,
    context: { nodeId?: string; nodeType?: string; propName?: string } = {},
  ) {
    details.push({
      code,
      path,
      message,
      ...(context.nodeId ? { nodeId: context.nodeId } : {}),
      ...(context.nodeType ? { nodeType: context.nodeType } : {}),
      ...(context.propName ? { propName: context.propName } : {}),
    });
  }

  if (!doc || typeof doc !== 'object' || Array.isArray(doc)) {
    addError('INVALID_DOCUMENT_STRUCTURE', '$', 'Document must be a non-null object.');
    return {
      valid: false,
      errors: Object.freeze(details.map((d) => `[${d.path}] ${d.message}`)),
      details: Object.freeze(details),
    };
  }

  const rootProto = Object.getPrototypeOf(doc);
  if (rootProto !== null && rootProto !== Object.prototype) {
    addError('UNSAFE_VALUE', '$', 'Dangerous object prototype pollution detected at document root.');
  }

  const candidate = doc as Partial<IRichDocument>;

  // 1. Check for forbidden prototype pollution keys at root
  for (const key of Object.keys(candidate)) {
    if (FORBIDDEN_KEYS.has(key)) {
      addError('UNSAFE_VALUE', `$`, `Dangerous property key "${key}" detected at document root.`);
    }
  }

  // 2. Validate version
  if (
    !candidate.version ||
    typeof candidate.version !== 'string' ||
    candidate.version.trim() === ''
  ) {
    addError('INVALID_DOCUMENT_VERSION', 'version', 'Document must have a non-empty string "version".');
  }

  // 3. Validate metadata if present
  if (candidate.metadata !== undefined) {
    if (
      typeof candidate.metadata !== 'object' ||
      candidate.metadata === null ||
      Array.isArray(candidate.metadata)
    ) {
      addError('INVALID_METADATA', 'metadata', 'Document "metadata" must be a plain object.');
    } else {
      const metaProto = Object.getPrototypeOf(candidate.metadata);
      if (metaProto !== null && metaProto !== Object.prototype) {
        addError('UNSAFE_VALUE', 'metadata', 'Dangerous object prototype pollution detected in metadata.');
      }

      const meta = candidate.metadata as IRichDocumentMetadata;
      // Check for forbidden keys in metadata
      for (const key of Object.keys(meta)) {
        if (FORBIDDEN_KEYS.has(key)) {
          addError('UNSAFE_VALUE', `metadata.${key}`, `Dangerous property key "${key}" in document metadata.`);
        }
      }

      if (!isJSONValue(candidate.metadata)) {
        addError(
          'NON_JSON_VALUE',
          'metadata',
          'Document "metadata" contains non-JSON serializable values or circular references.',
        );
      }

      // Check locale type if provided
      if (meta.locale !== undefined && typeof meta.locale !== 'string') {
        addError('INVALID_METADATA', 'metadata.locale', 'Document "metadata.locale" must be a string.');
      }

      // Check direction enum if provided
      if (meta.direction !== undefined) {
        if (typeof meta.direction !== 'string' || !VALID_DIRECTIONS.has(meta.direction)) {
          addError(
            'INVALID_DIRECTION',
            'metadata.direction',
            `Invalid document direction "${String(meta.direction)}". Expected 'ltr', 'rtl', or 'auto'.`,
          );
        }
      }
    }
  }

  // 4. Validate root node existence
  if (!candidate.root || typeof candidate.root !== 'object' || Array.isArray(candidate.root)) {
    addError('INVALID_DOCUMENT_STRUCTURE', 'root', 'Document must have a valid "root" node object.');
    return {
      valid: false,
      errors: Object.freeze(details.map((d) => `[${d.path}] ${d.message}`)),
      details: Object.freeze(details),
    };
  }

  // 5. Validate recursive node structure & invariants
  function validateNode(
    node: unknown,
    path: string,
    parent: IRichNode | null,
    slotName: string | undefined,
    ancestors = new Set<object>(),
  ) {
    if (!node || typeof node !== 'object' || Array.isArray(node)) {
      addError('INVALID_NODE_STRUCTURE', path, 'Node must be a valid non-null object.', {
        nodeId: parent?.id,
      });
      return;
    }

    if (ancestors.has(node as object)) {
      addError('CYCLIC_REFERENCE', path, 'Circular node reference detected in document tree hierarchy.');
      return;
    }
    const currentAncestors = new Set(ancestors);
    currentAncestors.add(node as object);

    const nodeProto = Object.getPrototypeOf(node);
    if (nodeProto !== null && nodeProto !== Object.prototype) {
      addError('UNSAFE_VALUE', path, 'Dangerous object prototype pollution detected on node.');
    }

    const candidateNode = node as Partial<IRichNode>;

    // Validate prototype pollution keys on node
    for (const key of Object.keys(candidateNode)) {
      if (FORBIDDEN_KEYS.has(key)) {
        addError('UNSAFE_VALUE', `${path}.${key}`, `Dangerous property key "${key}" detected on node.`);
      }
    }

    // Validate ID
    const nodeId = candidateNode.id;
    if (!nodeId || typeof nodeId !== 'string' || nodeId.trim() === '') {
      addError('INVALID_NODE_STRUCTURE', `${path}.id`, 'Node must have a non-empty string "id".', {
        nodeType: candidateNode.type,
      });
    } else if (seenIds.has(nodeId)) {
      addError(
        'DUPLICATE_NODE_ID',
        `${path}.id`,
        `Duplicate NodeId detected: "${nodeId}". Every node must have a globally unique ID.`,
        { nodeId, nodeType: candidateNode.type },
      );
    } else {
      seenIds.add(nodeId);
    }

    // Validate Type
    const nodeType = candidateNode.type;
    let componentDef: ReturnType<NonNullable<typeof options.registry>['get']> | undefined;

    if (!nodeType || typeof nodeType !== 'string' || nodeType.trim() === '') {
      addError('INVALID_NODE_STRUCTURE', `${path}.type`, 'Node must have a non-empty string "type".', {
        nodeId,
      });
    } else if (options.registry) {
      if (nodeType !== 'root') {
        if (!options.registry.has(nodeType)) {
          addError(
            'UNKNOWN_COMPONENT',
            `${path}.type`,
            `Component type "${nodeType}" is not registered in the provided ComponentRegistry.`,
            { nodeId, nodeType },
          );
        } else {
          componentDef = options.registry.get(nodeType);
        }
      }
    }

    // Placement Checks against Parent & Component Rules
    if (options.registry && parent && nodeType) {
      // 1. Check parent allowedChildren
      if (parent.type !== 'root' && options.registry.has(parent.type)) {
        const parentDef = options.registry.get(parent.type);
        if (parentDef) {
          if (slotName && parentDef.slots?.[slotName]) {
            const slotDef = parentDef.slots[slotName];
            if (slotDef.allowedTypes && !slotDef.allowedTypes.includes(nodeType)) {
              addError(
                'INVALID_PLACEMENT',
                path,
                `Component "${nodeType}" is not permitted in slot "${slotName}" of parent "${parent.type}". Allowed types: [${slotDef.allowedTypes.join(', ')}]`,
                { nodeId, nodeType },
              );
            }
          } else if (!slotName && parentDef.canHaveChildren === false) {
            addError(
              'INVALID_PLACEMENT',
              path,
              `Component "${parent.type}" does not allow direct child nodes.`,
              { nodeId, nodeType },
            );
          } else if (!slotName && parentDef.allowedChildren && !parentDef.allowedChildren.includes(nodeType)) {
            addError(
              'INVALID_PLACEMENT',
              path,
              `Component "${nodeType}" is not permitted as a child of "${parent.type}". Allowed: [${parentDef.allowedChildren.join(', ')}]`,
              { nodeId, nodeType },
            );
          }
        }
      }

      // 2. Check child allowedParents
      if (componentDef && componentDef.allowedParents) {
        if (!componentDef.allowedParents.includes(parent.type)) {
          addError(
            'INVALID_PLACEMENT',
            path,
            `Component "${nodeType}" is only allowed inside parents of type [${componentDef.allowedParents.join(', ')}], but found inside "${parent.type}".`,
            { nodeId, nodeType },
          );
        }
      }
    }

    // Validate Props
    if (candidateNode.props === undefined) {
      addError(
        'INVALID_PROP',
        `${path}.props`,
        'Node must have a "props" object (cannot be undefined).',
        { nodeId, nodeType },
      );
    } else if (
      typeof candidateNode.props !== 'object' ||
      candidateNode.props === null ||
      Array.isArray(candidateNode.props)
    ) {
      addError(
        'INVALID_PROP',
        `${path}.props`,
        'Node "props" must be a plain object.',
        { nodeId, nodeType },
      );
    } else {
      const propsProto = Object.getPrototypeOf(candidateNode.props);
      if (propsProto !== null && propsProto !== Object.prototype) {
        addError('UNSAFE_VALUE', `${path}.props`, 'Dangerous object prototype pollution detected on node props.', {
          nodeId,
          nodeType,
        });
      }
      for (const key of Object.keys(candidateNode.props)) {
        if (FORBIDDEN_KEYS.has(key)) {
          addError('UNSAFE_VALUE', `${path}.props.${key}`, `Dangerous property key "${key}" in node props.`, {
            nodeId,
            nodeType,
          });
        }
      }

      if (!isJSONValue(candidateNode.props)) {
        addError(
          'NON_JSON_VALUE',
          `${path}.props`,
          'Node "props" contains non-JSON serializable values (functions, undefined, circular references).',
          { nodeId, nodeType },
        );
      } else if (options.registry && nodeType && nodeType !== 'root' && options.registry.has(nodeType)) {
        const propValidation = options.registry.validateProps(
          nodeType,
          candidateNode.props as Record<string, unknown>,
        );
        if (!propValidation.valid) {
          for (const err of propValidation.errors) {
            // Extract propName if formatted as "Field \"foo\":"
            const match = /Field\s+"([^"]+)"/.exec(err);
            const propName = match ? match[1] : undefined;
            addError('INVALID_PROP', `${path}.props${propName ? `.${propName}` : ''}`, err, {
              nodeId,
              nodeType,
              propName,
            });
          }
        }
      }
    }

    // Validate Meta if present
    if (candidateNode.meta !== undefined) {
      if (
        typeof candidateNode.meta !== 'object' ||
        candidateNode.meta === null ||
        Array.isArray(candidateNode.meta)
      ) {
        addError('INVALID_METADATA', `${path}.meta`, 'Node "meta" must be a plain object.', {
          nodeId,
          nodeType,
        });
      } else {
        const nodeMetaProto = Object.getPrototypeOf(candidateNode.meta);
        if (nodeMetaProto !== null && nodeMetaProto !== Object.prototype) {
          addError('UNSAFE_VALUE', `${path}.meta`, 'Dangerous object prototype pollution detected on node meta.', {
            nodeId,
            nodeType,
          });
        }
        for (const key of Object.keys(candidateNode.meta)) {
          if (FORBIDDEN_KEYS.has(key)) {
            addError('UNSAFE_VALUE', `${path}.meta.${key}`, `Dangerous property key "${key}" in node meta.`, {
              nodeId,
              nodeType,
            });
          }
        }

        if (!isJSONValue(candidateNode.meta)) {
          addError('NON_JSON_VALUE', `${path}.meta`, 'Node "meta" contains non-JSON serializable values.', {
            nodeId,
            nodeType,
          });
        }

        const meta = candidateNode.meta as IRichNodeMeta;
        if (meta.dir !== undefined) {
          if (typeof meta.dir !== 'string' || !VALID_DIRECTIONS.has(meta.dir)) {
            addError(
              'INVALID_DIRECTION',
              `${path}.meta.dir`,
              `Invalid node direction "${String(meta.dir)}". Expected 'ltr', 'rtl', or 'auto'.`,
              { nodeId, nodeType },
            );
          }
        }

        if (meta.lang !== undefined && typeof meta.lang !== 'string') {
          addError(
            'INVALID_METADATA',
            `${path}.meta.lang`,
            'Node "meta.lang" must be a string tag.',
            { nodeId, nodeType },
          );
        }
      }
    }

    const castNode = candidateNode as IRichNode;

    // Validate Children
    if (candidateNode.children !== undefined) {
      if (!Array.isArray(candidateNode.children)) {
        addError('INVALID_NODE_STRUCTURE', `${path}.children`, 'Node "children" must be an array.', {
          nodeId,
          nodeType,
        });
      } else {
        for (let i = 0; i < candidateNode.children.length; i++) {
          validateNode(candidateNode.children[i], `${path}.children[${i}]`, castNode, undefined, currentAncestors);
        }
      }
    }

    // Validate Slots
    if (candidateNode.slots !== undefined) {
      if (
        typeof candidateNode.slots !== 'object' ||
        candidateNode.slots === null ||
        Array.isArray(candidateNode.slots)
      ) {
        addError(
          'INVALID_NODE_STRUCTURE',
          `${path}.slots`,
          'Node "slots" must be a record mapping slot names to node arrays.',
          { nodeId, nodeType },
        );
      } else {
        for (const [slotNameKey, slotNodes] of Object.entries(candidateNode.slots)) {
          if (!Array.isArray(slotNodes)) {
            addError(
              'INVALID_NODE_STRUCTURE',
              `${path}.slots.${slotNameKey}`,
              `Slot "${slotNameKey}" must be an array of nodes.`,
              { nodeId, nodeType },
            );
          } else {
            // Check slot maxChildren if registry is configured
            if (componentDef?.slots?.[slotNameKey]?.maxChildren !== undefined) {
              const max = componentDef.slots[slotNameKey].maxChildren!;
              if (slotNodes.length > max) {
                addError(
                  'INVALID_PLACEMENT',
                  `${path}.slots.${slotNameKey}`,
                  `Slot "${slotNameKey}" exceeds maximum child limit of ${max} (has ${slotNodes.length}).`,
                  { nodeId, nodeType },
                );
              }
            }

            for (let i = 0; i < slotNodes.length; i++) {
              validateNode(
                slotNodes[i],
                `${path}.slots.${slotNameKey}[${i}]`,
                castNode,
                slotNameKey,
                currentAncestors,
              );
            }
          }
        }
      }
    }
  }

  validateNode(candidate.root, 'root', null, undefined);

  const isValid = details.length === 0;

  return {
    valid: isValid,
    errors: Object.freeze(details.map((d) => `[${d.path}] ${d.message}`)),
    details: Object.freeze(details),
    ...(isValid ? { document: doc as IRichDocument } : {}),
  };
}
