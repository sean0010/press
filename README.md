# press

Integrate Steem posting into Wordpress.
Steem is a blockchain-based social media platform where anyone can earn rewards.
Current Version: `0.0.1`

## How to try
1. Install
 - Upload `/steem` directory into `YOUR_WORDPRESS_ROOT/wp-contents/plugins`
 - Admin - Plugins - Installed Plugins
 - Activate **Steem** 

2. Configure
 - Enter a Steem tag and Save
 - Create a Page
 - Put `[steemplugin tag="wpcommunity"]` in its content
   (the tag wpcommunity is a steem tag)
 - Set number of posts per page like this. `[steemplugin tag="wpcommunity" limit="25"]` (Maximum 100)
 - Go to https://steemconnect.com/apps/setup, add the wordpress URL to both "Allowed origins" and "Allowed redirect urls"
 
3. Check
 - Go to the page at Wordpress Front-end
 - You'll see Steem posts by the given tag.
