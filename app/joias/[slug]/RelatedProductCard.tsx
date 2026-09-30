'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useCart } from '../../Cart';

type Props = {
  product: {
    slug: string;
    name: string;
    image: string;
    type: string;
    audienceLabel: string;
    price?: string;
    reference?: string;
    ringSizes: string[];
  };
};

export default function RelatedProductCard({ product }: Props) {
  const { addItem } = useCart();
  const defaultSize = product.ringSizes[0];

  return <article>
    <div className="related-product-visual">
      <Link href={`/joias/${product.slug}`} className="related-product-image-link" aria-label={`Ver ${product.name}`}>
        <Image src={product.image} alt={product.name} fill sizes="(max-width: 800px) 50vw, 25vw" />
      </Link>
      <button className="related-add-to-cart" type="button" onClick={() => addItem({ slug: product.slug, name: product.name, image: product.image, price: product.price, reference: product.reference, size: defaultSize })}>
        Adicionar à sacola <span aria-hidden="true">+</span>
      </button>
    </div>
    <Link href={`/joias/${product.slug}`} className="related-product-info">
      <p>{product.type} · {product.audienceLabel}</p>
      <h3>{product.name}</h3>
    </Link>
  </article>;
}
