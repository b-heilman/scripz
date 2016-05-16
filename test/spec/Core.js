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
});
