'use client';

import Image from 'next/image';
import { useDeferredValue, useMemo, useState } from 'react';
import type { CatalogSource, Product } from '../lib/catalog';

type CatalogClientProps = {
  products: Product[];
  source: CatalogSource;
  hasRemoteError: boolean;
  isStale: boolean;
};

export default function CatalogClient({ products, source, hasRemoteError, isStale }: CatalogClientProps) {
  const [activeCategory, setActiveCategory] = useState('Todos');
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState('curadoria');
  const deferredQuery = useDeferredValue(query);

  const categories = useMemo(() => ['Todos', ...Array.from(new Set(products.map((product) => product.type)))], [products]);
  const visibleProducts = useMemo(() => {
    const filtered = products.filter((product) => (activeCategory === 'Todos' || product.type === activeCategory) && product.name.toLowerCase().includes(deferredQuery.toLowerCase()));
    if (sort === 'nome') return [...filtered].sort((a, b) => a.name.localeCompare(b.name));
    if (sort === 'destaques') return [...filtered].sort((a, b) => Number(Boolean(b.featured)) - Number(Boolean(a.featured)));
    return filtered;
  }, [activeCategory, deferredQuery, products, sort]);
  const availableProductCount = visibleProducts.filter((product) => product.availabilityStatus !== 'esgotado').length;
  const catalogOrigin = source === 'unavailable'
    ? 'Catálogo temporariamente indisponível'
    : source === 'wordpress'
      ? isStale ? 'Última atualização disponível • WordPress' : 'Atualizado pela Zibra • WordPress'
      : 'Joias selecionadas • Maison Zibra';
  const statusMessage = source === 'unavailable'
    ? 'Não foi possível carregar o catálogo agora. Tente novamente em alguns instantes.'
    : isStale
      ? 'Exibindo a última versão confirmada do catálogo enquanto a conexão é restabelecida.'
      : null;

  return (
    <section className="collection" id="colecao">
      <div className="section-heading"><div><p className="section-kicker">CURADORIA ZIBRA</p><h2>Escolhas que<br /><em>falam por você.</em></h2></div><div className="collection-intro"><span>{String(availableProductCount).padStart(2, '0')} / peças disponíveis</span><p>Uma seleção delicada para marcar presença sem dizer uma palavra.</p></div></div>
      <div className="collection-catalog-line"><span>Catálogo / {String(visibleProducts.length).padStart(2, '0')} peças</span><span>{catalogOrigin}</span></div>
      {source !== 'unavailable' ? <div className="catalog-filters" aria-label="Filtrar catálogo">
        <div className="catalog-filter-heading"><span>Explore a coleção</span><small>Escolha uma categoria</small></div>
        <div className="catalog-filter-options">
          {categories.map((category) => {
            const count = category === 'Todos' ? products.length : products.filter((product) => product.type === category).length;
            return <button type="button" className={activeCategory === category ? 'is-active' : ''} aria-pressed={activeCategory === category} onClick={() => setActiveCategory(category)} key={category}><span>{category}</span><small>{String(count).padStart(2, '0')}</small></button>;
          })}
        </div>
      </div> : null}
      {source !== 'unavailable' ? <div className="catalog-tools"><label><span>Buscar</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Nome da joia" /></label><label><span>Ordenar</span><select value={sort} onChange={(event) => setSort(event.target.value)}><option value="curadoria">Curadoria Zibra</option><option value="destaques">Destaques</option><option value="nome">Nome de A a Z</option></select></label></div> : null}
      {hasRemoteError && statusMessage ? <div className="catalog-status" role="status">{statusMessage}</div> : null}
      <div className="product-grid">
        {visibleProducts.map((product) => <article className="product-card" key={product.id || product.name}><a href={`/joias/${product.slug}`}><div className="product-image"><Image src={product.image} alt={product.name} fill sizes="(max-width: 820px) 50vw, (max-width: 1150px) 33vw, 25vw" quality={82} /><p className="product-stamp">{product.availabilityStatus === 'esgotado' ? 'Esgotado' : product.featured ? 'Destaque Zibra' : 'Seleção Zibra'}</p></div><div className="product-meta"><div><p>{product.type}</p><h3>{product.name}</h3><small>{product.availabilityStatus === 'esgotado' ? 'Peça indisponível' : product.price || product.note}</small></div><span aria-hidden="true">↗</span></div></a></article>)}
      </div>
      {!visibleProducts.length && source !== 'unavailable' ? <div className="catalog-empty"><p>{products.length ? 'Nenhuma joia encontrada.' : 'A nova curadoria será publicada em breve.'}</p>{products.length ? <button type="button" onClick={() => { setQuery(''); setActiveCategory('Todos'); }}>Ver toda a coleção</button> : null}</div> : null}
    </section>
  );
}
