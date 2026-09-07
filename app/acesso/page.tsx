import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import styles from './access.module.css';

const wpUrl = process.env.NEXT_PUBLIC_WP_URL?.replace(/\/$/, '') || '';

export const metadata: Metadata = {
  title: 'Gestão do catálogo | ZIBRA',
  description: 'Acesso administrativo ao catálogo da ZIBRA.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function AccessPage() {
  const isConfigured = Boolean(wpUrl);
  const loginUrl = isConfigured ? `${wpUrl}/wp-login.php` : '';
  const productsUrl = isConfigured ? `${wpUrl}/wp-admin/edit.php?post_type=produtos` : '';

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <Link className={styles.wordmark} href="/"><Image src="/zibra-wordmark-black.png" alt="ZIBRA" width={118} height={27} priority /></Link>
        <Link className={styles.back} href="/">Voltar ao site ↗</Link>
      </header>
      <section className={styles.card} aria-labelledby="access-title">
        <p className={styles.kicker}>ACESSO ADMINISTRATIVO</p>
        <h1 id="access-title">Gestão do<br /><em>catálogo.</em></h1>
        <p className={styles.lead}>Área reservada à equipe Zibra para cadastrar joias, organizar categorias e atualizar as informações exibidas na loja.</p>
        {isConfigured ? (
          <div className={styles.actions}>
            <a className={styles.primary} href={loginUrl} rel="noreferrer">Entrar com WordPress <span>↗</span></a>
            <a className={styles.manage} href={productsUrl} rel="noreferrer">Já estou conectado · Abrir produtos <span>→</span></a>
          </div>
        ) : (
          <div className={styles.pending} role="status">
            <strong>Integração em preparação</strong>
            <span>O acesso será liberado assim que o catálogo WordPress for conectado à loja.</span>
          </div>
        )}
        <div className={styles.resources} aria-label="Recursos do catálogo">
          <span>Produtos e rascunhos</span><span>Categorias livres</span><span>Fotos e galerias</span><span>Preço e disponibilidade</span>
        </div>
        <p className={styles.note}>A autenticação acontece diretamente no WordPress. A loja Zibra não recebe, armazena nem processa sua senha.</p>
      </section>
    </main>
  );
}
