import Link from 'next/link';

const wpUrl = process.env.NEXT_PUBLIC_WP_URL?.replace(/\/$/, '') || '';
const loginUrl = wpUrl ? `${wpUrl}/wp-login.php` : '/wp-login.php';
const productsUrl = wpUrl ? `${wpUrl}/wp-admin/edit.php?post_type=produtos` : '/wp-admin/edit.php?post_type=produtos';

export default function AccessPage() {
  return <main className="access-page"><header className="access-header"><Link className="wordmark" href="/"><img src="/zibra-wordmark-black.png" alt="ZIBRA" /></Link><Link className="access-back" href="/">Voltar ao site ↗</Link></header><section className="access-card" aria-labelledby="access-title"><p className="section-kicker">ÁREA RESERVADA ZIBRA</p><h1 id="access-title">Cuide do seu<br /><em>catálogo.</em></h1><p className="access-lead">Entre com seu usuário WordPress para atualizar produtos, imagens, categorias e destaques da vitrine.</p><div className="access-actions"><a className="button button-dark" href={loginUrl}>Entrar com WordPress <span>↗</span></a><a className="access-manage" href={productsUrl}>Já estou logado · Gerenciar produtos <span>→</span></a></div><p className="access-note">A Zibra não armazena sua senha. O acesso e as permissões são gerenciados com segurança pelo WordPress.</p></section></main>;
}
