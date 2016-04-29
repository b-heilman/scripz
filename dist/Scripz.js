var Scripz =
/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var _Scripz = __webpack_require__(1);

	var _Scripz2 = _interopRequireDefault(_Scripz);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	/*
	(function(){ 
		console.log( this );
		return this; 
	}())['Scripz'] = Scripz;
	*/

	module.exports = _Scripz2.default;

/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
		value: true
	});

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	var _Actions = __webpack_require__(2);

	var baseActions = _interopRequireWildcard(_Actions);

	function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	var Promise = __webpack_require__(4).Promise;

	var Scripz = function () {
		function Scripz(base) {
			_classCallCheck(this, Scripz);

			var memory = {},
			    actions;

			if (base instanceof Scripz) {
				base = base.getActions();
			}

			actions = Object.create(base || baseActions);

			actions.save = function (cmd, buffer) {
				memory[cmd.as] = buffer;
				return buffer;
			};

			actions.load = function (cmd) {
				return memory[cmd.from];
			};

			this.getActions = function () {
				return actions;
			};
		}

		_createClass(Scripz, [{
			key: 'run',
			value: function run(cmd, content) {
				var res,
				    action = this.getActions()[cmd.action];

				if (action) {
					res = action(cmd, content, this);
					if (cmd.clean) {
						res = content;
					}
				} else {
					console.log('Could not find action:' + cmd.action);
					// how to fail
				}

				return res;
			}

			/*
	  chain( cmd ){
	  	var e = this.eval.bind(this);
	  		function temp( cmd ){
	  		e( [cmd], true );
	  		return temp;
	  	}
	  		return temp(cmd);
	  }
	  */

		}, {
			key: 'eval',
			value: function _eval(actions, keepBuffer) {
				var res,
				    dis = this;

				this.buffer = keepBuffer ? this.buffer : null;

				function success(rtn) {
					dis.buffer = rtn;
					return dis.eval(actions, true);
				}

				function failure(error) {
					console.log(error);
				}

				try {
					while (res === undefined && actions.length) {
						res = this.run(actions.shift(), this.buffer);

						if (res.then) {
							// ok, a promise
							return res.then(success, failure);
						} else {
							// ok, linear
							this.buffer = res;
							res = undefined;
						}
					}
				} catch (ex) {
					console.log('failed eval:', ex);
				}

				return Promise.resolve(this.buffer);
			}
		}]);

		return Scripz;
	}();

	exports.default = Scripz;

/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	exports.select = select;
	exports.click = click;
	exports.highlightOn = highlightOn;
	exports.highlightOff = highlightOff;
	exports.sleep = sleep;
	exports.navigate = navigate;
	exports.series = series;
	exports.insert = insert;
	exports.value = value;
	exports.log = log;
	var triggerEvent = __webpack_require__(3),
	    Promise = __webpack_require__(4).Promise;

	function select(cmd, content) {
		var res;

		if (content) {
			res = [];
			content.forEach(function (element) {
				res = res.merge(element.querySelectorAll(cmd.selector));
			});
		} else {
			res = document.querySelectorAll(cmd.selector);
		}

		return res;
	}

	function click(cmd, content) {
		content.forEach(function (element) {
			triggerEvent(element, 'click');
		});

		return content;
	}

	function highlightOn(cmd, content) {
		content.forEach(function (element) {
			element.$className = element.className;
			element.className += cmd.className || 'highlight';
		});

		return content;
	}

	function highlightOff(cmd, content) {
		content.forEach(function (element) {
			if ('$className' in element) {
				element.className = element.$className || '';
			}
		});

		return content;
	}

	function sleep(cmd, content) {
		return new Promise(function (resolve) {
			setTimeout(function () {
				resolve(content);
			}, cmd.wait);
		});
	}

	function navigate(cmd, content) {
		return new Promise(function (resolve) {
			var i = 0;

			function makeCall() {
				if (i === content.length) {
					resolve(content);
				} else {
					window.location.hash = cmd.hash.replace(/@1/g, content[i]);

					i++;

					if (cmd.wait) {
						setTimeout(makeCall, cmd.wait);
					} else {
						makeCall();
					}
				}
			}

			makeCall();
		});
	}

	function series(cmd, content, scripz) {
		return new Promise(function (resolve) {
			var i = 0,
			    c = content.length,
			    t;

			function run() {
				if (i < c) {
					scripz.buffer = [content[i]];
					t = scripz.eval(cmd.actions.slice(0), true);

					i++;

					if (t.then) {
						t.then(run);
					} else {
						run();
					}
				} else {
					resolve(content);
				}
			}

			run();
		});
	}

	function insert(cmd) {
		return cmd.content;
	}

	function value(cmd, content) {
		var i,
		    c,
		    targ,
		    res = [];

		for (i = 0, c = content.length; i < c; i++) {
			targ = content[i];

			if (cmd.field) {
				res.push(targ[cmd.field]);
			} else if (targ.getAttribute) {
				res.push(targ.getAttribute(cmd.attribute || 'value'));
			} else if ('value' in targ) {
				res.push(targ.value);
			}
		}

		return res;
	}

	function log(cmd, content) {
		console.log(cmd.label, content);

		return content;
	}

/***/ },
/* 3 */
/***/ function(module, exports) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	exports.fireEvent = fireEvent;
	/**
	 * Fire an event handler to the specified node. Event handlers can detect that the event was fired programatically
	 * by testing for a 'synthetic=true' property on the event object
	 * @param {HTMLNode} node The node to fire the event handler on.
	 * @param {String} eventName The name of the event without the 'on' (e.g., 'focus')
	 */
	function fireEvent(node, eventName) {
	    // Make sure we use the ownerDocument from the provided node to avoid cross-window problems
	    var doc, event;

	    if (node.ownerDocument) {
	        doc = node.ownerDocument;
	    } else if (node.nodeType === 9) {
	        // the node may be the document itself, nodeType 9 = DOCUMENT_NODE
	        doc = node;
	    } else {
	        throw new Error('Invalid node passed to fireEvent: ' + node.id);
	    }

	    if (node.dispatchEvent) {
	        // Gecko-style approach (now the standard) takes more work
	        var eventClass = '';

	        // Different events have different event classes.
	        // If this switch statement can't map an eventName to an eventClass,
	        // the event firing is going to fail.
	        switch (eventName) {
	            case 'click': // Dispatching of 'click' appears to not work correctly in Safari. Use 'mousedown' or 'mouseup' instead.
	            case 'mousedown':
	            case 'mouseup':
	                eventClass = 'MouseEvents';
	                break;

	            case 'focus':
	            case 'change':
	            case 'blur':
	            case 'select':
	                eventClass = 'HTMLEvents';
	                break;

	            default:
	                throw 'fireEvent: Couldn\'t find an event class for event ' + eventName + '.';
	        }
	        event = doc.createEvent(eventClass);
	        event.initEvent(eventName, true, true); // All events created as bubbling and cancelable.

	        event.synthetic = true; // allow detection of synthetic events
	        // The second parameter says go ahead with the default action
	        node.dispatchEvent(event, true);
	    } else if (node.fireEvent) {
	        // IE-old school style
	        event = doc.createEventObject();
	        event.synthetic = true; // allow detection of synthetic events
	        node.fireEvent('on' + eventName, event);
	    }

	    return event; // maybe someone wants it
	}

/***/ },
/* 4 */
/***/ function(module, exports) {

	module.exports = ES6Promise;

/***/ }
/******/ ]);