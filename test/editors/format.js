describe('scripz - edit - format', function(){
	it('should be able to select with a translation', function(done){
		var sc = new Scripz();

		sc.eval([
			{
				edit:'format:formatted:{{foo}} - {{bar}}'
			}
		],{
			foo:'eins',
			bar:'zwei'
		}).then(
			function( matches ){
				expect( matches.length ).toBe( 1 );
				expect( matches[0].formatted ).toBe( 'eins - zwei' );
				done();
			},
			function( error ){
				expect( error.message ).toBeUndefined();
				done();
			}
		);
	});
});