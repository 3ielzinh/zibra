'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';
import { defaultPackagingSlides, type PackagingSlide } from '../lib/packaging';

export default function PackagingCarousel({ slides = defaultPackagingSlides }: { slides?: PackagingSlide[] }) {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const safeSlides = slides.length ? slides : defaultPackagingSlides;
  const move = (direction: number) => setActive((current) => (current + direction + safeSlides.length) % safeSlides.length);

  useEffect(() => {
    if (paused || safeSlides.length < 2 || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const timer = window.setInterval(() => setActive((current) => (current + 1) % safeSlides.length), 3000);
    return () => window.clearInterval(timer);
  }, [paused, safeSlides.length]);

  return <div className="packaging-carousel" aria-label="Fotos das embalagens Zibra" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)} onFocusCapture={() => setPaused(true)} onBlurCapture={() => setPaused(false)}>
    <div className="packaging-slide"><Image src={safeSlides[active]?.src || defaultPackagingSlides[0].src} alt={safeSlides[active]?.alt || defaultPackagingSlides[0].alt} fill sizes="(max-width: 800px) 100vw, 55vw" quality={82} /></div>
    <div className="packaging-controls"><span>{String(active + 1).padStart(2, '0')} / {String(safeSlides.length).padStart(2, '0')}</span><div><button type="button" onClick={() => move(-1)} aria-label="Foto anterior">←</button><button type="button" onClick={() => move(1)} aria-label="Próxima foto">→</button></div></div>
  </div>;
}
