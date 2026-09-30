import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { cache } from 'react';
import ProductGallery from './ProductGallery';
import ArrowIcon from '../../ArrowIcon';
import BackToCatalog from './BackToCatalog';
import ProductPurchaseActions from './ProductPurchaseActions';
import RelatedProductCard from './RelatedProductCard';
import { whatsappUrl, type Product, type ProductAudience } from '../../../lib/catalog';
import { getCatalog, getCatalogProduct } from '../../../lib/catalog-server';
import { absoluteUrl, serializeJsonLd, SITE_URL } from '../../../lib/seo';

const getProduct = cache((slug: string) => getCatalogProduct(slug));
const audienceLabels: Record<ProductAudience, string> = { unissex: 'Unissex', masculino: 'Masculino', feminino: 'Feminino' };

function relatedProducts(product: Product, products: Product[]) {
  const others = products.filter((candidate) => candidate.slug !== product.slug);
  const isChain = product.type.toLocaleLowerCase('pt-BR').includes('corrente');
  const preferred = isChain
    ? others.filter((candidate) => candidate.type.toLocaleLowerCase('pt-BR').includes('pingente'))
    : others.filter((candidate) => candidate.type === product.type && candidate.audience === product.audience);
  const secondary = isChain
    ? others.filter((candidate) => !preferred.includes(candidate) && candidate.audience === product.audience)
    : others.filter((candidate) => !preferred.includes(candidate) && candidate.audience === product.audience);
  return [...preferred, ...secondary, ...others.filter((candidate) => !preferred.includes(candidate) && !secondary.includes(candidate))].slice(0, 4);
}

export async function generateMetadata({params}:{params:Promise<{slug:string}>}):Promise<Metadata> {
  const {slug}=await params; const result=await getProduct(slug); const product=result.product;
  if (result.unavailable) return {title:'Catálogo temporariamente indisponível',description:'A coleção Zibra está sendo atualizada. Tente novamente em alguns instantes.',robots:{index:false,follow:false}};
  if (!product) return {title:'Joia não encontrada',robots:{index:false,follow:false}};
  const canonical = `/joias/${encodeURIComponent(product.slug)}`;
  const seoTitle = product.seoTitle || product.name;
  const seoDescription = product.seoDescription || product.note;
  return { title:seoTitle, description:seoDescription, alternates:{canonical}, openGraph:{title:`${seoTitle} | ZIBRA`,description:seoDescription,url:canonical,siteName:'ZIBRA',locale:'pt_BR',type:'website',images:[{url:product.image,alt:product.name}]}, twitter:{card:'summary_large_image',title:`${seoTitle} | ZIBRA`,description:seoDescription,images:[product.image]} };
}

export default async function ProductPage({params}:{params:Promise<{slug:string}>}) {
  const {slug}=await params;
  const catalog=await getCatalog();
  const product=catalog.products.find((candidate) => candidate.slug === slug);
  if(catalog.source === 'unavailable') return <main className="detail-not-found"><p className="section-kicker">CATÁLOGO ZIBRA</p><h1>Estamos atualizando a coleção.</h1><p>O catálogo está temporariamente indisponível. Tente novamente em alguns instantes.</p><Link href="/">Voltar ao início <ArrowIcon className="arrow-icon-text" /></Link></main>;
  if(!product) notFound();
  const related=relatedProducts(product,catalog.products);
  const contactUrl=product.purchasable ? whatsappUrl(product) : null;
  const schemaAvailability={em_estoque:'https://schema.org/InStock',sob_consulta:'https://schema.org/LimitedAvailability',esgotado:'https://schema.org/OutOfStock'}[product.availabilityStatus];
  const productUrl=`${SITE_URL}/joias/${encodeURIComponent(product.slug)}`;
  const schema={ '@context':'https://schema.org','@type':'Product','@id':`${productUrl}#product`,name:product.name,image:product.gallery.map(absoluteUrl),description:product.description,brand:{'@type':'Brand',name:'ZIBRA'},...(product.reference ? {sku:product.reference} : {}),...(product.showPrice && product.priceValue ? {offers:{'@type':'Offer',url:productUrl,price:product.priceValue.toFixed(2),priceCurrency:product.currency,availability:schemaAvailability,itemCondition:'https://schema.org/NewCondition'}} : {}) };
  const unavailableLabel=product.availabilityStatus === 'esgotado' ? 'Peça esgotada' : 'WhatsApp em configuração';
  const serviceMessage=product.availabilityStatus === 'esgotado' ? 'Esta peça não está disponível no momento. Consulte a coleção para descobrir outras joias Zibra.' : 'Atendimento próximo para ajudar você a escolher com segurança.';
  return <main className="detail-page">
    <script type="application/ld+json" dangerouslySetInnerHTML={{__html:serializeJsonLd(schema)}}/>
    <header className="detail-header"><Link className="wordmark" href="/"><Image src="/zibra-wordmark-black.png" alt="ZIBRA" width={118} height={27} priority /></Link><BackToCatalog /></header>
    <section className="detail-layout"><ProductGallery images={product.gallery} name={product.name}/><div className="detail-copy"><p className="section-kicker">{product.type} · CURADORIA ZIBRA</p><h1>{product.name}</h1><p className="detail-note">{product.note}</p><p className="detail-description">{product.description}</p><dl><div><dt>Preço</dt><dd>{product.showPrice && product.price ? product.price : 'Negocie pelo WhatsApp'}</dd></div><div><dt>Perfil</dt><dd>{audienceLabels[product.audience]}</dd></div><div><dt>Material</dt><dd>{product.material}</dd></div><div><dt>Medidas</dt><dd>{product.measures}</dd></div>{product.ringSizes.length ? <div><dt>Numerações</dt><dd>{product.ringSizes.join(' · ')}</dd></div> : null}<div><dt>Disponibilidade</dt><dd>{product.availability}</dd></div>{product.reference ? <div><dt>Referência</dt><dd>{product.reference}</dd></div> : null}<div><dt>Cuidados</dt><dd>{product.care}</dd></div></dl>{product.purchasable ? <ProductPurchaseActions product={{slug:product.slug,name:product.name,image:product.image,price:product.showPrice ? product.price : undefined,reference:product.reference,ringSizes:product.ringSizes}} contactUrl={contactUrl}/> : <span className="detail-whatsapp is-disabled" aria-disabled="true">{unavailableLabel}</span>}<p className="detail-service">{serviceMessage}</p></div></section>
    <section className="detail-promise"><p>Embalagem exclusiva Zibra</p><p>Orientação de conservação</p><p>Uma joia escolhida para durar</p></section>
    {related.length ? <section className="related-products"><div><p className="section-kicker">COMBINE COM</p><h2>{product.type.toLocaleLowerCase('pt-BR').includes('corrente') ? 'Pingentes para esta corrente.' : 'Outras escolhas Zibra.'}</h2></div><div className="related-products-grid">{related.map((item) => <RelatedProductCard key={item.id || item.slug} product={{ slug:item.slug, name:item.name, image:item.image, type:item.type, audienceLabel:audienceLabels[item.audience], price:item.showPrice ? item.price : undefined, reference:item.reference, ringSizes:item.ringSizes }} />)}</div></section> : null}
  </main>;
}
