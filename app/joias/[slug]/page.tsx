import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { cache } from 'react';
import ProductGallery from './ProductGallery';
import { whatsappUrl } from '../../../lib/catalog';
import { getCatalogProduct } from '../../../lib/catalog-server';

const getProduct = cache((slug: string) => getCatalogProduct(slug));

export async function generateMetadata({params}:{params:Promise<{slug:string}>}):Promise<Metadata> {
  const {slug}=await params; const result=await getProduct(slug); const product=result.product;
  if (result.unavailable) return {title:'Catálogo temporariamente indisponível | ZIBRA',description:'A coleção Zibra está sendo atualizada. Tente novamente em alguns instantes.',robots:{index:false,follow:false}};
  if (!product) return {title:'Joia não encontrada | ZIBRA'};
  return { title:`${product.name} | ZIBRA`, description:product.note, openGraph:{title:`${product.name} | ZIBRA`,description:product.note,images:[{url:product.image,alt:product.name}]}, twitter:{card:'summary_large_image',title:`${product.name} | ZIBRA`,description:product.note,images:[product.image]} };
}

export default async function ProductPage({params}:{params:Promise<{slug:string}>}) {
  const {slug}=await params; const result=await getProduct(slug); const product=result.product;
  if(result.unavailable) return <main className="detail-not-found"><p className="section-kicker">CATÁLOGO ZIBRA</p><h1>Estamos atualizando a coleção.</h1><p>O catálogo está temporariamente indisponível. Tente novamente em alguns instantes.</p><Link href="/">Voltar ao início ↗</Link></main>;
  if(!product) notFound();
  const contactUrl=product.purchasable ? whatsappUrl(product) : null;
  const schemaAvailability={em_estoque:'https://schema.org/InStock',sob_consulta:'https://schema.org/PreOrder',esgotado:'https://schema.org/OutOfStock'}[product.availabilityStatus];
  const schema={ '@context':'https://schema.org','@type':'Product',name:product.name,image:product.gallery,description:product.description,brand:{'@type':'Brand',name:'Zibra'},offers:{'@type':'Offer',availability:schemaAvailability,url:`/joias/${product.slug}`,...(product.priceValue ? {price:product.priceValue.toFixed(2),priceCurrency:product.currency} : {})} };
  const unavailableLabel=product.availabilityStatus === 'esgotado' ? 'Peça esgotada' : 'WhatsApp em configuração';
  const serviceMessage=product.availabilityStatus === 'esgotado' ? 'Esta peça não está disponível no momento. Consulte a coleção para descobrir outras joias Zibra.' : 'Atendimento próximo para ajudar você a escolher com segurança.';
  return <main className="detail-page"><script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(schema)}}/><header className="detail-header"><Link className="wordmark" href="/"><Image src="/zibra-wordmark-black.png" alt="ZIBRA" width={118} height={27} priority /></Link><Link href="/#colecao">Voltar à coleção ↗</Link></header><section className="detail-layout"><ProductGallery images={product.gallery} name={product.name}/><div className="detail-copy"><p className="section-kicker">{product.type} · CURADORIA ZIBRA</p><h1>{product.name}</h1><p className="detail-note">{product.note}</p><p className="detail-description">{product.description}</p><dl>{product.price ? <div><dt>Preço</dt><dd>{product.price}</dd></div> : null}<div><dt>Material</dt><dd>{product.material}</dd></div><div><dt>Medidas</dt><dd>{product.measures}</dd></div><div><dt>Disponibilidade</dt><dd>{product.availability}</dd></div>{product.reference ? <div><dt>Referência</dt><dd>{product.reference}</dd></div> : null}<div><dt>Cuidados</dt><dd>{product.care}</dd></div></dl>{contactUrl ? <a className="detail-whatsapp" href={contactUrl} target="_blank" rel="noreferrer">Consultar e comprar pelo WhatsApp <span>↗</span></a> : <span className="detail-whatsapp is-disabled" aria-disabled="true">{unavailableLabel}</span>}<p className="detail-service">{serviceMessage}</p></div></section><section className="detail-promise"><p>Embalagem exclusiva Zibra</p><p>Orientação de conservação</p><p>Uma joia escolhida para durar</p></section></main>;
}
