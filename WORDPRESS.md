# Integração WordPress — Zibra

O frontend continua funcional sem WordPress usando os quatro produtos de fallback. Para ativar o catálogo administrável, defina `NEXT_PUBLIC_WP_API_URL` com a URL base do WordPress (por exemplo, `https://loja.exemplo.com/wp-json`) antes do build.

## Área de acesso

O link **Área do cliente** abre `/acesso`, uma tela que encaminha para o login nativo do WordPress (`wp-login.php`) e para a lista de Produtos (`wp-admin/edit.php?post_type=produtos`). Defina também `NEXT_PUBLIC_WP_URL`. Nenhuma senha passa pelo frontend Zibra e não existe autenticação paralela.

## Instalação

1. Copie `wordpress/zibra-catalog.php` para `wp-content/plugins/zibra-catalog/` e ative **Zibra Catalog** no painel.
2. Em **Produtos**, cadastre título, descrição/excerpt, imagem destacada e categoria. Os campos editoriais `categoria`, `descricao_curta`, `imagem_principal`, `galeria` e `destaque` podem ser criados com ACF (recomendado) ou pelo plugin de campos já usado pelo projeto.
3. Use a ordem do atributo **Ordem** do WordPress para ordenar a vitrine; publique apenas itens ativos.
4. Configure CORS no servidor para permitir o domínio do frontend e garanta que imagens sejam públicas via HTTPS.
5. Faça um novo build do frontend após definir a variável de ambiente. O endpoint consultado é `/wp/v2/produtos?per_page=100&_embed=1&orderby=menu_order&order=asc`.

## Permissões e migração

O login e as permissões permanecem no WordPress: administradores/editoras gerenciam Produtos no painel sem criar autenticação paralela. Para migrar os quatro itens atuais, crie-os como Produtos, envie as imagens para a biblioteca e replique categoria, descrição e destaque. O frontend usa fallback local se a API estiver indisponível.
