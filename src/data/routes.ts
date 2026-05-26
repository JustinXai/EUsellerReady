export interface Route {
  path: string;
  title: string;
  description: string;
  h1: string;
  category: string;
  priority: '1.0' | '0.8' | '0.6' | '0.5';
  changefreq: 'daily' | 'weekly' | 'monthly';
  includeInSitemap: boolean;
  includeInLlms: boolean;
  lastmod: string;
  aiSummary: string;
}

export const routes: Route[] = [
  {
    path: '/',
    title: 'EUReadySeller - Know What Your Store Needs Before Selling to the EU',
    description:
      'EUReadySeller helps ecommerce sellers understand GPSR, EU Responsible Person and EPR packaging topics before selling physical products to EU consumers.',
    h1: 'Know what your store needs before selling to the EU.',
    category: 'home',
    priority: '1.0',
    changefreq: 'weekly',
    includeInSitemap: true,
    includeInLlms: true,
    lastmod: '2026-05-24',
    aiSummary:
      'EUReadySeller homepage. An educational compliance navigation site for ecommerce sellers preparing to sell to the EU. Covers GPSR, EU Responsible Person and EPR packaging topics.',
  },
  {
    path: '/eu-seller-compliance-checklist/',
    title: 'EU Seller Compliance Checklist for Ecommerce Sellers',
    description:
      'A practical EU seller compliance checklist covering GPSR, EU Responsible Person and EPR packaging topics for ecommerce sellers preparing to sell to the EU.',
    h1: 'EU Seller Compliance Checklist for Ecommerce Sellers',
    category: 'checklist',
    priority: '0.9',
    changefreq: 'monthly',
    includeInSitemap: true,
    includeInLlms: true,
    lastmod: '2026-05-24',
    aiSummary:
      'A practical checklist covering GPSR, EU Responsible Person and EPR packaging topics that ecommerce sellers may need to review before selling to EU consumers.',
  },
  {
    path: '/gpsr-compliance-for-shopify/',
    title: 'GPSR Compliance for Shopify Sellers',
    description:
      'A practical GPSR guide for Shopify sellers preparing to sell physical products to EU consumers, including EU Responsible Person and product safety information topics.',
    h1: 'GPSR Compliance for Shopify Sellers',
    category: 'platform-guide',
    priority: '0.8',
    changefreq: 'monthly',
    includeInSitemap: true,
    includeInLlms: true,
    lastmod: '2026-05-24',
    aiSummary:
      'GPSR guide specifically for Shopify sellers. Covers the General Product Safety Regulation, EU Responsible Person requirements, and product safety documentation topics.',
  },
  {
    path: '/eu-responsible-person-service/',
    title: 'EU Responsible Person Service for Ecommerce Sellers',
    description:
      'Understand what an EU Responsible Person is, when ecommerce sellers may need one, and what to prepare before requesting provider quotes.',
    h1: 'EU Responsible Person Service for Ecommerce Sellers',
    category: 'service',
    priority: '0.8',
    changefreq: 'monthly',
    includeInSitemap: true,
    includeInLlms: true,
    lastmod: '2026-05-24',
    aiSummary:
      'Explains the EU Responsible Person role required under GPSR for non-EU sellers. Describes when ecommerce sellers may need one, what to prepare, and how to request provider quotes.',
  },
  {
    path: '/epr-compliance-for-shopify/',
    title: 'EPR Compliance for Shopify Sellers',
    description:
      'A practical guide to EPR packaging topics Shopify sellers may need to review before selling physical products in EU markets.',
    h1: 'EPR Compliance for Shopify Sellers',
    category: 'platform-guide',
    priority: '0.8',
    changefreq: 'monthly',
    includeInSitemap: true,
    includeInLlms: true,
    lastmod: '2026-05-24',
    aiSummary:
      'EPR packaging guide for Shopify sellers. Covers Extended Producer Responsibility registration topics in Germany, France and other EU markets.',
  },
  {
    path: '/request-eu-compliance-quotes/',
    title: 'Request EU Compliance Provider Quotes',
    description:
      'Request quotes from EU compliance providers for GPSR, EU Responsible Person and EPR packaging topics.',
    h1: 'Request EU Compliance Provider Quotes',
    category: 'quote-request',
    priority: '0.7',
    changefreq: 'monthly',
    includeInSitemap: true,
    includeInLlms: true,
    lastmod: '2026-05-24',
    aiSummary:
      'Lead form page for requesting quotes from EU compliance service providers covering GPSR, EU Responsible Person and EPR packaging topics.',
  },
  {
    path: '/tools/eu-seller-compliance-checker/',
    title: 'EU Seller Compliance Checker - Free Educational Scoping Tool',
    description:
      'A free educational scoping tool that helps ecommerce sellers identify GPSR, EU Responsible Person and EPR packaging topics to review before selling to the EU.',
    h1: 'EU Seller Compliance Checker',
    category: 'tool',
    priority: '0.9',
    changefreq: 'monthly',
    includeInSitemap: true,
    includeInLlms: true,
    lastmod: '2026-05-24',
    aiSummary:
      'Free interactive scoping tool for ecommerce sellers. Asks about business location, platform, product type and target markets to suggest GPSR, EU Responsible Person and EPR packaging topics to review.',
  },
  {
    path: '/gpsr-compliance-for-amazon-sellers/',
    title: 'GPSR Compliance for Amazon Sellers',
    description: 'A practical GPSR guide for Amazon sellers reviewing EU Responsible Person, product safety information and listing topics before selling to EU consumers.',
    h1: 'GPSR Compliance for Amazon Sellers',
    category: 'platform-guide',
    priority: '0.8',
    changefreq: 'monthly',
    includeInSitemap: true,
    includeInLlms: true,
    lastmod: '2026-05-25',
    aiSummary: 'GPSR guide specifically for Amazon sellers. Covers EU Responsible Person topics, product safety information requirements, and Amazon listing fields to review for EU marketplace compliance.',
  },
  {
    path: '/do-i-need-an-eu-responsible-person/',
    title: 'Do I Need an EU Responsible Person?',
    description: 'Learn when ecommerce sellers may need to review EU Responsible Person topics before selling physical products to EU consumers under GPSR.',
    h1: 'Do I Need an EU Responsible Person?',
    category: 'decision-guide',
    priority: '0.8',
    changefreq: 'monthly',
    includeInSitemap: true,
    includeInLlms: true,
    lastmod: '2026-05-25',
    aiSummary: 'Decision guide for ecommerce sellers unsure about EU Responsible Person obligations. Covers when non-EU sellers may need an EU Responsible Person, key decision factors, and example scenarios.',
  },
  {
    path: '/gpsr-compliance-for-etsy-sellers/',
    title: 'GPSR Compliance for Etsy Sellers',
    description: 'A practical GPSR guide for Etsy sellers reviewing EU Responsible Person, product safety information and listing topics before selling to EU consumers.',
    h1: 'GPSR Compliance for Etsy Sellers',
    category: 'platform-guide',
    priority: '0.8',
    changefreq: 'monthly',
    includeInSitemap: true,
    includeInLlms: true,
    lastmod: '2026-05-25',
    aiSummary: 'GPSR guide for Etsy sellers. Covers product safety information topics, EU Responsible Person requirements, manufacturer details and Etsy listing or shop information areas to review before selling to EU consumers. Educational guidance only, not legal advice.',
  },
  {
    path: '/epr-compliance-for-amazon-sellers/',
    title: 'EPR Compliance for Amazon Sellers',
    description: 'A practical EPR guide for Amazon sellers reviewing packaging registration, Germany and France EPR topics before selling in European markets.',
    h1: 'EPR Compliance for Amazon Sellers',
    category: 'platform',
    priority: '0.8',
    changefreq: 'monthly',
    includeInSitemap: true,
    includeInLlms: true,
    lastmod: '2026-05-25',
    aiSummary: 'EPR guide for Amazon sellers. Covers packaging registration topics, Germany and France EPR requirements, Amazon seller information and provider help. Explains how EPR differs from GPSR. Educational guidance only, not legal advice.',
  },
  {
    path: '/germany-epr-packaging-registration/',
    title: 'Germany EPR Packaging Registration for Ecommerce Sellers',
    description: 'A practical guide for ecommerce sellers reviewing Germany EPR packaging registration, LUCID topics and provider help before selling packaged goods in Germany.',
    h1: 'Germany EPR Packaging Registration for Ecommerce Sellers',
    category: 'country_epr',
    priority: '0.7',
    changefreq: 'monthly',
    includeInSitemap: true,
    includeInLlms: true,
    lastmod: '2026-05-26',
    aiSummary: 'Germany EPR packaging registration guide for ecommerce sellers. Covers LUCID packaging register, German Packaging Act obligations, and registration topics for sellers targeting the German market. Explains how EPR differs from GPSR.',
  },
];

export function getRouteByPath(path: string): Route | undefined {
  return routes.find((r) => r.path === path);
}
