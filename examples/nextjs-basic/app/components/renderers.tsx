/**
 * React renderers for Next.js reference example components.
 * Composes @irich/editorial renderers with Next.js specific components.
 * Fully compatible with Next.js SSR / Server Components and @irich/renderer.
 */

import React from 'react';
import type { ComponentMap, ComponentRenderer, NodeRendererProps } from '@irich/renderer';
import {
  createEditorialComponentMap,
  ButtonRenderer,
  CardRenderer,
  ContainerRenderer,
  HeadingRenderer,
  RichTextRenderer,
  ImageRenderer,
  CalloutRenderer,
  QuoteRenderer,
  KeyTakeawayRenderer,
  CardGridRenderer,
  CTARenderer,
  SectionRenderer,
  ColumnsRenderer,
  ColumnRenderer,
} from '@irich/editorial';

export {
  ButtonRenderer,
  CardRenderer,
  ContainerRenderer,
  HeadingRenderer,
  RichTextRenderer,
  ImageRenderer,
  CalloutRenderer,
  QuoteRenderer,
  KeyTakeawayRenderer,
  CardGridRenderer,
  CTARenderer,
  SectionRenderer,
  ColumnsRenderer,
  ColumnRenderer,
};

// --- HERO RENDERER ---

export const HeroRenderer: ComponentRenderer<{
  badge?: string;
  title?: string;
  subtitle?: string;
  align?: string;
  ctaText?: string;
  ctaUrl?: string;
  secondaryCtaText?: string;
  secondaryCtaUrl?: string;
}> = ({
  badge = '✦ iRich for Next.js',
  title = 'Visual Page Composition',
  subtitle = '',
  align = 'center',
  ctaText = 'Open Visual Editor',
  ctaUrl = '/editor',
  secondaryCtaText = '',
  secondaryCtaUrl = '#',
  dir,
  lang,
}: NodeRendererProps<{
  badge?: string;
  title?: string;
  subtitle?: string;
  align?: string;
  ctaText?: string;
  ctaUrl?: string;
  secondaryCtaText?: string;
  secondaryCtaUrl?: string;
}>) => {
  const isLeft = align === 'left';

  return (
    <section
      className={`sample-hero ${isLeft ? 'sample-hero-left' : 'sample-hero-center'}`}
      dir={dir}
      lang={lang}
    >
      <div className="sample-hero-content">
        {badge && (
          <div className="sample-hero-badge-wrap">
            <span className="sample-hero-badge">{badge}</span>
          </div>
        )}
        <h1 className="sample-hero-title">{title}</h1>
        {subtitle && <p className="sample-hero-subtitle">{subtitle}</p>}
        <div className="sample-hero-actions">
          {ctaText && (
            <a
              href={ctaUrl}
              className="irich-editorial-btn irich-editorial-btn-primary irich-editorial-btn-lg"
            >
              {ctaText}
            </a>
          )}
          {secondaryCtaText && (
            <a
              href={secondaryCtaUrl}
              className="irich-editorial-btn irich-editorial-btn-secondary irich-editorial-btn-lg"
            >
              {secondaryCtaText}
            </a>
          )}
        </div>
      </div>
    </section>
  );
};

/**
 * Creates the Next.js component mapping, extending canonical @irich/editorial renderers.
 */
export function createNextjsComponentMap(): ComponentMap {
  return createEditorialComponentMap({
    Hero: HeroRenderer,
  });
}

export const nextjsComponentMap: ComponentMap = createNextjsComponentMap();
export const nextjsRenderers: ComponentMap = nextjsComponentMap;
