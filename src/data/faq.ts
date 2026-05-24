export interface FAQItem {
  question: string;
  answer: string;
}

export const homepageFAQs: FAQItem[] = [
  {
    question: 'What is EUReadySeller?',
    answer:
      'EUReadySeller is an educational compliance navigation site that helps ecommerce sellers identify EU compliance topics to review before selling physical products to EU consumers. It covers GPSR, EU Responsible Person and EPR packaging topics.',
  },
  {
    question: 'Is this legal advice?',
    answer:
      'No. EUReadySeller provides educational information and scoping tools only. It does not provide legal advice and does not determine whether your specific products, store or business are compliant. Always consult qualified legal counsel or a compliance provider for your situation.',
  },
  {
    question: 'Who is this site for?',
    answer:
      'This site is for ecommerce sellers — including Shopify, Amazon, Etsy, WooCommerce and DTC brands — who are preparing to sell physical products to consumers in the European Union.',
  },
  {
    question: 'What should Shopify sellers review before selling to the EU?',
    answer:
      'Shopify sellers preparing to sell to EU consumers may need to review GPSR product safety requirements, EU Responsible Person obligations, and EPR packaging registration in relevant EU countries such as Germany and France.',
  },
  {
    question: 'Can EUReadySeller match me with compliance providers?',
    answer:
      'Yes. EUReadySeller includes a provider quote request form where you can submit your compliance needs and receive quotes from qualified EU compliance service providers.',
  },
];

export const checklistFAQs: FAQItem[] = [
  {
    question: 'Who needs to review the EU compliance checklist?',
    answer:
      'Any ecommerce seller — on Shopify, Amazon, Etsy, WooCommerce or a custom store — who sells physical products to consumers in the European Union should review the relevant compliance topics.',
  },
  {
    question: 'Does completing this checklist mean my store is compliant?',
    answer:
      'No. This checklist helps identify topics to review. It is not a compliance determination and does not replace advice from qualified legal counsel or a compliance provider.',
  },
  {
    question: 'What is GPSR?',
    answer:
      'GPSR stands for General Product Safety Regulation (EU) 2023/988. It applies to all physical products sold to EU consumers, requiring product safety documentation, traceability, and in some cases an EU Responsible Person.',
  },
  {
    question: 'What is an EU Responsible Person?',
    answer:
      'An EU Responsible Person is a natural or legal entity based in the EU designated by a non-EU manufacturer to ensure compliance with GPSR obligations. Non-EU sellers typically need one.',
  },
  {
    question: 'What is EPR packaging registration?',
    answer:
      'Extended Producer Responsibility (EPR) is an EU environmental regulation requiring sellers to register for packaging recovery in the countries where they sell. Germany and France have active EPR packaging schemes.',
  },
];

export const gpsrFAQs: FAQItem[] = [
  {
    question: 'What is GPSR?',
    answer:
      'GPSR (General Product Safety Regulation) is EU Regulation 2023/988 that applies to all physical products sold to EU consumers. It requires product safety documentation, traceability, and in some cases an EU Responsible Person.',
  },
  {
    question: 'Who does GPSR apply to?',
    answer:
      'GPSR applies to sellers of physical products to EU consumers — whether based inside or outside the EU. Online sellers on Shopify, Amazon, Etsy, WooCommerce or any other platform may need to comply.',
  },
  {
    question: 'What does a Shopify seller need to do for GPSR?',
    answer:
      'Shopify sellers preparing to sell to EU consumers may need to: assign an EU Responsible Person, add product safety documentation, include EU Responsible Person details on product listings, and ensure traceability documentation is in place.',
  },
  {
    question: 'Do I need an EU Responsible Person under GPSR?',
    answer:
      'If you are based outside the EU and selling physical products to EU consumers, you likely need an EU Responsible Person under GPSR. EU-based sellers typically do not need one.',
  },
  {
    question: 'Where can I find official GPSR information?',
    answer:
      'The European Commission publishes official GPSR guidance at single-market-economy.ec.europa.eu. The full regulation text is available at eur-lex.europa.eu as Regulation 2023/988.',
  },
];

export const euRpFAQs: FAQItem[] = [
  {
    question: 'What is an EU Responsible Person?',
    answer:
      'An EU Responsible Person is an entity based in the EU that acts as the point of contact for EU market surveillance authorities on product safety matters. They are required under GPSR for non-EU sellers.',
  },
  {
    question: 'Do I need an EU Responsible Person?',
    answer:
      'If you are a non-EU seller shipping physical products to EU consumers, you likely need an EU Responsible Person. EU-based sellers typically do not require one.',
  },
  {
    question: 'What does an EU Responsible Person do?',
    answer:
      'An EU Responsible Person keeps technical documentation, ensures product compliance information is available to authorities, and acts as the contact point for EU market surveillance authorities.',
  },
  {
    question: 'Can I use a compliance service provider as my EU Responsible Person?',
    answer:
      'Yes. Many compliance service providers offer EU Responsible Person services. You can request quotes through EUReadySeller\'s quote request form.',
  },
  {
    question: 'What information do I need to share with an EU Responsible Person?',
    answer:
      'You will typically need to share product descriptions, technical documentation, safety assessments, packaging details, and information about your target EU markets.',
  },
];

export const eprFAQs: FAQItem[] = [
  {
    question: 'What is EPR packaging?',
    answer:
      'Extended Producer Responsibility (EPR) is an EU environmental regulation requiring producers and sellers to contribute to the recovery and recycling of packaging waste. EPR schemes operate at the country level.',
  },
  {
    question: 'Which EU countries require EPR packaging registration?',
    answer:
      'Germany and France have active EPR packaging schemes. Sellers shipping to consumers in these countries may need to register with the relevant national packaging registers.',
  },
  {
    question: 'Do Shopify sellers need EPR packaging registration?',
    answer:
      'If you sell physical products with packaging to consumers in Germany or France, you may need EPR packaging registration. Amazon and other platforms may also require EPR registration as part of their seller compliance programs.',
  },
  {
    question: 'What is the LUCID register in Germany?',
    answer:
      'LUCID is the central packaging register (Zentrale Stelle Verpackungsregister) in Germany. Sellers must register before selling in Germany and report packaging volumes periodically.',
  },
  {
    question: 'Can I register for EPR packaging in multiple countries?',
    answer:
      'Yes. EPR registration is country-specific. If you sell to consumers in multiple EU countries, you may need separate registrations or use a compliance provider that covers multiple schemes.',
  },
];

export const quotesFAQs: FAQItem[] = [
  {
    question: 'What compliance services can I request quotes for?',
    answer:
      'You can request quotes for GPSR compliance services, EU Responsible Person services, EPR packaging registration, and general EU market compliance support.',
  },
  {
    question: 'Is the quote request form free?',
    answer:
      'Yes. Submitting the quote request form is free. You will receive quotes from compliance service providers. EUReadySeller does not charge for matching sellers with providers.',
  },
  {
    question: 'How do compliance providers receive my request?',
    answer:
      'Your quote request is submitted to compliance service providers who offer GPSR, EU Responsible Person and EPR packaging services. Providers will contact you directly.',
  },
  {
    question: 'Does using a provider guarantee compliance?',
    answer:
      'No. Using a compliance service provider does not guarantee compliance. Compliance depends on your specific products, markets and business activities. Always verify with qualified legal counsel.',
  },
  {
    question: 'What information should I include in my quote request?',
    answer:
      'Include your business location, store platform, product categories, target EU countries, and the specific compliance topics you need help with.',
  },
];

export const checkerFAQs: FAQItem[] = [
  {
    question: 'What is the EU Seller Compliance Checker?',
    answer:
      'The EU Seller Compliance Checker is a free educational scoping tool that asks about your business location, selling platform, product type and target EU markets to suggest compliance topics to review.',
  },
  {
    question: 'Does the checker determine if my store is compliant?',
    answer:
      'No. The checker identifies topics to review. It is not a compliance determination and does not replace advice from qualified legal counsel or a compliance provider.',
  },
  {
    question: 'What topics does the checker cover?',
    answer:
      'The checker covers GPSR, EU Responsible Person, EPR packaging registration, and relevant EU country-specific topics such as Germany and France EPR requirements.',
  },
  {
    question: 'Is the checker tool free to use?',
    answer:
      'Yes. The EU Seller Compliance Checker is completely free to use. No account or login is required.',
  },
  {
    question: 'What should I do after using the checker?',
    answer:
      'Review the suggested topics, read the relevant guides on EUReadySeller, and request quotes from qualified compliance service providers if you need professional support.',
  },
];
