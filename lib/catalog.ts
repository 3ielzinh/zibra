export type AvailabilityStatus = 'em_estoque' | 'sob_consulta' | 'esgotado';
export type CatalogSource = 'wordpress' | 'fallback' | 'unavailable';
export type Product = { id?: number; slug: string; name: string; type: string; image: string; gallery: string[]; note: string; description: string; material: string; measures: string; care: string; availability: string; availabilityStatus: AvailabilityStatus; purchasable: boolean; price?: string; priceValue?: number; currency: 'BRL'; reference?: string; featured?: boolean };

type WordPressImage = { url?: string };
type WordPressCatalog = {
  categoria?: string; descricao_curta?: string; descricao?: string;
  imagem_principal?: string | WordPressImage; galeria?: unknown[] | string;
  material?: string; medidas?: string; cuidados?: string;
  disponibilidade?: string; disponibilidade_status?: AvailabilityStatus; pode_comprar?: boolean;
  preco?: string; preco_valor?: string | number; moeda?: string; referencia?: string;
  nome?: string; destaque?: boolean;
};
type WordPressProduct = {
  id?: number; slug?: string; sticky?: boolean;
  title?: { rendered?: string }; excerpt?: { rendered?: string }; content?: { rendered?: string };
  catalogo?: WordPressCatalog; acf?: WordPressCatalog; meta?: WordPressCatalog;
  _embedded?: { 'wp:featuredmedia'?: Array<{ source_url?: string }>; 'wp:term'?: Array<Array<{ name?: string }>> };
};

export const fallbackProducts: Product[] = [
  { slug:'brincos-gota-rosa', name:'Brincos Gota Rosa', type:'Brincos', image:'/zibra-brincos-studio-v3.png', gallery:['/zibra-brincos-studio-v3.png','/zibra-brincos-studio-v2.png'], note:'Delicadeza que ilumina', description:'Brincos delicados em formato de gota, com pedras rosadas e contorno luminoso. Uma peça marcante na medida certa.', material:'Prata com acabamento polido e pedras de brilho rosado', measures:'Formato compacto · vendidos em par', care:'Evite contato com perfumes, cremes e água. Guarde na embalagem Zibra.', availability:'Sob consulta', availabilityStatus:'sob_consulta', purchasable:true, currency:'BRL', featured:true },
  { slug:'colar-fe', name:'Colar Fé', type:'Colar', image:'/zibra-colar-studio-v2.png', gallery:['/zibra-colar-studio-v2.png','/zibra-colar.jpeg'], note:'Um símbolo para levar consigo', description:'Um colar delicado que transforma fé em presença cotidiana, com pingente de cruz de desenho contemporâneo.', material:'Prata com acabamento polido', measures:'Corrente delicada · pingente retangular', care:'Limpe com flanela macia e guarde separado de outras peças.', availability:'Sob consulta', availabilityStatus:'sob_consulta', purchasable:true, currency:'BRL', featured:true },
  { slug:'corrente-grumet', name:'Corrente Grumet', type:'Corrente', image:'/zibra-corrente-grumet-studio.png', gallery:['/zibra-corrente-grumet-studio.png'], note:'Presença em cada elo', description:'Elos clássicos com acabamento preciso e brilho equilibrado para uma presença segura e versátil.', material:'Prata com acabamento espelhado', measures:'Espessura média · comprimento sob consulta', care:'Evite abrasivos e produtos químicos. Guarde seca.', availability:'Sob consulta', availabilityStatus:'sob_consulta', purchasable:true, currency:'BRL' },
  { slug:'corrente-trama', name:'Corrente Trama', type:'Corrente', image:'/zibra-corrente-trama-studio.png', gallery:['/zibra-corrente-trama-studio.png'], note:'Textura que captura a luz', description:'Uma trama refinada que acompanha o movimento e cria pontos sutis de luz sobre a pele.', material:'Prata com acabamento polido', measures:'Trama delicada · comprimento sob consulta', care:'Use flanela própria para prata e mantenha longe da umidade.', availability:'Sob consulta', availabilityStatus:'sob_consulta', purchasable:true, currency:'BRL' },
];

export function normalizeWordPressProduct(value: unknown): Product {
  const item = value as WordPressProduct;
  const meta = item.catalogo || item.acf || item.meta || {};
  const imageValue = meta.imagem_principal || item?._embedded?.['wp:featuredmedia']?.[0]?.source_url || '/zibra-brincos-studio-v3.png';
  const image = typeof imageValue === 'object' ? imageValue.url || '/zibra-brincos-studio-v3.png' : imageValue;
  const gallery = Array.isArray(meta.galeria)
    ? meta.galeria.map((entry) => typeof entry === 'object' && entry !== null ? (entry as WordPressImage).url : String(entry)).filter((entry): entry is string => Boolean(entry))
    : typeof meta.galeria === 'string' ? meta.galeria.split(',').map((entry) => entry.trim()).filter(Boolean) : [];
  const clean = (content: unknown = '') => String(content).replace(/<[^>]+>/g, '').trim();
  const legacyAvailability = clean(meta.disponibilidade).toLowerCase();
  const availabilityStatus: AvailabilityStatus = meta.disponibilidade_status
    || (legacyAvailability.includes('esgot') ? 'esgotado' : legacyAvailability.includes('estoque') || legacyAvailability.includes('pronta') ? 'em_estoque' : 'sob_consulta');
  const priceValue = Number(meta.preco_valor);
  const normalizedPriceValue = Number.isFinite(priceValue) && priceValue > 0 ? priceValue : undefined;
  const price = meta.preco || (normalizedPriceValue ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(normalizedPriceValue) : '');
  const availability = meta.disponibilidade || ({ em_estoque: 'Em estoque', sob_consulta: 'Sob consulta', esgotado: 'Esgotado' } as const)[availabilityStatus];
  const purchasable = typeof meta.pode_comprar === 'boolean' ? meta.pode_comprar : availabilityStatus !== 'esgotado';
  return { id:item.id, slug:item.slug || String(item.id), name:clean(item.title?.rendered) || meta.nome || 'Joia Zibra', type:meta.categoria || item._embedded?.['wp:term']?.[0]?.[0]?.name || 'Joias', image, gallery:gallery.length ? gallery : [image], note:meta.descricao_curta || clean(item.excerpt?.rendered) || 'Elegância em cada detalhe', description:meta.descricao || clean(item.content?.rendered) || clean(item.excerpt?.rendered), material:meta.material || 'Informação sob consulta', measures:meta.medidas || 'Informação sob consulta', care:meta.cuidados || 'Guarde na embalagem Zibra e evite contato com produtos químicos.', availability, availabilityStatus, purchasable, price, priceValue:normalizedPriceValue, currency:'BRL', reference:meta.referencia || '', featured:Boolean(meta.destaque || item.sticky) };
}

type WhatsappProduct = Pick<Product, 'name' | 'reference'>;

const whatsappNumber = (process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '').replace(/\D/g, '');

export const isWhatsappConfigured = /^[1-9]\d{9,14}$/.test(whatsappNumber);

export function whatsappUrl(product?: WhatsappProduct): string | null {
  if (!isWhatsappConfigured) return null;

  const reference = product?.reference?.trim();
  const message = product
    ? `Olá! Gostaria de consultar e comprar a joia ${product.name}${reference ? ` (ref. ${reference})` : ''}.`
    : 'Olá! Gostaria de conhecer melhor a coleção Zibra.';

  return `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
}
