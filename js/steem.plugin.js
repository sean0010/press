/**********
*	Constant
***********/
var Config = (function() {
	var o = {};
	o.perPage = 25;
	o.steemTag = '';
	o.app = 'steemeasy/0.2';
	o.isGazua = location.href.indexOf('steemgazua.com') !== -1;
	o.blackAccounts = [];
	o.blackPermlinks = [];
	o.replyImoticons = [];
	o.dateLocale = 'ko-KR';
	o.dateOptions = { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit'};
	o.dateOptionsMMDD = { month: '2-digit', day: '2-digit'};
	o.init = function(config) {
		o.steemTag = config.steemTag;
		if (config.perPage !== undefined && config.perPage !== '') {
			var limit = parseInt(config.perPage);
			if (limit > 0 && limit <= 100) {
				o.perPage = limit;
			}
		}
		if (config.blackAccounts !== undefined && config.blackAccounts !== '') {
			o.blackAccounts = config.blackAccounts.split(',');
		}
		if (config.replyImoticons !== undefined && config.replyImoticons !== '') {
			var decoded = decodeURI(config.replyImoticons);
			var parsed = JSON.parse(decoded);
			o.replyImoticons = parsed;
		}
		if (config.locale !== undefined && config.locale !== '') {
			o.dateLocale = config.locale;
		}
	};
	return o;
})();

/**********
*	DOM manipulation
***********/
var posts = {};
var currentPostKey = '';
var username = '';
window.isAuth = false;
var beneficiaryAccount, beneficiaryPercentage;
//steem.api.setOptions({'url': 'wss://steemd.dist.one'});

ready(function() {
	var c = document.querySelector('.steemContainer');
	var tagName = c.querySelector('.tagName');
	var mainTag = c.querySelector('.mainTag');
	var ann = c.querySelector('.ann');
	var discussions = c.querySelector('.discussions');
	var acc = c.querySelector('.steemAccount');
	var more = c.querySelector('.more');
	var voteContainer = c.querySelector('.voteContainer');
	var replyInput = c.querySelector('.replyInput');
	var replyButton = c.querySelector('.replyButton');
	var refresh = c.querySelector('.refreshButton');
	var close = c.querySelector('.postDetailsCloseButton');
	var detail = c.querySelector('.postDetails');
	var postTags = c.querySelector('.postTags');

	// Config from shortcode attribute value
	var tag = c.getAttribute('data-steemtag');
	var limit = c.getAttribute('data-limit');
	var appName = c.getAttribute('data-appname');
	var mute = c.getAttribute('data-mute');
	var mutePermlinks = c.getAttribute('data-mutepermlinks');
	var imoticons = c.getAttribute('data-imoticons');
	var locale = c.getAttribute('data-locale');
	beneficiaryAccount = c.getAttribute('data-beneficiaryaccount');
	beneficiaryPercentage = c.getAttribute('data-beneficiarypercentage');

	Config.init({
		perPage: limit,
		steemTag: tag,
		blackAccounts: mute,
		blackPermlinks: mutePermlinks,
		replyImoticons: imoticons,
		locale: locale
	});
	tagName.innerHTML = Config.steemTag;
	mainTag.innerHTML = Config.steemTag;

	var hash = window.location.hash;
	if (hash === '#write') {
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
		localStorage.setItem('auth_timestamp', Math.round(Date.now()/1000));
		localStorage.setItem('username', getParameter('username'));
		window.location.href = '//' + location.host + location.pathname;
		return;
	}

	// Login Button
	var callbackURL = location.protocol + '//' + location.host + location.pathname;
	var accessToken = localStorage.getItem('access_token');
	var expiresIn = localStorage.getItem('expires_in');
	var authTimestamp = localStorage.getItem('auth_timestamp');

	if (accessToken !== null && authTimestamp !== null) {
		window.isAuth = true;
		username = localStorage.getItem('username');
		// to do: store expires_in, current timestamp.
		// to get remaining auth seconds, compare timestamp and current time
		var currentTimestamp = Math.round(Date.now()/1000);
		console.log(expiresIn, currentTimestamp, authTimestamp, currentTimestamp-authTimestamp);
		if (currentTimestamp - authTimestamp >= expiresIn) {
			// Login Expired
			localStorage.removeItem('access_token');
			localStorage.removeItem('expires_in');
			localStorage.removeItem('username');
			localStorage.removeItem('auth_timestamp');

			if (logoutBtn) acc.removeChild(logoutBtn);
			if (createPostBtn) acc.removeChild(createPostBtn);
			if (accBtn) acc.removeChild(accBtn);

			var loginURL = sc2.getLoginURL();
			var loginBtn = Render.createLink('Login', loginURL);
			acc.appendChild(loginBtn);
		} else {
			// Logged In
			var accBtn = Render.createLink(username, '#');
			var createPostBtn = Render.createLink('Write', '#write');
			var logoutBtn = Render.createLink('Logout', '#');
			logoutBtn.addEventListener('click', function(e) {
				e.preventDefault();

				sc2.revokeToken(function (err, res) {
					console.log(err, res);

					window.isAuth = false;
					localStorage.removeItem('access_token');
					localStorage.removeItem('expires_in');
					localStorage.removeItem('username');
					localStorage.removeItem('auth_timestamp');

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
				app: appName,
				callbackURL: callbackURL,
				//accessToken: accessToken,
				scope: ['vote', 'comment', 'comment_options']
			});
			sc2.setAccessToken(accessToken);
		}
	} else {
		window.isAuth = false;
		sc2.init({
			app: appName,
			callbackURL: callbackURL,
			scope: ['vote', 'comment', 'comment_options']
		});
		var loginURL = sc2.getLoginURL();
		var loginBtn = Render.createLink('Login', loginURL);
		acc.appendChild(loginBtn);
	}

	// Vote button
	Vote.init(voteContainer, posts);

	// Tags
	Tag.init(postTags);

	close.addEventListener('click', function() {
		var detail = document.querySelector('.postDetails');
		var postsList = document.querySelector('.postsList');
		detail.style.display = 'none';
		currentPostKey = '';
		history.pushState('', document.title, window.location.pathname);
		Render.highlight(postsList, currentPostKey);
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

					replyButton.parentNode.querySelector('.replyPreview').innerHTML = '';
				});
			}, function(error) {
				replyInput.removeAttribute('disabled');
				replyButton.removeAttribute('disabled');
				replyInput.value = '';
				alert(error);
			});
		}
	});

	Render.replyImoticons(document.querySelector('.replyImoticonButtons'));

	window.addEventListener('hashchange', onHashChange, false);

	function onHashChange() {
		var hash = window.location.hash;
		if (hash === '#write') {
			showEditor();
			return;
		}

		var args = hash.split('/', 3);
		var hashAuthor = args[1].replace('@', '');
		var hashPermlink = args[2];
		if (args.length === 3) {
			var container = document.querySelector('.postDetails');
			var postsList = document.querySelector('.postsList');
			var replyContainer = detail.querySelector('.replyContainer');
			var replyPreview = detail.querySelector('.replyPreview');
			replyInput.value = '';
			replyContainer.innerHTML = '';
			replyPreview.innerHTML = '';
			if (args.length === 3) {
				currentPostKey = hashAuthor + '_' + hashPermlink;
				console.log('onHashChange:', currentPostKey);

				if (posts.hasOwnProperty(currentPostKey)) {
					var post = posts[currentPostKey];
					showPostDetails(container, post.body, post.title, post.author, hashPermlink, post.created, post.upvotes, post.downvotes, post.payout, post.decline, post.tags);
					Render.replies(post.author, hashPermlink, 0, function(result) {
						if (result.err === null) {
							replyContainer.appendChild(result.el);
						}
					});
					Render.highlight(postsList, currentPostKey);
				} else {
					Render.post(detail, hash, function() {
						renderPosts(Config.steemTag, Config.perPage, false);
						Render.highlight(postsList, currentPostKey);
					});
				}
			}
		}
	}

});

function renderPosts(tag, limit, refresh, callback) {
	var postsList = document.querySelector('.postsList');
	var ann = document.querySelector('.ann');

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

	var annParam = ann.getAttribute('data-param');

	if (Render.isRefreshed()) {
		if (annParam.indexOf('/') !== -1 && annParam.length > 5) {
			var annArray = annParam.split(',', 5);

			ann.innerHTML = '';
			for (var i = 0; i < annArray.length; i++) {
				var annEachItem = annArray[i].trim();
				var annParamSplit = annEachItem.split('/');
				steem.api.getContent(annParamSplit[0], annParamSplit[1], function(err, result) {
					if (!err) {
						var items = Render.ann(result);
						items.forEach(function(item) {
							ann.appendChild(item);
						});
					}
				});
			}
		}
	}
}

function showEditor() {
	var w = document.querySelector('.steemContainer .postWrite');
	var editor = w.querySelector('.editor');
	var titleField = w.querySelector('.postTitle');
	var preview = w.querySelector('.preview');
	var publish = w.querySelector('.publish');
	var cancel = w.querySelector('.cancelWrite');
	var segmentedContainer = document.querySelector('.segmented');
	var selfVoteContainer = document.querySelector('.selfVoteContainer');
	var payoutRadios = w.querySelectorAll('input[type=radio]');
	var selfVoteCheckbox = w.querySelector('.selfVote');
	var detail = document.querySelector('.postDetails');
	var refresh = document.querySelector('.refreshButton');
	var discussions = document.querySelector('.discussions');
	var ann = document.querySelector('.ann');
	var more = document.querySelector('.more');
	var markdownPreview = Helper.debounce(function() {
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

		var permlink = kebabCasedTitle + timeStr;
		var metaData = {
			"tags": [Config.steemTag],
			"app": Config.app,
			"format": "markdown"
		};

		// Prepend primary tag to json metadata tags. 1st item becomes category.
		var additionalTags = Tag.tags();

		if (additionalTags) {
			metaData.tags = _.concat([Config.steemTag], additionalTags);
		}

		if (window.isEditMode) {
			if (currentPostKey != '') {
				var tempPermlink = currentPostKey.split('_');
				var permlink = tempPermlink[1];
			}
		}

		titleField.setAttribute('disabled', 'disabled');
		editor.setAttribute('disabled', 'disabled');
		publish.setAttribute('disabled', 'disabled');
		cancel.setAttribute('disabled', 'disabled');

		var payout = w.querySelector('input[type=radio]:checked');
		var selfVote = w.querySelector('.selfVote');
		var isDeclined = payout.value == '0' ? true : false;
		var isHalfHalf = payout.value == '50' ? true : false;
		var isSelfVoted = selfVote.checked ? true : false;
		var beneficiary = {'account': beneficiaryAccount, 'weight': parseFloat(beneficiaryPercentage)*100};
		console.log(Config.steemTag, username, permlink, titleValue, bodyValue, metaData, isDeclined, isHalfHalf, isSelfVoted);

		broadcastPost(Config.steemTag, username, permlink, titleValue, bodyValue, metaData, isDeclined, isHalfHalf, isSelfVoted, beneficiary, function(result) {
			console.log('Promise Callback', result);
			if (window.isEditMode) {
				var updatedPost = result.result.operations[0][1];
				if (updatedPost !== undefined) {
					console.log('EDIT POST Result:', updatedPost);
					document.querySelector('.postHeader .postTitle').innerHTML = '<b>' + updatedPost.title + '</b>';
					document.querySelector('.postBody').innerHTML = Helper.markdown2html(updatedPost.body);

					var postLink = document.querySelector('[data-key="' + currentPostKey + '"]');
					postLink.innerHTML = updatedPost.title;

					posts[currentPostKey].title = updatedPost.title;
					posts[currentPostKey].body = updatedPost.body;
				}
			}


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
		w.style.display = 'none';
		ann.style.display = 'block';
		discussions.style.display = 'block';
		refresh.style.display = 'block';
		more.style.display = 'block';

		editor.removeEventListener('click', markdownPreview);
		publish.removeEventListener('click', publishClick);
		cancel.removeEventListener('click', cancelClick);
		payoutRadios.forEach(function(radio, index) {
			radio.removeEventListener('change', radioClick);
		});
		selfVoteCheckbox.removeEventListener('change', checkboxClick);
		if (window.isEditMode) {
			detail.style.display = 'block';
			segmentedContainer.style.display = 'none';
			selfVoteContainer.style.display = 'none';
			window.isEditMode = false;
		} else {
			history.pushState('', document.title, window.location.pathname);
			renderPosts(Config.steemTag, Config.perPage, true, function() {
				more.style.display = 'block';
				refresh.style.display = 'block';
			});
		}
	};
	w.style.display = 'block';
	detail.style.display = 'none';
	refresh.style.display = 'none';
	discussions.style.display = 'none';
	ann.style.display = 'none';
	more.style.display = 'none';
	editor.addEventListener('keyup', markdownPreview);
	publish.addEventListener('click', publishClick);
	cancel.addEventListener('click', cancelClick);
	payoutRadios.forEach(function(radio, index) {
		radio.addEventListener('change', radioClick);
	})
	selfVoteCheckbox.addEventListener('change', checkboxClick);

	if (window.isEditMode) {
		segmentedContainer.style.display = 'none';
		selfVoteContainer.style.display = 'none';

		var post = posts[currentPostKey];
		titleField.value = post.title;
		editor.value = post.body;

	} else {
		segmentedContainer.style.display = 'block';
		selfVoteContainer.style.display = 'block';
	}
}

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
	postCreated.innerHTML = date.localeDate().toLocaleDateString(Config.dateLocale, Config.dateOptions);

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
	var a = Render.createLink('', fullUrl);
	var steemit = Render.img('https://steemit.com/favicon.ico?v=2');
	a.setAttribute('target', '_blank');
	steemit.className = 'icon32';
	steemit.setAttribute('title', 'steemit.com link');
	a.appendChild(steemit);

	linksContainer.innerHTML = '';
	linksContainer.appendChild(a);

	// Edit Button
	if (window.isAuth) {
		if (username == author) {
			var editButton = Render.createLink('Edit', '#');
			editButton.addEventListener('click', function(e) {
				e.preventDefault();
				window.isEditMode = true;
				showEditor();
			});
			linksContainer.appendChild(editButton);
		}
	}

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

function broadcastPost(primaryTag, author, permlink, title, body, jsonMetadata, decline, halfHalf, selfVote, beneficiary, successCallback, errorCallback) {
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


	console.log('beneficiary:', beneficiary);
	if (decline) {
		commentOptions.max_accepted_payout = '0.000 SBD';
		delete commentOptions['extensions'];
	} else if (halfHalf) {
		commentOptions.percent_steem_dollars = 10000;

		// Additional beneficiary setting from wordpress backend
		if (beneficiary.account && beneficiary.weight) {
			if (beneficiary.account.length > 2 && beneficiary.account.length < 16) {
				if (beneficiary.weight > 0 && beneficiary.weight < 9900) {
					if (commentOptions.extensions[0][1].beneficiaries) {
						commentOptions.extensions[0][1].beneficiaries.push(beneficiary);
					}
				}
			}
		}
	} else {
		// 100% Steem Power Up
		commentOptions.percent_steem_dollars = 0;

		// Additional beneficiary setting from wordpress backend
		if (beneficiary.account && beneficiary.weight) {
			if (beneficiary.account.length > 2 && beneficiary.account.length < 16) {
				if (beneficiary.weight > 0 && beneficiary.weight < 9900) {
					if (commentOptions.extensions[0][1].beneficiaries) {
						commentOptions.extensions[0][1].beneficiaries.push(beneficiary);
					}
				}
			}
		}
	}

	if (window.isEditMode != true) {
		operations.push(['comment_options', commentOptions]);
	}

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
