describe('scripz - fetchers - insert', function(){
	it('should be able to insert content', function( done ){
		var sc = new Scripz();

		sc.eval([
			{ fetch: 'insert:test:content' }
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
});
