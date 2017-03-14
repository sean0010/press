function ready(fn) {
	if (document.readyState != 'loading'){
		fn();
	} else {
		document.addEventListener('DOMContentLoaded', fn);
	}
}

ready(function() {
	var button = document.querySelector('#getDisscussionsRecursively');
	button.addEventListener('click', function() {
		button.setAttribute('disabled', true);

		var params = {
			"tag": "kr",
			"limit": 10
		};
		// if (_lastPost.permlink !== '') {
		// 	params.start_permlink = _lastPost.permlink;
		// 	params.start_author = _lastPost.author;
		// }
		steem.api.getDiscussionsByCreated(params, function(err, result) {
			if (err === null) {
				var i, len = result.length;
				for (i = 0; i < len; i++) {
					var discussion = result[i];
					console.log(discussion);
					// if (discussion.permlink == _lastPost.permlink && discussion.author == _lastPost.author) {
					// 	// skip, redundant post
					// 	continue;
					// }

					//var link = createLink(discussion.title, '#' + discussion.category + '/@' + discussion.author + '/' + discussion.permlink);
					//var date = new Date(discussion.created);

					// if (i == len - 1) {
					// 	_lastPost.permlink = discussion.permlink;
					// 	_lastPost.author = discussion.author;
					// }

					// var v = countVotes(discussion.active_votes);
					// posts[discussion.permlink] = {
					// 	title: discussion.title,
					// 	author: discussion.author,
					// 	created: discussion.created,
					// 	body: discussion.body,
					// 	upvotes: v.up,
					// 	downvotes: v.down
					// };
				}
			} else {
			}
		});
	});

});

