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
?>



<?php
//if (is_admin()) {
    // create custom plugin settings menu
    add_action('admin_menu', 'steem_plugin_menu');
//}

function steem_plugin_menu() {
    //create new top-level menu
    add_menu_page('Steem Plugin Settings', 'Steem', 'administrator', __FILE__, 'steem_plugin_settings_page' , null );

    //call register settings function
    add_action( 'admin_init', 'register_steem_plugin_settings' );

    add_option( 'steem_tag', null, null, 'yes' );
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
?>

<?php
function steem_plugin( $atts ){
    return get_option('steem_tag');
}
add_shortcode( 'steemplugin', 'steem_plugin' );


?>

