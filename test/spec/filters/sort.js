describe('scripz - filters - sort', function(){
	
	it('should be able to handle simple sorts', function( done ){
		var sc = new Scripz();
		sc.eval([{
			fetch: 'insert:test:content',
			content: [
				{ a:3 },
				{ a:1 },
				{ a:2 }
			],
			trans: 'sort:test.a'
		}]).then(function( res ){
			expect( res ).toEqual( [{test:{a:1}},{test:{a:2}},{test:{a:3}}] );
			done();
		});
	});

	it('should be able to handle alphabetic sorts', function( done ){
		var sc = new Scripz();
		sc.eval([{
			fetch: 'insert:test:content',
			content: [
				{ a:'z3' },
				{ a:'a1' },
				{ a:'m2' }
			],
			trans: 'sort:test.a'
		}]).then(function( res ){
			expect( res ).toEqual( [{test:{a:'a1'}},{test:{a:'m2'}},{test:{a:'z3'}}] );
			done();
		});
	});

	it('should be able to handle multi tiered sorts', function( done ){
		var sc = new Scripz();

		sc.eval([{
			fetch: 'insert:test:content',
			content: [
				{ a:{b:'z3'} },
				{ a:{b:'a1'} },
				{ a:{b:'m2'} }
			],
			trans: 'sort:test.a.b'
		}]).then(function( res ){
			expect( res ).toEqual( [{test:{a:{b:'a1'}}},{test:{a:{b:'m2'}}},{test:{a:{b:'z3'}}}] );
			done();
		});
	});
});