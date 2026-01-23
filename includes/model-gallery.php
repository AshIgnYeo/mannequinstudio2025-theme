<?php
/**
 * Model Gallery Media Uploader
 *
 * Custom media uploader for Model post type with drag & drop functionality
 *
 * @package MannequinStudio2025
 */

// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

// Phase 3: Define constant for gallery order meta key
define('MODEL_GALLERY_ORDER_META', '_gallery_order');

/**
 * Phase 3: Helper function to sort gallery images by order
 *
 * @param array $attachments Array of attachment objects
 * @return array Sorted array of attachments
 */
function sort_gallery_images_by_order($attachments) {
    if (empty($attachments)) {
        return array();
    }

    usort($attachments, function($a, $b) {
        $order_a = get_post_meta($a->ID, MODEL_GALLERY_ORDER_META, true);
        $order_b = get_post_meta($b->ID, MODEL_GALLERY_ORDER_META, true);
        return ($order_a ?: 0) - ($order_b ?: 0);
    });

    return $attachments;
}

/**
 * Add Model Gallery Metabox
 *
 * @return void
 */
function add_model_gallery_metabox() {
    add_meta_box(
        'model_gallery',
        'Model Gallery',
        'model_gallery_metabox_callback',
        'model',
        'normal',
        'high'
    );
}
add_action('add_meta_boxes', 'add_model_gallery_metabox');

/**
 * Model Gallery Metabox Callback
 *
 * @param WP_Post $post
 * @return void
 */
function model_gallery_metabox_callback($post) {
    // Add nonce for security
    wp_nonce_field('model_gallery_metabox', 'model_gallery_nonce');

    // Get existing gallery images using WordPress native attachments
    $gallery_images = get_attached_media('image', $post->ID);
    if (!is_array($gallery_images)) {
        $gallery_images = array();
    }

    // Sort by gallery order using helper function (Phase 3)
    $gallery_images = sort_gallery_images_by_order($gallery_images);

    ?>
    <div id="model-gallery-container">
        <div id="model-gallery-images" class="gallery-images-container">
            <?php if (!empty($gallery_images)): ?>
                <?php foreach ($gallery_images as $index => $attachment): ?>
                    <?php $image = wp_get_attachment_image_src($attachment->ID, 'thumbnail'); ?>
                    <?php if ($image): ?>
                        <div class="gallery-image-item <?php echo $index === 0 ? 'main-image' : ''; ?>" data-image-id="<?php echo esc_attr($attachment->ID); ?>">
                            <img src="<?php echo esc_url($image[0]); ?>" alt="Gallery Image" />
                            <?php if ($index === 0): ?>
                                <div class="main-badge">Main</div>
                            <?php endif; ?>
                            <button type="button" class="remove-image" data-image-id="<?php echo esc_attr($attachment->ID); ?>">×</button>
                        </div>
                    <?php endif; ?>
                <?php endforeach; ?>
            <?php endif; ?>
        </div>

        <div class="gallery-actions">
            <button type="button" id="add-gallery-images" class="button button-primary">
                Add Images to Gallery
            </button>
            <p class="description">
                Click "Add Images to Gallery" or drag & drop images here. You can drag and drop to reorder them.
            </p>
        </div>

        <input type="hidden" id="model-gallery-images-input" name="model_gallery_images" value="<?php echo esc_attr(implode(',', wp_list_pluck($gallery_images, 'ID'))); ?>" />
    </div>
    <?php
}

/**
 * Save Model Gallery Metabox Data
 *
 * @param int $post_id
 * @return void
 */
function save_model_gallery_metabox($post_id) {
    // Check if nonce is valid
    if (!isset($_POST['model_gallery_nonce']) || !wp_verify_nonce($_POST['model_gallery_nonce'], 'model_gallery_metabox')) {
        return;
    }

    // Check if user has permission to edit this post
    if (!current_user_can('edit_post', $post_id)) {
        return;
    }

    // Check if this is an autosave
    if (defined('DOING_AUTOSAVE') && DOING_AUTOSAVE) {
        return;
    }

    // Check if this is the correct post type
    if (get_post_type($post_id) !== 'model') {
        return;
    }

    // Note: Gallery images are now managed through WordPress native attachments
    // and individual order metadata. No need to save the old meta field.
    // The hidden input is still used for JavaScript functionality but not saved.
}
add_action('save_post', 'save_model_gallery_metabox');

/**
 * Enqueue scripts and styles for Model Gallery
 *
 * @return void
 */
function enqueue_model_gallery_assets($hook) {
    global $post_type;

    if (($hook == 'post.php' || $hook == 'post-new.php') && $post_type == 'model') {
        wp_enqueue_media();
        wp_enqueue_script('jquery-ui-sortable');

        // Phase 2: Enqueue external CSS
        wp_enqueue_style(
            'model-gallery-admin',
            get_template_directory_uri() . '/css/admin/model-gallery.css',
            array(),
            '1.0.0'
        );

        // Phase 2: Enqueue external JS
        wp_enqueue_script(
            'model-gallery-admin',
            get_template_directory_uri() . '/js/admin/model-gallery.js',
            array('jquery', 'jquery-ui-sortable'),
            '1.0.0',
            true
        );

        // Phase 2: Pass data to JavaScript via wp_localize_script
        wp_localize_script('model-gallery-admin', 'modelGalleryData', array(
            'ajaxurl' => admin_url('admin-ajax.php'),
            'postId' => get_the_ID(),
            'nonces' => array(
                'upload' => wp_create_nonce('upload_model_gallery_images'),
                'delete' => wp_create_nonce('delete_model_gallery_image'),
                'order' => wp_create_nonce('update_model_gallery_order'),
                'attach' => wp_create_nonce('attach_media_library_images'),
                'featured' => wp_create_nonce('update_model_featured_image'),
            )
        ));
    }
}
add_action('admin_enqueue_scripts', 'enqueue_model_gallery_assets');

/**
 * Phase 3: Helper function to create attachment response data
 *
 * @param int $attachment_id
 * @return array
 */
function create_attachment_response($attachment_id) {
    return array(
        'id' => $attachment_id,
        'url' => wp_get_attachment_url($attachment_id),
        'sizes' => array(
            'thumbnail' => array(
                'url' => wp_get_attachment_image_url($attachment_id, 'thumbnail')
            )
        )
    );
}

/**
 * AJAX handler for drag and drop file uploads
 *
 * This function handles file uploads and associates them with the current model post
 *
 * @return void
 */
function handle_model_gallery_upload() {
    // Verify nonce
    if (!isset($_POST['nonce']) || !wp_verify_nonce($_POST['nonce'], 'upload_model_gallery_images')) {
        wp_send_json_error(array('message' => 'Security check failed'));
        return;
    }

    // Check user permissions
    if (!current_user_can('upload_files')) {
        wp_send_json_error(array('message' => 'You do not have permission to upload files'));
        return;
    }

    // Check if files were uploaded
    if (empty($_FILES['file'])) {
        wp_send_json_error(array('message' => 'No files uploaded'));
        return;
    }

    // Get post ID from the request
    $post_id = isset($_POST['post_id']) ? intval($_POST['post_id']) : 0;

    // Validate post ID and check if it's a valid model post
    if (!$post_id || get_post_type($post_id) !== 'model') {
        wp_send_json_error(array('message' => 'Invalid post ID or not a model post'));
        return;
    }

    // Phase 4: Check user can edit this specific post
    if (!current_user_can('edit_post', $post_id)) {
        wp_send_json_error(array('message' => 'You do not have permission to edit this post'));
        return;
    }

    $attachments = array();
    $files = $_FILES['file'];

    // Phase 3: Consolidated file handling - normalize to array format
    $file_list = array();
    if (is_array($files['name'])) {
        for ($i = 0; $i < count($files['name']); $i++) {
            $file_list[] = array(
                'name' => $files['name'][$i],
                'type' => $files['type'][$i],
                'tmp_name' => $files['tmp_name'][$i],
                'error' => $files['error'][$i],
                'size' => $files['size'][$i]
            );
        }
    } else {
        $file_list[] = $files;
    }

    // Process each file
    foreach ($file_list as $file) {
        // Validate file type
        if (strpos($file['type'], 'image/') !== 0) {
            continue; // Skip non-image files
        }

        // Upload file and associate with the model post
        $attachment_id = media_handle_sideload($file, $post_id);

        if (!is_wp_error($attachment_id)) {
            // Set initial gallery order
            $current_count = count(get_attached_media('image', $post_id));
            update_post_meta($attachment_id, MODEL_GALLERY_ORDER_META, $current_count);

            $attachments[] = create_attachment_response($attachment_id);
        }
    }

    if (empty($attachments)) {
        wp_send_json_error(array('message' => 'No valid image files uploaded'));
        return;
    }

    wp_send_json_success(array('attachments' => $attachments));
}
add_action('wp_ajax_upload_model_gallery_images', 'handle_model_gallery_upload');

/**
 * Phase 1: AJAX handler for attaching Media Library images to a model
 *
 * @return void
 */
function handle_attach_media_library_images() {
    // Verify nonce
    if (!isset($_POST['nonce']) || !wp_verify_nonce($_POST['nonce'], 'attach_media_library_images')) {
        wp_send_json_error(array('message' => 'Security check failed'));
        return;
    }

    // Check user permissions
    if (!current_user_can('upload_files')) {
        wp_send_json_error(array('message' => 'You do not have permission to manage media'));
        return;
    }

    // Get post ID and image IDs
    $post_id = isset($_POST['post_id']) ? intval($_POST['post_id']) : 0;
    $image_ids = isset($_POST['image_ids']) ? array_map('intval', $_POST['image_ids']) : array();

    if (!$post_id || empty($image_ids)) {
        wp_send_json_error(array('message' => 'Invalid post ID or image IDs'));
        return;
    }

    // Validate post exists and is a model
    if (get_post_type($post_id) !== 'model') {
        wp_send_json_error(array('message' => 'Invalid post type'));
        return;
    }

    // Phase 4: Check user can edit this specific post
    if (!current_user_can('edit_post', $post_id)) {
        wp_send_json_error(array('message' => 'You do not have permission to edit this post'));
        return;
    }

    // Get current attachment count for ordering
    $current_count = count(get_attached_media('image', $post_id));
    $attached = array();

    foreach ($image_ids as $index => $image_id) {
        // Phase 4: Validate each image exists and is an attachment
        $attachment = get_post($image_id);
        if (!$attachment || $attachment->post_type !== 'attachment') {
            continue;
        }

        // Phase 4: Validate it's actually an image
        if (strpos($attachment->post_mime_type, 'image/') !== 0) {
            continue;
        }

        // Update post_parent to attach to this model
        wp_update_post(array(
            'ID' => $image_id,
            'post_parent' => $post_id
        ));

        // Set gallery order for new images
        update_post_meta($image_id, MODEL_GALLERY_ORDER_META, $current_count + $index);

        $attached[] = $image_id;
    }

    if (empty($attached)) {
        wp_send_json_error(array('message' => 'No valid images to attach'));
        return;
    }

    wp_send_json_success(array(
        'message' => 'Images attached successfully',
        'attached' => $attached
    ));
}
add_action('wp_ajax_attach_media_library_images', 'handle_attach_media_library_images');

/**
 * AJAX handler for deleting images from media library
 *
 * @return void
 */
function handle_model_gallery_image_delete() {
    // Verify nonce
    if (!isset($_POST['nonce']) || !wp_verify_nonce($_POST['nonce'], 'delete_model_gallery_image')) {
        wp_send_json_error(array('message' => 'Security check failed'));
        return;
    }

    // Get image ID and post ID
    $image_id = isset($_POST['image_id']) ? intval($_POST['image_id']) : 0;
    $post_id = isset($_POST['post_id']) ? intval($_POST['post_id']) : 0;

    if (!$image_id) {
        wp_send_json_error(array('message' => 'Invalid image ID'));
        return;
    }

    // Check if the attachment exists
    $attachment = get_post($image_id);
    if (!$attachment || $attachment->post_type !== 'attachment') {
        wp_send_json_error(array('message' => 'Image not found'));
        return;
    }

    // Phase 4: Check attachment belongs to the specified model
    if ($post_id && $attachment->post_parent !== $post_id) {
        wp_send_json_error(array('message' => 'Image does not belong to this model'));
        return;
    }

    // Phase 4: Use more specific capability check
    if (!current_user_can('delete_post', $image_id)) {
        wp_send_json_error(array('message' => 'You do not have permission to delete this file'));
        return;
    }

    // Delete the attachment
    $deleted = wp_delete_attachment($image_id, true); // true = force delete (don't move to trash)

    if ($deleted) {
        wp_send_json_success(array('message' => 'Image deleted successfully'));
    } else {
        wp_send_json_error(array('message' => 'Failed to delete image'));
    }
}
add_action('wp_ajax_delete_model_gallery_image', 'handle_model_gallery_image_delete');

/**
 * AJAX handler for updating gallery order
 *
 * @return void
 */
function handle_model_gallery_order_update() {
    // Verify nonce
    if (!isset($_POST['nonce']) || !wp_verify_nonce($_POST['nonce'], 'update_model_gallery_order')) {
        wp_send_json_error(array('message' => 'Security check failed'));
        return;
    }

    // Get post ID and image IDs
    $post_id = isset($_POST['post_id']) ? intval($_POST['post_id']) : 0;
    $image_ids = isset($_POST['image_ids']) ? array_map('intval', $_POST['image_ids']) : array();

    if (!$post_id || empty($image_ids)) {
        wp_send_json_error(array('message' => 'Invalid post ID or image IDs'));
        return;
    }

    // Check if the post exists and is a model
    if (get_post_type($post_id) !== 'model') {
        wp_send_json_error(array('message' => 'Invalid post type'));
        return;
    }

    // Check user permissions for this specific post
    if (!current_user_can('edit_post', $post_id)) {
        wp_send_json_error(array('message' => 'You do not have permission to edit this post'));
        return;
    }

    // Update order for each image
    foreach ($image_ids as $position => $image_id) {
        // Phase 4: Validate each image's post_parent matches the model
        $attachment = get_post($image_id);
        if (!$attachment || $attachment->post_type !== 'attachment') {
            continue;
        }

        // Only update order for images attached to this model
        if ($attachment->post_parent !== $post_id) {
            continue;
        }

        update_post_meta($image_id, MODEL_GALLERY_ORDER_META, $position);
    }

    // Set the first image as featured image
    if (!empty($image_ids)) {
        $first_image_id = $image_ids[0];

        // Verify the image is attached to this post
        $attachment = get_post($first_image_id);
        if ($attachment && $attachment->post_type === 'attachment' && $attachment->post_parent === $post_id) {
            set_post_thumbnail($post_id, $first_image_id);
        }
    }

    wp_send_json_success(array('message' => 'Gallery order updated successfully'));
}
add_action('wp_ajax_update_model_gallery_order', 'handle_model_gallery_order_update');

/**
 * AJAX handler for updating featured image
 *
 * @return void
 */
function handle_model_featured_image_update() {
    // Verify nonce
    if (!isset($_POST['nonce']) || !wp_verify_nonce($_POST['nonce'], 'update_model_featured_image')) {
        wp_send_json_error(array('message' => 'Security check failed'));
        return;
    }

    // Get post ID and image ID
    $post_id = isset($_POST['post_id']) ? intval($_POST['post_id']) : 0;
    $image_id = isset($_POST['image_id']) ? intval($_POST['image_id']) : 0;

    if (!$post_id || !$image_id) {
        wp_send_json_error(array('message' => 'Invalid post ID or image ID'));
        return;
    }

    // Check if the post exists and is a model
    if (get_post_type($post_id) !== 'model') {
        wp_send_json_error(array('message' => 'Invalid post type'));
        return;
    }

    // Check user permissions
    if (!current_user_can('edit_post', $post_id)) {
        wp_send_json_error(array('message' => 'You do not have permission to edit this post'));
        return;
    }

    // Check if the image exists and is attached to this post
    $attachment = get_post($image_id);
    if (!$attachment || $attachment->post_type !== 'attachment' || $attachment->post_parent !== $post_id) {
        wp_send_json_error(array('message' => 'Invalid image or image not attached to this post'));
        return;
    }

    // Set as featured image
    $result = set_post_thumbnail($post_id, $image_id);

    if ($result) {
        wp_send_json_success(array('message' => 'Featured image updated successfully'));
    } else {
        wp_send_json_error(array('message' => 'Failed to update featured image'));
    }
}
add_action('wp_ajax_update_model_featured_image', 'handle_model_featured_image_update');

/**
 * Ensure featured media is properly exposed in REST API for models
 *
 * @return void
 */
function ensure_model_featured_media_in_rest() {
    // Ensure REST API includes featured media
    add_filter('rest_prepare_model', function($response, $post, $request) {
        $featured_media_id = get_post_thumbnail_id($post->ID);
        $response->data['featured_media'] = $featured_media_id ?: 0;

        return $response;
    }, 10, 3);
}
add_action('init', 'ensure_model_featured_media_in_rest');

/**
 * Add gallery images to REST API response
 *
 * @return void
 */
function add_gallery_to_rest_api() {
    register_rest_field('model', 'gallery', array(
        'get_callback' => function($post) {
            $attachments = get_attached_media('image', $post['id']);

            if (empty($attachments)) {
                return array();
            }

            // Sort by gallery order using helper function (Phase 3)
            $attachments = sort_gallery_images_by_order($attachments);

            $images = array();
            foreach ($attachments as $attachment) {
                $images[] = array(
                    'id' => $attachment->ID,
                    'url' => wp_get_attachment_url($attachment->ID),
                    'thumbnail' => wp_get_attachment_image_url($attachment->ID, 'thumbnail'),
                    'medium' => wp_get_attachment_image_url($attachment->ID, 'medium'),
                    'large' => wp_get_attachment_image_url($attachment->ID, 'large'),
                    'full' => wp_get_attachment_image_url($attachment->ID, 'full'),
                    'alt' => get_post_meta($attachment->ID, '_wp_attachment_image_alt', true),
                );
            }

            return $images;
        },
        'schema' => array(
            'description' => 'Gallery images for the model',
            'type' => 'array'
        ),
    ));
}
add_action('rest_api_init', 'add_gallery_to_rest_api');

/**
 * Get Model Gallery Images
 *
 * @param int $post_id
 * @param string $size
 * @return array
 */
function get_model_gallery_images($post_id = null, $size = 'full') {
    if (!$post_id) {
        $post_id = get_the_ID();
    }

    // Get attachments using WordPress native method
    $attachments = get_attached_media('image', $post_id);

    if (empty($attachments)) {
        return array();
    }

    // Sort by gallery order using helper function (Phase 3)
    $attachments = sort_gallery_images_by_order($attachments);

    $images = array();
    foreach ($attachments as $attachment) {
        $image_data = wp_get_attachment_image_src($attachment->ID, $size);
        if ($image_data) {
            $images[] = array(
                'id' => $attachment->ID,
                'url' => $image_data[0],
                'width' => $image_data[1],
                'height' => $image_data[2],
                'alt' => get_post_meta($attachment->ID, '_wp_attachment_image_alt', true),
                'caption' => wp_get_attachment_caption($attachment->ID),
                'description' => get_post_field('post_content', $attachment->ID)
            );
        }
    }

    return $images;
}
