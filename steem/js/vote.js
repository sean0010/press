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
				console.log('steemconnect vote result:', err, result);
				if (err === null) {
					if (isUpvote) {
						_upvoteLoader.style.display = 'none';
						_upvoteButton.disabled = false;
						_upvoteButton.classList.add('voted');
						var prevCount = _upvoteButton.querySelector('.voteCount').textContent;
						_upvoteButton.querySelector('.voteCount').innerHTML = parseInt(prevCount) + 1;
					} else {
						_downvoteLoader.style.display = 'none';
						_downvoteButton.disabled = false;
						_downvoteButton.classList.add('voted');
						var prevCount = _downvoteButton.querySelector('.voteCount').textContent;
						_downvoteButton.querySelector('.voteCount').innerHTML = parseInt(prevCount) + 1;
					}
				} else {
					console.error('Steemconnect Vote Error:', err);
				}
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

				} else {
					_showUpvoteOptions();
				}
			} else {

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

				} else {
					_showDownvoteOptions();
				}
			} else {

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

	// 0: Not Voted, 1: Upvoted, -1: Downvoted
	var _hasVoted = function(votes, voter) {
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
	};

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
		hasVoted: function(votes, voter) {
			var voted = _hasVoted(votes, voter);
			if (voted === 1) {
				_upvoteButton.classList.add('voted');
			} else if (voted === -1) {
				_downvoteButton.classList.add('voted');
			}
		}
	}
})();