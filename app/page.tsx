'use client';

import { useDeferredValue, useEffect, useMemo, useState } from 'react';
import { fallbackProducts, normalizeWordPressProduct, Product, whatsappUrl } from '../lib/catalog';

const wpApiUrl = process.env.NEXT_PUBLIC_WP_API_URL?.replace(/\/$/, '');

export default function Home() {
  const [products, setProducts] = useState<Product[]>(fallbackProducts);
  const [activeCategory, setActiveCategory] = useState('Todos');
  const [isRemote, setIsRemote] = useState(false);
  const [isLoading, setIsLoading] = useState(Boolean(wpApiUrl));
  const [hasRemoteError, setHasRemoteError] = useState(false);
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState('curadoria');
  const [menuOpen, setMenuOpen] = useState(false);
  const deferredQuery = useDeferredValue(query);

  useEffect(() => {
    if (!wpApiUrl) return;
    fetch(`${wpApiUrl}/wp/v2/produtos?per_page=100&_embed=1&orderby=menu_order&order=asc`, { headers: { Accept: 'application/json' } })
      .then((response) => response.ok ? response.json() : Promise.reject(new Error('WordPress indisponível')))
      .then((items) => { setProducts(items.map(normalizeWordPressProduct)); setIsRemote(true); setHasRemoteError(false); })
      .catch(() => { setIsRemote(false); setHasRemoteError(true); })
      .finally(() => setIsLoading(false));
  }, []);

  const categories = useMemo(() => ['Todos', ...Array.from(new Set(products.map((product) => product.type)))], [products]);
  const visibleProducts = useMemo(() => {
    const filtered = products.filter((product) => (activeCategory === 'Todos' || product.type === activeCategory) && product.name.toLowerCase().includes(deferredQuery.toLowerCase()));
    if (sort === 'nome') return [...filtered].sort((a,b)=>a.name.localeCompare(b.name));
    if (sort === 'destaques') return [...filtered].sort((a,b)=>Number(Boolean(b.featured))-Number(Boolean(a.featured)));
    return filtered;
  }, [activeCategory, deferredQuery, products, sort]);

  return (
    <main>
      <header className="nav-shell">
        <a className="wordmark" href="#inicio" aria-label="Zibra — início"><img src="/zibra-wordmark-white.png" alt="ZIBRA" /></a>
        <nav className={menuOpen ? 'is-open' : ''} aria-label="Navegação principal">
          <a href="#colecao">Coleção</a><a href="#essencia">Nossa essência</a><a href="#experiencia">Experiência</a>
        </nav>
        <div className="nav-actions"><a className="nav-login" href="/acesso">Área do cliente</a><a className="nav-cta" href="#contato">Atendimento</a><button className="menu-toggle" type="button" aria-label="Abrir menu" aria-expanded={menuOpen} onClick={()=>setMenuOpen(value=>!value)}>{menuOpen ? '×' : '☰'}</button></div>
      </header>
      <section className="hero" id="inicio">
        <div className="hero-copy">
          <div className="hero-edition"><span>Maison Zibra</span><span>Brasil / 2026</span></div>
          <p className="eyebrow">Joias que guardam significado</p>
          <h1>O brilho de ser <em>única.</em></h1>
          <p className="hero-lead">Peças delicadas, acabamento impecável e uma experiência pensada para transformar cada escolha em memória.</p>
          <div className="hero-actions"><a className="button button-light" href="#colecao">Conhecer a coleção <span>↗</span></a><a className="text-link" href="#essencia">Descubra a Zibra <span>↓</span></a></div>
          <div className="hero-note"><span>✦</span><p><strong>Feito para encantar</strong><br />Da joia à embalagem, cada detalhe importa.</p></div>
        </div>
        <div className="hero-visual"><img src="/zibra-brincos-studio-v3.png" alt="Brincos em formato de gota com pedras rosadas, apresentados em caixa Zibra com identidade oficial" /><div className="image-tag"><p>Elegância<br />em cada detalhe</p></div></div>
      </section>
      <div className="brand-marquee" aria-label="Valores da marca">
        <div className="marquee-track">
          <div className="marquee-group"><span>Curadoria especial</span><i>✦</i><span>Joias com significado</span><i>✦</i><span>Elegância em cada detalhe</span><i>✦</i></div>
          <div className="marquee-group" aria-hidden="true"><span>Curadoria especial</span><i>✦</i><span>Joias com significado</span><i>✦</i><span>Elegância em cada detalhe</span><i>✦</i></div>
        </div>
      </div>
      <section className="manifesto" id="essencia">
        <img className="manifesto-sigil" src="/zibra-monogram-black.png" alt="" aria-hidden="true" />
        <p className="section-kicker">PRATA • DELICADEZA • SIGNIFICADO</p>
        <blockquote>“Joias não são apenas acessórios.<br />São a forma mais bonita de contar quem somos.”</blockquote>
        <div className="manifesto-grid"><p className="manifesto-index">Z / 01</p><p>Na Zibra, acreditamos no poder dos detalhes. Cada peça nasce para acompanhar histórias, celebrar momentos e revelar aquilo que já existe de mais bonito em você.</p><p>Nossa curadoria une elegância contemporânea e símbolos atemporais — joias para presentear, guardar e viver todos os dias.</p></div>
      </section>
      <section className="collection" id="colecao">
        <div className="section-heading"><div><p className="section-kicker">CURADORIA ZIBRA</p><h2>Escolhas que<br /><em>falam por você.</em></h2></div><div className="collection-intro"><span>{String(visibleProducts.length).padStart(2, '0')} / peças disponíveis</span><p>Uma seleção delicada para marcar presença sem dizer uma palavra.</p></div></div>
        <div className="collection-catalog-line"><span>Catálogo / {String(visibleProducts.length).padStart(2, '0')} peças</span><span>{isRemote ? 'Atualizado pela Zibra • WordPress' : 'Joias selecionadas • Maison Zibra'}</span></div>
        <div className="catalog-filters" aria-label="Filtrar catálogo">
          {categories.map((category) => <button type="button" className={activeCategory === category ? 'is-active' : ''} onClick={() => setActiveCategory(category)} key={category}>{category}</button>)}
        </div>
        <div className="catalog-tools"><label><span>Buscar</span><input value={query} onChange={(event)=>setQuery(event.target.value)} placeholder="Nome da joia" /></label><label><span>Ordenar</span><select value={sort} onChange={(event)=>setSort(event.target.value)}><option value="curadoria">Curadoria Zibra</option><option value="destaques">Destaques</option><option value="nome">Nome A—Z</option></select></label></div>
        {isLoading ? <div className="catalog-status">Atualizando a curadoria…</div> : null}
        {hasRemoteError ? <div className="catalog-status">Exibindo a seleção Zibra disponível enquanto o catálogo é atualizado.</div> : null}
        <div className="product-grid">
          {visibleProducts.map((product) => <article className="product-card" key={product.id || product.name}><a href={`/joias/${product.slug}`}><div className="product-image"><img src={product.image} alt={product.name} loading="lazy" /><p className="product-stamp">{product.featured ? 'Destaque Zibra' : 'Seleção Zibra'}</p></div><div className="product-meta"><div><p>{product.type}</p><h3>{product.name}</h3><small>{product.note}</small></div><span aria-hidden="true">↗</span></div></a></article>)}
        </div>
        {!visibleProducts.length ? <div className="catalog-empty"><p>Nenhuma joia encontrada.</p><button type="button" onClick={()=>{setQuery('');setActiveCategory('Todos')}}>Ver toda a coleção</button></div> : null}
      </section>
      <section className="editorial-pause" aria-label="Essência Zibra">
        <img src="/zibra-monogram-white.png" alt="" aria-hidden="true" />
        <p className="section-kicker">UMA ESCOLHA ÍNTIMA</p>
        <h2>Para lembrar. Para celebrar.<br /><em>Para ser sua.</em></h2>
        <span>O extraordinário mora nos detalhes.</span>
      </section>
      <section className="experience" id="experiencia">
        <div className="experience-image"><img src="/zibra-embalagem-studio-v2.png" alt="Sacola e caixas premium da Zibra em composição de estúdio" /></div>
        <div className="experience-copy"><p className="section-kicker">A EXPERIÊNCIA ZIBRA</p><h2>O presente começa<br /><em>antes de abrir.</em></h2><p>Cada joia é preparada com cuidado e entregue em uma embalagem elegante, pronta para tornar o momento inesquecível — seja para alguém especial ou para você.</p><ul><li><span>01</span> Embalagem exclusiva</li><li><span>02</span> Apresentação impecável</li><li><span>03</span> Cuidado em cada detalhe</li></ul></div>
      </section>
      <section className="promise"><div><span>✦</span><p><strong>Curadoria especial</strong>Peças escolhidas para emocionar</p></div><div><span>◇</span><p><strong>Atendimento próximo</strong>Ajuda para encontrar a joia certa</p></div><div><span>∞</span><p><strong>Feita para durar</strong>Beleza que atravessa momentos</p></div></section>
      <section className="trust"><p>Garantia e cuidado</p><p>Embalagem pronta para presentear</p><p>Atendimento humano e próximo</p><p>Trocas com orientação</p></section>
      <section className="contact" id="contato"><div className="contact-monogram" aria-hidden="true"><img src="/zibra-monogram-white.png" alt="" /></div><p className="section-kicker">ENCONTRE SUA PRÓXIMA JOIA</p><h2>Qual história você<br />quer <em>guardar?</em></h2><p>Converse com a Zibra para conhecer detalhes, disponibilidade e escolher a peça que combina com o seu momento.</p><a className="button button-dark" href={whatsappUrl()} target="_blank" rel="noreferrer">Falar com a Zibra <span>↗</span></a></section>
      <footer><a className="wordmark" href="#inicio" aria-label="Voltar ao início"><img src="/zibra-wordmark-white.png" alt="ZIBRA" /></a><p>Joias que guardam significado.</p><p>© 2026 Zibra</p></footer>
    </main>
  );
}
