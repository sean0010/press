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

/**
* Short Code
*/
function steem_plugin( $atts ) {
    $a = shortcode_atts( array(
        'tag' => get_option('steem_tag'),
        'limit' => get_option('limit')
    ), $atts );
    
    //$shortcode_replace_content = '<div class="steemContainer" data-steemtag="'.get_option('steem_tag').'">';
    $shortcode_replace_content = '<div class="steemContainer" data-steemtag="'.esc_html__($a['tag']).'" data-limit="'.esc_html__($a['limit']).'">';
    $shortcode_replace_content .= ' <div class="tagLabel">TAG: </div><div class="tagName"></div>';
    $shortcode_replace_content .= ' <div class="steemAccount"></div>';
    $shortcode_replace_content .= ' <div class="postWrite">';
    $shortcode_replace_content .= '  <input type="text" class="postTitle" placeholder="Title">';
    $shortcode_replace_content .= '  <textarea class="editor"></textarea>';
    $shortcode_replace_content .= '  <button class="publish button">Publish</button>';
    $shortcode_replace_content .= '  <button class="cancelWrite button">Cancel</button>';
    $shortcode_replace_content .= '  <div class="preview"></div>';
    $shortcode_replace_content .= ' </div>';
    $shortcode_replace_content .= ' <div class="postDetails">';
    $shortcode_replace_content .= ' <div class="postDetailsCloseContainer">';
    $shortcode_replace_content .= '   <button class="postDetailsCloseButton button">Close</button>';
    $shortcode_replace_content .= ' </div>';
    $shortcode_replace_content .= '  <div class="postHeader">';
    $shortcode_replace_content .= '   <div class="postTitle"></div>';
    $shortcode_replace_content .= '   <div class="postAuthor"></div>';
    $shortcode_replace_content .= '   <div class="postCreated"></div>';
    $shortcode_replace_content .= '  </div>';
    $shortcode_replace_content .= '  <div class="postBody"></div>';
    $shortcode_replace_content .= '  <div class="postFooter">';
    $shortcode_replace_content .= '   <div class="postTagsContainer"></div>';
    $shortcode_replace_content .= '   <button class="vote upvote"><span class="voteText">😊</span><span class="voteCount">0</span></button>';
    $shortcode_replace_content .= '   <div class="upvoteLoader"><div class="loader"><svg class="circular" viewBox="25 25 50 50"><circle class="path" cx="50" cy="50" r="20" fill="none" stroke-width="4" stroke-miterlimit="10"/></svg></div></div>';
    $shortcode_replace_content .= '   <div class="up votePower">';
    $shortcode_replace_content .= '    <button data-percent="cancel">X</button>';
    $shortcode_replace_content .= '    <button data-percent="100">100%</button>';
    $shortcode_replace_content .= '    <button data-percent="75">75%</button>';
    $shortcode_replace_content .= '    <button data-percent="66">66%</button>';
    $shortcode_replace_content .= '    <button data-percent="50">50%</button>';
    $shortcode_replace_content .= '    <button data-percent="33">33%</button>';
    $shortcode_replace_content .= '    <button data-percent="25">25%</button>';
    $shortcode_replace_content .= '   </div>';
    $shortcode_replace_content .= '   <button class="vote downvote"><span class="voteText">😩</span><span class="voteCount">0</span></button>';
    $shortcode_replace_content .= '   <div class="downvoteLoader"><div class="loader"><svg class="circular" viewBox="25 25 50 50"><circle class="path" cx="50" cy="50" r="20" fill="none" stroke-width="4" stroke-miterlimit="10"/></svg></div></div>';
    $shortcode_replace_content .= '   <div class="down votePower">';
    $shortcode_replace_content .= '    <button data-percent="cancel">X</button>';
    $shortcode_replace_content .= '    <button data-percent="-100">100%</button>';
    $shortcode_replace_content .= '    <button data-percent="-50">50%</button>';
    $shortcode_replace_content .= '    <button data-percent="-20">20%</button>';
    $shortcode_replace_content .= '    <button data-percent="-10">10%</button>';
    $shortcode_replace_content .= '    <button data-percent="-1">1%</button>';
    $shortcode_replace_content .= '   </div>';
    $shortcode_replace_content .= '  </div>';
    $shortcode_replace_content .= '  <div class="replyContainer"></div>';
    $shortcode_replace_content .= '  <div class="replyForm">';
    $shortcode_replace_content .= '   <textarea class="replyInput" placeholder="Input Comment"></textarea>';
    $shortcode_replace_content .= '   <button class="replyButton button">Submit</button>';
    $shortcode_replace_content .= '  </div>';
    $shortcode_replace_content .= ' </div>';
    $shortcode_replace_content .= ' <div class="refreshButtonContainer">';
    $shortcode_replace_content .= '   <button class="refreshButton button">Refresh</button>';
    $shortcode_replace_content .= ' </div>';
    $shortcode_replace_content .= ' <div class="discussions">';
    $shortcode_replace_content .= '  <table class="table"><tbody><tr><th width="*">Title</th><th width="85">Author</th><th width="45">Vote</th><th width="90">Created</th></tr></tbody></table>';
    $shortcode_replace_content .= '  <div class="loaderSpace"><div class="loader"><svg class="circular" viewBox="25 25 50 50"><circle class="path" cx="50" cy="50" r="20" fill="none" stroke-width="4" stroke-miterlimit="10"/></svg></div></div>';
    $shortcode_replace_content .= ' </div>';
    $shortcode_replace_content .= ' <button class="more button">Load More</div>';
    $shortcode_replace_content .= '</div>';
    return $shortcode_replace_content;
}

function wporg_shortcode($atts = [], $content = null, $tag = '') {
    // normalize attribute keys, lowercase
    $atts = array_change_key_case((array)$atts, CASE_LOWER);
    // override default attributes with user attributes
    $wporg_atts = shortcode_atts(['title' => 'WordPress.org'], $atts, $tag); 
    $o = ''; 
    $o .= '<div class="wporg-box">'; 
    $o .= '<h2>' . esc_html__($wporg_atts['title'], 'wporg') . '</h2>';
 
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
 
function wporg_shortcodes_init() {
    add_shortcode('wporg', 'wporg_shortcode');
}
 


/**
* Display DB.options.steemtag at front-end
*/
function steem_plugin_frontend_js() {
    wp_register_script('steemconnect.js', 'https://cdn.steemjs.com/lib/latest/steemconnect.min.js');
    wp_enqueue_script('steemconnect.js');

    wp_register_script('steem.min.js', 'https://cdn.steemjs.com/lib/latest/steem.min.js');
    //wp_register_script('steem.min.js', plugin_dir_url( __FILE__ ) . 'js/steem.min.js');
    wp_enqueue_script('steem.min.js');

    wp_register_script('lodash.min.js', 'https://cdnjs.cloudflare.com/ajax/libs/lodash.js/4.17.4/lodash.min.js');
    wp_enqueue_script('lodash.min.js');

    wp_register_script('remarkable.js', 'https://cdnjs.cloudflare.com/ajax/libs/remarkable/1.7.1/remarkable.min.js');
    wp_enqueue_script('remarkable.js');

    wp_register_script('render.js', plugin_dir_url( __FILE__ ) . 'js/render.js');
    wp_enqueue_script('render.js?v=9');


    wp_register_script('vote.js', plugin_dir_url( __FILE__ ) . 'js/vote.js');
    wp_enqueue_script('vote.js?v=9');

    wp_register_script('steem.plugin.js', plugin_dir_url( __FILE__ ) . 'js/steem.plugin.js');
    wp_enqueue_script('steem.plugin.js?v=9');

    wp_register_style('steem.plugin.css', plugin_dir_url( __FILE__ ) . 'css/steem.plugin.css');
    wp_enqueue_style('steem.plugin.css?v=9');
}

if (is_admin()) {
    // Back-end
    register_activation_hook( __FILE__, 'plugin_activation');
    register_uninstall_hook( __FILE__, 'plugin_uninstall');
    add_action('admin_menu', 'steem_plugin_menu');
    add_action('admin_enqueue_scripts', 'steem_plugin_backend_js');
} else {
    // Front-end
    add_action('init', 'wporg_shortcodes_init');
    add_shortcode('steemplugin', 'steem_plugin');
    add_action('steem_plugin_frontend_js', 'steem_plugin_frontend_js');
    do_action('steem_plugin_frontend_js');
}

