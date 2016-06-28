var bmoor = require('bmoor'),
	Promise = require('es6-promise').Promise;

// factory accepts cmd, args, config
export var event = {
	factory: function( operation ){
		var element = operation.getArg(0),
			eventType = operation.getArg(1);

		return function( datum ){
			bmoor.dom.triggerEvent( datum[element], eventType );
		};
	}
};

export var addClass = {
	factory: function( operation ){
		var element = operation.getArg(0),
			className = operation.getArg(1);

		return function( datum ){
			className.split(' ').forEach(function( className ){
				bmoor.dom.addClass( datum[element], className );
			});
		};
	}
};

export var removeClass = {
	factory: function( operation ){
		var element = operation.getArg(0),
			className = operation.getArg(1);

		return function( datum ){
			className.split(' ').forEach(function( className ){
				bmoor.dom.removeClass( datum[element], className );
			});
		};
	}
};

export var navigate = {
	factory: function( operation ){
		var formatter = bmoor.string.getFormatter(operation.getArg(0));
		return function( datum ){
			window.location.hash = formatter(datum);
		};
	}
};

export var focus = {
	factory: function( operation ){
		var focus = operation.getArg(0),
			target = operation.getArg(1);

		return function( datum ){
			bmoor.dom.centerOn( datum[target], datum[focus] );
		};
	}
};

export var orbit = {
	factory: function( operation ){
		var focus = operation.getArg(0),
			target = operation.getArg(1),
			offset = operation.getArg(2);

		if ( offset ){
			offset = parseInt( offset, 10 );
		}

		return function( datum ){
			bmoor.dom.showOn( datum[target], datum[focus] );
		};
	}
};

export var write = {
	factory: function( operation ){
		var target = operation.getArg(0),
			content = operation.getArg(1);

		return function( datum ){
			datum[target].innerHTML = datum[content];
		};
	}
};

export var log = {
	factory: function( operation ){
		var fn,
			label = operation.getArg(0),
			format = operation.getArg(1);

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

export function sleep( operation ){
	var time = parseInt(operation.getArg(0),10);
	return function(){
		return new Promise(function( resolve ){
			setTimeout( function(){ resolve(); }, time );
		});
	};
}
sleep.bulk = true;

export function run( operation ){
	var cmd = operation.getNextArg(),
		exec = bmoor.makeExec( cmd ),
		ops = operation.getJson() || [];

	return function( datum ){
		var res = exec( datum, ops );

		if ( res && res.then ){
			return res;
		}else{
			return Promise.resolve();
		}
	};
}
