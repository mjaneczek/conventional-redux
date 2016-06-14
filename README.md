# Conventional-redux.js
Make your redux more friendly by adding conventions and removing duplications!

## The idea
1. Combine actions and reducers into a interactor class
2. Dispatch action in a ```interactorName:method``` format (eg. ```this.dispatch('counter:double')```)
3. Handle an action by defining methods in the interactor

## The example (diff)
Counter component from https://github.com/davezuko/react-redux-starter-kit/

### Before
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
### After
```js
class CounterInteractor {
  state = 0;

  doubleAsync() {
    setTimeout(() => { this.dispatch('counter:double') }, 500)
  }

  onIncrement() {
    return this.state + 1;
  }

  onDouble() {
    return this.state * 2;
  }
}
```

## Features

## Conventional dispatch

```js
this.props.dispatch('counter:increment')
this.props.dispatch('counter:incrementBy100')
this.props.dispatch('counter:doubleAsync')
```

```js
class CounterInteractor {
  // default state
  state = 0;

  // you can define a method to customize an action
  doubleAsync() {
    setTimeout(() => { this.dispatch('counter:double') }, 500)
  }

  // but for standard actions it is not necessary
  incrementBy100() {
    console.log('you can write me but it is not required!');
  }
  
  // it's reducer function, the name must start with 'on'
  onIncrement() {
    return this.state + 1;
  }

  onIncrementBy100() {
    return this.state + 100;
  }

  onDouble() {
    return this.state * 2;
  }
}
```

## Promise dispatch

```js
this.props.dispatch(['github_userdata:fetch', 'mjaneczek'])
```

```js
class GithubUserdataInteractor {
  state = {};

  // If you return a promise, conventional-redux will auto dispatch action on promise success or fail.
  fetch(userName) {
    return fetchResource('https://api.github.com/users/' + userName)
  }

  onFetch(userName) {
    return { loading: true }
  }

  onFetchSuccess(userData) {
    return { user: userData }
  }

  onFetchError(error) {
    return { error: error.message }
  }
}
```

## Multi dispatch

```js
this.props.dispatch(['github_profile:fetch', 'mjaneczek']);
```

```js
export default class GithubProfileInteractor {
  state = {};

  fetch(userName) {
    // return promise to automatically call onFetchSuccess/Fail
    return Promise.all([
      // dispatch another actions from different interactors
      this.dispatch(['repos:fetch', userName])
      this.dispatch(['gists:fetch', userName])
    ]);
  }
}
```

## Installation

### 1. Npm install
```
npm install conventional-redux
```

### 2. Add conventional-redux middleware
```js
import { conventionalReduxMiddleware } from 'conventional-redux';
const middleware = [conventionalReduxMiddleware, thunk, routerMiddleware(history)]
```
Example: https://github.com/mjaneczek/react-conventional-redux-starter-kit/blob/master/src/store/createStore.js#L11

### 3. Add conventional-redux reducers
```js
import { conventionalReducers } from 'conventional-redux';

return combineReducers({
  router,
  ...conventionalReducers(),
  ...asyncReducers
})
```
Example: https://github.com/mjaneczek/react-conventional-redux-starter-kit/blob/master/src/store/reducers.js#L9

### 4. Register interactors

```js
import {registerInteractors} from 'conventional-redux';

registerInteractor('todo', new TodoInteractor());

// or

registerInteractors({
  'repos': new ResourceInteractor('https://api.github.com/users/{}/repos'),
  'gists': new ResourceInteractor('https://api.github.com/users/{}/gists'),
  'readme': new ResourceInteractor('https://api.github.com/repos/{}/readme'),
  'github_profile': new GithubProfileInteractor()
});
```

### 5. Dispatch!

```js
this.props.dispatch('interactorName:actionWithoutParams');
// or
this.props.dispatch(['interactorName:actionName', 'param1', 'param2']);
```

## Example application
https://github.com/mjaneczek/react-conventional-redux-starter-kit/tree/master/src/routes
