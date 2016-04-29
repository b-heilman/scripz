describe('Scripz.dom', function(){
	it('Should be able to interact with it', function(done){
		var sc = new Scripz();

		document.body.innerHTML = '<span><div id="hello"></div></span>';
		
		sc.eval([{action:'select', selector:'#hello'}]).then(
			function( matches ){
				expect( matches.length ).toBe( 1 );
				expect( matches[0].nodeType ).toBeDefined();
				done();
			},
			function( error ){
				console.log( error );
				done();
			}
		);
	});
});
