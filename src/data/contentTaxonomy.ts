/**
 * contentTaxonomy.ts
 * Taxonomy definitions for EUReadySeller Content Factory.
 * Provides structured categories, tags, user segments, funnel stages,
 * topic tags, and official source topics used across contentRoadmap.
 */

// --- Content Categories ---
export const CONTENT_CATEGORIES = {
  HOME: 'home',
  PLATFORM_GUIDE: 'platform-guide',
  PLATFORM_COMPLIANCE: 'platform_compliance',
  SERVICE: 'service',
  DECISION_GUIDE: 'decision-guide',
  CHECKLIST: 'checklist',
  CHECKLIST_TEMPLATE: 'checklist_template',
  TOOL: 'tool',
  QUOTE_REQUEST: 'quote-request',
  COUNTRY_EPR: 'country_epr',
  REGULATION_EXPLAINER: 'regulation_explainer',
  SERVICE_PROVIDER_MATCHING: 'service_provider_matching',
  BLOG: 'blog',
} as const;

export type ContentCategory = typeof CONTENT_CATEGORIES[keyof typeof CONTENT_CATEGORIES];

// --- Topic Tags ---
export const TOPIC_TAGS = {
  GPSR: 'gpsr',
  EU_RESPONSIBLE_PERSON: 'eu-responsible-person',
  EPR: 'epr',
  AMAZON: 'amazon',
  SHOPIFY: 'shopify',
  ETSY: 'etsy',
  WOOCOMMERCE: 'woocommerce',
  DECISION: 'decision',
  CHECKLIST: 'checklist',
  PRODUCT_SAFETY: 'product-safety',
  LABELLING: 'labelling',
  TRACEABILITY: 'traceability',
  INCIDENT_REPORTING: 'incident-reporting',
} as const;

export type TopicTag = typeof TOPIC_TAGS[keyof typeof TOPIC_TAGS];

// --- User Segments ---
export const USER_SEGMENTS = {
  NON_EU_SELLER: 'non-eu-seller',
  EU_SELLER: 'eu-seller',
  HANDMADE_SELLER: 'handmade-seller',
  VINTAGE_SELLER: 'vintage-seller',
  POD_SELLER: 'pod-seller',
  SMALL_BATCH_SELLER: 'small-batch-seller',
  FBA_SELLER: 'fba-seller',
  MFN_SELLER: 'mfn-seller',
  DTC_BRAND: 'dtc-brand',
  WHOLESALE: 'wholesale',
  SHOPIFY_MERCHANT: 'shopify-merchant',
  AMAZON_SELLER: 'amazon-seller',
  ETSY_SELLER: 'etsy-seller',
  WOOCOMMERCE_MERCHANT: 'woocommerce-merchant',
} as const;

export type UserSegment = typeof USER_SEGMENTS[keyof typeof USER_SEGMENTS];

// --- Funnel Stages ---
export const FUNNEL_STAGES = {
  AWARENESS: 'awareness',
  CONSIDERATION: 'consideration',
  DECISION: 'decision',
  RETENTION: 'retention',
} as const;

export type FunnelStage = typeof FUNNEL_STAGES[keyof typeof FUNNEL_STAGES];

// --- Monetization Paths ---
export const MONETIZATION_PATHS = {
  LEAD_GEN_PROVIDER_QUOTES: 'lead-gen-provider-quotes',
  AFFILIATE_PROVIDER_REFERRAL: 'affiliate-provider-referral',
  CONTENT_MONETIZATION: 'content-monetization',
  DIRECT_SERVICE: 'direct-service',
} as const;

export type MonetizationPath = typeof MONETIZATION_PATHS[keyof typeof MONETIZATION_PATHS];

// --- Official Source Topics ---
export const OFFICIAL_SOURCE_TOPICS = {
  GPSR: 'gpsr',
  EU_RESPONSIBLE_PERSON: 'euResponsiblePerson',
  EPR: 'epr',
  AMAZON_GPSR: 'amazonGpsr',
  SHOPIFY_GPSR: 'shopifyGpsr',
  ETSY_GPSR: 'etsyGpsr',
  AMAZON_EPR: 'amazonEpr',
  GERMANY_EPR: 'germanyEpr',
  FRANCE_EPR: 'franceEpr',
  GENERAL: 'general',
} as const;

export type OfficialSourceTopic = typeof OFFICIAL_SOURCE_TOPICS[keyof typeof OFFICIAL_SOURCE_TOPICS];

// --- Category -> Default Funnel Stage mapping ---
export const CATEGORY_FUNNEL_MAP: Partial<Record<ContentCategory, FunnelStage>> = {
  [CONTENT_CATEGORIES.HOME]: FUNNEL_STAGES.AWARENESS,
  [CONTENT_CATEGORIES.PLATFORM_GUIDE]: FUNNEL_STAGES.CONSIDERATION,
  [CONTENT_CATEGORIES.PLATFORM_COMPLIANCE]: FUNNEL_STAGES.CONSIDERATION,
  [CONTENT_CATEGORIES.SERVICE]: FUNNEL_STAGES.DECISION,
  [CONTENT_CATEGORIES.DECISION_GUIDE]: FUNNEL_STAGES.CONSIDERATION,
  [CONTENT_CATEGORIES.CHECKLIST]: FUNNEL_STAGES.CONSIDERATION,
  [CONTENT_CATEGORIES.CHECKLIST_TEMPLATE]: FUNNEL_STAGES.CONSIDERATION,
  [CONTENT_CATEGORIES.TOOL]: FUNNEL_STAGES.DECISION,
  [CONTENT_CATEGORIES.QUOTE_REQUEST]: FUNNEL_STAGES.DECISION,
  [CONTENT_CATEGORIES.COUNTRY_EPR]: FUNNEL_STAGES.CONSIDERATION,
  [CONTENT_CATEGORIES.REGULATION_EXPLAINER]: FUNNEL_STAGES.CONSIDERATION,
  [CONTENT_CATEGORIES.SERVICE_PROVIDER_MATCHING]: FUNNEL_STAGES.DECISION,
  [CONTENT_CATEGORIES.BLOG]: FUNNEL_STAGES.AWARENESS,
};

// --- Category -> Default Monetization Path mapping ---
export const CATEGORY_MONEY_MAP: Partial<Record<ContentCategory, MonetizationPath>> = {
  [CONTENT_CATEGORIES.HOME]: MONETIZATION_PATHS.LEAD_GEN_PROVIDER_QUOTES,
  [CONTENT_CATEGORIES.PLATFORM_GUIDE]: MONETIZATION_PATHS.LEAD_GEN_PROVIDER_QUOTES,
  [CONTENT_CATEGORIES.PLATFORM_COMPLIANCE]: MONETIZATION_PATHS.LEAD_GEN_PROVIDER_QUOTES,
  [CONTENT_CATEGORIES.SERVICE]: MONETIZATION_PATHS.LEAD_GEN_PROVIDER_QUOTES,
  [CONTENT_CATEGORIES.DECISION_GUIDE]: MONETIZATION_PATHS.LEAD_GEN_PROVIDER_QUOTES,
  [CONTENT_CATEGORIES.CHECKLIST]: MONETIZATION_PATHS.LEAD_GEN_PROVIDER_QUOTES,
  [CONTENT_CATEGORIES.CHECKLIST_TEMPLATE]: MONETIZATION_PATHS.LEAD_GEN_PROVIDER_QUOTES,
  [CONTENT_CATEGORIES.TOOL]: MONETIZATION_PATHS.LEAD_GEN_PROVIDER_QUOTES,
  [CONTENT_CATEGORIES.QUOTE_REQUEST]: MONETIZATION_PATHS.LEAD_GEN_PROVIDER_QUOTES,
  [CONTENT_CATEGORIES.COUNTRY_EPR]: MONETIZATION_PATHS.LEAD_GEN_PROVIDER_QUOTES,
  [CONTENT_CATEGORIES.REGULATION_EXPLAINER]: MONETIZATION_PATHS.LEAD_GEN_PROVIDER_QUOTES,
  [CONTENT_CATEGORIES.SERVICE_PROVIDER_MATCHING]: MONETIZATION_PATHS.LEAD_GEN_PROVIDER_QUOTES,
  [CONTENT_CATEGORIES.BLOG]: MONETIZATION_PATHS.CONTENT_MONETIZATION,
};
