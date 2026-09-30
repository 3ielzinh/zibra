'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { createContext, useContext, useEffect, useMemo, useState } from 'react';

export type CartProduct = {
  slug: string;
  name: string;
  image: string;
  price?: string;
  reference?: string;
  size?: string;
};

type CartItem = CartProduct & { key: string; quantity: number };
type CartContextValue = { addItem: (product: CartProduct) => void; openCart: () => void };

const CartContext = createContext<CartContextValue | null>(null);
const STORAGE_KEY = 'zibra-cart-v1';

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart deve ser usado dentro de CartProvider');
  return context;
}

export default function CartProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [items, setItems] = useState<CartItem[]>([]);
  const [open, setOpen] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    queueMicrotask(() => {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) setItems(JSON.parse(stored));
      } catch { /* Mantém o carrinho utilizável mesmo sem armazenamento. */ }
      setReady(true);
    });
  }, []);

  useEffect(() => {
    if (ready) localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items, ready]);

  const value = useMemo<CartContextValue>(() => ({
    addItem(product) {
      const key = `${product.slug}:${product.size || ''}`;
      setItems((current) => {
        const existing = current.find((item) => item.key === key);
        return existing
          ? current.map((item) => item.key === key ? { ...item, quantity: item.quantity + 1 } : item)
          : [...current, { ...product, key, quantity: 1 }];
      });
      setOpen(true);
    },
    openCart: () => setOpen(true),
  }), []);

  const count = items.reduce((total, item) => total + item.quantity, 0);
  const whatsappNumber = (process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '').replace(/\D/g, '');
  const checkoutMessage = [
    'Olá! Gostaria de finalizar meu pedido Zibra:',
    ...items.map((item) => `• ${item.quantity}x ${item.name}${item.size ? ` · aro ${item.size}` : ''}${item.reference ? ` · ref. ${item.reference}` : ''}${item.price ? ` · ${item.price}` : ' · valor sob consulta'}`),
    '',
    'Podem confirmar a disponibilidade e o valor final?'
  ].join('\n');
  const checkoutUrl = whatsappNumber ? `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(checkoutMessage)}` : null;

  return <CartContext.Provider value={value}>
    {children}
    <button className="cart-trigger" type="button" onClick={() => setOpen(true)} aria-label={`Abrir carrinho com ${count} item(ns)`}>
      <span aria-hidden="true">Sacola</span><strong>{count}</strong>
    </button>
    <div className={`cart-overlay ${open ? 'is-open' : ''}`} onClick={() => setOpen(false)} aria-hidden={!open} />
    <aside className={`cart-drawer ${open ? 'is-open' : ''}`} aria-hidden={!open} aria-label="Carrinho de compras">
      <header><div><small>SUA SELEÇÃO</small><h2>Carrinho</h2></div><button type="button" onClick={() => setOpen(false)} aria-label="Fechar carrinho">×</button></header>
      <div className="cart-items">
        {items.length ? items.map((item) => <article key={item.key}>
          <div className="cart-item-image"><Image src={item.image} alt="" fill sizes="82px" /></div>
          <div><h3>{item.name}</h3>{item.size ? <p>Aro {item.size}</p> : null}<p>{item.price || 'Valor sob consulta'}</p><div className="cart-quantity"><button type="button" aria-label={`Diminuir ${item.name}`} onClick={() => setItems((current) => current.flatMap((entry) => entry.key !== item.key ? [entry] : entry.quantity > 1 ? [{ ...entry, quantity: entry.quantity - 1 }] : []))}>−</button><span>{item.quantity}</span><button type="button" aria-label={`Aumentar ${item.name}`} onClick={() => setItems((current) => current.map((entry) => entry.key === item.key ? { ...entry, quantity: entry.quantity + 1 } : entry))}>+</button></div></div>
          <button className="cart-remove" type="button" onClick={() => setItems((current) => current.filter((entry) => entry.key !== item.key))}>Remover</button>
        </article>) : <div className="cart-empty"><p>Sua sacola está vazia.</p><button type="button" onClick={() => { setOpen(false); router.push('/#colecao'); }}>Conhecer a coleção</button></div>}
      </div>
      {items.length ? <footer><p>O pagamento e a disponibilidade serão confirmados no atendimento.</p>{checkoutUrl ? <a href={checkoutUrl} target="_blank" rel="noreferrer">Finalizar pelo WhatsApp <span className="zibra-spark" aria-hidden="true">✦</span></a> : <span>WhatsApp em configuração</span>}</footer> : null}
    </aside>
  </CartContext.Provider>;
}
