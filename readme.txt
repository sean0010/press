=== steemeasy ===
Contributors: sean0010
Tags: steem,steemeasy
Requires at least: 4.8.4
Tested up to: 4.9.1
Requires PHP: 5.6.10
Stable tag: 0.5.3
License: MIT

Bring Steem blockchain's specific tag into your Wordpress page.

== Description ==
Integrate Steem blockchain into your Wordpress blog!
With this plugin, you can
- retrieve latest posts list of specific tag.
- See post details
- Login with Steem ID (Using SteemConnect2)
- Write posts, vote posts

== Installation ==
1. Set up SteemConnect2
You should have Steem account with more than 3 STEEM. It costs 3 STEEM to create an app under SteemConnect V2.
Login with yor Steem account here https://v2.steemconnect.com/dashboard
Then go to here https://v2.steemconnect.com/apps/me
Press 'New App' button to go to here https://v2.steemconnect.com/apps/create
Create account.
Now you will have to sign in with funding account(which has more than 6 STEEM) and its active key
Enter App Name and Redirect URI(s). You can leave others blank.
Redirect URI example After OAuth login, only registered URI can end up having successful login. https://imgsafe.org/image/b698e74bdb
You can enter multiple URIs such as http://localhost:8888/wordpress/steem/ http://localhost:8888/wordpress/webtoon/ https://mywordpresswebsite.com/page1/ https://mywordpresswebsite.com/page2/
https://imgsafe.org/image/b69d1d6797

2. Set up Wordpress plugin
Activate plugin.
Go to Steemeasy Settings, set App Name same as SteemConnect2 App Name https://steemitimages.com/DQmen3GNjTCYtfDc2eNgzYaeJkZhmF1mAmn97D4WndSujSk/Screen%20Shot%202018-02-01%20at%201.58.31%20PM.png
Create new wordpress page.
Enter page content like this. https://imgsafe.org/image/b697e36ea7

~~~~
[steemplugin tag="webtoon" limit="25" locale="ko-KR" ann="peepeem/2018-3-27,mmcartoon-kr/33dzgm" mute="alessandro2000,betesda,blackpace,vnzlasteemit,xtreme2015,steemit2015,vanessa2015,cekna,ripnews,a-0-0,boyhaque,samsulbahri1991,steemian1,balia,kamerlighn"]
~~~~

tag is Steem tag. (eg: kr)
limit is items per page before showing Load more button. (eg: 1 ~ 100)
locale is for posts and replies' datetime format locale. Default(if not set): ko-KR. Examples: en-US, de-DE ...
ann is comma separated permlinks([ACCOUNT]/[PERMLINK],[ACCOUNT],[PERMLINK],[ACCOUNT],[PERMLINK]...) sticky posts. Up to 5 posts can be sticky.
mute is comma separated accounts. Muted accounts' posts and replies will not be displayed.

== Frequently Asked Questions ==


== Changelog ==
= 0.5.3 =
* Multiple sticky announcement posts
* Mute accounts
* Post created datetime bug fix, locale format can be configured

= 0.5.2 =
* Sticky announcement post
* Highlight current post in postsList

= 0.5.1 =
* Bugfix

= 0.5 =
* Edit Posting
* You can set SteemConnect2 App Name at Wordpress Steemeasy Settings
* You can set Wordpress owner beneficiary(Steem account name and reward percentage) at Wordpress Steemeasy Settings
* Login expire bug fix

= 0.4 =
* Decline Payout posts are visualised and can be distinguished by strike line
* Bug fixes


= 0.3 =
* Updated steem.js to v0.6.4
* steem.js web socket endpoint api.steemit.com (steemd.steemit.com is depreciated)
* Some CSS fix to support TwentySixteen Theme

= 0.2 =
* Initial release
