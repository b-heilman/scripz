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
	    Promise = __webpack_require__(5).Promise;

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
	exports.hook = hook;
	var bmoor = __webpack_require__(3),
	    Promise = __webpack_require__(5).Promise;

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
	exports.conf = conf;
	var Promise = __webpack_require__(5).Promise;

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