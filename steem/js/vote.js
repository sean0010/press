var Vote = (function() {
	var _author = '';
	var _permlink = '';
	var _upvotePower, _upvoteLoader, _upvoteButton;
	var _downvotePower, _downvoteLoader, _downvoteButton;

	var _percentClick = function(e) {
		var percent = e.target.getAttribute('data-percent');
		var isUpvote = e.target.parentNode.classList.contains('up');

		if (isUpvote) _upvotePower.style.display = 'none';
		else _downvotePower.style.display = 'none';
		
		if (percent !== 'cancel') {
			var weight = percent * 100;

			if (isUpvote) {
				_upvoteLoader.style.display = 'block';
				_upvoteLoader.style.left = isNaN(_upvoteButton.offsetLeft) ? _upvoteButton.offsetLeft : _upvoteButton.offsetLeft + 'px';
				_upvoteLoader.style.top = isNaN(_upvoteButton.offsetTop) ? _upvoteButton.offsetTop : _upvoteButton.offsetTop + 'px';
			} else {
				_downvoteLoader.style.display = 'block';
				_downvoteLoader.style.left = isNaN(_downvoteButton.offsetLeft) ? _downvoteButton.offsetLeft : _downvoteButton.offsetLeft + 'px';
				_downvoteLoader.style.top = isNaN(_downvoteButton.offsetTop) ? _downvoteButton.offsetTop : _downvoteButton.offsetTop + 'px';
			}

			steemconnect.vote(username, _author, _permlink, weight, function(err, result) {
				if (err === null) {
					if (isUpvote) {
						_upvoteButton.classList.add('voted');
						_getVoteFromContent(_author, _permlink, function(err, up, down) {
							if (err == null) {
								_upvoteButton.querySelector('.voteCount').innerHTML = up
							} else {
								alert(err);
							}
						});
					} else {
						_downvoteButton.classList.add('voted');
						_getVoteFromContent(_author, _permlink, function(err, up, down) {
							if (err == null) {
								_downvoteButton.querySelector('.voteCount').innerHTML = down
							} else {
								alert(err);
							}
						});
					}
				} else {
					console.error('Steemconnect Vote Error:', err);
					alert(err);
				}
				_upvoteLoader.style.display = 'none';
				_upvoteButton.disabled = false;
				_downvoteLoader.style.display = 'none';
				_downvoteButton.disabled = false;
			});
		} else {
			if (isUpvote) {
				_upvoteButton.disabled = false;
			} else {
				_downvoteButton.disabled = false;
			}
		}
	};
	var _bind = function() {
		_upvoteButton.addEventListener('click', function() {
			if (window.isAuth) {
				if (_upvoteButton.classList.contains('voted')) {
					if (confirm('Cancel?')) {
						_upvoteLoader.style.display = 'block';
						_upvoteLoader.style.left = isNaN(_upvoteButton.offsetLeft) ? _upvoteButton.offsetLeft : _upvoteButton.offsetLeft + 'px';
						_upvoteLoader.style.top = isNaN(_upvoteButton.offsetTop) ? _upvoteButton.offsetTop : _upvoteButton.offsetTop + 'px';

						steemconnect.vote(username, _author, _permlink, 0, function(err, result) {
							console.log('Vote cancel result:', err, result);
							if (err === null) {
								_upvoteLoader.style.display = 'none';
								_upvoteButton.disabled = false;
								_upvoteButton.classList.remove('voted');
								_getVoteFromContent(_author, _permlink, function(err, up, down) {
									if (err == null) {
										_upvoteButton.querySelector('.voteCount').innerHTML = up
									} else {
										alert(err);
									}
								});
							} else {
								console.error('Steemconnect Vote Error:', err);
							}
						});
					}
				} else {
					_showUpvoteOptions();
				}
			} else {
				alert('Login required');
			}
		});
		var i, len = _upvotePower.children.length;
		for (i = 0; i < len; i++) {
			var button = _upvotePower.children[i];
			button.addEventListener('click', _percentClick);
		}

		_downvoteButton.addEventListener('click', function() {
			if (window.isAuth) {
				if (_downvoteButton.classList.contains('voted')) {
					if (confirm('Are you sure to un-vote?')) {
						_downvoteLoader.style.display = 'block';
						_downvoteLoader.style.left = isNaN(_downvoteButton.offsetLeft) ? _downvoteButton.offsetLeft : _downvoteButton.offsetLeft + 'px';
						_downvoteLoader.style.top = isNaN(_downvoteButton.offsetTop) ? _downvoteButton.offsetTop : _downvoteButton.offsetTop + 'px';

						steemconnect.vote(username, _author, _permlink, 0, function(err, result) {
							console.log('Vote cancel result:', err, result);
							if (err === null) {
								_downvoteLoader.style.display = 'none';
								_downvoteButton.disabled = false;
								_downvoteButton.classList.remove('voted');
								_getVoteFromContent(_author, _permlink, function(err, up, down) {
									if (err == null) {
										_downvoteButton.querySelector('.voteCount').innerHTML = down
									} else {
										alert(err);
									}
								});
							} else {
								console.error('Steemconnect Vote Error:', err);
							}
						});
					}
				} else {
					_showDownvoteOptions();
				}
			} else {
				alert('Login required');
			}
		});
		var j, len2 = _downvotePower.children.length;
		for (j = 0; j < len2; j++) {
			var button2 = _downvotePower.children[j];
			button2.addEventListener('click', _percentClick);
		}
	};

	var _showUpvoteOptions = function() {
		_upvotePower.style.display = 'block';
		_upvotePower.style.left = isNaN(_upvoteButton.offsetLeft) ? _upvoteButton.offsetLeft : _upvoteButton.offsetLeft + 'px';
		_upvotePower.style.top = isNaN(_upvoteButton.offsetTop) ? _upvoteButton.offsetTop : _upvoteButton.offsetTop + 'px';
		_upvoteButton.disabled = true;
	};

	var _showDownvoteOptions = function() {
		_downvotePower.style.display = 'block';
		_downvotePower.style.left = isNaN(_downvoteButton.offsetLeft) ? _downvoteButton.offsetLeft : _downvoteButton.offsetLeft + 'px';
		_downvotePower.style.top = isNaN(_downvoteButton.offsetTop) ? _downvoteButton.offsetTop : _downvoteButton.offsetTop + 'px';
		_downvotePower.disabled = true;
	};

	var _getVoteFromContent = function(author, permlink, callback) {
		steem.api.getContent(author, permlink, function(err, result) {
			console.log(err, result);
			if (err === null) {			
				var v = countVotes(result.active_votes);
				callback(null, v.up, v.down);
			} else {
				console.error('some error', err);
				callback(err);
			}
		});
	}

	return {
		init: function(upvotePower, upvoteLoader, upvote, downvotePower, downvoteLoader, downvote) {
			_upvotePower = upvotePower;
			_upvoteLoader = upvoteLoader;
			_upvoteButton = upvote;
			_downvotePower = downvotePower;
			_downvoteLoader = downvoteLoader;
			_downvoteButton = downvote;
			_bind();
		},
		set: function(author, permlink) {
			_author = author;
			_permlink = permlink;
		},

		// 0: Not Voted, 1: Upvoted, -1: Downvoted
		hasVoted: function(votes, voter) {
			var result = 0;
			var i = votes.length;
			while(i--) {
				if (votes[i].voter === voter) {
					if (votes[i].percent < 0) {
						result = -1;
					} else if (votes[i].percent == 0) {
						result = 0;
					} else {
						result = 1;
					}
					break;
				}
			}
			return result;
		},
		commentVoteBind: function(btn) {
			btn.addEventListener('click', function(e) {
				if (window.isAuth !== true) {
					alert('Login required');
					return;
				}
				var isVoted = btn.classList.contains('voted');
				var isUpvote = btn.classList.contains('upvoteComment');
				var commentAuthor = btn.parentNode.getAttribute('data-author');
				var commentPermlink = btn.parentNode.getAttribute('data-permlink');

				if (isVoted) {
					if (confirm('Are you sure to un-vote?')) {
						btn.parentNode.querySelector('.downvoteComment').setAttribute('disabled', true);
						btn.parentNode.querySelector('.upvoteComment').setAttribute('disabled', true);
						steemconnect.vote(username, commentAuthor, commentPermlink, 0, function(err, result) {
							_getVoteFromContent(commentAuthor, commentPermlink, function(err, up, down) {
								if (err == null) {
									btn.querySelector('.btnCount').innerHTML = up;
								} else {
									alert(err);
								}
								
								btn.classList.remove('voted');
								btn.parentNode.querySelector('.upvoteComment').removeAttribute('disabled');
								btn.parentNode.querySelector('.downvoteComment').removeAttribute('disabled');
							});							
						});
					}
				} else {
					var weight = 10000;
					if (!isUpvote) weight = -10000;

					btn.parentNode.querySelector('.downvoteComment').setAttribute('disabled', true);
					btn.parentNode.querySelector('.upvoteComment').setAttribute('disabled', true);
					steemconnect.vote(username, commentAuthor, commentPermlink, weight, function(err, result) {
						_getVoteFromContent(commentAuthor, commentPermlink, function(err, up, down) {
							if (err == null) {
								btn.querySelector('.btnCount').innerHTML = isUpvote ? up : down;
							} else {
								alert(err);
							}
							btn.classList.add('voted');
							btn.parentNode.querySelector('.upvoteComment').removeAttribute('disabled');
							btn.parentNode.querySelector('.downvoteComment').removeAttribute('disabled');
						});
					});
				}
			});
		}
	}
})();