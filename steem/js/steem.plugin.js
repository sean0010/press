/**********
*	Library
***********/
function ready(fn) {
	if (document.readyState != 'loading'){
		fn();
	} else {
		document.addEventListener('DOMContentLoaded', fn);
	}
}
function createDiv(cssClass, textNode) {
	var el = document.createElement('div');
	el.classList.add(cssClass);
	el.textContent = textNode;
	return el;
}
function createTr(link, comment, author, vote, reward, created) {
	var tr = document.createElement('tr'); // 
	var td = document.createElement('td'); // title and commentCount
	var td1 = document.createElement('td'); // Author
	var td2 = document.createElement('td'); // Vote
	var td3 = document.createElement('td'); // Reward
	var td4 = document.createElement('td'); // Created
	td.appendChild(link);
	td.innerHTML = td.innerHTML + ' [' + comment + ']';
	td1.innerHTML = author;
	td2.innerHTML = vote;
	td3.innerHTML = reward;
	td4.innerHTML = created;
	tr.appendChild(td);
	tr.appendChild(td1);
	tr.appendChild(td2);
	tr.appendChild(td3);
	tr.appendChild(td4);
	return tr;
}
function createLink(title, url) {
	var el = document.createElement('a');
	el.textContent = title;
	el.href = url;
	return el;
}
function createVoteBtn(author, permlink) {
	var el = document.createElement('span');
	el.classList.add('sc-vote');
	el.setAttribute('data-author', author);
	el.setAttribute('data-permlink', permlink);
	return el;
}

Date.prototype.yyyymmdd = function() {
	var mm = this.getMonth() + 1; // getMonth() is zero-based
	var dd = this.getDate();
	return [this.getFullYear(), '-', (mm > 9 ? '' : '0') + mm, '-', (dd > 9 ? '' : '0') + dd].join('');
};

function getPayout(discussion) {
	var totalPendingPayout = parseFloat(discussion.total_pending_payout_value.split(' ')[0]);
	var totalPayoutValue = parseFloat(discussion.total_payout_value.split(' ')[0]);
	var result = totalPendingPayout + totalPayoutValue;
	result = '$' + result.toFixed(3);
	return result;
}

function renderPostsList(tag, limit) {
	var tbody = document.querySelector('tbody');
	var loader = document.querySelector('.loaderSpace');
	var more = document.querySelector('.steemContainer .more');

	var params = {
		"tag": tag,
		"limit": limit
	};
	if (lastPost.permlink !== '') {

		params.start_permlink = lastPost.permlink;
		params.start_author = lastPost.author;
	}
	loader.style.display = 'block';
	console.log("get_discussions_by_created", params);
	steem.api.getDiscussionsByCreated(params, function(err, result) {
		if (err === null) {
			var i, len = result.length;
			for (i = 0; i < len; i++) {
				var discussion = result[i];
				if (discussion.permlink == lastPost.permlink && discussion.author == lastPost.author) {
					console.log("CONTINUE");
					// skip, redundant post
					continue;
				}

				var link = createLink(discussion.title, '#' + discussion.permlink);
				var date = new Date(discussion.created);
				var payout = getPayout(discussion);
				var tr = createTr(link, discussion.children, discussion.author, discussion.net_votes, payout, date.yyyymmdd());
				tbody.appendChild(tr);

				if (i == len - 1) {
					lastPost.permlink = discussion.permlink;
					lastPost.author = discussion.author;
				}
			}
			loader.style.display = 'none';
			more.style.display = 'block';
			more.disabled = false;
		} else {
			console.log('ERROR:', err);
		}
	});
}

/**********
*	Constant
***********/
var perPage = 20;
var steemconnectApp = 'wp-steem-plugin-dev-gce';

/**********
*	DOM manipulation
***********/
var lastPost = {'permlink': '', 'author': ''};

ready(function() {
	var steemContainer = document.querySelector('.steemContainer');
	var steemTag = steemContainer.getAttribute('data-steemtag');
	var tagName = steemContainer.querySelector('.tagName');
	var discussions = steemContainer.querySelector('.discussions');
	var acc = steemContainer.querySelector('.steemAccount');
	var more = steemContainer.querySelector('.steemContainer .more');

	tagName.innerHTML = steemTag;

	renderPostsList(steemTag, perPage);
	
	// Draw login
	steemconnect.init({
		app: steemconnectApp,
		callbackURL: window.location.href
	});
	var isAuth = false;
	var loginURL = steemconnect.getLoginURL();
	steemconnect.isAuthenticated(function(err, result) {
		if (!err && result.isAuthenticated) {
			isAuth = true;
			var username = result.username;
			var accBtn = createLink(username, '#');
			var createPostBtn = createLink('Submit a Story', '#');
			acc.appendChild(createPostBtn);
			acc.appendChild(accBtn);
		} else {
			var loginBtn = createLink('Login', loginURL);
			acc.appendChild(loginBtn);
		}
	});

	more.addEventListener('click', function() {
		more.style.display = 'block';
		more.disabled = true;
		renderPostsList(steemTag, perPage);
	});
});
