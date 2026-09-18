'use client';

import type { DocSection } from '../docs/types';

export function TableOfContents({ sections }: { sections: DocSection[] }) {
  if (!sections || sections.length === 0) return null;

  return (
    <aside className="docs-toc">
      <div className="docs-toc-title">On This Page</div>
      <nav>
        {sections.map((section) => (
          <a key={section.id} href={`#${section.id}`} className="docs-toc-link">
            {section.title}
          </a>
        ))}
      </nav>
    </aside>
  );
}
