'use client';
import { useState } from 'react';

export default function ProductGallery({ images, name }:{ images:string[]; name:string }) {
  const [active, setActive] = useState(images[0]);
  return <div className="detail-gallery"><div className="detail-main-image"><img src={active} alt={name} /></div>{images.length > 1 ? <div className="detail-thumbs">{images.map((image,index)=><button type="button" className={active===image?'is-active':''} onClick={()=>setActive(image)} key={image} aria-label={`Ver imagem ${index+1} de ${name}`}><img src={image} alt="" /></button>)}</div> : null}</div>;
}
