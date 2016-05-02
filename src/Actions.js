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

export function navigate( cmd, content ){
	return new Promise(function( resolve ){
		var i = 0;
		
		function makeCall(){
			if ( i === content.length ){
				resolve( content );
			}else{
				window.location.hash = cmd.hash.replace(/@1/g,content[i]);

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

export function log( cmd, content ){
	console.log( cmd.label, content );

	return content;
}
