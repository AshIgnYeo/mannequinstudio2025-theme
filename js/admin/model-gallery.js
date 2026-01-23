/**
 * Model Gallery Admin JavaScript
 *
 * @package MannequinStudio2025
 */

(function($) {
    'use strict';

    let mediaUploader;

    /**
     * Initialize the gallery on document ready
     */
    $(document).ready(function() {
        initializeGallery();
    });

    /**
     * Initialize all gallery functionality
     */
    function initializeGallery() {
        // Initialize main badge on page load
        updateMainBadge();

        // Set up event handlers
        setupMediaUploader();
        setupDragAndDrop();
        setupRemoveImage();
        setupSortable();
    }

    /**
     * Set up the WordPress Media Uploader
     */
    function setupMediaUploader() {
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
                const currentImages = getCurrentImageIds();
                const newImageIds = [];

                attachments.forEach(function(attachment) {
                    if (currentImages.indexOf(attachment.id.toString()) === -1) {
                        currentImages.push(attachment.id);
                        newImageIds.push(attachment.id);
                        addImageToGallery(attachment);
                    }
                });

                updateHiddenInput(currentImages);

                // Phase 1 Fix: Attach Media Library images to this model
                if (newImageIds.length > 0) {
                    attachImagesToModel(newImageIds);
                }
            });

            mediaUploader.open();
        });
    }

    /**
     * Attach images from Media Library to the current model (Phase 1 Fix)
     *
     * @param {Array} imageIds - Array of image IDs to attach
     */
    function attachImagesToModel(imageIds) {
        $.ajax({
            url: modelGalleryData.ajaxurl,
            type: 'POST',
            data: {
                action: 'attach_media_library_images',
                image_ids: imageIds,
                post_id: modelGalleryData.postId,
                nonce: modelGalleryData.nonces.attach
            },
            success: function(response) {
                if (response.success) {
                    console.log('Images attached to model successfully');
                } else {
                    console.log('Error attaching images:', response.data.message);
                }
            },
            error: function() {
                console.log('AJAX error when attaching images to model');
            }
        });
    }

    /**
     * Set up drag and drop file upload
     */
    function setupDragAndDrop() {
        const galleryContainer = document.getElementById('model-gallery-images');

        if (!galleryContainer) {
            return;
        }

        galleryContainer.addEventListener('dragenter', handleDragEnter, false);
        galleryContainer.addEventListener('dragover', handleDragOver, false);
        galleryContainer.addEventListener('dragleave', handleDragLeave, false);
        galleryContainer.addEventListener('drop', handleFileDrop, false);

        function handleDragEnter(e) {
            if (e.dataTransfer.types.includes('Files') && !e.target.closest('.gallery-image-item')) {
                e.preventDefault();
                galleryContainer.classList.add('drag-over');
            }
        }

        function handleDragOver(e) {
            if (e.dataTransfer.types.includes('Files') && !e.target.closest('.gallery-image-item')) {
                e.preventDefault();
            }
        }

        function handleDragLeave(e) {
            if (!galleryContainer.contains(e.relatedTarget)) {
                galleryContainer.classList.remove('drag-over');
            }
        }

        function handleFileDrop(e) {
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
    }

    /**
     * Upload files via AJAX
     *
     * @param {FileList} files - Files to upload
     */
    function uploadFiles(files) {
        const formData = new FormData();
        const currentImages = getCurrentImageIds();
        const galleryContainer = document.getElementById('model-gallery-images');

        // Filter only image files
        const imageFiles = Array.from(files).filter(file => file.type.startsWith('image/'));

        if (imageFiles.length === 0) {
            alert('Please select only image files.');
            return;
        }

        // Add each file to FormData
        imageFiles.forEach(function(file) {
            formData.append('file[]', file);
        });

        // Add WordPress nonce and action
        formData.append('action', 'upload_model_gallery_images');
        formData.append('nonce', modelGalleryData.nonces.upload);
        formData.append('post_id', modelGalleryData.postId);

        // Show loading state
        const loadingHtml = '<div class="uploading-message">Uploading images...</div>';
        $(galleryContainer).append(loadingHtml);

        // Upload files via AJAX
        $.ajax({
            url: modelGalleryData.ajaxurl,
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

    /**
     * Set up remove image functionality
     */
    function setupRemoveImage() {
        $(document).on('click', '.remove-image', function() {
            const imageId = $(this).data('image-id');
            const imageElement = $(this).closest('.gallery-image-item');

            if (confirm('Are you sure you want to remove this image? This will also delete it from the media library.')) {
                imageElement.remove();

                const currentImages = getCurrentImageIds().filter(id => id !== '' && id !== imageId.toString());
                updateHiddenInput(currentImages);

                // Delete from media library via AJAX
                $.ajax({
                    url: modelGalleryData.ajaxurl,
                    type: 'POST',
                    data: {
                        action: 'delete_model_gallery_image',
                        image_id: imageId,
                        post_id: modelGalleryData.postId,
                        nonce: modelGalleryData.nonces.delete
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

                setTimeout(function() {
                    updateMainBadge();
                }, 100);
            }
        });
    }

    /**
     * Set up sortable functionality
     */
    function setupSortable() {
        $('#model-gallery-images').sortable({
            placeholder: 'gallery-image-placeholder',
            items: '.gallery-image-item',
            update: function() {
                const imageIds = [];
                $('#model-gallery-images .gallery-image-item').each(function() {
                    imageIds.push($(this).data('image-id'));
                });
                updateHiddenInput(imageIds);
                updateGalleryOrder(imageIds);

                setTimeout(function() {
                    updateMainBadge();
                }, 100);
            }
        });
    }

    /**
     * Add an image to the gallery UI
     *
     * @param {Object} attachment - Attachment data
     */
    function addImageToGallery(attachment) {
        const thumbnailUrl = attachment.sizes && attachment.sizes.thumbnail
            ? attachment.sizes.thumbnail.url
            : attachment.url;

        const imageHtml = `
            <div class="gallery-image-item" data-image-id="${attachment.id}">
                <img src="${thumbnailUrl}" alt="Gallery Image" />
                <button type="button" class="remove-image" data-image-id="${attachment.id}">×</button>
            </div>
        `;
        $('#model-gallery-images').append(imageHtml);

        setTimeout(function() {
            updateMainBadge();
        }, 100);
    }

    /**
     * Get current image IDs from hidden input
     *
     * @returns {Array} Array of image IDs
     */
    function getCurrentImageIds() {
        return $('#model-gallery-images-input').val().split(',').filter(id => id !== '');
    }

    /**
     * Update the hidden input with image IDs
     *
     * @param {Array} imageIds - Array of image IDs
     */
    function updateHiddenInput(imageIds) {
        const validIds = imageIds.filter(id => id !== '' && id !== null && id !== undefined);
        $('#model-gallery-images-input').val(validIds.join(','));
    }

    /**
     * Update gallery order via AJAX
     *
     * @param {Array} imageIds - Array of image IDs in order
     */
    function updateGalleryOrder(imageIds) {
        $.ajax({
            url: modelGalleryData.ajaxurl,
            type: 'POST',
            data: {
                action: 'update_model_gallery_order',
                image_ids: imageIds,
                post_id: modelGalleryData.postId,
                nonce: modelGalleryData.nonces.order
            },
            success: function(response) {
                if (!response.success) {
                    console.log('Error updating gallery order:', response.data.message);
                }
            },
            error: function() {
                console.log('AJAX error when updating gallery order');
            }
        });
    }

    /**
     * Update featured image via AJAX
     *
     * @param {number} imageId - Image ID to set as featured
     */
    function updateFeaturedImage(imageId) {
        $.ajax({
            url: modelGalleryData.ajaxurl,
            type: 'POST',
            data: {
                action: 'update_model_featured_image',
                image_id: imageId,
                post_id: modelGalleryData.postId,
                nonce: modelGalleryData.nonces.featured
            },
            success: function(response) {
                if (response.success) {
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

    /**
     * Update the main badge on the first image
     */
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

})(jQuery);
