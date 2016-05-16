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

	var Scripz = __webpack_require__(1).default,
	    subs = {},
	    sc = new Scripz(subs);

	sc.debug = true;

	var resume;

	window.resume = function () {
		resume();
	};
	window.pause = function () {
		resume = sc.pause();
	};
	window.kill = function () {
		sc.kill();
	};

	sc.eval([{
		edit: 'select:element:option',
		action: 'log:element|navigate:blh/{{element.innerHTML}}/woot|sleep:1000'
	}]);

	sc.eval([{
		subs: {
			subloop: [{
				action: 'log:highlight:{{element.innerHTML}}|' + 'addClass:element:highlight|sleep:1000|' + 'removeClass:element:highlight|event:element:click'
			}]
		},
		edit: 'select:element:li',
		action: 'log:li-selected',
		save: 'memory'
	}, {
		reset: true,
		action: 'log:li-between'
	}, {
		load: 'memory',
		action: 'log:li-loaded'
	}, {
		action: 'loop:5:subloop:4000'
	}]);

	sc.eval([{
		fetch: 'insert:data:content',
		content: [{ a: [1, 2], b: [3, 4] }, { a: [5, 6], b: [7, 8] }]
	}, {
		trans: 'permutate',
		mappings: {
			field1: 'data.a[]',
			field2: 'data.b[]'
		},
		action: 'log:permutation-1'
	}, {
		action: 'sleep:10000'
	}, {
		action: 'navigate:permu/{{field1}}/{{field2}}|log:permutation-2:->{{field1}} =>{{field2}}|sleep:1000'
	}]);

/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
		value: true
	});

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	var _editors = __webpack_require__(2);

	var baseEdits = _interopRequireWildcard(_editors);

	var _actions2 = __webpack_require__(15);

	var baseActions = _interopRequireWildcard(_actions2);

	var _fetchers2 = __webpack_require__(21);

	var baseFetchers = _interopRequireWildcard(_fetchers2);

	var _transformations2 = __webpack_require__(22);

	var baseTransformations = _interopRequireWildcard(_transformations2);

	function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	var bmoor = __webpack_require__(3),
	    Promise = __webpack_require__(16).Promise;

	var Scripz = function () {
		function Scripz(scripts) {
			_classCallCheck(this, Scripz);

			var dis = this,
			    memory = {},
			    _scripts = scripts ? Object.create(scripts) : {},
			    _edits = Object.create(baseEdits),
			    // alter the array, return an array
			_fetchers = Object.create(baseFetchers),
			    // return promise, with data
			_actions = Object.create(baseActions),
			    // return promise, do some action
			_priority = null,
			    _transformations = Object.create(baseTransformations); // make inline changes to the array

			_actions.series = {
				factory: function factory(cmd, args, config) {
					var script = cmd.actions || _scripts[args[0] || cmd.name];

					return function (datum) {
						return dis.eval(script.slice(0), config, [datum]);
					};
				}
			};

			_actions.loop = {
				factory: function factory(cmd, args, config, actions) {
					// args => loop count, series name, wait time between loops
					var count = parseInt(args.shift() || cmd.limit, 10),
					    series = actions.series.factory(cmd, args, config),
					    wait = parseInt(args[1] || args.wait, 10);

					return function looper(collection) {
						var i, c;

						// TODO : why did I do this?
						if (!bmoor.isArrayLike(collection)) {
							collection = [collection];
						}

						i = 0;
						c = collection.length;

						function loop() {
							if (i < c) {
								return series(collection[i]).then(function () {
									i++;
									return loop();
								});
							} else {
								count--;
								if (count) {
									i = 0;
									if (wait) {
										return new Promise(function (resolve) {
											setTimeout(function () {
												resolve(loop());
											}, wait);
										});
									} else {
										return loop();
									}
								}
							}
						}

						return loop();
					};
				},
				bulk: true
			};

			this.addFetcher = function (name, fetcher) {
				_fetchers[name] = fetcher;
			};

			this.addEditor = function (name, edit) {
				_edits[name] = edit;
			};

			this.addTransformation = function (name, transformation) {
				_transformations[name] = transformation;
			};

			this.addAction = function (name, action) {
				_actions[name] = action;
			};

			this.setScripts = function (input) {
				_scripts = Object.create(input);
			};

			this.addScript = function (name, actionList) {
				_scripts[name] = actionList;
			};

			function combine(base, value, field, agg) {
				if (bmoor.isArrayLike(value)) {
					bmoor.loop(value, function (v) {
						var t = Object.create(base);

						t[field] = v;

						agg.push(t);
					});
				} else {
					base[field] = value;
					agg.push(base);
				}
			}

			function setupFetchers(event, config) {
				var args = event.split(':'),
				    method = args.shift(),
				    field = args.shift(),
				    fn = _fetchers[method];

				if (!field) {
					throw new Error('Fetchers require at least two arguments: ' + event);
				}

				if (fn) {
					return function (cmd, datum, agg) {
						return fn(cmd, args, datum, config).then(function (value) {
							combine(datum, value, field, agg);
						});
					};
				} else {
					throw new Error('Could not find loader: ' + event);
				}
			}

			// accept one datum, fetchers must always return arrays, even if just array of one
			function runFetchers(fetchers, command, content, config) {
				var i,
				    c,
				    fn = setupFetchers(fetchers.shift(), config),
				    req = [],
				    agg = [];

				for (i = 0, c = content.length; i < c; i++) {
					req.push(fn(command, content[i], agg));
				}

				return Promise.all(req).then(function () {
					if (fetchers.length) {
						return runFetchers(fetchers, command, agg, config);
					} else {
						return agg;
					}
				});
			}

			function doFetchers(command, content, config) {
				if (command.fetch) {
					// always being a new load of data with a fresh collection
					return runFetchers(command.fetch.split('|'), command, content, config);
				} else {
					// if no loading, don't make any changes
					return Promise.resolve(content);
				}
			}

			function setupTrans(event, config) {
				var args = event.split(':'),
				    name = args.shift(),
				    fn = _transformations[name];

				if (fn) {
					return function (cmd, datum) {
						return fn(cmd, args, datum, config);
					};
				} else {
					throw new Error('Could not find transformation: ' + event);
				}
			}

			// filters accept the full array, and return a full array
			function doTransformations(command, content, config) {
				var i, c, fn, transformations;

				if (command.trans) {
					transformations = command.trans.split('|');
					for (i = 0, c = transformations.length; i < c; i++) {
						fn = setupTrans(transformations[i], config);
						content = fn(command, content);
					}
				}

				return content;
			}

			// transformations accept a datum, and return a datum
			function setupEdit(event, config) {
				var args = event.split(':'),
				    method = args.shift(),
				    field = args.shift(),
				    fn = _edits[method];

				if (!field) {
					throw new Error('Edits require at least two arguments: ' + event);
				}

				if (fn) {
					return function (cmd, datum, agg) {
						combine(datum, fn(cmd, args, datum, config), field, agg);
					};
				} else {
					throw new Error('Could not find edit: ' + event);
				}
			}

			function doEdits(command, content, config) {
				var i, c, j, co, fn, agg, edits;

				if (command.edit) {
					edits = command.edit.split('|');
					for (i = 0, c = edits.length; i < c; i++) {
						fn = setupEdit(edits[i], config);
						agg = [];
						for (j = 0, co = content.length; j < co; j++) {
							fn(command, content[j], agg);
						}
						content = agg;
					}
				}

				return content;
			}

			function compileAction(def, command, args, config) {
				// I'm allowing actions to be defined two ways, as a factory function with attributes, or an object
				if (bmoor.isFunction(def)) {
					return def(command, args, config, _actions);
				} else {
					return def.factory(command, args, config, _actions);
				}
			}

			function compileActions(actions, command, config) {
				var bulk = [],
				    datum = [];

				actions.forEach(function (act) {
					var args = act.split(':'),
					    name = args.shift(),
					    action = _actions[name];

					if (action) {
						// actions will be run as bulk if they do not follow and datum types
						if (action.bulk && datum.length === 0) {
							bulk.push(compileAction(action, command, args, config));
						} else {
							datum.push(compileAction(action, command, args, config));
						}
					} else {
						throw new Error('Could not find: ' + name + ' from ' + JSON.stringify(command));
					}
				});

				return { bulk: bulk, datum: datum };
			}

			function nextAction(actions) {
				if (_priority) {
					return _priority;
				} else {
					return actions.shift();
				}
			}

			function runActionPath(actions, content) {
				var action = nextAction(actions);
				return Promise.resolve(action(content)).then(function () {
					if (actions.length) {
						return runActionPath(actions, content);
					}
				});
			}

			function runActions(actions, content, pos) {
				if (actions.bulk.length) {
					return runActionPath(actions.bulk, content).then(function () {
						return runActions(actions, content);
					});
				} else if (actions.datum.length) {
					pos = pos || 0;

					if (pos < content.length) {
						return runActionPath(actions.datum.slice(0), content[pos]).then(function () {
							return runActions(actions, content, pos + 1);
						});
					}
				}

				return Promise.resolve(); // all out of things to do
			}

			function doActions(command, content, config) {
				if (command.action) {
					return runActions(compileActions(command.action.split('|'), command, config), content);
				} else {
					return Promise.resolve();
				}
			}

			this.run = function (cmd, content, config) {
				if (cmd.subs) {
					Object.keys(cmd.subs).forEach(function (key) {
						_scripts[key] = cmd.subs[key];
					});
				}

				if (cmd.load) {
					content = memory[cmd.load];
					if (!content) {
						throw new Error('memory read miss');
					}
				} else if (cmd.set) {
					content = cmd.set;
				} else if (!content || cmd.reset) {
					content = [{}];
				}

				return doFetchers(cmd, content, config).then(function (res) {
					var buffer = doTransformations(cmd, doEdits(cmd, res, config), config);

					return doActions(cmd, buffer, config).then(function () {
						if (cmd.save) {
							memory[cmd.save] = buffer;
						}
						return buffer;
					});
				});
			};

			this.kill = function () {
				_priority = function (_priority2) {
					function _priority() {
						return _priority2.apply(this, arguments);
					}

					_priority.toString = function () {
						return _priority2.toString();
					};

					return _priority;
				}(function () {
					_priority = null;
					throw new Error('kill signal');
				});
			};

			var unpause;
			this.pause = function () {
				var waiting = new Promise(function (resolve) {
					unpause = resolve;
				});

				_priority = function _priority() {
					return waiting;
				};

				return function resume() {
					_priority = null;
					if (unpause) {
						unpause();
					}
				};
			};
		}

		_createClass(Scripz, [{
			key: 'eval',
			value: function _eval(commands, config, buffer) {
				var dis = this;

				function success(rtn) {
					if (commands.length) {
						return dis.eval(commands, config, rtn);
					} else {
						return rtn;
					}
				}

				function failure(error) {
					if (dis.debug) {
						console.log(error.message, error);
					} else {
						console.log('-- scripz failed --');
					}

					while (commands.length) {
						commands.pop();
					}

					return Promise.reject(error);
				}

				try {
					return this.run(commands.shift(), buffer, config).then(success, failure);
				} catch (ex) {
					return Promise.reject(ex);
				}
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
	exports.format = format;
	exports.attribute = attribute;
	var bmoor = __webpack_require__(3);

	function select(cmd, args, datum) {
		var node,
		    fn = bmoor.string.getFormatter(args[0] || cmd.selector),
		    base = args[1] || cmd.base;

		if (base) {
			node = datum[base];
		} else {
			node = document;
		}

		return node.querySelectorAll(fn(datum));
	}

	function format(cmd, args, datum) {
		var fn = bmoor.string.getFormatter(args[0] || cmd.format);

		return fn(datum);
	}

	function attribute(cmd, args, datum) {
		var element = args[0] || cmd.element,
		    field = args[1] || cmd.field;

		return datum[element].getAttribute(field);
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
	bmoor.promise = __webpack_require__(14);

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
	exports.exec = exec;
	exports.makeExec = makeExec;
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

	function exec(root, space, args, ctx) {
		var i,
		    c,
		    last,
		    nextSpace,
		    curSpace = root;

		if (isString(space)) {
			if (space.length) {
				space = space.split('.');

				for (i = 0, c = space.length; i < c; i++) {
					nextSpace = space[i];

					if (isUndefined(curSpace[nextSpace])) {
						return;
					}

					last = curSpace;
					curSpace = curSpace[nextSpace];
				}
			}

			if (curSpace) {
				return curSpace.apply(ctx || last, args || []);
			}
		}

		throw new Error('unsupported eval: ' + space);
	}

	function _makeExec(property, next) {
		if (next) {
			return function (obj, args, ctx) {
				try {
					return next(obj[property], args, ctx);
				} catch (ex) {
					return undefined;
				}
			};
		} else {
			return function (obj, args, ctx) {
				return obj[property].apply(ctx || obj, args || []);
			};
		}
	}

	function makeExec(space) {
		var i, fn;

		if (space.length) {
			space = space.split('.');

			fn = _makeExec(space[space.length - 1]);

			for (i = space.length - 2; i > -1; i--) {
				fn = _makeExec(space[i], fn);
			}
		} else {
			throw new Error('unsupported eval: ' + space);
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

		if (arr.forEach) {
			arr.forEach(fn, context);
		} else {
			for (i = 0, c = arr.length; i < c; ++i) {
				if (i in arr) {
					fn.call(context, arr[i], i, arr);
				}
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
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	exports.trim = trim;
	exports.ltrim = ltrim;
	exports.rtrim = rtrim;
	exports.getCommands = getCommands;
	exports.getFormatter = getFormatter;
	var bmoor = __webpack_require__(4);

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

	// TODO : eventually I will make getCommands and getFormatter more complicated, but for now
	//        they work by staying simple
	function getCommands(str) {
		var commands = str.split('|');

		commands.forEach(function (command, key) {
			var args = command.split(':');

			args.forEach(function (arg, k) {
				args[k] = trim(arg);
			});

			commands[key] = {
				command: command,
				method: args.shift(),
				args: args
			};
		});

		return commands;
	}

	function stackFunctions(newer, older) {
		return function (o) {
			return older(newer(o));
		};
	}

	var filters = {
		precision: function precision(dec) {
			dec = parseInt(dec, 10);

			return function (num) {
				return parseFloat(num, 10).toFixed(dec);
			};
		},
		currency: function currency() {
			return function (num) {
				return '$' + num;
			};
		}
	};

	function doFilters(ters) {
		var fn, command, filter;

		while (ters.length) {
			command = ters.pop();
			fn = filters[command.method].apply(null, command.args);

			if (filter) {
				filter = stackFunctions(fn, filter);
			} else {
				filter = fn;
			}
		}

		return filter;
	}

	function doVariable(lines) {
		var fn, dex, line, getter, commands, remainder;

		if (!lines.length) {
			return null;
		} else {
			line = lines.shift();
			dex = line.indexOf('}}');
			fn = doVariable(lines);

			if (dex === -1) {
				return function () {
					return '--no close--';
				};
			} else if (dex === 0) {
				remainder = line.substr(2);
				getter = function getter(o) {
					if (bmoor.isObject(o)) {
						return JSON.stringify(o);
					} else {
						return o;
					}
				};
			} else {
				commands = getCommands(line.substr(0, dex));
				remainder = line.substr(dex + 2);
				getter = bmoor.makeGetter(commands.shift().command);

				if (commands.length) {
					getter = stackFunctions(getter, doFilters(commands, getter));
				}
			}

			//let's optimize this a bit
			if (fn) {
				// we have a child method
				return function (obj) {
					return getter(obj) + remainder + fn(obj);
				};
			} else {
				// this is the last variable
				return function (obj) {
					return getter(obj) + remainder;
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
	getFormatter.filters = filters;

/***/ },
/* 14 */
/***/ function(module, exports) {

	"use strict";

	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	exports.always = always;
	function always(promise, func) {
		promise.then(func, func);
		return promise;
	}

/***/ },
/* 15 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	exports.sleep = sleep;
	exports.run = run;
	exports.hook = hook;
	var bmoor = __webpack_require__(3),
	    Promise = __webpack_require__(16).Promise;

	// factory accepts cmd, args, config
	var event = exports.event = {
		factory: function factory(cmd, args) {
			var element = args[0] || cmd.element,
			    eventType = args[1] || cmd.eventType;

			return function (datum) {
				bmoor.dom.triggerEvent(datum[element], eventType);
			};
		}
	};

	var addClass = exports.addClass = {
		factory: function factory(cmd, args) {
			var element = args[0] || cmd.element,
			    className = args[1] || cmd.className;

			return function (datum) {
				className.split(' ').forEach(function (className) {
					bmoor.dom.addClass(datum[element], className);
				});
			};
		}
	};

	var removeClass = exports.removeClass = {
		factory: function factory(cmd, args) {
			var element = args[0] || cmd.element,
			    className = args[1] || cmd.className;

			return function (datum) {
				className.split(' ').forEach(function (className) {
					bmoor.dom.removeClass(datum[element], className);
				});
			};
		}
	};

	var navigate = exports.navigate = {
		factory: function factory(cmd, args) {
			var formatter = bmoor.string.getFormatter(args[0] || cmd.hash);
			return function (datum) {
				window.location.hash = formatter(datum);
			};
		}
	};

	var log = exports.log = {
		factory: function factory(cmd, args) {
			var fn,
			    label = args[0] || cmd.label,
			    format = args[1] || cmd.format;

			if (format) {
				fn = bmoor.string.getFormatter(format);
			}

			return function (datum) {
				if (fn) {
					if (bmoor.isArrayLike(datum)) {
						bmoor.loop(datum, function (d) {
							console.log(label, fn(d));
						});
					} else {
						console.log(label, fn(datum));
					}
				} else {
					console.log(label, datum);
				}
			};
		},
		bulk: true
	};

	function sleep(cmd, args) {
		return function () {
			return new Promise(function (resolve) {
				setTimeout(function () {
					resolve();
				}, parseInt(args[0], 10));
			});
		};
	}
	sleep.bulk = true;

	function run(cmd, args) {
		var exec = bmoor.makeExec(args[0] || cmd.method),
		    subs = args.slice(1);
		return function (datum) {
			var res = exec(datum, subs);

			if (res && res.then) {
				return res;
			} else {
				return Promise.resolve();
			}
		};
	}

	function hook(cmd, args, config) {
		var method = args[0] || cmd.method;
		return function (datum) {
			var res = config[method](datum);

			if (res && res.then) {
				return res;
			} else {
				return Promise.resolve();
			}
		};
	}

/***/ },
/* 16 */
/***/ function(module, exports, __webpack_require__) {

	var require;var __WEBPACK_AMD_DEFINE_RESULT__;/* WEBPACK VAR INJECTION */(function(process, global, module) {'use strict';

	var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

	/*!
	 * @overview es6-promise - a tiny implementation of Promises/A+.
	 * @copyright Copyright (c) 2014 Yehuda Katz, Tom Dale, Stefan Penner and contributors (Conversion to ES6 API by Jake Archibald)
	 * @license   Licensed under MIT license
	 *            See https://raw.githubusercontent.com/jakearchibald/es6-promise/master/LICENSE
	 * @version   3.1.2
	 */

	(function () {
	  "use strict";

	  function lib$es6$promise$utils$$objectOrFunction(x) {
	    return typeof x === 'function' || (typeof x === 'undefined' ? 'undefined' : _typeof(x)) === 'object' && x !== null;
	  }

	  function lib$es6$promise$utils$$isFunction(x) {
	    return typeof x === 'function';
	  }

	  function lib$es6$promise$utils$$isMaybeThenable(x) {
	    return (typeof x === 'undefined' ? 'undefined' : _typeof(x)) === 'object' && x !== null;
	  }

	  var lib$es6$promise$utils$$_isArray;
	  if (!Array.isArray) {
	    lib$es6$promise$utils$$_isArray = function lib$es6$promise$utils$$_isArray(x) {
	      return Object.prototype.toString.call(x) === '[object Array]';
	    };
	  } else {
	    lib$es6$promise$utils$$_isArray = Array.isArray;
	  }

	  var lib$es6$promise$utils$$isArray = lib$es6$promise$utils$$_isArray;
	  var lib$es6$promise$asap$$len = 0;
	  var lib$es6$promise$asap$$vertxNext;
	  var lib$es6$promise$asap$$customSchedulerFn;

	  var lib$es6$promise$asap$$asap = function asap(callback, arg) {
	    lib$es6$promise$asap$$queue[lib$es6$promise$asap$$len] = callback;
	    lib$es6$promise$asap$$queue[lib$es6$promise$asap$$len + 1] = arg;
	    lib$es6$promise$asap$$len += 2;
	    if (lib$es6$promise$asap$$len === 2) {
	      // If len is 2, that means that we need to schedule an async flush.
	      // If additional callbacks are queued before the queue is flushed, they
	      // will be processed by this flush that we are scheduling.
	      if (lib$es6$promise$asap$$customSchedulerFn) {
	        lib$es6$promise$asap$$customSchedulerFn(lib$es6$promise$asap$$flush);
	      } else {
	        lib$es6$promise$asap$$scheduleFlush();
	      }
	    }
	  };

	  function lib$es6$promise$asap$$setScheduler(scheduleFn) {
	    lib$es6$promise$asap$$customSchedulerFn = scheduleFn;
	  }

	  function lib$es6$promise$asap$$setAsap(asapFn) {
	    lib$es6$promise$asap$$asap = asapFn;
	  }

	  var lib$es6$promise$asap$$browserWindow = typeof window !== 'undefined' ? window : undefined;
	  var lib$es6$promise$asap$$browserGlobal = lib$es6$promise$asap$$browserWindow || {};
	  var lib$es6$promise$asap$$BrowserMutationObserver = lib$es6$promise$asap$$browserGlobal.MutationObserver || lib$es6$promise$asap$$browserGlobal.WebKitMutationObserver;
	  var lib$es6$promise$asap$$isNode = typeof process !== 'undefined' && {}.toString.call(process) === '[object process]';

	  // test for web worker but not in IE10
	  var lib$es6$promise$asap$$isWorker = typeof Uint8ClampedArray !== 'undefined' && typeof importScripts !== 'undefined' && typeof MessageChannel !== 'undefined';

	  // node
	  function lib$es6$promise$asap$$useNextTick() {
	    // node version 0.10.x displays a deprecation warning when nextTick is used recursively
	    // see https://github.com/cujojs/when/issues/410 for details
	    return function () {
	      process.nextTick(lib$es6$promise$asap$$flush);
	    };
	  }

	  // vertx
	  function lib$es6$promise$asap$$useVertxTimer() {
	    return function () {
	      lib$es6$promise$asap$$vertxNext(lib$es6$promise$asap$$flush);
	    };
	  }

	  function lib$es6$promise$asap$$useMutationObserver() {
	    var iterations = 0;
	    var observer = new lib$es6$promise$asap$$BrowserMutationObserver(lib$es6$promise$asap$$flush);
	    var node = document.createTextNode('');
	    observer.observe(node, { characterData: true });

	    return function () {
	      node.data = iterations = ++iterations % 2;
	    };
	  }

	  // web worker
	  function lib$es6$promise$asap$$useMessageChannel() {
	    var channel = new MessageChannel();
	    channel.port1.onmessage = lib$es6$promise$asap$$flush;
	    return function () {
	      channel.port2.postMessage(0);
	    };
	  }

	  function lib$es6$promise$asap$$useSetTimeout() {
	    return function () {
	      setTimeout(lib$es6$promise$asap$$flush, 1);
	    };
	  }

	  var lib$es6$promise$asap$$queue = new Array(1000);
	  function lib$es6$promise$asap$$flush() {
	    for (var i = 0; i < lib$es6$promise$asap$$len; i += 2) {
	      var callback = lib$es6$promise$asap$$queue[i];
	      var arg = lib$es6$promise$asap$$queue[i + 1];

	      callback(arg);

	      lib$es6$promise$asap$$queue[i] = undefined;
	      lib$es6$promise$asap$$queue[i + 1] = undefined;
	    }

	    lib$es6$promise$asap$$len = 0;
	  }

	  function lib$es6$promise$asap$$attemptVertx() {
	    try {
	      var r = require;
	      var vertx = __webpack_require__(19);
	      lib$es6$promise$asap$$vertxNext = vertx.runOnLoop || vertx.runOnContext;
	      return lib$es6$promise$asap$$useVertxTimer();
	    } catch (e) {
	      return lib$es6$promise$asap$$useSetTimeout();
	    }
	  }

	  var lib$es6$promise$asap$$scheduleFlush;
	  // Decide what async method to use to triggering processing of queued callbacks:
	  if (lib$es6$promise$asap$$isNode) {
	    lib$es6$promise$asap$$scheduleFlush = lib$es6$promise$asap$$useNextTick();
	  } else if (lib$es6$promise$asap$$BrowserMutationObserver) {
	    lib$es6$promise$asap$$scheduleFlush = lib$es6$promise$asap$$useMutationObserver();
	  } else if (lib$es6$promise$asap$$isWorker) {
	    lib$es6$promise$asap$$scheduleFlush = lib$es6$promise$asap$$useMessageChannel();
	  } else if (lib$es6$promise$asap$$browserWindow === undefined && "function" === 'function') {
	    lib$es6$promise$asap$$scheduleFlush = lib$es6$promise$asap$$attemptVertx();
	  } else {
	    lib$es6$promise$asap$$scheduleFlush = lib$es6$promise$asap$$useSetTimeout();
	  }
	  function lib$es6$promise$then$$then(onFulfillment, onRejection) {
	    var parent = this;
	    var state = parent._state;

	    if (state === lib$es6$promise$$internal$$FULFILLED && !onFulfillment || state === lib$es6$promise$$internal$$REJECTED && !onRejection) {
	      return this;
	    }

	    var child = new this.constructor(lib$es6$promise$$internal$$noop);
	    var result = parent._result;

	    if (state) {
	      var callback = arguments[state - 1];
	      lib$es6$promise$asap$$asap(function () {
	        lib$es6$promise$$internal$$invokeCallback(state, child, callback, result);
	      });
	    } else {
	      lib$es6$promise$$internal$$subscribe(parent, child, onFulfillment, onRejection);
	    }

	    return child;
	  }
	  var lib$es6$promise$then$$default = lib$es6$promise$then$$then;
	  function lib$es6$promise$promise$resolve$$resolve(object) {
	    /*jshint validthis:true */
	    var Constructor = this;

	    if (object && (typeof object === 'undefined' ? 'undefined' : _typeof(object)) === 'object' && object.constructor === Constructor) {
	      return object;
	    }

	    var promise = new Constructor(lib$es6$promise$$internal$$noop);
	    lib$es6$promise$$internal$$resolve(promise, object);
	    return promise;
	  }
	  var lib$es6$promise$promise$resolve$$default = lib$es6$promise$promise$resolve$$resolve;

	  function lib$es6$promise$$internal$$noop() {}

	  var lib$es6$promise$$internal$$PENDING = void 0;
	  var lib$es6$promise$$internal$$FULFILLED = 1;
	  var lib$es6$promise$$internal$$REJECTED = 2;

	  var lib$es6$promise$$internal$$GET_THEN_ERROR = new lib$es6$promise$$internal$$ErrorObject();

	  function lib$es6$promise$$internal$$selfFulfillment() {
	    return new TypeError("You cannot resolve a promise with itself");
	  }

	  function lib$es6$promise$$internal$$cannotReturnOwn() {
	    return new TypeError('A promises callback cannot return that same promise.');
	  }

	  function lib$es6$promise$$internal$$getThen(promise) {
	    try {
	      return promise.then;
	    } catch (error) {
	      lib$es6$promise$$internal$$GET_THEN_ERROR.error = error;
	      return lib$es6$promise$$internal$$GET_THEN_ERROR;
	    }
	  }

	  function lib$es6$promise$$internal$$tryThen(then, value, fulfillmentHandler, rejectionHandler) {
	    try {
	      then.call(value, fulfillmentHandler, rejectionHandler);
	    } catch (e) {
	      return e;
	    }
	  }

	  function lib$es6$promise$$internal$$handleForeignThenable(promise, thenable, then) {
	    lib$es6$promise$asap$$asap(function (promise) {
	      var sealed = false;
	      var error = lib$es6$promise$$internal$$tryThen(then, thenable, function (value) {
	        if (sealed) {
	          return;
	        }
	        sealed = true;
	        if (thenable !== value) {
	          lib$es6$promise$$internal$$resolve(promise, value);
	        } else {
	          lib$es6$promise$$internal$$fulfill(promise, value);
	        }
	      }, function (reason) {
	        if (sealed) {
	          return;
	        }
	        sealed = true;

	        lib$es6$promise$$internal$$reject(promise, reason);
	      }, 'Settle: ' + (promise._label || ' unknown promise'));

	      if (!sealed && error) {
	        sealed = true;
	        lib$es6$promise$$internal$$reject(promise, error);
	      }
	    }, promise);
	  }

	  function lib$es6$promise$$internal$$handleOwnThenable(promise, thenable) {
	    if (thenable._state === lib$es6$promise$$internal$$FULFILLED) {
	      lib$es6$promise$$internal$$fulfill(promise, thenable._result);
	    } else if (thenable._state === lib$es6$promise$$internal$$REJECTED) {
	      lib$es6$promise$$internal$$reject(promise, thenable._result);
	    } else {
	      lib$es6$promise$$internal$$subscribe(thenable, undefined, function (value) {
	        lib$es6$promise$$internal$$resolve(promise, value);
	      }, function (reason) {
	        lib$es6$promise$$internal$$reject(promise, reason);
	      });
	    }
	  }

	  function lib$es6$promise$$internal$$handleMaybeThenable(promise, maybeThenable, then) {
	    if (maybeThenable.constructor === promise.constructor && then === lib$es6$promise$then$$default && constructor.resolve === lib$es6$promise$promise$resolve$$default) {
	      lib$es6$promise$$internal$$handleOwnThenable(promise, maybeThenable);
	    } else {
	      if (then === lib$es6$promise$$internal$$GET_THEN_ERROR) {
	        lib$es6$promise$$internal$$reject(promise, lib$es6$promise$$internal$$GET_THEN_ERROR.error);
	      } else if (then === undefined) {
	        lib$es6$promise$$internal$$fulfill(promise, maybeThenable);
	      } else if (lib$es6$promise$utils$$isFunction(then)) {
	        lib$es6$promise$$internal$$handleForeignThenable(promise, maybeThenable, then);
	      } else {
	        lib$es6$promise$$internal$$fulfill(promise, maybeThenable);
	      }
	    }
	  }

	  function lib$es6$promise$$internal$$resolve(promise, value) {
	    if (promise === value) {
	      lib$es6$promise$$internal$$reject(promise, lib$es6$promise$$internal$$selfFulfillment());
	    } else if (lib$es6$promise$utils$$objectOrFunction(value)) {
	      lib$es6$promise$$internal$$handleMaybeThenable(promise, value, lib$es6$promise$$internal$$getThen(value));
	    } else {
	      lib$es6$promise$$internal$$fulfill(promise, value);
	    }
	  }

	  function lib$es6$promise$$internal$$publishRejection(promise) {
	    if (promise._onerror) {
	      promise._onerror(promise._result);
	    }

	    lib$es6$promise$$internal$$publish(promise);
	  }

	  function lib$es6$promise$$internal$$fulfill(promise, value) {
	    if (promise._state !== lib$es6$promise$$internal$$PENDING) {
	      return;
	    }

	    promise._result = value;
	    promise._state = lib$es6$promise$$internal$$FULFILLED;

	    if (promise._subscribers.length !== 0) {
	      lib$es6$promise$asap$$asap(lib$es6$promise$$internal$$publish, promise);
	    }
	  }

	  function lib$es6$promise$$internal$$reject(promise, reason) {
	    if (promise._state !== lib$es6$promise$$internal$$PENDING) {
	      return;
	    }
	    promise._state = lib$es6$promise$$internal$$REJECTED;
	    promise._result = reason;

	    lib$es6$promise$asap$$asap(lib$es6$promise$$internal$$publishRejection, promise);
	  }

	  function lib$es6$promise$$internal$$subscribe(parent, child, onFulfillment, onRejection) {
	    var subscribers = parent._subscribers;
	    var length = subscribers.length;

	    parent._onerror = null;

	    subscribers[length] = child;
	    subscribers[length + lib$es6$promise$$internal$$FULFILLED] = onFulfillment;
	    subscribers[length + lib$es6$promise$$internal$$REJECTED] = onRejection;

	    if (length === 0 && parent._state) {
	      lib$es6$promise$asap$$asap(lib$es6$promise$$internal$$publish, parent);
	    }
	  }

	  function lib$es6$promise$$internal$$publish(promise) {
	    var subscribers = promise._subscribers;
	    var settled = promise._state;

	    if (subscribers.length === 0) {
	      return;
	    }

	    var child,
	        callback,
	        detail = promise._result;

	    for (var i = 0; i < subscribers.length; i += 3) {
	      child = subscribers[i];
	      callback = subscribers[i + settled];

	      if (child) {
	        lib$es6$promise$$internal$$invokeCallback(settled, child, callback, detail);
	      } else {
	        callback(detail);
	      }
	    }

	    promise._subscribers.length = 0;
	  }

	  function lib$es6$promise$$internal$$ErrorObject() {
	    this.error = null;
	  }

	  var lib$es6$promise$$internal$$TRY_CATCH_ERROR = new lib$es6$promise$$internal$$ErrorObject();

	  function lib$es6$promise$$internal$$tryCatch(callback, detail) {
	    try {
	      return callback(detail);
	    } catch (e) {
	      lib$es6$promise$$internal$$TRY_CATCH_ERROR.error = e;
	      return lib$es6$promise$$internal$$TRY_CATCH_ERROR;
	    }
	  }

	  function lib$es6$promise$$internal$$invokeCallback(settled, promise, callback, detail) {
	    var hasCallback = lib$es6$promise$utils$$isFunction(callback),
	        value,
	        error,
	        succeeded,
	        failed;

	    if (hasCallback) {
	      value = lib$es6$promise$$internal$$tryCatch(callback, detail);

	      if (value === lib$es6$promise$$internal$$TRY_CATCH_ERROR) {
	        failed = true;
	        error = value.error;
	        value = null;
	      } else {
	        succeeded = true;
	      }

	      if (promise === value) {
	        lib$es6$promise$$internal$$reject(promise, lib$es6$promise$$internal$$cannotReturnOwn());
	        return;
	      }
	    } else {
	      value = detail;
	      succeeded = true;
	    }

	    if (promise._state !== lib$es6$promise$$internal$$PENDING) {
	      // noop
	    } else if (hasCallback && succeeded) {
	        lib$es6$promise$$internal$$resolve(promise, value);
	      } else if (failed) {
	        lib$es6$promise$$internal$$reject(promise, error);
	      } else if (settled === lib$es6$promise$$internal$$FULFILLED) {
	        lib$es6$promise$$internal$$fulfill(promise, value);
	      } else if (settled === lib$es6$promise$$internal$$REJECTED) {
	        lib$es6$promise$$internal$$reject(promise, value);
	      }
	  }

	  function lib$es6$promise$$internal$$initializePromise(promise, resolver) {
	    try {
	      resolver(function resolvePromise(value) {
	        lib$es6$promise$$internal$$resolve(promise, value);
	      }, function rejectPromise(reason) {
	        lib$es6$promise$$internal$$reject(promise, reason);
	      });
	    } catch (e) {
	      lib$es6$promise$$internal$$reject(promise, e);
	    }
	  }

	  function lib$es6$promise$promise$all$$all(entries) {
	    return new lib$es6$promise$enumerator$$default(this, entries).promise;
	  }
	  var lib$es6$promise$promise$all$$default = lib$es6$promise$promise$all$$all;
	  function lib$es6$promise$promise$race$$race(entries) {
	    /*jshint validthis:true */
	    var Constructor = this;

	    var promise = new Constructor(lib$es6$promise$$internal$$noop);

	    if (!lib$es6$promise$utils$$isArray(entries)) {
	      lib$es6$promise$$internal$$reject(promise, new TypeError('You must pass an array to race.'));
	      return promise;
	    }

	    var length = entries.length;

	    function onFulfillment(value) {
	      lib$es6$promise$$internal$$resolve(promise, value);
	    }

	    function onRejection(reason) {
	      lib$es6$promise$$internal$$reject(promise, reason);
	    }

	    for (var i = 0; promise._state === lib$es6$promise$$internal$$PENDING && i < length; i++) {
	      lib$es6$promise$$internal$$subscribe(Constructor.resolve(entries[i]), undefined, onFulfillment, onRejection);
	    }

	    return promise;
	  }
	  var lib$es6$promise$promise$race$$default = lib$es6$promise$promise$race$$race;
	  function lib$es6$promise$promise$reject$$reject(reason) {
	    /*jshint validthis:true */
	    var Constructor = this;
	    var promise = new Constructor(lib$es6$promise$$internal$$noop);
	    lib$es6$promise$$internal$$reject(promise, reason);
	    return promise;
	  }
	  var lib$es6$promise$promise$reject$$default = lib$es6$promise$promise$reject$$reject;

	  var lib$es6$promise$promise$$counter = 0;

	  function lib$es6$promise$promise$$needsResolver() {
	    throw new TypeError('You must pass a resolver function as the first argument to the promise constructor');
	  }

	  function lib$es6$promise$promise$$needsNew() {
	    throw new TypeError("Failed to construct 'Promise': Please use the 'new' operator, this object constructor cannot be called as a function.");
	  }

	  var lib$es6$promise$promise$$default = lib$es6$promise$promise$$Promise;
	  /**
	    Promise objects represent the eventual result of an asynchronous operation. The
	    primary way of interacting with a promise is through its `then` method, which
	    registers callbacks to receive either a promise's eventual value or the reason
	    why the promise cannot be fulfilled.
	     Terminology
	    -----------
	     - `promise` is an object or function with a `then` method whose behavior conforms to this specification.
	    - `thenable` is an object or function that defines a `then` method.
	    - `value` is any legal JavaScript value (including undefined, a thenable, or a promise).
	    - `exception` is a value that is thrown using the throw statement.
	    - `reason` is a value that indicates why a promise was rejected.
	    - `settled` the final resting state of a promise, fulfilled or rejected.
	     A promise can be in one of three states: pending, fulfilled, or rejected.
	     Promises that are fulfilled have a fulfillment value and are in the fulfilled
	    state.  Promises that are rejected have a rejection reason and are in the
	    rejected state.  A fulfillment value is never a thenable.
	     Promises can also be said to *resolve* a value.  If this value is also a
	    promise, then the original promise's settled state will match the value's
	    settled state.  So a promise that *resolves* a promise that rejects will
	    itself reject, and a promise that *resolves* a promise that fulfills will
	    itself fulfill.
	      Basic Usage:
	    ------------
	     ```js
	    var promise = new Promise(function(resolve, reject) {
	      // on success
	      resolve(value);
	       // on failure
	      reject(reason);
	    });
	     promise.then(function(value) {
	      // on fulfillment
	    }, function(reason) {
	      // on rejection
	    });
	    ```
	     Advanced Usage:
	    ---------------
	     Promises shine when abstracting away asynchronous interactions such as
	    `XMLHttpRequest`s.
	     ```js
	    function getJSON(url) {
	      return new Promise(function(resolve, reject){
	        var xhr = new XMLHttpRequest();
	         xhr.open('GET', url);
	        xhr.onreadystatechange = handler;
	        xhr.responseType = 'json';
	        xhr.setRequestHeader('Accept', 'application/json');
	        xhr.send();
	         function handler() {
	          if (this.readyState === this.DONE) {
	            if (this.status === 200) {
	              resolve(this.response);
	            } else {
	              reject(new Error('getJSON: `' + url + '` failed with status: [' + this.status + ']'));
	            }
	          }
	        };
	      });
	    }
	     getJSON('/posts.json').then(function(json) {
	      // on fulfillment
	    }, function(reason) {
	      // on rejection
	    });
	    ```
	     Unlike callbacks, promises are great composable primitives.
	     ```js
	    Promise.all([
	      getJSON('/posts'),
	      getJSON('/comments')
	    ]).then(function(values){
	      values[0] // => postsJSON
	      values[1] // => commentsJSON
	       return values;
	    });
	    ```
	     @class Promise
	    @param {function} resolver
	    Useful for tooling.
	    @constructor
	  */
	  function lib$es6$promise$promise$$Promise(resolver) {
	    this._id = lib$es6$promise$promise$$counter++;
	    this._state = undefined;
	    this._result = undefined;
	    this._subscribers = [];

	    if (lib$es6$promise$$internal$$noop !== resolver) {
	      typeof resolver !== 'function' && lib$es6$promise$promise$$needsResolver();
	      this instanceof lib$es6$promise$promise$$Promise ? lib$es6$promise$$internal$$initializePromise(this, resolver) : lib$es6$promise$promise$$needsNew();
	    }
	  }

	  lib$es6$promise$promise$$Promise.all = lib$es6$promise$promise$all$$default;
	  lib$es6$promise$promise$$Promise.race = lib$es6$promise$promise$race$$default;
	  lib$es6$promise$promise$$Promise.resolve = lib$es6$promise$promise$resolve$$default;
	  lib$es6$promise$promise$$Promise.reject = lib$es6$promise$promise$reject$$default;
	  lib$es6$promise$promise$$Promise._setScheduler = lib$es6$promise$asap$$setScheduler;
	  lib$es6$promise$promise$$Promise._setAsap = lib$es6$promise$asap$$setAsap;
	  lib$es6$promise$promise$$Promise._asap = lib$es6$promise$asap$$asap;

	  lib$es6$promise$promise$$Promise.prototype = {
	    constructor: lib$es6$promise$promise$$Promise,

	    /**
	      The primary way of interacting with a promise is through its `then` method,
	      which registers callbacks to receive either a promise's eventual value or the
	      reason why the promise cannot be fulfilled.
	       ```js
	      findUser().then(function(user){
	        // user is available
	      }, function(reason){
	        // user is unavailable, and you are given the reason why
	      });
	      ```
	       Chaining
	      --------
	       The return value of `then` is itself a promise.  This second, 'downstream'
	      promise is resolved with the return value of the first promise's fulfillment
	      or rejection handler, or rejected if the handler throws an exception.
	       ```js
	      findUser().then(function (user) {
	        return user.name;
	      }, function (reason) {
	        return 'default name';
	      }).then(function (userName) {
	        // If `findUser` fulfilled, `userName` will be the user's name, otherwise it
	        // will be `'default name'`
	      });
	       findUser().then(function (user) {
	        throw new Error('Found user, but still unhappy');
	      }, function (reason) {
	        throw new Error('`findUser` rejected and we're unhappy');
	      }).then(function (value) {
	        // never reached
	      }, function (reason) {
	        // if `findUser` fulfilled, `reason` will be 'Found user, but still unhappy'.
	        // If `findUser` rejected, `reason` will be '`findUser` rejected and we're unhappy'.
	      });
	      ```
	      If the downstream promise does not specify a rejection handler, rejection reasons will be propagated further downstream.
	       ```js
	      findUser().then(function (user) {
	        throw new PedagogicalException('Upstream error');
	      }).then(function (value) {
	        // never reached
	      }).then(function (value) {
	        // never reached
	      }, function (reason) {
	        // The `PedgagocialException` is propagated all the way down to here
	      });
	      ```
	       Assimilation
	      ------------
	       Sometimes the value you want to propagate to a downstream promise can only be
	      retrieved asynchronously. This can be achieved by returning a promise in the
	      fulfillment or rejection handler. The downstream promise will then be pending
	      until the returned promise is settled. This is called *assimilation*.
	       ```js
	      findUser().then(function (user) {
	        return findCommentsByAuthor(user);
	      }).then(function (comments) {
	        // The user's comments are now available
	      });
	      ```
	       If the assimliated promise rejects, then the downstream promise will also reject.
	       ```js
	      findUser().then(function (user) {
	        return findCommentsByAuthor(user);
	      }).then(function (comments) {
	        // If `findCommentsByAuthor` fulfills, we'll have the value here
	      }, function (reason) {
	        // If `findCommentsByAuthor` rejects, we'll have the reason here
	      });
	      ```
	       Simple Example
	      --------------
	       Synchronous Example
	       ```javascript
	      var result;
	       try {
	        result = findResult();
	        // success
	      } catch(reason) {
	        // failure
	      }
	      ```
	       Errback Example
	       ```js
	      findResult(function(result, err){
	        if (err) {
	          // failure
	        } else {
	          // success
	        }
	      });
	      ```
	       Promise Example;
	       ```javascript
	      findResult().then(function(result){
	        // success
	      }, function(reason){
	        // failure
	      });
	      ```
	       Advanced Example
	      --------------
	       Synchronous Example
	       ```javascript
	      var author, books;
	       try {
	        author = findAuthor();
	        books  = findBooksByAuthor(author);
	        // success
	      } catch(reason) {
	        // failure
	      }
	      ```
	       Errback Example
	       ```js
	       function foundBooks(books) {
	       }
	       function failure(reason) {
	       }
	       findAuthor(function(author, err){
	        if (err) {
	          failure(err);
	          // failure
	        } else {
	          try {
	            findBoooksByAuthor(author, function(books, err) {
	              if (err) {
	                failure(err);
	              } else {
	                try {
	                  foundBooks(books);
	                } catch(reason) {
	                  failure(reason);
	                }
	              }
	            });
	          } catch(error) {
	            failure(err);
	          }
	          // success
	        }
	      });
	      ```
	       Promise Example;
	       ```javascript
	      findAuthor().
	        then(findBooksByAuthor).
	        then(function(books){
	          // found books
	      }).catch(function(reason){
	        // something went wrong
	      });
	      ```
	       @method then
	      @param {Function} onFulfilled
	      @param {Function} onRejected
	      Useful for tooling.
	      @return {Promise}
	    */
	    then: lib$es6$promise$then$$default,

	    /**
	      `catch` is simply sugar for `then(undefined, onRejection)` which makes it the same
	      as the catch block of a try/catch statement.
	       ```js
	      function findAuthor(){
	        throw new Error('couldn't find that author');
	      }
	       // synchronous
	      try {
	        findAuthor();
	      } catch(reason) {
	        // something went wrong
	      }
	       // async with promises
	      findAuthor().catch(function(reason){
	        // something went wrong
	      });
	      ```
	       @method catch
	      @param {Function} onRejection
	      Useful for tooling.
	      @return {Promise}
	    */
	    'catch': function _catch(onRejection) {
	      return this.then(null, onRejection);
	    }
	  };
	  var lib$es6$promise$enumerator$$default = lib$es6$promise$enumerator$$Enumerator;
	  function lib$es6$promise$enumerator$$Enumerator(Constructor, input) {
	    this._instanceConstructor = Constructor;
	    this.promise = new Constructor(lib$es6$promise$$internal$$noop);

	    if (Array.isArray(input)) {
	      this._input = input;
	      this.length = input.length;
	      this._remaining = input.length;

	      this._result = new Array(this.length);

	      if (this.length === 0) {
	        lib$es6$promise$$internal$$fulfill(this.promise, this._result);
	      } else {
	        this.length = this.length || 0;
	        this._enumerate();
	        if (this._remaining === 0) {
	          lib$es6$promise$$internal$$fulfill(this.promise, this._result);
	        }
	      }
	    } else {
	      lib$es6$promise$$internal$$reject(this.promise, this._validationError());
	    }
	  }

	  lib$es6$promise$enumerator$$Enumerator.prototype._validationError = function () {
	    return new Error('Array Methods must be provided an Array');
	  };

	  lib$es6$promise$enumerator$$Enumerator.prototype._enumerate = function () {
	    var length = this.length;
	    var input = this._input;

	    for (var i = 0; this._state === lib$es6$promise$$internal$$PENDING && i < length; i++) {
	      this._eachEntry(input[i], i);
	    }
	  };

	  lib$es6$promise$enumerator$$Enumerator.prototype._eachEntry = function (entry, i) {
	    var c = this._instanceConstructor;
	    var resolve = c.resolve;

	    if (resolve === lib$es6$promise$promise$resolve$$default) {
	      var then = lib$es6$promise$$internal$$getThen(entry);

	      if (then === lib$es6$promise$then$$default && entry._state !== lib$es6$promise$$internal$$PENDING) {
	        this._settledAt(entry._state, i, entry._result);
	      } else if (typeof then !== 'function') {
	        this._remaining--;
	        this._result[i] = entry;
	      } else if (c === lib$es6$promise$promise$$default) {
	        var promise = new c(lib$es6$promise$$internal$$noop);
	        lib$es6$promise$$internal$$handleMaybeThenable(promise, entry, then);
	        this._willSettleAt(promise, i);
	      } else {
	        this._willSettleAt(new c(function (resolve) {
	          resolve(entry);
	        }), i);
	      }
	    } else {
	      this._willSettleAt(resolve(entry), i);
	    }
	  };

	  lib$es6$promise$enumerator$$Enumerator.prototype._settledAt = function (state, i, value) {
	    var promise = this.promise;

	    if (promise._state === lib$es6$promise$$internal$$PENDING) {
	      this._remaining--;

	      if (state === lib$es6$promise$$internal$$REJECTED) {
	        lib$es6$promise$$internal$$reject(promise, value);
	      } else {
	        this._result[i] = value;
	      }
	    }

	    if (this._remaining === 0) {
	      lib$es6$promise$$internal$$fulfill(promise, this._result);
	    }
	  };

	  lib$es6$promise$enumerator$$Enumerator.prototype._willSettleAt = function (promise, i) {
	    var enumerator = this;

	    lib$es6$promise$$internal$$subscribe(promise, undefined, function (value) {
	      enumerator._settledAt(lib$es6$promise$$internal$$FULFILLED, i, value);
	    }, function (reason) {
	      enumerator._settledAt(lib$es6$promise$$internal$$REJECTED, i, reason);
	    });
	  };
	  function lib$es6$promise$polyfill$$polyfill() {
	    var local;

	    if (typeof global !== 'undefined') {
	      local = global;
	    } else if (typeof self !== 'undefined') {
	      local = self;
	    } else {
	      try {
	        local = Function('return this')();
	      } catch (e) {
	        throw new Error('polyfill failed because global object is unavailable in this environment');
	      }
	    }

	    var P = local.Promise;

	    if (P && Object.prototype.toString.call(P.resolve()) === '[object Promise]' && !P.cast) {
	      return;
	    }

	    local.Promise = lib$es6$promise$promise$$default;
	  }
	  var lib$es6$promise$polyfill$$default = lib$es6$promise$polyfill$$polyfill;

	  var lib$es6$promise$umd$$ES6Promise = {
	    'Promise': lib$es6$promise$promise$$default,
	    'polyfill': lib$es6$promise$polyfill$$default
	  };

	  /* global define:true module:true window: true */
	  if ("function" === 'function' && __webpack_require__(20)['amd']) {
	    !(__WEBPACK_AMD_DEFINE_RESULT__ = function () {
	      return lib$es6$promise$umd$$ES6Promise;
	    }.call(exports, __webpack_require__, exports, module), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
	  } else if (typeof module !== 'undefined' && module['exports']) {
	    module['exports'] = lib$es6$promise$umd$$ES6Promise;
	  } else if (typeof this !== 'undefined') {
	    this['ES6Promise'] = lib$es6$promise$umd$$ES6Promise;
	  }

	  lib$es6$promise$polyfill$$default();
	}).call(undefined);
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(17), (function() { return this; }()), __webpack_require__(18)(module)))

/***/ },
/* 17 */
/***/ function(module, exports) {

	'use strict';

	// shim for using process in browser

	var process = module.exports = {};
	var queue = [];
	var draining = false;
	var currentQueue;
	var queueIndex = -1;

	function cleanUpNextTick() {
	    draining = false;
	    if (currentQueue.length) {
	        queue = currentQueue.concat(queue);
	    } else {
	        queueIndex = -1;
	    }
	    if (queue.length) {
	        drainQueue();
	    }
	}

	function drainQueue() {
	    if (draining) {
	        return;
	    }
	    var timeout = setTimeout(cleanUpNextTick);
	    draining = true;

	    var len = queue.length;
	    while (len) {
	        currentQueue = queue;
	        queue = [];
	        while (++queueIndex < len) {
	            if (currentQueue) {
	                currentQueue[queueIndex].run();
	            }
	        }
	        queueIndex = -1;
	        len = queue.length;
	    }
	    currentQueue = null;
	    draining = false;
	    clearTimeout(timeout);
	}

	process.nextTick = function (fun) {
	    var args = new Array(arguments.length - 1);
	    if (arguments.length > 1) {
	        for (var i = 1; i < arguments.length; i++) {
	            args[i - 1] = arguments[i];
	        }
	    }
	    queue.push(new Item(fun, args));
	    if (queue.length === 1 && !draining) {
	        setTimeout(drainQueue, 0);
	    }
	};

	// v8 likes predictible objects
	function Item(fun, array) {
	    this.fun = fun;
	    this.array = array;
	}
	Item.prototype.run = function () {
	    this.fun.apply(null, this.array);
	};
	process.title = 'browser';
	process.browser = true;
	process.env = {};
	process.argv = [];
	process.version = ''; // empty string to avoid regexp issues
	process.versions = {};

	function noop() {}

	process.on = noop;
	process.addListener = noop;
	process.once = noop;
	process.off = noop;
	process.removeListener = noop;
	process.removeAllListeners = noop;
	process.emit = noop;

	process.binding = function (name) {
	    throw new Error('process.binding is not supported');
	};

	process.cwd = function () {
	    return '/';
	};
	process.chdir = function (dir) {
	    throw new Error('process.chdir is not supported');
	};
	process.umask = function () {
	    return 0;
	};

/***/ },
/* 18 */
/***/ function(module, exports) {

	"use strict";

	module.exports = function (module) {
		if (!module.webpackPolyfill) {
			module.deprecate = function () {};
			module.paths = [];
			// module.parent = undefined by default
			module.children = [];
			module.webpackPolyfill = 1;
		}
		return module;
	};

/***/ },
/* 19 */
/***/ function(module, exports) {

	/* (ignored) */

/***/ },
/* 20 */
/***/ function(module, exports) {

	module.exports = function() { throw new Error("define cannot be used indirect"); };


/***/ },
/* 21 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	exports.insert = insert;
	exports.conf = conf;
	var Promise = __webpack_require__(16).Promise;

	function insert(cmd, args) {
		return new Promise(function (resolve) {
			resolve(cmd[args[0]]);
		});
	}

	function conf(cmd, args, datum, config) {
		return new Promise(function (resolve) {
			resolve(config[args[0]]);
		});
	}

/***/ },
/* 22 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	exports.filter = filter;
	exports.sort = sort;
	exports.limit = limit;
	exports.permutate = permutate;
	var bmoor = __webpack_require__(3);

	function filter(cmd, args, content) {
		var fn = bmoor.makeGetter(args[0] || cmd.field);

		return content.filter(function (datum) {
			return fn(datum);
		});
	}

	function sort(cmd, args, content) {
		var fn = bmoor.makeGetter(args[0] || cmd.field);

		return content.sort(function (a, b) {
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

	function limit(cmd, args, content) {
		var limit = parseInt(args[0] || cmd.limit, 10),
		    start = parseInt(args[1] || cmd.start, 10);

		if (start) {
			return content.slice(start, start + limit);
		} else {
			return content.slice(0, limit);
		}
	}

	function permutate(cmd, args, content) {
		var fns = {},
		    res = [];

		Object.keys(cmd.mappings).forEach(function (key) {
			fns[key] = bmoor.makeLoader(cmd.mappings[key]);
		});

		bmoor.loop(content, function (datum) {
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

/***/ }
/******/ ]);