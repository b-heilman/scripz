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

	var _editors = __webpack_require__(2);

	var baseEdits = _interopRequireWildcard(_editors);

	var _actions2 = __webpack_require__(4);

	var baseActions = _interopRequireWildcard(_actions2);

	var _fetchers2 = __webpack_require__(6);

	var baseFetchers = _interopRequireWildcard(_fetchers2);

	var _transformations2 = __webpack_require__(7);

	var baseTransformations = _interopRequireWildcard(_transformations2);

	function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	var bmoor = __webpack_require__(3),
	    Promise = __webpack_require__(5).Promise,
	    Operation = __webpack_require__(8);

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
/***/ function(module, exports) {

	module.exports = bmoor;

/***/ },
/* 4 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	exports.sleep = sleep;
	exports.run = run;
	var bmoor = __webpack_require__(3),
	    Promise = __webpack_require__(5).Promise;

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
/* 5 */
/***/ function(module, exports) {

	module.exports = ES6Promise;

/***/ },
/* 6 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	exports.insert = insert;
	var Promise = __webpack_require__(5).Promise;

	function insert(operation, datum) {
		return new Promise(function (resolve) {
			resolve(datum[operation.getArg(0)]);
		});
	}

/***/ },
/* 7 */
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
/* 8 */
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