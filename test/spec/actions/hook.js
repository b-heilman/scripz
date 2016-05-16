describe('scripz - actions - hook', function(){
	it('Should be able to interact with it', function(done){
		var called = 0,
			sc = new Scripz();

		sc.debug = true;
		
		document.body.innerHTML = '<span>1</span><span>2</span><span>3</span><span>4</span>';
		
		sc.eval([{ 
			edit: 'select:junk:span',
			action: 'hook:test'
		}],
		{
			test:function(){
				called++;
			}
		}).then(
			function(){
				expect( called ).toBe( 4 );
				done();
			},
			function(){
				expect( false ).toBe( true );
				done();
			}
		);
	});
});
