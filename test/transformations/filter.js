describe('scripz - trans - filter', function(){
	
	it('should be able to handle simple sorts', function( done ){
		var sc = new Scripz();
		sc.eval([{
			fetch: 'insert:test:content',
			trans: 'filter:test.a'
		}],{
			content: [
				{ a:3 },
				{ a:0 },
				{ a:2 }
			]
		}).then(function( res ){
			expect( res ).toEqual( [{test:{a:3}},{test:{a:2}}] );
			done();
		});
	});

	it('should be able to handle alphabetic sorts', function( done ){
		var sc = new Scripz();
		sc.eval([{
			fetch: 'insert:test:content',
			trans: 'filter:isA1'
		}],{
			isA1 : function( datum ){
				return datum.test.a === 'a1';
			},
			content: [
				{ a:'z3' },
				{ a:'a1' },
				{ a:'m2' }
			]
		}).then(function( res ){
			expect( res ).toEqual( [{test:{a:'a1'}}] );
			done();
		});
	});
});