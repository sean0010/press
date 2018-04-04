var Tag = (function() {
	var _inputTextField; // input.postTags
	var _keyEvent;

	var _validate = function() {
		var sanitised = _.lowerCase(_inputTextField.value);
		sanitised.replace(',','');
		_inputTextField.value = sanitised;
	};

	var _bind = function() {
		_inputTextField.addEventListener('keyup', function(e) {
			_keyEvent(e);
		});
		_inputTextField.addEventListener('paste', function(e) {
			_keyEvent(e);
		});

		var _keyEvent = Helper.debounce(function() {
		//	_validate();
			console.log('debounced tag', _inputTextField.value);
		}, 400);
	};

	var _limitedTags = function() {
		if (Config.isGazua) {
			//console.log('Gazua!');
			_inputTextField.setAttribute('readonly', 'readonly');
			_inputTextField.style.border = 'none';
		} else {
			//console.log('Plain Steemeasy');
		}
	};


	return {
		init: function(inputTextField) {
			_inputTextField = inputTextField;
			_bind();
			_limitedTags();
		},
		tags: function() {
			if (_inputTextField.value === '') {
				return null;
			}
			var result = _inputTextField.value.split(' ');
			var index = result.indexOf(Config.steemTag);
			if (index !== -1) {
				result = result.splice(index, 1);
			}
			return result;
		}
	};
})();
