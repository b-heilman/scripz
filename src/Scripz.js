import * as baseEdits from './operations/editors.js';
import * as baseActions from './operations/actions.js';
import * as baseFetchers from './operations/fetchers.js';
import * as baseTransformations from './operations/transformations.js';

var bmoor = require('bmoor'),
	Promise = require('es6-promise').Promise,
	Operation = require('./Operation.js');

function parseOperations( operationLine ){
	var i, c,
		operations = operationLine.split('|');

	for( i = 0, c = operations.length; i < c; i++ ){
		operations[i] = new Operation( operations[i] );
	}

	return operations;
}

export default class Scripz {
	constructor( scripts ){
		var dis = this,
			memory = {},
			_edits = Object.create(baseEdits), // alter the array, return an array
			_scripts = scripts ? Object.create(scripts) : {},
			_actions = Object.create(baseActions), // return promise, do some action
			_fetchers = Object.create(baseFetchers), // return promise, with data
			_priority = null,
			_transformations = Object.create(baseTransformations); // make inline changes to the array

		_actions.series = {
			factory: function( operation ){
				var script = _scripts[operation.getArg(0)];

				return function( datum ){
					return dis.eval( script.slice(0), datum );
				};
			}
		};

		_actions.loop = {
			factory: function( operation, actions ){
				// args => loop count, series name, wait time between loops
				var count = parseInt(operation.getNextArg(),10),
					series = actions.series.factory( operation ),
					wait = parseInt(operation.getArg(1),10) || 0;

				return function looper( collection ){
					var i, c;

					// TODO : why did I do this?
					if ( !bmoor.isArrayLike(collection) ){
						collection = [collection];
					}

					i = 0;
					c = collection.length;

					function loop(){
						var iteration;

						if ( i < c ){
							return series( collection[i] ).then(function(){
								i++;
								return loop();
							});
						}else{
							if ( count === -1 ){
								iteration = 1;
							}else{
								count--;
								iteration = count;
							}
							
							if ( iteration > 0 ){
								i = 0;
								if ( wait ){
									return new Promise(function(resolve){
										setTimeout( function(){resolve(loop());}, wait );
									});
								}else{
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

		this.addFetcher = function( name, fetcher ){
			_fetchers[name] = fetcher;
		};

		this.addEditor = function( name, edit ){
			_edits[name] = edit;
		};

		this.addTransformation = function( name, transformation ){
			_transformations[name] = transformation;
		};

		this.addAction = function( name, action ){
			_actions[name] = action;
		};

		this.setScripts = function( input ){
			_scripts = Object.create( input );
		};

		this.addScript = function( name, actionList ){
			_scripts[name] = actionList;
		};

		function combine( base, value, field, agg ){
			if ( bmoor.isArrayLike(value) ){
				bmoor.loop( value, function( v ){
					var t = Object.create(base);

					t[field] = v;

					agg.push( t );
				});
			}else{
				base[field] = value;
				agg.push( base );
			}
		}

		function setupFetchers( operation ){
			var method = operation.getOp(),
				field = operation.getNextArg(),
				fn = _fetchers[method];

			if ( !field ){
				throw new Error('Fetchers require at least two arguments: '+event);
			}

			if ( fn ){
				return function( datum, agg ){
					return fn( operation, datum ).then(function( value ){
						combine( datum, value, field, agg );
					});
				};
			}else{
				throw new Error('Could not find loader ('+operation.getOp()+') '+operation.raw);
			}
		}

		// accept one datum, fetchers must always return arrays, even if just array of one
		function runFetchers( fetchers, content ){
			var i, c,
				fn = setupFetchers( fetchers.shift() ),
				req = [],
				agg = [];
			
			for( i = 0, c = content.length; i < c; i++ ){
				req.push( fn(content[i],agg) );
			}

			return Promise.all(req).then(function(){
				if ( fetchers.length ){
					return runFetchers( fetchers, agg );
				}else{
					return agg;
				}
			});
		}

		function doFetchers( command, content ){
			if ( command.fetch ){
				// always being a new load of data with a fresh collection
				return runFetchers( parseOperations(command.fetch), content );
			}else{
				// if no loading, don't make any changes
				return Promise.resolve( content );
			}
		}

		function setupTrans( operation ){
			var name = operation.getOp(),
				fn = _transformations[name];

			if ( fn ){
				return function( content ){
					return fn( operation, content );
				};
			}else{
				throw new Error('Could not find transformation ('+operation.getOp()+') '+operation.raw);
			}
		}

		// filters accept the full array, and return a full array
		function doTransformations( command, content ){
			var i, c,
				fn,
				transformations;

			if ( command.trans ){
				transformations = parseOperations(command.trans);
				for( i = 0, c = transformations.length; i < c; i++ ){
					fn = setupTrans( transformations[i] );
					content = fn( content );
				}
			}
			
			return content;
		}

		// transformations accept a datum, and return a datum
		function setupEdit( operation ){
			var method = operation.getOp(),
				field = operation.getNextArg(),
				fn = _edits[method];

			if ( !field ){
				throw new Error('Edits require at least two arguments: '+operation.raw);
			}

			if ( fn ){
				return function( datum, agg ){
					combine( datum, fn(operation,datum), field, agg );
				};
			}else{
				throw new Error('Could not find edit ('+operation.getOp()+') '+operation.raw);
			}
		}

		function doEdits( command, content ){
			var i, c,
				j, co,
				fn,
				agg,
				edits;

			if ( command.edit ){
				edits = parseOperations(command.edit);
				for( i = 0, c = edits.length; i < c; i++ ){
					fn = setupEdit( edits[i] );
					agg = [];
					for( j = 0, co = content.length; j < co; j++ ){
						fn( content[j], agg );
					}
					content = agg;
				}
			}
			
			return content;
		}

		function compileAction( action, operation ){
			// I'm allowing actions to be defined two ways, as a factory function with attributes, or an object
			if ( bmoor.isFunction(action) ){
				return action( operation, _actions );
			}else{
				return action.factory( operation, _actions );
			}
		}

		function compileActions( actions ){
			var bulk = [],
				datum = [];

			actions.forEach(function( operation ){
				var name = operation.getOp(),
					action = _actions[name];

				if ( action ){
					// actions will be run as bulk if they do not follow and datum types
					if ( action.bulk && datum.length === 0 ){
						bulk.push( compileAction(action,operation) );
					}else{
						datum.push( compileAction(action,operation) );
					}
				}else{
					throw new Error('Could not find op ('+operation.getOp()+') '+operation.raw);
				}
			});

			return { bulk: bulk, datum: datum };
		}

		function nextAction( actions ){
			if ( _priority ){
				return _priority;
			}else{
				return actions.shift();
			}
		}

		function runActionPath( actions, content ){
			var action = nextAction( actions );
			return Promise.resolve( action(content) ).then(function(){
				if ( actions.length ){
					return runActionPath( actions, content );
				}
			});
		}

		function runActions( actions, content, pos ){
			if ( actions.bulk.length ){
				return runActionPath( actions.bulk, content ).then(function(){
					return runActions( actions, content );
				});
			}else if ( actions.datum.length ){
				pos = pos||0;

				if ( pos < content.length ){
					return runActionPath( actions.datum.slice(0), content[pos] ).then(function(){
						return runActions( actions, content, pos+1 );
					});
				}
			}

			return Promise.resolve(); // all out of things to do
		}

		function doActions( command, content ){
			if ( command.action ){
				return runActions( compileActions(parseOperations(command.action)), content );
			}else{
				return Promise.resolve();
			}
		}

		this.run = function( cmd, config, content ){
			if ( cmd.subs ){
				Object.keys( cmd.subs ).forEach(function( key ){
					_scripts[key] = cmd.subs[key];
				});
			}

			if ( cmd.load ){
				content = memory[cmd.load];
				if ( !content ){
					throw new Error('memory read miss');
				}
			}else if ( cmd.set ){
				content = cmd.set;
			}else if ( !content || cmd.reset ){
				if ( config ){
					content = [ Object.create(config) ];
				}else{
					content = [ {} ];
				}
			}
		
			return doFetchers( cmd, content ).then(function( res ){
				var buffer = doTransformations( cmd, doEdits(cmd,res) );

				return doActions( cmd, buffer ).then(function(){
					if ( cmd.save ){
						memory[cmd.save] = buffer;
					}
					return buffer;
				});
			});
		};

		this.kill = function(){
			_priority = function(){
				_priority = null;
				throw new Error('kill signal');
			};
		};

		var unpause;
		this.pause = function(){
			var waiting = new Promise(function( resolve ){
					unpause = resolve;
				});

			_priority = function(){
				return waiting;
			};

			return function resume(){
				_priority = null;
				if ( unpause ){
					unpause();
				}
			};
		};
	}

	eval( commands, config, buffer ){
		var dis = this;

		function success( rtn ){
			if ( commands.length ){
				return dis.eval( commands, config, rtn );
			}else{
				return rtn;
			}
		}

		function failure( error ){
			if ( dis.debug ){
				console.log( error.message, error );
			}else{
				console.log( '-- scripz failed --');
			}

			while( commands.length ){
				commands.pop();
			}

			return Promise.reject( error );
		}

		// I want commands to be destructive here... unless I do this another way?
		try{
			return this.run( commands.shift(), config, buffer )
				.then( success, failure );
		}catch( ex ){
			return Promise.reject( ex );
		}
	}
}