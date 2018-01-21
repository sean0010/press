/**********
*	Constant
***********/
var Config = (function() {
	var o = {};
	o.perPage = 25;
	o.steemTag = '';
	o.app = 'steemeasy/0.2'
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
steem.config.set('websocket','wss://api.steemit.com');

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
	
	// OAuth redirect, save given params and refresh without params
	if (getParameter('access_token') !== null) {
		localStorage.setItem('access_token', getParameter('access_token'));
		localStorage.setItem('expires_in', getParameter('expires_in'));
		localStorage.setItem('username', getParameter('username'));
		window.location.href = '//' + location.host + location.pathname;
		return;
	}

	// Login Button

	let callbackURL = location.protocol + '//' + location.host + location.pathname;
	let accessToken = localStorage.getItem('access_token');
	if (accessToken !== null) {
		window.isAuth = true;
		username = localStorage.getItem('username');
		// to do: store expires_in, current timestamp. 
		// to get remaining auth seconds, compare timestamp and current time
		

		var accBtn = Render.createLink(username, '#');
		var createPostBtn = Render.createLink('Write', '#write');
		var logoutBtn = Render.createLink('Logout', '#');
		logoutBtn.addEventListener('click', function(e) {
			e.preventDefault();

			sc2.revokeToken(function (err, res) {
				console.log(err, res);

				localStorage.removeItem('access_token');
				localStorage.removeItem('expires_in');
				localStorage.removeItem('username');

				acc.removeChild(logoutBtn);
				acc.removeChild(createPostBtn);
				acc.removeChild(accBtn);

				var loginURL = sc2.getLoginURL();
				var loginBtn = Render.createLink('Login', loginURL);
				acc.appendChild(loginBtn);
			});
		});
		acc.appendChild(createPostBtn);
		acc.appendChild(accBtn);
		acc.appendChild(logoutBtn);

		sc2.init({
			app: 'steemeasy',
			callbackURL: callbackURL,
			//accessToken: accessToken,
			scope: ['vote', 'comment', 'comment_options']
		});	
		sc2.setAccessToken(accessToken);
	} else {
		sc2.init({
			app: 'steemeasy',
			callbackURL: callbackURL,
			scope: ['vote', 'comment', 'comment_options']
		});	

		var loginURL = sc2.getLoginURL();
		var loginBtn = Render.createLink('Login', loginURL);
		acc.appendChild(loginBtn);
	}


	// Vote button
	Vote.init(voteContainer, posts);

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
			replyInput.setAttribute('disabled', 'disabled');
			replyButton.setAttribute('disabled', 'disabled');
			var metaData = {
				"tags": [Config.steemTag],
				"app": Config.app,
				"format": "markdown"
			};
			broadcastComment(parentAuthor, parentPermlink, username, inputString, metaData, function(result) {
				Render.replies(parentAuthor, parentPermlink, 0, function(result) {
					replyContainer.innerHTML = '';
					replyContainer.appendChild(result.el);
					replyInput.removeAttribute('disabled');
					replyButton.removeAttribute('disabled');
					replyInput.value = '';
				});
			}, function(error) {
				replyInput.removeAttribute('disabled');
				replyButton.removeAttribute('disabled');
				replyInput.value = '';
				alert(error);
			});
		}
	});

	function renderPosts(tag, limit, refresh, callback) {
		if (refresh) {
			Render.reset();
			postsList.innerHTML = '';
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
		var payoutRadios = w.querySelectorAll('input[type=radio]');
		var selfVoteCheckbox = w.querySelector('.selfVote');

		Tag.init(tagsField);

		var markdownPreview = Helper.debounce(function() {
			console.log('debounced');
			preview.innerHTML = Helper.markdown2html(editor.value);
		}, 400);

		var radioClick = function() {
			var payout = w.querySelector('input[type=radio]:checked');
			var selfVote = w.querySelector('.selfVote');
			if (payout.value == '0' && selfVote.checked == true) {
				console.log('radioClick', payout.value, selfVote.checked);
				selfVote.checked = false
			}
		};
		var checkboxClick = function() {
			var payout = w.querySelector('input[type=radio]:checked');
			var selfVote = w.querySelector('.selfVote');
			if (payout.value == '0' && selfVote.checked == true) {
				console.log('checkboxClick', payout.value, selfVote.checked);

				payoutRadios.forEach(function(radio, index) {
					if (radio.value == '50') {
						radio.click();
					}
				});
			}
		};
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
			var kebabCasedTitle = titleField.value.replace(/[\W_]+/g," ");
			kebabCasedTitle = _.kebabCase(kebabCasedTitle);

			const timeStr = new Date().toISOString().replace(/\W+/g, "").toLowerCase();

			const permlink = kebabCasedTitle + timeStr;
			var metaData = {
				"tags": [Config.steemTag],
				"app": Config.app,
				"format": "markdown"
			};

			// Prepend primary tag to json metadata tags. 1st item becomes category.
			var additionalTags = Tag.tags();
			metaData.tags = _.concat([Config.steemTag], additionalTags);

			titleField.setAttribute('disabled', 'disabled');
			editor.setAttribute('disabled', 'disabled');
			publish.setAttribute('disabled', 'disabled');
			cancel.setAttribute('disabled', 'disabled');

			var payout = w.querySelector('input[type=radio]:checked');
			var selfVote = w.querySelector('.selfVote');
			var isDeclined = payout.value == '0' ? true : false;
			var isHalfHalf = payout.value == '50' ? true : false;
			var isSelfVoted = selfVote.checked ? true : false;
			console.log(isDeclined, isHalfHalf, isSelfVoted);
			
			broadcastPost(Config.steemTag, username, permlink, titleValue, bodyValue, metaData, isDeclined, isHalfHalf, isSelfVoted, function(result) {
				console.log('Promise Callback', result);
				titleField.removeAttribute('disabled');
				editor.removeAttribute('disabled');
				publish.removeAttribute('disabled');
				cancel.removeAttribute('disabled');
				cancelClick();
			}, function(error) {
				console.log('Promise error:', error);
				titleField.removeAttribute('disabled');
				editor.removeAttribute('disabled');
				publish.removeAttribute('disabled');
				cancel.removeAttribute('disabled');
				alert('Posting failed');
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
			payoutRadios.forEach(function(radio, index) {
				radio.removeEventListener('change', radioClick);
			});
			selfVoteCheckbox.removeEventListener('change', checkboxClick);
		};
		w.style.display = 'block';
		detail.style.display = 'none';
		refresh.style.display = 'none';
		discussions.style.display = 'none';
		more.style.display = 'none';
		editor.addEventListener('keyup', markdownPreview);
		publish.addEventListener('click', publishClick);
		cancel.addEventListener('click', cancelClick);
		payoutRadios.forEach(function(radio, index) {
			radio.addEventListener('change', radioClick);
		});
		selfVoteCheckbox.addEventListener('change', checkboxClick);
	}

	window.addEventListener('hashchange', onHashChange, false);

	function onHashChange() {
		var hash = window.location.hash;
		if (hash === 'write' || hash === '#write') {
			showEditor();
			return;
		}
		var args = hash.split('/', 3);
		var hashAuthor = args[1].replace('@', '');
		var hashPermlink = args[2];
		var key = hashAuthor + '_' + hashPermlink;
		if (args.length == 3) {
			var container = document.querySelector('.postDetails');
			var replyContainer = detail.querySelector('.replyContainer');
			replyContainer.innerHTML = '';
			if (args.length === 3) {
				var post = posts[key];				
				showPostDetails(container, post.body, post.title, post.author, hashPermlink, post.created, post.upvotes, post.downvotes, post.payout, post.decline, post.tags);				
				Render.replies(post.author, hashPermlink, 0, function(result) {
					if (result.err === null) {
						replyContainer.appendChild(result.el);
					}
				}); 
			} else {

			}
		}
	}
});

function showPostDetails(container, markdown, title, author, permlink, created, upvotes, downvotes, payout, isDeclined, tags) {
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
	var postReward = container.querySelector('.postReward');

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
	postReward.innerHTML = payout;
	if (isDeclined) {
		postReward.classList.add('strikethrough');
	} else {
		postReward.classList.remove('strikethrough');
	}
}

function getParameter(paramName) {
	var searchString = window.location.search.substring(1);
	var params = searchString.split('&');
	var i, val;

	for (i = 0; i < params.length; i++) {
		val = params[i].split('=');
		if (val[0] == paramName) {
			return val[1];
		}
	}
	return null;
}

function broadcastPost(primaryTag, author, permlink, title, body, jsonMetadata, decline, halfHalf, selfVote, successCallback, errorCallback) {
	var operations = [['comment', {
			'parent_author': '', 
			'parent_permlink': primaryTag, 
			'author': author, 
			'permlink': permlink, 
			'title': title, 
			'body': body, 
			'json_metadata': JSON.stringify(jsonMetadata)
		}]];
	var commentOptions = {
		'author': author, 
		'permlink': permlink, 
		'max_accepted_payout': '1000000.000 SBD',
		'percent_steem_dollars': 10000,
		'allow_votes': true,
		'allow_curation_rewards': true,				
		'extensions': [
			[0, {
				'beneficiaries': [{
					'account': 'coin-on',
					'weight': 100
				}]
			}]
		]
	};
	if (decline) {		
		commentOptions.max_accepted_payout = '0.000 SBD';
		delete commentOptions['extensions'];
	} else if (halfHalf) {
		commentOptions.percent_steem_dollars = 5000;
	} else {
		// 100% Steem Power Up
		commentOptions.percent_steem_dollars = 0;
	}

	operations.push(['comment_options', commentOptions]);

	if (!decline && selfVote) {
		operations.push(['vote', { voter: author, 'author': author, 'permlink': permlink, 'weight': 10000 }]);
	}
	
	sc2.broadcast(operations).then(function(result) {
		successCallback(result);
	}).catch(function(error) {
		errorCallback(error);
	});
}

function broadcastComment(parentAuthor, parentPermlink, author, body, jsonMetadata, successCallback, errorCallback) {
	var permlink = 're-' + parentPermlink + '-' + Math.floor(Date.now() / 1000);
	var operations = [['comment', {
			'parent_author': parentAuthor, 
			'parent_permlink': parentPermlink, 
			'author': author, 
			'permlink': permlink, 
			'title': '', 
			'body': body, 
			'json_metadata': JSON.stringify(jsonMetadata)
		}]];
	var commentOptions = {
		'author': author, 
		'permlink': permlink, 
		'max_accepted_payout': '1000000.000 SBD',
		'percent_steem_dollars': 10000,
		'allow_votes': true,
		'allow_curation_rewards': true,				
		'extensions': [
			[0, {
				'beneficiaries': [{
					'account': 'coin-on',
					'weight': 100
				}]
			}]
		]
	};
	//if (decline) {		
	//	commentOptions.max_accepted_payout = '0.000 SBD';
	//	delete commentOptions['extensions'];
	//} else if (halfHalf) {
	//	commentOptions.percent_steem_dollars = 5000;
	//} else {
	//	// 100% Steem Power Up
	//	commentOptions.percent_steem_dollars = 0;
	//}

	operations.push(['comment_options', commentOptions]);

	//if (!decline && selfVote) {
	//	operations.push(['vote', { voter: author, 'author': author, 'permlink': permlink, 'weight': 10000 }]);
	//}
	
	sc2.broadcast(operations).then(function(result) {
		successCallback(result);
	}).catch(function(error) {
		errorCallback(error);
	});
}
