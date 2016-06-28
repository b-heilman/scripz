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
		trans: 'permutate:{"field1":"data.a[]","field2":"data.b[]" }',
		action: 'log:permutation-1'
	}, {
		action: 'sleep:10000'
	}, {
		action: 'navigate:permu/{{field1}}/{{field2}}|log:permutation-2:->{{field1}} =>{{field2}}|sleep:1000'
	}], {
		content: [{ a: [1, 2], b: [3, 4] }, { a: [5, 6], b: [7, 8] }]
	});

	//--- Tutorial---
	window.tutorial = function () {
		sc.eval([{
			edit: 'select:target:#first|select:focus:#target|select:text:#textwall|format:content:This is a test',
			action: 'focus:target:focus|removeClass:target:hidden|sleep:2000|addClass:target:hidden|orbit:target:text|write:text:content|sleep:2000'
		}, {
			edit: 'select:target:#second|select:focus:#target|select:text:#textwall|format:content:This is another test',
			action: 'focus:target:focus|removeClass:target:hidden|sleep:2000|addClass:target:hidden|orbit:target:text|write:text:content|sleep:2000'
		}, {
			edit: 'select:target:#third|select:focus:#target|select:text:#textwall|format:content:Third time is a charm',
			action: 'focus:target:focus|removeClass:target:hidden|sleep:2000|addClass:target:hidden|orbit:target:text|write:text:content|sleep:2000'
		}, {
			edit: 'select:target:#fourth|select:focus:#target|select:text:#textwall|format:content:I have no clue',
			action: 'focus:target:focus|removeClass:target:hidden|sleep:2000|addClass:target:hidden|orbit:target:text|write:text:content|sleep:2000'
		}]);
	};

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

	var _actions2 = __webpack_require__(17);

	var baseActions = _interopRequireWildcard(_actions2);

	var _fetchers2 = __webpack_require__(23);

	var baseFetchers = _interopRequireWildcard(_fetchers2);

	var _transformations2 = __webpack_require__(24);

	var baseTransformations = _interopRequireWildcard(_transformations2);

	function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	var bmoor = __webpack_require__(3),
	    Promise = __webpack_require__(18).Promise,
	    Operation = __webpack_require__(25);

	function parseOperations(operationLine) {
		var i,
		    c,
		    operations = operationLine.split('|');

		for (i = 0, c = operations.length; i < c; i++) {
			operations[i] = new Operation(operations[i]);
		}

		return operations;
	}

	var Scripz = function () {
		function Scripz(scripts) {
			_classCallCheck(this, Scripz);

			var dis = this,
			    memory = {},
			    _edits = Object.create(baseEdits),
			    // alter the array, return an array
			_scripts = scripts ? Object.create(scripts) : {},
			    _actions = Object.create(baseActions),
			    // return promise, do some action
			_fetchers = Object.create(baseFetchers),
			    // return promise, with data
			_priority = null,
			    _transformations = Object.create(baseTransformations); // make inline changes to the array

			_actions.series = {
				factory: function factory(operation) {
					var script = _scripts[operation.getArg(0)];

					return function (datum) {
						return dis.eval(script.slice(0), datum);
					};
				}
			};

			_actions.loop = {
				factory: function factory(operation, actions) {
					// args => loop count, series name, wait time between loops
					var count = parseInt(operation.getNextArg(), 10),
					    series = actions.series.factory(operation),
					    wait = parseInt(operation.getArg(1), 10) || 0;

					return function looper(collection) {
						var i, c;

						// TODO : why did I do this?
						if (!bmoor.isArrayLike(collection)) {
							collection = [collection];
						}

						i = 0;
						c = collection.length;

						function loop() {
							var iteration;

							if (i < c) {
								return series(collection[i]).then(function () {
									i++;
									return loop();
								});
							} else {
								if (count === -1) {
									iteration = 1;
								} else {
									count--;
									iteration = count;
								}

								if (iteration > 0) {
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

			function setupFetchers(operation) {
				var method = operation.getOp(),
				    field = operation.getNextArg(),
				    fn = _fetchers[method];

				if (!field) {
					throw new Error('Fetchers require at least two arguments: ' + event);
				}

				if (fn) {
					return function (datum, agg) {
						return fn(operation, datum).then(function (value) {
							combine(datum, value, field, agg);
						});
					};
				} else {
					throw new Error('Could not find loader (' + operation.getOp() + ') ' + operation.raw);
				}
			}

			// accept one datum, fetchers must always return arrays, even if just array of one
			function runFetchers(fetchers, content) {
				var i,
				    c,
				    fn = setupFetchers(fetchers.shift()),
				    req = [],
				    agg = [];

				for (i = 0, c = content.length; i < c; i++) {
					req.push(fn(content[i], agg));
				}

				return Promise.all(req).then(function () {
					if (fetchers.length) {
						return runFetchers(fetchers, agg);
					} else {
						return agg;
					}
				});
			}

			function doFetchers(command, content) {
				if (command.fetch) {
					// always being a new load of data with a fresh collection
					return runFetchers(parseOperations(command.fetch), content);
				} else {
					// if no loading, don't make any changes
					return Promise.resolve(content);
				}
			}

			function setupTrans(operation) {
				var name = operation.getOp(),
				    fn = _transformations[name];

				if (fn) {
					return function (content) {
						return fn(operation, content);
					};
				} else {
					throw new Error('Could not find transformation (' + operation.getOp() + ') ' + operation.raw);
				}
			}

			// filters accept the full array, and return a full array
			function doTransformations(command, content) {
				var i, c, fn, transformations;

				if (command.trans) {
					transformations = parseOperations(command.trans);
					for (i = 0, c = transformations.length; i < c; i++) {
						fn = setupTrans(transformations[i]);
						content = fn(content);
					}
				}

				return content;
			}

			// transformations accept a datum, and return a datum
			function setupEdit(operation) {
				var method = operation.getOp(),
				    field = operation.getNextArg(),
				    fn = _edits[method];

				if (!field) {
					throw new Error('Edits require at least two arguments: ' + operation.raw);
				}

				if (fn) {
					return function (datum, agg) {
						combine(datum, fn(operation, datum), field, agg);
					};
				} else {
					throw new Error('Could not find edit (' + operation.getOp() + ') ' + operation.raw);
				}
			}

			function doEdits(command, content) {
				var i, c, j, co, fn, agg, edits;

				if (command.edit) {
					edits = parseOperations(command.edit);
					for (i = 0, c = edits.length; i < c; i++) {
						fn = setupEdit(edits[i]);
						agg = [];
						for (j = 0, co = content.length; j < co; j++) {
							fn(content[j], agg);
						}
						content = agg;
					}
				}

				return content;
			}

			function compileAction(action, operation) {
				// I'm allowing actions to be defined two ways, as a factory function with attributes, or an object
				if (bmoor.isFunction(action)) {
					return action(operation, _actions);
				} else {
					return action.factory(operation, _actions);
				}
			}

			function compileActions(actions) {
				var bulk = [],
				    datum = [];

				actions.forEach(function (operation) {
					var name = operation.getOp(),
					    action = _actions[name];

					if (action) {
						// actions will be run as bulk if they do not follow and datum types
						if (action.bulk && datum.length === 0) {
							bulk.push(compileAction(action, operation));
						} else {
							datum.push(compileAction(action, operation));
						}
					} else {
						throw new Error('Could not find op (' + operation.getOp() + ') ' + operation.raw);
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

			function doActions(command, content) {
				if (command.action) {
					return runActions(compileActions(parseOperations(command.action)), content);
				} else {
					return Promise.resolve();
				}
			}

			this.run = function (cmd, config, content) {
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
					if (config) {
						content = [Object.create(config)];
					} else {
						content = [{}];
					}
				}

				return doFetchers(cmd, content).then(function (res) {
					var buffer = doTransformations(cmd, doEdits(cmd, res));

					return doActions(cmd, buffer).then(function () {
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

				// I want commands to be destructive here... unless I do this another way?
				try {
					return this.run(commands.shift(), config, buffer).then(success, failure);
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

	function select(operation, datum) {
		var node,
		    fn = bmoor.string.getFormatter(operation.getArg(0)),
		    base = operation.getArg(1);

		if (base) {
			node = datum[base];
		} else {
			node = document;
		}

		return bmoor.dom.getDomCollection(fn(datum));
	}

	function format(operation, datum) {
		var fn = bmoor.string.getFormatter(operation.getArg(0));

		return fn(datum);
	}

	function attribute(operation, datum) {
		var element = operation.getArg(0),
		    field = operation.getArg(1);

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

	bmoor.interfaces = __webpack_require__(15);

	module.exports = bmoor;

/***/ },
/* 4 */
/***/ function(module, exports) {

	'use strict';

	var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

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

	module.exports = {
		// booleans
		isUndefined: isUndefined,
		isDefined: isDefined,
		isString: isString,
		isNumber: isNumber,
		isFunction: isFunction,
		isObject: isObject,
		isBoolean: isBoolean,
		isArrayLike: isArrayLike,
		isArray: isArray,
		isEmpty: isEmpty,
		// access
		parse: parse,
		set: set,
		makeSetter: makeSetter,
		get: get,
		makeGetter: makeGetter,
		exec: exec,
		makeExec: makeExec,
		load: load,
		makeLoader: makeLoader,
		del: del,
		// controls
		loop: loop,
		each: each,
		iterate: iterate,
		safe: safe,
		naked: naked
	};

/***/ },
/* 5 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

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

	function getScrollPosition(doc) {
		if (!doc) {
			doc = document;
		}

		return {
			left: window.pageXOffset || (doc.documentElement || doc.body).scrollLeft,
			top: window.pageYOffset || (doc.documentElement || doc.body).scrollTop
		};
	}

	function getBoundryBox(element) {
		return element.getBoundingClientRect();
	}

	function centerOn(element, target, doc) {
		var el = getBoundryBox(element),
		    targ = getBoundryBox(target),
		    pos = getScrollPosition(doc);

		if (!doc) {
			doc = document;
		}

		element.style.top = pos.top + targ.top + targ.height / 2 - el.height / 2;
		element.style.left = pos.left + targ.left + targ.width / 2 - el.width / 2;
		element.style.right = '';
		element.style.bottom = '';

		element.style.position = 'absolute';
		doc.body.appendChild(element);
	}

	function showOn(element, target, doc) {
		var direction,
		    targ = getBoundryBox(target),
		    x = targ.x + targ.width / 2,
		    y = targ.y + targ.height / 2,
		    centerX = window.innerWidth / 2,
		    centerY = window.innerHeight / 2,
		    pos = getScrollPosition(doc);

		if (!doc) {
			doc = document;
		}

		if (x < centerX) {
			// right side has more room
			direction = 'r';
			element.style.left = pos.left + targ.right;
			element.style.right = '';
		} else {
			// left side has more room
			//element.style.left = targ.left - el.width - offset;
			direction = 'l';
			element.style.right = window.innerWidth - targ.left - pos.left;
			element.style.left = '';
		}

		if (y < centerY) {
			// more room on bottom
			direction = 'b' + direction;
			element.style.top = pos.top + targ.bottom;
			element.style.bottom = '';
		} else {
			// more room on top
			direction = 't' + direction;
			element.style.bottom = window.innerHeight - targ.top - pos.top;
			element.style.top = '';
		}

		element.style.position = 'absolute';
		doc.body.appendChild(element);

		return direction;
	}

	function massage(elements) {
		if (!bmoor.isArrayLike(elements)) {
			elements = [elements];
		}

		return elements;
	}

	function getDomElement(element, doc) {
		if (!doc) {
			doc = document;
		}

		if (bmoor.isString(element)) {
			return doc.querySelector(element);
		} else {
			return element;
		}
	}

	function getDomCollection(elements, doc) {
		var i,
		    c,
		    j,
		    co,
		    el,
		    selection,
		    els = [];

		if (!doc) {
			doc = document;
		}

		elements = massage(elements);

		for (i = 0, c = elements.length; i < c; i++) {
			el = elements[i];
			if (bmoor.isString(el)) {
				selection = doc.querySelectorAll(el);
				for (j = 0, co = selection.length; j < co; j++) {
					els.push(selection[j]);
				}
			} else {
				els.push(el);
			}
		}

		return els;
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

	module.exports = {
		getScrollPosition: getScrollPosition,
		getBoundryBox: getBoundryBox,
		getDomElement: getDomElement,
		getDomCollection: getDomCollection,
		showOn: showOn,
		centerOn: centerOn,
		addClass: addClass,
		removeClass: removeClass,
		triggerEvent: triggerEvent,
		bringForward: bringForward
	};

/***/ },
/* 6 */
/***/ function(module, exports) {

	"use strict";

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

	module.exports = {
		setUid: setUid,
		getUid: getUid
	};

/***/ },
/* 7 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

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

	module.exports = {
		indexOf: indexOf,
		remove: remove,
		removeAll: removeAll,
		bisect: bisect,
		filter: filter,
		compare: compare
	};

/***/ },
/* 8 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

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

	module.exports = {
		keys: keys,
		values: values,
		explode: explode,
		mask: mask,
		extend: extend,
		empty: empty,
		copy: copy,
		merge: merge,
		equals: equals
	};

/***/ },
/* 9 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var bmoor = __webpack_require__(4),
	    mixin = __webpack_require__(10),
	    plugin = __webpack_require__(11),
	    decorate = __webpack_require__(12);

	function proc(action, proto, def) {
		var i, c;

		if (bmoor.isArray(def)) {
			for (i = 0, c = def.length; i < c; i++) {
				action(proto, def[i]);
			}
		} else {
			action(proto, def);
		}
	}

	function maker(root, config, base) {
		if (!base) {
			base = function BmoorPrototype() {};

			if (config) {
				if (bmoor.isFunction(root)) {
					base = function BmoorPrototype() {
						root.apply(this, arguments);
					};

					base.prototype = Object.create(root.prototype);
				} else {
					base.prototype = Object.create(root);
				}
			} else {
				config = root;
			}
		}

		if (config.mixin) {
			proc(mixin, base.prototype, config.mixin);
		}

		if (config.decorate) {
			proc(decorate, base.prototype, config.decorate);
		}

		if (config.plugin) {
			proc(plugin, base.prototype, config.plugin);
		}

		return base;
	}

	maker.mixin = mixin;
	maker.decorate = decorate;
	maker.plugin = plugin;

	module.exports = maker;

/***/ },
/* 10 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var bmoor = __webpack_require__(4);

	module.exports = function (to, from) {
		bmoor.iterate(from, function (val, key) {
			to[key] = val;
		});
	};

/***/ },
/* 11 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

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

	module.exports = function (to, from, ctx) {
		bmoor.iterate(from, function (val, key) {
			override(key, to, val, ctx);
		});
	};

/***/ },
/* 12 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

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

	module.exports = function (to, from) {
		bmoor.iterate(from, function (val, key) {
			override(key, to, val);
		});
	};

/***/ },
/* 13 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

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

	module.exports = {
		trim: trim,
		ltrim: ltrim,
		rtrim: rtrim,
		getCommands: getCommands,
		getFormatter: getFormatter
	};

/***/ },
/* 14 */
/***/ function(module, exports) {

	"use strict";

	function always(promise, func) {
		promise.then(func, func);
		return promise;
	}

	module.exports = {
		always: always
	};

/***/ },
/* 15 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	module.exports = {
		Eventing: __webpack_require__(16)
	};

/***/ },
/* 16 */
/***/ function(module, exports) {

	"use strict";

	module.exports = {
		on: function on(event, cb) {
			var dis = this;

			if (!this._$listeners) {
				this._$listeners = {};
			}

			if (!this._$listeners[event]) {
				this._$listeners[event] = [];
			}

			this._$listeners[event].push(cb);

			return function clear$on() {
				dis._$listeners[event].splice(dis._$listeners[event].indexOf(cb), 1);
			};
		},
		subscribe: function subscribe(subscriptions) {
			var dis = this,
			    kills = [],
			    events = Object.keys(subscriptions);

			events.forEach(function (event) {
				var action = subscriptions[event];

				kills.push(dis.on(event, action));
			});

			return function killAll() {
				kills.forEach(function (kill) {
					kill();
				});
			};
		},
		trigger: function trigger(event) {
			var listeners,
			    i,
			    c,
			    args = Array.prototype.slice.call(arguments, 1);

			if (this._$listeners) {
				listeners = this._$listeners[event];

				if (listeners) {
					listeners = listeners.slice(0);
					for (i = 0, c = listeners.length; i < c; i++) {
						listeners[i].apply(this, args);
					}
				}
			}
		}
	};

/***/ },
/* 17 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	exports.sleep = sleep;
	exports.run = run;
	var bmoor = __webpack_require__(3),
	    Promise = __webpack_require__(18).Promise;

	// factory accepts cmd, args, config
	var event = exports.event = {
		factory: function factory(operation) {
			var element = operation.getArg(0),
			    eventType = operation.getArg(1);

			return function (datum) {
				bmoor.dom.triggerEvent(datum[element], eventType);
			};
		}
	};

	var addClass = exports.addClass = {
		factory: function factory(operation) {
			var element = operation.getArg(0),
			    className = operation.getArg(1);

			return function (datum) {
				className.split(' ').forEach(function (className) {
					bmoor.dom.addClass(datum[element], className);
				});
			};
		}
	};

	var removeClass = exports.removeClass = {
		factory: function factory(operation) {
			var element = operation.getArg(0),
			    className = operation.getArg(1);

			return function (datum) {
				className.split(' ').forEach(function (className) {
					bmoor.dom.removeClass(datum[element], className);
				});
			};
		}
	};

	var navigate = exports.navigate = {
		factory: function factory(operation) {
			var formatter = bmoor.string.getFormatter(operation.getArg(0));
			return function (datum) {
				window.location.hash = formatter(datum);
			};
		}
	};

	var focus = exports.focus = {
		factory: function factory(operation) {
			var focus = operation.getArg(0),
			    target = operation.getArg(1);

			return function (datum) {
				bmoor.dom.centerOn(datum[target], datum[focus]);
			};
		}
	};

	var orbit = exports.orbit = {
		factory: function factory(operation) {
			var focus = operation.getArg(0),
			    target = operation.getArg(1),
			    offset = operation.getArg(2);

			if (offset) {
				offset = parseInt(offset, 10);
			}

			return function (datum) {
				bmoor.dom.showOn(datum[target], datum[focus]);
			};
		}
	};

	var write = exports.write = {
		factory: function factory(operation) {
			var target = operation.getArg(0),
			    content = operation.getArg(1);

			return function (datum) {
				datum[target].innerHTML = datum[content];
			};
		}
	};

	var log = exports.log = {
		factory: function factory(operation) {
			var fn,
			    label = operation.getArg(0),
			    format = operation.getArg(1);

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

	function sleep(operation) {
		var time = parseInt(operation.getArg(0), 10);
		return function () {
			return new Promise(function (resolve) {
				setTimeout(function () {
					resolve();
				}, time);
			});
		};
	}
	sleep.bulk = true;

	function run(operation) {
		var cmd = operation.getNextArg(),
		    exec = bmoor.makeExec(cmd),
		    ops = operation.getJson() || [];

		return function (datum) {
			var res = exec(datum, ops);

			if (res && res.then) {
				return res;
			} else {
				return Promise.resolve();
			}
		};
	}

/***/ },
/* 18 */
/***/ function(module, exports, __webpack_require__) {

	var require;var __WEBPACK_AMD_DEFINE_RESULT__;/* WEBPACK VAR INJECTION */(function(process, global, module) {'use strict';

	var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

	/*!
	 * @overview es6-promise - a tiny implementation of Promises/A+.
	 * @copyright Copyright (c) 2014 Yehuda Katz, Tom Dale, Stefan Penner and contributors (Conversion to ES6 API by Jake Archibald)
	 * @license   Licensed under MIT license
	 *            See https://raw.githubusercontent.com/jakearchibald/es6-promise/master/LICENSE
	 * @version   3.2.1
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
	  var lib$es6$promise$asap$$isNode = typeof self === 'undefined' && typeof process !== 'undefined' && {}.toString.call(process) === '[object process]';

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
	      var vertx = __webpack_require__(21);
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

	    var child = new this.constructor(lib$es6$promise$$internal$$noop);

	    if (child[lib$es6$promise$$internal$$PROMISE_ID] === undefined) {
	      lib$es6$promise$$internal$$makePromise(child);
	    }

	    var state = parent._state;

	    if (state) {
	      var callback = arguments[state - 1];
	      lib$es6$promise$asap$$asap(function () {
	        lib$es6$promise$$internal$$invokeCallback(state, child, callback, parent._result);
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
	  var lib$es6$promise$$internal$$PROMISE_ID = Math.random().toString(36).substring(16);

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

	  var lib$es6$promise$$internal$$id = 0;
	  function lib$es6$promise$$internal$$nextId() {
	    return lib$es6$promise$$internal$$id++;
	  }

	  function lib$es6$promise$$internal$$makePromise(promise) {
	    promise[lib$es6$promise$$internal$$PROMISE_ID] = lib$es6$promise$$internal$$id++;
	    promise._state = undefined;
	    promise._result = undefined;
	    promise._subscribers = [];
	  }

	  function lib$es6$promise$promise$all$$all(entries) {
	    return new lib$es6$promise$enumerator$$default(this, entries).promise;
	  }
	  var lib$es6$promise$promise$all$$default = lib$es6$promise$promise$all$$all;
	  function lib$es6$promise$promise$race$$race(entries) {
	    /*jshint validthis:true */
	    var Constructor = this;

	    if (!lib$es6$promise$utils$$isArray(entries)) {
	      return new Constructor(function (resolve, reject) {
	        reject(new TypeError('You must pass an array to race.'));
	      });
	    } else {
	      return new Constructor(function (resolve, reject) {
	        var length = entries.length;
	        for (var i = 0; i < length; i++) {
	          Constructor.resolve(entries[i]).then(resolve, reject);
	        }
	      });
	    }
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
	    this[lib$es6$promise$$internal$$PROMISE_ID] = lib$es6$promise$$internal$$nextId();
	    this._result = this._state = undefined;
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

	    if (!this.promise[lib$es6$promise$$internal$$PROMISE_ID]) {
	      lib$es6$promise$$internal$$makePromise(this.promise);
	    }

	    if (lib$es6$promise$utils$$isArray(input)) {
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
	      lib$es6$promise$$internal$$reject(this.promise, lib$es6$promise$enumerator$$validationError());
	    }
	  }

	  function lib$es6$promise$enumerator$$validationError() {
	    return new Error('Array Methods must be provided an Array');
	  }

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
	  if ("function" === 'function' && __webpack_require__(22)['amd']) {
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
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(19), (function() { return this; }()), __webpack_require__(20)(module)))

/***/ },
/* 19 */
/***/ function(module, exports) {

	'use strict';

	// shim for using process in browser

	var process = module.exports = {};

	// cached from whatever global is present so that test runners that stub it
	// don't break things.  But we need to wrap it in a try catch in case it is
	// wrapped in strict mode code which doesn't define any globals.  It's inside a
	// function because try/catches deoptimize in certain engines.

	var cachedSetTimeout;
	var cachedClearTimeout;

	(function () {
	    try {
	        cachedSetTimeout = setTimeout;
	    } catch (e) {
	        cachedSetTimeout = function cachedSetTimeout() {
	            throw new Error('setTimeout is not defined');
	        };
	    }
	    try {
	        cachedClearTimeout = clearTimeout;
	    } catch (e) {
	        cachedClearTimeout = function cachedClearTimeout() {
	            throw new Error('clearTimeout is not defined');
	        };
	    }
	})();
	var queue = [];
	var draining = false;
	var currentQueue;
	var queueIndex = -1;

	function cleanUpNextTick() {
	    if (!draining || !currentQueue) {
	        return;
	    }
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
	    var timeout = cachedSetTimeout(cleanUpNextTick);
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
	    cachedClearTimeout(timeout);
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
	        cachedSetTimeout(drainQueue, 0);
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
/* 20 */
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
/* 21 */
/***/ function(module, exports) {

	/* (ignored) */

/***/ },
/* 22 */
/***/ function(module, exports) {

	module.exports = function() { throw new Error("define cannot be used indirect"); };


/***/ },
/* 23 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	exports.insert = insert;
	var Promise = __webpack_require__(18).Promise;

	function insert(operation, datum) {
		return new Promise(function (resolve) {
			resolve(datum[operation.getArg(0)]);
		});
	}

/***/ },
/* 24 */
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

	// these are performed to the whole data set
	function filter(operation, content) {
		var get = bmoor.makeGetter(operation.getArg(0));

		return content.filter(function (datum) {
			var fn = get(datum);

			return bmoor.isFunction(fn) ? fn(datum) : fn;
		});
	}

	function sort(operation, content) {
		var fn = bmoor.makeGetter(operation.getArg(0));

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

	function limit(operation, content) {
		var limit = parseInt(operation.getArg(0), 10),
		    start = parseInt(operation.getArg(1), 10);

		if (start) {
			return content.slice(start, start + limit);
		} else {
			return content.slice(0, limit);
		}
	}

	function permutate(operation, content) {
		var fns = {},
		    res = [],
		    mappings = operation.getJson();

		Object.keys(mappings).forEach(function (key) {
			fns[key] = bmoor.makeLoader(mappings[key]);
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

/***/ },
/* 25 */
/***/ function(module, exports) {

	'use strict';

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	var Operation = function () {
		function Operation(args) {
			_classCallCheck(this, Operation);

			this.rawArgs = this.raw = args;
			this.op = this.getNextArg();
		}

		_createClass(Operation, [{
			key: 'getOp',
			value: function getOp() {
				return this.op;
			}
		}, {
			key: 'getNextArg',
			value: function getNextArg() {
				var op,
				    pos = this.rawArgs.indexOf(':');

				if (pos !== -1) {
					op = this.rawArgs.substr(0, pos);
					this.rawArgs = this.rawArgs.substr(pos + 1);
				} else {
					op = this.rawArgs;
					this.rawArgs = '';
				}

				return op;
			}
		}, {
			key: 'sub',
			value: function sub(op, pos) {
				var child = new Operation(null);
				child.op = op;

				child.rawArgs = this.rawArgs;
				if (this.args) {
					child.args = this.args.slice(pos);
				}

				return child;
			}
		}, {
			key: 'getArg',
			value: function getArg(pos) {
				if (!this.args) {
					this.args = this.rawArgs.split(':');
				}

				return this.args[pos];
			}
		}, {
			key: 'getJson',
			value: function getJson() {
				if (this.json === undefined) {
					if (this.rawArgs) {
						try {
							this.json = JSON.parse(this.rawArgs);
						} catch (ex) {
							console.log('json parse', this.rawArgs);
							this.json = null;
						}
					} else {
						this.json = null;
					}
				}

				return this.json;
			}
		}]);

		return Operation;
	}();

	module.exports = Operation;

/***/ }
/******/ ]);