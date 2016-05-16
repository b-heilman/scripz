var bmoor = require('bmoor'),
	Promise = require('es6-promise').Promise;

// factory accepts cmd, args, config
export var event = {
	factory: function( cmd, args ){
		var element = args[0]||cmd.element,
			eventType = args[1]||cmd.eventType;

		return function( datum ){
			bmoor.dom.triggerEvent( datum[element], eventType );
		};
	}
};

export var addClass = {
	factory: function( cmd, args ){
		var element = args[0]||cmd.element,
			className = args[1]||cmd.className;

		return function( datum ){
			className.split(' ').forEach(function( className ){
				bmoor.dom.addClass( datum[element], className );
			});
		};
	}
};

export var removeClass = {
	factory: function( cmd, args ){
		var element = args[0]||cmd.element,
			className = args[1]||cmd.className;

		return function( datum ){
			className.split(' ').forEach(function( className ){
				bmoor.dom.removeClass( datum[element], className );
			});
		};
	}
};

export var navigate = {
	factory: function( cmd, args ){
		var formatter = bmoor.string.getFormatter(args[0]||cmd.hash);
		return function( datum ){
			window.location.hash = formatter(datum);
		};
	}
};

export var log = {
	factory: function( cmd, args ){
		var fn,
			label = args[0]||cmd.label,
			format = args[1]||cmd.format;

		if ( format ){
			fn = bmoor.string.getFormatter(format);
		}

		return function( datum ){
			if ( fn ){
				if ( bmoor.isArrayLike(datum) ){
					bmoor.loop( datum, function( d ){
						console.log( label, fn(d) );
					});
				}else{
					console.log( label, fn(datum) );
				}
			}else{
				console.log( label, datum );
			}
		};
	},
	bulk: true
};

export function sleep( cmd, args ){
	return function(){
		return new Promise(function( resolve ){
			setTimeout( function(){ resolve(); }, parseInt(args[0],10) );
		});
	};
}
sleep.bulk = true;

export function run( cmd, args ){
	var exec = bmoor.makeExec( args[0]||cmd.method ),
		subs = args.slice(1);
	return function( datum ){
		var res = exec( datum, subs );

		if ( res && res.then ){
			return res;
		}else{
			return Promise.resolve();
		}
	};
}

export function hook( cmd, args, config ){
	var method = args[0]||cmd.method;
	return function( datum ){
		var res = config[method]( datum );

		if ( res && res.then ){
			return res;
		}else{
			return Promise.resolve();
		}
	};
}
