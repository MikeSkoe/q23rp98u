// usage
import init from './lib.js';

const state = {
	counter: 0, 
	anotherCounter: 0,
	one: { two: 123 },
	arr: [
		{key: 1, val: 1}, 
		{key: 2, val: 2},
		{key: 3, val: 3},
		{key: 4, val: 4},
		{key: 5, val: 5},
	]
};
const {sub, pub, text, el, map, h} = init(
	state,
);
const h1 = txt => h('h1', {}, `counter: ${txt}`,);
const h2 = txt => h('h2', {}, `counter: ${txt}`,);
const withProp = txt => h('div', {className: 'one two'}, `text: ${txt}`);
const incr = pub(['counter'], state => ({...state, counter: state.counter + 1}));
const button = h('button', {onclick: incr}, 'incr');
const anotherIncr = pub(['anothercounter'], 
	state => ({...state, anotherCounter: state.anotherCounter + 1})
);
const anotherButton = h('button', {onclick: anotherIncr}, 'anotherIncr');
let localCounter = 10;
const addLast = pub(['arr'], state => ({
	...state, 
	arr: [...state.arr, {key: ++localCounter, val: localCounter++}]
}));
const addLastBtn = h('button', {onclick: addLast}, 'addLast');
const addFirst = pub(['arr'], state => ({
	...state, 
	arr: [{key: ++localCounter, val: localCounter++}, ...state.arr]
}));
const addFirstBtn = h('button', {onclick: addFirst}, 'addFirst');
const changeNested = pub(['one_two'], state => ({
	...state, 
	one: {
		two: state.one.two + 10
	}
}));
const changeNestedBtn = h('button', {onclick: changeNested}, 'ested');
const removeItem = key => pub(
	['arr'], 
	state => ({
		...state,
		arr: state.arr.filter(i => i.key !== key),
	})
);

const replace = pub(
	['arr'],
	state => ({
		...state,
		arr: [
			{key: 4, val: 4},
			{key: 2, val: 2},
			{key: 1, val: 1}, 
			{key: 3, val: 3},
			{key: 5, val: 5},
		],
	}),
);
const replaceBtn = h('button', {onclick: replace}, 'replace');

const app = h('div', {}, 
	el(
		counter => counter % 2 === 0 ? h1(counter) : h2(counter), 
		{
			onCreate: counter => console.log(`Counter: ${counter}`),
			shouldUpdate: ([counter], [prevCounter]) => {
				console.log(`curr: ${counter}; prev: ${prevCounter}`);
				return counter % 2 === 0;
			}
		}
	),
	el(counter => withProp(counter)),
	text(one_two => `one.two: ${one_two}`),
	button,
	anotherButton,
	addFirstBtn,
	replaceBtn,
	addLastBtn,
	changeNestedBtn,
	text(counter => `test one: ${counter}`),
	text(one_two => `test one: ${one_two}`, {shouldUpdate: one_two => (one_two % 2) === 0}),
	text(one_two => `test one: ${one_two}`),
	...map(
		arr => el(selected => {
			console.log('selected', selected);
			return h('div', {
				key: arr.key, 
				onclick: removeItem(arr.key), 
				style: {
					color: counter => counter % 2 === 0 ? 'blue' : 'red',
					background: 'gray',
				},
				`${arr.val}`),
			}), 
		})
	)),
	text(arr => `arr: ${JSON.stringify(arr)}`),
);

app.mount('#app');
