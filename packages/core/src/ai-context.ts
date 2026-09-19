/**
 * @irich/core
 * Headless AI Context Generator for external AI round-trip workflows.
 * Builds structured prompts and schema summaries derived directly from the ComponentRegistry.
 * Zero browser or DOM runtime dependencies.
 */

import type { ComponentRegistry } from './component/registry';
import { formatDocumentJSON } from './json';
import type { IRichDocument } from './types';

export interface GenerateAIContextOptions {
  /**
   * Optional ComponentRegistry providing registered component definitions, field schemas,
   * slots, and placement rules.
   */
  readonly registry?: ComponentRegistry;

  /**
   * Optional custom task instructions or prompt guidance.
   */
  readonly instructions?: string;
}

/**
 * Generates a comprehensive, structured text context suitable for copying and sending to
 * an external AI model (e.g., ChatGPT, Claude, Gemini).
 *
 * It combines:
 * 1. Operational guidelines and strict structural invariants.
 * 2. Complete schema summary of all registered components derived faithfully from the ComponentRegistry.
 * 3. Canonical JSON of the current document.
 *
 * @param document - Current canonical iRich document.
 * @param options - Generation options including the active ComponentRegistry.
 * @returns Formatted prompt text for external AI agents.
 */
export function generateDocumentAIContext(
  document: IRichDocument,
  options: GenerateAIContextOptions = {},
): string {
  const { registry, instructions } = options;

  const sections: string[] = [];

  // 1. Role & Objective
  sections.push(
    '# iRich Document Assistant — Content Redesign & Restructuring Context',
    '',
    'You are an expert editorial designer and content architect working with the iRich visual content editor.',
    'Your goal is to restructure, redesign, or improve the following document while adhering strictly to the iRich canonical JSON document model.',
  );

  if (instructions && instructions.trim() !== '') {
    sections.push('', '## Task Instructions', instructions.trim());
  }

  // 2. Strict Constraints
  sections.push(
    '',
    '## Strict Structural & Architectural Rules',
    '1. Return ONLY a single, strictly valid iRich document in standard JSON format.',
    '2. DO NOT output JSX elements, HTML markup, React components, JavaScript code, or CSS stylesheet blocks.',
    '3. Every node MUST have a unique string "id" (e.g., "section-1", "heading-intro", "card-features-1").',
    '4. Every node MUST use a registered component "type" listed in the Available Component Types section below. Never invent component types.',
    '5. Every node "props" MUST be a plain object matching the component\'s declared field schema.',
    '6. The top-level document MUST have a "version" string (e.g. "1.0.0"), optional "metadata" object, and a single "root" node.',
    '7. The "root" node MUST have id="root", type="root", props={}, and a "children" array.',
    '8. Multilingual & Direction metadata: Set "metadata.locale" (e.g. "ar", "en", "fr") and "metadata.direction" ("ltr" | "rtl" | "auto") appropriately. Individual nodes may declare "meta": { "dir": "ltr" | "rtl" | "auto", "lang": "string" } for localized direction overrides (e.g. an English quote in an Arabic article).',
  );

  // 3. Registered Component Schemas (if registry provided)
  if (registry) {
    const components = registry.getAll();
    sections.push('', `## Available Component Types (${components.length} Registered)`);

    if (components.length === 0) {
      sections.push('No custom components registered. Use standard structural layout nodes.');
    } else {
      for (const comp of components) {
        sections.push('', `### Component: "${comp.type}"`);
        if (comp.label) sections.push(`- **Label**: ${comp.label}`);
        if (comp.category) sections.push(`- **Category**: ${comp.category}`);
        if (comp.description) sections.push(`- **Description**: ${comp.description}`);

        // Field schemas
        if (comp.fields && Object.keys(comp.fields).length > 0) {
          sections.push('- **Fields (props)**:');
          for (const [fieldName, fieldDef] of Object.entries(comp.fields)) {
            const details: string[] = [`type: \`${fieldDef.type}\``];
            if (fieldDef.label) details.push(`label: "${fieldDef.label}"`);
            if (fieldDef.defaultValue !== undefined) {
              details.push(`default: ${JSON.stringify(fieldDef.defaultValue)}`);
            }
            if (fieldDef.type === 'select' && 'options' in fieldDef && Array.isArray(fieldDef.options)) {
              const opts = fieldDef.options.map((o) => `"${o.value}"`).join(', ');
              details.push(`options: [${opts}]`);
            }
            if (fieldDef.type === 'number') {
              if ('min' in fieldDef && fieldDef.min !== undefined) details.push(`min: ${fieldDef.min}`);
              if ('max' in fieldDef && fieldDef.max !== undefined) details.push(`max: ${fieldDef.max}`);
              if ('unit' in fieldDef && fieldDef.unit) details.push(`unit: "${fieldDef.unit}"`);
            }
            sections.push(`  - \`${fieldName}\` (${details.join(', ')})`);
          }
        } else {
          sections.push('- **Fields (props)**: None declared (pass `{}`)');
        }

        // Slot declarations
        if (comp.slots && Object.keys(comp.slots).length > 0) {
          sections.push('- **Named Slots (`slots: { ... }`)**:');
          for (const [slotName, slotDef] of Object.entries(comp.slots)) {
            const slotDetails: string[] = [];
            if (slotDef.label) slotDetails.push(`label: "${slotDef.label}"`);
            if (slotDef.maxChildren !== undefined) slotDetails.push(`maxChildren: ${slotDef.maxChildren}`);
            if (slotDef.allowedTypes && slotDef.allowedTypes.length > 0) {
              slotDetails.push(`allowedTypes: [${slotDef.allowedTypes.map((t: string) => `"${t}"`).join(', ')}]`);
            }
            sections.push(`  - \`${slotName}\` (${slotDetails.join(', ') || 'array of child nodes'})`);
          }
        }


        // Allowed children / parents
        if (comp.allowedChildren && comp.allowedChildren.length > 0) {
          sections.push(`- **Allowed Direct Children**: [${comp.allowedChildren.map((t) => `"${t}"`).join(', ')}]`);
        }
        if (comp.allowedParents && comp.allowedParents.length > 0) {
          sections.push(`- **Allowed Parents**: [${comp.allowedParents.map((t) => `"${t}"`).join(', ')}]`);
        }
      }
    }
  }

  // 4. Current Document JSON
  sections.push(
    '',
    '## Current Canonical Document JSON',
    '```json',
    formatDocumentJSON(document, { indent: 2 }),
    '```',
    '',
    '## Response Requirement',
    'Respond ONLY with the updated JSON document. Ensure all JSON syntax is valid, all node IDs are unique, and all component types and properties conform to the schemas above.',
  );

  return sections.join('\n');
}
