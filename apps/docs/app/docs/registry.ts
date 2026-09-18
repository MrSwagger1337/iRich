import type { DocPage, NavCategory } from './types';
import { gettingStartedPages } from './content/getting-started';
import { coreConceptsPages } from './content/core-concepts';
import { visualEditorPages } from './content/visual-editor';
import { advancedPages } from './content/advanced';
import { apiReferencePages } from './content/api-reference';

export const allDocPages: DocPage[] = [
  ...gettingStartedPages,
  ...coreConceptsPages,
  ...visualEditorPages,
  ...advancedPages,
  ...apiReferencePages,
];

export const docsNavigation: NavCategory[] = [
  {
    id: 'getting-started',
    title: 'Getting Started',
    items: gettingStartedPages.map((p) => ({
      slug: p.slug,
      title: p.title,
      badge: p.badge,
      category: p.category,
    })),
  },
  {
    id: 'core-concepts',
    title: 'Core Concepts',
    items: coreConceptsPages.map((p) => ({
      slug: p.slug,
      title: p.title,
      badge: p.badge,
      category: p.category,
    })),
  },
  {
    id: 'visual-editor',
    title: 'Visual Editor',
    items: visualEditorPages.map((p) => ({
      slug: p.slug,
      title: p.title,
      badge: p.badge,
      category: p.category,
    })),
  },
  {
    id: 'advanced',
    title: 'Advanced',
    items: advancedPages.map((p) => ({
      slug: p.slug,
      title: p.title,
      badge: p.badge,
      category: p.category,
    })),
  },
  {
    id: 'api',
    title: 'API Reference',
    items: apiReferencePages.map((p) => ({
      slug: p.slug,
      title: p.title,
      badge: p.badge,
      category: p.category,
    })),
  },
];

export function getDocPage(category: string, slug: string): DocPage | undefined {
  return allDocPages.find((p) => p.category === category && p.slug === slug);
}

export function getAdjacentPages(category: string, slug: string): {
  prev?: { title: string; href: string };
  next?: { title: string; href: string };
} {
  const currentIndex = allDocPages.findIndex((p) => p.category === category && p.slug === slug);
  if (currentIndex === -1) return {};

  const prev = currentIndex > 0 ? allDocPages[currentIndex - 1] : undefined;
  const next = currentIndex < allDocPages.length - 1 ? allDocPages[currentIndex + 1] : undefined;

  return {
    prev: prev ? { title: prev.title, href: `/docs/${prev.category}/${prev.slug}` } : undefined,
    next: next ? { title: next.title, href: `/docs/${next.category}/${next.slug}` } : undefined,
  };
}
