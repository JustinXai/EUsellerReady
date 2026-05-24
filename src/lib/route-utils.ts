import { routes } from '../data/routes';
import { site } from '../data/site';

export function getPagePath(routePath: string): string {
  return `${site.siteUrl}${routePath}`;
}

export function getCanonical(routePath: string): string {
  return `${site.siteUrl}${routePath}`;
}

export function isValidInternalLink(href: string): boolean {
  if (href.startsWith('http://') || href.startsWith('https://')) return true;
  if (href.startsWith('mailto:') || href.startsWith('#')) return true;
  if (!href.startsWith('/')) return false;

  const normalized = href.endsWith('/') ? href : `${href}/`;
  const root = href === '/' ? '/' : href;

  return routes.some(
    (r) => r.path === normalized || r.path === `${root}/` || r.path === root
  );
}

export function getRelatedPages(category: string, currentPath: string): typeof routes {
  return routes
    .filter((r) => r.category === category && r.path !== currentPath)
    .slice(0, 3);
}
