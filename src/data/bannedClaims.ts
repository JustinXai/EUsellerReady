// Dangerous compliance claim phrases that must NEVER appear on the site.
// These are case-insensitive and checked across all source files.
export const bannedPhrases: string[] = [
  'guaranteed compliance',
  'certified compliance',
  'fully compliant',
  'become compliant instantly',
  'we are lawyers',
  'official EU certified',
  'EU-approved service',
  'compliant by using this tool',
  'this tool determines compliance',
  'we guarantee your products are compliant',
  'avoid all fines',
  'legally required in every case',
];

// Soft risk phrases — these trigger WARN (not FAIL) in validate-claims.mjs
// Review and soften when found in page body prose.
export const softRiskPhrases: string[] = [
  'applies to all physical products',
  'applies to any physical product',
  'must independently',
  'must be accessible',
  'ensure compliance',
  'listing removals',
  'before first selling',
  'you are responsible for',
  'sellers are responsible for',
];

// Safe phrases that are explicitly allowed (whitelist)
export const safePhrases: string[] = [
  'not legal advice',
  'does not provide legal advice',
  'educational guidance',
  'educational information',
  'educational resource',
  'topics to review',
  'may apply',
  'likely relevant',
  'sellers may need to prepare',
  'consult a qualified compliance provider',
  'consult qualified legal counsel',
  'this tool does not determine compliance',
  'provider matching',
  'request quotes',
  'scoping tool',
  'likely topics to review',
  'what to prepare',
];

export const siteDisclaimer =
  'EUReadySeller provides educational information and scoping tools for ecommerce sellers. It does not provide legal advice and does not determine whether your products, store, or business are compliant. Always consult qualified legal counsel or a compliance provider for your specific situation.';
