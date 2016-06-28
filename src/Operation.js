
class Operation{
	constructor( args ){
		this.rawArgs = this.raw = args;
		this.op = this.getNextArg();
	}

	getOp(){
		return this.op;
	}

	getNextArg(){
		var op,
			pos = this.rawArgs.indexOf(':');

		if ( pos !== -1 ){
			op = this.rawArgs.substr(0,pos);
			this.rawArgs = this.rawArgs.substr(pos+1);
		}else{
			op = this.rawArgs;
			this.rawArgs = '';
		}

		return op;
	}

	sub( op, pos ){
		var child = new Operation(null);
		child.op = op;

		child.rawArgs = this.rawArgs;
		if ( this.args ){
			child.args = this.args.slice( pos );
		}

		return child;
	}

	getArg( pos ){
		if ( !this.args ){
			this.args = this.rawArgs.split(':');
		}

		return this.args[pos];
	}

	getJson(){
		if ( this.json === undefined ){
			if ( this.rawArgs ){
				try{
					this.json = JSON.parse( this.rawArgs );
				}catch( ex ){
					console.log( 'json parse', this.rawArgs );
					this.json = null;
				}
			}else{
				this.json = null;
			}
		}

		return this.json;
	}
}

module.exports = Operation;