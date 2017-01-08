function ready(fn) {
	if (document.readyState != 'loading'){
		fn();
	} else {
		document.addEventListener('DOMContentLoaded', fn);
	}
}

ready(function() {
	var steemContainer = document.querySelector('.steem-container');
	var steemTag = steemContainer.getAttribute('data-steemtag');
	console.log(steemTag);
});
