/**
 * Production and canvas component renderers for React + Vite example.
 * Composes canonical @irich/editorial renderers with custom application components.
 */

import type { FC } from 'react';
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

interface HeroProps {
  badge?: string;
  title?: string;
  subtitle?: string;
  ctaText?: string;
  ctaUrl?: string;
}

export const HeroRenderer: FC<HeroProps> = ({
  badge,
  title,
  subtitle,
  ctaText,
  ctaUrl,
}) => {
  return (
    <div className="sample-hero">
      {badge && <span className="sample-hero-badge">{badge}</span>}
      {title && <h1 className="sample-hero-title">{title}</h1>}
      {subtitle && <p className="sample-hero-subtitle">{subtitle}</p>}
      {ctaText && (
        <div style={{ marginTop: '1.5rem' }}>
          <a
            href={ctaUrl || '#'}
            className="irich-editorial-btn irich-editorial-btn-primary irich-editorial-btn-lg"
          >
            {ctaText}
          </a>
        </div>
      )}
    </div>
  );
};

/**
 * Creates the component map for Vite, extending @irich/editorial component renderers.
 */
export const viteRenderers = createEditorialComponentMap({
  Hero: HeroRenderer,
});
