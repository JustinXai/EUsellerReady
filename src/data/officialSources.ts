export interface OfficialSource {
  title: string;
  url: string;
  description: string;
}

export const officialSources: Record<string, OfficialSource[]> = {
  gpsr: [
    {
      title: 'European Commission - GPSR Overview',
      url: 'https://single-market-economy.ec.europa.eu/industry/sustainability/product-safety/gpsr_en',
      description: 'Official European Commission page covering the General Product Safety Regulation.',
    },
    {
      title: 'EU Regulation 2023/988',
      url: 'https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32023R0988',
      description: 'Full text of EU Regulation 2023/988 on general product safety.',
    },
  ],
  euResponsiblePerson: [
    {
      title: 'European Commission - GPSR Resources',
      url: 'https://single-market-economy.ec.europa.eu/industry/sustainability/product-safety/gpsr_en',
      description: 'Resources on EU Responsible Person obligations under GPSR.',
    },
  ],
  epr: [
    {
      title: 'Amazon Europe EPR Requirements',
      url: 'https://sellercentral.amazon.co.uk/learn/courses?ref=SDC_DIL_courses_list&courseId=L3Byb2R1Y3Rz',
      description: "Amazon's guidance on Extended Producer Responsibility for sellers in EU markets.",
    },
    {
      title: 'Germany LUCID Packaging Register',
      url: 'https://lucid.verpackungsregister.de/',
      description: "Germany's central packaging register (Zentrale Stelle Verpackungsregister) for EPR registration.",
    },
  ],
  amazonGpsr: [
    { title: 'Amazon EU - General Product Safety Regulation (GPSR)', url: 'https://sellercentral.amazon.co.uk/learn/courses?ref=SDC_DIL_courses_list&courseId=L3Byb2R1Y3Rz', description: "Amazon's official guidance for sellers on GPSR requirements for EU marketplaces." },
    { title: 'Amazon Seller Central - Product Safety and Compliance (EU)', url: 'https://sellercentral.amazon.co.uk/help/hub/product-safety-compliance', description: "Amazon's product safety and compliance resources for EU sellers." },
  ],
  shopifyGpsr: [
    { title: 'Shopify - EU General Product Safety Regulation (GPSR)', url: 'https://www.shopify.com/blog/gpsr', description: "Shopify's guidance for merchants on preparing for GPSR requirements in the EU." },
  ],
  etsyGpsr: [
    { title: 'Etsy - EU GPSR for Sellers', url: 'https://www.etsy.com/uk/seller-handbook/article/understanding-the-gpsr/660584834745', description: "Etsy's official EU GPSR guidance for sellers on the Etsy platform." },
    { title: 'Etsy Help - Product Safety and Compliance', url: 'https://help.etsy.com/hc/en-gb/sections/360000352367-Product-Safety-and-Compliance', description: "Etsy's help centre section on product safety and compliance topics." },
  ],
  general: [
    {
      title: 'European Commission - Single Market',
      url: 'https://single-market-economy.ec.europa.eu/',
      description: 'EU Single Market official portal for business compliance topics.',
    },
  ],
};

export function getSourcesForTopic(topic: string): OfficialSource[] {
  return officialSources[topic] ?? officialSources.general;
}

export function getSourcesForTopics(topics: string[]): OfficialSource[] {
  const allSources: OfficialSource[] = [];
  for (const topic of topics) {
    const sources = officialSources[topic] ?? officialSources.general;
    for (const source of sources) {
      if (!allSources.find((s) => s.url === source.url)) {
        allSources.push(source);
      }
    }
  }
  return allSources;
}
