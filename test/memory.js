describe('scripz - memory', function(){
	it('should be able to save to memory without changing buffer', function( done ){
		var sc = new Scripz();

		sc.eval([
			{ fetch: 'insert:test:content', save: 'memory' }
		],{
			content: [0,1,2,3]
		}).then(
			function( buffer ){
				expect( buffer ).toEqual( [{test:0},{test:1},{test:2},{test:3}] );
				done();
			},
			function( error ){
				console.log( error.message, error );
				done();
			}
		);
	});

	it('should be able to save to memory, fetch it back', function( done ){
		var sc = new Scripz();

		sc.eval([
			{ fetch: 'insert:test:content', save: 'memory' },
			{ reset: true },
			{ load: 'memory' }
		],{
			content: [0,1,2,3]
		}).then(
			function( buffer ){
				expect( buffer ).toEqual( [{test:0},{test:1},{test:2},{test:3}] );
				done();
			},
			function( error ){
				console.log( error.message, error );
				done();
			}
		);
	});

	it('should be able to save to memory, fetch it back', function( done ){
		var sc = new Scripz();

		sc.eval([
			{ fetch: 'insert:test:content' },
			{ load: 'bar' }
		],{
			content: [0,1,2,3]
		}).then(
			function( buffer ){
				expect( false ).toEqual( true );
				done();
			},
			function( error ){
				expect( true ).toEqual( true );
				done();
			}
		);
	});
});