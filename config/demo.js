var Scripz = require('../src/Scripz.js').default,
	subs = {},
	sc = new Scripz( subs );

var resume;

window.resume = function(){
	resume();
};
window.pause = function(){
	resume = sc.pause();
};
window.kill = function(){
	sc.kill();
};

sc.eval([{
	action: 'select',
	selector: 'option'
},{
	action: 'value'
},{
	action: 'log',
	label: 'values'
},{
	action: 'series',
	actions: [{
		action: 'log',
		label: 'nav'
	},{
		action: 'navigate',
		hash: 'blh/{{}}/woot'
	},{
		action: 'sleep',
		wait: 1000
	}]
},{
	action: 'log',
	label: 'hello world'
}]);

sc.eval([{
	action: 'series',
	name: 'subloop',
	actions: [{
		action: 'log',
		label: 'highlight'
	},{
		action: 'addClass',
		className: 'highlight'
	},{
		action: 'sleep',
		wait: 1000
	},{
		action: 'removeClass',
		className: 'highlight'
	},{
		action: 'event',
		eventType: 'click'
	}]
},{
	action: 'select',
	selector: 'li'
},{
	action: 'save',
	as: 'memory'
},{
	action: 'value',
	field: 'innerHTML'
},{
	action: 'log',
	label: 'lis'
},{
	action: 'load',
	from: 'memory'
},{
	action: 'log',
	label: 'memorized'
},{
	action: 'loop',
	name: 'subloop',
	wait: 4000,
	limit: 5
}]);

sc.eval([{
	action: 'insert',
	content: [
		{ a:[1,2], b:[3,4] },
		{ a:[5,6], b:[7,8] }
	]
},{
	action: 'permutate',
	field1: 'a[]',
	field2: 'b[]'
},{
	action: 'log',
	label: 'permutation',
	content: '->{{field1}} =>{{field2}}'
},{
	action: 'sleep',
	wait: 10000
},{
	action: 'navigate',
	hash: 'permu/{{field1}}/{{field2}}'
}]);


sc.eval([{
	action: 'insert',
	content: [
		{ a:3 },
		{ a:1 },
		{ a:2 }
	]
},{
	action: 'sort', field:'a'
},{
	action: 'log', label:'numeric sort'
}]);

sc.eval([{
	action: 'insert',
	content: [
		{ a:'z3' },
		{ a:'a1' },
		{ a:'m2' }
	]
},{
	action: 'sort', field:'a'
},{
	action: 'log', label: 'alpha sort'
}]);

subs.partSort = [{
	action: 'insert',
	content: [
		{ a:{b:'z3'} },
		{ a:{b:'a1'} },
		{ a:{b:'m2'} }
	]
},{
	action: 'sort', field:'a.b'
},{
	action: 'log', label:'part sort'
}];

sc.eval([
	{ action: 'series', name: 'partSort' }
]);