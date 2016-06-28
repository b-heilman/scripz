describe('scripz - actions - run', function(){
	it('Should be able to run a method', function(done){
		var called = 0,
			sc = new Scripz();

		sc.debug = true;
		
		sc.eval([{
			fetch: 'insert:test:content',
			action: 'run:test.fn:["foo","bar"]'
		}],{
			content: [
				{ 
					fn: function( foo, bar ){
						expect( foo ).toBe('foo');
						expect( bar ).toBe('bar');
						return called++;
					}
				}
			]
		}).then(
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

	it('Should be able to interact with it', function(done){
		var called = 0,
			sc = new Scripz();

		sc.debug = true;
		
		document.body.innerHTML = '<span>1</span><span>2</span><span>3</span><span>4</span>';
		
		sc.eval([{ 
			edit: 'select:junk:span',
			action: 'run:test'
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
