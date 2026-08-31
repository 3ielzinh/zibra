import Link from 'next/link';
import styles from './access.module.css';

const wpUrl = process.env.NEXT_PUBLIC_WP_URL?.replace(/\/$/, '') || '';
const loginUrl = wpUrl ? `${wpUrl}/wp-login.php` : '/wp-login.php';
const productsUrl = wpUrl ? `${wpUrl}/wp-admin/edit.php?post_type=produtos` : '/wp-admin/edit.php?post_type=produtos';

export default function AccessPage() {
  return <main className={styles.page}><header className={styles.header}><Link className={styles.wordmark} href="/"><img src="/zibra-wordmark-black.png" alt="ZIBRA" /></Link><Link className={styles.back} href="/">Voltar ao site ↗</Link></header><section className={styles.card} aria-labelledby="access-title"><p className={styles.kicker}>ÁREA RESERVADA ZIBRA</p><h1 id="access-title">Cuide do seu<br /><em>catálogo.</em></h1><p className={styles.lead}>Entre com seu usuário WordPress para atualizar produtos, imagens, categorias e destaques da vitrine.</p><div className={styles.actions}><a className={styles.primary} href={loginUrl}>Entrar com WordPress <span>↗</span></a><a className={styles.manage} href={productsUrl}>Já estou logado · Gerenciar produtos <span>→</span></a></div><p className={styles.note}>A Zibra não armazena sua senha. O acesso e as permissões são gerenciados com segurança pelo WordPress.</p></section></main>;
}
