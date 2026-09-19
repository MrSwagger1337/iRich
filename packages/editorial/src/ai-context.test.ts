import { describe, it, expect } from 'vitest';
import { generateDocumentAIContext } from '@irich/core';
import { createEditorialRegistry } from './definitions';
import { flatArticleDocument } from './fixtures/article-redesign';

describe('@irich/editorial AI Context Generation', () => {
  const registry = createEditorialRegistry();

  it('generates rich schema and guidance for all editorial components', () => {
    const aiContext = generateDocumentAIContext(flatArticleDocument, { registry });

    // Verify AI prompt structure
    expect(aiContext).toContain('# iRich Document Assistant');
    expect(aiContext).toContain('## Available Component Types (14 Registered)');

    // Verify component descriptions distinguish structural intent
    expect(aiContext).toContain('Component: "Callout"');
    expect(aiContext).toContain('Contextual aside, notice, or highlighted supporting information');

    expect(aiContext).toContain('Component: "KeyTakeaway"');
    expect(aiContext).toContain('Concise central lesson, high-value finding, or core editorial summary');

    expect(aiContext).toContain('Component: "CTA"');
    expect(aiContext).toContain('Action-oriented concluding or promotional region');

    expect(aiContext).toContain('Component: "Columns"');
    expect(aiContext).toContain('Two-column editorial layout block. Must contain exactly two Column children');

    expect(aiContext).toContain('Component: "CardGrid"');
    expect(aiContext).toContain('Allowed Direct Children');
    expect(aiContext).toContain('["Card"]');

    expect(aiContext).toContain('Component: "Button"');
    expect(aiContext).toContain('Published link styled as a button. Navigates to a target URL');

    // Verify canonical JSON is attached
    expect(aiContext).toContain('## Current Canonical Document JSON');
    expect(aiContext).toContain('"The Future of Web Content Architecture"');
  });
});
