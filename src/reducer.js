import { interactors } from './index'
import { performedActions } from './middleware';

export function conventionalReducers() {
  var conventionalReducersHash = {};

  for (const name in interactors){
    conventionalReducersHash[name] = conventionalReducer(name);
  }

  return conventionalReducersHash;
}

export function conventionalReducer(name) {
  var interactor = interactors[name];

  return (state = interactor.state, action) => {
    interactor.state = state;

    if(action.type.startsWith("CONV_REDUX/" + name + ':')) {
      var reduceMethodName = getReduceMethodName(action);

      if (interactor[reduceMethodName]) {
        interactor.state = interactor[reduceMethodName].apply(interactor, action.args);
      }
    }

    handleExternalDependencies(interactor, action);
    handleComputedReducers(interactor, action);

    return interactor.state;
  }
}

function handleExternalDependencies(interactor, action) {
  if(interactor.externalDependencies && interactor.externalDependencies[action.type]) {
    interactor.state = interactor.externalDependencies[action.type].apply(interactor, action.args);
  }
}

function handleComputedReducers(interactor, action) {
  if(interactor.computedReducers) {
    Object.keys(interactor.computedReducers).forEach((computedReducer) => {
      let actionNames = interactor.computedReducers[computedReducer];

      if(actionNames.includes(action.type)) {
        callCombineReducerIfFed(interactor, actionNames, computedReducer);
      }
    });
  }
}

function callCombineReducerIfFed(interactor, actionNames, computedReducer) {
  let actions = actionNames.map(action => performedActions[action]);

  if(!actions.includes(undefined)) {
    let reducerArguments = [];
    actions.forEach(action => action.args.forEach(value => reducerArguments.push(value)));
    interactor.state = interactor[computedReducer].apply(interactor, reducerArguments)
  }
}

function getReduceMethodName(action) {
  var methodName = action.type.replace('CONV_REDUX/', '').split(':').pop();
  return 'on' + methodName.charAt(0).toUpperCase() + methodName.slice(1);
}
