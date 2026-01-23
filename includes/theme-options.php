<?php
/**
 * Theme Options functionality for Mannequin Studio
 */

/**
 * Add Theme Options Page
 */
function mannequin_studio_add_options_page() {
    add_theme_page(
        'Mannequin Studio Options',
        'Theme Options',
        'manage_options',
        'mannequin-studio-options',
        'mannequin_studio_options_page'
    );
}
add_action('admin_menu', 'mannequin_studio_add_options_page');

/**
 * Register Theme Options
 */
function mannequin_studio_register_options() {
    register_setting('mannequin_studio_options', 'mannequin_studio_options', 'mannequin_studio_validate_options');
}
add_action('admin_init', 'mannequin_studio_register_options');

/**
 * Validate Options
 */
function mannequin_studio_validate_options($input) {
    $output = array();

    if (isset($input['contact_map_embed'])) {
        $embed_value = $input['contact_map_embed'];

        // Check if the user entered iframe code instead of just the URL
        if (strpos($embed_value, '<iframe') !== false) {
            // Extract src URL from iframe code
            preg_match('/src=["\']([^"\']+)["\']/', $embed_value, $matches);
            if (isset($matches[1])) {
                $embed_value = $matches[1];
            }
        }

        $output['contact_map_embed'] = esc_url_raw($embed_value);
    }

    // Validate Instagram URL
    if (isset($input['contact_instagram'])) {
        $output['contact_instagram'] = esc_url_raw($input['contact_instagram']);
    }

    // Validate Contact Email
    if (isset($input['contact_email'])) {
        $output['contact_email'] = sanitize_email($input['contact_email']);
    }

    // Validate Contact Numbers (array)
    if (isset($input['contact_numbers'])) {
        $numbers = array();
        foreach ($input['contact_numbers'] as $number) {
            if (!empty(trim($number))) {
                $numbers[] = sanitize_text_field($number);
            }
        }
        $output['contact_numbers'] = $numbers;
    }

    // Validate Casting Email
    if (isset($input['casting_email'])) {
        $output['casting_email'] = sanitize_email($input['casting_email']);
    }

    return $output;
}

/**
 * Options Page HTML
 */
function mannequin_studio_options_page() {
    $options = get_option('mannequin_studio_options');
    $contact_map_embed = isset($options['contact_map_embed']) ? $options['contact_map_embed'] : '';
    $contact_instagram = isset($options['contact_instagram']) ? $options['contact_instagram'] : '';
    $contact_email = isset($options['contact_email']) ? $options['contact_email'] : '';
    $contact_numbers = isset($options['contact_numbers']) ? $options['contact_numbers'] : array('');
    $casting_email = isset($options['casting_email']) ? $options['casting_email'] : '';
    ?>
    <div class="wrap">
        <h1>Mannequin Studio Theme Options</h1>
        <form method="post" action="options.php">
            <?php settings_fields('mannequin_studio_options'); ?>
            <?php do_settings_sections('mannequin_studio_options'); ?>

            <h2>Contact Information</h2>
            <table class="form-table">
                <tr valign="top">
                    <th scope="row">Contact Email</th>
                    <td>
                        <input type="email" name="mannequin_studio_options[contact_email]" value="<?php echo esc_attr($contact_email); ?>" class="regular-text" />
                        <p class="description">Enter the main contact email address.</p>
                    </td>
                </tr>
                <tr valign="top">
                    <th scope="row">Contact Numbers</th>
                    <td>
                        <div id="contact-numbers-container">
                            <?php
                            // Show existing numbers or start with one empty field
                            $number_count = max(1, count($contact_numbers));
                            for ($i = 0; $i < $number_count; $i++):
                                $number_value = isset($contact_numbers[$i]) ? $contact_numbers[$i] : '';
                            ?>
                                <div class="contact-number-field" style="margin-bottom: 10px;">
                                    <div style="display: flex; align-items: center;">
                                        <input type="tel" name="mannequin_studio_options[contact_numbers][]" value="<?php echo esc_attr($number_value); ?>" class="regular-text" placeholder="e.g., +65 1234 1234" />
                                        <?php if ($i > 0 || !empty($number_value)): ?>
                                            <span style="cursor: pointer; color: #b32d2e; margin-left: 10px;" class="remove-number dashicons dashicons-trash"></span>
                                        <?php endif; ?>
                                    </div>
                                </div>
                            <?php endfor; ?>
                        </div>
                        <button type="button" id="add-contact-number" class="button">Add Another Number</button>
                        <p class="description">Enter contact phone numbers. Leave empty to remove.</p>
                    </td>
                </tr>
                <tr valign="top">
                    <th scope="row">Instagram URL</th>
                    <td>
                        <input type="url" name="mannequin_studio_options[contact_instagram]" value="<?php echo esc_attr($contact_instagram); ?>" class="regular-text" placeholder="https://instagram.com/yourusername" />
                        <p class="description">Enter the Instagram profile URL.</p>
                    </td>
                </tr>
            </table>

            <h2>Map Settings</h2>
            <table class="form-table">
                <tr valign="top">
                    <th scope="row">Google Maps Embed URL</th>
                    <td>
                        <input type="text" name="mannequin_studio_options[contact_map_embed]" id="contact_map_embed" value="<?php echo esc_attr($contact_map_embed); ?>" class="regular-text" />
                        <p class="description">
                            Enter the Google Maps embed URL or paste the entire iframe code. To get this URL:<br>
                            1. Go to <a href="https://maps.google.com" target="_blank">Google Maps</a><br>
                            2. Search for your location (372 River Valley Road, Singapore)<br>
                            3. Click "Share" → "Embed a map"<br>
                            4. Copy either the src URL or the entire iframe code
                        </p>
                        <div id="iframe-detection-message" style="display: none; margin-top: 5px; padding: 8px; background: #e7f3ff; border-left: 4px solid #0073aa; color: #0073aa;">
                            <strong>Iframe code detected!</strong> The src URL will be automatically extracted when you save.
                        </div>
                        <?php if ($contact_map_embed): ?>
                            <div style="margin-top: 10px;">
                                <iframe
                                    src="<?php echo esc_url($contact_map_embed); ?>"
                                    width="300"
                                    height="200"
                                    style="border:0;"
                                    allowfullscreen=""
                                    loading="lazy"
                                    referrerpolicy="no-referrer-when-downgrade">
                                </iframe>
                            </div>
                        <?php endif; ?>
                    </td>
                </tr>
            </table>

            <h2>Casting Submission Settings</h2>
            <table class="form-table">
                <tr valign="top">
                    <th scope="row">Casting Submission Email</th>
                    <td>
                        <input type="email" name="mannequin_studio_options[casting_email]" value="<?php echo esc_attr($casting_email); ?>" class="regular-text" />
                        <p class="description">Enter the email address where casting submissions should be sent. If empty, the contact email will be used.</p>
                    </td>
                </tr>
            </table>

            <?php submit_button(); ?>
        </form>
    </div>

    <script>
    document.addEventListener('DOMContentLoaded', function() {
        const embedInput = document.getElementById('contact_map_embed');
        const detectionMessage = document.getElementById('iframe-detection-message');

        if (embedInput && detectionMessage) {
            embedInput.addEventListener('input', function() {
                const value = this.value.trim();

                // Check if the input contains iframe code
                if (value.includes('<iframe') && value.includes('src=')) {
                    detectionMessage.style.display = 'block';
                } else {
                    detectionMessage.style.display = 'none';
                }
            });

            // Also check on paste
            embedInput.addEventListener('paste', function() {
                setTimeout(() => {
                    const value = this.value.trim();
                    if (value.includes('<iframe') && value.includes('src=')) {
                        detectionMessage.style.display = 'block';
                    } else {
                        detectionMessage.style.display = 'none';
                    }
                }, 100);
            });
        }

        // Handle dynamic contact number fields
        const addNumberBtn = document.getElementById('add-contact-number');
        const numbersContainer = document.getElementById('contact-numbers-container');

        if (addNumberBtn && numbersContainer) {
            addNumberBtn.addEventListener('click', function() {
                const newField = document.createElement('div');
                newField.className = 'contact-number-field';
                newField.style.marginBottom = '10px';
                newField.innerHTML = `
                    <div style="display: flex; align-items: center;">
                      <input type="tel" name="mannequin_studio_options[contact_numbers][]" value="" class="regular-text" placeholder="e.g., +65 1234 1234" />
                      <span style="cursor: pointer; color: #b32d2e; margin-left: 10px;" class="remove-number dashicons dashicons-trash"></span>
                    </div>
                `;
                numbersContainer.appendChild(newField);
            });

            // Handle remove buttons
            numbersContainer.addEventListener('click', function(e) {
                if (e.target.classList.contains('remove-number')) {
                    e.target.closest('.contact-number-field').remove();
                }
            });
        }
    });
    </script>
    <?php
}

/**
 * Enqueue options data for JavaScript
 */
function mannequin_studio_enqueue_options() {
    $options = get_option('mannequin_studio_options');
    $contact_map_embed = isset($options['contact_map_embed']) ? $options['contact_map_embed'] : '';
    $contact_instagram = isset($options['contact_instagram']) ? $options['contact_instagram'] : '';
    $contact_email = isset($options['contact_email']) ? $options['contact_email'] : '';
    $contact_numbers = isset($options['contact_numbers']) ? $options['contact_numbers'] : array();
    $casting_email = isset($options['casting_email']) ? $options['casting_email'] : '';

    wp_localize_script('ourmainjs', 'mannequinStudioOptions', array(
        'contactMapEmbed' => $contact_map_embed,
        'contactInstagram' => $contact_instagram,
        'contactEmail' => $contact_email,
        'contactNumbers' => $contact_numbers,
        'castingEmail' => $casting_email,
        'ajaxUrl' => admin_url('admin-ajax.php'),
        'castingNonce' => wp_create_nonce('casting_form_submission')
    ));
}
add_action('wp_enqueue_scripts', 'mannequin_studio_enqueue_options');
