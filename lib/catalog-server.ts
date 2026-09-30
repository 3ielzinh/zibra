import { fallbackProducts, normalizeWordPressProduct, type CatalogSource, type Product } from './catalog';
import { defaultPackagingSlides, type PackagingSlide } from './packaging';

export type CatalogResult = {
  products: Product[];
  source: CatalogSource;
  hasError: boolean;
  isStale: boolean;
};

export type CatalogProductResult = {
  product: Product | null;
  source: CatalogSource;
  unavailable: boolean;
  isStale: boolean;
};

const PAGE_SIZE = 100;
const REQUEST_TIMEOUT_MS = 8000;
let lastValidCatalog: Product[] | null = null;

type WordPressSiteContent = {
  packaging_images?: Array<{ url?: unknown; alt?: unknown }>;
};

export async function getPackagingSlides(): Promise<PackagingSlide[]> {
  const apiUrl = (process.env.WP_API_URL || process.env.NEXT_PUBLIC_WP_API_URL || '').replace(/\/$/, '');
  if (!apiUrl) return defaultPackagingSlides;

  try {
    const response = await fetch(`${apiUrl}/zibra/v1/site-content`, {
      headers: { Accept: 'application/json' },
      cache: 'no-store',
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });
    if (!response.ok) return defaultPackagingSlides;
    const data = await response.json() as WordPressSiteContent;
    const slides = Array.isArray(data.packaging_images)
      ? data.packaging_images.slice(0, 8).flatMap((image) => {
          const src = typeof image.url === 'string' ? image.url.trim() : '';
          if (!src) return [];
          const alt = typeof image.alt === 'string' && image.alt.trim() ? image.alt.trim() : 'Embalagem Zibra';
          return [{ src, alt }];
        })
      : [];
    return slides.length ? slides : defaultPackagingSlides;
  } catch {
    return defaultPackagingSlides;
  }
}

async function fetchCatalogPage(apiUrl: string, page: number) {
  const url = new URL(`${apiUrl}/wp/v2/produtos`);
  url.searchParams.set('per_page', String(PAGE_SIZE));
  url.searchParams.set('page', String(page));
  url.searchParams.set('_embed', '1');
  url.searchParams.set('orderby', 'menu_order');
  url.searchParams.set('order', 'asc');

  const response = await fetch(url, {
    headers: { Accept: 'application/json' },
    cache: 'no-store',
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  });

  if (!response.ok) throw new Error(`WordPress respondeu com status ${response.status}`);
  const items = await response.json() as unknown;
  if (!Array.isArray(items)) throw new Error('O catálogo WordPress não retornou uma lista de produtos');

  const totalPagesHeader = Number(response.headers.get('X-WP-TotalPages') || '1');
  const totalPages = Number.isInteger(totalPagesHeader) && totalPagesHeader > 0 ? totalPagesHeader : 1;
  return { items, totalPages };
}

export async function getCatalog(): Promise<CatalogResult> {
  const apiUrl = (process.env.WP_API_URL || process.env.NEXT_PUBLIC_WP_API_URL || '').replace(/\/$/, '');
  if (!apiUrl) return { products: fallbackProducts, source: 'fallback', hasError: false, isStale: false };

  try {
    const firstPage = await fetchCatalogPage(apiUrl, 1);
    const remainingPages = Array.from({ length: firstPage.totalPages - 1 }, (_, index) => index + 2);
    const remainingResults = await Promise.all(remainingPages.map((page) => fetchCatalogPage(apiUrl, page)));
    const items = [firstPage.items, ...remainingResults.map((result) => result.items)].flat();

    const products = items.map(normalizeWordPressProduct);
    lastValidCatalog = products;

    return {
      products,
      source: 'wordpress',
      hasError: false,
      isStale: false,
    };
  } catch {
    if (lastValidCatalog !== null) {
      return { products: lastValidCatalog, source: 'wordpress', hasError: true, isStale: true };
    }

    return { products: [], source: 'unavailable', hasError: true, isStale: false };
  }
}

export async function getCatalogProduct(slug: string): Promise<CatalogProductResult> {
  const catalog = await getCatalog();

  return {
    product: catalog.products.find((product) => product.slug === slug) || null,
    source: catalog.source,
    unavailable: catalog.source === 'unavailable',
    isStale: catalog.isStale,
  };
}
