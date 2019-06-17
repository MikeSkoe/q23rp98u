### Features

- Lightweight element creator
- Build-in state manager
- List diffing without VDOM
- Update only those parts, that you know will update
- hole library in single file with 150 of readable code

# q23rp98u

####Creating of elements.
There is nothing new. Just use 'h' function, where first argument is tag name, second are properties of elements, and rest are children of the element.

```javascript
h('div', {onclick: () => conosle.log('hi')}, 'greed');
```

####State Management
This is the main feacher of the library. The idea of what I whanted to test is, what if we subscribe to updates of concrete fields of state. Some thing like 'state field oriented pub-sub patter'.
Say, we have a state like:
```javascript
{
	counter: 0,
	tasks: [],
}
```
First, let's make some actions to change our state
````javascript
const incr = pub(['counter'], state => ({...state, counter: state.counter + 1}));
const addtask = title => 
	pub(['tasks'], state => ({...state, tasks: [...state.tasks, {title}]}))();
````
so we can trigger the changes
````javascript
incr(); \\ counter: 1
incr(); \\ counter: 2
addTask('one'); \\ tasks: [{title: 'one'}]
addTask('two'); \\ tasks: [{title: 'one'}, {title: 'two'}]
````
Now, we need to subscribe to certain changes
````javascript
const h1 = h('h1', {}, 'default title');
sub(['counter'], counter => h1.innerText = `counter: ${counter}`);
````
here h1 will update its content only on update of 'counter' field of state.
As you can see, changing state, we explicitly say, which fields of a state we are updatig. Then we explicitly say, on changes of what field we need some behaviour.

####Usage
To get all features we should initialize our initial state
````javascript
import { init } form 'q23rp98u';
const {h, pub, sub, el, map, text} = init({counter: 0, tasks: []});
````

###Helpers
As you can see above, we also have additional functions, like el, map, text. Let's see them in action
####el
When we should render elements, depending on sertain state 'el' is used
````javascript
const even = h('h1', {}, 'Couner is Even');
const odd = h('h1', {}, 'Counter is Odd');
const evenOrOdd = el(counter => counter % 2 === 0 ? even : odd);

const counterShower = ctr => h('h2', {}, `counter: ${ctr}`);
const showCounter = el(counter => ctr(counter));
````
Here we are not listing keys of all needed state properties. Keys are took from function's arguments.
If we need to subscribe to some nested properties, underscore is used
````javascript
el(nested_counter => h('h1', {}, `state.nested.counter: ${nested_counter}`));
````

####map
It is also something, that takes keys for subscription from funciton agruments, so it looks uglyer, but shorter
````javascript
const Task = task => h('div', {classname: 'task', key: task.id}, task.title);
h('div', {},
	map(tasks => Task(tasks))
)
````
For diffing to work correct, every item in array and every element should have 'key'
