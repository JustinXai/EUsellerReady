export type BusinessLocation =
  | 'eu'
  | 'uk'
  | 'us'
  | 'canada'
  | 'china'
  | 'other-non-eu';

export type SellingPlatform =
  | 'shopify'
  | 'amazon'
  | 'etsy'
  | 'woocommerce'
  | 'custom-store'
  | 'multiple-platforms';

export type ProductCategory =
  | 'general-goods'
  | 'apparel'
  | 'electronics'
  | 'toys'
  | 'cosmetics'
  | 'batteries'
  | 'home-goods'
  | 'other';

export type YesNoUnsure = 'yes' | 'no' | 'not-sure';

export type GermanyFrance = 'germany' | 'france' | 'both' | 'neither' | 'not-sure';

export interface CheckerAnswers {
  businessLocation: BusinessLocation | '';
  sellingPlatform: SellingPlatform | '';
  productCategory: ProductCategory | '';
  physicalGoods: YesNoUnsure;
  usesPackaging: YesNoUnsure;
  hasEuResponsiblePerson: YesNoUnsure;
  targetDeOrFr: GermanyFrance;
  digitalServices: YesNoUnsure;
}

export interface ComplianceTopic {
  id: string;
  name: string;
  whyRelevant: string;
  whatToPrepare: string[];
  suggestedNextStep: string;
  relatedGuide: string;
}

export const topicCatalog: ComplianceTopic[] = [
  {
    id: 'gpsr',
    name: 'GPSR - General Product Safety Regulation',
    whyRelevant:
      'GPSR (EU Regulation 2023/988) may be relevant for many physical consumer products sold to EU consumers depending on product category, seller role and market setup.',
    whatToPrepare: [
      'Product safety documentation',
      'Traceability information (manufacturing date, batch number)',
      'EU Responsible Person designation (for non-EU sellers)',
      'EU Responsible Person contact details on product listings',
      'Incident reporting procedures',
    ],
    suggestedNextStep:
      'Review the GPSR compliance guide and identify if your product categories have specific requirements.',
    relatedGuide: '/gpsr-compliance-for-shopify/',
  },
  {
    id: 'eu-responsible-person',
    name: 'EU Responsible Person',
    whyRelevant:
      'Non-EU sellers placing physical products on the EU market are required to designate an EU Responsible Person under GPSR. This applies to sellers from the US, UK, China, Canada and other non-EU locations.',
    whatToPrepare: [
      'Product technical documentation package',
      'Declaration of conformity or safety assessment',
      'Contact information for your EU Responsible Person on product labels and listings',
      'Traceability records',
    ],
    suggestedNextStep:
      'Request quotes from EU Responsible Person service providers.',
    relatedGuide: '/eu-responsible-person-service/',
  },
  {
    id: 'epr-packaging',
    name: 'EPR Packaging Registration',
    whyRelevant:
      'Extended Producer Responsibility (EPR) packaging schemes operate in Germany and France. Sellers shipping products with packaging to consumers in these countries may need to register with the relevant national EPR scheme.',
    whatToPrepare: [
      'Identify which EU countries you sell to',
      'Calculate or estimate packaging volumes',
      'Register with the relevant EPR scheme(s) — e.g., LUCID in Germany, Cite等你 in France',
      'Report packaging data periodically to the EPR scheme',
      'Recycle and pay applicable fees',
    ],
    suggestedNextStep:
      'Review the EPR compliance guide and identify which countries require registration.',
    relatedGuide: '/epr-compliance-for-shopify/',
  },
  {
    id: 'de-fr-epr',
    name: 'Germany & France EPR Packaging',
    whyRelevant:
      'Germany and France have active EPR packaging schemes. Sellers shipping to consumers in these countries may need to register with LUCID (Germany) and relevant French EPR schemes. Amazon and other platforms may also verify EPR registration.',
    whatToPrepare: [
      'Register with LUCID (Germany\'s central packaging register)',
      'Register with relevant French EPR scheme (e.g., CITEO)',
      'Report packaging volumes to each scheme',
      'Pay recycling contributions based on packaging weight and material',
      'Keep registration numbers ready for platform verification',
    ],
    suggestedNextStep:
      'Request quotes from EPR packaging compliance providers for Germany and France.',
    relatedGuide: '/epr-compliance-for-shopify/',
  },
  {
    id: 'eaa-accessibility',
    name: 'EAA Accessibility (Related Topic)',
    whyRelevant:
      'The European Accessibility Act (EAA) will apply from June 2025 and may affect ecommerce platforms and sellers offering digital services or products with digital elements to EU consumers.',
    whatToPrepare: [
      'Review whether your online store or digital services fall within EAA scope',
      'Assess accessibility of your website and product listings',
      'Consult a qualified accessibility professional for specific guidance',
    ],
    suggestedNextStep:
      'Review EAA requirements and consult an accessibility professional. This topic may expand on EUReadySeller in a future update.',
    relatedGuide: '/',
  },
];

export function computeTopics(answers: CheckerAnswers): ComplianceTopic[] {
  const topics: ComplianceTopic[] = [];
  const seen = new Set<string>();

  if (answers.physicalGoods === 'yes') {
    const gpsr = topicCatalog.find((t) => t.id === 'gpsr')!;
    if (!seen.has('gpsr')) {
      topics.push(gpsr);
      seen.add('gpsr');
    }

    if (
      answers.businessLocation !== 'eu' &&
      answers.businessLocation !== '' &&
      answers.hasEuResponsiblePerson !== 'yes'
    ) {
      const rp = topicCatalog.find((t) => t.id === 'eu-responsible-person')!;
      if (!seen.has('eu-responsible-person')) {
        topics.push(rp);
        seen.add('eu-responsible-person');
      }
    }
  }

  if (answers.usesPackaging === 'yes' && answers.physicalGoods === 'yes') {
    if (answers.targetDeOrFr === 'germany' || answers.targetDeOrFr === 'both') {
      const de = topicCatalog.find((t) => t.id === 'de-fr-epr')!;
      if (!seen.has('de-fr-epr')) {
        topics.push(de);
        seen.add('de-fr-epr');
      }
    } else if (answers.targetDeOrFr === 'france') {
      const de = topicCatalog.find((t) => t.id === 'de-fr-epr')!;
      if (!seen.has('de-fr-epr')) {
        topics.push(de);
        seen.add('de-fr-epr');
      }
    } else {
      const epr = topicCatalog.find((t) => t.id === 'epr-packaging')!;
      if (!seen.has('epr-packaging')) {
        topics.push(epr);
        seen.add('epr-packaging');
      }
    }
  }

  if (answers.digitalServices === 'yes') {
    const eaa = topicCatalog.find((t) => t.id === 'eaa-accessibility')!;
    if (!seen.has('eaa-accessibility')) {
      topics.push(eaa);
      seen.add('eaa-accessibility');
    }
  }

  return topics;
}
