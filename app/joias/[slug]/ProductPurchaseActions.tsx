'use client';

import { useState } from 'react';
import { useCart } from '../../Cart';
import { whatsappUrl } from '../../../lib/catalog';

type Props = {
  product: { slug: string; name: string; image: string; price?: string; reference?: string; ringSizes: string[] };
  contactUrl: string | null;
};

export default function ProductPurchaseActions({ product, contactUrl }: Props) {
  const [size, setSize] = useState(product.ringSizes[0] || '');
  const { addItem } = useCart();
  const selectedContactUrl = contactUrl ? whatsappUrl(product, size) : null;

  return <div className="purchase-actions">
    {product.ringSizes.length ? <fieldset className="ring-sizes"><legend>Escolha a numeração</legend><div>{product.ringSizes.map((value) => <button type="button" className={size === value ? 'is-active' : ''} aria-pressed={size === value} onClick={() => setSize(value)} key={value}>{value}</button>)}</div></fieldset> : null}
    <button className="add-to-cart" type="button" onClick={() => addItem({ ...product, size: size || undefined })}>Adicionar ao carrinho <span>+</span></button>
    {selectedContactUrl ? <a className="detail-whatsapp" href={selectedContactUrl} target="_blank" rel="noreferrer">Negociar pelo WhatsApp <span className="zibra-spark" aria-hidden="true">✦</span></a> : null}
  </div>;
}
