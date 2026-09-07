# Catálogo administrável Zibra

## Arquitetura

A loja pública permanece em Next.js. O WordPress funciona somente como painel protegido e fonte dos produtos:

1. A equipe acessa diretamente a rota reservada **/acesso** e entra no WordPress.
2. Cadastra ou edita produtos, categorias e imagens.
3. Apenas produtos publicados aparecem na API pública.
4. O servidor da loja consulta essa API e mantém o resultado em cache por cinco minutos.
5. Sem WordPress configurado, a vitrine usa apenas os produtos demonstrativos locais para desenvolvimento.
6. Com o WordPress configurado, produtos excluídos ou movidos para rascunho deixam de aparecer na loja.
7. Se houver uma falha temporária, a vitrine mantém a última versão válida disponível no processo. Em uma inicialização sem cache, exibe um aviso de indisponibilidade em vez de ressuscitar produtos demonstrativos antigos.

As credenciais nunca passam pelo frontend da loja.

## Instalação recomendada

1. Instale um WordPress limpo em um subdomínio, por exemplo \`catalogo.zibraoficial.com.br\`.
2. No painel WordPress, acesse **Plugins > Adicionar plugin > Enviar plugin**.
3. Envie e ative \`wordpress/zibra-catalog.zip\` (deste repositório). A ativação cria a função **Gerente do catálogo Zibra**, registra o tipo **Produtos** e semeia as categorias iniciais (Brincos, Colares, Correntes, Anéis, Pulseiras).
4. Crie o usuário do cliente com a função **Gerente do catálogo Zibra**.
5. Não conceda a função Administrador ao cliente.
6. Confirme que \`https://SEU-WORDPRESS/wp-json/wp/v2/produtos\` responde publicamente.

O fonte do plugin fica em \`wordpress/zibra-catalog.php\`; gere um novo \`wordpress/zibra-catalog.zip\` a partir dele sempre que editá-lo (a pasta interna do zip deve se chamar \`zibra-catalog/\`).

## O que o cliente pode gerenciar

- produtos publicados e rascunhos;
- categorias: as iniciais já vêm criadas e podem ser renomeadas, removidas ou ampliadas livremente;
- nome (título) e descrição (editor principal);
- resumo curto (campo Resumo);
- imagem principal (imagem destacada) e galeria (seletor de mídia, na lateral);
- preço em reais (campo numérico) com texto de preço opcional para sobrescrever a exibição;
- material, medidas e código de referência;
- disponibilidade em três estados: **Em estoque**, **Sob consulta** e **Esgotado**;
- cuidados e destaque;
- ordem de exibição (atributo de página `menu_order`).

Para retirar uma peça da vitrine sem apagá-la, altere o status para **Rascunho**.

Antes de publicar, o painel exige nome, resumo, descrição, categoria, imagem destacada, preço, material, medidas e código de referência. Se algo faltar, a joia volta automaticamente para **Rascunho** e um aviso indica o que preencher. A disponibilidade é sempre um dos três estados acima; peças esgotadas continuam visíveis, mas sem ação de compra.

## Conexão com a loja

Configure na hospedagem Node:

\`\`\`env
NEXT_PUBLIC_WP_URL=https://catalogo.zibraoficial.com.br
WP_API_URL=https://catalogo.zibraoficial.com.br/wp-json
NEXT_PUBLIC_WHATSAPP_NUMBER=55DDDNUMERO
\`\`\`

Depois, gere uma nova versão da aplicação. A rota reservada **/acesso** passará a abrir o login correto e o servidor da vitrine usará os produtos publicados no WordPress, sem expor a URL da API ao navegador. O número do WhatsApp deve conter somente dígitos, incluindo o código do país e o DDD; números ausentes ou inválidos deixam os botões desativados em vez de gerar um link quebrado.

## Segurança

- use HTTPS no WordPress;
- ative autenticação em dois fatores para administradores;
- mantenha WordPress e plugins atualizados;
- use uma senha exclusiva e forte;
- mantenha o cliente na função restrita **Gerente do catálogo Zibra**;
- não exponha senhas ou chaves em variáveis \`NEXT_PUBLIC_*\`.
