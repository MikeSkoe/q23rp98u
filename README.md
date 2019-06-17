# q23rp98u
### Features
- No VDOM
- hole library in single file with 150 lines of readable code
- Build-in state manager
- Update only those parts, that you know will update
- Called q23rp98u, cuz' no one will realy use this
## State Management
The base idea, behind the library. The main pattern is something like 'property oriented pub-sub'. That means, that we explicitly say, which properties we update in actions and basign on which changes we should re-render some elements.

For example we have a state, like:
````javascript
const state = {
  counter: 0,
  nested: { counter: 100 },
  tasks: [{title: one, key: 0}, {label: two, key: 1],
};
````
Then we write actions, to update the state.
````javascript
const incr = pub(['counter'], state => ({...state, counter: state.counter + 1}));
const incrNested = pub(['nested_counter'], state => ({...state, nested: { counter: state.nested.counter + 1}}));
const addTask = (label, key) => pub(['tasks'], state => ({...state, tasks: state.tasks.concat([{label, key}])}))();
````
There is some things to note:
* first argument is an array, where we list every properties, that is changing
* if we need to describe nested properties, we use underscores
* pub function returns function, that takes nothing and update the state

And finally we subscribe to updates of certain state properties
````javascript
const unsub = sub(['counter'], counter => h1.innerText = `counter: ${counter}`);
h1.delete = () => {
  unsub();
  h1.remove();
};
````
## Helpers
To make life hapier and code lighter, we have functions some cool functions, like:
#### h
It is something like 'h' function in hyper-script. Everything is exactly the same:
````javascript
const h1 = h('h1', {onclick: () => 'hello', id: 'title'}, 'Title, yo');
````
First argument - tag name
Second - properties of an element
Rest - children
#### el
Gives additional abilities to create responsive element
````javascript
const responsiveH1 = el(
  counter => h('h1', {onclick: incr}, `counter: ${counter}`),
  {
    onCreate: () => console.log('im burn'), 
    onUpdate: () => console.log('im updating'), 
    onRemove: () => console.log('im dying'),
  }
);
````
* Keys, to subscribe on state changes are taken from names of arguments, sended to 'el' function, so argument 'counter' represent 'state.counter' property
* Second argument - object with lifecycle callbacks
#### map
The library has no VDOM, but cat diff lists. To do so we have to folow some rules:
````javascript
const Task = (title, key) => h('div', {key}, title);
const app = h('div', {},
  ...map(
    tasks => Task(tasks.title, tasks.key), 
    (prevValue, newValue) => prevValue.title !== newValue.title)
  )
)
````
* Every item in state's list should have 'key' property as unique idetifier
* Every main element in array should have 'key' property. Probably is looks redundant, but it helps make diffing of changes in array and update only changed items
* You should never use 'el', as direct item in 'map'. It will crash your app on change. (its 150 lines code library, c'mon!)
* Second argument of 'map' function is something like "should component update"
#### text
When we need to update only some text, base on state - 'text' is the right tool to use
````javascript
const title = h('h1', {className: 'title'}, text(counter => `counter: ${counter}`));
````
* Here keys are also taken from function's argument names

## Usage
To get all functions we should send initial state to 'init' function;
````javascript
import {init} from './q23rp98u'
const {pub, sub, el, text, map, h} = init({counter: 0, tasks: []});
````
