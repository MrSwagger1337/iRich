/**
 * React renderers for Next.js reference example components.
 * Fully compatible with Next.js SSR / Server Components and @irich/renderer.
 */

import React from 'react';
import type { ComponentMap, ComponentRenderer, NodeRendererProps } from '@irich/renderer';
import {
  IRichTextRenderer,
  type RichTextDocument,
} from '@irich/rich-text';

// --- 1. HERO RENDERER ---

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
      className={`irich-hero ${isLeft ? 'irich-hero-align-left' : 'irich-hero-align-center'}`}
      dir={dir}
      lang={lang}
    >
      <div className="irich-hero-glow" />
      <div className="irich-hero-content">
        {badge && (
          <div className="irich-hero-badge">
            <span className="irich-hero-badge-pill">{badge}</span>
          </div>
        )}
        <h1 className="irich-hero-title">{title}</h1>
        {subtitle && <p className="irich-hero-subtitle">{subtitle}</p>}
        {(ctaText || secondaryCtaText) && (
          <div className="irich-hero-actions">
            {ctaText && (
              <a href={ctaUrl} className="irich-btn irich-btn-primary irich-btn-lg">
                {ctaText}
              </a>
            )}
            {secondaryCtaText && (
              <a href={secondaryCtaUrl} className="irich-btn irich-btn-outline irich-btn-lg">
                {secondaryCtaText}
              </a>
            )}
          </div>
        )}
      </div>
    </section>
  );
};

// --- 2. HEADING RENDERER ---

export const HeadingRenderer: ComponentRenderer<{
  text?: string;
  level?: string;
  align?: string;
  color?: string;
}> = ({
  text = 'Heading Text',
  level = 'h2',
  align = 'left',
  color = 'default',
  dir,
  lang,
}: NodeRendererProps<{
  text?: string;
  level?: string;
  align?: string;
  color?: string;
}>) => {
  const className = `irich-heading irich-heading-${level} irich-align-${align} irich-heading-color-${color}`;

  switch (level) {
    case 'h1':
      return <h1 className={className} dir={dir} lang={lang}>{text}</h1>;
    case 'h3':
      return <h3 className={className} dir={dir} lang={lang}>{text}</h3>;
    case 'h4':
      return <h4 className={className} dir={dir} lang={lang}>{text}</h4>;
    case 'h2':
    default:
      return <h2 className={className} dir={dir} lang={lang}>{text}</h2>;
  }
};

// --- 3. RICH TEXT RENDERER ---

export const RichTextRenderer: ComponentRenderer<{
  content?: RichTextDocument | string;
  placeholder?: string;
}> = ({
  content,
  placeholder = 'Click to format rich text...',
  dir,
  lang,
}: NodeRendererProps<{
  content?: RichTextDocument | string;
  placeholder?: string;
}>) => {
  if (!content) {
    return (
      <div className="irich-richtext-wrapper irich-richtext-empty" dir={dir} lang={lang}>
        <p style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>
          {placeholder}
        </p>
      </div>
    );
  }

  return (
    <div className="irich-richtext-wrapper" dir={dir} lang={lang}>
      <IRichTextRenderer content={content} dir={dir} lang={lang} />
    </div>
  );
};

// --- 4. CONTAINER RENDERER ---

export const ContainerRenderer: ComponentRenderer<{
  maxWidth?: string;
  padding?: string;
  background?: string;
}> = ({
  children,
  maxWidth = 'wide',
  padding = 'medium',
  background = 'transparent',
  dir,
  lang,
}: NodeRendererProps<{
  maxWidth?: string;
  padding?: string;
  background?: string;
}>) => {
  return (
    <section
      className={`irich-container irich-max-w-${maxWidth} irich-pad-${padding} irich-bg-${background}`}
      dir={dir}
      lang={lang}
    >
      <div className="irich-container-inner">
        {children}
      </div>
    </section>
  );
};

// --- 5. CARD RENDERER ---

export const CardRenderer: ComponentRenderer<{
  tag?: string;
  title?: string;
  description?: string;
  variant?: string;
  buttonText?: string;
  buttonUrl?: string;
}> = ({
  tag = '',
  title = 'Feature Title',
  description = '',
  variant = 'default',
  buttonText = '',
  buttonUrl = '#',
  dir,
  lang,
}: NodeRendererProps<{
  tag?: string;
  title?: string;
  description?: string;
  variant?: string;
  buttonText?: string;
  buttonUrl?: string;
}>) => {
  return (
    <div className={`irich-card irich-card-variant-${variant}`} dir={dir} lang={lang}>
      <div className="irich-card-header">
        {tag && <span className="irich-card-tag">{tag}</span>}
      </div>
      <h3 className="irich-card-title">{title}</h3>
      {description && <p className="irich-card-desc">{description}</p>}
      {buttonText && (
        <div style={{ marginTop: '1.25rem' }}>
          <a href={buttonUrl} className="irich-btn irich-btn-secondary irich-btn-sm">
            {buttonText} →
          </a>
        </div>
      )}
    </div>
  );
};

// --- 6. BUTTON RENDERER ---

export const ButtonRenderer: ComponentRenderer<{
  label?: string;
  url?: string;
  variant?: string;
  size?: string;
}> = ({
  label = 'Button',
  url = '#',
  variant = 'primary',
  size = 'md',
  dir,
  lang,
}: NodeRendererProps<{
  label?: string;
  url?: string;
  variant?: string;
  size?: string;
}>) => {
  return (
    <a href={url} className={`irich-btn irich-btn-${variant} irich-btn-${size}`} dir={dir} lang={lang}>
      {label}
    </a>
  );
};

/**
 * Component mapping for @irich/renderer.
 */
export const nextjsRenderers: ComponentMap = {
  Hero: HeroRenderer,
  Heading: HeadingRenderer,
  RichText: RichTextRenderer,
  Container: ContainerRenderer,
  Card: CardRenderer,
  Button: ButtonRenderer,
};
