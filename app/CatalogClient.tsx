'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useDeferredValue, useEffect, useMemo, useState } from 'react';
import type { CatalogSource, Product, ProductAudience } from '../lib/catalog';

type CatalogClientProps = { products: Product[]; source: CatalogSource; hasRemoteError: boolean; isStale: boolean };
type AudienceFilter = 'todos' | Exclude<ProductAudience, 'unissex'>;
type SavedCatalogState = { activeCategory: string; activeAudience: AudienceFilter; query: string; sort: string; visibleCount: number; scrollY: number };

const PRODUCTS_PER_PAGE = 8;
const audienceLabels: Record<ProductAudience, string> = { unissex: 'Unissex', masculino: 'Masculino', feminino: 'Feminino' };
const audienceOptions: Array<{ value: AudienceFilter; label: string }> = [
  { value: 'todos', label: 'Todos' }, { value: 'masculino', label: 'Masculino' },
  { value: 'feminino', label: 'Feminino' },
];

function normalizeSearch(value: string) {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('pt-BR').trim();
}

function paginationStateKey(category: string, audience: AudienceFilter, query: string, sort: string) {
  return `${category}\u0000${audience}\u0000${normalizeSearch(query)}\u0000${sort}`;
}

export default function CatalogClient({ products, source, hasRemoteError, isStale }: CatalogClientProps) {
  const [activeCategory, setActiveCategory] = useState('Todos');
  const [activeAudience, setActiveAudience] = useState<AudienceFilter>('todos');
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState('curadoria');
  const [pagination, setPagination] = useState({ key: '', visibleCount: PRODUCTS_PER_PAGE });
  const deferredQuery = useDeferredValue(query);

  useEffect(() => {
    if (sessionStorage.getItem('zibra-restore-catalog') !== '1') return;
    sessionStorage.removeItem('zibra-restore-catalog');
    let saved: SavedCatalogState | null = null;
    try { saved = JSON.parse(sessionStorage.getItem('zibra-catalog-state') || 'null') as SavedCatalogState | null; } catch { saved = null; }
    if (!saved) {
      const savedY = Number(sessionStorage.getItem('zibra-catalog-scroll') || '0');
      requestAnimationFrame(() => window.scrollTo({ top: savedY, behavior: 'instant' }));
      return;
    }
    const restorePosition = () => window.scrollTo({ top: Math.max(0, Number(saved?.scrollY) || 0), behavior: 'instant' });
    const restoredAudience: AudienceFilter = saved.activeAudience === 'masculino' || saved.activeAudience === 'feminino' ? saved.activeAudience : 'todos';
    let lateRestore = 0;
    const restorationFrame = requestAnimationFrame(() => {
      setActiveCategory(saved.activeCategory || 'Todos');
      setActiveAudience(restoredAudience);
      setQuery(saved.query || '');
      setSort(saved.sort || 'curadoria');
      setPagination({ key: paginationStateKey(saved.activeCategory || 'Todos', restoredAudience, saved.query || '', saved.sort || 'curadoria'), visibleCount: Math.max(PRODUCTS_PER_PAGE, Number(saved.visibleCount) || PRODUCTS_PER_PAGE) });
      requestAnimationFrame(() => requestAnimationFrame(restorePosition));
      lateRestore = window.setTimeout(restorePosition, 250);
    });
    return () => { cancelAnimationFrame(restorationFrame); window.clearTimeout(lateRestore); };
  }, []);

  const categories = useMemo(() => ['Todos', ...Array.from(new Set(products.map((product) => product.type)))], [products]);
  const normalizedQuery = normalizeSearch(deferredQuery);
  const productsInCategory = useMemo(() => products.filter((product) => {
    const categoryMatches = activeCategory === 'Todos' || product.type === activeCategory;
    const queryMatches = !normalizedQuery || normalizeSearch(`${product.name} ${product.reference || ''}`).includes(normalizedQuery);
    return categoryMatches && queryMatches;
  }), [activeCategory, normalizedQuery, products]);
  const visibleProducts = useMemo(() => {
    const filtered = productsInCategory.filter((product) => activeAudience === 'todos' || product.audience === activeAudience);
    if (sort === 'nome') return [...filtered].sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));
    if (sort === 'destaques') return [...filtered].sort((a, b) => Number(Boolean(b.featured)) - Number(Boolean(a.featured)));
    return filtered;
  }, [activeAudience, productsInCategory, sort]);
  const paginationKey = paginationStateKey(activeCategory, activeAudience, deferredQuery, sort);
  const visibleCount = pagination.key === paginationKey ? pagination.visibleCount : PRODUCTS_PER_PAGE;
  const paginatedProducts = visibleProducts.slice(0, visibleCount);
  const remainingProducts = Math.max(0, visibleProducts.length - visibleCount);
  const availableProductCount = visibleProducts.filter((product) => product.availabilityStatus !== 'esgotado').length;
  const catalogOrigin = source === 'unavailable' ? 'Catálogo temporariamente indisponível' : source === 'wordpress' ? isStale ? 'Última atualização disponível • WordPress' : 'Atualizado pela Zibra • WordPress' : 'Joias selecionadas • Maison Zibra';
  const statusMessage = source === 'unavailable' ? 'Não foi possível carregar o catálogo agora. Tente novamente em alguns instantes.' : isStale ? 'Exibindo a última versão confirmada do catálogo enquanto a conexão é restabelecida.' : null;
  const rememberCatalogState = () => {
    const state: SavedCatalogState = { activeCategory, activeAudience, query, sort, visibleCount, scrollY: window.scrollY };
    sessionStorage.setItem('zibra-catalog-state', JSON.stringify(state));
    sessionStorage.setItem('zibra-catalog-scroll', String(window.scrollY));
    sessionStorage.setItem('zibra-restore-catalog', '1');
  };

  return <section className="collection" id="colecao">
    <div className="section-heading"><div><p className="section-kicker">CURADORIA ZIBRA</p><h2>Escolhas que<br /><em>falam por você.</em></h2></div><div className="collection-intro"><span>{String(availableProductCount).padStart(2, '0')} / peças disponíveis</span><p>Uma seleção delicada para marcar presença sem dizer uma palavra.</p></div></div>
    <div className="collection-catalog-line"><span>Catálogo / {String(visibleProducts.length).padStart(2, '0')} peças</span><span>{catalogOrigin}</span></div>
    {source !== 'unavailable' ? <><div className="catalog-filters" aria-label="Filtrar catálogo por categoria">
      <div className="catalog-filter-heading"><span>Explore a coleção</span><small>Escolha uma categoria</small></div>
      <div className="catalog-filter-options">{categories.map((category) => {
        const count = category === 'Todos' ? products.length : products.filter((product) => product.type === category).length;
        return <button type="button" className={activeCategory === category ? 'is-active' : ''} aria-pressed={activeCategory === category} onClick={() => setActiveCategory(category)} key={category}><span>{category}</span><small>{String(count).padStart(2, '0')}</small></button>;
      })}</div>
    </div><div className="catalog-audience-filter" aria-label="Filtrar catálogo por perfil"><span>Perfil</span><div>{audienceOptions.map((option) => {
      const count = option.value === 'todos' ? productsInCategory.length : productsInCategory.filter((product) => product.audience === option.value).length;
      return <button type="button" className={activeAudience === option.value ? 'is-active' : ''} disabled={count === 0} aria-pressed={activeAudience === option.value} onClick={() => setActiveAudience(option.value)} key={option.value}>{option.label} <small>{String(count).padStart(2, '0')}</small></button>;
    })}</div></div></> : null}
    {source !== 'unavailable' ? <div className="catalog-tools"><label><span>Buscar</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Nome ou código de referência" /></label><label><span>Ordenar</span><select value={sort} onChange={(event) => setSort(event.target.value)}><option value="curadoria">Curadoria Zibra</option><option value="destaques">Destaques</option><option value="nome">Nome de A a Z</option></select></label></div> : null}
    {hasRemoteError && statusMessage ? <div className="catalog-status" role="status">{statusMessage}</div> : null}
    <div className="product-grid">{paginatedProducts.map((product) => {
      const hoverImage = product.gallery.find((image) => image && image !== product.image);
      return <article className="product-card" key={product.id || product.name}><Link href={`/joias/${product.slug}`} onClick={rememberCatalogState}><div className={`product-image${hoverImage ? ' has-hover-image' : ''}`}><Image className="product-image-primary" src={product.image} alt={product.name} fill sizes="(max-width: 820px) 50vw, (max-width: 1150px) 33vw, 25vw" quality={82} />{hoverImage ? <Image className="product-image-hover" src={hoverImage} alt="" fill sizes="(max-width: 820px) 50vw, (max-width: 1150px) 33vw, 25vw" quality={82} /> : null}<p className="product-stamp">{product.availabilityStatus === 'esgotado' ? 'Esgotado' : product.featured ? 'Destaque Zibra' : 'Seleção Zibra'}</p></div><div className="product-meta"><div><p>{product.type} · {audienceLabels[product.audience]}</p><h3>{product.name}</h3><small>{product.availabilityStatus === 'esgotado' ? 'Peça indisponível' : product.showPrice && product.price ? product.price : 'Negocie pelo WhatsApp'}</small></div><span className="zibra-spark" aria-hidden="true">✦</span></div></Link></article>;
    })}</div>
    {remainingProducts > 0 ? <div className="catalog-load-more"><button type="button" onClick={() => setPagination({ key: paginationKey, visibleCount: visibleCount + PRODUCTS_PER_PAGE })}>Carregar mais itens <span>+{Math.min(PRODUCTS_PER_PAGE, remainingProducts)}</span></button></div> : null}
    {!visibleProducts.length && source !== 'unavailable' ? <div className="catalog-empty"><p>{products.length ? 'Nenhuma joia encontrada.' : 'A nova curadoria será publicada em breve.'}</p>{products.length ? <button type="button" onClick={() => { setQuery(''); setActiveCategory('Todos'); setActiveAudience('todos'); }}>Ver toda a coleção</button> : null}</div> : null}
  </section>;
}
