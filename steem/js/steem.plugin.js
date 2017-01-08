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
var perPage = 20;


/**********
*	DOM manipulation
***********/
ready(function() {
	var steemContainer = document.querySelector('.steemContainer');
	var steemTag = steemContainer.getAttribute('data-steemtag');
	var tagName = steemContainer.querySelector('.tagName');
	var discussions = steemContainer.querySelector('.discussions');

	tagName.innerHTML = steemTag;

	steem.api.getDiscussionsByCreated({"tag": steemTag, "limit": perPage}, function(err, result) {
		if (err === null) {
			var i, len = result.length;
			for (i = 0; i < len; i++) {
				var discussion = result[i];
				var container = createDiv('steemPost', '');
				var title = createDiv('title', '');
				var author = createDiv('author', discussion.author);
				var vote = createDiv('vote', '');
				var voteBtn = createVoteBtn(discussion.author, discussion.permlink);
				var created = createDiv('created', discussion.created);
				var link = createLink(discussion.title, '#' + discussion.permlink);
				title.append(link);
				vote.append(voteBtn);
				container.append(title);
				container.append(vote);
				container.append(author);
				container.append(created);
				discussions.append(container);
			}
			var js, fjs = document.getElementsByTagName("script")[0];  
			if (document.getElementById("sc-sdk")) return;  
			js = document.createElement("script"); 
			js.id = "sc-sdk";  
			js.src = "//cdn.steemjs.com/lib/latest/steemconnect-widget.js";  
			fjs.parentNode.insertBefore(js, fjs);
		} else {
			console.log('ERROR:', error);
		}
	});
});
