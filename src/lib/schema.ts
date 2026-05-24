import { site } from '../data/site';

export function buildWebSiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: site.siteName,
    url: site.siteUrl,
    description: site.defaultDescription,
    publisher: {
      '@type': 'Organization',
      name: site.siteName,
      url: site.siteUrl,
    },
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${site.siteUrl}/?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };
}

export function buildWebPageSchema(pagePath: string, title: string, description: string, h1: string) {
  const path = pagePath === '/' ? '/' : pagePath.replace(/\/$/, '');
  return {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: title,
    description,
    headline: h1,
    url: `${site.siteUrl}${path}/`,
    isPartOf: {
      '@type': 'WebSite',
      name: site.siteName,
      url: site.siteUrl,
    },
    publisher: {
      '@type': 'Organization',
      name: site.siteName,
      url: site.siteUrl,
    },
  };
}

export function buildFAQPageSchema(faqs: Array<{ question: string; answer: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
}

export function buildSoftwareAppSchema(toolName: string, description: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: toolName,
    description,
    url: `${site.siteUrl}/tools/eu-seller-compliance-checker/`,
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web Browser',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
  };
}

export function buildBreadcrumbSchema(items: Array<{ name: string; url: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}
