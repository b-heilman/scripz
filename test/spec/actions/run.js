describe('scripz - actions - run', function(){
	it('Should be able to run a method', function(done){
		var called = 0,
			sc = new Scripz();

		sc.debug = true;
		
		sc.eval([{
			fetch: 'insert:test:content',
			content: [
				{ 
					fn: function(){
						return called++;
					}
				}
			],
			action: 'run:test.fn'
		}]).then(
			function(){
				expect( called ).toBe( 1 );
				done();
			},
			function(){
				expect( false ).toBe( true );
				done();
			}
		);
	});
});
