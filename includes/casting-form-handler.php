<?php
/**
 * Casting Form Submission Handler
 * Handles AJAX form submissions and sends emails with attachments
 */

/**
 * Handle casting form submission via AJAX
 *
 * @return void Sends JSON response
 */
function handle_casting_form_submission() {
    // Verify nonce for security
    if (!isset($_POST['nonce']) || !wp_verify_nonce($_POST['nonce'], 'casting_form_submission')) {
        wp_send_json_error(array(
            'message' => 'Security verification failed. Please refresh the page and try again.'
        ));
        return;
    }

    // Rate limiting check (basic implementation using transients)
    $ip_address = $_SERVER['REMOTE_ADDR'];
    $rate_limit_key = 'casting_form_' . md5($ip_address);
    $submission_count = get_transient($rate_limit_key);

    // Skip rate limiting on localhost
    $is_local = in_array($ip_address, array('127.0.0.1', '::1')) || strpos($_SERVER['HTTP_HOST'] ?? '', '.local') !== false;

    if (!$is_local && $submission_count && $submission_count >= 3) {
        wp_send_json_error(array(
            'message' => 'Too many submissions. Please wait 1 hour before submitting again.'
        ));
        return;
    }

    // Validate required text fields (common to all genders)
    $required_fields = array(
        'name' => 'Full Name',
        'email' => 'Email Address',
        'phone' => 'Phone Number',
        'gender' => 'Gender',
        'ethnicity' => 'Ethnicity',
        'hair_colour' => 'Hair Colour',
        'eye_colour' => 'Eye Colour',
        'height' => 'Height',
        'waist' => 'Waist',
        'shoe_size' => 'Shoe Size'
    );

    $gender = isset($_POST['gender']) ? sanitize_text_field($_POST['gender']) : '';

    // Gender-specific required fields
    if ($gender === 'Female') {
        $required_fields['bust'] = 'Bust';
        $required_fields['hip'] = 'Hip';
        $required_fields['dress'] = 'Dress';
    } elseif ($gender === 'Male') {
        $required_fields['chest'] = 'Chest';
        $required_fields['collar'] = 'Collar';
        $required_fields['suit'] = 'Suit';
    }

    $form_data = array();
    $validation_errors = array();

    foreach ($required_fields as $field => $label) {
        if (empty($_POST[$field])) {
            $validation_errors[] = $label . ' is required.';
        } else {
            $form_data[$field] = sanitize_text_field($_POST[$field]);
        }
    }

    // Validate email format
    if (!empty($_POST['email']) && !is_email($_POST['email'])) {
        $validation_errors[] = 'Please provide a valid email address.';
    }

    // Optional fields (gender-specific measurements that weren't required)
    $optional_fields = array('bust', 'chest', 'hip', 'collar', 'dress', 'suit', 'instagram', 'tiktok', 'youtube');
    foreach ($optional_fields as $field) {
        if (!isset($form_data[$field]) && isset($_POST[$field])) {
            $form_data[$field] = sanitize_text_field($_POST[$field]);
        }
    }

    // Check for validation errors
    if (!empty($validation_errors)) {
        wp_send_json_error(array(
            'message' => 'Please fix the following errors:',
            'errors' => $validation_errors
        ));
        return;
    }

    // Validate file uploads
    if (empty($_FILES['photos'])) {
        wp_send_json_error(array(
            'message' => 'Please upload all 5 required photos.'
        ));
        return;
    }

    $photo_labels = array(
        'photo_1' => 'Mid-length shot',
        'photo_2' => 'Close-up (hair down, smile)',
        'photo_3' => 'Close-up (hair up, no smile)',
        'photo_4' => 'Full length',
        'photo_5' => 'Full length (bikini/swimwear)'
    );

    $uploaded_files = array();
    $upload_errors = array();
    $allowed_types = array('image/jpeg', 'image/jpg', 'image/gif', 'image/png', 'image/webp', 'image/heic', 'image/heif');
    $max_size = 5 * 1024 * 1024; // 5MB in bytes

    foreach ($photo_labels as $field_name => $label) {
        if (empty($_FILES['photos']['name'][$field_name])) {
            $upload_errors[] = $label . ' is required.';
            continue;
        }

        $file = array(
            'name' => $_FILES['photos']['name'][$field_name],
            'type' => $_FILES['photos']['type'][$field_name],
            'tmp_name' => $_FILES['photos']['tmp_name'][$field_name],
            'error' => $_FILES['photos']['error'][$field_name],
            'size' => $_FILES['photos']['size'][$field_name]
        );

        // Check for upload errors
        if ($file['error'] !== UPLOAD_ERR_OK) {
            $upload_errors[] = $label . ' failed to upload. Please try again.';
            continue;
        }

        // Validate file type
        if (!in_array($file['type'], $allowed_types)) {
            $upload_errors[] = $label . ' must be an image file (JPG, PNG, GIF, or WebP).';
            continue;
        }

        // Validate file size
        if ($file['size'] > $max_size) {
            $upload_errors[] = $label . ' must be under 5MB (currently ' . round($file['size'] / 1024 / 1024, 2) . 'MB).';
            continue;
        }

        // Store validated file info
        $uploaded_files[$field_name] = array(
            'path' => $file['tmp_name'],
            'name' => sanitize_file_name($file['name']),
            'type' => $file['type'],
            'label' => $label
        );
    }

    // Check for upload errors
    if (!empty($upload_errors)) {
        wp_send_json_error(array(
            'message' => 'Please fix the following photo upload errors:',
            'errors' => $upload_errors
        ));
        return;
    }

    // Get recipient email
    $options = get_option('mannequin_studio_options');
    $to_email = !empty($options['casting_email']) ? $options['casting_email'] : $options['contact_email'];

    if (empty($to_email)) {
        wp_send_json_error(array(
            'message' => 'Submission system not configured. Please contact us directly.'
        ));
        return;
    }

    // Prepare email
    $subject = 'New Casting Submission: ' . $form_data['name'];

    // Build email body
    $message = "New casting submission received:\n\n";
    $message .= "=== PERSONAL INFORMATION ===\n";
    $message .= "Name: " . $form_data['name'] . "\n";
    $message .= "Email: " . $form_data['email'] . "\n";
    $message .= "Phone: " . $form_data['phone'] . "\n";
    $message .= "Gender: " . $form_data['gender'] . "\n";
    $message .= "Ethnicity: " . $form_data['ethnicity'] . "\n\n";

    $message .= "=== PHYSICAL ATTRIBUTES ===\n";
    $message .= "Hair Colour: " . $form_data['hair_colour'] . "\n";
    $message .= "Eye Colour: " . $form_data['eye_colour'] . "\n\n";

    $message .= "=== MEASUREMENTS ===\n";
    $message .= "Height: " . $form_data['height'] . "\n";

    if ($gender === 'Female') {
        $message .= "Bust: " . $form_data['bust'] . "\n";
    } elseif ($gender === 'Male') {
        $message .= "Chest: " . $form_data['chest'] . "\n";
    }

    $message .= "Waist: " . $form_data['waist'] . "\n";

    if ($gender === 'Female') {
        $message .= "Hip: " . $form_data['hip'] . "\n";
    } elseif ($gender === 'Male') {
        $message .= "Collar: " . $form_data['collar'] . "\n";
    }

    $message .= "Shoe Size: " . $form_data['shoe_size'] . "\n";

    if ($gender === 'Female' && !empty($form_data['dress'])) {
        $message .= "Dress: " . $form_data['dress'] . "\n";
    } elseif ($gender === 'Male' && !empty($form_data['suit'])) {
        $message .= "Suit: " . $form_data['suit'] . "\n";
    }

    $message .= "\n";

    $has_socials = !empty($form_data['instagram']) || !empty($form_data['tiktok']) || !empty($form_data['youtube']);
    if ($has_socials) {
        $message .= "=== SOCIAL MEDIA ===\n";
        if (!empty($form_data['instagram'])) {
            $message .= "Instagram: " . $form_data['instagram'] . "\n";
        }
        if (!empty($form_data['tiktok'])) {
            $message .= "TikTok: " . $form_data['tiktok'] . "\n";
        }
        if (!empty($form_data['youtube'])) {
            $message .= "YouTube: " . $form_data['youtube'] . "\n";
        }
        $message .= "\n";
    }

    $message .= "=== PHOTOS ===\n";
    foreach ($uploaded_files as $field => $file) {
        $message .= $file['label'] . ": " . $file['name'] . "\n";
    }

    $message .= "\n---\n";
    $message .= "Submitted: " . current_time('mysql') . "\n";
    $message .= "IP Address: " . $ip_address . "\n";

    // Email headers
    $headers = array(
        'From: ' . $form_data['name'] . ' <' . $form_data['email'] . '>',
        'Reply-To: ' . $form_data['email']
    );

    // Prepare attachments - copy to temp files with proper names
    // (PHP temp uploads have no extension, causing unnamed attachments)
    $attachments = array();
    $temp_files = array();
    $temp_dir = get_temp_dir();

    foreach ($uploaded_files as $file) {
        $temp_path = $temp_dir . $file['name'];
        if (copy($file['path'], $temp_path)) {
            $attachments[] = $temp_path;
            $temp_files[] = $temp_path;
        } else {
            $attachments[] = $file['path'];
        }
    }

    // Send email
    $email_sent = wp_mail($to_email, $subject, $message, $headers, $attachments);

    // Clean up temp files
    foreach ($temp_files as $temp_file) {
        @unlink($temp_file);
    }

    if (!$email_sent) {
        // Capture the PHPMailer error for debugging
        global $phpmailer;
        $mail_error = '';
        if (isset($phpmailer) && is_object($phpmailer)) {
            $mail_error = $phpmailer->ErrorInfo;
        }
        error_log('Casting form wp_mail() failed. To: ' . $to_email . ' | Error: ' . $mail_error);

        wp_send_json_error(array(
            'message' => 'Failed to send submission. Please try again or contact us directly at ' . $to_email,
            'debug' => $mail_error
        ));
        return;
    }

    // Increment rate limit counter
    $new_count = $submission_count ? $submission_count + 1 : 1;
    set_transient($rate_limit_key, $new_count, HOUR_IN_SECONDS);

    // Success response
    wp_send_json_success(array(
        'message' => 'Thank you! Your casting submission has been received. We will review your application and contact you soon.'
    ));
}

// Register AJAX handlers for both logged-in and non-logged-in users
add_action('wp_ajax_submit_casting_form', 'handle_casting_form_submission');
add_action('wp_ajax_nopriv_submit_casting_form', 'handle_casting_form_submission');
