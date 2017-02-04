/**********
*	Library
***********/

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

function renderPost(hash, callback) {
	var args = hash.split('/', 3);
	console.log('ARGS:', args);
	var category = args[1].replace('#', '');
	var author = args[1].replace('@', '');
	var permlink = args[2];
	steem.api.getContent(author, permlink, function(err, result) {
		console.log(err, result);
		if (err === null) {
			var detail = document.querySelector('.postDetails');
			var v = countVotes(result.active_votes);
			showPostDetails(detail, result.body, result.title, result.author, result.created, v.up, v.down);
			callback();
		} else {
			console.error('some error', err);
		}
	});
	Render.replies(author, permlink, function(result) {
		if (result.err === null) {
			var replyContainer = document.querySelector('.postDetails .replyContainer');
			replyContainer.appendChild(result.el);
		}
	}); 
}

function countVotes(votes) {
	var result = {up: 0, down: 0};

	votes.forEach(function(vote) {
		if (vote.percent < 0) {
			result.down -= 1;
		} else {
			result.up += 1;
		}
	});

	return result;
}



/**********
*	Constant
***********/
var perPage = 20;
var steemconnectApp = 'morning';

/**********
*	DOM manipulation
***********/
var lastPost = {'permlink': '', 'author': ''};
var posts = {};

ready(function() {
	var steemContainer = document.querySelector('.steemContainer');
	var steemTag = steemContainer.getAttribute('data-steemtag');
	var tagName = steemContainer.querySelector('.tagName');
	var discussions = steemContainer.querySelector('.discussions');
	var acc = steemContainer.querySelector('.steemAccount');
	var more = steemContainer.querySelector('.steemContainer .more');
	var tbody = steemContainer.querySelector('tbody');

	tagName.innerHTML = steemTag;

	var hash = window.location.hash;
	if (hash.length > 1) {
		// get details
		renderPost(hash, function() {
			Render.posts(steemTag, perPage, function(result) {
				if (result.err === null) {
					var trs = result.el;
					trs.forEach(function(tr) {
						tbody.appendChild(tr.cloneNode(true));
					});
				} else {
					console.log('Render.posts error:', err);
				}
			});
		});
	} else {
		Render.posts(steemTag, perPage, function(result) {
			if (result.err === null) {
				var trs = result.el;
				trs.forEach(function(tr) {
					tbody.appendChild(tr.cloneNode(true));
				});
			} else {
				console.log('Render.posts error:', err);
			}
		});
	}
	
	// Draw login
	steemconnect.init({
		app: steemconnectApp,
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
			acc.appendChild(createPostBtn);
			acc.appendChild(accBtn);
		} else {
			var loginBtn = createLink('Login', loginURL);
			acc.appendChild(loginBtn);
		}
	});

	more.addEventListener('click', function() {
		more.style.display = 'block';
		more.disabled = true;
		Render.posts(steemTag, perPage, function(result) {
			if (result.err === null) {
				var trs = result.el;
				trs.forEach(function(tr) {
					tbody.appendChild(tr.cloneNode(true));
				});
			} else {
				console.log('Render.posts error:', err);
			}
		});
	});
});

window.addEventListener('hashchange', onHashChange, false);

function onHashChange() {
	var hash = window.location.hash;
	var args = hash.split('/', 3);
	var permlink = args[2];
	var detail = document.querySelector('.postDetails');
	var replyContainer = detail.querySelector('.replyContainer');
	replyContainer.innerHTML = '';
	if (args.length === 3) {
		var post = posts[permlink];
		showPostDetails(detail, post.body, post.title, post.author, post.created, post.upvotes, post.downvotes);
		Render.replies(post.author, permlink, function(result) {
			if (result.err === null) {
				replyContainer.appendChild(result.el);
			}
		}); 
	} else {

	}
}

function markdown2html(markdown) {
	var remarkable = new Remarkable({
		html: true, // remarkable renders first then sanitize runs...
		breaks: true,
		linkify: true, // linkify is done locally
		typographer: false, // https://github.com/jonschlinkert/remarkable/issues/142#issuecomment-221546793
		quotes: '“”‘’'
	});

	var jsonMetadata = {};
	jsonMetadata.image = jsonMetadata.image || [];

	markdown = markdown.replace(/<!--([\s\S]+?)(-->|$)/g, '(html comment removed: $1)');

	markdown.replace(imageRegex, function(img) {
		if (_.filter(jsonMetadata.image, i => i.indexOf(img) !== -1).length === 0) {
			jsonMetadata.image.push(img);
		}
	});

	markdown = linkify(markdown);

	//if (_.has(embeds, '[0].embed')) {
	//	embeds.forEach((embed) => { markdown = markdown.replace(embed.url, embed.embed); });
	//}
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

function showPostDetails(container, markdown, title, author, created, upvotes, downvotes) {
	var postBody = container.querySelector('.postBody');
	var postAuthor = container.querySelector('.postAuthor');
	var postTitle = container.querySelector('.postTitle');
	var postCreated = container.querySelector('.postCreated');
	var upvoteCount = container.querySelector('.upvote .voteCount');
	var downvoteCount = container.querySelector('.downvote .voteCount');

	container.style.display = 'block';

	postBody.innerHTML = markdown2html(markdown);
	postTitle.innerHTML = '<b>' + title + '</b>';
	postAuthor.innerHTML = author;

	var date = new Date(created);
	postCreated.innerHTML = date.datetime();

	upvoteCount.innerHTML = upvotes;
	downvoteCount.innerHTML = downvotes;

	window.scrollTo(0, document.querySelector('.steemContainer').offsetTop);
}

