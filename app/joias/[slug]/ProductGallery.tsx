'use client';
import Image from 'next/image';
import { useState } from 'react';

export default function ProductGallery({ images, name }:{ images:string[]; name:string }) {
  const [active, setActive] = useState(images[0]);
  return <div className="detail-gallery"><div className="detail-main-image"><Image src={active} alt={name} fill sizes="(max-width: 800px) 90vw, 420px" quality={82} priority /></div>{images.length > 1 ? <div className="detail-thumbs">{images.map((image,index)=><button type="button" className={active===image?'is-active':''} onClick={()=>setActive(image)} key={image} aria-label={`Ver imagem ${index+1} de ${name}`}><Image src={image} alt="" fill sizes="72px" /></button>)}</div> : null}</div>;
}
