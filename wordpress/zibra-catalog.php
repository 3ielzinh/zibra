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
  foreach (['categoria', 'descricao_curta', 'imagem_principal', 'galeria'] as $key) {
    register_post_meta('produtos', $key, ['show_in_rest' => true, 'single' => true, 'type' => 'string', 'auth_callback' => function () { return current_user_can('edit_posts'); }]);
  }
  register_post_meta('produtos', 'destaque', ['show_in_rest' => true, 'single' => true, 'type' => 'boolean', 'auth_callback' => function () { return current_user_can('edit_posts'); }]);
  register_rest_field('produtos', 'catalogo', [
    'get_callback' => function ($post) {
      return [
        'categoria' => get_post_meta($post['id'], 'categoria', true),
        'descricao_curta' => get_post_meta($post['id'], 'descricao_curta', true),
        'imagem_principal' => get_post_meta($post['id'], 'imagem_principal', true),
        'galeria' => get_post_meta($post['id'], 'galeria', true),
        'destaque' => (bool) get_post_meta($post['id'], 'destaque', true),
        'ordem' => (int) get_post_field('menu_order', $post['id']),
      ];
    },
    'schema' => ['description' => 'Campos editoriais do catálogo Zibra.', 'type' => 'object'],
  ]);
});
