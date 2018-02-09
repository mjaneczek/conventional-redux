# Conventional-redux.js [![NPM](https://img.shields.io/npm/v/conventional-redux.svg)](https://www.npmjs.com/package/conventional-redux) [![Build Status](https://travis-ci.org/mjaneczek/conventional-redux.svg?branch=master)](https://travis-ci.org/mjaneczek/conventional-redux) [![Coverage Status](https://coveralls.io/repos/github/mjaneczek/conventional-redux/badge.svg?branch=master)](https://coveralls.io/github/mjaneczek/conventional-redux?branch=1.0) [![Code Climate](https://codeclimate.com/github/mjaneczek/conventional-redux/badges/gpa.svg)](https://codeclimate.com/github/mjaneczek/conventional-redux) 
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
  // initial state
  defaultState() {
    return 0;
  }

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

const Counter = (props) => (
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
const Counter = (props, dispatch) => (
  <div>
    <h2>{props('counter')}</h2>
    
    <button onClick={dispatch('counter:increment')}>
      Increment
    </button>
    
    <button onClick={dispatch('counter:doubleAsync')}>
      Double (Async)
    </button>
  </div>
  )
}

export default connectInteractors(Counter, ['counter']);
```

### Standard redux approach (explicit)
1. Define component
2. Define actions
3. Define reducer
4. Define mapActionCreators
5. Define mapStateToProps
6. Define container
7. Connect!

### Conventional-redux approach
1. Define component
2. Define interactor
3. Connect!

**Remember that you can combine these two approaches! Use convetional way for simple parts of your application, but
when you need more control over what is going on, pure redux should be better!**

## Example live application
Check out an example app with code snippets [here](https://mjaneczek.github.io/conventional-redux-demo/).
The code is available [here](https://github.com/mjaneczek/conventional-redux-demo).

## Functionalities list

### Auto define actions
The library automatically defines actions based on reduce methods.
[Check out live example.](https://mjaneczek.github.io/conventional-redux-demo/)

```js
class CounterInteractor {
  defaultState() {
    return 0;
  }

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
// this.dispatch('counter:increment');
// this.d('counter:increment', 10);
// this.d('counter:double');
```

### Auto handle for promises
Automatically handling for promises resolve and reject.
[Check out live example.](https://mjaneczek.github.io/conventional-redux-demo/promises-handling)

```js
class GithubUserdataInteractor {
  defaultState() {
    return 0;
  }

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

### Interactor external dependencies
You can define an array of external dependencies to modify interactor state after non interactor actions.
[Check out live example.](https://mjaneczek.github.io/conventional-redux-demo/external-dependencies)

```js
class ExampleInteractor {
  externalDependencies() {
    return [
      { on: ['LOGOUT'], call: 'onClear' }
    ]
  }

   onClear(logoutActionArgs) {
     return {};
  }
}
```

### Interactor computed actions
You can define a computed actions array to call additional dispatch after specific actions. In the following example the action always fires after `projects:fetch` or `gists:fetch`.
[Check out live example.](https://mjaneczek.github.io/conventional-redux-demo/computed-actions)

```js
class FiltersInteractor {
  computedActions() {
    return [
      { after: ['projects:fetch', 'gists:fetch'],
        dispatch: 'filters:update',
        with: ['projects.languages', 'gists.languages'] 
      }
    ]
  }
  
  onUpdate(projectLanguages, gistLanguages) {
    // it fires after gists or projects fetch with resolved args
  }
}

```

### Static and dynamic interactors
Interactors can be static or dynamic. You cannot remove once registered static interactor. Dynamic interactors can be remvoed or replaced, the right moment to manage dynamic interactors is `ROUTE_CHANGE` action. A good example of static interactor would be `CurrentUserInteractor`, of dynamic - route based interactors like `ProjectsInteractor`, `SettingsInteractor` etc.
[Check out live example.](https://mjaneczek.github.io/conventional-redux-demo/dynamic-interactors)

```js
// static, somewhere before connect:
registerInteractors({
  currentUser: new CurrentUserInteractor(),
  currentLanguage: new CurrentLanguageInteractor(),
});

// dynamic
onRouteChange() {
  replaceDynamicInteractors({
    counter: new CounterInteractor()
  });
}

// dynamic setup, configuring store
setRecreateReducerFunction(() => store.replaceReducer(createReducer(store.injectedReducers)));
```

### Connect interactors
It connects interactors (state) to a specific component.
[Check out live example.](https://mjaneczek.github.io/conventional-redux-demo/)

```js
class Counter extends React.Component {
  render () {
    return (
      <div>
        <h2>{this.p('counter')}</h2>
        
        <button onClick={() => this.d('counter:increment')}>
          Increment
        </button>
        
        <button onClick={() => this.d('counter:doubleAsync')}>
          Double (Async)
        </button>
      </div>
    )
  }
}

export default connectInteractors(Counter, ['counter']);
// or connect all (not recommended)
export default connectInteractors(Counter);
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
Code example: https://github.com/mjaneczek/conventional-redux-demo/blob/master/app/configureStore.js#L12 

### 3. Set recreate reducer function (needed only if using dynamic interactors)
```js
setRecreateReducerFunction(() => store.replaceReducer(createReducer()));
```
Code example: https://github.com/mjaneczek/conventional-redux-demo/blob/master/app/configureStore.js#L35

### 4. Replace combineReducers with conventional-redux wrapper
```js
import { createConventionalReduxRootReducer } from 'conventional-redux';

return createConventionalReduxRootReducer({
  route: routeReducer,
}, combineReducers);

// the first parameter is a default combined reducers hash
// the second is a pure combineReducers function from redux or redux-immmutable
```
Code example: https://github.com/mjaneczek/conventional-redux-demo/blob/master/app/reducers.js#L20

## Example application
https://mjaneczek.github.io/conventional-redux-demo/

## Deprecation note
The previous version of the library 0.2.2 has been deprecated. There are many breaking changes while migrating to 1.0, please be careful while updating. The outdated code is here: https://github.com/mjaneczek/conventional-redux/tree/0.2.2-outdated

## Contributing
1. Fork it ( https://github.com/mjaneczek/conventional-redux/fork )
2. Create your feature branch (`git checkout -b my-new-feature`)
3. Commit your changes (`git commit -am 'Add some feature'`)
4. Push to the branch (`git push origin my-new-feature`)
5. Create a new Pull Request
