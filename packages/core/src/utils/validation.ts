/**
 * @irich/core
 * Document validation, JSON value inspection, and structural invariant checks.
 */

import type { IRichDocument, IRichNode } from '../types';

export interface ValidationErrorDetail {
  path: string;
  message: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: readonly string[];
  details: readonly ValidationErrorDetail[];
}

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
 * Validates an iRich document against all canonical document model invariants.
 */
export function validateDocument(doc: unknown): ValidationResult {
  const details: ValidationErrorDetail[] = [];
  const seenIds = new Set<string>();

  function addError(path: string, message: string) {
    details.push({ path, message });
  }

  if (!doc || typeof doc !== 'object') {
    addError('$', 'Document must be a non-null object.');
    return {
      valid: false,
      errors: details.map((d) => `[${d.path}] ${d.message}`),
      details: Object.freeze(details),
    };
  }

  const candidate = doc as Partial<IRichDocument>;

  // 1. Validate version
  if (
    !candidate.version ||
    typeof candidate.version !== 'string' ||
    candidate.version.trim() === ''
  ) {
    addError('version', 'Document must have a non-empty string "version".');
  }

  // 2. Validate metadata if present
  if (candidate.metadata !== undefined) {
    if (
      typeof candidate.metadata !== 'object' ||
      candidate.metadata === null ||
      Array.isArray(candidate.metadata)
    ) {
      addError('metadata', 'Document "metadata" must be a plain object.');
    } else if (!isJSONValue(candidate.metadata)) {
      addError(
        'metadata',
        'Document "metadata" contains non-JSON serializable values or circular references.',
      );
    }
  }

  // 3. Validate root node
  if (!candidate.root || typeof candidate.root !== 'object' || Array.isArray(candidate.root)) {
    addError('root', 'Document must have a valid "root" node object.');
    return {
      valid: false,
      errors: details.map((d) => `[${d.path}] ${d.message}`),
      details: Object.freeze(details),
    };
  }

  // 4. Validate recursive node structure
  function validateNode(node: unknown, path: string, ancestors = new Set<object>()) {
    if (!node || typeof node !== 'object' || Array.isArray(node)) {
      addError(path, 'Node must be a valid non-null object.');
      return;
    }

    if (ancestors.has(node as object)) {
      addError(path, 'Circular node reference detected in document tree hierarchy.');
      return;
    }
    const currentAncestors = new Set(ancestors);
    currentAncestors.add(node as object);

    const candidateNode = node as Partial<IRichNode>;

    // Validate ID
    if (
      !candidateNode.id ||
      typeof candidateNode.id !== 'string' ||
      candidateNode.id.trim() === ''
    ) {
      addError(`${path}.id`, 'Node must have a non-empty string "id".');
    } else if (seenIds.has(candidateNode.id)) {
      addError(
        `${path}.id`,
        `Duplicate NodeId detected: "${candidateNode.id}". Every node must have a globally unique ID.`,
      );
    } else {
      seenIds.add(candidateNode.id);
    }

    // Validate Type
    if (
      !candidateNode.type ||
      typeof candidateNode.type !== 'string' ||
      candidateNode.type.trim() === ''
    ) {
      addError(`${path}.type`, 'Node must have a non-empty string "type".');
    }

    // Validate Props
    if (candidateNode.props === undefined) {
      addError(`${path}.props`, 'Node must have a "props" object (cannot be undefined).');
    } else if (
      typeof candidateNode.props !== 'object' ||
      candidateNode.props === null ||
      Array.isArray(candidateNode.props)
    ) {
      addError(`${path}.props`, 'Node "props" must be a plain object.');
    } else if (!isJSONValue(candidateNode.props)) {
      addError(
        `${path}.props`,
        'Node "props" contains non-JSON serializable values (functions, undefined, circular references).',
      );
    }

    // Validate Meta if present
    if (candidateNode.meta !== undefined) {
      if (
        typeof candidateNode.meta !== 'object' ||
        candidateNode.meta === null ||
        Array.isArray(candidateNode.meta)
      ) {
        addError(`${path}.meta`, 'Node "meta" must be a plain object.');
      } else if (!isJSONValue(candidateNode.meta)) {
        addError(`${path}.meta`, 'Node "meta" contains non-JSON serializable values.');
      }
    }

    // Validate Children
    if (candidateNode.children !== undefined) {
      if (!Array.isArray(candidateNode.children)) {
        addError(`${path}.children`, 'Node "children" must be an array.');
      } else {
        for (let i = 0; i < candidateNode.children.length; i++) {
          validateNode(candidateNode.children[i], `${path}.children[${i}]`, currentAncestors);
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
          `${path}.slots`,
          'Node "slots" must be a record mapping slot names to node arrays.',
        );
      } else {
        for (const [slotName, slotNodes] of Object.entries(candidateNode.slots)) {
          if (!Array.isArray(slotNodes)) {
            addError(`${path}.slots.${slotName}`, `Slot "${slotName}" must be an array of nodes.`);
          } else {
            for (let i = 0; i < slotNodes.length; i++) {
              validateNode(slotNodes[i], `${path}.slots.${slotName}[${i}]`, currentAncestors);
            }
          }
        }
      }
    }
  }

  validateNode(candidate.root, 'root');

  return {
    valid: details.length === 0,
    errors: Object.freeze(details.map((d) => `[${d.path}] ${d.message}`)),
    details: Object.freeze(details),
  };
}
