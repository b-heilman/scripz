var Scripz = require('../src/Scripz.js').default,
	subs = {},
	sc = new Scripz( subs );

sc.debug = true;

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
	edit: 'select:element:option',
	action: 'log:element|navigate:blh/{{element.innerHTML}}/woot|sleep:1000'
}]);

sc.eval([{
	subs: {
		subloop: [{
			action: 'log:highlight:{{element.innerHTML}}|' +
				'addClass:element:highlight|sleep:1000|' +
				'removeClass:element:highlight|event:element:click'
		}]
	},
	edit: 'select:element:li',
	action: 'log:li-selected',
	save: 'memory'
},{
	reset: true,
	action: 'log:li-between'
},{
	load: 'memory',
	action: 'log:li-loaded'
},{
	action: 'loop:5:subloop:4000'
}]);

sc.eval([
	{
		fetch: 'insert:data:content',
		trans: 'permutate:{"field1":"data.a[]","field2":"data.b[]" }',
		action:'log:permutation-1'
	},{
		action: 'sleep:10000'
	},{
		action: 'navigate:permu/{{field1}}/{{field2}}|log:permutation-2:->{{field1}} =>{{field2}}|sleep:1000'
	}
],{
	content: [
		{ a:[1,2], b:[3,4] },
		{ a:[5,6], b:[7,8] }
	]
});

//--- Tutorial---
window.tutorial = function(){
	sc.eval([
		{	
			edit: 'select:target:#first|select:focus:#target|select:text:#textwall|format:content:This is a test',
			action: 'focus:target:focus|removeClass:target:hidden|sleep:2000|addClass:target:hidden|orbit:target:text|write:text:content|sleep:2000'
		},
		{	
			edit: 'select:target:#second|select:focus:#target|select:text:#textwall|format:content:This is another test',
			action: 'focus:target:focus|removeClass:target:hidden|sleep:2000|addClass:target:hidden|orbit:target:text|write:text:content|sleep:2000'
		},
		{	
			edit: 'select:target:#third|select:focus:#target|select:text:#textwall|format:content:Third time is a charm',
			action: 'focus:target:focus|removeClass:target:hidden|sleep:2000|addClass:target:hidden|orbit:target:text|write:text:content|sleep:2000'
		},
		{	
			edit: 'select:target:#fourth|select:focus:#target|select:text:#textwall|format:content:I have no clue',
			action: 'focus:target:focus|removeClass:target:hidden|sleep:2000|addClass:target:hidden|orbit:target:text|write:text:content|sleep:2000'
		}
	]);
};