import * as baseActions from './Actions.js';

var Promise = require('es6-promise').Promise;

export default class Scripz {
	constructor( subs ){
		var dis = this,
			memory = {},
			series = subs ? Object.create(subs) : {},
			actions = Object.create(baseActions);

		actions.save = function( cmd, buffer ){
			memory[ cmd.as ] = buffer;
			return buffer;
		};

		actions.load = function( cmd ){
			return memory[cmd.from];
		};

		actions.series = function( cmd, content ){
			return new Promise(function( resolve ){
				var t,
					i = 0, c = content.length;

				function run(){
					if ( i < c ){
						if ( cmd.actions ){
							t = dis.eval( cmd.actions.slice(0), [content[i]] );
						}else{
							t = dis.eval( series[cmd.name].slice(0), [content[i]] );
						}

						i++;

						if ( t.then ){
							t.then(run);
						}else{
							run();
						}
					}else{
						resolve( content );
					}
				}

				if ( cmd.actions && cmd.name ){
					series[cmd.name] = cmd.actions;
					resolve( content );
				}else{
					run();
				}
			});
		};

		actions.loop = function( cmd, content ){
			return new Promise(function( resolve ){
				var i = -1;

				function run(){
					i++;

					if ( i < cmd.limit ){
						return actions.series( cmd, content ).then(function(){
							if ( cmd.wait ){
								setTimeout(run,cmd.wait);
							}else{
								run();
							}
						});
					}else{
						resolve(content);
					}
				}

				run();
			});
		};

		this.addAction = function( name, action ){
			actions[name] = action;
		};

		this.run = function( cmd, content ){
			var action = actions[cmd.action];

			if ( action ){
				return action( cmd, content, this );
			}else{
				throw new Error('Could not find action:'+cmd.action);
			}
		};

		this.kill = function(){
			this._priority = function(){
				throw new Error('ending series');
			};
		};

		var unpause;
		this.pause = function(){
			var waiting = new Promise(function( resolve ){
					unpause = resolve;
				});

			this._priority = function(){
				return waiting;
			};

			return function resume(){
				dis._priority = null;
				if ( unpause ){
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

	eval( actionPath, buffer ){
		var res,
			dis = this;

		if ( !buffer ){
			buffer = [];
		}

		function success( rtn ){
			if ( rtn ){
				buffer = rtn;
			}
			return dis.eval( actionPath, buffer );
		}

		function failure( error ){
			console.log( error );

			while( actionPath.length ){
				actionPath.pop();
			}

			return Promise.reject( error );
		}

		try{
			while( res === undefined && actionPath.length ){
				if ( this._priority ){
					res = this._priority();
				}else{
					res = this.run( actionPath.shift(), buffer );
				}	

				if ( res.then ){ // ok, a promise
					return res.then( success, failure );
				}else{ // ok, linear
					buffer = res;
					res = undefined;
				}
			}
		}catch( ex ){
			return failure( ex );
		}

		return Promise.resolve( buffer );
	}
}