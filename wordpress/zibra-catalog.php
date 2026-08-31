<?php
/**
 * Plugin Name: Zibra Catalog
 * Description: Catálogo administrável da Zibra, exposto para o frontend via WordPress REST API.
 * Version: 1.0.0
 */
if (!defined('ABSPATH')) exit;

add_action('init', function () {
  register_post_type('produtos', [
    'labels' => ['name' => 'Produtos', 'singular_name' => 'Produto', 'add_new_item' => 'Adicionar produto'],
    'public' => true,
    'show_in_rest' => true,
    'menu_icon' => 'dashicons-art',
    'supports' => ['title', 'editor', 'thumbnail', 'page-attributes', 'excerpt'],
    'taxonomies' => ['categoria_produto'],
    'rewrite' => ['slug' => 'produtos'],
  ]);
  register_taxonomy('categoria_produto', 'produtos', [
    'label' => 'Categorias', 'public' => true, 'show_in_rest' => true, 'hierarchical' => true,
  ]);
});

add_action('rest_api_init', function () {
  foreach (['categoria', 'descricao_curta', 'descricao', 'imagem_principal', 'galeria', 'material', 'medidas', 'cuidados', 'disponibilidade', 'referencia'] as $key) {
    register_post_meta('produtos', $key, ['show_in_rest' => true, 'single' => true, 'type' => 'string', 'auth_callback' => function () { return current_user_can('edit_posts'); }]);
  }
  register_post_meta('produtos', 'destaque', ['show_in_rest' => true, 'single' => true, 'type' => 'boolean', 'auth_callback' => function () { return current_user_can('edit_posts'); }]);
  register_rest_field('produtos', 'catalogo', [
    'get_callback' => function ($post) {
      return [
        'categoria' => get_post_meta($post['id'], 'categoria', true),
        'descricao_curta' => get_post_meta($post['id'], 'descricao_curta', true),
        'descricao' => get_post_meta($post['id'], 'descricao', true),
        'imagem_principal' => get_post_meta($post['id'], 'imagem_principal', true),
        'galeria' => get_post_meta($post['id'], 'galeria', true),
        'destaque' => (bool) get_post_meta($post['id'], 'destaque', true),
        'material' => get_post_meta($post['id'], 'material', true),
        'medidas' => get_post_meta($post['id'], 'medidas', true),
        'cuidados' => get_post_meta($post['id'], 'cuidados', true),
        'disponibilidade' => get_post_meta($post['id'], 'disponibilidade', true),
        'referencia' => get_post_meta($post['id'], 'referencia', true),
        'ordem' => (int) get_post_field('menu_order', $post['id']),
      ];
    },
    'schema' => ['description' => 'Campos editoriais do catálogo Zibra.', 'type' => 'object'],
  ]);
});

add_action('add_meta_boxes', function () {
  add_meta_box('zibra_product_details', 'Detalhes da joia', function ($post) {
    wp_nonce_field('zibra_save_product', 'zibra_product_nonce');
    $fields = ['categoria'=>'Categoria editorial','descricao_curta'=>'Descrição curta','descricao'=>'Descrição completa','imagem_principal'=>'URL da imagem principal','galeria'=>'URLs da galeria (separadas por vírgula)','material'=>'Material','medidas'=>'Medidas','cuidados'=>'Cuidados','disponibilidade'=>'Disponibilidade','referencia'=>'Código / referência'];
    foreach ($fields as $key=>$label) { $value=get_post_meta($post->ID,$key,true); echo '<p><label style="display:block;font-weight:600;margin-bottom:5px" for="zibra_'.$key.'">'.esc_html($label).'</label><textarea style="width:100%" rows="2" id="zibra_'.$key.'" name="zibra_'.$key.'">'.esc_textarea($value).'</textarea></p>'; }
    echo '<p><label><input type="checkbox" name="zibra_destaque" value="1" '.checked((bool)get_post_meta($post->ID,'destaque',true),true,false).'> Produto em destaque</label></p>';
  }, 'produtos', 'normal', 'high');
});

add_action('save_post_produtos', function ($post_id) {
  if (!isset($_POST['zibra_product_nonce']) || !wp_verify_nonce($_POST['zibra_product_nonce'], 'zibra_save_product') || !current_user_can('edit_post',$post_id) || (defined('DOING_AUTOSAVE') && DOING_AUTOSAVE)) return;
  foreach (['categoria','descricao_curta','descricao','imagem_principal','galeria','material','medidas','cuidados','disponibilidade','referencia'] as $key) if(isset($_POST['zibra_'.$key])) update_post_meta($post_id,$key,sanitize_textarea_field($_POST['zibra_'.$key]));
  update_post_meta($post_id,'destaque',isset($_POST['zibra_destaque']));
});
