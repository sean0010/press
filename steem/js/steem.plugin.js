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
				var title = createDiv('steemPostTitle', '');
				var author = createDiv('steemPostAuthor', discussion.author);
				var created = createDiv('steemPostCreated', discussion.created);
				var link = createLink(discussion.title, '#' + discussion.permlink);
				title.append(link);
				container.append(title);
				container.append(author);
				container.append(created);
				discussions.append(container);
			}		
		} else {
			console.log('ERROR:', error);
		}
	});
});
