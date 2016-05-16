describe('scripz - actions - navigate', function(){
	it('Should be able to interact with it', function(done){
		var sc = new Scripz();

		sc.debug = true;

		document.body.innerHTML = '<span>1</span><span>2</span><span>3</span><span>4</span>';
		
		sc.eval([{
			edit: 'select:element:span',
			action: 'navigate:blh/{{element.innerHTML}}/woot|hook:test'
		}],{
			test: function( datum ){
				expect( window.location.hash ).toBe('#blh/'+datum.element.innerHTML+'/woot');
			}
		}).then(done,done);
	});
});