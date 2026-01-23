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

    // Sort by gallery order
    usort($gallery_images, function($a, $b) {
        $order_a = get_post_meta($a->ID, '_gallery_order', true);
        $order_b = get_post_meta($b->ID, '_gallery_order', true);
        return ($order_a ?: 0) - ($order_b ?: 0);
    });

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

    <style>
        .gallery-images-container {
            display: flex;
            flex-wrap: wrap;
            gap: 10px;
            margin: 15px 0;
            min-height: 100px;
            border: 2px dashed #ddd;
            padding: 15px;
            border-radius: 4px;
            transition: all 0.3s ease;
        }

        .gallery-images-container.drag-over {
            border-color: #0073aa;
            background-color: #f0f8ff;
            border-style: solid;
        }

        .gallery-image-item {
            position: relative;
            width: 150px;
            height: 150px;
            border: 1px solid #ddd;
            border-radius: 4px;
            overflow: hidden;
            cursor: move;
        }

        .gallery-image-item img {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }

        .gallery-image-item .remove-image {
            position: absolute;
            top: 5px;
            right: 5px;
            background: #dc3232;
            color: white;
            border: none;
            border-radius: 50%;
            width: 25px;
            height: 25px;
            cursor: pointer;
            font-size: 16px;
            line-height: 1;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .gallery-image-item .remove-image:hover {
            background: #a00;
        }

        .gallery-actions {
            margin-top: 15px;
        }

        .gallery-images-container:empty::before {
            content: "No images selected. Click 'Add Images to Gallery' or drag & drop images here.";
            color: #666;
            font-style: italic;
            display: flex;
            align-items: center;
            justify-content: center;
            height: 100px;
            text-align: center;
            padding: 20px;
        }

        .gallery-image-placeholder {
            width: 150px;
            height: 150px;
            border: 2px dashed #0073aa;
            background: #f0f8ff;
            border-radius: 4px;
        }

        .gallery-image-item.ui-sortable-helper {
            transform: rotate(5deg);
            box-shadow: 0 5px 15px rgba(0,0,0,0.3);
        }

        .gallery-image-item.main-image {
            border: 2px solid #0073aa;
        }

        .gallery-image-item .main-badge {
            position: absolute;
            top: 5px;
            left: 5px;
            background: #0073aa;
            color: white;
            padding: 2px 8px;
            border-radius: 3px;
            font-size: 11px;
            font-weight: bold;
            text-transform: uppercase;
            z-index: 10;
        }

        .uploading-message {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(0, 115, 170, 0.9);
            color: white;
            padding: 10px 20px;
            border-radius: 4px;
            font-weight: bold;
            z-index: 1000;
        }
    </style>

    <script>
    jQuery(document).ready(function($) {
        let mediaUploader;

                // Initialize main badge on page load
        updateMainBadge();

        // Add images button click
        $('#add-gallery-images').click(function(e) {
            e.preventDefault();

            if (mediaUploader) {
                mediaUploader.open();
                return;
            }

            mediaUploader = wp.media({
                title: 'Select Images for Model Gallery',
                button: {
                    text: 'Add to Gallery'
                },
                multiple: true,
                library: {
                    type: 'image'
                }
            });

            mediaUploader.on('select', function() {
                const attachments = mediaUploader.state().get('selection').toJSON();
                const currentImages = $('#model-gallery-images-input').val().split(',').filter(id => id !== '');

                attachments.forEach(function(attachment) {
                    if (currentImages.indexOf(attachment.id.toString()) === -1) {
                        currentImages.push(attachment.id);
                        addImageToGallery(attachment);
                    }
                });

                updateHiddenInput(currentImages);
            });

            mediaUploader.open();
        });

        // Drag and drop file upload functionality
        const galleryContainer = document.getElementById('model-gallery-images');

        // Only handle file drops (not image reordering)
        galleryContainer.addEventListener('dragenter', handleDragEnter, false);
        galleryContainer.addEventListener('dragover', handleDragOver, false);
        galleryContainer.addEventListener('dragleave', handleDragLeave, false);
        galleryContainer.addEventListener('drop', handleFileDrop, false);

        function handleDragEnter(e) {
            // Only handle if dragging files from outside (not images within gallery)
            if (e.dataTransfer.types.includes('Files') && !e.target.closest('.gallery-image-item')) {
                e.preventDefault();
                galleryContainer.classList.add('drag-over');
            }
        }

        function handleDragOver(e) {
            // Only handle if dragging files from outside (not images within gallery)
            if (e.dataTransfer.types.includes('Files') && !e.target.closest('.gallery-image-item')) {
                e.preventDefault();
            }
        }

        function handleDragLeave(e) {
            // Only remove highlight if leaving the container entirely
            if (!galleryContainer.contains(e.relatedTarget)) {
                galleryContainer.classList.remove('drag-over');
            }
        }

        function handleFileDrop(e) {
            // Only handle file drops if not dropping on an existing image
            if (!e.target.closest('.gallery-image-item')) {
                e.preventDefault();
                galleryContainer.classList.remove('drag-over');

                const dt = e.dataTransfer;
                const files = dt.files;

                if (files.length > 0) {
                    uploadFiles(files);
                }
            }
        }

        function uploadFiles(files) {
            const formData = new FormData();
            const currentImages = $('#model-gallery-images-input').val().split(',').filter(id => id !== '');

            // Filter only image files
            const imageFiles = Array.from(files).filter(file => file.type.startsWith('image/'));

            if (imageFiles.length === 0) {
                alert('Please select only image files.');
                return;
            }

            // Add each file to FormData
            imageFiles.forEach((file, index) => {
                formData.append('file[]', file);
            });

                    // Add WordPress nonce and action
            formData.append('action', 'upload_model_gallery_images');
            formData.append('nonce', '<?php echo wp_create_nonce('upload_model_gallery_images'); ?>');
            formData.append('post_id', '<?php echo $post->ID; ?>');

            // Show loading state
            const loadingHtml = '<div class="uploading-message">Uploading images...</div>';
            $(galleryContainer).append(loadingHtml);

            // Upload files via AJAX
            $.ajax({
                url: ajax_object.ajaxurl,
                type: 'POST',
                data: formData,
                processData: false,
                contentType: false,
                                success: function(response) {
                    $('.uploading-message').remove();

                    if (response.success && response.data.attachments) {
                        response.data.attachments.forEach(function(attachment) {
                            if (currentImages.indexOf(attachment.id.toString()) === -1) {
                                currentImages.push(attachment.id);
                                addImageToGallery(attachment);
                            }
                        });
                        updateHiddenInput(currentImages);

                        // Set featured image if this is the first image and no featured image exists
                        if (currentImages.length === 1 && !$('#post-thumbnail').find('img').length) {
                            updateFeaturedImage(currentImages[0]);
                        }
                    } else {
                        alert('Error uploading images: ' + (response.data.message || 'Unknown error'));
                    }
                },
                error: function() {
                    $('.uploading-message').remove();
                    alert('Error uploading images. Please try again.');
                }
            });
        }

        // Remove image
        $(document).on('click', '.remove-image', function() {
            const imageId = $(this).data('image-id');
            const imageElement = $(this).closest('.gallery-image-item');

            // Confirm deletion
            if (confirm('Are you sure you want to remove this image? This will also delete it from the media library.')) {
                imageElement.remove();

                // Get current images and remove the deleted one
                const currentImages = $('#model-gallery-images-input').val().split(',').filter(id => id !== '' && id !== imageId.toString());
                console.log('Removing image ID:', imageId);
                console.log('Updated image list:', currentImages);
                updateHiddenInput(currentImages);

                // Delete from media library via AJAX
                $.ajax({
                    url: ajax_object.ajaxurl,
                    type: 'POST',
                    data: {
                        action: 'delete_model_gallery_image',
                        image_id: imageId,
                        nonce: '<?php echo wp_create_nonce('delete_model_gallery_image'); ?>'
                    },
                    success: function(response) {
                        if (response.success) {
                            console.log('Image deleted from media library');
                        } else {
                            console.log('Error deleting image from media library:', response.data.message);
                        }
                    },
                    error: function() {
                        console.log('AJAX error when deleting image from media library');
                    }
                });

                // Use timeout to avoid conflicts
                setTimeout(function() {
                    updateMainBadge();
                }, 100);
            }
        });

        // Make images sortable (only for existing images, not file uploads)
        $('#model-gallery-images').sortable({
            placeholder: 'gallery-image-placeholder',
            items: '.gallery-image-item', // Only make image items sortable
            update: function(event, ui) {
                const imageIds = [];
                $('#model-gallery-images .gallery-image-item').each(function() {
                    imageIds.push($(this).data('image-id'));
                });
                updateHiddenInput(imageIds);

                // Update gallery order via AJAX
                updateGalleryOrder(imageIds);

                // Use timeout to avoid conflicts with sortable
                setTimeout(function() {
                    updateMainBadge();
                }, 100);
            }
        });

        function addImageToGallery(attachment) {
            const imageHtml = `
                <div class="gallery-image-item" data-image-id="${attachment.id}">
                    <img src="${attachment.sizes.thumbnail ? attachment.sizes.thumbnail.url : attachment.url}" alt="Gallery Image" />
                    <button type="button" class="remove-image" data-image-id="${attachment.id}">×</button>
                </div>
            `;
            $('#model-gallery-images').append(imageHtml);

            // Use timeout to avoid conflicts
            setTimeout(function() {
                updateMainBadge();
            }, 100);
        }

        function updateHiddenInput(imageIds) {
            // Filter out empty values and ensure we have valid IDs
            const validIds = imageIds.filter(id => id !== '' && id !== null && id !== undefined);
            $('#model-gallery-images-input').val(validIds.join(','));
        }

        function updateGalleryOrder(imageIds) {
            $.ajax({
                url: ajax_object.ajaxurl,
                type: 'POST',
                data: {
                    action: 'update_model_gallery_order',
                    image_ids: imageIds,
                    post_id: '<?php echo $post->ID; ?>',
                    nonce: '<?php echo wp_create_nonce('update_model_gallery_order'); ?>'
                },
                success: function(response) {
                    if (response.success) {
                        // Featured image is now automatically updated in PHP
                    } else {
                        console.log('Error updating gallery order:', response.data.message);
                    }
                },
                error: function() {
                    console.log('AJAX error when updating gallery order');
                }
            });
        }

        function updateFeaturedImage(imageId) {
            $.ajax({
                url: ajax_object.ajaxurl,
                type: 'POST',
                data: {
                    action: 'update_model_featured_image',
                    image_id: imageId,
                    post_id: '<?php echo $post->ID; ?>',
                    nonce: '<?php echo wp_create_nonce('update_model_featured_image'); ?>'
                },
                success: function(response) {
                    if (response.success) {
                        // Refresh the page to show the updated featured image
                        setTimeout(function() {
                            location.reload();
                        }, 500);
                    } else {
                        console.log('Error updating featured image:', response.data.message);
                    }
                },
                error: function() {
                    console.log('AJAX error when updating featured image');
                }
            });
        }

        function updateMainBadge() {
            // Remove all main badges and main-image classes
            $('.gallery-image-item').removeClass('main-image');
            $('.main-badge').remove();

            // Add main badge to the first image
            const firstImage = $('.gallery-image-item').first();
            if (firstImage.length > 0) {
                firstImage.addClass('main-image');
                firstImage.append('<div class="main-badge">Main</div>');
            }
        }
    });
    </script>
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

        // Make ajaxurl available for AJAX requests
        wp_localize_script('jquery', 'ajax_object', array(
            'ajaxurl' => admin_url('admin-ajax.php')
        ));
    }
}
add_action('admin_enqueue_scripts', 'enqueue_model_gallery_assets');

/**
 * AJAX handler for drag and drop file uploads
 *
 * This function handles file uploads and associates them with the current model post
 *
 * @return void
 */
function handle_model_gallery_upload() {
    // Verify nonce
    if (!wp_verify_nonce($_POST['nonce'], 'upload_model_gallery_images')) {
        wp_die('Security check failed');
    }

    // Check user permissions
    if (!current_user_can('upload_files')) {
        wp_die('You do not have permission to upload files');
    }

    // Check if files were uploaded
    if (empty($_FILES['file'])) {
        wp_send_json_error(array('message' => 'No files uploaded'));
    }

    // Get post ID from the request
    $post_id = isset($_POST['post_id']) ? intval($_POST['post_id']) : 0;

    // Validate post ID and check if it's a valid model post
    if (!$post_id || get_post_type($post_id) !== 'model') {
        wp_send_json_error(array('message' => 'Invalid post ID or not a model post'));
    }

    $attachments = array();
    $files = $_FILES['file'];

    // Handle multiple files
    if (is_array($files['name'])) {
        for ($i = 0; $i < count($files['name']); $i++) {
            $file = array(
                'name' => $files['name'][$i],
                'type' => $files['type'][$i],
                'tmp_name' => $files['tmp_name'][$i],
                'error' => $files['error'][$i],
                'size' => $files['size'][$i]
            );

            // Validate file type
            if (strpos($file['type'], 'image/') !== 0) {
                continue; // Skip non-image files
            }

                                    // Upload file and associate with the model post
            $attachment_id = media_handle_sideload($file, $post_id);

            if (!is_wp_error($attachment_id)) {
                // Set initial gallery order
                $current_count = count(get_attached_media('image', $post_id));
                update_post_meta($attachment_id, '_gallery_order', $current_count);

                $attachments[] = array(
                    'id' => $attachment_id,
                    'url' => wp_get_attachment_url($attachment_id),
                    'sizes' => array(
                        'thumbnail' => array(
                            'url' => wp_get_attachment_image_url($attachment_id, 'thumbnail')
                        )
                    )
                );
            }
        }
    } else {
                        // Handle single file
        if (strpos($files['type'], 'image/') === 0) {
            $attachment_id = media_handle_sideload($files, $post_id);

            if (!is_wp_error($attachment_id)) {
                // Set initial gallery order
                $current_count = count(get_attached_media('image', $post_id));
                update_post_meta($attachment_id, '_gallery_order', $current_count);

                $attachments[] = array(
                    'id' => $attachment_id,
                    'url' => wp_get_attachment_url($attachment_id),
                    'sizes' => array(
                        'thumbnail' => array(
                            'url' => wp_get_attachment_image_url($attachment_id, 'thumbnail')
                        )
                    )
                );
            }
        }
    }

    if (empty($attachments)) {
        wp_send_json_error(array('message' => 'No valid image files uploaded'));
    }

    wp_send_json_success(array('attachments' => $attachments));
}
add_action('wp_ajax_upload_model_gallery_images', 'handle_model_gallery_upload');

/**
 * AJAX handler for deleting images from media library
 *
 * @return void
 */
function handle_model_gallery_image_delete() {
    // Verify nonce
    if (!wp_verify_nonce($_POST['nonce'], 'delete_model_gallery_image')) {
        wp_send_json_error(array('message' => 'Security check failed'));
    }

    // Check user permissions
    if (!current_user_can('delete_posts')) {
        wp_send_json_error(array('message' => 'You do not have permission to delete files'));
    }

    // Get image ID
    $image_id = intval($_POST['image_id']);

    if (!$image_id) {
        wp_send_json_error(array('message' => 'Invalid image ID'));
    }

    // Check if the attachment exists
    $attachment = get_post($image_id);
    if (!$attachment || $attachment->post_type !== 'attachment') {
        wp_send_json_error(array('message' => 'Image not found'));
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
    if (!wp_verify_nonce($_POST['nonce'], 'update_model_gallery_order')) {
        wp_send_json_error(array('message' => 'Security check failed'));
    }

    // Check user permissions
    if (!current_user_can('edit_posts')) {
        wp_send_json_error(array('message' => 'You do not have permission to edit posts'));
    }

    // Get post ID and image IDs
    $post_id = intval($_POST['post_id']);
    $image_ids = isset($_POST['image_ids']) ? array_map('intval', $_POST['image_ids']) : array();

    if (!$post_id || empty($image_ids)) {
        wp_send_json_error(array('message' => 'Invalid post ID or image IDs'));
    }

    // Check if the post exists and is a model
    if (get_post_type($post_id) !== 'model') {
        wp_send_json_error(array('message' => 'Invalid post type'));
    }

    // Update order for each image
    foreach ($image_ids as $position => $image_id) {
        update_post_meta($image_id, '_gallery_order', $position);
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
    if (!wp_verify_nonce($_POST['nonce'], 'update_model_featured_image')) {
        wp_send_json_error(array('message' => 'Security check failed'));
    }

    // Check user permissions
    if (!current_user_can('edit_posts')) {
        wp_send_json_error(array('message' => 'You do not have permission to edit posts'));
    }

    // Get post ID and image ID
    $post_id = intval($_POST['post_id']);
    $image_id = intval($_POST['image_id']);

    if (!$post_id || !$image_id) {
        wp_send_json_error(array('message' => 'Invalid post ID or image ID'));
    }

    // Check if the post exists and is a model
    if (get_post_type($post_id) !== 'model') {
        wp_send_json_error(array('message' => 'Invalid post type'));
    }

    // Check if the image exists and is attached to this post
    $attachment = get_post($image_id);
    if (!$attachment || $attachment->post_type !== 'attachment' || $attachment->post_parent !== $post_id) {
        wp_send_json_error(array('message' => 'Invalid image or image not attached to this post'));
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

            // Sort by gallery order
            usort($attachments, function($a, $b) {
                $order_a = get_post_meta($a->ID, '_gallery_order', true);
                $order_b = get_post_meta($b->ID, '_gallery_order', true);
                return ($order_a ?: 0) - ($order_b ?: 0);
            });

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

    // Sort by gallery order
    usort($attachments, function($a, $b) {
        $order_a = get_post_meta($a->ID, '_gallery_order', true);
        $order_b = get_post_meta($b->ID, '_gallery_order', true);
        return ($order_a ?: 0) - ($order_b ?: 0);
    });

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
