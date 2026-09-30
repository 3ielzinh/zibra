import type { MetadataRoute } from 'next';
import { getCatalog } from '../lib/catalog-server';
import { absoluteUrl, SITE_URL } from '../lib/seo';

export const revalidate = 300;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const catalog = await getCatalog();
  const home: MetadataRoute.Sitemap[number] = {
    url: SITE_URL,
    changeFrequency: 'weekly',
    priority: 1,
  };

  if (catalog.source === 'unavailable') return [home];

  return [
    home,
    ...catalog.products.map((product) => ({
      url: `${SITE_URL}/joias/${encodeURIComponent(product.slug)}`,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
      images: [...new Set(product.gallery.map(absoluteUrl))],
    })),
  ];
}
