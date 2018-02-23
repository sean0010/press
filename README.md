# steemeasy

Steem blockchain's particular tag can be included in your Wordpress blog page.


## Install
### Set up SteemConnect2
You should have Steem account with more than 6 STEEM. It costs 6 STEEM to create an app under SteemConnect V2.

Login with yor Steem account here
https://v2.steemconnect.com/dashboard

Then go to here
https://v2.steemconnect.com/apps/me

Press 'New App' button to go to here
https://v2.steemconnect.com/apps/create

Create account

Now you will have to sign in with funding account(which has more than 6 STEEM) and its active key


Enter App Name and Redirect URI(s). You can leave others blank.

Redirect URI example
After OAuth login, only registered URI can end up having successful login.
https://imgsafe.org/image/b698e74bdb

You can enter multiple URIs such as
http://localhost:8888/wordpress/steem/
http://localhost:8888/wordpress/webtoon/
https://mywordpresswebsite.com/page1/
https://mywordpresswebsite.com/page2/

https://imgsafe.org/image/b69d1d6797


### Set up Wordpress plugin
1. Activate plugin
2. Create new wordpress page
3. Enter page content like this.
https://imgsafe.org/image/b697e36ea7

~~~~
[steemplugin tag="webtoon" limit="25"]
~~~~

tag is Steem tag. (eg: kr)

limit is items per page before showing Load more button. (eg: 1 ~ 100)


