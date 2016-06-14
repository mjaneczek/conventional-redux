export { conventionalReduxMiddleware } from './middleware';
export { conventionalReducers } from './reducer';

export var interactors = {};

export function registerInteractors(interactors) {
  for (const name in interactors){
    registerInteractor(name, interactors[name]);
  }
}

export function registerInteractor(key, interactor) {
  interactors[key] = interactor;
}
