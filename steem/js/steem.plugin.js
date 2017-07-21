/**********
*	Library
***********/

const kebabCase = function(string) {
  return string.replace(/\s+/g, '-').toLowerCase();
};

function validateAccountName(value) {
  var i,
    label,
    len,
    length,
    ref,
    suffix;

  suffix = 'Account name should ';
  if (!value) {
    return `${suffix}not be empty.`;
  }
  length = value.length;
  if (length < 3) {
    return `${suffix}be longer.`;
  }
  if (length > 16) {
    return `${suffix}be shorter.`;
  }
  if (/\./.test(value)) {
    suffix = 'Each account segment should ';
  }
  ref = value.split('.');
  for (i = 0, len = ref.length; i < len; i++) {
    label = ref[i];
    if (!/^[a-z]/.test(label)) {
      return `${suffix}start with a letter.`;
    }
    if (!/^[a-z0-9-]*$/.test(label)) {
      return `${suffix}have only letters, digits, or dashes.`;
    }
    if (/--/.test(label)) {
      return `${suffix}have only one dash in a row.`;
    }
    if (!/[a-z0-9]$/.test(label)) {
      return `${suffix}end with a letter or digit.`;
    }
    if (!(label.length >= 3)) {
      return `${suffix}be longer`;
    }
  }
  return null;
}

function escapeRegExp(str) {
  return str.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, '\\$1');
}

function replaceAll(str, find, replace) {
  return str.replace(new RegExp(escapeRegExp(find), 'g'), replace);
}

const imageRegex = /https?:\/\/(?:[-a-zA-Z0-9._]*[-a-zA-Z0-9])(?::\d{2,5})?(?:[/?#](?:[^\s"'<>\][()]*[^\s"'<>\][().,])?(?:(?:\.(?:tiff?|jpe?g|gif|png|svg|ico)|ipfs\/[a-z\d]{40,})))/ig;

function linkify(content) {
  // hashtag
  content = content.replace(/(^|\s)(#[-a-z\d]+)/ig, (tag) => {
    if (/#[\d]+$/.test(tag)) return tag; // Don't allow numbers to be tags
    const space = /^\s/.test(tag) ? tag[0] : '';
    const tag2 = tag.trim().substring(1);
    const tagLower = tag2.toLowerCase();
    return `${space}<a href="/trending/${tagLower}">${tag}</a>`;
  });

  // usertag (mention)
  content = content.replace(/(^|\s)(@[a-z][-\.a-z\d]+[a-z\d])/ig, (user) => {
    const space = /^\s/.test(user) ? user[0] : '';
    const user2 = user.trim().substring(1);
    const userLower = user2.toLowerCase();
    const valid = validateAccountName(userLower) == null;
    return space + (valid ?
      `<a href="/@${userLower}">@${user2}</a>` :
      `@${user2}`
    );
  });

  // content = content.replace(linksRe.any, (ln) => {
  //   if (linksRe.image.test(ln)) {
  //     if (images) images.add(ln);
  //     return `<img src="${ipfsPrefix(ln)}" />`;
  //   }
  //   if (links) links.add(ln);
  //   return `<a href="${ipfsPrefix(ln)}">${ln}</a>`;
  // });
  return content;
}


function ready(fn) {
	if (document.readyState != 'loading'){
		fn();
	} else {
		document.addEventListener('DOMContentLoaded', fn);
	}
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

Date.prototype.yyyymmdd = function() {
	var mm = this.getMonth() + 1; // getMonth() is zero-based
	var dd = this.getDate();
	return [this.getFullYear(), '-', (mm > 9 ? '' : '0') + mm, '-', (dd > 9 ? '' : '0') + dd].join('');
};
Date.prototype.mmdd = function() {
	var mm = this.getMonth() + 1; // getMonth() is zero-based
	var dd = this.getDate();
	return [(mm > 9 ? '' : '0') + mm, '-', (dd > 9 ? '' : '0') + dd].join('');
};

Date.prototype.datetime = function() {
	var mm = this.getMonth() + 1; // getMonth() is zero-based
	var dd = this.getDate();
	var hour = this.getHours(); if (hour < 9) { hour = "0" + hour; }
	var minute = this.getMinutes(); if (minute < 9) { minute = "0" + minute; }
	var second = this.getSeconds(); if (second < 9) { second = "0" + second; }

	return [this.getFullYear(), '-', (mm > 9 ? '' : '0') + mm, '-', (dd > 9 ? '' : '0') + dd, ' ', hour, ':', minute, ':', second].join('');
};


function getPayout(discussion) {
	var totalPendingPayout = parseFloat(discussion.total_pending_payout_value.split(' ')[0]);
	var totalPayoutValue = parseFloat(discussion.total_payout_value.split(' ')[0]);
	var result = totalPendingPayout + totalPayoutValue;
	result = '$' + result.toFixed(3);
	return result;
}

function debounce(func, wait, immediate) {
	var timeout;
	return function() {
		var context = this, args = arguments;
		var later = function() {
			timeout = null;
			if (!immediate) func.apply(context, args);
		};
		var callNow = immediate && !timeout;
		clearTimeout(timeout);
		timeout = setTimeout(later, wait);
		if (callNow) func.apply(context, args);
	};
};

function renderPost(container, hash, callback) {
	var args = hash.split('/', 3);
	console.log('ARGS:', args);
	var category = args[1].replace('#', '');
	var author = args[1].replace('@', '');
	var permlink = args[2];
	steem.api.getContent(author, permlink, function(err, result) {
		console.log(err, result);
		if (err === null) {
			var v = countVotes(result.active_votes);
			var tags = JSON.parse(result.json_metadata).tags;
			showPostDetails(container, result.body, result.title, result.author, permlink, result.created, v.up, v.down, tags);
			callback();
		} else {
			console.error('some error', err);
		}
	});
	Render.replies(author, permlink, 0, function(result) {
		if (result.err === null) {
			var replyContainer = document.querySelector('.postDetails .replyContainer');
			replyContainer.appendChild(result.el);
		}
	}); 
}

function countVotes(votes) {
	var result = {up: 0, down: 0};

	votes.forEach(function(vote) {
		var percent = parseInt(vote.percent);
		if (percent < 0) {
			result.down += 1;
		} else if (percent > 0) {
			result.up += 1;
		}
	});

	return result;
}



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

ready(function() {
	var steemContainer = document.querySelector('.steemContainer');

	// Config from shortcode attribute value
	var tag = steemContainer.getAttribute('data-steemtag');
	var limit = steemContainer.getAttribute('data-limit');
	Config.init({
		perPage: limit,
		steemTag: tag
	});

	var tagName = steemContainer.querySelector('.tagName');
	var discussions = steemContainer.querySelector('.discussions');
	var acc = steemContainer.querySelector('.steemAccount');
	var more = steemContainer.querySelector('.steemContainer .more');
	var tbody = steemContainer.querySelector('tbody');
	var thead = tbody.querySelector('tr');
	var voteContainer = steemContainer.querySelector('.voteContainer');
	var replyInput = document.querySelector('.replyInput');
	var replyButton = document.querySelector('.replyButton');
	var refresh = steemContainer.querySelector('.refreshButton');
	var close = steemContainer.querySelector('.postDetailsCloseButton');
	var detail = document.querySelector('.postDetails');	
	tagName.innerHTML = Config.steemTag;

	var hash = window.location.hash;
	if (hash === 'write' || hash === '#write') {
		showEditor();
		if (discussions.style.display === 'block') {
			renderPosts(Config.steemTag, Config.perPage, false);
		}
	} else if (hash.length > 1) {
		// get details
		renderPost(detail, hash, function() {
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
			var accBtn = createLink(username, '#');
			var createPostBtn = createLink('Write', '#write');
			var logoutBtn = createLink('Logout', 'https://steemconnect.com/logout?redirect_url=' + window.location.href);
			acc.appendChild(createPostBtn);
			acc.appendChild(accBtn);
			acc.appendChild(logoutBtn);
		} else {
			var loginBtn = createLink('Login', loginURL);
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

			// Clean up discussions table and give table header
			var th = thead.cloneNode(true);
			tbody.innerHTML = '';
			tbody.appendChild(th);
		}
		Render.posts(tag, limit, function(result) {
			if (result.err === null) {
				var trs = result.el;
				trs.forEach(function(tr) {
					tbody.appendChild(tr.cloneNode(true));
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

		var markdownPreview = debounce(function() {
			preview.innerHTML = markdown2html(editor.value);
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



var remarkable = new Remarkable({
	html: true, // remarkable renders first then sanitize runs...
	breaks: true,
	linkify: false, // linkify is done locally
	typographer: false, // https://github.com/jonschlinkert/remarkable/issues/142#issuecomment-221546793
	quotes: '“”‘’'
});


function convertMedia(html) {
	var pattern1 = /(?:http?s?:\/\/)?(?:www\.)?(?:vimeo\.com)\/?(.+)/g;
	var pattern2 = /(?:http?s?:\/\/)?(?:www\.)?(?:youtube\.com|youtu\.be)\/(?:watch\?v=)?(.+)/g;

	if (pattern1.test(html)) {
		var replacement = '<div style="position:relative;height:0;padding-bottom:56.2%"><iframe width="640" height="360" src="//player.vimeo.com/video/$1" frameborder="0" webkitallowfullscreen mozallowfullscreen allowfullscreen></iframe></div>';
		var html = html.replace(pattern1, replacement);
	}

	if (pattern2.test(html)) {
		var replacement = '<div style="position:relative;height:0;padding-bottom:56.2%"><iframe width="640" height="360" src="http://www.youtube.com/embed/$1?rel=0?ecver=2" frameborder="0" style="position:absolute;width:100%;height:100%;left:0" allowfullscreen></iframe></div>';
		var html = html.replace(pattern2, replacement);
	} 

	return html;
}

function markdown2html(markdown) {
	var jsonMetadata = {};
	jsonMetadata.image = jsonMetadata.image || [];

	markdown = markdown.replace(/<!--([\s\S]+?)(-->|$)/g, '(html comment removed: $1)');

	markdown.replace(imageRegex, function(img) {
		if (_.filter(jsonMetadata.image, i => i.indexOf(img) !== -1).length === 0) {
			jsonMetadata.image.push(img);
		}
	});

	markdown = linkify(markdown);
	markdown = convertMedia(markdown);
	markdown = remarkable.render(markdown);

	if (_.has(jsonMetadata, 'image[0]')) {
		jsonMetadata.image.forEach(function(image) {
			var newUrl = image;
			if (/^\/\//.test(image)) { newUrl = `https:${image}`; }

			markdown = replaceAll(markdown, `<a href="${image}">${image}</a>`, `<img src="${newUrl}">`);
			// not in img tag
			if (markdown.search(`<img[^>]+src=["']${escapeRegExp(image)}["']`) === -1) {
				markdown = replaceAll(markdown, image, `<img src="${newUrl}">`);
			}
		});
	}

	markdown.replace(/<img[^>]+src="([^">]+)"/ig, function(img, ...rest) {
		if (rest.length && rest[0] && rest[0].indexOf('https://steemitimages.com/0x0/') !== 0) {
			const newUrl = `https://steemitimages.com/0x0/${rest[0]}`;
			markdown = replaceAll(markdown, rest[0], newUrl);
		}
	});

	return markdown;
}

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

	postBody.innerHTML = markdown2html(markdown);
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
	var a = createLink('Steemit.com Link', fullUrl);
	a.setAttribute('target', '_blank');
	linksContainer.innerHTML = '';
	linksContainer.appendChild(a);

}