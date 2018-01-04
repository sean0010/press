=== steemeasy ===
Contributors: sean0010
Tags: steem,steemeasy
Requires at least: 4.8.4
Tested up to: 4.9.1
Requires PHP: 5.6.10
Stable tag: 0.2
License: MIT

Bring Steem blockchain\'s specific tag into your Wordpress page.

== Description ==
With this plugin, you can 
- retrieve latest posts list of specific tag.
- See post details
- Login with Steem ID (Using SteemConnect2)
- Write posts, vote posts

== Installation ==
1. Set up SteemConnect2
You should have Steem account with more than 6 STEEM. It costs 6 STEEM to create an app under SteemConnect V2.
Login with yor Steem account here https://v2.steemconnect.com/dashboard
Then go to here https://v2.steemconnect.com/apps/me
Press \'New App\' button to go to here https://v2.steemconnect.com/apps/create
Create account.
Now you will have to sign in with funding account(which has more than 6 STEEM) and its active key
Enter App Name and Redirect URI(s). You can leave others blank.
Redirect URI example After OAuth login, only registered URI can end up having successful login. https://imgsafe.org/image/b698e74bdb
You can enter multiple URIs such as http://localhost:8888/wordpress/steem/ http://localhost:8888/wordpress/webtoon/ https://mywordpresswebsite.com/page1/ https://mywordpresswebsite.com/page2/
https://imgsafe.org/image/b69d1d6797

2. Set up Wordpress plugin
Activate plugin.
Create new wordpress page.
Enter page content like this. https://imgsafe.org/image/b697e36ea7

[steemplugin tag=\"webtoon\" limit=\"25\"]
tag is Steem tag. (eg: kr)
limit is items per page before showing Load more button. (eg: 1 ~ 100)