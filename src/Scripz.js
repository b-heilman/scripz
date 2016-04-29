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
		};

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

	eval( actions, keepBuffer ){
		var res,
			dis = this;

		this.buffer = keepBuffer ? this.buffer : null;

		function success( rtn ){
			dis.buffer = rtn;
			return dis.eval( actions, true );
		}

		function failure( error ){
			console.log( error );
		}

		try{
			while( res === undefined && actions.length ){
				res = this.run( actions.shift(), this.buffer );

				if ( res.then ){ // ok, a promise
					return res.then( success, failure );
				}else{ // ok, linear
					this.buffer = res;
					res = undefined;
				}
			}
		}catch( ex ){
			console.log( 'failed eval:', ex );
		}

		return Promise.resolve( this.buffer );
	}
}