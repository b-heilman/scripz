describe('Scripz', function(){
	it('Should be defined', function(){
		expect( Scripz ).toBeDefined();
	});

	it('Should also have Promises defined', function(){
		expect( Promise ).toBeDefined();
	});

	it('Should fail if an undefined action is called', function( done ){
		var scripz = new Scripz();

		scripz.eval([
			{ action: 'DNE' }
		]).then(
			function(){
				expect( false ).toBe( true );
				done();
			},
			function(){
				expect( true ).toBe( true );
				done();
			}
		);
	});

	it('Should fail if an undefined fetch is called', function( done ){
		var scripz = new Scripz();

		scripz.eval([
			{ fetch: 'DNE' }
		]).then(
			function(){
				expect( false ).toBe( true );
				done();
			},
			function(){
				expect( true ).toBe( true );
				done();
			}
		);
	});

	it('Should fail if an undefined trans is called', function( done ){
		var scripz = new Scripz();

		scripz.eval([
			{ trans: 'DNE' }
		]).then(
			function(){
				expect( false ).toBe( true );
				done();
			},
			function(){
				expect( true ).toBe( true );
				done();
			}
		);
	});

	it('Should fail if an undefined edit is called', function( done ){
		var scripz = new Scripz();

		scripz.eval([
			{ edit: 'DNE' }
		]).then(
			function(){
				expect( false ).toBe( true );
				done();
			},
			function(){
				expect( true ).toBe( true );
				done();
			}
		);
	});

	it('should allow new fetchers to be defined', function( done ){
		var scripz = new Scripz();

		scripz.addFetcher( 'test', function( operation, datum ){
			expect( operation.getOp ).toBeDefined();
			expect( operation.getArg(0) ).toBe('foobar');
			expect( datum.root ).toBe( true );
			return Promise.resolve([
				{ hello: 'world' },
				{ foo: 'bar' }
			]);
		});

		scripz.eval([
			{ fetch: 'test:sample:foobar' }
		],
		{
			root: true
		}).then(
			function( res ){
				expect( res.length ).toBe( 2 );
				expect( res[0].root ).toBe( true );
				expect( res[0].sample.hello ).toBe( 'world' );
				expect( res[1].root ).toBe( true );
				expect( res[1].sample.foo ).toBe( 'bar' );

				done();
			},
			function( error ){
				console.log( error.message );
				console.log( error )
				expect( false ).toBe( true );
				done();
			}
		);
	});

	it('should allow new editors to be defined', function( done ){
		var scripz = new Scripz();

		scripz.addEditor( 'test', function( operation, datum ){
			expect( operation.getOp ).toBeDefined();
			expect( operation.getArg(0) ).toBe('foobar');
			expect( datum.root ).toBe( true );
			return 'test';
		});

		scripz.eval([
			{ edit: 'test:sample:foobar' }
		],
		{
			root: true
		}).then(
			function( res ){
				expect( res.length ).toBe( 1 );
				expect( res[0].root ).toBe( true );
				expect( res[0].sample ).toBe( 'test' );

				done();
			},
			function( error ){
				console.log( error.message );
				console.log( error )
				expect( false ).toBe( true );
				done();
			}
		);
	});

	it('should allow new transformations to be defined', function( done ){
		var scripz = new Scripz();

		scripz.addTransformation( 'test', function( operation, collection ){
			expect( operation.getOp ).toBeDefined();
			expect( operation.getArg(0) ).toBe('sample');
			expect( collection.length ).toBe( 1 );
			expect( collection[0].root ).toBe( true );
			return [
				{user:1},
				{user:2}
			];
		});

		scripz.eval([
			{ trans: 'test:sample:foobar' }
		],
		{
			root: true
		}).then(
			function( res ){
				expect( res.length ).toBe( 2 );
				expect( res[0].user ).toBe( 1 );
				expect( res[1].user ).toBe( 2 );

				done();
			},
			function( error ){
				console.log( error.message );
				console.log( error )
				expect( false ).toBe( true );
				done();
			}
		);
	});

	it('should allow new actions to be defined', function( done ){
		var scripz = new Scripz(),
			outerCount = 0,
			innerCount = 0;

		scripz.addAction( 'test', function( operation ){
			innerCount++;
			return function( datum ){
				outerCount++;
				expect( operation.getOp ).toBeDefined();
				expect( operation.getArg(0) ).toBe('sample');
				expect( datum.root ).toBe( true );
				
				return Promise.resolve({foo:'bar'});
			};
		});

		scripz.eval([
			{ action: 'test:sample:foobar' }
		],
		{
			root: true
		}).then(
			function( res ){
				expect( innerCount ).toBe( 1 );
				expect( outerCount ).toBe( 1 );
				expect( res.length ).toBe( 1 );
				expect( res.length ).toBe( 1 );
				expect( res[0].root ).toBe( true );
				expect( res[0].sample ).toBeUndefined();

				done();
			},
			function( error ){
				console.log( error.message );
				console.log( error )
				expect( false ).toBe( true );
				done();
			}
		);
	});
});
