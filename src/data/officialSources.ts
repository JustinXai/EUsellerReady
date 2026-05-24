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
