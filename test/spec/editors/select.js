describe('scripz - load - select', function(){
	it('should be able to interact with it', function(done){
		var sc = new Scripz();

		document.body.innerHTML = '<span><div id="hello"></div></span>';
		
		sc.eval([
			{
				edit:'select:element', selector:'#hello'
			}
		]).then(
			function( matches ){
				expect( matches.length ).toBe( 1 );
				expect( matches[0].element ).toBeDefined();
				done();
			},
			function( error ){
				expect( error.message ).toBeUndefined();
				done();
			}
		);
	});

	it('should be able to select with a translation', function(done){
		var sc = new Scripz();

		document.body.innerHTML = '<span><div id="hello"></div></span>';
		
		sc.eval([
			{
				fetch: 'insert:test:content',
				content: ['hello'],
				edit:'select:element:#{{test}}'
			}
		]).then(
			function( matches ){
				expect( matches.length ).toBe( 1 );
				expect( matches[0].element ).toBeDefined();
				done();
			},
			function( error ){
				expect( error.message ).toBeUndefined();
				done();
			}
		);
	});

	it('should be able to add a class', function(done){
		var sc = new Scripz();

		document.body.innerHTML = '<span><div id="hello"></div></span>';
		
		sc.eval([
			{
				edit: 'select:element:#hello', 
				action:'addClass:element:woot'
			}
		]).then(
			function( matches ){
				expect( matches.length ).toBe( 1 );
				expect( matches[0].element.className ).toBe(' woot');
				done();
			},
			function( error ){
				expect( error.message ).toBeUndefined();
				done();
			}
		);
	});

	it('should be allow sub selects', function(done){
		var sc = new Scripz();

		document.body.innerHTML = '<span><div id="hello"></div><div>junk</div></span>';
		
		sc.eval([
			{
				edit:'select:parent:span|select:child:#hello:parent',
				action:'addClass:child:woot keeper|removeClass:child:woot'
			}
		]).then(
			function( matches ){
				expect( matches.length ).toBe( 1 );
				expect( matches[0].child.className ).toBe(' keeper');
				done();
			},
			function( error ){
				expect( error.message ).toBeUndefined();
				done();
			}
		);
	});
});