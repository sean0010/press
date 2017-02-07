var Vote = (function() {
	var _author = '';
	var _permlink = '';
	var _votePower, _upvoteLoader, _upvoteButton;

	var _percentClick = function(e) {
		var percent = e.target.getAttribute('data-percent');

		//_unbind();
		_votePower.style.display = 'none';
		if (percent !== 'cancel') {
			_upvoteLoader.style.display = 'block';
			_upvoteLoader.style.width = _upvoteButton.style.width;
			_upvoteLoader.style.height = _upvoteButton.style.height;
			_upvoteLoader.style.left = isNaN(_upvoteButton.offsetLeft) ? _upvoteButton.offsetLeft : _upvoteButton.offsetLeft + 'px';
			_upvoteLoader.style.top = isNaN(_upvoteButton.offsetTop) ? _upvoteButton.offsetTop : _upvoteButton.offsetTop + 'px';

			voteIt(_author, _permlink, percent, function(result) {
				_upvoteLoader.style.display = 'none';
				_upvoteButton.disabled = false;
			});
		} else {
			_upvoteButton.disabled = false;

		}
	};
	var _bind = function() {
		_upvoteButton.addEventListener('click', function() {
			if (window.isAuth) {
				_showUpvoteOptions();
			} else {

			}
		});
		var i, len = _votePower.children.length;
		for (i = 0; i < len; i++) {
			var button = _votePower.children[i];
			button.addEventListener('click', _percentClick);
		}
	};

	var _showUpvoteOptions = function() {
		_votePower.style.display = 'block';
		_votePower.style.left = isNaN(_upvoteButton.offsetLeft) ? _upvoteButton.offsetLeft : _upvoteButton.offsetLeft + 'px';
		_votePower.style.top = isNaN(_upvoteButton.offsetTop) ? _upvoteButton.offsetTop : _upvoteButton.offsetTop + 'px';
		_upvoteButton.disabled = true;
	};

	return {
		init: function(votePower, upvoteLoader, upvote) {
			_votePower = votePower;
			_upvoteLoader = upvoteLoader;
			_upvoteButton = upvote;
			_bind();
		},
		set: function(author, permlink) {
			_author = author;
			_permlink = permlink;
		},
	}
})();