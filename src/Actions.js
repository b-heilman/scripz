var bmoor = require('bmoor'),
	Promise = require('es6-promise').Promise;

export function select( cmd, content ){
	var res;

	if ( content ){
		res = [];
		content.forEach(function( element ){
			res = res.merge( element.querySelectorAll(cmd.selector) );
		});
	}else{
		res = document.querySelectorAll( cmd.selector );
	}

	return res;
}

export function event( cmd, content ){
	content.forEach(function( element ){
		bmoor.dom.triggerEvent( element, cmd.eventType );
	});

	return content;
}

export function addClass( cmd, content ){
	cmd.className.split(' ').forEach(function( className ){
		content.forEach(function( element ){
			bmoor.dom.addClass( element, className );
		});
	});
	
	return content;
}

export function removeClass( cmd, content ){
	cmd.className.split(' ').forEach(function( className ){
		content.forEach(function( element ){
			bmoor.dom.removeClass( element, className );
		});
	});

	return content;
}

export function sleep( cmd, content ){
	return new Promise(function( resolve ){
		setTimeout( function(){ resolve(content); }, cmd.wait );
	});
}

function doVariable( lines ){
	var t,
		getter,
		line,
		dex,
		fn;

	if ( !lines.length ){
		return function(){
			return '';
		};
	}else{
		line = lines.shift();
		dex = line.indexOf('}}');
		fn = doVariable(lines);

		if ( dex === -1 ){
			return function(){
				return '--no close--';
			};
		}else if ( dex === 0 ){
			return function( obj ){
				return obj+fn(obj);
			};
		}else{
			t = line.substr(0,dex);
			getter = bmoor.makeGetter(t);
			line = line.substr(dex+2);
			return function( obj ){
				return getter(obj)+line+fn(obj);
			};
		}
	}
}

function getFormatter( str ){
	var fn,
		lines = str.split(/{{/g);

	if ( lines.length > 1 ){
		str = lines.shift();
		fn = doVariable( lines );

		return function( obj ){
			return str + fn( obj );
		};
	}else{
		return function(){
			return str;
		};
	}
}

export function log( cmd, content ){
	var fn;

	if ( cmd.content ){
		fn = getFormatter(cmd.content);

		content.forEach(function( c ){
			console.log( cmd.label, fn(c) );
		});
	}else{
		console.log( cmd.label, content );
	}

	return content;
}

export function navigate( cmd, content ){
	return new Promise(function( resolve ){
		var i = 0,
			formatter = getFormatter(cmd.hash);
		
		function makeCall(){
			if ( i === content.length ){
				resolve( content );
			}else{
				window.location.hash = formatter(content[i]);

				i++;

				if ( cmd.wait ){
					setTimeout( makeCall, cmd.wait );
				}else{
					makeCall();
				}
			}
		}

		makeCall();
	});
}

export function series( cmd, content, scripz ){
	return new Promise(function( resolve ){
		var i = 0, c = content.length,
			t;

		function run(){
			if ( i < c ){
				scripz.buffer = [ content[i] ];
				t = scripz.eval( cmd.actions.slice(0), true );

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

		run();
	});
}

export function insert( cmd ){
	return cmd.content;
}

export function value( cmd, content ){
	var i, c,
		targ,
		res = [];

	for( i = 0, c = content.length; i < c; i++ ){
		targ = content[i];

		if ( cmd.field ){
			res.push(targ[cmd.field]);
		}else if ( targ.getAttribute ){
			res.push(targ.getAttribute(cmd.attribute||'value'));
		}else if ( 'value' in targ ){
			res.push(targ.value);
		}
	}

	return res;
}

export function run( cmd, collection ){
    var res = [];

    collection.forEach(function( datum ){
        res.push(datum[cmd.method]());
    });

    return Promise.all(res);
}

export function filter( cmd, collection ){
	var fn = bmoor.makeGetter(cmd.field);

    return collection.filter(function( datum ){
        return fn(datum);
    });
}

export function sort( cmd, collection ){
	var fn = bmoor.makeGetter(cmd.field);

    return collection.sort(function( a, b ){
        return fn(a) - fn(b);
    });
}

export function permutate( cmd, collection ){
	var fns = {},
		res = [];

	Object.keys(cmd).forEach(function( key ){
		if ( key !== 'action' ){
			fns[key] = bmoor.makeLoader( cmd[key] );
		}
	});

	collection.forEach(function( datum ){
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
