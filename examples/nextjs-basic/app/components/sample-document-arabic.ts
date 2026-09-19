/**
 * Realistic Arabic RTL editorial fixture for iRich visual editor and renderer dogfooding.
 * Stresses browser Bidi layout, ISO standards, Latin abbreviations, mixed Arabic/English,
 * bullet/numbered lists, blockquotes, container nesting, and local LTR node overrides.
 */

import { createDocument, createNode, type IRichDocument } from '@irich/core';

export const initialArabicDocument: IRichDocument = createDocument({
  metadata: {
    locale: 'ar',
    direction: 'rtl',
    title: 'الذكاء الاصطناعي التوليدي ومستقبل النشر الرقمي',
    author: 'فريق التحرير التقني — iRich',
    description: 'دليل شامل حول دمج تحرير المحتوى البصري مع معايير إدارة الذكاء الاصطناعي والمحتوى متعدد اللغات.',
  },
  root: {
    id: 'root',
    type: 'root',
    children: [
      // 1. HERO BANNER (ARABIC)
      createNode({
        id: 'hero-ar-1',
        type: 'Hero',
        props: {
          badge: '✦ محرك iRich مع دعم Bidi و RTL الكامل',
          title: 'الذكاء الاصطناعي التوليدي ومستقبل النشر الرقمي',
          subtitle:
            'منظومة متكاملة تدمج بين التحرير البصري المرن للمكونات وهيكلية النصوص المتقدمة مع دعم كامل للغات من اليمين إلى اليسار.',
          align: 'center',
          ctaText: 'استكشاف المحرر البصري',
          ctaUrl: '/editor',
          secondaryCtaText: 'المعايير الدولية 2026',
          secondaryCtaUrl: '#standards',
        },
      }),

      // 2. MAIN EDITORIAL SECTION
      createNode({
        id: 'container-article-body',
        type: 'Container',
        props: {
          maxWidth: 'medium',
          padding: 'medium',
          background: 'card',
        },
        children: [
          createNode({
            id: 'heading-ar-intro',
            type: 'Heading',
            props: {
              text: 'حوكمة الذكاء الاصطناعي والمعايير الدولية',
              level: 'h2',
              align: 'left', // Maps to text-align: start (right side in RTL)
              color: 'gradient',
            },
          }),
          createNode({
            id: 'richtext-ar-p1',
            type: 'RichText',
            props: {
              content: {
                type: 'doc',
                content: [
                  {
                    type: 'paragraph',
                    content: [
                      {
                        type: 'text',
                        text: 'شهد قطاع التقنية في عام 2026 تحولاً جذرياً نحو الحوكمة المؤسسية. حيث ',
                      },
                      {
                        type: 'text',
                        marks: [{ type: 'bold' }],
                        text: 'تم اعتماد ISO/IEC 42001:2023 كمعيار دولي لإدارة أنظمة الذكاء الاصطناعي',
                      },
                      {
                        type: 'text',
                        text: ' لضمان الشفافية والموثوقية بنسبة كفاءة تتجاوز 99.9% في المنصات الحديثة.',
                      },
                    ],
                  },
                  {
                    type: 'paragraph',
                    content: [
                      {
                        type: 'text',
                        text: 'تعتمد منصة ',
                      },
                      {
                        type: 'text',
                        marks: [{ type: 'bold' }],
                        text: 'iRich Engine',
                      },
                      {
                        type: 'text',
                        text: ' على بنية تحتية مبنية بواسطة ',
                      },
                      {
                        type: 'text',
                        marks: [{ type: 'code' }],
                        text: 'React 19 & Next.js App Router',
                      },
                      {
                        type: 'text',
                        text: ' مع دعم تقنيات التقديم على الخادم (SSR / RSC) وتخزين المستندات بصيغة JSON AST نقية وقابلة للنقل عبر الرابط المرجعي: ',
                      },
                      {
                        type: 'text',
                        marks: [{ type: 'link', attrs: { href: 'https://irich.dev/docs/multilingual' } }],
                        text: 'https://irich.dev/docs/multilingual',
                      },
                      {
                        type: 'text',
                        text: '.',
                      },
                    ],
                  },
                ],
              },
            },
          }),

          // ARABIC BLOCKQUOTE
          createNode({
            id: 'richtext-ar-quote',
            type: 'RichText',
            props: {
              content: {
                type: 'doc',
                content: [
                  {
                    type: 'blockquote',
                    content: [
                      {
                        type: 'paragraph',
                        content: [
                          {
                            type: 'text',
                            text: '«إن بناء البرمجيات الموثوقة يتطلب احترام الخصائص اللغوية والثقافية لكل مستخدم، بدءاً من اتجاه تدفق النصوص وانتهاءً بتنسيق الأرقام والرموز.»',
                          },
                        ],
                      },
                    ],
                  },
                ],
              },
            },
          }),

          // ARABIC LISTS (BULLET & NUMBERED)
          createNode({
            id: 'richtext-ar-lists',
            type: 'RichText',
            props: {
              content: {
                type: 'doc',
                content: [
                  {
                    type: 'heading',
                    attrs: { level: 3 },
                    content: [{ type: 'text', text: 'أهم ركائز دعم اللغات ثنائية الاتجاه (Bidi)' }],
                  },
                  {
                    type: 'bulletList',
                    content: [
                      {
                        type: 'listItem',
                        content: [
                          {
                            type: 'paragraph',
                            content: [
                              {
                                type: 'text',
                                marks: [{ type: 'bold' }],
                                text: 'العزل الدلالي للاتجاه:',
                              },
                              {
                                type: 'text',
                                text: ' الاعتماد على سمات HTML القياسية (dir="rtl") بدلاً من محاذاة النص الشكلية.',
                              },
                            ],
                          },
                        ],
                      },
                      {
                        type: 'listItem',
                        content: [
                          {
                            type: 'paragraph',
                            content: [
                              {
                                type: 'text',
                                marks: [{ type: 'bold' }],
                                text: 'الخصائص المنطقية في CSS:',
                              },
                              {
                                type: 'text',
                                text: ' استخدام margin-inline-start و border-inline-start لضمان استجابة التصميم التلقائية.',
                              },
                            ],
                          },
                        ],
                      },
                      {
                        type: 'listItem',
                        content: [
                          {
                            type: 'paragraph',
                            content: [
                              {
                                type: 'text',
                                marks: [{ type: 'bold' }],
                                text: 'فصل واجهة المحرر عن اتجاه الوثيقة:',
                              },
                              {
                                type: 'text',
                                text: ' إمكانية العمل بواجهة مستخدم إنجليزية (LTR) مع تحرير وثيقة عربية (RTL) بسلاسة.',
                              },
                            ],
                          },
                        ],
                      },
                    ],
                  },
                  {
                    type: 'heading',
                    attrs: { level: 3 },
                    content: [{ type: 'text', text: 'خطوات تطبيق المعيار' }],
                  },
                  {
                    type: 'orderedList',
                    content: [
                      {
                        type: 'listItem',
                        content: [
                          {
                            type: 'paragraph',
                            content: [{ type: 'text', text: 'تحديد البيانات الوصفية للمستند (locale="ar" و direction="rtl").' }],
                          },
                        ],
                      },
                      {
                        type: 'listItem',
                        content: [
                          {
                            type: 'paragraph',
                            content: [{ type: 'text', text: 'تفعيل المحرر البصري وتطبيق الخصائص المنطقية.' }],
                          },
                        ],
                      },
                      {
                        type: 'listItem',
                        content: [
                          {
                            type: 'paragraph',
                            content: [{ type: 'text', text: 'تصدير المستند واستيراده عبر أدوات الذكاء الاصطناعي بدون فقدان في البنية.' }],
                          },
                        ],
                      },
                    ],
                  },
                ],
              },
            },
          }),
        ],
      }),

      // 3. NESTED ENGLISH QUOTE OVERRIDE (EXPLICIT LTR & LANG=EN NODE META)
      createNode({
        id: 'container-nested-english-quote',
        type: 'Container',
        meta: {
          dir: 'ltr',
          lang: 'en',
        },
        props: {
          maxWidth: 'medium',
          padding: 'small',
          background: 'subtle',
        },
        children: [
          createNode({
            id: 'heading-en-override',
            type: 'Heading',
            props: {
              text: 'Editorial Technical Quotation (LTR Override)',
              level: 'h3',
              align: 'left',
              color: 'default',
            },
          }),
          createNode({
            id: 'richtext-en-quote',
            type: 'RichText',
            props: {
              content: {
                type: 'doc',
                content: [
                  {
                    type: 'blockquote',
                    content: [
                      {
                        type: 'paragraph',
                        content: [
                          {
                            type: 'text',
                            text: '“Simplicity is prerequisite for reliability. If you want more effective programmers, you will discover that they should not waste their energy on needlessly complex tools.”',
                          },
                        ],
                      },
                      {
                        type: 'paragraph',
                        content: [
                          {
                            type: 'text',
                            marks: [{ type: 'bold' }],
                            text: '— Edsger W. Dijkstra, Turing Award Winner',
                          },
                        ],
                      },
                    ],
                  },
                ],
              },
            },
          }),
        ],
      }),

      // 4. FEATURE CARDS (ARABIC)
      createNode({
        id: 'container-ar-cards',
        type: 'Container',
        props: {
          maxWidth: 'wide',
          padding: 'medium',
          background: 'transparent',
        },
        children: [
          createNode({
            id: 'heading-ar-features',
            type: 'Heading',
            props: {
              text: 'مزايا النظام الأساسية للمؤسسات',
              level: 'h2',
              align: 'center',
              color: 'default',
            },
          }),
          createNode({
            id: 'card-ar-1',
            type: 'Card',
            props: {
              tag: 'أمان البيانات',
              title: 'هيكلية JSON نقية بنسبة 100%',
              description:
                'حماية متقدمة ضد هجمات Prototype Pollution والرموز التنفيذية غير الموثوقة مع الحفاظ الكامل على نصوص اليونيكود متعددة اللغات.',
              variant: 'default',
              buttonText: 'قراءة التقرير الأمني',
              buttonUrl: '#security',
            },
          }),
          createNode({
            id: 'card-ar-2',
            type: 'Card',
            props: {
              tag: 'عزل تام',
              title: 'توليد صفحات SSR و RSC',
              description:
                'محرك الرندرة خفيف الوزن ولا يتطلب تحميل أدوات التحرير أو لوحات التحكم في صفحات الزوار المنشورة.',
              variant: 'highlight',
              buttonText: 'معاينة الأداء',
              buttonUrl: '#performance',
            },
          }),
          createNode({
            id: 'card-ar-3',
            type: 'Card',
            props: {
              tag: 'تراجع ذري',
              title: 'استبدال المستندات بضغطة واحدة',
              description:
                'استيراد كامل وتحديث شامل من أنظمة الذكاء الاصطناعي مع إمكانية التراجع الفوري بخطوة واحدة عبر سجل العمليات.',
              variant: 'default',
              buttonText: 'تجربة الاستبدال',
              buttonUrl: '#replace',
            },
          }),
        ],
      }),

      // 5. CALL TO ACTION (ARABIC)
      createNode({
        id: 'container-ar-cta',
        type: 'Container',
        props: {
          maxWidth: 'medium',
          padding: 'medium',
          background: 'subtle',
        },
        children: [
          createNode({
            id: 'heading-ar-cta',
            type: 'Heading',
            props: {
              text: 'هل أنت جاهز لتجربة التحرير البصري العصري؟',
              level: 'h2',
              align: 'center',
              color: 'gradient',
            },
          }),
          createNode({
            id: 'btn-ar-cta',
            type: 'Button',
            props: {
              label: 'ابدأ التحرير البصري الآن ←',
              url: '/editor',
              variant: 'primary',
              size: 'lg',
            },
          }),
        ],
      }),
    ],
  },
});
