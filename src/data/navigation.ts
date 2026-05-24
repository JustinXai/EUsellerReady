export interface NavItem {
  label: string;
  href: string;
}

export const navItems: NavItem[] = [
  { label: 'Checklist', href: '/eu-seller-compliance-checklist/' },
  { label: 'GPSR Guide', href: '/gpsr-compliance-for-shopify/' },
  { label: 'EU RP Service', href: '/eu-responsible-person-service/' },
  { label: 'EPR Guide', href: '/epr-compliance-for-shopify/' },
  { label: 'Get Quotes', href: '/request-eu-compliance-quotes/' },
  { label: 'Free Checker', href: '/tools/eu-seller-compliance-checker/' },
];

export const footerLinks = [
  {
    heading: 'Topics',
    links: [
      { label: 'GPSR & EU Responsible Person', href: '/gpsr-compliance-for-shopify/' },
      { label: 'EPR Packaging', href: '/epr-compliance-for-shopify/' },
      { label: 'Compliance Checklist', href: '/eu-seller-compliance-checklist/' },
    ],
  },
  {
    heading: 'Tools & Services',
    links: [
      { label: 'Free Compliance Checker', href: '/tools/eu-seller-compliance-checker/' },
      { label: 'Request Provider Quotes', href: '/request-eu-compliance-quotes/' },
    ],
  },
  {
    heading: 'Platforms',
    links: [
      { label: 'GPSR for Shopify', href: '/gpsr-compliance-for-shopify/' },
      { label: 'EPR for Shopify', href: '/epr-compliance-for-shopify/' },
      { label: 'Compliance Checklist', href: '/eu-seller-compliance-checklist/' },
    ],
  },
];
