var Promise = require('es6-promise').Promise;

export function insert( operation, datum ){
	return new Promise(function( resolve ){
		resolve( datum[operation.getArg(0)] );
	});
}