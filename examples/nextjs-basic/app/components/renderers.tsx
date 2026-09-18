/**
 * React renderers for Next.js example components.
 * Fully compatible with Next.js SSR / Server Components and @irich/renderer.
 */

import React from 'react';
import type { ComponentRenderer, NodeRendererProps } from '@irich/renderer';
import {
  IRichTextRenderer,
  isRichTextDocument,
  type RichTextDocument,
} from '@irich/rich-text';

// --- ICONS HELPER ---

function renderIcon(name?: string) {
  switch (name) {
    case 'zap':
      return (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
        </svg>
      );
    case 'shield':
      return (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        </svg>
      );
    case 'layers':
      return (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="12 2 2 7 12 12 22 7 12 2" />
          <polyline points="2 17 12 22 22 17" />
          <polyline points="2 12 12 17 22 12" />
        </svg>
      );
    case 'code':
      return (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="16 18 22 12 16 6" />
          <polyline points="8 6 2 12 8 18" />
        </svg>
      );
    case 'database':
      return (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <ellipse cx="12" cy="5" rx="9" ry="3" />
          <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
          <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
        </svg>
      );
    case 'sparkles':
    default:
      return (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
          <path d="M5 3v4" />
          <path d="M19 17v4" />
          <path d="M3 5h4" />
          <path d="M17 19h4" />
        </svg>
      );
  }
}

// --- 1. HERO RENDERER ---

export const HeroRenderer: ComponentRenderer<{
  badge?: string;
  title?: string;
  subtitle?: string;
  align?: string;
  primaryCtaText?: string;
  primaryCtaUrl?: string;
  secondaryCtaText?: string;
  secondaryCtaUrl?: string;
}> = (props: NodeRendererProps<{
  badge?: string;
  title?: string;
  subtitle?: string;
  align?: string;
  primaryCtaText?: string;
  primaryCtaUrl?: string;
  secondaryCtaText?: string;
  secondaryCtaUrl?: string;
}>) => {
  const badge = props.badge || (props.node.props.badge as string) || '✦ iRich for Next.js';
  const title = props.title || (props.node.props.title as string) || 'Visual Page Composition';
  const subtitle = props.subtitle || (props.node.props.subtitle as string) || '';
  const align = props.align || (props.node.props.align as string) || 'center';
  const primaryCtaText = props.primaryCtaText || (props.node.props.primaryCtaText as string) || 'Open Visual Editor';
  const primaryCtaUrl = props.primaryCtaUrl || (props.node.props.primaryCtaUrl as string) || '/editor';
  const secondaryCtaText = props.secondaryCtaText || (props.node.props.secondaryCtaText as string) || 'Explore Components';
  const secondaryCtaUrl = props.secondaryCtaUrl || (props.node.props.secondaryCtaUrl as string) || '#features';

  return (
    <section className={`irich-hero irich-hero-align-${align}`}>
      <div className="irich-hero-glow" />
      <div className="irich-hero-content">
        {badge && (
          <div className="irich-hero-badge">
            <span className="irich-hero-badge-pill">{badge}</span>
          </div>
        )}
        <h1 className="irich-hero-title">{title}</h1>
        {subtitle && <p className="irich-hero-subtitle">{subtitle}</p>}
        <div className="irich-hero-actions">
          {primaryCtaText && (
            <a href={primaryCtaUrl} className="irich-btn irich-btn-primary irich-btn-lg">
              {primaryCtaText}
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: '6px' }}>
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </a>
          )}
          {secondaryCtaText && (
            <a href={secondaryCtaUrl} className="irich-btn irich-btn-outline irich-btn-lg">
              {secondaryCtaText}
            </a>
          )}
        </div>
      </div>
    </section>
  );
};

// --- 2. FEATURES GRID RENDERER ---

export const FeaturesRenderer: ComponentRenderer<{
  sectionTitle?: string;
  sectionSubtitle?: string;
  columns?: string;
  align?: string;
}> = ({
  node,
  children,
  sectionTitle = node.props.sectionTitle as string,
  sectionSubtitle = node.props.sectionSubtitle as string,
  columns = (node.props.columns as string) || '3',
  align = (node.props.align as string) || 'center',
}: NodeRendererProps<{
  sectionTitle?: string;
  sectionSubtitle?: string;
  columns?: string;
  align?: string;
}>) => {
  return (
    <section id="features" className="irich-features-section">
      {(sectionTitle || sectionSubtitle) && (
        <div className={`irich-section-header irich-align-${align}`}>
          {sectionTitle && <h2 className="irich-section-title">{sectionTitle}</h2>}
          {sectionSubtitle && <p className="irich-section-subtitle">{sectionSubtitle}</p>}
        </div>
      )}
      <div className={`irich-features-grid irich-grid-cols-${columns}`}>
        {children}
      </div>
    </section>
  );
};

// --- 3. FEATURE CARD RENDERER ---

export const FeatureCardRenderer: ComponentRenderer<{
  icon?: string;
  title?: string;
  description?: string;
  tag?: string;
  color?: string;
}> = ({
  node,
  icon = (node.props.icon as string) || 'sparkles',
  title = (node.props.title as string) || 'Feature Title',
  description = (node.props.description as string) || '',
  tag = (node.props.tag as string) || '',
  color = (node.props.color as string) || 'indigo',
}: NodeRendererProps<{
  icon?: string;
  title?: string;
  description?: string;
  tag?: string;
  color?: string;
}>) => {
  return (
    <div className={`irich-feature-card irich-card-color-${color}`}>
      <div className="irich-feature-card-header">
        <div className="irich-feature-card-icon">
          {renderIcon(icon)}
        </div>
        {tag && <span className="irich-feature-card-tag">{tag}</span>}
      </div>
      <h3 className="irich-feature-card-title">{title}</h3>
      {description && <p className="irich-feature-card-desc">{description}</p>}
    </div>
  );
};

// --- 4. CTA BANNER RENDERER ---

export const CTARenderer: ComponentRenderer<{
  headline?: string;
  description?: string;
  buttonText?: string;
  buttonUrl?: string;
  variant?: string;
}> = ({
  node,
  headline = (node.props.headline as string) || 'Ready to Build?',
  description = (node.props.description as string) || '',
  buttonText = (node.props.buttonText as string) || 'Get Started',
  buttonUrl = (node.props.buttonUrl as string) || '/editor',
  variant = (node.props.variant as string) || 'gradient',
}: NodeRendererProps<{
  headline?: string;
  description?: string;
  buttonText?: string;
  buttonUrl?: string;
  variant?: string;
}>) => {
  return (
    <div className={`irich-cta-banner irich-cta-${variant}`}>
      <div className="irich-cta-glow" />
      <div className="irich-cta-content">
        <h2 className="irich-cta-headline">{headline}</h2>
        {description && <p className="irich-cta-description">{description}</p>}
        {buttonText && (
          <a href={buttonUrl} className="irich-btn irich-btn-primary irich-btn-lg">
            {buttonText}
          </a>
        )}
      </div>
    </div>
  );
};

// --- 5. HEADING RENDERER ---

export const HeadingRenderer: ComponentRenderer<{
  text?: string;
  level?: string;
  align?: string;
  color?: string;
}> = ({
  node,
  text = (node.props.text as string) || 'Heading Text',
  level = (node.props.level as string) || 'h2',
  align = (node.props.align as string) || 'left',
  color = (node.props.color as string) || 'primary',
}: NodeRendererProps<{
  text?: string;
  level?: string;
  align?: string;
  color?: string;
}>) => {
  const className = `irich-heading irich-heading-${level} irich-align-${align} irich-heading-color-${color}`;

  switch (level) {
    case 'h1':
      return <h1 className={className}>{text}</h1>;
    case 'h3':
      return <h3 className={className}>{text}</h3>;
    case 'h4':
      return <h4 className={className}>{text}</h4>;
    case 'h2':
    default:
      return <h2 className={className}>{text}</h2>;
  }
};

// --- 6. RICH TEXT RENDERER ---

export const RichTextRenderer: ComponentRenderer<{
  placeholder?: string;
}> = ({ node, placeholder }: NodeRendererProps<{ placeholder?: string }>) => {
  const rawContent = node.props.content;

  if (isRichTextDocument(rawContent)) {
    return (
      <div className="irich-richtext-wrapper">
        <IRichTextRenderer content={rawContent as RichTextDocument} />
      </div>
    );
  }

  if (typeof rawContent === 'string' && rawContent.trim()) {
    return (
      <div className="irich-richtext-wrapper">
        <p>{rawContent}</p>
      </div>
    );
  }

  return (
    <div className="irich-richtext-wrapper irich-richtext-empty">
      <p style={{ color: '#94a3b8', fontStyle: 'italic' }}>
        {placeholder || (node.props.placeholder as string) || 'Empty Rich Text Block'}
      </p>
    </div>
  );
};

// --- 7. BUTTON RENDERER ---

export const ButtonRenderer: ComponentRenderer<{
  label?: string;
  url?: string;
  variant?: string;
  size?: string;
}> = ({
  node,
  label = (node.props.label as string) || 'Button',
  url = (node.props.url as string) || '#',
  variant = (node.props.variant as string) || 'primary',
  size = (node.props.size as string) || 'md',
}: NodeRendererProps<{
  label?: string;
  url?: string;
  variant?: string;
  size?: string;
}>) => {
  return (
    <a href={url} className={`irich-btn irich-btn-${variant} irich-btn-${size}`}>
      {label}
    </a>
  );
};

// --- 8. CONTAINER RENDERER ---

export const ContainerRenderer: ComponentRenderer<{
  maxWidth?: string;
  padding?: string;
  background?: string;
  layout?: string;
}> = ({
  node,
  children,
  maxWidth = (node.props.maxWidth as string) || 'wide',
  padding = (node.props.padding as string) || 'medium',
  background = (node.props.background as string) || 'transparent',
  layout = (node.props.layout as string) || 'stack',
}: NodeRendererProps<{
  maxWidth?: string;
  padding?: string;
  background?: string;
  layout?: string;
}>) => {
  return (
    <div className={`irich-container irich-max-w-${maxWidth} irich-pad-${padding} irich-bg-${background}`}>
      <div className={`irich-container-inner irich-layout-${layout}`}>
        {children}
      </div>
    </div>
  );
};

/**
 * Component map for <IRichRenderer document={doc} components={nextjsRenderers} />
 */
export const nextjsRenderers = {
  Hero: HeroRenderer,
  Features: FeaturesRenderer,
  FeatureCard: FeatureCardRenderer,
  CTA: CTARenderer,
  Heading: HeadingRenderer,
  RichText: RichTextRenderer,
  Button: ButtonRenderer,
  Container: ContainerRenderer,
};
