describe('scripz - transformation - permutate', function(){
	
	it('should be able to handle simple sorts', function( done ){
		var sc = new Scripz();
		
		sc.eval([{
			fetch: 'insert:data:content',
			trans: 'permutate:{"field1":"data.a[]","field2":"data.b[]" }'
		}],
		{
			content: [
				{ a:[1,2], b:[3,4] },
				{ a:[5,6], b:[7,8] }
			]
		}).then(function( res ){
			expect( res.length ).toBe( 8 );
			expect( res[0].field1 ).toBe( 1 );
			expect( res[0].field2 ).toBe( 3 );
			expect( res[7].field1 ).toBe( 6 );
			expect( res[7].field2 ).toBe( 8 );
			done();
		});
	});
});