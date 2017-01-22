<?php
/*
Plugin Name: Steem
Plugin URI:  https://github.com/sean0010/press
Description: Steem Wordpress Plugin
Version:     0.0.1
Author:      morning
Author URI:  htps://steemit.com/@morning
Text Domain: steemit
License:     GPL2
*/


// Make sure we don't expose any info if called directly
if (!function_exists('add_action')) {
    echo 'Hi there!  I\'m just a plugin, not much I can do when called directly.';
    exit;
}

//register_activation_hook( __FILE__, array( 'Steem', 'plugin_activation' ) );
//register_deactivation_hook( __FILE__, array( 'Steem', 'plugin_deactivation' ) );

//if (is_admin()) {
    // create custom plugin settings menu
    add_action('admin_menu', 'steem_plugin_menu');
//}

function steem_plugin_menu() {
    //create new top-level menu
    add_menu_page('Steem Plugin Settings', 'Steem', 'administrator', __FILE__, 'steem_plugin_settings_page' , null );

    //call register settings function
    add_action('admin_init', 'register_steem_plugin_settings' );

    add_option('steem_tag');
}

function register_steem_plugin_settings() {
    //register our settings
    register_setting( 'steem-plugin-settings-group', 'steem_tag' );
}

function steem_plugin_settings_page() {
?>
<div class="wrap">
    <h1>Steem</h1>

    <form method="post" action="options.php">
        <?php settings_fields( 'steem-plugin-settings-group' ); ?>
        <?php do_settings_sections( 'steem-plugin-settings-group' ); ?>
        <table class="form-table">
            <tr valign="top">
                <th scope="row">Tag</th>
                <td><input type="text" name="steem_tag" value="<?php echo esc_attr( get_option('steem_tag') ); ?>" /></td>
            </tr>
        </table>    
        <?php submit_button(); ?>
    </form>
</div>
<?php
}

/**
* Short Code
*/
function steem_plugin( $atts ) {
    $shortcode_replace_content = '<div class="steemContainer" data-steemtag="'.get_option('steem_tag').'">';
    $shortcode_replace_content .= ' <div class="tagLabel">TAG: </div><div class="tagName"></div>';
    $shortcode_replace_content .= ' <div class="steemAccount"></div>';
    $shortcode_replace_content .= ' <div class="discussions">';
    $shortcode_replace_content .= '  <table class="table"><tbody><tr><th width="*">Title</th><th width="80">Author</th><th width="40">Vote</th><th width="80">Created</th></tr></tbody></table>';
    $shortcode_replace_content .= '  <div class="loaderSpace"><div class="loader"><svg class="circular" viewBox="25 25 50 50"><circle class="path" cx="50" cy="50" r="20" fill="none" stroke-width="4" stroke-miterlimit="10"/></svg></div></div>';
    $shortcode_replace_content .= ' </div>';
    $shortcode_replace_content .= ' <button class="more button">Load More</div>';
    $shortcode_replace_content .= '</div>';
    return $shortcode_replace_content;
}

add_shortcode('steemplugin', 'steem_plugin');


/**
* Display DB.options.steemtag at front-end
*/
function steem_plugin_frontend_js() {
    wp_register_script('steemconnect.js', 'https://cdn.steemjs.com/lib/latest/steemconnect.min.js');
    wp_enqueue_script('steemconnect.js');

    wp_register_script('steem.min.js', 'https://cdn.steemjs.com/lib/latest/steem.min.js');
    wp_enqueue_script('steem.min.js');

    wp_register_script('steem.plugin.js', plugin_dir_url( __FILE__ ) . 'js/steem.plugin.js');
    wp_enqueue_script('steem.plugin.js');

    wp_register_style('steem.plugin.css', plugin_dir_url( __FILE__ ) . 'css/steem.plugin.css');
    wp_enqueue_style('steem.plugin.css');
}


add_action('steem_plugin_frontend_js', 'steem_plugin_frontend_js');
do_action('steem_plugin_frontend_js');



