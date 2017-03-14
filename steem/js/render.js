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
	var _replyBtn = function(cssClass, text) {
		var b = document.createElement('button');
		b.innerHTML = text;
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
	var _replies = function(parentAuthor, parentPermlink, parentDepth, callback) {
		steem.api.getContentReplies(parentAuthor, parentPermlink, function(err, result) {
			if (err === null) {
				var r = _div('replies', '');
				var i, len = result.length;
				for (i = 0; i < len; i++) {
					var reply = result[i];
					var container = _div('reply', '');
					var author = _div('replyAuthor', reply.author);
					var created = _div('replyCreated', (new Date(reply.created)).datetime());
					var upvoteComment = _btn('upvoteComment', '😊');
					var downvoteComment = _btn('downvoteComment', '😩');
					var replyComment = _replyBtn('replyButton', 'Reply');
					var body = _div('replyBody', reply.body);
					var childrenWrap = _div('childrenWrap', '');
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
		expandButton.addEventListener('click', function(e) {
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
		});
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

					steemconnect.comment(parentAuthor, parentPermlink, username, rePermlink, '', inputString, '', function(err, result) {
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
					});
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
		replies: function(parentAuthor, parentPermlink, parentDepth, callback) {
			_replies(parentAuthor, parentPermlink, parentDepth, function(result) {
				callback(result);
			});
		}
	};
})();