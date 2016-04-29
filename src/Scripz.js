import * as baseActions from './Actions.js';

var Promise = require('es6-promise').Promise;

export default class Scripz {
	constructor( base ){
		var memory = {},
		actions;

		if ( base instanceof Scripz ){
			base = base.getActions();
		}

		actions = Object.create(base||baseActions);

		actions.save = function( cmd, buffer ){
			memory[ cmd.as ] = buffer;
			return buffer;
		};

		actions.load = function( cmd ){
			return memory[cmd.from];
		}

		this.getActions = function(){
			return actions;
		};
	}

	run( cmd, content ){
		var res,
			action = this.getActions()[cmd.action];

		if ( action ){
			res = action( cmd, content, this );
			if ( cmd.clean ){
				res = content;
			}
		}else{
			console.log('Could not find action:'+cmd.action);
			// how to fail
		}

		return res;
	}

	eval( actions, keepBuffer ){
		var res,
			dis = this;

		this.buffer = keepBuffer ? this.buffer : null;

		try{
			while( res === undefined && actions.length ){
				res = this.run( actions.shift(), this.buffer );

				if ( res.then ){ // ok, a promise
					return res.then(
						function( rtn ){
							dis.buffer = rtn;
							return dis.eval( actions, true );
						},
						function( error ){
							console.log( error );
						}
					);
				}else{ // ok, linear
					this.buffer = res;
					res = undefined;
				}
			}
		}catch( ex ){
			console.log( 'failed eval:', ex );
		}

		return Promise.resolve( res );
	}
}