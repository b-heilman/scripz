describe('scripz - trans - limit', function(){
	
	it('should be able a simple limit', function( done ){
		var sc = new Scripz();
		sc.eval([{
			fetch: 'insert:test:content',
			trans: 'limit:2'
		}],{
			content: [
				{ a:3 },
				{ a:0 },
				{ a:2 }
			]
		}).then(function( res ){
			expect( res ).toEqual( [{test:{a:3}},{test:{a:0}}] );
			done();
		});
	});

	it('should be able a simple limit starting at a position', function( done ){
		var sc = new Scripz();
		sc.eval([{
			fetch: 'insert:test:content',
			trans: 'limit:2:1'
		}],{
			content: [
				{ a:3 },
				{ a:0 },
				{ a:2 }
			]
		}).then(function( res ){
			expect( res ).toEqual( [{test:{a:0}},{test:{a:2}}] );
			done();
		});
	});
});