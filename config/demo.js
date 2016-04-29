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
		hash: 'blh/@1/woot'
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
		action: 'highlightOn'
	},{
		action: 'sleep',
		wait: 1000
	},{
		action: 'highlightOff'
	}]
}]);