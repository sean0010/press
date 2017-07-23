var Vote = (function() {
	var _author = '';
	var _permlink = '';
	var _upvoteButton, _upvoteText, _upvoteCount, _upvotePower, _upvoteUl, _upvoteInput, _upvoteAdd, _upvoteLoader;

	if (typeof(Storage) !== 'undefined') {
		var upvoteOptions = localStorage.getItem('UpvoteOptions');
		if (upvoteOptions == null) {
			localStorage.setItem('UpvoteOptions', JSON.stringify([1, 5, 10, 15, 20, 25, 30, 40, 50, 60, 70, 75, 80, 85, 90, 95, 100]));
		} else {
			console.log('local storage has value');
		}
	} else {
		console.log('Sorry! No Web Storage support..');
	}

	var _upvoteOptions = JSON.parse(localStorage.getItem('UpvoteOptions'));

	var _bind = function() {
		// Bind Upvote Button Click Event
		_upvoteButton.addEventListener('click', function() {
			if (window.isAuth) {
				if (_upvoteButton.classList.contains('voted')) {
					if (confirm('Cancel?')) {
						_upvoteButton.setAttribute('disabled', 'disabled');
						steemconnect.vote(username, _author, _permlink, 0, function(err, result) {
							console.log('Vote cancel result:', err, result);
							if (err === null) {
								_upvoteButton.removeAttribute('disabled');
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

		// Bind All Percent Click Event
		var i, len = _upvoteOptions.length;
		for (i = 0; i < len; i++) {
			var percent = _upvoteOptions[i];
			var option = Render.votePercentOption(percent);
			_upvoteUl.appendChild(option);
			_bindOption(option);
		}

		// Add Percent Option
		_upvoteAdd.addEventListener('click', function() {
			if (_validateUpvote(_upvoteInput)) {
				var percent = Math.round(_upvoteInput.value);
				if (_contains(_upvoteOptions, percent)) {
					alert('Redundant');
				} else {
					_upvoteOptions.push(percent);
					localStorage.setItem('UpvoteOptions', JSON.stringify(_upvoteOptions));

					var option = Render.votePercentOption(percent);
					_upvotePower.querySelector('ul').appendChild(option);
					_bindOption(option);

					_upvoteInput.value = '';
				}
			} else {
				alert("invalid");
			}
		});
	};

	var _contains = function(arr, val) {
		var result = false, i, len = arr.length;
		for (i = 0; i < len; i++) {
			if (arr[i] == val) {
				result = true;
				break;
			}
		}
		return result;
	};
	var _percentClick = function(percent, isUpvote) {
		var weight = parseFloat(percent) * 100;

		if (isUpvote) {
			_upvoteLoader.style.display = 'block';
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
				_upvoteButton.classList.remove('open');
				alert(err);
			}
			_upvoteLoader.style.display = 'none';
			_upvotePower.style.display = 'none';
		});
	};
	var _clearClick = function(clear) {
		var li = clear.parentNode;
		var btn = li.querySelector('.voteBtn');
		var percent = btn.getAttribute('data-percent');
		var i, idx, len = _upvoteOptions.length;

		for (i = 0; i < len; i++) {
			if (_upvoteOptions[i] == percent) {
				idx = i;
				break;
			}
		}
		_upvoteOptions.splice(idx, 1);
		localStorage.setItem('UpvoteOptions', JSON.stringify(_upvoteOptions));
		console.log(localStorage.getItem('UpvoteOptions'));
		
		li.parentNode.removeChild(li);
	};

	var _bindOption = function(el) {
		var vote = el.querySelector('.voteBtn');
		var clear = el.querySelector('.voteBtnClear');
		vote.addEventListener('click', function(e) {
			var percent = vote.getAttribute('data-percent');
			console.log('voted', percent);
			_percentClick(percent, true);
		});
		clear.addEventListener('click', function() {
			console.log('clear  this');
			_clearClick(clear);
		});
	};

	var _showUpvoteOptions = function() {
		if (_upvoteButton.classList.contains('open')) {
			_upvoteButton.classList.remove('open');
			_upvotePower.style.display = 'none';
		} else {
			_upvoteButton.classList.add('open');
			_upvotePower.style.display = 'block';
		}
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
	};

	var _validateUpvote = function(input) {
		var val = input.value
		if (isNaN(val)) {
			return false;
		} else {
			val = Number(val);
			if (val > 0 && val <= 100) {
				return true;
			} else {
				return false;
			}
		}
	};

	return {
		init: function(container) {
			_upvoteButton = container.querySelector('.upvote');
			_upvoteText = container.querySelector('.upvote .voteText');
			_upvoteCount = container.querySelector('.upvote .voteCount');
			_upvotePower = container.querySelector('.up.votePower');
			_upvoteUl = container.querySelector('.up ul');
			_upvoteInput = container.querySelector('.up .customPercentInput');
			_upvoteAdd = container.querySelector('.up .addVoteOption');
			_upvoteLoader = container.querySelector('.up .voteLoader');
			_bind();
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
		set: function(author, permlink, myUsername) {
			_author = author;
			_permlink = permlink;

			if (window.isAuth) {
				steem.api.getActiveVotes(_author, _permlink, function(err, result) {
					if (err === null) {
						var voted = Vote.hasVoted(result, myUsername);

						if (voted === 1) {
							_upvoteButton.classList.add('voted');
						} else if (voted === -1) {
							//_downvoteButton.classList.add('voted');
						}
					}
				});
			}
		},
		hideUpvoteOptions: function() {
			if (_upvoteButton.classList.contains('open')) {
				_upvoteButton.classList.remove('open');
				_upvotePower.style.display = 'none';
			}
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
	};
})();