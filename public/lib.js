export const docFn = str => document[str].bind(document),
	q = docFn('querySelector'),
	c = docFn('createElement'),
	t = docFn('createTextNode');

const insertAfter = (oldEl, newEl) => oldEl.parentNode.insertBefore(newEl, oldEl.nextSibling);
const camelToDot = str => str.split('_');
const getArgs = fn => ('' + fn).match(/(\(|^)(?<a>.+?)[=\)]/).groups['a'].trim().split(', ');
const notIn = arr => item => !arr.some(i => i.key === item.key);
const getIn = (arr, key) => arr.find(i => i.key === key);
const options = {
	'object': (obj, el) => el.appendChild(obj),
	'string': (str, el) => options['object'](t(str), el),
};

const h = (state, sub) => (name, attrs = {}, ...children) => {
	const {style, ...restAttrs} = attrs;
	const el = Object.assign(
		c(name),
		{mount: selector => q(selector).appendChild(el)},
		restAttrs,
	);
	Object.assign(el.style, style);
	children.forEach(child => options[(typeof child)](child, el));
	return el;
};

const sub = callbacks => (keys, fn, unsub = false) => {
	keys.forEach(key => {
		callbacks[key] = callbacks[key] || [];
		unsub 
			? callbacks[key] = callbacks[key].filter(f => f !== fn)
			: callbacks[key].push(fn);
	});
	return () => sub(callbacks)(keys, fn, true);
};

const pub = (callbacks, state) => (keys, fn) => () => {
	state(fn(state()));
	keys.forEach(key => {
		(callbacks[key] || []).forEach(fn => fn(state(key)))
	});
};

const text = (state, sub) => fn => {
	const fnArgs = getArgs(fn);
	const textNode = t(fn(...fnArgs.map(arg => state(arg))));
	sub(fnArgs, (...stVals) => textNode.data = fn(...stVals));
	return textNode;
};

const el = (state, sub) => (fn, lifeCycle = {}) => {
	const fnArgs = getArgs(fn);
	lifeCycle.onCreate && lifeCycle.onCreate(...getArgs(lifeCycle.onCreate).map(arg => state()[arg]));
	let currEl = fn(...fnArgs.map(arg => state()[arg]));
	let prevVals = fnArgs.map(arg => state()[arg]);
	const subscription = (...stVals) => {
		if ( !lifeCycle.shouldUpdate 
			|| lifeCycle.shouldUpdate && lifeCycle.shouldUpdate(stVals, prevVals)
		) {
			const newEl = fn(...stVals);
			currEl.replaceWith(newEl);
			currEl = newEl;
			lifeCycle.onUpdate && lifeCycle.onUpdate(...getArgs(lifeCycle.onUpdate).map(arg => state(arg)));
		}
		prevVals = stVals;
	};
	const unsub = sub(fnArgs, subscription);
	currEl.del = () => {
		lifeCycle.onRemove && lifeCycle.onRemove(...getArgs(lifeCycle.onRemove).map(arg => state(arg)));
		unsub();
		currEl.remove();
	};
	return currEl;
};

const getSetState = initialState => value => {
	return !value
		? initialState
		: typeof value === 'string'
			? camelToDot(value).reduce((acc, cur) => acc[cur], initialState)
			: initialState = value
}

const map = (state, sub) => 
	(fn, shouldUpdate = (pV, nV) => JSON.stringify(pV) !== JSON.stringify(nV)) => 
{
	const [fnArg] = getArgs(fn);
	let arr = state()[fnArg];
	const placeholder = c('div');
	let items = [placeholder].concat(...arr.map(fn));

	sub([fnArg], (...stVals) => {
		const newArr = state()[fnArg];
		const addedVals = newArr.filter(item => !!item && notIn(arr)(item));
		const removedVals = arr.filter( notIn(newArr));
		const oldWithoutRemoved = arr.filter( notIn(removedVals));
		const newWithoutAdded = newArr.filter( notIn(addedVals));
		const newItems = [];

		removedVals.forEach(
			val => {
				const deleted = getIn(items, val.key);
				deleted.del ? deleted.del() : deleted.remove();
			}
		);
		newWithoutAdded.forEach(
			(newVal, index) => {
				if (
					newVal.key === oldWithoutRemoved[index].key
					&& !shouldUpdate(oldWithoutRemoved[index], newVal)
				) {
					newItems.push(getIn(items, newVal.key));
				} else {
					const newItem = fn(newVal);
					const oldItem = getIn(items, oldWithoutRemoved[index].key); 
					insertAfter(oldItem, newItem);
					newItems.push(newItem);
					oldItem.del ? oldItem.del() : oldItem.remove();
				}
			}
		);
		addedVals.forEach(
			newVal => {
				const newItem = fn(newVal);
				const indexOfAfter = newArr.findIndex(item => item.key === newVal.key) - 1;
				const prevVal = newArr[indexOfAfter];
				insertAfter( prevVal ? getIn(newItems, prevVal.key) : placeholder, newItem)
				newItems.push(newItem);
			}
		)
		items = newItems;
		arr = newArr;
	});
	return items;
};

export const init = initialState => {
	const state = getSetState(initialState);
	const callbacks = {};
	const lSub = sub(callbacks);
	return {
		sub: lSub,
		pub: pub(callbacks, state),
		text: text(state, lSub),
		el: el(state, lSub),
		map: map(state, lSub),
		h: h(state, lSub),
	}
}
