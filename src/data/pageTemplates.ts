/**
 * pageTemplates.ts
 * Page template definitions for EUReadySeller Content Factory.
 * Templates define the structure, required blocks, CTA placement,
 * and SEO requirements for each page type.
 */

export interface PageTemplate {
  templateId: string;
  categoryId: string;
  description: string;
  requiredBlocks: string[];
  optionalBlocks: string[];
  ctaPlacement: 'inline' | 'bottom' | 'both';
  primaryCta: string;
  secondaryCta: string;
  schemaTypes: ('WebPage' | 'Article' | 'FAQPage' | 'BreadcrumbList')[];
  priority: '1.0' | '0.8' | '0.6' | '0.5';
  changefreq: 'daily' | 'weekly' | 'monthly';
}

export const PAGE_TEMPLATES: Record<string, PageTemplate> = {
  homeTemplate: {
    templateId: 'homeTemplate',
    categoryId: 'home',
    description: 'Site homepage with topic clusters, latest guides, and dual CTAs.',
    requiredBlocks: ['PageHeader', 'QuickAnswer', 'AISummary', 'TopicClusters', 'LatestGuides', 'FAQ', 'Disclaimer', 'CTA'],
    optionalBlocks: ['TrustBadges', 'MidPageCTA'],
    ctaPlacement: 'both',
    primaryCta: 'Start the free EU Seller Compliance Checker',
    secondaryCta: 'Leave a message about your EU compliance question',
    schemaTypes: ['WebPage', 'FAQPage'],
    priority: '1.0',
    changefreq: 'weekly',
  },

  platformGuideTemplate: {
    templateId: 'platformGuideTemplate',
    categoryId: 'platform_guide',
    description: 'Platform-specific GPSR guide with checklist, mistakes, and FAQ.',
    requiredBlocks: ['PageHeader', 'QuickAnswer', 'AISummary', 'WhoThisAppliesTo', 'PlatformContext', 'WhatToPrepare', 'Checklist', 'CommonMistakes', 'CTASection', 'OfficialSources', 'FAQ', 'Disclaimer', 'RelatedGuides'],
    optionalBlocks: ['DecisionTree', 'Scenarios', 'ServiceOptions'],
    ctaPlacement: 'bottom',
    primaryCta: 'Start the free EU Seller Compliance Checker',
    secondaryCta: 'Leave a message about your EU compliance question',
    schemaTypes: ['WebPage', 'FAQPage'],
    priority: '0.8',
    changefreq: 'monthly',
  },

  decisionGuideTemplate: {
    templateId: 'decisionGuideTemplate',
    categoryId: 'decision_guide',
    description: 'Yes/no decision tree helping sellers understand if a topic applies.',
    requiredBlocks: ['PageHeader', 'QuickAnswer', 'AISummary', 'DecisionTree', 'WhoThisAppliesTo', 'FactorsGrid', 'Scenarios', 'Checklist', 'CommonMistakes', 'CTASection', 'OfficialSources', 'FAQ', 'Disclaimer', 'RelatedGuides'],
    optionalBlocks: ['ServiceOptions'],
    ctaPlacement: 'bottom',
    primaryCta: 'Start the free EU Seller Compliance Checker',
    secondaryCta: 'Leave a message about your EU compliance question',
    schemaTypes: ['WebPage', 'FAQPage'],
    priority: '0.8',
    changefreq: 'monthly',
  },

  checklistTemplate: {
    templateId: 'checklistTemplate',
    categoryId: 'checklist',
    description: 'Checklist page with categorized sections and action CTAs.',
    requiredBlocks: ['PageHeader', 'QuickAnswer', 'AISummary', 'WhoThisAppliesTo', 'Checklist', 'CommonMistakes', 'ServiceOptions', 'OfficialSources', 'FAQ', 'Disclaimer', 'CTA'],
    optionalBlocks: [],
    ctaPlacement: 'bottom',
    primaryCta: 'Start the free EU Seller Compliance Checker',
    secondaryCta: 'Leave a message about your EU compliance question',
    schemaTypes: ['WebPage', 'FAQPage'],
    priority: '0.9',
    changefreq: 'monthly',
  },

  serviceTemplate: {
    templateId: 'serviceTemplate',
    categoryId: 'service',
    description: 'Service description page with preparation checklist and FAQ.',
    requiredBlocks: ['PageHeader', 'QuickAnswer', 'AISummary', 'WhoMayNeedThis', 'WhatToPrepare', 'Checklist', 'CommonMistakes', 'ServiceOptions', 'OfficialSources', 'FAQ', 'Disclaimer', 'CTA'],
    optionalBlocks: ['PricingInfo'],
    ctaPlacement: 'bottom',
    primaryCta: 'Leave a message about your EU compliance question',
    secondaryCta: 'Start the free EU Seller Compliance Checker',
    schemaTypes: ['WebPage', 'FAQPage'],
    priority: '0.8',
    changefreq: 'monthly',
  },

  toolTemplate: {
    templateId: 'toolTemplate',
    categoryId: 'tool',
    description: 'Interactive compliance scoping tool.',
    requiredBlocks: ['PageHeader', 'QuickAnswer', 'AISummary', 'ToolIntro', 'ToolForm', 'Disclaimer', 'RelatedGuides'],
    optionalBlocks: ['ToolResults', 'ToolShare'],
    ctaPlacement: 'bottom',
    primaryCta: 'Start the free EU Seller Compliance Checker',
    secondaryCta: 'Leave a message about your EU compliance question',
    schemaTypes: ['WebPage'],
    priority: '0.9',
    changefreq: 'monthly',
  },

  quoteRequestTemplate: {
    templateId: 'quoteRequestTemplate',
    categoryId: 'quote_request',
    description: 'Lead capture form for provider quote requests.',
    requiredBlocks: ['PageHeader', 'QuickAnswer', 'AISummary', 'HowItWorks', 'TopicsCovered', 'LeadForm', 'FAQ', 'Disclaimer'],
    optionalBlocks: ['ProviderLogos'],
    ctaPlacement: 'inline',
    primaryCta: 'Start the free EU Seller Compliance Checker',
    secondaryCta: 'Leave a message about your EU compliance question',
    schemaTypes: ['WebPage', 'FAQPage'],
    priority: '0.7',
    changefreq: 'monthly',
  },

  countryEprTemplate: {
    templateId: 'countryEprTemplate',
    categoryId: 'country_epr',
    description: 'Country-specific EPR packaging registration guide with registration checklist and provider options.',
    requiredBlocks: ['PageHeader', 'QuickAnswer', 'AISummary', 'WhoThisAppliesTo', 'CountrySpecificTopics', 'PackagingRegistrationChecklist', 'PlatformImplications', 'CommonMistakes', 'ProviderOptions', 'FAQ', 'OfficialSources', 'Disclaimer', 'CTA'],
    optionalBlocks: ['RegulatorContact'],
    ctaPlacement: 'bottom',
    primaryCta: 'Leave a message about your EU compliance question',
    secondaryCta: 'Start the free EU Seller Compliance Checker',
    schemaTypes: ['WebPage', 'FAQPage'],
    priority: '0.8',
    changefreq: 'monthly',
  },

  explainerTemplate: {
    templateId: 'explainerTemplate',
    categoryId: 'regulation_explainer',
    description: 'Explainer comparing or clarifying regulatory topics for ecommerce sellers.',
    requiredBlocks: ['PageHeader', 'QuickAnswer', 'AISummary', 'TopicOverview', 'KeyDifferences', 'WhatThisMeans', 'CommonQuestions', 'Disclaimer', 'CTA'],
    optionalBlocks: ['RelatedRegulations', 'FurtherResources'],
    ctaPlacement: 'bottom',
    primaryCta: 'Start the free EU Seller Compliance Checker',
    secondaryCta: 'Leave a message about your EU compliance question',
    schemaTypes: ['WebPage', 'FAQPage'],
    priority: '0.7',
    changefreq: 'monthly',
  },

  servicePageTemplate: {
    templateId: 'servicePageTemplate',
    categoryId: 'service_provider_matching',
    description: 'Provider directory or service matching page.',
    requiredBlocks: ['PageHeader', 'QuickAnswer', 'AISummary', 'ServiceOverview', 'HowItWorks', 'TopicsCovered', 'LeadForm', 'FAQ', 'Disclaimer'],
    optionalBlocks: ['ProviderLogos', 'Testimonials'],
    ctaPlacement: 'both',
    primaryCta: 'Leave a message about your EU compliance question',
    secondaryCta: 'Start the free EU Seller Compliance Checker',
    schemaTypes: ['WebPage', 'FAQPage'],
    priority: '0.8',
    changefreq: 'monthly',
  },

  gpsrChecklistTemplate: {
    templateId: 'gpsrChecklistTemplate',
    categoryId: 'checklist_template',
    description: 'GPSR product safety information checklist for ecommerce sellers.',
    requiredBlocks: ['PageHeader', 'QuickAnswer', 'AISummary', 'WhoThisAppliesTo', 'Checklist', 'CommonMistakes', 'OfficialSources', 'FAQ', 'Disclaimer', 'CTA'],
    optionalBlocks: ['ProductCategoryNotes'],
    ctaPlacement: 'bottom',
    primaryCta: 'Start the free EU Seller Compliance Checker',
    secondaryCta: 'Leave a message about your EU compliance question',
    schemaTypes: ['WebPage', 'FAQPage'],
    priority: '0.8',
    changefreq: 'monthly',
  },

  legalTemplate: {
    templateId: 'legalTemplate',
    categoryId: 'legal',
    description: 'Legal pages such as privacy policy and terms of service.',
    requiredBlocks: ['PageHeader', 'QuickAnswer', 'Content', 'Disclaimer'],
    optionalBlocks: ['ContactSection'],
    ctaPlacement: 'none',
    primaryCta: '',
    secondaryCta: '',
    schemaTypes: ['WebPage'],
    priority: '0.5',
    changefreq: 'monthly',
  },
};

export function getTemplateById(templateId: string): PageTemplate | undefined {
  return PAGE_TEMPLATES[templateId];
}
