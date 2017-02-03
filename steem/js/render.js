var Render = (function() {
	/* Private */
	var _div = function(cssClass, textNode) {
		var el = document.createElement('div');
		el.classList.add(cssClass);
		el.textContent = textNode;
		return el;
	};
	var _lastPost = {'permlink': '', 'author': ''};

	/* Public */
	return {
		posts: function(tag, limit, callback) {
			var temp = _div('temp', '');
			var loader = document.querySelector('.loaderSpace');
			var more = document.querySelector('.steemContainer .more');

			var params = {
				"tag": tag,
				"limit": limit
			};
			if (_lastPost.permlink !== '') {
				params.start_permlink = _lastPost.permlink;
				params.start_author = _lastPost.author;
			}
			loader.style.display = 'block';
			steem.api.getDiscussionsByCreated(params, function(err, result) {
				if (err === null) {
					var i, len = result.length;
					for (i = 0; i < len; i++) {
						var discussion = result[i];
						if (discussion.permlink == _lastPost.permlink && discussion.author == _lastPost.author) {
							// skip, redundant post
							continue;
						}

						var link = createLink(discussion.title, '#' + discussion.category + '/@' + discussion.author + '/' + discussion.permlink);
						var date = new Date(discussion.created);
						var payout = getPayout(discussion);
						var tr = createTr(link, discussion.children, discussion.author, discussion.net_votes, date.yyyymmdd());
						temp.appendChild(tr);

						if (i == len - 1) {
							_lastPost.permlink = discussion.permlink;
							_lastPost.author = discussion.author;
						}

						posts[discussion.permlink] = {
							title: discussion.title,
							author: discussion.author,
							created: discussion.created,
							body: discussion.body
						};
					}
					loader.style.display = 'none';
					more.style.display = 'block';
					more.disabled = false;
					callback({err: null, el: temp.childNodes});
				} else {
					console.log('ERROR:', err);
					callback({err: err, el: null});
				}
			});
		},
		replies: function(parentAuthor, parentPermlink, callback) {
			var self = this;
			steem.api.getContentReplies(parentAuthor, parentPermlink, function(err, result) {
				console.log(err, result);
				if (err === null) {
					var r = _div('replies', '');
					var i, len = result.length;
					for (i = 0; i < len; i++) {
						var reply = result[i];
						var container = _div('reply', '');
						var author = _div('replyAuthor', reply.author);
						var created = _div('replyCreated', (new Date(reply.created)).datetime());
						var body = _div('replyBody', reply.body);
						container.appendChild(author);
						container.appendChild(created);
						container.appendChild(body);
						r.appendChild(container);
					}
					callback({err: null, el: r});
				} else {
					console.error('getContentReplies ERROR:', err);
					callback({err: err, el: null});
				}
			});
		}
	};
})();