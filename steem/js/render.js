var Render = (function() {
	/* Private */
	var _li = function() {
		var li = document.createElement('li');
		return li;
	};
	var _div = function(cssClass, html) {
		var el = document.createElement('div');
		el.classList.add(cssClass);
		if (html !== undefined) el.innerHTML = html;
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
	var _replyBtn = function(cssClass, text) {
		var b = document.createElement('button');
		b.innerHTML = text;
		b.classList.add(cssClass);
		return b;
	};
	var _createRow = function(link, comment, author, reward, vote, created) {
		var row = _div('pRow');
		var pTitle = _div('pTitle');
		var pAuthor = _div('pAuthor');
		var pReward = _div('pReward');
		var pVote = _div('pVote');
		var pCreated = _div('pCreated');

		link.classList.add('postLink');
		pTitle.appendChild(link);
		if (comment > 0) {
			var co = Render.createLink('[' + comment + ']', '#'); // Comment
			co.classList.add('commentLink');
			pTitle.appendChild(co);
		}
		pAuthor.innerHTML = author;
		pReward.innerHTML = Helper.formatReward(reward);
		pVote.innerHTML = vote;

		var tooltipDate = document.createElement('div');
		tooltipDate.innerHTML = created.mmdd();
		tooltipDate.className = 'createdDate';
		tooltipDate.setAttribute('title', created.toDateString() + ' ' + created.toTimeString());
		pCreated.appendChild(tooltipDate);

		row.appendChild(pTitle);
		row.appendChild(pAuthor);
		row.appendChild(pReward);
		row.appendChild(pVote);
		row.appendChild(pCreated);

		return row;
	};
	var _lastPost = {'permlink': '', 'author': ''};
	var _commentVote = function(commentAuthor, commentPermlink, upvoteComment, downvoteComment) {
		steem.api.getActiveVotes(commentAuthor, commentPermlink, function(err, votes) {
			if (err === null) {
				var v = Helper.countVotes(votes);
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
	var _replies = function(parentAuthor, parentPermlink, parentDepth, callback) {
		steem.api.getContentReplies(parentAuthor, parentPermlink, function(err, result) {
			if (err === null) {
				var r = _div('replies');
				var i, len = result.length;
				for (i = 0; i < len; i++) {
					var reply = result[i];
					var container = _div('reply');
					var author = _div('replyAuthor', reply.author);
					var created = _div('replyCreated', (new Date(reply.created)).datetime());
					var upvoteComment = _btn('upvoteComment', '😊');
					var downvoteComment = _btn('downvoteComment', '😩');
					var replyComment = _replyBtn('replyButton', 'Reply');
					var body = _div('replyBody', Helper.markdown2html(reply.body));
					var childrenWrap = _div('childrenWrap');
					Vote.commentVoteBind(upvoteComment);
					Vote.commentVoteBind(downvoteComment);
					container.setAttribute('data-author', reply.author);
					container.setAttribute('data-permlink', reply.permlink);					
					container.appendChild(author);
					container.appendChild(created);
					container.appendChild(upvoteComment);
					container.appendChild(downvoteComment);
					container.appendChild(replyComment);
					container.appendChild(body);
					container.appendChild(childrenWrap);
					r.appendChild(container);

					_commentVote(reply.author, reply.permlink, upvoteComment, downvoteComment);
					_openReplyCommentForm(replyComment, reply.author, reply.permlink);

					if (reply.children > 0) {
						var child = _btn('child', '⨁');
						var childrenWrap = container.querySelector('.childrenWrap');
						child.querySelector('.btnCount').innerHTML = reply.children;
						childrenWrap.setAttribute('data-author', reply.author);
						childrenWrap.setAttribute('data-permlink', reply.permlink);
						childrenWrap.setAttribute('data-depth', reply.depth);
						container.appendChild(child);							
						_openChildren(child, childrenWrap);
					}
				}
				callback({err: null, el: r});
			} else {
				console.error('getContentReplies ERROR:', err);
				callback({err: err, el: null});
			}
		});
	};
	var _openChildren = function(expandButton, childrenWrap) {
		//expandButton.addEventListener('click', function(e) {
			var parentAuthor = childrenWrap.getAttribute('data-author');
			var parentPermlink = childrenWrap.getAttribute('data-permlink');
			var parentDepth = childrenWrap.getAttribute('data-depth');

			expandButton.setAttribute('disabled', true);
			_replies(parentAuthor, parentPermlink, parentDepth, function(result) {
				if (result.err === null) {
					expandButton.style.display = 'none';
					if (result.el != null) {
						childrenWrap.appendChild(result.el);
					}
				} else {
					expandButton.removeAttribute('disabled');
				}
			}); 
		//});
	};

	var _openReplyCommentForm = function(btn, author, permlink) {
		btn.setAttribute('data-author', author);
		btn.setAttribute('data-permlink', permlink);
		var btnClick = btn.addEventListener('click', function() {
			if (window.isAuth !== true) {
				alert('Login required');
				return;
			}
			btn.setAttribute('disabled', true);
			btn.removeEventListener('click', btnClick);
			var author = btn.getAttribute('data-author');
			var permlink = btn.getAttribute('data-permlink');
			var replyContainer = _div('replyContainer', '');
			var replyTextArea = document.createElement('textarea');
			var replySubmit = document.createElement('button');
			var replyCancel = document.createElement('button');

			replySubmit.classList.add('button');
			replySubmit.textContent = 'Submit';
			replyCancel.classList.add('button');
			replyCancel.textContent = 'Cancel';
			replyTextArea.setAttribute('placeholder', 'Input Comment');
			replyTextArea.classList.add('replyInput');

			replyContainer.appendChild(replyTextArea);
			replyContainer.appendChild(replySubmit);
			replyContainer.appendChild(replyCancel);
			btn.parentNode.appendChild(replyContainer);

			var cancelClick = replyCancel.addEventListener('click', function() {
				btn.removeAttribute('disabled');
				replyContainer.parentNode.removeChild(replyContainer);
			});
			var submitClick = replySubmit.addEventListener('click', function() {
				var parentReply = replySubmit.parentNode.parentNode;
				var parentAuthor = parentReply.getAttribute('data-author');
				var parentPermlink = parentReply.getAttribute('data-permlink');				
				var rePermlink = 're-' + parentPermlink + '-' + Math.floor(Date.now() / 1000);
				var inputString = replyTextArea.value.trim();

				if (inputString === '') {
					alert('Empty comment');
				} else {
					replyTextArea.setAttribute('disabled', true);
					replyCancel.setAttribute('disabled', true);
					replySubmit.setAttribute('disabled', true);

					/*steemconnect.comment(parentAuthor, parentPermlink, username, rePermlink, '', inputString, '', function(err, result) {
						console.log(err, result);
						btn.removeAttribute('disabled');
						replyContainer.parentNode.removeChild(replyContainer);

						var replyElement = btn.parentNode;
						var parentChildrenWrap = replyElement.querySelector('.childrenWrap');
						var container = _div('reply', '');
						var author = _div('replyAuthor', username);
						var created = _div('replyCreated', (new Date()).datetime());
						var upvoteComment = _btn('upvoteComment', '😊');
						var downvoteComment = _btn('downvoteComment', '😩');
						var replyComment = _replyBtn('replyButton', 'Reply');
						var body = _div('replyBody', inputString);
						var childrenWrap = _div('childrenWrap', '');

						Vote.commentVoteBind(upvoteComment);
						Vote.commentVoteBind(downvoteComment);
						container.setAttribute('data-author', username);
						container.setAttribute('data-permlink', rePermlink);					
						container.appendChild(author);
						container.appendChild(created);
						container.appendChild(upvoteComment);
						container.appendChild(downvoteComment);
						container.appendChild(replyComment);
						container.appendChild(body);
						container.appendChild(childrenWrap);
						parentChildrenWrap.appendChild(container);

						_openReplyCommentForm(replyComment, username, rePermlink);
					});*/
				}
			});
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
			more.style.display = 'none';
			steem.api.getDiscussionsByCreated(params, function(err, result) {
				if (err === null) {
					var i, len = result.length;
					for (i = 0; i < len; i++) {
						var p = result[i];
						if (p.permlink == _lastPost.permlink && p.author == _lastPost.author) {
							// skip, redundant post
							continue;
						}

						var link = Render.createLink(p.title, '#' + p.category + '/@' + p.author + '/' + p.permlink);
						var date = new Date(p.created);
						var payout = Helper.getPayout(p);
						var row = _createRow(link, p.children, p.author, p.pending_payout_value, p.net_votes, date);
						temp.appendChild(row);

						if (i == len - 1) {
							_lastPost.permlink = p.permlink;
							_lastPost.author = p.author;
						}

						var v = Helper.countVotes(p.active_votes);
						posts[p.permlink] = {
							title: p.title,
							author: p.author,
							created: p.created,
							body: p.body,
							upvotes: v.up,
							downvotes: v.down,
							tags: JSON.parse(p.json_metadata).tags
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
		post: function(container, hash, callback) {
			var args = hash.split('/', 3);
			console.log('ARGS:', args);
			var category = args[1].replace('#', '');
			var author = args[1].replace('@', '');
			var permlink = args[2];

			steem.api.getContent(author, permlink, function(err, result) {
				console.log(err, result);
				if (err === null) {
					var v = Helper.countVotes(result.active_votes);
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
		},
		replies: function(parentAuthor, parentPermlink, parentDepth, callback) {
			_replies(parentAuthor, parentPermlink, parentDepth, function(result) {
				callback(result);
			});
		},
		tags: function(tagsArray) {
			var postTags = _div('postTags', '');
			var i, len = tagsArray.length;
			for (i = 0; i < len; i++) {
				var postTag = _div('postTag', tagsArray[i]);
				postTags.appendChild(postTag);
			}
			return postTags;
		},
		votePercentOption: function(percent) {
			var option = _li('');
			var vote = _div('voteBtn', percent + '%');
			vote.setAttribute('data-percent', percent);
			var clear = _div('voteBtnClear', 'x');
			option.appendChild(vote);
			option.appendChild(clear);
			return option;
		},
		reset: function() {
			_lastPost.permlink = '';
			_lastPost.author = '';
		},
		createLink: function(title, url) {
			var el = document.createElement('a');
			el.textContent = title;
			el.href = url;
			return el;
		}
	};
})();