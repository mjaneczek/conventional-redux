export { conventionalReduxMiddleware } from './middleware';
export { conventionalReducers } from './reducer';
export { connectAllInteractors, connectInteractors } from './connect';

export var interactors = {};
export var dynamicInteractorKeys = [];
export var recreateReducerFunction = null;

export function registerInteractors(interactors, options = {}) {
  for (const name in interactors){
    registerInteractor(name, interactors[name], options);
  }
}

export function registerInteractor(key, interactor, options = {}) {
  if(options['dynamic']) {
    dynamicInteractorKeys.push(key)
  }

  interactors[key] = interactor;
}

export function replaceDynamicInteractors(interactors) {
  removeDynamicInteractors();
  registerInteractors(interactors, { dynamic: true });

  // add error if function is missing
  recreateReducerFunction();
}

export function removeDynamicInteractors() {
  dynamicInteractorKeys.forEach(key => {
    delete interactors[key]
  })
}

export function setRecreateReducerFunction(func) {
  recreateReducerFunction = func;
}