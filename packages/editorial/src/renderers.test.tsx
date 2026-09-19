import { describe, it, expect } from 'vitest';
import { renderToString } from 'react-dom/server';
import { IRichRenderer } from '@irich/renderer';
import type { IRichDocument } from '@irich/core';
import { createEditorialComponentMap } from './renderers';
import { redesignedEditorialDocument, arabicEditorialDocument } from './fixtures/article-redesign';

describe('@irich/editorial React Component Renderers (SSR / IRichRenderer)', () => {
  const components = createEditorialComponentMap();

  it('renders redesigned editorial document to HTML without errors', () => {
    const html = renderToString(
      <IRichRenderer document={redesignedEditorialDocument} components={components} />
    );

    expect(html).toContain('The Future of Web Content Architecture');
    expect(html).toContain('data-irich-editorial="section"');
    expect(html).toContain('data-irich-editorial="columns"');
    expect(html).toContain('data-irich-editorial="column"');
    expect(html).toContain('data-irich-editorial="image"');
    expect(html).toContain('data-irich-editorial="callout"');
    expect(html).toContain('data-irich-editorial="quote"');
    expect(html).toContain('data-irich-editorial="takeaway"');
    expect(html).toContain('data-irich-editorial="card-grid"');
    expect(html).toContain('data-irich-editorial="card"');
    expect(html).toContain('data-irich-editorial="cta"');
    expect(html).toContain('data-irich-editorial="button"');

    // Semantic HTML tags
    expect(html).toContain('<blockquote');
    expect(html).toContain('<cite');
    expect(html).toContain('<aside');
    expect(html).toContain('<figure');
    expect(html).toContain('<figcaption');
    expect(html).toContain('<a');
    expect(html).toContain('href="/editor"');
  });

  it('renders Arabic editorial document with RTL attributes and semantic tags', () => {
    const html = renderToString(
      <IRichRenderer document={arabicEditorialDocument} components={components} />
    );

    expect(html).toContain('مستقبل بنية المحتوى الرقمي والتحرير المرئي');
    expect(html).toContain('dir="rtl"');
    expect(html).toContain('lang="ar"');
    expect(html).toContain('الخلاصة التحريرية المركزية');
    expect(html).toContain('تيم بيرنرز لي');
  });

  it('defensively sanitizes unsafe URLs during rendering', () => {
    const docWithUnsafeUrl: IRichDocument = {
      version: '1.0.0',
      root: {
        id: 'root',
        type: 'root',
        props: {},
        children: [
          {
            id: 'btn-bad',
            type: 'Button',
            props: {
              label: 'Unsafe Link',
              href: 'javascript:alert(1)',
            },
          },
          {
            id: 'img-bad',
            type: 'Image',
            props: {
              src: 'javascript:void(0)',
              alt: 'Bad image',
            },
          },
        ],
      },
    };

    const html = renderToString(
      <IRichRenderer document={docWithUnsafeUrl} components={components} />
    );

    // Defense-in-depth sanitization renders safe fallback
    expect(html).not.toContain('javascript:alert(1)');
    expect(html).toContain('href="#"');
    expect(html).toContain('No image source specified');
  });
});
