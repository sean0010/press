function ready(fn) {
	if (document.readyState != 'loading'){
		fn();
	} else {
		document.addEventListener('DOMContentLoaded', fn);
	}
}

var _hiddenInput = function(inputName, inputValue) {
	var el = document.createElement('input');
	//<input type="hidden" name="action" value="wpse10500" />
	el.setAttribute('type', 'hidden');
	el.setAttribute('name', 'ok' + inputName);
	el.setAttribute('value', inputValue);
	return el;
};

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

ready(function() {
	var _lastPost = {'permlink': '', 'author': ''};
	var button = document.querySelector('#getDisscussionsRecursively');
	var accumulate = document.querySelector('#accumulate');
	button.addEventListener('click', function() {
		button.setAttribute('disabled', true);

		var params = {
			"tag": "kr",
			"limit": 100
		};
		if (_lastPost.permlink !== '') {
			params.start_permlink = _lastPost.permlink;
			params.start_author = _lastPost.author;
		}
		steem.api.getDiscussionsByCreated(params, function(err, result) {
			if (err === null) {
				var i, len = result.length;
				var o = {a: []};
				for (i = 0; i < len; i++) {
					var discussion = result[i];
					if (discussion.permlink == _lastPost.permlink && discussion.author == _lastPost.author) {
						// skip, redundant post
						continue;
					}
					var v = countVotes(discussion.active_votes);
					var timestamp = Math.round((new Date(discussion.created)).getTime() / 1000);
					var record = {
						"t": discussion.title,
						"a": discussion.author,
						"p": discussion.permlink,
						"c": discussion.children,
						"u": v.up,
						"d": v.down,
						"cr": timestamp
					};
					o.a.push(record);
				}
				var stringified = JSON.stringify(o);
				var hiddenInput = _hiddenInput(discussion.id, stringified);
				accumulate.appendChild(hiddenInput);
			} else {
			}
		});
	});

});

