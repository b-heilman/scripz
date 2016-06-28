describe('scripz - editor - attribute', function(){
	it('should be able to interact with it', function(done){
		var sc = new Scripz();

		document.body.innerHTML = '<span><div id="hello"></div></span>';
		
		sc.eval([
			{
				edit:'select:element:#hello|attribute:echo:element:id'
			}
		]).then(
			function( matches ){
				expect( matches.length ).toBe( 1 );
				expect( matches[0].echo ).toBe( 'hello' );
				done();
			},
			function( error ){
				expect( error.message ).toBeUndefined();
				done();
			}
		);
	});
});