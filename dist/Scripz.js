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

	var Promise = __webpack_require__(14).Promise;

	var Scripz = function () {
		function Scripz(subs) {
			_classCallCheck(this, Scripz);

			var dis = this,
			    memory = {},
			    series = subs ? Object.create(subs) : {},
			    actions = Object.create(baseActions);

			actions.save = function (cmd, buffer) {
				memory[cmd.as] = buffer;
				return buffer;
			};

			actions.load = function (cmd) {
				return memory[cmd.from];
			};

			actions.series = function (cmd, content) {
				return new Promise(function (resolve) {
					var t,
					    i = 0,
					    c = content.length;

					function run() {
						if (i < c) {
							if (cmd.actions) {
								t = dis.eval(cmd.actions.slice(0), [content[i]]);
							} else {
								t = dis.eval(series[cmd.name].slice(0), [content[i]]);
							}

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

					if (cmd.actions && cmd.name) {
						series[cmd.name] = cmd.actions;
						resolve(content);
					} else {
						run();
					}
				});
			};

			actions.loop = function (cmd, content) {
				return new Promise(function (resolve) {
					var i = -1;

					function run() {
						i++;

						if (i < cmd.limit) {
							return actions.series(cmd, content).then(function () {
								if (cmd.wait) {
									setTimeout(run, cmd.wait);
								} else {
									run();
								}
							});
						} else {
							resolve(content);
						}
					}

					run();
				});
			};

			this.addAction = function (name, action) {
				actions[name] = action;
			};

			this.run = function (cmd, content) {
				var action = actions[cmd.action];

				if (action) {
					return action(cmd, content, this);
				} else {
					throw new Error('Could not find action:' + cmd.action);
				}
			};

			this.kill = function () {
				this._priority = function () {
					throw new Error('ending series');
				};
			};

			var unpause;
			this.pause = function () {
				var waiting = new Promise(function (resolve) {
					unpause = resolve;
				});

				this._priority = function () {
					return waiting;
				};

				return function resume() {
					dis._priority = null;
					if (unpause) {
						unpause();
					}
				};
			};
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

		_createClass(Scripz, [{
			key: 'eval',
			value: function _eval(actionPath, buffer) {
				var res,
				    dis = this;

				if (!buffer) {
					buffer = [];
				}

				function success(rtn) {
					if (rtn) {
						buffer = rtn;
					}
					return dis.eval(actionPath, buffer);
				}

				function failure(error) {
					console.log(error);

					while (actionPath.length) {
						actionPath.pop();
					}

					return Promise.reject(error);
				}

				try {
					while (res === undefined && actionPath.length) {
						if (this._priority) {
							res = this._priority();
						} else {
							res = this.run(actionPath.shift(), buffer);
						}

						if (res.then) {
							// ok, a promise
							return res.then(success, failure);
						} else {
							// ok, linear
							buffer = res;
							res = undefined;
						}
					}
				} catch (ex) {
					return failure(ex);
				}

				return Promise.resolve(buffer);
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
	exports.event = event;
	exports.addClass = addClass;
	exports.removeClass = removeClass;
	exports.sleep = sleep;
	exports.log = log;
	exports.navigate = navigate;
	exports.insert = insert;
	exports.value = value;
	exports.run = run;
	exports.filter = filter;
	exports.sort = sort;
	exports.limit = limit;
	exports.permutate = permutate;
	var bmoor = __webpack_require__(3),
	    Promise = __webpack_require__(14).Promise;

	function select(cmd, content) {
		var res;

		if (content && content.length) {
			res = [];
			content.forEach(function (element) {
				res = res.merge(element.querySelectorAll(cmd.selector));
			});
		} else {
			res = document.querySelectorAll(cmd.selector);
		}

		return res;
	}

	function event(cmd, content) {
		content.forEach(function (element) {
			bmoor.dom.triggerEvent(element, cmd.eventType);
		});

		return content;
	}

	function addClass(cmd, content) {
		cmd.className.split(' ').forEach(function (className) {
			content.forEach(function (element) {
				bmoor.dom.addClass(element, className);
			});
		});

		return content;
	}

	function removeClass(cmd, content) {
		cmd.className.split(' ').forEach(function (className) {
			content.forEach(function (element) {
				bmoor.dom.removeClass(element, className);
			});
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

	function doVariable(lines) {
		var t, getter, line, dex, fn;

		if (!lines.length) {
			return function () {
				return '';
			};
		} else {
			line = lines.shift();
			dex = line.indexOf('}}');
			fn = doVariable(lines);

			if (dex === -1) {
				return function () {
					return '--no close--';
				};
			} else if (dex === 0) {
				return function (obj) {
					return obj + fn(obj);
				};
			} else {
				t = line.substr(0, dex);
				getter = bmoor.makeGetter(t);
				line = line.substr(dex + 2);
				return function (obj) {
					return getter(obj) + line + fn(obj);
				};
			}
		}
	}

	function getFormatter(str) {
		var fn,
		    lines = str.split(/{{/g);

		if (lines.length > 1) {
			str = lines.shift();
			fn = doVariable(lines);

			return function (obj) {
				return str + fn(obj);
			};
		} else {
			return function () {
				return str;
			};
		}
	}

	function log(cmd, content) {
		var fn;

		if (cmd.content) {
			fn = getFormatter(cmd.content);

			content.forEach(function (c) {
				console.log(cmd.label, fn(c));
			});
		} else {
			console.log(cmd.label, content);
		}

		return content;
	}

	function navigate(cmd, content) {
		return new Promise(function (resolve) {
			var i = 0,
			    formatter = getFormatter(cmd.hash);

			function makeCall() {
				if (i === content.length) {
					resolve(content);
				} else {
					window.location.hash = formatter(content[i]);

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

	function run(cmd, collection) {
		var res = [];

		collection.forEach(function (datum) {
			res.push(datum[cmd.method]());
		});

		return Promise.all(res);
	}

	function filter(cmd, collection) {
		var fn = bmoor.makeGetter(cmd.field);

		return collection.filter(function (datum) {
			return fn(datum);
		});
	}

	function sort(cmd, collection) {
		var fn = bmoor.makeGetter(cmd.field);

		return collection.sort(function (a, b) {
			a = fn(a);
			b = fn(b);

			if (a < b) {
				return -1;
			} else if (a > b) {
				return 1;
			} else {
				return 0;
			}
		});
	}

	function limit(cmd, content) {
		var start = parseInt(cmd.start, 10),
		    limit = parseInt(cmd.limit, 10);

		if (start) {
			return content.slice(start, start + limit);
		} else {
			return content.slice(0, limit);
		}
	}

	function permutate(cmd, collection) {
		var fns = {},
		    res = [];

		Object.keys(cmd).forEach(function (key) {
			if (key !== 'action') {
				fns[key] = bmoor.makeLoader(cmd[key]);
			}
		});

		collection.forEach(function (datum) {
			var child = [];

			Object.keys(fns).forEach(function (key) {
				var t = [],
				    fn = fns[key],
				    values = fn(datum);

				if (child.length) {
					child.forEach(function (p) {
						values.forEach(function (v) {
							var proto = Object.create(p);
							proto[key] = v;
							t.push(proto);
						});
					});
				} else {
					values.forEach(function (v) {
						var proto = {};
						proto[key] = v;
						t.push(proto);
					});
				}

				child = t;
			});

			res = res.concat(child);
		});

		return res;
	}

/***/ },
/* 3 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var bmoor = Object.create(__webpack_require__(4));

	bmoor.dom = __webpack_require__(5);
	bmoor.data = __webpack_require__(6);
	bmoor.array = __webpack_require__(7);
	bmoor.object = __webpack_require__(8);
	bmoor.build = __webpack_require__(9);
	bmoor.string = __webpack_require__(13);

	module.exports = bmoor;

/***/ },
/* 4 */
/***/ function(module, exports) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
		value: true
	});

	var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

	exports.isUndefined = isUndefined;
	exports.isDefined = isDefined;
	exports.isString = isString;
	exports.isNumber = isNumber;
	exports.isFunction = isFunction;
	exports.isObject = isObject;
	exports.isBoolean = isBoolean;
	exports.isArrayLike = isArrayLike;
	exports.isArray = isArray;
	exports.isEmpty = isEmpty;
	exports.set = set;
	exports.makeSetter = makeSetter;
	exports.get = get;
	exports.makeGetter = makeGetter;
	exports.load = load;
	exports.makeLoader = makeLoader;
	exports.del = del;
	exports.loop = loop;
	exports.each = each;
	exports.iterate = iterate;
	exports.safe = safe;
	exports.naked = naked;
	/**
	 * Library Functions
	 **/
	/**
	 * Tests if the value is undefined
	 *
	 * @function isUndefined
	 * @namespace bMoor
	 * @param {something} value The variable to test
	 * @return {boolean}
	 **/
	function isUndefined(value) {
		return value === undefined;
	}

	/**
	 * Tests if the value is not undefined
	 *
	 * @function isDefined
	 * @namespace bMoor
	 * @param {something} value The variable to test
	 * @return {boolean}
	 **/
	function isDefined(value) {
		return value !== undefined;
	}

	/**
	 * Tests if the value is a string
	 *
	 * @function isString
	 * @namespace bMoor
	 * @param {something} value The variable to test
	 * @return {boolean}
	 **/
	function isString(value) {
		return typeof value === 'string';
	}

	/**
	 * Tests if the value is numeric
	 *
	 * @function isNumber
	 * @namespace bMoor
	 * @param {something} value The variable to test
	 * @return {boolean}
	 **/
	function isNumber(value) {
		return typeof value === 'number';
	}

	/**
	 * Tests if the value is a function
	 *
	 * @function isFuncion
	 * @namespace bMoor
	 * @param {something} value The variable to test
	 * @return {boolean}
	 **/
	function isFunction(value) {
		return typeof value === 'function';
	}

	/**
	 * Tests if the value is an object
	 *
	 * @function isObject
	 * @namespace bMoor
	 * @param {something} value The variable to test
	 * @return {boolean}
	 **/
	function isObject(value) {
		return value && (typeof value === 'undefined' ? 'undefined' : _typeof(value)) === 'object';
	}

	/**
	 * Tests if the value is a boolean
	 *
	 * @function isBoolean
	 * @namespace bMoor
	 * @param {something} value The variable to test
	 * @return {boolean}
	 **/
	function isBoolean(value) {
		return typeof value === 'boolean';
	}

	/**
	 * Tests if the value can be used as an array
	 *
	 * @function isArrayLike
	 * @namespace bMoor
	 * @param {something} value The variable to test
	 * @return {boolean}
	 **/
	function isArrayLike(value) {
		// for me, if you have a length, I'm assuming you're array like, might change
		if (value) {
			return isObject(value) && (value.length === 0 || 0 in value && value.length - 1 in value);
		} else {
			return false;
		}
	}

	/**
	 * Tests if the value is an array
	 *
	 * @function isArray
	 * @namespace bMoor
	 * @param {something} value The variable to test
	 * @return {boolean}
	 **/
	function isArray(value) {
		return value instanceof Array;
	}

	/**
	 * Tests if the value has no content.
	 * If an object, has no own properties.
	 * If array, has length == 0.
	 * If other, is not defined
	 *
	 * @function isEmpty
	 * @namespace bMoor
	 * @param {something} value The variable to test
	 * @return {boolean}
	 **/
	function isEmpty(value) {
		var key;

		if (isObject(value)) {
			for (key in value) {
				if (value.hasOwnProperty(key)) {
					return false;
				}
			}
		} else if (isArrayLike(value)) {
			return value.length === 0;
		} else {
			return isUndefined(value);
		}

		return true;
	}

	function parse(space) {
		if (!space) {
			return [];
		} else if (isString(space)) {
			return space.split('.'); // turn strings into an array
		} else if (isArray(space)) {
				return space.slice(0);
			} else {
				return space;
			}
	}

	/**
	 * Sets a value to a namespace, returns the old value
	 *
	 * @function set
	 * @namespace bMoor
	 * @param {object} root The root of the namespace, bMoor.namespace.root if not defined
	 * @param {string|array} space The namespace
	 * @param {something} value The value to set the namespace to
	 * @return {something}
	 **/
	function set(root, space, value) {
		var i,
		    c,
		    old,
		    val,
		    nextSpace,
		    curSpace = root;

		if (isString(space)) {
			space = space.split('.');

			val = space.pop();

			for (i = 0, c = space.length; i < c; i++) {
				nextSpace = space[i];

				if (isUndefined(curSpace[nextSpace])) {
					curSpace[nextSpace] = {};
				}

				curSpace = curSpace[nextSpace];
			}

			old = curSpace[val];
			curSpace[val] = value;
		}

		return old;
	}

	function _makeSetter(property, next) {
		if (next) {
			return function (ctx, value) {
				var t = ctx[property];

				if (!t) {
					t = ctx[property] = {};
				}

				return next(t, value);
			};
		} else {
			return function (ctx, value) {
				var t = ctx[property];
				ctx[property] = value;
				return t;
			};
		}
	}

	function makeSetter(space) {
		var i,
		    fn,
		    readings = space.split('.');

		for (i = readings.length - 1; i > -1; i--) {
			fn = _makeSetter(readings[i], fn);
		}

		return fn;
	}

	/**
	 * get a value from a namespace, if it doesn't exist, the path will be created
	 *
	 * @function get
	 * @namespace bMoor
	 * @param {object} root The root of the namespace, bMoor.namespace.root if not defined
	 * @param {string|array|function} space The namespace
	 * @return {array}
	 **/
	function get(root, space) {
		var i,
		    c,
		    curSpace = root,
		    nextSpace;

		if (isString(space)) {
			if (space.length) {
				space = space.split('.');

				for (i = 0, c = space.length; i < c; i++) {
					nextSpace = space[i];

					if (isUndefined(curSpace[nextSpace])) {
						return;
					}

					curSpace = curSpace[nextSpace];
				}
			}

			return curSpace;
		} else {
			throw new Error('unsupported type: ' + space);
		}
	}

	function _makeGetter(property, next) {
		if (next) {
			return function (obj) {
				try {
					return next(obj[property]);
				} catch (ex) {
					return undefined;
				}
			};
		} else {
			return function (obj) {
				try {
					return obj[property];
				} catch (ex) {
					return undefined;
				}
			};
		}
	}

	function makeGetter(space) {
		var i, fn;

		if (space.length) {
			space = space.split('.');

			for (i = space.length - 1; i > -1; i--) {
				fn = _makeGetter(space[i], fn);
			}
		} else {
			return function (obj) {
				return obj;
			};
		}

		return fn;
	}

	function load(root, space) {
		var i, c, arr, res;

		space = space.split('[]');
		if (space.length === 1) {
			return [get(root, space[0])];
		} else {
			arr = get(root, space[0]);
			res = [];

			if (arr) {
				for (i = 0, c = arr.length; i < c; i++) {
					res.push(get(arr[i], space[1]));
				}
			}

			return res;
		}
	}

	function makeLoader(space) {
		var getArray, getVariable;

		space = space.split('[]');

		if (space.length === 1) {
			return [makeGetter(space[0])];
		} else {
			getArray = makeGetter(space[0]);
			getVariable = makeGetter(space[1]);

			return function (obj) {
				var i,
				    c,
				    arr = getArray(obj),
				    res = [];

				if (arr) {
					for (i = 0, c = arr.length; i < c; i++) {
						res.push(getVariable(arr[i]));
					}
				}

				return res;
			};
		}
	}

	/**
	 * Delete a namespace, returns the old value
	 *
	 * @function del
	 * @namespace bMoor
	 * @param {object} root The root of the namespace, bMoor.namespace.root if not defined
	 * @param {string|array} space The namespace
	 * @return {something}
	 **/
	function del(root, space) {
		var old,
		    val,
		    nextSpace,
		    curSpace = root;

		if (space && (isString(space) || isArrayLike(space))) {
			space = parse(space);

			val = space.pop();

			for (var i = 0; i < space.length; i++) {
				nextSpace = space[i];

				if (isUndefined(curSpace[nextSpace])) {
					return;
				}

				curSpace = curSpace[nextSpace];
			}

			old = curSpace[val];
			delete curSpace[val];
		}

		return old;
	}

	/**
	 * Call a function against all elements of an array like object, from 0 to length.  
	 *
	 * @function loop
	 * @namespace bMoor
	 * @param {array} arr The array to iterate through
	 * @param {function} fn The function to call against each element
	 * @param {object} context The context to call each function against
	 **/
	function loop(arr, fn, context) {
		var i, c;

		if (!context) {
			context = arr;
		}

		for (i = 0, c = arr.length; i < c; ++i) {
			if (i in arr) {
				fn.call(context, arr[i], i, arr);
			}
		}
	}

	/**
	 * Call a function against all own properties of an object.  
	 *
	 * @function each
	 * @namespace bMoor
	 * @param {object} arr The object to iterate through
	 * @param {function} fn The function to call against each element
	 * @param {object} context The context to call each function against
	 **/
	function each(obj, fn, context) {
		var key;

		if (!context) {
			context = obj;
		}

		for (key in obj) {
			if (obj.hasOwnProperty(key)) {
				fn.call(context, obj[key], key, obj);
			}
		}
	}

	/**
	 * Call a function against all own properties of an object, skipping specific framework properties.
	 * In this framework, $ implies a system function, _ implies private, so skip _
	 *
	 * @function iterate
	 * @namespace bMoor
	 * @param {object} obj The object to iterate through
	 * @param {function} fn The function to call against each element
	 * @param {object} context The scope to call each function against
	 **/
	function iterate(obj, fn, context) {
		var key;

		if (!context) {
			context = obj;
		}

		for (key in obj) {
			if (obj.hasOwnProperty(key) && key.charAt(0) !== '_') {
				fn.call(context, obj[key], key, obj);
			}
		}
	}

	/**
	 * Call a function against all own properties of an object, skipping specific framework properties.
	 * In this framework, $ implies a system function, _ implies private, so skip both
	 *
	 * @function safe
	 * @namespace bMoor
	 * @param {object} obj The object to iterate through
	 * @param {function} fn The function to call against each element
	 * @param {object} scope The scope to call each function against
	 **/
	function safe(obj, fn, context) {
		var key;

		if (!context) {
			context = obj;
		}

		for (key in obj) {
			if (obj.hasOwnProperty(key) && key.charAt(0) !== '_' && key.charAt(0) !== '$') {
				fn.call(context, obj[key], key, obj);
			}
		}
	}

	function naked(obj, fn, context) {
		safe(obj, function (t, k, o) {
			if (!isFunction(t)) {
				fn.call(context, t, k, o);
			}
		});
	}

	/**
	 * Borrowed From Angular : I can't write it better
	 * ----------------------------------------
	 *
	 * Implementation Notes for non-IE browsers
	 * ----------------------------------------
	 * Assigning a URL to the href property of an anchor DOM node, even one attached to the DOM,
	 * results both in the normalizing and parsing of the URL.  Normalizing means that a relative
	 * URL will be resolved into an absolute URL in the context of the application document.
	 * Parsing means that the anchor node's host, hostname, protocol, port, pathname and related
	 * properties are all populated to reflect the normalized URL.  This approach has wide
	 * compatibility - Safari 1+, Mozilla 1+, Opera 7+,e etc.  See
	 * http://www.aptana.com/reference/html/api/HTMLAnchorElement.html
	 *
	 * Implementation Notes for IE
	 * ---------------------------
	 * IE >= 8 and <= 10 normalizes the URL when assigned to the anchor node similar to the other
	 * browsers.  However, the parsed components will not be set if the URL assigned did not specify
	 * them.  (e.g. if you assign a.href = 'foo', then a.protocol, a.host, etc. will be empty.)  We
	 * work around that by performing the parsing in a 2nd step by taking a previously normalized
	 * URL (e.g. by assigning to a.href) and assigning it a.href again.  This correctly populates the
	 * properties such as protocol, hostname, port, etc.
	 *
	 * IE7 does not normalize the URL when assigned to an anchor node.  (Apparently, it does, if one
	 * uses the inner HTML approach to assign the URL as part of an HTML snippet -
	 * http://stackoverflow.com/a/472729)  However, setting img[src] does normalize the URL.
	 * Unfortunately, setting img[src] to something like 'javascript:foo' on IE throws an exception.
	 * Since the primary usage for normalizing URLs is to sanitize such URLs, we can't use that
	 * method and IE < 8 is unsupported.
	 *
	 * References:
	 *   http://developer.mozilla.org/en-US/docs/Web/API/HTMLAnchorElement
	 *   http://www.aptana.com/reference/html/api/HTMLAnchorElement.html
	 *   http://url.spec.whatwg.org/#urlutils
	 *   https://github.com/angular/angular.js/pull/2902
	 *   http://james.padolsey.com/javascript/parsing-urls-with-the-dom/
	 *
	 * @function
	 * @param {string} url The URL to be parsed.
	 * @description Normalizes and parses a URL.
	 * @returns {object} Returns the normalized URL as a dictionary.
	 *
	 *   | member name   | Description |
	 *   |---------------|-------------|
	 *   | href          | A normalized version of the provided URL if it was not an absolute URL |
	 *   | protocol      | The protocol including the trailing colon                              |
	 *   | host          | The host and port (if the port is non-default) of the normalizedUrl    |
	 *   | search        | The search params, minus the question mark                             |
	 *   | hash          | The hash string, minus the hash symbol
	 *   | hostname      | The hostname
	 *   | port          | The port, without ':'
	 *   | pathname      | The pathname, beginning with '/'
	 *
	 */
	// TODO : Whhhhyyyy do I have this here?
	/*
	function urlResolve( url ) {
	var href = url,
		urlParsingNode = document.createElement('a');

	if (msie) {
		// Normalize before parse.  Refer Implementation Notes on why this is
		// done in two steps on IE.
		urlParsingNode.setAttribute('href', href);
		href = urlParsingNode.href;
	}

	urlParsingNode.setAttribute('href', href);

	// urlParsingNode provides the UrlUtils interface - http://url.spec.whatwg.org/#urlutils
	return {
		href: urlParsingNode.href,
		protocol: urlParsingNode.protocol ? urlParsingNode.protocol.replace(/:$/, '') : '',
		host: urlParsingNode.host,
		search: urlParsingNode.search ? urlParsingNode.search.replace(/^\?/, '') : '',
		hash: urlParsingNode.hash ? urlParsingNode.hash.replace(/^#/, '') : '',
		hostname: urlParsingNode.hostname,
		port: urlParsingNode.port,
		pathname: (urlParsingNode.pathname.charAt(0) === '/') ? 
			urlParsingNode.pathname : '/' + urlParsingNode.pathname
	};
	}
	*/

/***/ },
/* 5 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	exports.bringForward = bringForward;
	exports.addClass = addClass;
	exports.removeClass = removeClass;
	exports.triggerEvent = triggerEvent;
	var bmoor = __webpack_require__(4),
	    regex = {};

	function getReg(className) {
		var reg = regex[className];

		if (!reg) {
			reg = new RegExp('(?:^|\\s)' + className + '(?!\\S)');
			regex[className] = reg;
		}

		return reg;
	}

	function massage(elements) {
		if (!bmoor.isArrayLike(elements)) {
			elements = [elements];
		}

		return elements;
	}

	function bringForward(elements) {
		var i, c, node;

		elements = massage(elements);

		for (i = 0, c = elements.length; i < c; i++) {
			node = elements[i];

			if (node.parentNode) {
				node.parentNode.appendChild(node);
			}
		}
	}

	function addClass(elements, className) {
		var i,
		    c,
		    node,
		    baseClass,
		    reg = getReg(className);

		elements = massage(elements);

		for (i = 0, c = elements.length; i < c; i++) {
			node = elements[i];
			baseClass = node.getAttribute('class') || '';

			if (!baseClass.match(reg)) {
				node.setAttribute('class', baseClass + ' ' + className);
			}
		}
	}

	function removeClass(elements, className) {
		var i,
		    c,
		    node,
		    reg = getReg(className);

		elements = massage(elements);

		for (i = 0, c = elements.length; i < c; i++) {
			node = elements[i];
			node.setAttribute('class', (node.getAttribute('class') || '').replace(reg, ''));
		}
	}

	function triggerEvent(elements, eventName, eventData) {
		var i, c, doc, node, event, EventClass;

		elements = massage(elements);

		for (i = 0, c = elements.length; i < c; i++) {
			node = elements[i];

			// Make sure we use the ownerDocument from the provided node to avoid cross-window problems
			if (node.ownerDocument) {
				doc = node.ownerDocument;
			} else if (node.nodeType === 9) {
				// the node may be the document itself, nodeType 9 = DOCUMENT_NODE
				doc = node;
			} else if (typeof document !== 'undefined') {
				doc = document;
			} else {
				throw new Error('Invalid node passed to fireEvent: ' + node.id);
			}

			if (node.dispatchEvent) {
				try {
					// modern, except for IE still? https://developer.mozilla.org/en-US/docs/Web/API/Event
					// I ain't doing them all
					// slightly older style, give some backwards compatibility
					switch (eventName) {
						case 'click':
						case 'mousedown':
						case 'mouseup':
							EventClass = MouseEvent;
							break;

						case 'focus':
						case 'blur':
							EventClass = FocusEvent; // jshint ignore:line
							break;

						case 'change':
						case 'select':
							EventClass = UIEvent; // jshint ignore:line
							break;

						default:
							EventClass = CustomEvent;
					}

					if (!eventData) {
						eventData = { 'view': window, 'bubbles': true, 'cancelable': true };
					} else {
						if (eventData.bubbles === undefined) {
							eventData.bubbles = true;
						}
						if (eventData.cancelable === undefined) {
							eventData.cancelable = true;
						}
					}

					event = new EventClass(eventName, eventData);
				} catch (ex) {
					console.log('event trigger failing over');

					// slightly older style, give some backwards compatibility
					switch (eventName) {
						case 'click':
						case 'mousedown':
						case 'mouseup':
							EventClass = 'MouseEvents';
							break;

						case 'focus':
						case 'change':
						case 'blur':
						case 'select':
							EventClass = 'HTMLEvents';
							break;

						default:
							EventClass = 'CustomEvent';
					}
					event = doc.createEvent(EventClass);
					event.initEvent(eventName, true, true);
				}

				event.$synthetic = true; // allow detection of synthetic events

				node.dispatchEvent(event);
			} else if (node.fireEvent) {
				// IE-old school style
				event = doc.createEventObject();
				event.$synthetic = true; // allow detection of synthetic events
				node.fireEvent('on' + eventName, event);
			}
		}
	}

/***/ },
/* 6 */
/***/ function(module, exports) {

	"use strict";

	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	exports.setUid = setUid;
	exports.getUid = getUid;
	var _id = 0;

	function nextUid() {
		return ++_id;
	}

	function setUid(obj) {
		var t = obj.$$bmoorUid;

		if (!t) {
			t = obj.$$bmoorUid = nextUid();
		}

		return t;
	}

	function getUid(obj) {
		if (!obj.$$bmoorUid) {
			setUid(obj);
		}

		return obj.$$bmoorUid;
	}

/***/ },
/* 7 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	exports.indexOf = indexOf;
	exports.remove = remove;
	exports.removeAll = removeAll;
	exports.bisect = bisect;
	exports.filter = filter;
	exports.compare = compare;
	var bmoor = __webpack_require__(4);

	/**
	 * Search an array for an element, starting at the begining or a specified location
	 *
	 * @function indexOf
	 * @namespace bMoor
	 * @param {array} arr An array to be searched
	 * @param {something} searchElement Content for which to be searched
	 * @param {integer} fromIndex The begining index from which to begin the search, defaults to 0
	 * @return {integer} -1 if not found, otherwise the location of the element
	 **/
	function indexOf(arr, searchElement, fromIndex) {
		if (arr.indexOf) {
			return arr.indexOf(searchElement, fromIndex);
		} else {
			var length = parseInt(arr.length, 0);

			fromIndex = +fromIndex || 0;

			if (Math.abs(fromIndex) === Infinity) {
				fromIndex = 0;
			}

			if (fromIndex < 0) {
				fromIndex += length;
				if (fromIndex < 0) {
					fromIndex = 0;
				}
			}

			for (; fromIndex < length; fromIndex++) {
				if (arr[fromIndex] === searchElement) {
					return fromIndex;
				}
			}

			return -1;
		}
	}

	/**
	 * Search an array for an element and remove it, starting at the begining or a specified location
	 *
	 * @function remove
	 * @namespace bMoor
	 * @param {array} arr An array to be searched
	 * @param {something} searchElement Content for which to be searched
	 * @param {integer} fromIndex The begining index from which to begin the search, defaults to 0
	 * @return {array} array containing removed element
	 **/
	function remove(arr, searchElement, fromIndex) {
		var pos = indexOf(arr, searchElement, fromIndex);

		if (pos > -1) {
			return arr.splice(pos, 1)[0];
		}
	}

	/**
	 * Search an array for an element and remove all instances of it, starting at the begining or a specified location
	 *
	 * @function remove
	 * @namespace bMoor
	 * @param {array} arr An array to be searched
	 * @param {something} searchElement Content for which to be searched
	 * @param {integer} fromIndex The begining index from which to begin the search, defaults to 0
	 * @return {integer} number of elements removed
	 **/
	function removeAll(arr, searchElement, fromIndex) {
		var r,
		    pos = indexOf(arr, searchElement, fromIndex);

		if (pos > -1) {
			r = removeAll(arr, searchElement, pos + 1);
			r.unshift(arr.splice(pos, 1)[0]);

			return r;
		} else {
			return [];
		}
	}

	function bisect(arr, value, func, preSorted) {
		var idx,
		    val,
		    bottom = 0,
		    top = arr.length - 1;

		if (!preSorted) {
			arr.sort(function (a, b) {
				return func(a) - func(b);
			});
		}

		if (func(arr[bottom]) >= value) {
			return {
				left: bottom,
				right: bottom
			};
		}

		if (func(arr[top]) <= value) {
			return {
				left: top,
				right: top
			};
		}

		if (arr.length) {
			while (top - bottom > 1) {
				idx = Math.floor((top + bottom) / 2);
				val = func(arr[idx]);

				if (val === value) {
					top = idx;
					bottom = idx;
				} else if (val > value) {
					top = idx;
				} else {
					bottom = idx;
				}
			}

			// if it is one of the end points, make it that point
			if (top !== idx && func(arr[top]) === value) {
				return {
					left: top,
					right: top
				};
			} else if (bottom !== idx && func(arr[bottom]) === value) {
				return {
					left: bottom,
					right: bottom
				};
			} else {
				return {
					left: bottom,
					right: top
				};
			}
		}
	}
	/**
	 * Generate a new array whose content is a subset of the intial array, but satisfies the supplied function
	 *
	 * @function remove
	 * @namespace bMoor
	 * @param {array} arr An array to be searched
	 * @param {something} searchElement Content for which to be searched
	 * @param {integer} fromIndex The begining index from which to begin the search, defaults to 0
	 * @return {integer} number of elements removed
	 **/
	function filter(arr, func, thisArg) {
		if (arr.filter) {
			return arr.filter(func, thisArg);
		} else {
			var i,
			    val,
			    t = Object(this),
			    // jshint ignore:line
			c = parseInt(t.length, 10),
			    res = [];

			if (!bmoor.isFunction(func)) {
				throw new Error('func needs to be a function');
			}

			for (i = 0; i < c; i++) {
				if (i in t) {
					val = t[i];

					if (func.call(thisArg, val, i, t)) {
						res.push(val);
					}
				}
			}

			return res;
		}
	}

	/**
	 * Compare two arrays, 
	 *
	 * @function remove
	 * @namespace bMoor
	 * @param {array} arr1 An array to be compared
	 * @param {array} arr2 An array to be compared
	 * @param {function} func The comparison function
	 * @return {object} an object containing the elements unique to the left, matched, and unqiue to the right
	 **/
	function compare(arr1, arr2, func) {
		var cmp,
		    left = [],
		    right = [],
		    leftI = [],
		    rightI = [];

		arr1 = arr1.slice(0);
		arr2 = arr2.slice(0);

		arr1.sort(func);
		arr2.sort(func);

		while (arr1.length > 0 && arr2.length > 0) {
			cmp = func(arr1[0], arr2[0]);

			if (cmp < 0) {
				left.push(arr1.shift());
			} else if (cmp > 0) {
				right.push(arr2.shift());
			} else {
				leftI.push(arr1.shift());
				rightI.push(arr2.shift());
			}
		}

		while (arr1.length) {
			left.push(arr1.shift());
		}

		while (arr2.length) {
			right.push(arr2.shift());
		}

		return {
			left: left,
			intersection: {
				left: leftI,
				right: rightI
			},
			right: right
		};
	}

/***/ },
/* 8 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
		value: true
	});

	var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

	exports.values = values;
	exports.keys = keys;
	exports.explode = explode;
	exports.mask = mask;
	exports.extend = extend;
	exports.empty = empty;
	exports.copy = copy;
	exports.merge = merge;
	exports.equals = equals;
	var bmoor = __webpack_require__(4);

	function values(obj) {
		var res = [];

		bmoor.naked(obj, function (v) {
			res.push(v);
		});

		return res;
	}

	function keys(obj) {
		var res = [];

		if (Object.keys) {
			return Object.keys(obj);
		} else {
			bmoor.naked(obj, function (v, key) {
				res.push(key);
			});

			return res;
		}
	}

	/**
	 * Takes a hash and uses the indexs as namespaces to add properties to an objs
	 *
	 * @function explode
	 * @namespace bMoor
	 * @param {object} target The object to map the variables onto
	 * @param {object} mappings An object orientended as [ namespace ] => value
	 * @return {object} The object that has had content mapped into it
	 **/
	function explode(target, mappings) {
		bmoor.iterate(mappings, function (val, mapping) {
			bmoor.set(target, mapping, val);
		});

		return target;
	}

	/**
	 * Create a new instance from an object and some arguments
	 *
	 * @function mask
	 * @namespace bMoor
	 * @param {function} obj The basis for the constructor
	 * @param {array} args The arguments to pass to the constructor
	 * @return {object} The new object that has been constructed
	 **/
	function mask(obj) {
		if (Object.create) {
			var T = function Masked() {};

			T.prototype = obj;

			return new T();
		} else {
			return Object.create(obj);
		}
	}

	/**
	 * Create a new instance from an object and some arguments.  This is a shallow copy to <- from[...]
	 * 
	 * @function extend
	 * @namespace bMoor
	 * @param {object} to Destination object.
	 * @param {...object} src Source object(s).
	 * @returns {object} Reference to `dst`.
	 **/
	function extend(to) {
		bmoor.loop(arguments, function (cpy) {
			if (cpy !== to) {
				if (to && to.extend) {
					to.extend(cpy);
				} else {
					bmoor.iterate(cpy, function (value, key) {
						to[key] = value;
					});
				}
			}
		});

		return to;
	}

	function empty(to) {
		bmoor.iterate(to, function (v, k) {
			delete to[k]; // TODO : would it be ok to set it to undefined?
		});
	}

	function copy(to) {
		empty(to);

		return extend.apply(undefined, arguments);
	}

	// Deep copy version of extend
	function merge(to) {
		var from,
		    i,
		    c,
		    m = function m(val, key) {
			to[key] = merge(to[key], val);
		};

		for (i = 1, c = arguments.length; i < c; i++) {
			from = arguments[i];

			if (to === from || !from) {
				continue;
			} else if (to && to.merge) {
				to.merge(from);
			} else if (!bmoor.isObject(to)) {
				if (bmoor.isObject(from)) {
					to = merge({}, from);
				} else {
					to = from;
				}
			} else {
				bmoor.safe(from, m);
			}
		}

		return to;
	}

	/*
	function arrayOverride( to, from, deep ){
		var i, c,
			f,
			t;

		if ( isArrayLike(to) && isArrayLike(from) ){
			to.length = from.length;
		}

		for( i = 0, c = from.length; i < c; i++ ){
			f = from[i];
			t = to[i];

			if ( t === undefined && !deep ){
				to[ i ] = f;
			} else if ( isArrayLike(f) ){
				if ( !isArrayLike(t) ){
					t = to[i] = [];
				}

				arrayOverride( t, f, deep );
			} else if ( isObject(f) ){
				if ( !isObject(t) ){
					t = to[i] = {};
				}

				override( t, f, deep );
			} else if ( f !== t ){
				to[ i ] = f;
			}
		}

		return to;
	}

	// will do a deep copy of to <- from[1], removing anything in to that isn't in from
	export function override( to, from, deep ){
		safe( from, function( f, key ){
			var t = to[ key ];

			if ( t === undefined && (!deep||f&&f.$constructor) ){
				to[ key ] = f;
			}else if ( isArrayLike(f) ){
				if ( !isArrayLike(t) ){
					t = to[ key ] = [];
				}

				arrayOverride( t, f, deep );
			}else if ( isObject(f) ){
				if ( !isObject(t) ){
					t = to[ key ] = {};
				}

				override( t, f, deep );
			}else if ( f !== t ){
				to[ key ] = f;
			}
		});

		// now we prune the 'to'
		safe( to, function( f, key){
			if ( from[key] === undefined ){
				delete to[key];
			}
		});

		return to;
	}
	*/

	/**
	 * A general comparison algorithm to test if two objects are equal
	 *
	 * @function equals
	 * @namespace bMoor
	 * @param {object} obj1 The object to copy the content from
	 * @param {object} obj2 The object into which to copy the content
	 * @preturns {boolean}
	 **/
	function equals(obj1, obj2) {
		var t1 = typeof obj1 === 'undefined' ? 'undefined' : _typeof(obj1),
		    t2 = typeof obj2 === 'undefined' ? 'undefined' : _typeof(obj2),
		    c,
		    i,
		    keyCheck;

		if (obj1 === obj2) {
			return true;
		} else if (obj1 !== obj1 && obj2 !== obj2) {
			return true; // silly NaN
		} else if (obj1 === null || obj1 === undefined || obj2 === null || obj2 === undefined) {
				return false; // undefined or null
			} else if (obj1.equals) {
					return obj1.equals(obj2);
				} else if (obj2.equals) {
					return obj2.equals(obj1); // because maybe somene wants a class to be able to equal a simple object
				} else if (t1 === t2) {
						if (t1 === 'object') {
							if (bmoor.isArrayLike(obj1)) {
								if (!bmoor.isArrayLike(obj2)) {
									return false;
								}

								if ((c = obj1.length) === obj2.length) {
									for (i = 0; i < c; i++) {
										if (!equals(obj1[i], obj2[i])) {
											return false;
										}
									}

									return true;
								}
							} else if (!bmoor.isArrayLike(obj2)) {
								keyCheck = {};
								for (i in obj1) {
									if (obj1.hasOwnProperty(i)) {
										if (!equals(obj1[i], obj2[i])) {
											return false;
										}

										keyCheck[i] = true;
									}
								}

								for (i in obj2) {
									if (obj2.hasOwnProperty(i)) {
										if (!keyCheck && obj2[i] !== undefined) {
											return false;
										}
									}
								}
							}
						}
					}

		return false;
	}

/***/ },
/* 9 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	module.exports = {
		mixin: __webpack_require__(10).default,
		decorate: __webpack_require__(11).default,
		plugin: __webpack_require__(12).default
	};

/***/ },
/* 10 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
		value: true
	});

	exports.default = function (to, from) {
		bmoor.iterate(from, function (val, key) {
			to[key] = val;
		});
	};

	var bmoor = __webpack_require__(4);

/***/ },
/* 11 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
		value: true
	});

	var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

	exports.default = function (to, from) {
		bmoor.iterate(from, function (val, key) {
			override(key, to, val);
		});
	};

	var bmoor = __webpack_require__(4);

	function override(key, target, action) {
		var old = target[key];

		if (old === undefined) {
			target[key] = action;
		} else {
			if (bmoor.isFunction(action)) {
				if (bmoor.isFunction(old)) {
					target[key] = function () {
						var backup = this.$old,
						    rtn;

						this.$old = old;

						rtn = action.apply(this, arguments);

						this.$old = backup;

						return rtn;
					};
				} else {
					console.log('attempting to decorate ' + key + ' an instance of ' + (typeof old === 'undefined' ? 'undefined' : _typeof(old)));
				}
			} else {
				console.log('attempting to decorate with ' + key + ' and instance of ' + (typeof action === 'undefined' ? 'undefined' : _typeof(action)));
			}
		}
	}

/***/ },
/* 12 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
		value: true
	});

	var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

	exports.default = function (to, from, ctx) {
		bmoor.iterate(from, function (val, key) {
			override(key, to, val, ctx);
		});
	};

	var bmoor = __webpack_require__(4);

	function override(key, target, action, plugin) {
		var old = target[key];

		if (old === undefined) {
			if (bmoor.isFunction(action)) {
				target[key] = function () {
					return action.apply(plugin, arguments);
				};
			} else {
				target[key] = action;
			}
		} else {
			if (bmoor.isFunction(action)) {
				if (bmoor.isFunction(old)) {
					target[key] = function () {
						var backup = plugin.$old,
						    reference = plugin.$target,
						    rtn;

						plugin.$target = target;
						plugin.$old = function () {
							return old.apply(target, arguments);
						};

						rtn = action.apply(plugin, arguments);

						plugin.$old = backup;
						plugin.$target = reference;

						return rtn;
					};
				} else {
					console.log('attempting to plug-n-play ' + key + ' an instance of ' + (typeof old === 'undefined' ? 'undefined' : _typeof(old)));
				}
			} else {
				console.log('attempting to plug-n-play with ' + key + ' and instance of ' + (typeof action === 'undefined' ? 'undefined' : _typeof(action)));
			}
		}
	}

/***/ },
/* 13 */
/***/ function(module, exports) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	exports.trim = trim;
	exports.ltrim = ltrim;
	exports.rtrim = rtrim;
	function trim(str, chr) {
		if (!chr) {
			chr = '\\s';
		}
		return str.replace(new RegExp('^' + chr + '+|' + chr + '+$', 'g'), '');
	}

	function ltrim(str, chr) {
		if (!chr) {
			chr = '\\s';
		}
		return str.replace(new RegExp('^' + chr + '+', 'g'), '');
	}

	function rtrim(str, chr) {
		if (!chr) {
			chr = '\\s';
		}
		return str.replace(new RegExp(chr + '+$', 'g'), '');
	}

/***/ },
/* 14 */
/***/ function(module, exports) {

	module.exports = ES6Promise;

/***/ }
/******/ ]);