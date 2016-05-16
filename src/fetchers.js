var Promise = require('es6-promise').Promise;

export function insert( cmd, args ){
	return new Promise(function( resolve ){
		resolve( cmd[args[0]] );
	});
}

export function conf( cmd, args, datum, config ){
	return new Promise(function( resolve ){
		resolve( config[args[0]] );
	});
}