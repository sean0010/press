/**********
*	Constant
***********/
var steemconnectApp = 'morning';
var Config = (function() {
	var o = {};
	o.perPage = 25;
	o.steemTag = '';
	o.init = function(config) {
		o.steemTag = config.steemTag;
		if (config.perPage !== undefined || config.perPage !== '') {
			var limit = parseInt(config.perPage);
			if (limit > 0 && limit <= 100) {
				o.perPage = limit;
			}
		}
	};
	return o;
})();

/**********
*	DOM manipulation
***********/
var lastPost = {'permlink': '', 'author': ''};
var posts = {};
var username = '';
window.isAuth = false;
//steem.config.set('websocket','wss://node.steem.ws');
//steem.config.set('websocket', 'wss://this.piston.rocks');
//steem.config.set('websocket', 'wss://steemd.steemitdev.com');


ready(function() {
	var steemContainer = document.querySelector('.steemContainer');
	var tagName = steemContainer.querySelector('.tagName');
	var discussions = steemContainer.querySelector('.discussions');
	var acc = steemContainer.querySelector('.steemAccount');
	var more = steemContainer.querySelector('.more');
	var postsList = steemContainer.querySelector('.postsList');
	var voteContainer = steemContainer.querySelector('.voteContainer');
	var replyInput = document.querySelector('.replyInput');
	var replyButton = document.querySelector('.replyButton');
	var refresh = steemContainer.querySelector('.refreshButton');
	var close = steemContainer.querySelector('.postDetailsCloseButton');
	var detail = document.querySelector('.postDetails');	

	// Config from shortcode attribute value
	var tag = steemContainer.getAttribute('data-steemtag');
	var limit = steemContainer.getAttribute('data-limit');
	Config.init({
		perPage: limit,
		steemTag: tag
	});
	tagName.innerHTML = Config.steemTag;

	var hash = window.location.hash;
	if (hash === 'write' || hash === '#write') {
		showEditor();
		if (discussions.style.display === 'block') {
			renderPosts(Config.steemTag, Config.perPage, false);
		}
	} else if (hash.length > 1) {
		// get details
		Render.post(detail, hash, function() {
			renderPosts(Config.steemTag, Config.perPage, false);
		});
	} else {
		renderPosts(Config.steemTag, Config.perPage, false);
	}
	
	// Draw login
	steemconnect.init({
		app: steemconnectApp,
		callbackURL: window.location.href
	});
	var loginURL = steemconnect.getLoginURL();
	steemconnect.isAuthenticated(function(err, result) {
		if (!err && result.isAuthenticated) {
			window.isAuth = true;
			username = result.username;
			var accBtn = Render.createLink(username, '#');
			var createPostBtn = Render.createLink('Write', '#write');
			var logoutBtn = Render.createLink('Logout', 'https://steemconnect.com/logout?redirect_url=' + window.location.href);
			acc.appendChild(createPostBtn);
			acc.appendChild(accBtn);
			acc.appendChild(logoutBtn);
		} else {
			var loginBtn = Render.createLink('Login', loginURL);
			acc.appendChild(loginBtn);
		}
	});

	// Vote button
	Vote.init(voteContainer);

	close.addEventListener('click', function() {
		var detail = document.querySelector('.postDetails');
		detail.style.display = 'none';
		history.pushState('', document.title, window.location.pathname);
	});

	refresh.addEventListener('click', function() {
		refresh.setAttribute('disabled', 'disabled');
		renderPosts(Config.steemTag, Config.perPage, true, function() {
			refresh.removeAttribute('disabled');
		});
	});

	more.addEventListener('click', function() {
		more.style.display = 'none';
		renderPosts(Config.steemTag, Config.perPage, false);
	});
	replyButton.addEventListener('click', function(e) {
		var inputString = replyInput.value.trim();
		var parentAuthor = replyInput.getAttribute('data-author');
		var parentPermlink = replyInput.getAttribute('data-permlink');
		var replyContainer = document.querySelector('.replyContainer');

		if (window.isAuth !== true) {
			alert('Login required');
		} else if (inputString === '') {
			alert('Empty comment');
		} else {
			console.log(inputString, parentAuthor, parentPermlink);
			var permlink = 're-' + parentPermlink + '-' + Math.floor(Date.now() / 1000);
			replyInput.setAttribute('disabled', true);
			replyButton.setAttribute('disabled', true);
			steemconnect.comment(parentAuthor, parentPermlink, username, permlink, '', inputString, '', function(err, result) {
				console.log(err, result);

				Render.replies(parentAuthor, parentPermlink, 0, function(result) {
					if (result.err === null) {
						replyContainer.innerHTML = '';
						replyContainer.appendChild(result.el);
					}
					replyInput.setAttribute('disabled', false);
					replyInput.removeAttribute('disabled');
					replyButton.setAttribute('disabled', false);
					replyButton.removeAttribute('disabled');
					replyInput.value = '';
				});
			});
		}
	});

	function renderPosts(tag, limit, refresh, callback) {
		if (refresh) {
			Render.reset();
		}
		Render.posts(tag, limit, function(result) {
			if (result.err === null) {
				var items = result.el;
				items.forEach(function(item) {
					postsList.appendChild(item.cloneNode(true));
				});
				if (callback !== undefined) {
					callback();
				}
			} else {
				console.log('Render.posts error:', result.err);
				if (callback !== undefined) {
					callback();
				}
			}
		});
	}
	function showEditor() {
		var w = document.querySelector('.steemContainer .postWrite');
		var editor = w.querySelector('.editor');
		var titleField = w.querySelector('.postTitle');
		var tagsField = w.querySelector('.postTags');
		var preview = w.querySelector('.preview');
		var publish = w.querySelector('.publish');
		var cancel = w.querySelector('.cancelWrite');

		var markdownPreview = Helper.debounce(function() {
			preview.innerHTML = Helper.markdown2html(editor.value);
		}, 400);
		var publishClick = function() {
			var titleValue = titleField.value.trim();
			var bodyValue = editor.value.trim();

			if (titleValue === '') {
				alert('Title is required');
				return;
			}
			if (bodyValue === '') {
				alert('Content is required');
				return;
			}
			var permlink = _.kebabCase(titleField.value);
			var metaData = {
				"tags": [Config.steemTag],
				"app": "press/0.1",
				"format": "markdown"
			};

			titleField.setAttribute('disabled', true);
			editor.setAttribute('disabled', true);
			publish.setAttribute('disabled', true);
			cancel.setAttribute('disabled', true);

			steemconnect.comment('', Config.steemTag, username, permlink, titleValue, bodyValue, metaData, function(err, result) {
				titleField.removeAttribute('disabled');
				editor.removeAttribute('disabled');
				publish.removeAttribute('disabled');
				cancel.removeAttribute('disabled');
				
				if (err === null) {
					cancelClick();
					renderPosts(Config.steemTag, Config.perPage, true);
				} else {
					console.error('SteemConnect CreatePost Error:', err);
					alert('Posting failed');
				}
			});
		};
		var cancelClick = function() {
			titleField.value = '';
			editor.value = '';
			preview.innerHTML = '';
			history.pushState('', document.title, window.location.pathname);
			w.style.display = 'none';
			discussions.style.display = 'block';
			renderPosts(Config.steemTag, Config.perPage, true, function() {
				more.style.display = 'block';
				refresh.style.display = 'block';
			});
			//detail.style.display = 'block';
			//refresh.style.display = 'block';
			editor.removeEventListener('click', markdownPreview);
			publish.removeEventListener('click', publishClick);
			cancel.removeEventListener('click', cancelClick);
		};
		w.style.display = 'block';
		detail.style.display = 'none';
		refresh.style.display = 'none';
		discussions.style.display = 'none';
		more.style.display = 'none';
		editor.addEventListener('keyup', markdownPreview);
		publish.addEventListener('click', publishClick);
		cancel.addEventListener('click', cancelClick);
	}

	window.addEventListener('hashchange', onHashChange, false);

	function onHashChange() {
		var hash = window.location.hash;
		if (hash === 'write' || hash === '#write') {
			showEditor();
			return;
		}
		var args = hash.split('/', 3);
		if (args.length == 3) {
			var permlink = args[2];
			var detail = document.querySelector('.postDetails');
			var replyContainer = detail.querySelector('.replyContainer');
			replyContainer.innerHTML = '';
			if (args.length === 3) {
				var post = posts[permlink];
				showPostDetails(detail, post.body, post.title, post.author, permlink, post.created, post.upvotes, post.downvotes, post.tags);
				Render.replies(post.author, permlink, 0, function(result) {
					if (result.err === null) {
						replyContainer.appendChild(result.el);
					}
				}); 
			} else {

			}
		}
	}
});

function showPostDetails(container, markdown, title, author, permlink, created, upvotes, downvotes, tags) {
	var postBody = container.querySelector('.postBody');
	var postAuthor = container.querySelector('.postAuthor');
	var postTitle = container.querySelector('.postTitle');
	var postCreated = container.querySelector('.postCreated');
	var upvoteButton = container.querySelector('.upvote');
	var upvoteCount = container.querySelector('.upvote .voteCount');
	var downvoteButton = container.querySelector('.downvote');
	var downvoteCount = container.querySelector('.downvote .voteCount');
	var replyInput = container.querySelector('.replyInput');
	var tagsContainer = container.querySelector('.postTagsContainer');

	container.style.display = 'block';

	postBody.innerHTML = Helper.markdown2html(markdown);
	postTitle.innerHTML = '<b>' + title + '</b>';
	postAuthor.innerHTML = author;

	var date = new Date(created);
	postCreated.innerHTML = date.datetime();

	window.scrollTo(0, document.querySelector('.steemContainer').offsetTop);

	upvoteButton.classList.remove('voted');
	upvoteCount.innerHTML = upvotes;

	tagsContainer.innerHTML = '';
	if (tags !== undefined) {
		tagsContainer.appendChild(Render.tags(tags));
	}

	Vote.set(author, permlink, username);

	// If percent options dropdown open, close it
	Vote.hideUpvoteOptions(); 

	replyInput.setAttribute('data-author', author);
	replyInput.setAttribute('data-permlink', permlink);

	// Steemit.com link
	var linksContainer = document.querySelector('.linksContainer');
	var steemitBase = 'https://steemit.com/';
	var hash = window.location.hash;
	if (hash.charAt(0) == '#') {
		hash = hash.substr(1);
	}
	var fullUrl = steemitBase + hash;
	var a = Render.createLink('Steemit.com Link', fullUrl);
	a.setAttribute('target', '_blank');
	linksContainer.innerHTML = '';
	linksContainer.appendChild(a);

}