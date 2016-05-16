var bmoor = require('bmoor');

export function filter( cmd, args, content ){
	var fn = bmoor.makeGetter(args[0]||cmd.field);

	return content.filter(function( datum ){
		return fn(datum);
	});
}

export function sort( cmd, args, content ){
	var fn = bmoor.makeGetter(args[0]||cmd.field);

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

export function limit( cmd, args, content ){
	var limit = parseInt(args[0]||cmd.limit,10),
		start = parseInt(args[1]||cmd.start,10);

	if ( start ){
		return content.slice( start, start+limit );
	}else{
		return content.slice( 0, limit );
	}
}

export function permutate( cmd, args, content ){
	var fns = {},
		res = [];

	Object.keys(cmd.mappings).forEach(function( key ){
		fns[key] = bmoor.makeLoader( cmd.mappings[key] );
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