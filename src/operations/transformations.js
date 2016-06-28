var bmoor = require('bmoor');

// these are performed to the whole data set
export function filter( operation, content ){
	var get = bmoor.makeGetter( operation.getArg(0) );

	return content.filter(function( datum ){
		var fn = get(datum);

		return bmoor.isFunction(fn) ? fn(datum) : fn;
	});
}

export function sort( operation, content ){
	var fn = bmoor.makeGetter( operation.getArg(0) );

	return content.sort(function( a, b ){
		a = fn(a);
		b = fn(b);

		if ( a < b ){
			return -1;
		}else if ( a > b ){
			return 1;
		}else{
			return 0;
		}
	});
}

export function limit( operation, content ){
	var limit = parseInt(operation.getArg(0),10),
		start = parseInt(operation.getArg(1),10);

	if ( start ){
		return content.slice( start, start+limit );
	}else{
		return content.slice( 0, limit );
	}
}

export function permutate( operation, content ){
	var fns = {},
		res = [],
		mappings = operation.getJson();

	Object.keys(mappings).forEach(function( key ){
		fns[key] = bmoor.makeLoader( mappings[key] );
	});

	bmoor.loop(content,function( datum ){
		var child = [];

		Object.keys(fns).forEach(function( key ){
			var t = [],
				fn = fns[key],
				values = fn( datum );

			if ( child.length ){
				child.forEach(function( p ){
					values.forEach(function( v ){
						var proto = Object.create(p);
						proto[key] = v;
						t.push( proto );
					});
				});
			}else{
				values.forEach(function( v ){
					var proto = {};
					proto[key] = v;
					t.push( proto );
				});
			}

			child = t;
		});

		res = res.concat( child );
	});

	return res;
}