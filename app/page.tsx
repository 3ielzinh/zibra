import Image from 'next/image';
import CatalogClient from './CatalogClient';
import HomeHeader from './HomeHeader';
import { whatsappUrl } from '../lib/catalog';
import { getCatalog } from '../lib/catalog-server';

export default async function Home() {
  const catalog = await getCatalog();
  const contactUrl = whatsappUrl();

  return (
    <main>
      <HomeHeader />
      <section className="hero" id="inicio">
        <div className="hero-copy">
          <div className="hero-edition"><span>Maison Zibra</span><span>Brasil / 2026</span></div>
          <p className="eyebrow">Joias que guardam significado</p>
          <h1>O brilho de ser <em>única.</em></h1>
          <p className="hero-lead">Peças delicadas, acabamento impecável e uma experiência pensada para transformar cada escolha em memória.</p>
          <div className="hero-actions"><a className="button button-light" href="#colecao">Conhecer a coleção <span>↗</span></a><a className="text-link" href="#essencia">Descubra a Zibra <span>↓</span></a></div>
          <div className="hero-note"><span>✦</span><p><strong>Feito para encantar</strong><br />Da joia à embalagem, cada detalhe importa.</p></div>
        </div>
        <div className="hero-visual">
          <video className="hero-film" autoPlay muted loop playsInline preload="metadata" poster="/zibra-hero-poster.webp" aria-hidden="true">
            <source src="/zibra-hero-film.mp4" type="video/mp4" />
          </video>
          <div className="image-tag"><p>Filme de campanha<br />Maison Zibra</p></div>
        </div>
      </section>
      <div className="brand-marquee" aria-label="Valores da marca">
        <div className="marquee-track">
          <div className="marquee-group"><span>Curadoria especial</span><i>✦</i><span>Joias com significado</span><i>✦</i><span>Elegância em cada detalhe</span><i>✦</i></div>
          <div className="marquee-group" aria-hidden="true"><span>Curadoria especial</span><i>✦</i><span>Joias com significado</span><i>✦</i><span>Elegância em cada detalhe</span><i>✦</i></div>
        </div>
      </div>
      <CatalogClient products={catalog.products} source={catalog.source} hasRemoteError={catalog.hasError} isStale={catalog.isStale} />
      <section className="manifesto" id="essencia">
        <Image className="manifesto-sigil" src="/zibra-monogram-black.png" alt="" width={42} height={36} aria-hidden="true" />
        <p className="section-kicker">PRATA • DELICADEZA • SIGNIFICADO</p>
        <blockquote>“Joias não são apenas acessórios.<br />São a forma mais bonita de contar quem somos.”</blockquote>
        <div className="manifesto-grid"><p className="manifesto-index">Z / 02</p><p>Na Zibra, acreditamos no poder dos detalhes. Cada peça nasce para acompanhar histórias, celebrar momentos e revelar aquilo que já existe de mais bonito em você.</p><p>Nossa curadoria une elegância contemporânea e símbolos atemporais. São joias para presentear, guardar e viver todos os dias.</p></div>
      </section>
      <section className="editorial-pause" aria-label="Essência Zibra">
        <Image src="/zibra-monogram-white.png" alt="" width={440} height={377} aria-hidden="true" />
        <p className="section-kicker">UMA ESCOLHA ÍNTIMA</p>
        <h2>Para lembrar. Para celebrar.<br /><em>Para ser sua.</em></h2>
        <span>O extraordinário mora nos detalhes.</span>
      </section>
      <section className="experience" id="experiencia">
        <div className="experience-image"><Image src="/zibra-embalagem-studio-v2.png" alt="Sacola e caixas premium da Zibra em composição de estúdio" fill sizes="(max-width: 800px) 100vw, 55vw" quality={82} /></div>
        <div className="experience-copy"><p className="section-kicker">A EXPERIÊNCIA ZIBRA</p><h2>O presente começa<br /><em>antes de abrir.</em></h2><p>Cada joia é preparada com cuidado e entregue em uma embalagem elegante, pronta para tornar o momento inesquecível, tanto para alguém especial quanto para você.</p><ul><li><span>01</span> Embalagem exclusiva</li><li><span>02</span> Apresentação impecável</li><li><span>03</span> Cuidado em cada detalhe</li></ul></div>
      </section>
      <section className="promise"><div><span>✦</span><p><strong>Curadoria especial</strong>Peças escolhidas para emocionar</p></div><div><span>◇</span><p><strong>Atendimento próximo</strong>Ajuda para encontrar a joia certa</p></div><div><span>∞</span><p><strong>Feita para durar</strong>Beleza que atravessa momentos</p></div></section>
      <section className="trust"><p>Garantia e cuidado</p><p>Embalagem pronta para presentear</p><p>Atendimento humano e próximo</p><p>Trocas com orientação</p></section>
      <section className="contact" id="contato"><div className="contact-monogram" aria-hidden="true"><Image src="/zibra-monogram-white.png" alt="" width={610} height={522} /></div><p className="section-kicker">ENCONTRE SUA PRÓXIMA JOIA</p><h2>Qual história você<br />quer <em>guardar?</em></h2><p>Converse com a Zibra para conhecer detalhes, disponibilidade e escolher a peça que combina com o seu momento.</p>{contactUrl ? <a className="button button-dark" href={contactUrl} target="_blank" rel="noreferrer">Falar com a Zibra <span>↗</span></a> : <span className="button button-dark is-disabled" aria-disabled="true">WhatsApp em configuração</span>}</section>
      <footer><a className="wordmark" href="#inicio" aria-label="Voltar ao início"><Image src="/zibra-wordmark-white.png" alt="ZIBRA" width={96} height={22} /></a><p>Joias que guardam significado.</p><p>© 2026 Zibra</p></footer>
    </main>
  );
}
