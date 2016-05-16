import * as baseEdits from './editors.js';
import * as baseActions from './actions.js';
import * as baseFetchers from './fetchers.js';
import * as baseTransformations from './transformations.js';

var bmoor = require('bmoor'),
	Promise = require('es6-promise').Promise;

export default class Scripz {
	constructor( scripts ){
		var dis = this,
			memory = {},
			_scripts = scripts ? Object.create(scripts) : {},
			_edits = Object.create(baseEdits), // alter the array, return an array
			_fetchers = Object.create(baseFetchers), // return promise, with data
			_actions = Object.create(baseActions), // return promise, do some action
			_priority = null,
			_transformations = Object.create(baseTransformations); // make inline changes to the array

		_actions.series = {
			factory: function( cmd, args, config ){
				var script = cmd.actions || _scripts[args[0]||cmd.name];

				return function( datum ){
					return dis.eval( script.slice(0), config, [datum] );
				};
			}
		};

		_actions.loop = {
			factory: function( cmd, args, config, actions ){
				// args => loop count, series name, wait time between loops
				var count = parseInt(args.shift()||cmd.limit,10),
					series = actions.series.factory( cmd, args, config ),
					wait = parseInt(args[1]||args.wait,10);

				return function looper( collection ){
					var i, c;

					// TODO : why did I do this?
					if ( !bmoor.isArrayLike(collection) ){
						collection = [collection];
					}

					i = 0;
					c = collection.length;

					function loop(){
						if ( i < c ){
							return series( collection[i] ).then(function(){
								i++;
								return loop();
							});
						}else{
							count--;
							if ( count ){
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

		function setupFetchers( event, config ){
			var args = event.split(':'),
				method = args.shift(),
				field = args.shift(),
				fn = _fetchers[method];

			if ( !field ){
				throw new Error('Fetchers require at least two arguments: '+event);
			}

			if ( fn ){
				return function( cmd, datum, agg ){
					return fn( cmd, args, datum, config ).then(function( value ){
						combine( datum, value, field, agg );
					});
				};
			}else{
				throw new Error('Could not find loader: '+event);
			}
		}

		// accept one datum, fetchers must always return arrays, even if just array of one
		function runFetchers( fetchers, command, content, config ){
			var i, c,
				fn = setupFetchers( fetchers.shift(), config ),
				req = [],
				agg = [];
			
			for( i = 0, c = content.length; i < c; i++ ){
				req.push( fn(command,content[i],agg) );
			}

			return Promise.all(req).then(function(){
				if ( fetchers.length ){
					return runFetchers( fetchers, command, agg, config );
				}else{
					return agg;
				}
			});
		}

		function doFetchers( command, content, config ){
			if ( command.fetch ){
				// always being a new load of data with a fresh collection
				return runFetchers( command.fetch.split('|'), command, content, config );
			}else{
				// if no loading, don't make any changes
				return Promise.resolve( content );
			}
		}

		function setupTrans( event, config ){
			var args = event.split(':'),
				name = args.shift(),
				fn = _transformations[name];

			if ( fn ){
				return function( cmd, datum ){
					return fn( cmd, args, datum, config );
				};
			}else{
				throw new Error('Could not find transformation: '+event);
			}
		}

		// filters accept the full array, and return a full array
		function doTransformations( command, content, config ){
			var i, c,
				fn,
				transformations;

			if ( command.trans ){
				transformations = command.trans.split('|');
				for( i = 0, c = transformations.length; i < c; i++ ){
					fn = setupTrans( transformations[i], config );
					content = fn( command, content );
				}
			}
			
			return content;
		}

		// transformations accept a datum, and return a datum
		function setupEdit( event, config ){
			var args = event.split(':'),
				method = args.shift(),
				field = args.shift(),
				fn = _edits[method];

			if ( !field ){
				throw new Error('Edits require at least two arguments: '+event);
			}

			if ( fn ){
				return function( cmd, datum, agg ){
					combine( datum, fn(cmd,args,datum,config), field, agg );
				};
			}else{
				throw new Error('Could not find edit: '+event);
			}
		}

		function doEdits( command, content, config ){
			var i, c,
				j, co,
				fn,
				agg,
				edits;

			if ( command.edit ){
				edits = command.edit.split('|');
				for( i = 0, c = edits.length; i < c; i++ ){
					fn = setupEdit( edits[i], config );
					agg = [];
					for( j = 0, co = content.length; j < co; j++ ){
						fn( command, content[j], agg );
					}
					content = agg;
				}
			}
			
			return content;
		}

		function compileAction( def, command, args, config ){
			// I'm allowing actions to be defined two ways, as a factory function with attributes, or an object
			if ( bmoor.isFunction(def) ){
				return def( command, args, config, _actions );
			}else{
				return def.factory( command, args, config, _actions );
			}
		}

		function compileActions( actions, command, config ){
			var bulk = [],
				datum = [];

			actions.forEach(function( act ){
				var args = act.split(':'),
					name = args.shift(),
					action = _actions[name];

				if ( action ){
					// actions will be run as bulk if they do not follow and datum types
					if ( action.bulk && datum.length === 0 ){
						bulk.push( compileAction(action,command,args,config) );
					}else{
						datum.push( compileAction(action,command,args,config) );
					}
				}else{
					throw new Error('Could not find: '+name+' from '+JSON.stringify(command));
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

		function doActions( command, content, config ){
			if ( command.action ){
				return runActions( compileActions(command.action.split('|'),command,config), content );
			}else{
				return Promise.resolve();
			}
		}

		this.run = function( cmd, content, config ){
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
				content = [{}];
			}
		
			return doFetchers( cmd, content, config ).then(function( res ){
				var buffer = doTransformations( cmd, doEdits(cmd,res,config), config );

				return doActions( cmd, buffer, config ).then(function(){
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

		try{
			return this.run( commands.shift(), buffer, config )
				.then( success, failure );
		}catch( ex ){
			return Promise.reject( ex );
		}
	}
}