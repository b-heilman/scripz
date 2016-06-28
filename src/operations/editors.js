var bmoor = require('bmoor');

export function select( operation, datum ){
	var node,
		fn = bmoor.string.getFormatter( operation.getArg(0) ),
		base = operation.getArg(1);

	if ( base ){
		node = datum[base];
	}else{
		node = document;
	}

	return bmoor.dom.getDomCollection( fn(datum) );
}

export function format( operation, datum ){
	var fn = bmoor.string.getFormatter( operation.getArg(0) );

	return fn( datum );
}

export function attribute( operation, datum ){
	var element = operation.getArg(0),
		field = operation.getArg(1);

	return datum[element].getAttribute( field );
}