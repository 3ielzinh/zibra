'use client';

import Image from 'next/image';
import type { PointerEvent } from 'react';
import { useCallback, useEffect, useMemo, useState } from 'react';

export default function ProductGallery({ images, name }:{ images:string[]; name:string }) {
  const uniqueImages = useMemo(() => Array.from(new Set(images.filter(Boolean))), [images]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);
  const active = uniqueImages[activeIndex] || images[0];

  const move = useCallback((direction:number) => {
    setActiveIndex((current) => (current + direction + uniqueImages.length) % uniqueImages.length);
    setIsZoomed(false);
  }, [uniqueImages.length]);

  useEffect(() => {
    if (!isLightboxOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const handleKeyDown = (event:KeyboardEvent) => {
      if (event.key === 'Escape') setIsLightboxOpen(false);
      if (event.key === 'ArrowLeft' && uniqueImages.length > 1) move(-1);
      if (event.key === 'ArrowRight' && uniqueImages.length > 1) move(1);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isLightboxOpen, uniqueImages.length, move]);

  const trackZoom = (event: PointerEvent<HTMLDivElement>) => {
    const bounds = event.currentTarget.getBoundingClientRect();
    const x = Math.min(100, Math.max(0, ((event.clientX - bounds.left) / bounds.width) * 100));
    const y = Math.min(100, Math.max(0, ((event.clientY - bounds.top) / bounds.height) * 100));
    event.currentTarget.style.setProperty('--zoom-x', `${x}%`);
    event.currentTarget.style.setProperty('--zoom-y', `${y}%`);
  };
  const resetZoomPosition = (event: PointerEvent<HTMLDivElement>) => {
    event.currentTarget.style.setProperty('--zoom-x', '50%');
    event.currentTarget.style.setProperty('--zoom-y', '50%');
  };
  const closeLightbox = () => {
    setIsZoomed(false);
    setIsLightboxOpen(false);
  };

  return <div className="detail-gallery">
    <div className="detail-main-image">
      <Image src={active} alt={`${name} — foto ${activeIndex + 1}`} fill sizes="(max-width: 800px) 90vw, 420px" quality={82} priority />
      <button className="detail-open-image" type="button" onClick={()=>{setIsZoomed(false);setIsLightboxOpen(true);}} aria-label={`Abrir foto ${activeIndex + 1} de ${name} em tela ampliada`}><span>Ampliar imagem</span></button>
      {uniqueImages.length > 1 ? <div className="detail-gallery-arrows"><button type="button" onClick={()=>move(-1)} aria-label="Foto anterior">←</button><button type="button" onClick={()=>move(1)} aria-label="Próxima foto">→</button></div> : null}
      <span className="detail-gallery-count">{activeIndex + 1} / {uniqueImages.length}</span>
    </div>
    {uniqueImages.length > 1 ? <div className="detail-thumbs">{uniqueImages.map((image,index)=><button type="button" className={activeIndex===index?'is-active':''} onClick={()=>{setActiveIndex(index);setIsZoomed(false);}} key={`${image}-${index}`} aria-label={`Ver imagem ${index+1} de ${name}`}><Image src={image} alt="" fill sizes="72px" /></button>)}</div> : null}
    {isLightboxOpen ? <div className="product-lightbox" role="dialog" aria-modal="true" aria-label={`Galeria ampliada de ${name}`} onClick={closeLightbox}>
      <button className="product-lightbox-close" type="button" onClick={closeLightbox} aria-label="Fechar imagem ampliada" autoFocus>×</button>
      {uniqueImages.length > 1 ? <button className="product-lightbox-nav product-lightbox-nav--previous" type="button" onClick={(event)=>{event.stopPropagation();move(-1);}} aria-label="Foto anterior">←</button> : null}
      <div className={`product-lightbox-image${isZoomed ? ' is-zoomed' : ''}`} onClick={(event)=>{event.stopPropagation();setIsZoomed((current)=>!current);}} onPointerMove={trackZoom} onPointerLeave={resetZoomPosition}>
        <Image src={active} alt={`${name} — foto ${activeIndex + 1} ampliada`} fill sizes="94vw" quality={95} priority />
      </div>
      {uniqueImages.length > 1 ? <button className="product-lightbox-nav product-lightbox-nav--next" type="button" onClick={(event)=>{event.stopPropagation();move(1);}} aria-label="Próxima foto">→</button> : null}
      <p className="product-lightbox-hint">{isZoomed ? 'Mova o mouse para explorar · clique para reduzir' : 'Clique na imagem para aproximar'} <span>{activeIndex + 1} / {uniqueImages.length}</span></p>
    </div> : null}
  </div>;
}
