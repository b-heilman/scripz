var bmoor = require('bmoor');

export function select( cmd, args, datum ){
	var node,
		fn = bmoor.string.getFormatter( args[0]||cmd.selector ),
		base = args[1]||cmd.base;

	if ( base ){
		node = datum[base];
	}else{
		node = document;
	}

	return node.querySelectorAll( fn(datum) );
}

export function format( cmd, args, datum ){
	var fn = bmoor.string.getFormatter( args[0]||cmd.format );

	return fn( datum );
}

export function attribute( cmd, args, datum ){
	var element = args[0]||cmd.element,
		field = args[1]||cmd.field;

	return datum[element].getAttribute( field );
}