/**
 * @irich/renderer
 * Example canonical document and component renderers for testing and reference.
 */

import React from 'react';
import type { IRichDocument } from '@irich/core';
import type { ComponentMap, NodeRendererProps } from './types';

/**
 * Example canonical document containing Page, Container, Hero, and Card nodes.
 */
export const exampleDocument: IRichDocument = {
  version: '1.0.0',
  metadata: {
    title: 'iRich Showcase Page',
    description: 'An example document demonstrating nested layouts and SSR rendering.',
  },
  root: {
    id: 'root-1',
    type: 'root',
    props: {},
    children: [
      {
        id: 'page-1',
        type: 'Page',
        props: {
          title: 'Welcome to iRich',
          theme: 'dark',
        },
        children: [
          {
            id: 'hero-1',
            type: 'Hero',
            props: {
              title: 'Design Without Limits',
              subtitle: 'Build visual page experiences with pure React architecture.',
              alignment: 'center',
              backgroundColor: '#0f172a',
              showButton: true,
              buttonLabel: 'Get Started',
              buttonUrl: 'https://github.com/MrSwagger1337/iRich',
            },
          },
          {
            id: 'container-1',
            type: 'Container',
            props: {
              layout: 'grid',
              columns: 3,
              gap: 20,
            },
            children: [
              {
                id: 'card-1',
                type: 'Card',
                props: {
                  title: 'Component Engine',
                  description: 'Strongly typed prop schemas with JSON-serializable documents.',
                  tag: 'Core',
                },
              },
              {
                id: 'card-2',
                type: 'Card',
                props: {
                  title: 'SSR Compatible',
                  description: 'Pure React elements with zero browser or DOM dependencies.',
                  tag: 'Performance',
                },
              },
              {
                id: 'card-3',
                type: 'Card',
                props: {
                  title: 'Plugin System',
                  description: 'Easily extend with custom field types and bespoke widgets.',
                  tag: 'Extensibility',
                },
              },
            ],
          },
        ],
      },
    ],
  },
};

/**
 * Example Page component renderer.
 */
export interface PageProps {
  title?: string;
  theme?: 'light' | 'dark';
}

export const PageComponent: React.FC<NodeRendererProps<PageProps>> = ({
  title,
  theme = 'light',
  children,
  id,
}) => {
  const isDark = theme === 'dark';
  return (
    <main
      id={id}
      data-testid="page-component"
      style={{
        backgroundColor: isDark ? '#020617' : '#ffffff',
        color: isDark ? '#f8fafc' : '#0f172a',
        minHeight: '100vh',
        fontFamily: 'system-ui, sans-serif',
      }}
    >
      {title && <h1 style={{ display: 'none' }}>{title}</h1>}
      {children}
    </main>
  );
};

/**
 * Example Hero component renderer.
 */
export interface HeroProps {
  title?: string;
  subtitle?: string;
  alignment?: 'left' | 'center' | 'right';
  backgroundColor?: string;
  showButton?: boolean;
  buttonLabel?: string;
  buttonUrl?: string;
}

export const HeroComponent: React.FC<NodeRendererProps<HeroProps>> = ({
  title = '',
  subtitle = '',
  alignment = 'center',
  backgroundColor = '#0f172a',
  showButton = false,
  buttonLabel = 'Learn More',
  buttonUrl = '#',
  id,
}) => {
  return (
    <section
      id={id}
      data-testid="hero-component"
      style={{
        backgroundColor,
        textAlign: alignment,
        padding: '64px 24px',
        color: '#ffffff',
      }}
    >
      <h1 style={{ fontSize: '36px', margin: '0 0 16px 0' }}>{title}</h1>
      <p style={{ fontSize: '18px', maxWidth: '600px', margin: '0 auto 24px auto', opacity: 0.9 }}>
        {subtitle}
      </p>
      {showButton && (
        <a
          href={buttonUrl}
          style={{
            display: 'inline-block',
            padding: '10px 20px',
            backgroundColor: '#38bdf8',
            color: '#0f172a',
            borderRadius: '6px',
            textDecoration: 'none',
            fontWeight: 600,
          }}
        >
          {buttonLabel}
        </a>
      )}
    </section>
  );
};

/**
 * Example Container component renderer.
 */
export interface ContainerProps {
  layout?: 'grid' | 'flex';
  columns?: number;
  gap?: number;
}

export const ContainerComponent: React.FC<NodeRendererProps<ContainerProps>> = ({
  layout = 'grid',
  columns = 3,
  gap = 16,
  children,
  id,
}) => {
  return (
    <div
      id={id}
      data-testid="container-component"
      style={{
        maxWidth: '1100px',
        margin: '40px auto',
        padding: '0 24px',
        display: layout === 'grid' ? 'grid' : 'flex',
        gridTemplateColumns: layout === 'grid' ? `repeat(${columns}, 1fr)` : undefined,
        gap: `${gap}px`,
      }}
    >
      {children}
    </div>
  );
};

/**
 * Example Card component renderer.
 */
export interface CardProps {
  title?: string;
  description?: string;
  tag?: string;
}

export const CardComponent: React.FC<NodeRendererProps<CardProps>> = ({
  title = '',
  description = '',
  tag,
  id,
}) => {
  return (
    <div
      id={id}
      data-testid="card-component"
      style={{
        backgroundColor: '#1e293b',
        border: '1px solid #334155',
        borderRadius: '8px',
        padding: '24px',
        color: '#f8fafc',
      }}
    >
      {tag && (
        <span
          style={{
            fontSize: '12px',
            textTransform: 'uppercase',
            fontWeight: 700,
            color: '#38bdf8',
          }}
        >
          {tag}
        </span>
      )}
      <h3 style={{ fontSize: '20px', margin: '8px 0 12px 0' }}>{title}</h3>
      <p style={{ fontSize: '14px', color: '#94a3b8', lineHeight: 1.6, margin: 0 }}>
        {description}
      </p>
    </div>
  );
};

/**
 * Standard example components dictionary mapping all example types.
 */
export const exampleComponents: ComponentMap = {
  Page: PageComponent,
  Hero: HeroComponent,
  Container: ContainerComponent,
  Card: CardComponent,
};
