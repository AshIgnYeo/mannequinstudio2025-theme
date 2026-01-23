<?php get_header(); ?>

<?php
// Get the page slug from the post object
global $post;
$page_slug = $post->post_name;
?>
<div id="<?php echo esc_attr($page_slug); ?>"></div>

<?php get_footer(); ?>
