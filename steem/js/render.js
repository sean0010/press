var Render = (function() {
	/* Private */
	var _div = function(cssClass, textNode) {
		var el = document.createElement('div');
		el.classList.add(cssClass);
		el.textContent = textNode;
		return el;
	};
	var _btn = function(cssClass, text) {
		var b = document.createElement('button');
		var t = _div('btnIcon', text);
		var c = _div('btnCount', '0');
		t.innerHTML = text;
		b.appendChild(t);
		b.appendChild(c);
		b.classList.add(cssClass);
		return b;
	};
	var _createTr = function(link, comment, author, vote, created) {
		var tr = document.createElement('tr'); // 
		var td = document.createElement('td'); // title
		var td1 = document.createElement('td'); // Author
		var td2 = document.createElement('td'); // Vote
		var td3 = document.createElement('td'); // Created
		var co = createLink('[' + comment + ']', '#'); // Comment
		td.appendChild(link);
		td.appendChild(co);
		td1.innerHTML = author;
		td2.innerHTML = vote;
		td3.innerHTML = created;
		tr.appendChild(td);
		tr.appendChild(td1);
		tr.appendChild(td2);
		tr.appendChild(td3);
		link.classList.add('postLink');		
		co.classList.add('commentLink');
		return tr;
	};
	var _lastPost = {'permlink': '', 'author': ''};
	var _commentVote = function(commentAuthor, commentPermlink, upvoteComment, downvoteComment) {
		steem.api.getActiveVotes(commentAuthor, commentPermlink, function(err, votes) {
			if (err === null) {
				var v = countVotes(votes);
				upvoteComment.querySelector('.btnCount').innerHTML = v.up;
				downvoteComment.querySelector('.btnCount').innerHTML = v.down;

				// Logged In User Already Voted Mark
				if (window.isAuth) {
					var voted = Vote.hasVoted(votes, username);
					if (voted === 1) {
						upvoteComment.classList.add('voted');
					} else if (voted === -1) {
						downvoteComment.classList.add('voted');
					}
				}
			}
		});
	};

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
						var tr = _createTr(link, discussion.children, discussion.author, discussion.net_votes, date.yyyymmdd());
						temp.appendChild(tr);

						if (i == len - 1) {
							_lastPost.permlink = discussion.permlink;
							_lastPost.author = discussion.author;
						}

						var v = countVotes(discussion.active_votes);
						posts[discussion.permlink] = {
							title: discussion.title,
							author: discussion.author,
							created: discussion.created,
							body: discussion.body,
							upvotes: v.up,
							downvotes: v.down
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
						var upvoteComment = _btn('upvoteComment', '😊');
						var downvoteComment = _btn('downvoteComment', '😩');
						Vote.commentVoteBind(upvoteComment);
						Vote.commentVoteBind(downvoteComment);
						container.setAttribute('data-author', reply.author);
						container.setAttribute('data-permlink', reply.permlink);
						container.appendChild(author);
						container.appendChild(created);
						container.appendChild(upvoteComment);
						container.appendChild(downvoteComment);
						container.appendChild(body);
						r.appendChild(container);

						_commentVote(reply.author, reply.permlink, upvoteComment, downvoteComment);
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