/**
 * @irich/editorial
 * Deterministic editorial article fixtures demonstrating content restructuring from
 * ordinary flat CMS articles into rich editorial layouts.
 */

import type { IRichDocument } from '@irich/core';

/**
 * Document A: Ordinary flat CMS article.
 * Monotonous repetition of Heading -> Paragraph -> Image.
 */
export const flatArticleDocument: IRichDocument = {
  version: '1.0.0',
  metadata: {
    title: 'The Future of Web Content Architecture',
    locale: 'en',
    direction: 'ltr',
  },
  root: {
    id: 'root',
    type: 'root',
    props: {},
    children: [
      {
        id: 'heading-main',
        type: 'Heading',
        props: {
          text: 'The Future of Web Content Architecture',
          level: 'h1',
          align: 'left',
          color: 'default',
        },
      },
      {
        id: 'p-intro',
        type: 'RichText',
        props: {
          content:
            '<p>Traditional content management systems have long treated articles as blobs of unformatted HTML or disconnected paragraphs. This structure severely limits visual storytelling and responsiveness.</p>',
        },
      },
      {
        id: 'img-intro',
        type: 'Image',
        props: {
          src: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=1200&q=80',
          alt: 'Modern workspace with code on laptop',
          caption: 'Visual composition in modern digital publishing',
          aspect: '16-9',
        },
      },
      {
        id: 'heading-problem',
        type: 'Heading',
        props: {
          text: 'The Limitation of Monolithic HTML',
          level: 'h2',
          align: 'left',
          color: 'default',
        },
      },
      {
        id: 'p-problem',
        type: 'RichText',
        props: {
          content:
            '<p>When content is stored as unstructured HTML strings, designers cannot adjust typography, margins, or responsive grid behavior without updating legacy database entries.</p>',
        },
      },
      {
        id: 'heading-solution',
        type: 'Heading',
        props: {
          text: 'Structured Component Trees',
          level: 'h2',
          align: 'left',
          color: 'default',
        },
      },
      {
        id: 'p-solution',
        type: 'RichText',
        props: {
          content:
            '<p>By representing editorial pages as pure JSON document trees with stable node IDs and semantic schemas, editorial systems decouple content semantics from host layout tokens.</p>',
        },
      },
    ],
  },
};

/**
 * Document B: Redesigned rich editorial article.
 * Restructured using canonical editorial components (Section, Columns, Callout, Quote, KeyTakeaway, CardGrid, CTA).
 */
export const redesignedEditorialDocument: IRichDocument = {
  version: '1.0.0',
  metadata: {
    title: 'The Future of Web Content Architecture (Redesigned)',
    locale: 'en',
    direction: 'ltr',
  },
  root: {
    id: 'root',
    type: 'root',
    props: {},
    children: [
      {
        id: 'sec-hero',
        type: 'Section',
        props: { variant: 'default', spacing: 'spacious' },
        children: [
          {
            id: 'heading-title',
            type: 'Heading',
            props: {
              text: 'The Future of Web Content Architecture',
              level: 'h1',
              align: 'left',
              color: 'gradient',
            },
          },
          {
            id: 'cols-intro',
            type: 'Columns',
            props: { layout: 'equal', gap: 'spacious' },
            children: [
              {
                id: 'col-intro-left',
                type: 'Column',
                props: {},
                children: [
                  {
                    id: 'text-intro-lead',
                    type: 'RichText',
                    props: {
                      content:
                        '<p>Traditional CMS platforms forced authors into rigid vertical stacks. Modern visual composition empowers authors to structure narrative depth without compromising semantic data integrity.</p>',
                    },
                  },
                  {
                    id: 'callout-insight',
                    type: 'Callout',
                    props: { variant: 'insight' },
                    children: [
                      {
                        id: 'callout-text',
                        type: 'RichText',
                        props: {
                          content:
                            '<p><strong>Editorial Principle:</strong> Content structure describes narrative intent; design systems govern visual rendering.</p>',
                        },
                      },
                    ],
                  },
                ],
              },
              {
                id: 'col-intro-right',
                type: 'Column',
                props: {},
                children: [
                  {
                    id: 'img-featured',
                    type: 'Image',
                    props: {
                      src: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=1200&q=80',
                      alt: 'Clean modern digital layout workbench',
                      caption: 'Component-based page composition in action',
                      credit: 'Photo: Unsplash Editorial',
                      aspect: '4-3',
                    },
                  },
                ],
              },
            ],
          },
        ],
      },
      {
        id: 'quote-expert',
        type: 'Quote',
        props: {
          attribution: 'Tim Berners-Lee',
          source: 'W3C Architectural Principles',
          variant: 'featured',
        },
        children: [
          {
            id: 'quote-body',
            type: 'RichText',
            props: {
              content:
                '<p>&ldquo;Separating content semantics from presentation rules ensures documents survive the evolution of devices, viewports, and platforms.&rdquo;</p>',
            },
          },
        ],
      },
      {
        id: 'takeaway-core',
        type: 'KeyTakeaway',
        props: { variant: 'emphasized' },
        children: [
          {
            id: 'takeaway-heading',
            type: 'Heading',
            props: { text: 'Core Architecture Finding', level: 'h3', align: 'left', color: 'default' },
          },
          {
            id: 'takeaway-body',
            type: 'RichText',
            props: {
              content:
                '<p>Structured JSON trees enable external AI agents to reliably analyze and redesign complex editorial layouts without introducing invalid HTML, script tags, or broken markup.</p>',
            },
          },
        ],
      },
      {
        id: 'sec-features',
        type: 'Section',
        props: { variant: 'muted', spacing: 'normal' },
        children: [
          {
            id: 'heading-features',
            type: 'Heading',
            props: { text: 'Architectural Advantages', level: 'h2', align: 'center', color: 'default' },
          },
          {
            id: 'grid-features',
            type: 'CardGrid',
            props: { columns: '3', gap: 'normal' },
            children: [
              {
                id: 'card-1',
                type: 'Card',
                props: { variant: 'elevated' },
                children: [
                  {
                    id: 'card-1-title',
                    type: 'Heading',
                    props: { text: 'Deterministic State', level: 'h3', align: 'left', color: 'default' },
                  },
                  {
                    id: 'card-1-text',
                    type: 'RichText',
                    props: {
                      content:
                        '<p>Document state is 100% JSON serializable with stable node IDs and strict prop validation.</p>',
                    },
                  },
                ],
              },
              {
                id: 'card-2',
                type: 'Card',
                props: { variant: 'elevated' },
                children: [
                  {
                    id: 'card-2-title',
                    type: 'Heading',
                    props: { text: 'Zero Runtime Bloat', level: 'h3', align: 'left', color: 'default' },
                  },
                  {
                    id: 'card-2-text',
                    type: 'RichText',
                    props: {
                      content:
                        '<p>Production rendering needs only lightweight React renderers with zero editor controllers.</p>',
                    },
                  },
                ],
              },
              {
                id: 'card-3',
                type: 'Card',
                props: { variant: 'elevated' },
                children: [
                  {
                    id: 'card-3-title',
                    type: 'Heading',
                    props: { text: 'First-Class RTL', level: 'h3', align: 'left', color: 'default' },
                  },
                  {
                    id: 'card-3-text',
                    type: 'RichText',
                    props: {
                      content:
                        '<p>Logical CSS properties ensure seamless English and Arabic bi-directional layout integrity.</p>',
                    },
                  },
                ],
              },
            ],
          },
        ],
      },
      {
        id: 'cta-action',
        type: 'CTA',
        props: { variant: 'emphasized' },
        children: [
          {
            id: 'cta-heading',
            type: 'Heading',
            props: { text: 'Ready to Compose Rich Editorial Content?', level: 'h2', align: 'center', color: 'default' },
          },
          {
            id: 'cta-text',
            type: 'RichText',
            props: {
              content:
                '<p>Experience the power of semantic component composition in the interactive iRich visual workbench.</p>',
            },
          },
          {
            id: 'cta-btn',
            type: 'Button',
            props: {
              label: 'Open Interactive Editor',
              href: '/editor',
              variant: 'primary',
              size: 'lg',
            },
          },
        ],
      },
    ],
  },
};

/**
 * Substantial Arabic editorial document demonstrating all Phase 6 editorial components in RTL.
 */
export const arabicEditorialDocument: IRichDocument = {
  version: '1.0.0',
  metadata: {
    title: 'مستقبل بنية المحتوى الرقمي والتحرير المرئي',
    locale: 'ar',
    direction: 'rtl',
  },
  root: {
    id: 'root',
    type: 'root',
    props: {},
    children: [
      {
        id: 'sec-ar-hero',
        type: 'Section',
        props: { variant: 'default', spacing: 'spacious' },
        children: [
          {
            id: 'heading-ar-title',
            type: 'Heading',
            props: {
              text: 'مستقبل بنية المحتوى الرقمي والتحرير المرئي',
              level: 'h1',
              align: 'left',
              color: 'gradient',
            },
          },
          {
            id: 'cols-ar-intro',
            type: 'Columns',
            props: { layout: 'equal', gap: 'spacious' },
            children: [
              {
                id: 'col-ar-left',
                type: 'Column',
                props: {},
                children: [
                  {
                    id: 'text-ar-lead',
                    type: 'RichText',
                    props: {
                      content:
                        '<p>تعتمد أنظمة إدارة المحتوى الحديثة على تجريد المقالات وتحويلها إلى شجرة مكونات تركيبية قابلة للتحويل والتطوير، بدلاً من حفظ نصوص HTML جامدة تعيق التناسق البصري.</p>',
                    },
                  },
                  {
                    id: 'callout-ar-insight',
                    type: 'Callout',
                    props: { variant: 'insight' },
                    children: [
                      {
                        id: 'callout-ar-text',
                        type: 'RichText',
                        props: {
                          content:
                            '<p><strong>مبدأ تحريري:</strong> هيكل الوثيقة يحدد القيمة التحريرية، بينما يتولى نظام التصميم تقديمها للمستخدم.</p>',
                        },
                      },
                    ],
                  },
                ],
              },
              {
                id: 'col-ar-right',
                type: 'Column',
                props: {},
                children: [
                  {
                    id: 'img-ar-featured',
                    type: 'Image',
                    props: {
                      src: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=1200&q=80',
                      alt: 'بيئة عمل تحرير رقمية تفاعلية',
                      caption: 'التحرير المرئي التركيبي باللغة العربية',
                      credit: 'المصدر: أرشيف الصور',
                      aspect: '4-3',
                    },
                  },
                ],
              },
            ],
          },
        ],
      },
      {
        id: 'quote-ar-expert',
        type: 'Quote',
        props: {
          attribution: 'تيم بيرنرز لي',
          source: 'مبادئ معمارية الويب',
          variant: 'featured',
        },
        children: [
          {
            id: 'quote-ar-body',
            type: 'RichText',
            props: {
              content:
                '<p>&laquo;فصل دلالات المحتوى عن قواعد العرض يضمن بقاء الوثائق صالحة ومقروءة عبر مختلف المنصات والأجهزة.&raquo;</p>',
            },
          },
        ],
      },
      {
        id: 'takeaway-ar-core',
        type: 'KeyTakeaway',
        props: { variant: 'emphasized' },
        children: [
          {
            id: 'takeaway-ar-heading',
            type: 'Heading',
            props: { text: 'الخلاصة التحريرية المركزية', level: 'h3', align: 'left', color: 'default' },
          },
          {
            id: 'takeaway-ar-body',
            type: 'RichText',
            props: {
              content:
                '<p>تتيح بنية JSON التركيبية لنماذج الذكاء الاصطناعي الخارجية إعادة هيكلة المقالات بدقة كاملة دون إدخال أكواد برمجية غير آمنة أو كسر قواعد التنسيق.</p>',
            },
          },
        ],
      },
      {
        id: 'sec-ar-features',
        type: 'Section',
        props: { variant: 'muted', spacing: 'normal' },
        children: [
          {
            id: 'heading-ar-features',
            type: 'Heading',
            props: { text: 'المزايا المعمارية لمنظومة iRich', level: 'h2', align: 'center', color: 'default' },
          },
          {
            id: 'grid-ar-features',
            type: 'CardGrid',
            props: { columns: '3', gap: 'normal' },
            children: [
              {
                id: 'card-ar-1',
                type: 'Card',
                props: { variant: 'elevated' },
                children: [
                  {
                    id: 'card-ar-1-title',
                    type: 'Heading',
                    props: { text: 'حالة وثيقة حتمية', level: 'h3', align: 'left', color: 'default' },
                  },
                  {
                    id: 'card-ar-1-text',
                    type: 'RichText',
                    props: {
                      content:
                        '<p>حالة الوثيقة بالكامل قابلة للتسلسل إلى JSON قياسي مع معرفات عقد فريدة وثابتة.</p>',
                    },
                  },
                ],
              },
              {
                id: 'card-ar-2',
                type: 'Card',
                props: { variant: 'elevated' },
                children: [
                  {
                    id: 'card-ar-2-title',
                    type: 'Heading',
                    props: { text: 'دعم كامل لليمين لليسار (RTL)', level: 'h3', align: 'left', color: 'default' },
                  },
                  {
                    id: 'card-ar-2-text',
                    type: 'RichText',
                    props: {
                      content:
                        '<p>استخدام الخصائص المنطقية في CSS يضمن اتساق التخطيط والمحاذاة لكلا اللغتين العربية والإنجليزية.</p>',
                    },
                  },
                ],
              },
              {
                id: 'card-ar-3',
                type: 'Card',
                props: { variant: 'elevated' },
                children: [
                  {
                    id: 'card-ar-3-title',
                    type: 'Heading',
                    props: { text: 'سرعة وكفاءة في النشر', level: 'h3', align: 'left', color: 'default' },
                  },
                  {
                    id: 'card-ar-3-text',
                    type: 'RichText',
                    props: {
                      content:
                        '<p>محرك العرض خفيف الوزن ويدعم الرندرة في الخادم (SSR) دون تحميل مكتبات المحرر التفاعلي.</p>',
                    },
                  },
                ],
              },
            ],
          },
        ],
      },
      {
        id: 'cta-ar-action',
        type: 'CTA',
        props: { variant: 'emphasized' },
        children: [
          {
            id: 'cta-ar-heading',
            type: 'Heading',
            props: { text: 'هل أنت مستعد لبناء محتوى تحريري متقدم؟', level: 'h2', align: 'center', color: 'default' },
          },
          {
            id: 'cta-ar-text',
            type: 'RichText',
            props: {
              content:
                '<p>جرب الآن المحرر المرئي التفاعلي واستمتع بتجربة تحرير متكاملة وسلسة.</p>',
            },
          },
          {
            id: 'cta-ar-btn',
            type: 'Button',
            props: {
              label: 'ابدأ التحرير التفاعلي',
              href: '/editor',
              variant: 'primary',
              size: 'lg',
            },
          },
        ],
      },
    ],
  },
};
