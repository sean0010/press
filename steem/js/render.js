var Render = (function() {
	/* Private */
	var _div = function(cssClass, textNode) {
		var el = document.createElement('div');
		el.classList.add(cssClass);
		el.textContent = textNode;
		return el;
	};

	/* Public */
	return {
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