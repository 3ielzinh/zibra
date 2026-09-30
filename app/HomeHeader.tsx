'use client';

import Image from 'next/image';
import { useState } from 'react';

export default function HomeHeader() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="nav-shell">
      <a className="wordmark" href="#inicio" aria-label="Zibra, início"><Image src="/zibra-wordmark-white.png" alt="ZIBRA" width={118} height={27} priority /></a>
      <nav className={menuOpen ? 'is-open' : ''} aria-label="Navegação principal">
        <a href="#colecao">Coleção</a><a href="#experiencia">Experiência</a><a href="#essencia">Nossa essência</a>
      </nav>
      <div className="nav-actions"><a className="nav-cta" href="#contato">Atendimento</a><button className="menu-toggle" type="button" aria-label="Abrir menu" aria-expanded={menuOpen} onClick={() => setMenuOpen((value) => !value)}>{menuOpen ? '×' : '☰'}</button></div>
    </header>
  );
}
