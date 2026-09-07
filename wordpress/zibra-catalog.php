<?php
/**
 * Plugin Name: Zibra Catálogo
 * Description: Gestão segura de produtos, categorias e imagens da vitrine Zibra.
 * Version: 2.1.0
 * Requires at least: 6.4
 * Requires PHP: 8.0
 */
if (!defined('ABSPATH')) exit;

const ZIBRA_CATALOG_VERSION = '2.1.0';

/** Estados de disponibilidade aceitos pela vitrine (espelham lib/catalog.ts). */
function zibra_availability_options() {
  return [
    'em_estoque' => 'Em estoque',
    'sob_consulta' => 'Sob consulta',
    'esgotado' => 'Esgotado',
  ];
}

/** Categorias sugeridas criadas na ativação, sem sobrescrever o que o cliente já organizou. */
function zibra_seed_categories() {
  return ['Brincos', 'Colares', 'Correntes', 'Anéis', 'Pulseiras'];
}

add_action('after_setup_theme', function () {
  add_theme_support('post-thumbnails', ['produtos']);
});

function zibra_product_capabilities() {
  return [
    'edit_produtos', 'edit_others_produtos', 'edit_private_produtos',
    'edit_published_produtos', 'publish_produtos', 'read_private_produtos',
    'delete_produtos', 'delete_private_produtos', 'delete_published_produtos',
    'delete_others_produtos', 'manage_product_categories',
    'edit_product_categories', 'delete_product_categories',
    'assign_product_categories', 'upload_files'
  ];
}

function zibra_activate_catalog() {
  $role = add_role('gerente_catalogo_zibra', 'Gerente do catálogo Zibra', ['read' => true]);
  if (!$role) $role = get_role('gerente_catalogo_zibra');
  $administrator = get_role('administrator');
  foreach (zibra_product_capabilities() as $capability) {
    if ($role) $role->add_cap($capability);
    if ($administrator) $administrator->add_cap($capability);
  }
  zibra_register_catalog_content();
  foreach (zibra_seed_categories() as $name) {
    if (!term_exists($name, 'categoria_produto')) wp_insert_term($name, 'categoria_produto');
  }
  update_option('zibra_catalog_version', ZIBRA_CATALOG_VERSION);
  flush_rewrite_rules();
}
register_activation_hook(__FILE__, 'zibra_activate_catalog');

add_action('admin_init', function () {
  if (get_option('zibra_catalog_version') !== ZIBRA_CATALOG_VERSION && current_user_can('activate_plugins')) zibra_activate_catalog();
});

function zibra_register_catalog_content() {
  register_taxonomy('categoria_produto', ['produtos'], [
    'labels' => [
      'name' => 'Categorias', 'singular_name' => 'Categoria',
      'search_items' => 'Buscar categorias', 'all_items' => 'Todas as categorias',
      'edit_item' => 'Editar categoria', 'update_item' => 'Atualizar categoria',
      'add_new_item' => 'Adicionar categoria', 'new_item_name' => 'Nome da nova categoria',
      'menu_name' => 'Categorias',
    ],
    'public' => true, 'show_in_rest' => true, 'rest_base' => 'categorias-produto',
    'hierarchical' => true, 'rewrite' => ['slug' => 'categoria-joia'],
    'capabilities' => [
      'manage_terms' => 'manage_product_categories',
      'edit_terms' => 'edit_product_categories',
      'delete_terms' => 'delete_product_categories',
      'assign_terms' => 'assign_product_categories',
    ],
  ]);

  register_post_type('produtos', [
    'labels' => [
      'name' => 'Produtos', 'singular_name' => 'Produto', 'menu_name' => 'Catálogo Zibra',
      'add_new' => 'Adicionar produto', 'add_new_item' => 'Adicionar novo produto',
      'edit_item' => 'Editar produto', 'new_item' => 'Novo produto',
      'view_item' => 'Visualizar produto', 'search_items' => 'Buscar produtos',
      'not_found' => 'Nenhum produto encontrado', 'not_found_in_trash' => 'Nenhum produto na lixeira',
      'all_items' => 'Todos os produtos',
    ],
    'public' => true, 'show_in_rest' => true, 'rest_base' => 'produtos',
    'menu_icon' => 'dashicons-art', 'menu_position' => 5,
    'supports' => ['title', 'editor', 'excerpt', 'thumbnail', 'page-attributes'],
    'taxonomies' => ['categoria_produto'], 'rewrite' => ['slug' => 'produtos'],
    'capability_type' => ['produto', 'produtos'], 'map_meta_cap' => true,
  ]);
}
add_action('init', 'zibra_register_catalog_content');

function zibra_catalog_category($post_id) {
  $terms = get_the_terms($post_id, 'categoria_produto');
  if (is_array($terms) && !empty($terms)) return $terms[0]->name;
  return (string) get_post_meta($post_id, 'categoria', true);
}

function zibra_catalog_image($post_id) {
  $featured = get_the_post_thumbnail_url($post_id, 'full');
  return $featured ?: (string) get_post_meta($post_id, 'imagem_principal', true);
}

function zibra_catalog_gallery($post_id) {
  $urls = [];
  $featured = zibra_catalog_image($post_id);
  if ($featured) $urls[] = $featured;
  $ids = array_filter(array_map('absint', explode(',', (string) get_post_meta($post_id, 'galeria_ids', true))));
  foreach ($ids as $attachment_id) {
    $url = wp_get_attachment_image_url($attachment_id, 'full');
    if ($url) $urls[] = $url;
  }
  if (count($urls) < 2) {
    $legacy = array_filter(array_map('trim', explode(',', (string) get_post_meta($post_id, 'galeria', true))));
    foreach ($legacy as $url) if (wp_http_validate_url($url)) $urls[] = $url;
  }
  return array_values(array_unique($urls));
}

/** Estado de disponibilidade normalizado, com leitura retrocompatível do campo antigo de texto livre. */
function zibra_catalog_availability_status($post_id) {
  $status = (string) get_post_meta($post_id, 'disponibilidade_status', true);
  if (isset(zibra_availability_options()[$status])) return $status;
  $legacy = strtolower((string) get_post_meta($post_id, 'disponibilidade', true));
  if (str_contains($legacy, 'esgot')) return 'esgotado';
  if (str_contains($legacy, 'estoque') || str_contains($legacy, 'pronta')) return 'em_estoque';
  return 'sob_consulta';
}

function zibra_catalog_price_value($post_id) {
  $raw = str_replace(',', '.', (string) get_post_meta($post_id, 'preco_valor', true));
  $value = is_numeric($raw) ? (float) $raw : 0.0;
  return $value > 0 ? round($value, 2) : null;
}

add_action('rest_api_init', function () {
  register_rest_field('produtos', 'catalogo', [
    'get_callback' => function ($post) {
      $post_id = (int) $post['id'];
      $status = zibra_catalog_availability_status($post_id);
      $labels = zibra_availability_options();
      return [
        'categoria' => zibra_catalog_category($post_id),
        'descricao_curta' => get_the_excerpt($post_id),
        'descricao' => wp_strip_all_tags((string) get_post_field('post_content', $post_id)),
        'imagem_principal' => zibra_catalog_image($post_id),
        'galeria' => zibra_catalog_gallery($post_id),
        'preco' => (string) get_post_meta($post_id, 'preco', true),
        'preco_valor' => zibra_catalog_price_value($post_id),
        'moeda' => 'BRL',
        'destaque' => (bool) get_post_meta($post_id, 'destaque', true),
        'material' => (string) get_post_meta($post_id, 'material', true),
        'medidas' => (string) get_post_meta($post_id, 'medidas', true),
        'cuidados' => (string) get_post_meta($post_id, 'cuidados', true),
        'disponibilidade' => $labels[$status],
        'disponibilidade_status' => $status,
        'pode_comprar' => $status !== 'esgotado',
        'referencia' => (string) get_post_meta($post_id, 'referencia', true),
        'ordem' => (int) get_post_field('menu_order', $post_id),
      ];
    },
    'schema' => ['description' => 'Informações públicas do catálogo Zibra.', 'type' => 'object'],
  ]);
});

add_action('add_meta_boxes', function () {
  add_meta_box('zibra_product_details', 'Informações da joia', 'zibra_render_product_details', 'produtos', 'normal', 'high');
  add_meta_box('zibra_product_gallery', 'Galeria da joia', 'zibra_render_product_gallery', 'produtos', 'side', 'default');
});

function zibra_render_product_details($post) {
  wp_nonce_field('zibra_save_product', 'zibra_product_nonce');
  echo '<p style="color:#646970">Use o título para o nome, o resumo para a frase curta, o editor principal para a descrição e a imagem destacada como foto principal. Os campos abaixo são exigidos para publicar.</p>';

  $price_value = (string) get_post_meta($post->ID, 'preco_valor', true);
  echo '<p><label style="display:block;font-weight:600;margin-bottom:5px" for="zibra_preco_valor">Preço (R$)</label><input style="width:100%" type="number" min="0" step="0.01" inputmode="decimal" id="zibra_preco_valor" name="zibra_preco_valor" value="'.esc_attr($price_value).'" placeholder="Exemplo: 289.00" /></p>';

  $price_label = (string) get_post_meta($post->ID, 'preco', true);
  echo '<p><label style="display:block;font-weight:600;margin-bottom:5px" for="zibra_preco">Texto de preço (opcional)</label><input style="width:100%" type="text" id="zibra_preco" name="zibra_preco" value="'.esc_attr($price_label).'" placeholder="Sobrescreve o valor. Exemplo: A partir de R$ 289,00" /></p>';

  $fields = [
    'material' => ['Material', 'Exemplo: Prata 925 com acabamento polido'],
    'medidas' => ['Medidas', 'Exemplo: 45 cm'],
    'referencia' => ['Código de referência', 'Exemplo: ZB-001'],
  ];
  foreach ($fields as $key => $settings) {
    $value = (string) get_post_meta($post->ID, $key, true);
    echo '<p><label style="display:block;font-weight:600;margin-bottom:5px" for="zibra_'.esc_attr($key).'">'.esc_html($settings[0]).'</label><input style="width:100%" type="text" id="zibra_'.esc_attr($key).'" name="zibra_'.esc_attr($key).'" value="'.esc_attr($value).'" placeholder="'.esc_attr($settings[1]).'" /></p>';
  }

  $status = zibra_catalog_availability_status($post->ID);
  echo '<p><label style="display:block;font-weight:600;margin-bottom:5px" for="zibra_disponibilidade_status">Disponibilidade</label><select style="width:100%" id="zibra_disponibilidade_status" name="zibra_disponibilidade_status">';
  foreach (zibra_availability_options() as $value => $label) {
    echo '<option value="'.esc_attr($value).'" '.selected($status, $value, false).'>'.esc_html($label).'</option>';
  }
  echo '</select><span class="description">Peças esgotadas continuam na vitrine, mas sem ação de compra.</span></p>';

  $care = (string) get_post_meta($post->ID, 'cuidados', true);
  echo '<p><label style="display:block;font-weight:600;margin-bottom:5px" for="zibra_cuidados">Cuidados</label><textarea style="width:100%" rows="3" id="zibra_cuidados" name="zibra_cuidados" placeholder="Orientações de conservação">'.esc_textarea($care).'</textarea></p>';
  echo '<p><label><input type="checkbox" name="zibra_destaque" value="1" '.checked((bool) get_post_meta($post->ID, 'destaque', true), true, false).' /> Exibir como destaque na vitrine</label></p>';
}

function zibra_render_product_gallery($post) {
  $ids = array_filter(array_map('absint', explode(',', (string) get_post_meta($post->ID, 'galeria_ids', true))));
  echo '<div id="zibra-gallery-preview" style="display:grid;grid-template-columns:repeat(3,1fr);gap:6px;margin-bottom:10px">';
  foreach ($ids as $attachment_id) echo wp_get_attachment_image($attachment_id, 'thumbnail', false, ['style' => 'width:100%;height:auto']);
  echo '</div><input type="hidden" id="zibra_galeria_ids" name="zibra_galeria_ids" value="'.esc_attr(implode(',', $ids)).'" />';
  echo '<button type="button" class="button" id="zibra-select-gallery">Selecionar imagens</button> <button type="button" class="button-link-delete" id="zibra-clear-gallery">Limpar</button>';
  echo '<p class="description">A imagem destacada aparece primeiro. Selecione aqui as fotos adicionais.</p>';
}

add_action('admin_enqueue_scripts', function ($hook) {
  global $post_type;
  if ($post_type !== 'produtos' || !in_array($hook, ['post.php', 'post-new.php'], true)) return;
  wp_enqueue_media();
  wp_add_inline_script('media-editor', "jQuery(function($){let frame;$('#zibra-select-gallery').on('click',function(e){e.preventDefault();if(frame){frame.open();return;}frame=wp.media({title:'Galeria da joia',button:{text:'Usar estas imagens'},multiple:true});frame.on('select',function(){const items=frame.state().get('selection').toJSON();$('#zibra_galeria_ids').val(items.map(function(item){return item.id;}).join(','));$('#zibra-gallery-preview').html(items.map(function(item){return '<img src=\"'+((item.sizes&&item.sizes.thumbnail)?item.sizes.thumbnail.url:item.url)+'\" style=\"width:100%;height:auto\" alt=\"\" />';}).join(''));});frame.open();});$('#zibra-clear-gallery').on('click',function(e){e.preventDefault();$('#zibra_galeria_ids').val('');$('#zibra-gallery-preview').empty();});});");
});

add_action('save_post_produtos', function ($post_id) {
  if (!isset($_POST['zibra_product_nonce']) || !wp_verify_nonce(sanitize_text_field(wp_unslash($_POST['zibra_product_nonce'])), 'zibra_save_product')) return;
  if ((defined('DOING_AUTOSAVE') && DOING_AUTOSAVE) || !current_user_can('edit_post', $post_id)) return;

  foreach (['preco', 'material', 'medidas', 'referencia'] as $key) {
    if (isset($_POST['zibra_'.$key])) update_post_meta($post_id, $key, sanitize_text_field(wp_unslash($_POST['zibra_'.$key])));
  }
  if (isset($_POST['zibra_preco_valor'])) {
    $raw = str_replace(',', '.', sanitize_text_field(wp_unslash($_POST['zibra_preco_valor'])));
    update_post_meta($post_id, 'preco_valor', is_numeric($raw) && (float) $raw > 0 ? number_format((float) $raw, 2, '.', '') : '');
  }
  if (isset($_POST['zibra_disponibilidade_status'])) {
    $status = sanitize_text_field(wp_unslash($_POST['zibra_disponibilidade_status']));
    update_post_meta($post_id, 'disponibilidade_status', isset(zibra_availability_options()[$status]) ? $status : 'sob_consulta');
  }
  if (isset($_POST['zibra_cuidados'])) update_post_meta($post_id, 'cuidados', sanitize_textarea_field(wp_unslash($_POST['zibra_cuidados'])));
  $ids = isset($_POST['zibra_galeria_ids']) ? array_filter(array_map('absint', explode(',', sanitize_text_field(wp_unslash($_POST['zibra_galeria_ids']))))) : [];
  update_post_meta($post_id, 'galeria_ids', implode(',', $ids));
  update_post_meta($post_id, 'destaque', isset($_POST['zibra_destaque']));
}, 10);

/** Impede publicar uma joia incompleta: volta para rascunho e explica o que falta. */
function zibra_required_fields_missing($post_id) {
  $missing = [];
  if (trim((string) get_post_field('post_title', $post_id)) === '' || get_post_field('post_title', $post_id) === 'Auto rascunho') $missing[] = 'Nome (título)';
  if (trim((string) get_post_field('post_excerpt', $post_id)) === '') $missing[] = 'Resumo';
  if (trim(wp_strip_all_tags((string) get_post_field('post_content', $post_id))) === '') $missing[] = 'Descrição';
  $terms = get_the_terms($post_id, 'categoria_produto');
  if (!is_array($terms) || empty($terms)) $missing[] = 'Categoria';
  if (!has_post_thumbnail($post_id)) $missing[] = 'Imagem destacada';
  if (zibra_catalog_price_value($post_id) === null && trim((string) get_post_meta($post_id, 'preco', true)) === '') $missing[] = 'Preço';
  if (trim((string) get_post_meta($post_id, 'material', true)) === '') $missing[] = 'Material';
  if (trim((string) get_post_meta($post_id, 'medidas', true)) === '') $missing[] = 'Medidas';
  if (trim((string) get_post_meta($post_id, 'referencia', true)) === '') $missing[] = 'Código de referência';
  return $missing;
}

add_action('save_post_produtos', function ($post_id, $post) {
  static $running = false;
  if ($running || $post->post_status !== 'publish' || wp_is_post_revision($post_id)) return;
  if (defined('DOING_AUTOSAVE') && DOING_AUTOSAVE) return;

  $missing = zibra_required_fields_missing($post_id);
  if (!$missing) return;

  $running = true;
  wp_update_post(['ID' => $post_id, 'post_status' => 'draft']);
  $running = false;
  set_transient('zibra_publish_block_' . get_current_user_id(), $missing, 60);
}, 99, 2);

add_action('admin_notices', function () {
  $missing = get_transient('zibra_publish_block_' . get_current_user_id());
  if (!$missing) return;
  delete_transient('zibra_publish_block_' . get_current_user_id());
  echo '<div class="notice notice-error"><p><strong>A joia continua como rascunho.</strong> Preencha antes de publicar: ' . esc_html(implode(', ', $missing)) . '.</p></div>';
});

add_filter('manage_produtos_posts_columns', function ($columns) {
  return ['cb' => $columns['cb'], 'zibra_image' => 'Imagem', 'title' => 'Produto', 'taxonomy-categoria_produto' => 'Categoria', 'zibra_price' => 'Preço', 'zibra_availability' => 'Disponibilidade', 'date' => 'Data'];
});
add_action('manage_produtos_posts_custom_column', function ($column, $post_id) {
  if ($column === 'zibra_image') echo get_the_post_thumbnail($post_id, [54, 54]);
  if ($column === 'zibra_price') {
    $label = (string) get_post_meta($post_id, 'preco', true);
    $value = zibra_catalog_price_value($post_id);
    echo esc_html($label !== '' ? $label : ($value !== null ? 'R$ ' . number_format($value, 2, ',', '.') : '—'));
  }
  if ($column === 'zibra_availability') echo esc_html(zibra_availability_options()[zibra_catalog_availability_status($post_id)]);
}, 10, 2);
add_action('admin_head', function () {
  echo '<style>.column-zibra_image{width:70px}.column-zibra_price,.column-zibra_availability{width:140px}.column-zibra_image img{width:54px;height:54px;object-fit:cover}</style>';
});

add_filter('login_redirect', function ($redirect_to, $requested, $user) {
  if ($user instanceof WP_User && in_array('gerente_catalogo_zibra', $user->roles, true)) return admin_url('edit.php?post_type=produtos');
  return $redirect_to;
}, 10, 3);

add_action('admin_init', function () {
  global $pagenow;
  $user = wp_get_current_user();
  if ($pagenow === 'index.php' && in_array('gerente_catalogo_zibra', $user->roles, true)) {
    wp_safe_redirect(admin_url('edit.php?post_type=produtos'));
    exit;
  }
});

add_filter('wp_robots', function ($robots) {
  $robots['noindex'] = true;
  $robots['nofollow'] = true;
  return $robots;
});

add_action('template_redirect', function () {
  if (is_admin() || wp_doing_ajax() || (defined('REST_REQUEST') && REST_REQUEST)) return;
  $storefront = apply_filters('zibra_storefront_url', 'https://zibraoficial.com.br');
  wp_safe_redirect($storefront, 302);
  exit;
});
