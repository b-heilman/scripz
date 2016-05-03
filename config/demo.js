var Scripz = require('../src/Scripz.js').default,
	sc = new Scripz();

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
	action: 'series',
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