import { init } from './lib.js';

const state = { data: [], selected: 1 };

const {sub, pub, text, el, map, h} = init(
	state,
)

const random = max => Math.round(Math.random() * 1000) % max;

const A = ["pretty", "large", "big", "small", "tall", "short", "long", "handsome", "plain", "quaint", "clean",
  "elegant", "easy", "angry", "crazy", "helpful", "mushy", "odd", "unsightly", "adorable", "important", "inexpensive",
  "cheap", "expensive", "fancy"];
const C = ["red", "yellow", "blue", "green", "pink", "brown", "purple", "brown", "white", "black", "orange"];
const N = ["table", "chair", "house", "bbq", "desk", "car", "pony", "cookie", "sandwich", "burger", "pizza", "mouse",
  "keyboard"];

let nextId = 1;

const buildData = count => {
	const data = new Array(count);
	for (let i = 0; i < count; i++) {
		const id = nextId++;
		data[i] = {
			key: id,
			label: `${A[random(A.length)]} ${C[random(C.length)]} ${N[random(N.length)]}`,
		};
	}
	return data;
};

const RUN = pub(
	['data', 'selected'], 
	state => 
		({data: buildData(10), selected: 0 }));
const RUN_LOTS = pub(
	['data'], 
	state => 
		({data: buildData(10000), selected: 0 }));
const ADD = pub(
	['data'], 
	({data, selected}) => 
		({data: data.concat(buildData(1000)), selected }));
const UPDATE = pub(
	['data'],
	({data, selected}) => {
		const newData = [...data];
		for (let i = 0; i < newData.length; i += 10) {
			const r = newData[i];
			newData[i] = { key: r.key, label: r.label + ' !!!'};
		}
		return { data: newData, selected };
	});
const CLEAR = pub(
	['data'], 
	({data, selected}) => 
		({data: [], selected: 0 }));
const SWAP_ROWS = pub(
	['data'], 
	({data, selected}) => 
	({
		data: [data[0], data[998], ...data.slice(2, 998), data[1], data[999]], selected 
	}));
const REMOVE = id => pub(
	['data'], 
	({data, selected}) => {
		const idx = data.findIndex(d => d.key === id);
		return { data: [...data.slice(0, idx), ...data.slice(idx + 1)], selected };
	});
const SELECT = id => pub(
	['selected'], 
	({data}) => {
		return ({data, selected: id })
	});

const GlyphIcon = () => h('span', {className: 'glyphicon glyphicon-remove', ariaHidden: 'true'}, 'X');

const Row = item => {
	const comp = h('tr',
		{ 
			key: item.key, 
			style: {fontSize: '2rem'},
		},
		h('td', {className: 'col-md-1'}, `${item.key}`),
		h('td', {className: 'col-md-4'}, h('a', {onclick: SELECT(item.key)}, `${item.label}`)),
		h('td', {className: 'col-md-1'}, h('a', {onclick: REMOVE(item.key)}, GlyphIcon())),
		h('td', {className: 'col-md-6'}),
	);
	const subSelected = selected => {
		comp.className = selected === item.key ? 'danger' : '';
	};
	const unsub = sub(
		['selected'],
		subSelected,
	);
	return el(
		() => comp,
		{onRemove: unsub},
	);
}

const Button = (id, cb, title) => h('div', {className: 'col-sm-6 smallpad'},
	h('button', {className: 'btn btn-priority btn-block', id, onclick: cb},
		`${title}`,
	)
);

const Jumbotron = h('div', {className: 'jumbotron'},
	h('div', {className: 'row'}, 
		Button('run', RUN, 'Create 1,000 rows'),
		Button('runlots', RUN_LOTS, 'Create 10,000 rows'),
		Button('add', ADD, 'Append 1,000 rows'),
		Button('update', UPDATE, 'Updatae every 1,000 rows'),
		Button('clear', CLEAR, 'Clear'),
		Button('swaprows', SWAP_ROWS, 'Swap Rows'),
	),
);

const Main = h('div', {className: 'container'},
	Jumbotron,
	h('table', {className: 'table table-hover table-striped test-data'},
		h('tbody', {},
			...map(
				data => Row(data),
				(pV, nV) => pV.label !== nV.label
			),
		)
	),
	h('span', {className: 'preloadicon glyphicon glyphicon-remove', ariaHidden: 'true'})
);

Main.mount('#app');
