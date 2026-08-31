import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import ProductGallery from './ProductGallery';
import { fallbackProducts, normalizeWordPressProduct, whatsappUrl } from '../../../lib/catalog';

async function getProduct(slug:string) {
  const local = fallbackProducts.find(product=>product.slug===slug);
  const api = process.env.NEXT_PUBLIC_WP_API_URL?.replace(/\/$/,'');
  if (!api) return local;
  try { const response = await fetch(`${api}/wp/v2/produtos?slug=${encodeURIComponent(slug)}&_embed=1`, { next:{ revalidate:300 } }); const items = response.ok ? await response.json() as unknown[] : []; return items[0] ? normalizeWordPressProduct(items[0]) : local; } catch { return local; }
}

export async function generateMetadata({params}:{params:Promise<{slug:string}>}):Promise<Metadata> {
  const {slug}=await params; const product=await getProduct(slug);
  if (!product) return {title:'Joia não encontrada — ZIBRA'};
  return { title:`${product.name} — ZIBRA`, description:product.note, openGraph:{title:`${product.name} — ZIBRA`,description:product.note,images:[{url:product.image,alt:product.name}]}, twitter:{card:'summary_large_image',title:`${product.name} — ZIBRA`,description:product.note,images:[product.image]} };
}

export default async function ProductPage({params}:{params:Promise<{slug:string}>}) {
  const {slug}=await params; const product=await getProduct(slug); if(!product) notFound();
  const schema={ '@context':'https://schema.org','@type':'Product',name:product.name,image:product.gallery,description:product.description,brand:{'@type':'Brand',name:'Zibra'},offers:{'@type':'Offer',availability:'https://schema.org/InStock',url:`/joias/${product.slug}`} };
  return <main className="detail-page"><script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(schema)}}/><header className="detail-header"><Link className="wordmark" href="/"><img src="/zibra-wordmark-black.png" alt="ZIBRA" /></Link><Link href="/#colecao">Voltar à coleção ↗</Link></header><section className="detail-layout"><ProductGallery images={product.gallery} name={product.name}/><div className="detail-copy"><p className="section-kicker">{product.type} · CURADORIA ZIBRA</p><h1>{product.name}</h1><p className="detail-note">{product.note}</p><p className="detail-description">{product.description}</p><dl><div><dt>Material</dt><dd>{product.material}</dd></div><div><dt>Medidas</dt><dd>{product.measures}</dd></div><div><dt>Disponibilidade</dt><dd>{product.availability}</dd></div><div><dt>Cuidados</dt><dd>{product.care}</dd></div></dl><a className="detail-whatsapp" href={whatsappUrl(product.name)} target="_blank" rel="noreferrer">Consultar pelo WhatsApp <span>↗</span></a><p className="detail-service">Atendimento próximo para ajudar você a escolher com segurança.</p></div></section><section className="detail-promise"><p>Embalagem exclusiva Zibra</p><p>Orientação de conservação</p><p>Uma joia escolhida para durar</p></section></main>;
}
