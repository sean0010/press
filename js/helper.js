var Helper = (function() {
	var escapeRegExp = function(str) {
		return str.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, '\\$1');
	};

	var replaceAll = function(str, find, replace) {
		return str.replace(new RegExp(escapeRegExp(find), 'g'), replace);
	};

	var linkify = function(content) {
		// hashtag
		content = content.replace(/(^|\s)(#[-a-z\d]+)/ig, (tag) => {
			if (/#[\d]+$/.test(tag)) return tag; // Don't allow numbers to be tags
			const space = /^\s/.test(tag) ? tag[0] : '';
			const tag2 = tag.trim().substring(1);
			const tagLower = tag2.toLowerCase();
			return `${space}<a href="/created/${tagLower}">${tag}</a>`;
		});

		return content;
	};

	var convertMedia = function(html) {
		var pattern1 = /(?:http?s?:\/\/)?(?:www\.)?(?:vimeo\.com)\/?(.+)/g;
		var pattern2 = /(?:http?s?:\/\/)?(?:www\.)?(?:youtube\.com|youtu\.be)\/(?:watch\?v=)?(.+)/g;

		if (pattern1.test(html)) {
			var replacement = '<div style="position:relative;height:0;padding-bottom:56.2%"><iframe width="640" height="360" src="//player.vimeo.com/video/$1" frameborder="0" webkitallowfullscreen mozallowfullscreen allowfullscreen></iframe></div>';
			var html = html.replace(pattern1, replacement);
		}

		if (pattern2.test(html)) {
			var replacement = '<div style="position:relative;height:0;padding-bottom:56.2%"><iframe width="640" height="360" src="//www.youtube.com/embed/$1" frameborder="0" style="position:absolute;width:100%;height:100%;left:0" allowfullscreen></iframe></div>';
			var html = html.replace(pattern2, replacement);
		}

		return html;
	};

	var remarkable = new Remarkable({
		html: true, // remarkable renders first then sanitize runs...
		breaks: true,
		linkify: false, // linkify is done locally
		typographer: false, // https://github.com/jonschlinkert/remarkable/issues/142#issuecomment-221546793
		quotes: '“”‘’'
	});

	const imageRegex = /https?:\/\/(?:[-a-zA-Z0-9._]*[-a-zA-Z0-9])(?::\d{2,5})?(?:[/?#](?:[^\s"'<>\][()]*[^\s"'<>\][().,])?(?:(?:\.(?:tiff?|jpe?g|gif|png|svg|ico)|ipfs\/[a-z\d]{40,})))/ig;


	return {
		/**
		* https://github.com/steemit/steemit.com/blob/47fd0e0846bd8c7c941ee4f95d5f971d3dc3981d/app/utils/ParsersAndFormatters.js
		*/
		isDeclinePayout: function(discussion) {
			var maxPayout = parseFloat(String(discussion.max_accepted_payout).replace(/\s[A-Z]*$/, ''));
			if (maxPayout == 0) {
				return true;
			} else {
				return false;
			}
		},
		getPayout: function(discussion) {
			var totalPendingPayout = parseFloat(discussion.total_pending_payout_value.split(' ')[0]);
			var totalPayoutValue = parseFloat(discussion.total_payout_value.split(' ')[0]);
			var result = totalPendingPayout + totalPayoutValue;
			result = '$' + result.toFixed(3);
			return result;
		},
		debounce: function(func, wait, immediate) {
			var timeout;
			return function() {
				var context = this, args = arguments;
				var later = function() {
					timeout = null;
					if (!immediate) func.apply(context, args);
				};
				var callNow = immediate && !timeout;
				clearTimeout(timeout);
				timeout = setTimeout(later, wait);
				if (callNow) func.apply(context, args);
			};
		},

		countVotes: function(votes) {
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
		},

		kebabCase: function(string) {
			return string.replace(/\s+/g, '-').toLowerCase();
		},

		markdown2html: function(markdown) {
			var jsonMetadata = {};
			jsonMetadata.image = jsonMetadata.image || [];

			markdown = markdown.replace(/<!--([\s\S]+?)(-->|$)/g, '(html comment removed: $1)');

			markdown.replace(imageRegex, function(img) {
				if (_.filter(jsonMetadata.image, i => i.indexOf(img) !== -1).length === 0) {
					jsonMetadata.image.push(img);
				}
			});

			markdown = convertMedia(markdown);
			markdown = remarkable.render(markdown);
			markdown = linkify(markdown);

			if (_.has(jsonMetadata, 'image[0]')) {
				jsonMetadata.image.forEach(function(image) {
					var newUrl = image;
					if (/^\/\//.test(image)) { newUrl = `https:${image}`; }

					markdown = replaceAll(markdown, `<a href="${image}">${image}</a>`, `<img src="${newUrl}">`);
					// not in img tag
					if (markdown.search(`<img[^>]+src=["']${escapeRegExp(image)}["']`) === -1) {
						markdown = replaceAll(markdown, image, `<img src="${newUrl}">`);
					}
				});
			}

			markdown.replace(/<img[^>]+src="([^">]+)"/ig, function(img, ...rest) {
				if (rest.length && rest[0] && rest[0].indexOf('https://steemitimages.com/0x0/') !== 0) {
					const newUrl = `https://steemitimages.com/0x0/${rest[0]}`;
					markdown = replaceAll(markdown, rest[0], newUrl);
				}
			});

			return markdown;
		},
		formatReward: function(reward, decimalPlace) {
			if (decimalPlace == undefined) decimalPlace = 2;
			var arr = reward.split(' ');
			var sbd = parseFloat(arr[0]).toFixed(decimalPlace);
			return '$' + sbd.toString();
		}
	}
})();

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

Date.prototype.yyyymmdd = function() {
	var mm = this.getMonth() + 1; // getMonth() is zero-based
	var dd = this.getDate();
	return [this.getFullYear(), '-', (mm > 9 ? '' : '0') + mm, '-', (dd > 9 ? '' : '0') + dd].join('');
};
Date.prototype.mmdd = function() {
	var mm = this.getMonth() + 1; // getMonth() is zero-based
	var dd = this.getDate();
	return [(mm > 9 ? '' : '0') + mm, '-', (dd > 9 ? '' : '0') + dd].join('');
};

Date.prototype.datetime = function() {
	var mm = this.getMonth() + 1; // getMonth() is zero-based
	var dd = this.getDate();
	var hour = this.getHours(); if (hour < 9) { hour = "0" + hour; }
	var minute = this.getMinutes(); if (minute < 9) { minute = "0" + minute; }
	var second = this.getSeconds(); if (second < 9) { second = "0" + second; }

	return [this.getFullYear(), '-', (mm > 9 ? '' : '0') + mm, '-', (dd > 9 ? '' : '0') + dd, ' ', hour, ':', minute, ':', second].join('');
};
