# Model Gallery Media Uploader

This custom media uploader has been added to the Model post type with the following features:

## Features

- ✅ **Multiple Image Uploads**: Upload multiple images at once
- ✅ **Drag & Drop Upload**: Drag files directly from your computer into the gallery
- ✅ **Drag & Drop Reordering**: Reorder images by dragging and dropping
- ✅ **Media Library Cleanup**: Deleting images from gallery also removes them from media library
- ✅ **Main Image Badge**: First image is marked with a "MAIN" badge
- ✅ **Model Post Type Only**: Only appears on Model post edit pages
- ✅ **Images Only**: Restricts uploads to image files only
- ✅ **No ACF Dependency**: Custom implementation without Advanced Custom Fields
- ✅ **Preserves Existing ACF Fields**: Does not interfere with existing ACF configurations

## How to Use

### In the WordPress Admin

1. Go to **Models** in your WordPress admin menu
2. Create a new Model or edit an existing one
3. You'll see a "Model Gallery" metabox below the content editor
4. **Two ways to add images:**
   - **Drag & Drop**: Simply drag image files from your computer directly into the gallery area
   - **Media Library**: Click "Add Images to Gallery" to open the media library and select existing images
5. Drag and drop images to reorder them
6. Click the "×" button on any image to remove it (this will also delete the image from the media library)
7. The first image will have a "MAIN" badge to indicate it's the primary image
8. Save your Model post

### In Your Templates

Use the `get_model_gallery_images()` function to retrieve gallery images:

```php
// Get all gallery images for the current post
$gallery_images = get_model_gallery_images();

// Get gallery images for a specific post ID
$gallery_images = get_model_gallery_images(123);

// Get gallery images in a specific size
$gallery_images = get_model_gallery_images(null, 'thumbnail');
```

The function returns an array of image data:

```php
foreach ($gallery_images as $image) {
    echo '<img src="' . esc_url($image['url']) . '" alt="' . esc_attr($image['alt']) . '">';
    echo '<p>' . esc_html($image['caption']) . '</p>';
}
```

Each image array contains:

- `id`: WordPress attachment ID
- `url`: Image URL
- `width`: Image width
- `height`: Image height
- `alt`: Alt text
- `caption`: Image caption
- `description`: Image description

## Technical Details

### Database Storage

Gallery images are stored as post meta with the key `_model_gallery_images` as an array of attachment IDs.

### Security

- Nonce verification for form submissions
- User capability checks
- Input sanitization and validation
- Proper escaping in output

### JavaScript Dependencies

- WordPress Media API
- jQuery UI Sortable
- jQuery (included with WordPress)
- HTML5 File API (for drag & drop uploads)

## File Structure

- `functions.php`: Main theme functions file (clean and organized)
- `includes/model-gallery.php`: Contains all the Model Gallery media uploader functionality
- `MODEL-GALLERY-README.md`: This documentation file

## Customization

### Styling

The metabox includes inline CSS that can be customized. Look for the `<style>` section in the `model_gallery_metabox_callback()` function in `includes/model-gallery.php`.

### JavaScript

The JavaScript functionality can be extended by modifying the script section in the same function in `includes/model-gallery.php`.

### Template Integration

Use the `get_model_gallery_images()` function in your Model templates to display the gallery images.

## Troubleshooting

### Images Not Saving

- Check that the user has proper permissions to edit posts
- Verify that the nonce is being generated correctly
- Check for JavaScript errors in the browser console

### Drag & Drop Not Working

- Ensure jQuery UI Sortable is being loaded
- Check that the `enqueue_model_gallery_assets()` function is working
- Verify there are no JavaScript conflicts

### Media Library Not Opening

- Ensure WordPress Media API is being loaded
- Check that the `wp_enqueue_media()` call is working
- Verify user has upload permissions

### Drag & Drop Upload Not Working

- Check that the user has file upload permissions
- Verify that the AJAX handler is properly registered
- Check browser console for JavaScript errors
- Ensure files being dragged are image files (jpg, png, gif, etc.)
- Check that the nonce is being generated correctly

### Image Deletion Issues

- Ensure the user has delete permissions for posts/attachments
- Check that the AJAX handler for deletion is properly registered
- Verify that the nonce is being generated correctly
- Check browser console for any JavaScript errors during deletion
