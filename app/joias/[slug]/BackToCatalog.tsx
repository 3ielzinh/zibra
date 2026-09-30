'use client';

import { useRouter } from 'next/navigation';
import ArrowIcon from '../../ArrowIcon';

export default function BackToCatalog() {
  const router = useRouter();
  return <button className="detail-back" type="button" onClick={() => {
    sessionStorage.setItem('zibra-restore-catalog', '1');
    if (document.referrer.startsWith(window.location.origin)) router.back();
    else router.push('/#colecao');
  }}>Voltar à coleção <ArrowIcon className="arrow-icon-text" /></button>;
}
