# Conventional-redux.js [![Code Climate](https://codeclimate.com/github/mjaneczek/conventional-redux/badges/gpa.svg)](https://codeclimate.com/github/mjaneczek/conventional-redux)
Conventional-redux.js is a library for small and medium applications, it wraps the react-redux and provides API based
on convention over configuration pattern. It **is NOT new flux implementation** so everything is in 100% compatible with
standard redux approach.

## The idea
1. Remove boilerplate code by adding conventions
2. Don't break any redux rule/idea
3. Handle basic stuff automatically with ability to override

## The difference (counter example)

### Standard redux module
```js
// ------------------------------------
// Constants
// ------------------------------------
export const COUNTER_INCREMENT = 'COUNTER_INCREMENT'

// ------------------------------------
// Actions
// ------------------------------------
export function increment (value = 1) {
  return {
    type: COUNTER_INCREMENT,
    payload: value
  }
}

export const doubleAsync = () => {
  return (dispatch, getState) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        dispatch(increment(getState().counter))
        resolve()
      }, 200)
    })
  }
}

export const actions = {
  increment,
  doubleAsync
}

// ------------------------------------
// Action Handlers
// ------------------------------------
const ACTION_HANDLERS = {
  [COUNTER_INCREMENT]: (state, action) => state + action.payload
}

// ------------------------------------
// Reducer
// ------------------------------------
const initialState = 0
export default function counterReducer (state = initialState, action) {
  const handler = ACTION_HANDLERS[action.type]

  return handler ? handler(state, action) : state
}
```

### Conventional-redux interactor
```js
class CounterInteractor {
  state = 0;

  // actions:
  doubleAsync() {
    setTimeout(() => { this.dispatch('counter:double') }, 500)
  }

  // reduce methods:
  onIncrement() {
    return this.state + 1;
  }

  onDouble() {
    return this.state * 2;
  }
}
```

### Standard redux component + container
```js
const mapActionCreators = {
  increment: () => increment(1),
  doubleAsync
}

const mapStateToProps = (state) => ({
  counter: state.counter
})

export const Counter = (props) => (
  <div>
    <h2>{props.counter}</h2>
    
    <button onClick={props.increment}>
      Increment
    </button>
    
    <button onClick={props.doubleAsync}>
      Double (Async)
    </button>
  </div>
)

export default connect(mapStateToProps, mapActionCreators)(Counter)
```

### Conventional-redux connected component
```js
class Counter extends React.Component {
  render () {
    return (
      <div>
        <h2>{this.p('counter')}</h2>
        
        <button onClick={() => this.counter.increment()}>
          Increment
        </button>
        
        <button onClick={() => this.counter.doubleAsync()}>
          Double (Async)
        </button>
      </div>
    )
  }
}

export default connectInteractors(Counter, 'counter');
```
Redux examples source: https://github.com/davezuko/react-redux-starter-kit/tree/master/src/routes/Counter
Conventional-redux examples source: https://github.com/mjaneczek/react-conventional-redux-starter-kit/blob/master/src/routes/Counter

### Standard redux approach (explicit)
1. Define component
2. Define actions
3. Define reducer
4. Define mapActionCreators
5. Define mapStateToProps
6. Define container
7. [Optional] Define shouldComponentUpdate function
8. Connect!

### Conventional-redux approach
1. Define component
2. Define interactor
3. Connect!

**Remember that you can combine these two approaches! Use convetional way for simple parts of your application, but
when you need more control over what is going on, pure redux should be better!**

## Functionalities list

### Auto define actions
The library automatically defines actions based on reduce methods.
```js
class CounterInteractor {
  state = 0;

  // You can still define increment by your own (but not need to)!
  // increment() {
  //   console.log('test');
  // }

  onIncrement(by = 1) {
    return this.state + by;
  }

  onDouble() {
    return this.state * 2;
  }
}

// dispatch examples:
// this.counter.increment();
// this.counter.increment(10);
// this.counter.double();
```

### Auto handle for promises
Automatically handling for promises resolve and reject.
```js
class GithubUserdataInteractor {
  state = {};

  fetch(userName) {
    // need to return promise
    return fetchResource('https://api.github.com/users/' + userName)
  }

  onFetch(userName) {
    return { loading: true }
  }

  fetchSuccess(userResponse) {
    console.log(userResponse);
  }

  onFetchSuccess(userResponse) {
    return { user: userResponse }
  }

  onFetchError(error) {
    return { error: error.message }
  }
}

```

### Action dispatch returns promise
Dispatching an action always return a promise.
```js
// in component
onClick(user) {
  // dispatch an action put of users interactor
  this.users.put(user.id, {username: 'mjaneczek'}).then(() => {
    // when success dispatch an action success of toastr interactor
    this.toastr.success('Username updated!');
  })
}

// in interactor (fetch action)
fetch() {
  return Promise.all([
    this.dispatch('repos:fetch'),
    this.dispatch('gists:fetch')
  ]);
}

fetchSuccess() {
  console.log('repos and gists fetched!');
}
```

### Interactor external dependencies
You can define a hash of external dependencies to modify interactor state after non interactor actions.
```js
export default class ModalsInteractor {
  state = {};

  externalDependencies = {
    '@@router/LOCATION_CHANGE': this.onHideAll
  };

  onHideAll(args) {
    return {}; // hides all modals
  }
}
```

### Interactor computed reducers
You can define a computed reducer method if you need to merge results from two or more actions.
```js
export default class ProjectInteractor extends RESTInteractor {
  // key: reducer method name
  // array: dependent actions
  computedReducers = {
    _groupProjects: ['CONV_REDUX/currentUser:set', 'CONV_REDUX/teams:fetchSuccess']
  };

  // fires only when all specific actions are already dispatched (and recalculates when value changed)
  _groupProjects(user, projects) {
    return { ...this.state, all: projects, owned: lodash.filter(projects, t => t.user_id == user.id) };
  }
}
```

### Connect (all) interactors
Auto attach all interactor actions to `this.interactorName` hash, interactor state is avaliable via
`this.p('interactorName')` method. 

```js
class Counter extends React.Component {
  render () {
    return (
      <div>
        <h2>{this.p('counter')}</h2>
        
        <button onClick={() => this.counter.increment()}>
          Increment
        </button>
        
        <button onClick={() => this.counter.doubleAsync()}>
          Double (Async)
        </button>
      </div>
    )
  }
}

export default connectInteractors(Counter, 'counter');
// or (for many interactors)
export default connectInteractors(Counter, ['counter', 'currentUser']);
// or
export default connectAllInteractors(Counter);
```

### Auto define shouldComponentUpdate function
The library records all gets of interactor state during rendering process, based on it 
defines standard implementation of shouldComponentUpdate function that compares used values with new ones.

```js
class Example extends React.Component {
  render() {
    return (
      <div>
        { this.p('user.loaded') &&
          <div>
            <h1>{this.p('user.name')}</h1>
            <h4>{this.p('user.description')}</h4>
          </div>
        }
      </div>
    )
  }
}

// example state changes:

// { loaded: false } -> { loaded: false, name: 'name' }
// will not update component (loaded didn't change, other properties not used)

// { loaded: false } -> { loaded: true, name: 'name', description: 'description' }
// will update component
```

## Installation

### 1. Npm install
```
npm install conventional-redux --save
```

### 2. Add conventional-redux middleware
```js
import { conventionalReduxMiddleware } from 'conventional-redux';
const middleware = [conventionalReduxMiddleware, thunk, routerMiddleware(history)]
```
Eg: https://github.com/mjaneczek/react-conventional-redux-starter-kit/blob/master/src/store/createStore.js#L11

### 3. Add conventional-redux reducers
```js
import { conventionalReducers } from 'conventional-redux';

return combineReducers({
  router,
  ...conventionalReducers(),
  ...asyncReducers
})
```
Eg: https://github.com/mjaneczek/react-conventional-redux-starter-kit/blob/master/src/store/reducers.js#L9

### 4. Register interactors
### a) Static way
You can predefine all interactors and next connect specific interactors via `connectInteractor` method.
```js
// somewhere before connect:
registerInteractors({
  'currentUser': new CurrentUserInteractor(),
  'currentLanguage': new CurrentLanguageInteractor(),
  'modals': new ModalsInteractor(),
  'counter': new CounterInteractor()
});

// example component:
export default connectInteractors(Counter, ['counter', 'currentUser']);
```

### b) Dynamic way
You can register interactor as dynamic and remove it after some action (eg. based on current route).

Setup
```js
setRecreateReducerFunction(() => store.replaceReducer(makeRootReducer()));
```
Eg: https://github.com/mjaneczek/react-conventional-redux-starter-kit/blob/master/src/store/createStore.js#L37

```js
// routes/userdata/idnex.js
export default () => {
  return { path: 'userdata', getComponent: (state, cb) => {
    // remove all dynamic interactors and replace with specified
    // next recreate reducer using function set by setRecreateReducerFunction
    replaceDynamicInteractors({userdata: new GithubUserdataInteractor()});
    
    // connect all static and dynamic interactors
    cb(null, connectAllInteractors(GithubUserdataComponent))
  }}
}
```

### c) Combined way
You can use static way for common/global interactors like `CurrentUserInteractor` or `ModalsInteractor` and
dynamic for route specific interactors like `CounterInteractor`, `GithubUserdataInteractor`.

## Example application
https://github.com/mjaneczek/react-conventional-redux-starter-kit/tree/master/src/routes

## Contributing
1. Fork it ( https://github.com/mjaneczek/conventional-redux/fork )
2. Create your feature branch (`git checkout -b my-new-feature`)
3. Commit your changes (`git commit -am 'Add some feature'`)
4. Push to the branch (`git push origin my-new-feature`)
5. Create a new Pull Request
