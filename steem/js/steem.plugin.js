/**********
*	Library
***********/
function ready(fn) {
	if (document.readyState != 'loading'){
		fn();
	} else {
		document.addEventListener('DOMContentLoaded', fn);
	}
}
function createDiv(cssClass, textNode) {
	var el = document.createElement('div');
	el.classList.add(cssClass);
	el.textContent = textNode;
	return el;
}
function createLink(title, url) {
	var el = document.createElement('a');
	el.textContent = title;
	el.href = url;
	return el;
}
function createVoteBtn(author, permlink) {
	var el = document.createElement('span');
	el.classList.add('sc-vote');
	el.setAttribute('data-author', author);
	el.setAttribute('data-permlink', permlink);
	return el;
}

/**********
*	Constant
***********/
var perPage = 25;


/**********
*	DOM manipulation
***********/
ready(function() {
	var steemContainer = document.querySelector('.steemContainer');
	var steemTag = steemContainer.getAttribute('data-steemtag');
	var tagName = steemContainer.querySelector('.tagName');
	var discussions = steemContainer.querySelector('.discussions');
	var acc = steemContainer.querySelector('.steemAccount');

	tagName.innerHTML = steemTag;

	steem.api.getDiscussionsByCreated({"tag": steemTag, "limit": perPage}, function(err, result) {
		if (err === null) {
			var i, len = result.length;
			for (i = 0; i < len; i++) {
				var discussion = result[i];
				var container = createDiv('steemPost', '');
				var title = createDiv('title', '');
				var author = createDiv('author', discussion.author);
				var vote = createDiv('vote', discussion.net_votes);
				var created = createDiv('created', discussion.created);
				var link = createLink(discussion.title, '#' + discussion.permlink);
				title.append(link);
				container.append(title);
				container.append(vote);
				container.append(author);
				container.append(created);
				discussions.append(container);
			}
		} else {
			console.log('ERROR:', error);
		}
	});
	
	// Draw login
	steemconnect.init({
		app: 'wp-steem-plugin-dev-local001',
		callbackURL: window.location.href
	});
	var isAuth = false;
	var loginURL = steemconnect.getLoginURL();
	steemconnect.isAuthenticated(function(err, result) {
		if (!err && result.isAuthenticated) {
			isAuth = true;
			var username = result.username;
			var accBtn = createLink(username, '#');
			var createPostBtn = createLink('Submit a Story', '#');
			acc.append(createPostBtn);
			acc.append(accBtn);
		} else {
			var loginBtn = createLink('Login', loginURL);
			acc.append(loginBtn);
		}
	});
});
