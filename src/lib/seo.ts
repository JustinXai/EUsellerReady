import { site } from '../data/site';

export interface SEOMeta {
  title: string;
  description: string;
  canonical: string;
  ogTitle: string;
  ogDescription: string;
  ogUrl: string;
  twitterCard: string;
  h1: string;
}

export function buildSEOMeta(
  pagePath: string,
  overrides?: Partial<Pick<SEOMeta, 'title' | 'description' | 'ogTitle' | 'ogDescription' | 'canonical'>>
): SEOMeta {
  const path = pagePath === '/' ? '/' : pagePath.replace(/\/$/, '');
  const canonical = overrides?.canonical ?? `${site.siteUrl}${path}/`;

  return {
    title: overrides?.title ?? site.defaultTitle,
    description: overrides?.description ?? site.defaultDescription,
    canonical,
    ogTitle: overrides?.ogTitle ?? overrides?.title ?? site.defaultTitle,
    ogDescription: overrides?.ogDescription ?? site.defaultDescription,
    ogUrl: canonical,
    twitterCard: 'summary_large_image',
    h1: '',
  };
}
