import { interactors } from './index';

export const conventionalReduxMiddleware = store => next => action => {
  if (isStringOrArray(action)) {
    var [interactorSymbol, interactorMethodName, actionName, args] = parseAction(action);
    var interactor = getInteractor(interactorSymbol);
    interactor.dispatch = store.dispatch;

    var nextResult = next({type: 'CONV_REDUX/' + actionName, args: args});

    if(interactor[interactorMethodName]) {
      var actionResult = interactor[interactorMethodName].apply(interactor, args);

      if (isPromise(actionResult)) {
        addAutoDispatchToPromise(actionResult, store, actionName);
        return actionResult;
      }
    }

    return nextResult;
  }

  return next(action)
};

function addAutoDispatchToPromise(promise, store, actionName) {
  promise.then((data) => {
    store.dispatch([actionName + 'Success', data])
  }).catch((error) => {
    store.dispatch([actionName + 'Error', error])
  });
}

function getInteractor(symbol) {
  var interactor = interactors[symbol];

  if(!interactor) {
    throw new Error(`No interactor registered as ${symbol}!`);
  }

  return interactor;
}

function parseAction(action) {
  var actionName, args;

  if(action instanceof Array) {
    actionName = action[0];
    args = action.slice(1);
  } else {
    actionName = action;
    args = null;
  }

  return actionName.split(':').concat([actionName, args])
}

function isStringOrArray(action) {
  return typeof action === 'string' || action instanceof String || action instanceof Array;
}

function isPromise(object) {
  return (object && 'function' === typeof object.then);
}
