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
function boilerplate_body_classes($classes) {
  $classes[] = 'bg-gray-100';
  return $classes;
}

add_filter('body_class', 'boilerplate_body_classes');

/**
 * Custom Post Type: Models
 *
 * @return void
 */
function register_custom_post_types() {
  register_post_type('model', array(
    'public' => true,
    'has_archive' => true,
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

    // Get existing gallery images
    $gallery_images = get_post_meta($post->ID, '_model_gallery_images', true);
    if (!is_array($gallery_images)) {
        $gallery_images = array();
    }

    ?>
    <div id="model-gallery-container">
        <div id="model-gallery-images" class="gallery-images-container">
            <?php if (!empty($gallery_images)): ?>
                <?php foreach ($gallery_images as $index => $image_id): ?>
                    <?php $image = wp_get_attachment_image_src($image_id, 'thumbnail'); ?>
                    <?php if ($image): ?>
                        <div class="gallery-image-item <?php echo $index === 0 ? 'main-image' : ''; ?>" data-image-id="<?php echo esc_attr($image_id); ?>">
                            <img src="<?php echo esc_url($image[0]); ?>" alt="Gallery Image" />
                            <?php if ($index === 0): ?>
                                <div class="main-badge">Main</div>
                            <?php endif; ?>
                            <button type="button" class="remove-image" data-image-id="<?php echo esc_attr($image_id); ?>">×</button>
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
                Click "Add Images to Gallery" to select multiple images. You can drag and drop to reorder them.
            </p>
        </div>

        <input type="hidden" id="model-gallery-images-input" name="model_gallery_images" value="<?php echo esc_attr(implode(',', $gallery_images)); ?>" />
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

    // Save gallery images
    if (isset($_POST['model_gallery_images']) && !empty($_POST['model_gallery_images'])) {
        $gallery_images = array_filter(array_map('intval', explode(',', $_POST['model_gallery_images'])));
        error_log('Saving gallery images: ' . print_r($gallery_images, true));
        update_post_meta($post_id, '_model_gallery_images', $gallery_images);
    } else {
        // If no images are selected, delete the meta
        error_log('No gallery images to save, deleting meta');
        delete_post_meta($post_id, '_model_gallery_images');
    }
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

            // Upload file
            $attachment_id = media_handle_sideload($file, 0);

            if (!is_wp_error($attachment_id)) {
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
            $attachment_id = media_handle_sideload($files, 0);

            if (!is_wp_error($attachment_id)) {
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

    $gallery_images = get_post_meta($post_id, '_model_gallery_images', true);

    if (!is_array($gallery_images)) {
        return array();
    }

    $images = array();
    foreach ($gallery_images as $image_id) {
        $image_data = wp_get_attachment_image_src($image_id, $size);
        if ($image_data) {
            $images[] = array(
                'id' => $image_id,
                'url' => $image_data[0],
                'width' => $image_data[1],
                'height' => $image_data[2],
                'alt' => get_post_meta($image_id, '_wp_attachment_image_alt', true),
                'caption' => wp_get_attachment_caption($image_id),
                'description' => get_post_field('post_content', $image_id)
            );
        }
    }

    return $images;
}
