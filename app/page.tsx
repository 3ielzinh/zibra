const products = [
  { name: 'Brincos Gota Rosa', type: 'Brincos', image: '/zibra-brincos-studio-v3.png', note: 'Delicadeza que ilumina' },
  { name: 'Colar Fé', type: 'Colar', image: '/zibra-colar-studio-v2.png', note: 'Um símbolo para levar consigo' },
  { name: 'Corrente Grumet', type: 'Corrente', image: '/zibra-corrente-grumet-studio.png', note: 'Presença em cada elo' },
  { name: 'Corrente Trama', type: 'Corrente', image: '/zibra-corrente-trama-studio.png', note: 'Textura que captura a luz' },
];

export default function Home() {
  return (
    <main>
      <header className="nav-shell">
        <a className="wordmark" href="#inicio" aria-label="Zibra — início"><img src="/zibra-wordmark-white.png" alt="ZIBRA" /></a>
        <nav aria-label="Navegação principal">
          <a href="#colecao">Coleção</a><a href="#essencia">Nossa essência</a><a href="#experiencia">Experiência</a>
        </nav>
        <a className="nav-cta" href="#contato">Atendimento</a>
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
        <div className="section-heading"><div><p className="section-kicker">CURADORIA ZIBRA</p><h2>Escolhas que<br /><em>falam por você.</em></h2></div><div className="collection-intro"><span>04 / peças em destaque</span><p>Uma seleção delicada para marcar presença sem dizer uma palavra.</p></div></div>
        <div className="collection-catalog-line"><span>Catálogo / 01—04</span><span>Joias selecionadas • Maison Zibra</span></div>
        <div className="product-grid">
          {products.map((product) => <article className="product-card" key={product.name}><div className="product-image"><img src={product.image} alt={product.name} /><p className="product-stamp">Seleção Zibra</p></div><div className="product-meta"><div><p>{product.type}</p><h3>{product.name}</h3><small>{product.note}</small></div><a href="#contato" aria-label={`Consultar ${product.name}`}>↗</a></div></article>)}
        </div>
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
      <section className="contact" id="contato"><div className="contact-monogram" aria-hidden="true"><img src="/zibra-monogram-white.png" alt="" /></div><p className="section-kicker">ENCONTRE SUA PRÓXIMA JOIA</p><h2>Qual história você<br />quer <em>guardar?</em></h2><p>Converse com a Zibra para conhecer detalhes, disponibilidade e escolher a peça que combina com o seu momento.</p><a className="button button-dark" href="#colecao">Explorar peças <span>↑</span></a></section>
      <footer><a className="wordmark" href="#inicio" aria-label="Voltar ao início"><img src="/zibra-wordmark-white.png" alt="ZIBRA" /></a><p>Joias que guardam significado.</p><p>© 2026 Zibra</p></footer>
    </main>
  );
}
