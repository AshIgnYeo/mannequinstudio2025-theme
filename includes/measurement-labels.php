<?php
/**
 * Measurement Labels Options Page
 *
 * Custom options page for managing measurement labels under Models section
 *
 * @package MannequinStudio2025
 */

// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

/**
 * Add Measurement Labels submenu page under Models
 *
 * @return void
 */
function add_measurement_labels_submenu() {
    add_submenu_page(
        'edit.php?post_type=model',
        'Measurement Labels',
        'Measurement Labels',
        'manage_options',
        'measurement-labels',
        'measurement_labels_page_callback'
    );
}
add_action('admin_menu', 'add_measurement_labels_submenu');

/**
 * Measurement Labels page callback
 *
 * @return void
 */
function measurement_labels_page_callback() {
    // Handle form submission
    if (isset($_POST['submit']) && wp_verify_nonce($_POST['measurement_labels_nonce'], 'measurement_labels_action')) {
        $measurement_labels = array();

        if (isset($_POST['measurement_labels']) && is_array($_POST['measurement_labels'])) {
            foreach ($_POST['measurement_labels'] as $label) {
                if (!empty($label['name']) && !empty($label['unit'])) {
                    $measurement_labels[] = array(
                        'name' => sanitize_text_field($label['name']),
                        'unit' => sanitize_text_field($label['unit'])
                    );
                }
            }
        }

        update_option('measurement_labels', $measurement_labels);
        echo '<div class="notice notice-success"><p>Measurement labels saved successfully!</p></div>';
    }

    // Get existing measurement labels
    $measurement_labels = get_option('measurement_labels', array());

    ?>
    <div class="wrap">
        <h1>Measurement Labels</h1>
        <p>Manage measurement labels for models. Add measurement types and their corresponding units.</p>

        <form method="post" action="">
            <?php wp_nonce_field('measurement_labels_action', 'measurement_labels_nonce'); ?>

            <div id="measurement-labels-container">
                <?php if (empty($measurement_labels)): ?>
                    <div class="measurement-label-row">
                        <table class="form-table">
                            <tr>
                                <th scope="row">
                                    <label for="measurement_name_0">Measurement Name</label>
                                </th>
                                <td>
                                    <input type="text" id="measurement_name_0" name="measurement_labels[0][name]" value="" class="regular-text" placeholder="height" />
                                </td>
                            </tr>
                            <tr>
                                <th scope="row">
                                    <label for="measurement_unit_0">Unit</label>
                                </th>
                                <td>
                                    <input type="text" id="measurement_unit_0" name="measurement_labels[0][unit]" value="" class="regular-text" placeholder="cm" />
                                </td>
                            </tr>
                        </table>
                        <button type="button" class="button remove-measurement-label" style="color: #dc3232;">Remove</button>

                    </div>
                <?php else: ?>
                    <?php foreach ($measurement_labels as $index => $label): ?>
                        <div class="measurement-label-row">
                            <table class="form-table">
                                <tr>
                                    <th scope="row">
                                        <label for="measurement_name_<?php echo $index; ?>">Measurement Name</label>
                                    </th>
                                    <td>
                                        <input type="text" id="measurement_name_<?php echo $index; ?>" name="measurement_labels[<?php echo $index; ?>][name]" value="<?php echo esc_attr($label['name']); ?>" class="regular-text" placeholder="Height" />
                                    </td>
                                </tr>
                                <tr>
                                    <th scope="row">
                                        <label for="measurement_unit_<?php echo $index; ?>">Unit</label>
                                    </th>
                                    <td>
                                        <input type="text" id="measurement_unit_<?php echo $index; ?>" name="measurement_labels[<?php echo $index; ?>][unit]" value="<?php echo esc_attr($label['unit']); ?>" class="regular-text" placeholder="cm" />
                                    </td>
                                </tr>
                            </table>
                            <button type="button" class="button remove-measurement-label" style="color: #dc3232;">Remove</button>

                        </div>
                    <?php endforeach; ?>
                <?php endif; ?>
            </div>

            <p>
                <button type="button" id="add-measurement-label" class="button button-secondary">Add New Measurement Label</button>
            </p>

            <?php submit_button('Save Measurement Labels'); ?>
        </form>
    </div>

    <script>
    jQuery(document).ready(function($) {
        var labelIndex = <?php echo count($measurement_labels); ?>;

        // Add new measurement label
        $('#add-measurement-label').click(function() {
            var newRow = '<div class="measurement-label-row">' +
                '<table class="form-table">' +
                    '<tr>' +
                        '<th scope="row">' +
                            '<label for="measurement_name_' + labelIndex + '">Measurement Name</label>' +
                        '</th>' +
                        '<td>' +
                            '<input type="text" id="measurement_name_' + labelIndex + '" name="measurement_labels[' + labelIndex + '][name]" value="" class="regular-text" placeholder="Height" />' +
                        '</td>' +
                    '</tr>' +
                    '<tr>' +
                        '<th scope="row">' +
                            '<label for="measurement_unit_' + labelIndex + '">Unit</label>' +
                        '</th>' +
                        '<td>' +
                            '<input type="text" id="measurement_unit_' + labelIndex + '" name="measurement_labels[' + labelIndex + '][unit]" value="" class="regular-text" placeholder="cm" />' +
                        '</td>' +
                    '</tr>' +
                '</table>' +
                '<button type="button" class="button remove-measurement-label" style="color: #dc3232;">Remove</button>' +
            '</div>';

            $('#measurement-labels-container').append(newRow);
            labelIndex++;
        });

        // Remove measurement label
        $(document).on('click', '.remove-measurement-label', function() {
            $(this).closest('.measurement-label-row').remove();
        });
    });
    </script>

    <style>
    .measurement-label-row {
        background: #fff;
        border: 1px solid #ccd0d4;
        border-radius: 4px;
        padding: 1rem;
        margin-bottom: 1rem;
    }

    .measurement-label-row .form-table {
        margin-bottom: 15px;
    }



    .remove-measurement-label {
        margin-top: 10px;
    }
    </style>
    <?php
}

/**
 * Get measurement labels option
 *
 * @return array
 */
function get_measurement_labels() {
    return get_option('measurement_labels', array());
}

/**
 * Get measurement label by name
 *
 * @param string $name
 * @return string|false
 */
function get_measurement_label_unit($name) {
    $labels = get_measurement_labels();

    foreach ($labels as $label) {
        if ($label['name'] === $name) {
            return $label['unit'];
        }
    }

    return false;
}

/**
 * Register REST API endpoint for measurement labels
 *
 * @return void
 */
function register_measurement_labels_rest_endpoint() {
    register_rest_route('mannequin-studio/v1', '/measurement-labels', array(
        'methods' => 'GET',
        'callback' => 'get_measurement_labels_rest_callback',
        // Public read access - measurement labels are non-sensitive display data
        // needed by frontend to render model statistics
        'permission_callback' => function() {
            // Allow public read access for GET requests
            // If this endpoint is extended with write methods, add authentication
            return true;
        },
        'args' => array(
            'name' => array(
                'description' => 'Filter by measurement name',
                'type' => 'string',
                'sanitize_callback' => 'sanitize_text_field',
            ),
        ),
    ));
}
add_action('rest_api_init', 'register_measurement_labels_rest_endpoint');

/**
 * REST API callback for measurement labels
 *
 * @param WP_REST_Request $request
 * @return WP_REST_Response|WP_Error
 */
function get_measurement_labels_rest_callback($request) {
    $measurement_labels = get_measurement_labels();
    $name_filter = $request->get_param('name');

    // If name filter is provided, return only matching label
    if ($name_filter) {
        $filtered_labels = array();
        foreach ($measurement_labels as $label) {
            if (strtolower($label['name']) === strtolower($name_filter)) {
                $filtered_labels[] = $label;
            }
        }
        return rest_ensure_response($filtered_labels);
    }

    return rest_ensure_response($measurement_labels);
}

/**
 * Add measurement labels to model REST API response
 *
 * @param WP_REST_Response $response
 * @param WP_Post $post
 * @param WP_REST_Request $request
 * @return WP_REST_Response
 */
function add_measurement_labels_to_model_response($response, $post, $request) {
    if ($post->post_type === 'model') {
        $measurement_labels = get_measurement_labels();
        $response->data['measurement_labels'] = $measurement_labels;
    }

    return $response;
}
add_filter('rest_prepare_model', 'add_measurement_labels_to_model_response', 10, 3);
