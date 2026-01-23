<?php
/**
 * Loads our JS and CSS files
 *
 * @return void
 */
function boilerplate_load_assets() {
  wp_enqueue_script('ourmainjs', get_theme_file_uri('/build/index.js'), array('wp-element', 'react-jsx-runtime'), '1.0', true);
  wp_enqueue_style('ourmaincss', get_theme_file_uri('/build/index.css'));
}

add_action('wp_enqueue_scripts', 'boilerplate_load_assets');

/**
 * Enqueue Google Fonts - Jost
 *
 * @return void
 */
function boilerplate_enqueue_google_fonts() {
  wp_enqueue_style('jost-font', 'https://fonts.googleapis.com/css2?family=Jost:ital,wght@0,300;0,400;0,600;1,300;1,400;1,600&display=swap', false);
}

add_action('wp_enqueue_scripts', 'boilerplate_enqueue_google_fonts');

/**
 * Adds support for title tags, post thumbnails, etc.
 *
 * @return void
 */
function boilerplate_add_support() {
  add_theme_support('title-tag');
  add_theme_support('post-thumbnails');
}

add_action('after_setup_theme', 'boilerplate_add_support');

/**
 * Add custom classes to the body tag
 *
 * @param array $classes
 * @return array
 */
// function boilerplate_body_classes($classes) {
//   $classes[] = 'bg-gray-100';
//   return $classes;
// }

// add_filter('body_class', 'boilerplate_body_classes');

/**
 * Custom Post Type: Models
 *
 * @return void
 */
function register_custom_post_types() {
  register_post_type('model', array(
    'public' => true,
    'has_archive' => true,
    'show_in_rest' => true,
    'rest_base' => 'models',
    'menu_icon' => 'dashicons-universal-access-alt',
    'supports' => array('title', 'thumbnail'),
    'labels' => array(
      'name' => 'Models',
      'add_new_item' => 'Add New Model',
      'edit_item' => 'Edit Model',
      'all_items' => 'All Models',
      'singular_name' => 'Model',
      'menu_name' => 'Models',
      'search_items' => 'Search Models',
      'not_found' => 'No models found'
    ),
  ));
}

add_action('init', 'register_custom_post_types');

/**
 * Rename Custom Post Type Title Texts
 *
 * @return string
 */
function rename_cpt_title_texts($title) {
  $screen = get_current_screen();

  if ($screen->post_type === 'model') {
    $title = 'Model Name';
  }

  return $title;
}

add_filter('enter_title_here', 'rename_cpt_title_texts');

/**
 * Include Model Gallery functionality
 */
require_once get_template_directory() . '/includes/model-gallery.php';

/**
 * Include Measurement Labels functionality
 */
require_once get_template_directory() . '/includes/measurement-labels.php';

/**
 * Include Theme Options functionality
 */
require_once get_template_directory() . '/includes/theme-options.php';

/**
 * Include Casting Form Handler functionality
 */
require_once get_template_directory() . '/includes/casting-form-handler.php';

/**
 * Exclude folders from All-in-One WP Migration exports
 */
add_filter('ai1wm_exclude_content_from_export', function($exclude_filters) {
    $exclude_filters[] = 'themes' . DIRECTORY_SEPARATOR . 'mannequinstudio2025' . DIRECTORY_SEPARATOR . 'node_modules';
    return $exclude_filters;
});

add_filter('ai1wm_exclude_themes_from_export', function($exclude_filters) {
    $exclude_filters[] = 'mannequinstudio2025' . DIRECTORY_SEPARATOR . 'node_modules';
    return $exclude_filters;
});
