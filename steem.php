<?php
/*
Plugin Name: Steemeasy
Plugin URI:  https://github.com/sean0010/press
Description: Steem Wordpress Plugin
Version:     0.5.4
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

/**
* Short Code
*/
function steem_plugin( $atts ) {
    $a = shortcode_atts( array(
        'locale' => '',
        'replyimoticons' => '',
        'mute' => '',
        'mutepermlinks' => '',
        'tag' => get_option('steem_tag'),
        'limit' => get_option('limit'),
        'ann' => get_option('ann')
    ), $atts );

    $c = '<div class="steemContainer" data-locale="'.esc_html__($a['locale']).'" data-imoticons="'.esc_html__($a['replyimoticons']).'" data-mute="'.esc_html__($a['mute']).'" data-mutepermlinks="'.esc_html__($a['mutepermlinks']).'" data-steemtag="'.esc_html__($a['tag']).'" data-limit="'.esc_html__($a['limit']).'" data-appname="'.esc_html__(get_option('sc2_appname')).'" data-beneficiaryaccount="'.esc_html__(get_option('beneficiary_account')).'" data-beneficiarypercentage="'.esc_html__(get_option('beneficiary_percentage')).'">';
    $c .= ' <div class="tagLabel">#</div><div class="tagName"></div>';
    $c .= ' <div class="refreshButtonContainer"><button class="refreshButton button" title="Refresh">↻</button></div>';
    $c .= ' <div class="steemAccount"></div>';
    $c .= ' <div class="postWrite">';
    $c .= '  <input type="text" class="postTitle" placeholder="Title">';
    $c .= '  <textarea class="editor"></textarea>';
    $c .= '  <div class="tagRow"><div class="mainTagLabel">Tag:</div><div class="mainTag"></div><input type="text" class="postTags"></div>';
    $c .= '  <span class="segmented">';
    $c .= '   <label><input type="radio" name="payout" value="100"><span class="label">Power Up 100%</span></label>';
    $c .= '   <label><input type="radio" name="payout" value="50" checked><span class="label">50% | 50%</span></label>';
    $c .= '   <label><input type="radio" name="payout" value="0"><span class="label">Decline</span></label>';
    $c .= '  </span>';
    $c .= '  <div class="selfVoteContainer"><input type="checkbox" class="selfVote" name="selfVote">Upvote</div>';
    $c .= '  <div class="notice">1% Reward Commission Apply (글보상에서 1% 커미션 있음)</div>';
    $c .= '  <button class="publish button">Publish</button>';
    $c .= '  <button class="cancelWrite button">Cancel</button>';
    $c .= '  <div class="preview"></div>';
    $c .= ' </div>';
    $c .= ' <div class="postDetails">';
    $c .= '  <div class="postDetailsCloseContainer">';
    $c .= '   <button class="postDetailsCloseButton button">ⓧ</button>';
    $c .= '  </div>';
    $c .= '  <div class="postHeader">';
    $c .= '   <div class="postTitle"></div>';
    $c .= '   <div class="postAuthor"></div>';
    $c .= '   <div class="postCreated"></div>';
    $c .= '  </div>';
    $c .= '  <div class="postBody"></div>';
    $c .= '  <div class="postFooter">';
    $c .= '   <div class="postTagsContainer"></div>';
    $c .= '   <div class="voteContainer">';
    $c .= '    <button class="vote upvote"><span class="voteText"><svg enable-background="new 0 0 32 32" version="1.1" viewBox="0 0 32 32" xml:space="preserve" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><g><path d="M16.699,11.293c-0.384-0.38-1.044-0.381-1.429,0l-6.999,6.899c-0.394,0.391-0.394,1.024,0,1.414 c0.395,0.391,1.034,0.391,1.429,0l6.285-6.195l6.285,6.196c0.394,0.391,1.034,0.391,1.429,0c0.394-0.391,0.394-1.024,0-1.414 L16.699,11.293z" fill="#4ba2f2"></path></g></svg></span><span class="voteCount">0</span></button>';
    $c .= '    <div class="up votePower">';
    $c .= '     <ul></ul>';
    $c .= '     <div class="addRow">';
    $c .= '      <input type="text" class="customPercentInput" maxlength="3">';
    $c .= '      <span class="percentSymbol">%</span>';
    $c .= '      <div class="addVoteOption"><span class="plusbutton"></span></div>';
    $c .= '     </div>';
    $c .= '     <div class="voteLoader"></div>';
    $c .= '    </div>';
    $c .= '    <div class="postReward"></div>';
    $c .= '   </div>';
    $c .= '   <div class="linksContainer"></div>';
    $c .= '  </div>';
    $c .= '  <div class="replyContainer"></div>';
    $c .= '  <div class="replyForm">';
    $c .= '   <textarea class="replyInput" placeholder="Comment"></textarea>';
    $c .= '   <div class="replyPreview"></div>';
    $c .= '   <div class="replyImoticonButtons"></div>';
    $c .= '   <button class="replyButton button">Submit</button>';
    $c .= '  </div>';
    $c .= ' </div>';
    $c .= ' <div class="ann" data-param="'.esc_html__($a['ann']).'"></div>';
    $c .= ' <div class="discussions">';
    $c .= '  <div class="postsList"></div>';
    $c .= '  <div class="loaderSpace"><div class="loader"><svg class="circular" viewBox="25 25 50 50"><circle class="path" cx="50" cy="50" r="20" fill="none" stroke-width="4" stroke-miterlimit="10"/></svg></div></div>';
    $c .= ' </div>';
    $c .= ' <button class="more button">Load More</button>';
    $c .= '</div>';
    return $c;
}

function steem_shortcode($atts = [], $content = null, $tag = '') {
    // normalize attribute keys, lowercase
    $atts = array_change_key_case((array)$atts, CASE_LOWER);
    // override default attributes with user attributes
    $steemeasy_atts = shortcode_atts(['title' => 'steemeasy.com'], $atts, $tag);
    $o = '';
    $o .= '<div class="steemeasy-box">';
    $o .= '<h2>' . esc_html__($steemeasy_atts['title'], 'steemeasy') . '</h2>';

    // enclosing tags
    if (!is_null($content)) {
        // secure output by executing the_content filter hook on $content
        $o .= apply_filters('the_content', $content);
        // run shortcode parser recursively
        $o .= do_shortcode($content);
    }
    $o .= '</div>';
    return $o;
}

function steem_shortcodes_init() {
    add_shortcode('steemeasy', 'steem_shortcode');
}



/**
* Display DB.options.steemtag at front-end
*/
function steem_plugin_frontend_js() {
    wp_register_script('sc2.min.js', plugin_dir_url( __FILE__ ) . 'js/sc2.min.js');
    wp_enqueue_script('sc2.min.js?v=23');

    wp_register_script('steem.min.js', plugin_dir_url( __FILE__ ) . 'js/steem.min.js');
    wp_enqueue_script('steem.min.js?v=23');

    wp_register_script('lodash.min.js', plugin_dir_url( __FILE__ ) . 'js/lodash.min.js');
    wp_enqueue_script('lodash.min.js');

    wp_register_script('remarkable.min.js', plugin_dir_url( __FILE__ ) . 'js/remarkable.min.js');
    wp_enqueue_script('remarkable.min.js');

    wp_register_script('helper.js', plugin_dir_url( __FILE__ ) . 'js/helper.js');
    wp_enqueue_script('helper.js?v=29');

    wp_register_script('render.js', plugin_dir_url( __FILE__ ) . 'js/render.js');
    wp_enqueue_script('render.js?v=32');

    wp_register_script('vote.js', plugin_dir_url( __FILE__ ) . 'js/vote.js');
    wp_enqueue_script('vote.js?v=23');

    wp_register_script('tag.js', plugin_dir_url( __FILE__ ) . 'js/tag.js');
    wp_enqueue_script('tag.js?v=24');

    wp_register_script('steem.plugin.js', plugin_dir_url( __FILE__ ) . 'js/steem.plugin.js');
    wp_enqueue_script('steem.plugin.js?v=31');

    wp_register_style('steem.plugin.css', plugin_dir_url( __FILE__ ) . 'css/steem.plugin.css');
    wp_enqueue_style('steem.plugin.css?v=28');
}

function steem_plugin_menu() {
    //create new top-level menu
    add_menu_page('Steemeasy Settings', 'Steemeasy', 'administrator', 'steemeasy', 'steemeasy_settings_page' , null );
    //call register settings function
    //add_action('admin_init', 'register_steem_plugin_settings' );
    register_setting( 'steemeasy-settings-group', 'sc2_appname' );
    register_setting( 'steemeasy-settings-group', 'beneficiary_account' );
    register_setting( 'steemeasy-settings-group', 'beneficiary_percentage' );
    add_option('sc2_appname');
    add_option('beneficiary_account');
    add_option('beneficiary_percentage');
}

function steemeasy_settings_page() {
?>
<div class="wrap">
    <h1>Steemeasy Settings</h1>

    <form method="post" action="options.php">
        <?php settings_fields( 'steemeasy-settings-group' ); ?>
        <?php do_settings_sections( 'steemeasy-settings-group' ); ?>
        <table class="form-table">
            <tr>
                <th scope="row">SteemConnect2 App Name</th>
                <td><input type="text" name="sc2_appname" value="<?php echo esc_attr( get_option('sc2_appname') ); ?>" /></td>
            </tr>
        </table>
        <hr>
        <table class="form-table">
            <tr>
              <th>Beneficiaries</th>
              <td><a target="_blank" href="https://steemit.com/steem/@steemitblog/steem-0-17-change-proposal-introduction">steemitblog posting</a>, <a target="_blank" href="https://github.com/steemit/steem/issues/773">Github issue</a></td>
            <tr>
                <th scope="row">Beneficiary Steem Account</th>
                <td>@<input type="text" name="beneficiary_account" value="<?php echo esc_attr( get_option('beneficiary_account') ); ?>" /></td>
            </tr>
            <tr>
                <th scope="row">Beneficiary Percentage (1~99)</th>
                <td><input type="text" name="beneficiary_percentage" value="<?php echo esc_attr( get_option('beneficiary_percentage') ); ?>" />%</td>
            </tr>
        </table>
        <?php submit_button(); ?>
    </form>
</div>
<?php
}

if (is_admin()) {
    // Back-end
    register_activation_hook( __FILE__, 'plugin_activation');
    register_uninstall_hook( __FILE__, 'plugin_uninstall');
    add_action('admin_menu', 'steem_plugin_menu');
    add_action('admin_enqueue_scripts', 'steem_plugin_backend_js');
} else {
    // Front-end
    add_action('init', 'steem_shortcodes_init');
    add_shortcode('steemplugin', 'steem_plugin');
    add_action('steem_plugin_frontend_js', 'steem_plugin_frontend_js');
    do_action('steem_plugin_frontend_js');
}
