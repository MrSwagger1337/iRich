/**
 * React renderers for Vite example components.
 */

import type { ComponentRenderer, NodeRendererProps } from '@irich/renderer';
import {
  IRichTextRenderer,
  isRichTextDocument,
  type RichTextDocument,
} from '@irich/rich-text';

export const HeroRenderer: ComponentRenderer<{
  badge?: string;
  title?: string;
  subtitle?: string;
  primaryActionText?: string;
  primaryActionUrl?: string;
}> = ({
  node,
  badge = (node.props.badge as string) || '⚡ Built with React + Vite',
  title = (node.props.title as string) || 'Vite Visual Editing',
  subtitle = (node.props.subtitle as string) || '',
  primaryActionText = (node.props.primaryActionText as string) || 'Get Started',
  primaryActionUrl = (node.props.primaryActionUrl as string) || '#',
}: NodeRendererProps<{
  badge?: string;
  title?: string;
  subtitle?: string;
  primaryActionText?: string;
  primaryActionUrl?: string;
}>) => {
  return (
    <section className="vite-hero">
      <div className="vite-hero-glow" />
      <div className="vite-hero-content">
        {badge && <div className="vite-badge">{badge}</div>}
        <h1 className="vite-hero-title">{title}</h1>
        {subtitle && <p className="vite-hero-subtitle">{subtitle}</p>}
        {primaryActionText && (
          <div style={{ marginTop: '1.5rem' }}>
            <a href={primaryActionUrl} className="vite-btn vite-btn-primary">
              {primaryActionText}
            </a>
          </div>
        )}
      </div>
    </section>
  );
};

export const CardRenderer: ComponentRenderer<{
  title?: string;
  description?: string;
  tag?: string;
}> = ({
  node,
  title = (node.props.title as string) || 'Feature Title',
  description = (node.props.description as string) || '',
  tag = (node.props.tag as string) || '',
}: NodeRendererProps<{
  title?: string;
  description?: string;
  tag?: string;
}>) => {
  return (
    <div className="vite-card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
        <div style={{ fontWeight: 700, fontSize: '1.125rem', color: '#f8fafc' }}>{title}</div>
        {tag && <span className="vite-card-tag">{tag}</span>}
      </div>
      {description && <p style={{ color: '#94a3b8', fontSize: '0.9375rem', lineHeight: 1.6 }}>{description}</p>}
    </div>
  );
};

export const AlertRenderer: ComponentRenderer<{
  message?: string;
  type?: string;
}> = ({
  node,
  message = (node.props.message as string) || 'Notification',
  type = (node.props.type as string) || 'info',
}: NodeRendererProps<{
  message?: string;
  type?: string;
}>) => {
  return (
    <div className={`vite-alert vite-alert-${type}`}>
      <span style={{ marginRight: '8px' }}>
        {type === 'success' ? '✓' : type === 'warning' ? '⚠' : 'ℹ'}
      </span>
      <span>{message}</span>
    </div>
  );
};

export const HeadingRenderer: ComponentRenderer<{
  text?: string;
  level?: string;
  align?: string;
}> = ({
  node,
  text = (node.props.text as string) || 'Heading Text',
  level = (node.props.level as string) || 'h2',
  align = (node.props.align as string) || 'left',
}: NodeRendererProps<{
  text?: string;
  level?: string;
  align?: string;
}>) => {
  const className = `vite-heading vite-heading-${level} vite-align-${align}`;

  switch (level) {
    case 'h1':
      return <h1 className={className}>{text}</h1>;
    case 'h3':
      return <h3 className={className}>{text}</h3>;
    case 'h2':
    default:
      return <h2 className={className}>{text}</h2>;
  }
};

export const RichTextRenderer: ComponentRenderer<{
  placeholder?: string;
}> = ({ node, placeholder }: NodeRendererProps<{ placeholder?: string }>) => {
  const rawContent = node.props.content;

  if (isRichTextDocument(rawContent)) {
    return (
      <div className="vite-richtext">
        <IRichTextRenderer content={rawContent as RichTextDocument} />
      </div>
    );
  }

  if (typeof rawContent === 'string' && rawContent.trim()) {
    return (
      <div className="vite-richtext">
        <p>{rawContent}</p>
      </div>
    );
  }

  return (
    <div className="vite-richtext" style={{ fontStyle: 'italic', color: '#64748b' }}>
      {placeholder || (node.props.placeholder as string) || 'Empty Rich Text'}
    </div>
  );
};

export const ButtonRenderer: ComponentRenderer<{
  label?: string;
  url?: string;
  variant?: string;
}> = ({
  node,
  label = (node.props.label as string) || 'Button',
  url = (node.props.url as string) || '#',
  variant = (node.props.variant as string) || 'primary',
}: NodeRendererProps<{
  label?: string;
  url?: string;
  variant?: string;
}>) => {
  return (
    <a href={url} className={`vite-btn vite-btn-${variant}`}>
      {label}
    </a>
  );
};

export const ContainerRenderer: ComponentRenderer<{
  maxWidth?: string;
  padding?: string;
  background?: string;
}> = ({
  node,
  children,
  maxWidth = (node.props.maxWidth as string) || 'wide',
  padding = (node.props.padding as string) || 'medium',
  background = (node.props.background as string) || 'transparent',
}: NodeRendererProps<{
  maxWidth?: string;
  padding?: string;
  background?: string;
}>) => {
  return (
    <div className={`vite-container vite-max-w-${maxWidth} vite-pad-${padding} vite-bg-${background}`}>
      {children}
    </div>
  );
};

export const viteRenderers = {
  Hero: HeroRenderer,
  Card: CardRenderer,
  Alert: AlertRenderer,
  Heading: HeadingRenderer,
  RichText: RichTextRenderer,
  Button: ButtonRenderer,
  Container: ContainerRenderer,
};
