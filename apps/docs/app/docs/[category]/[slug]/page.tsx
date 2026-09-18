import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import { allDocPages, getDocPage, getAdjacentPages } from '../../../docs/registry';
import { Sidebar } from '../../../components/Sidebar';
import { TableOfContents } from '../../../components/TableOfContents';
import { MarkdownRenderer } from '../../../components/MarkdownRenderer';
import { ResponsiveValueDemo } from '../../../components/InteractiveDemos';

interface PageProps {
  params: Promise<{
    category: string;
    slug: string;
  }>;
}

export async function generateStaticParams() {
  return allDocPages.map((page) => ({
    category: page.category,
    slug: page.slug,
  }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { category, slug } = await params;
  const page = getDocPage(category, slug);

  if (!page) {
    return {
      title: 'Page Not Found - iRich Documentation',
    };
  }

  return {
    title: `${page.title} - iRich Documentation`,
    description: page.description,
  };
}

export default async function DocViewPage({ params }: PageProps) {
  const { category, slug } = await params;
  const page = getDocPage(category, slug);

  if (!page) {
    notFound();
  }

  const { prev, next } = getAdjacentPages(category, slug);

  return (
    <div className="docs-layout">
      {/* 1. SIDEBAR */}
      <Sidebar />

      {/* 2. MAIN CONTENT ARTICLE */}
      <main className="docs-main-container">
        <article className="docs-article">
          <div className="docs-title-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                {page.categoryTitle}
              </span>
              {page.badge && <span className={`badge-tag badge-${page.badge}`}>{page.badge}</span>}
            </div>
            <h1 className="docs-title">{page.title}</h1>
            <p className="docs-desc">{page.description}</p>
          </div>

          {/* Markdown Content */}
          <MarkdownRenderer content={page.content} />

          {/* Interactive Demos for Specific Topics */}
          {page.slug === 'responsive' && <ResponsiveValueDemo />}

          {/* 3. PAGINATION (PREV / NEXT) */}
          <div className="docs-pagination">
            {prev ? (
              <Link href={prev.href} className="docs-page-btn" style={{ alignItems: 'flex-start' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>← Previous</span>
                <span style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.9375rem' }}>{prev.title}</span>
              </Link>
            ) : (
              <div />
            )}

            {next ? (
              <Link href={next.href} className="docs-page-btn" style={{ alignItems: 'flex-end', textAlign: 'right' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Next →</span>
                <span style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.9375rem' }}>{next.title}</span>
              </Link>
            ) : (
              <div />
            )}
          </div>
        </article>
      </main>

      {/* 4. TABLE OF CONTENTS */}
      <TableOfContents sections={page.sections} />
    </div>
  );
}
