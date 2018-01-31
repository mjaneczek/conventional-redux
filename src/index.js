import { connect } from 'react-redux'
import { combineReducers } from 'redux'
import Store from '~/store';
import Middleware from '~/middleware';
import RootReducerGenerator from '~/root_reducer_generator';
import ReducerGenerator from '~/reducer_generator';
import Connector from '~/connector';

export const interactorStore = new Store();
export const connector = new Connector({connectFunc: connect});

export const conventionalReduxMiddleware = store => next => action => {
  return new Middleware({interactorStore, store, next, action}).perform();
}

export function conventionalReducers() {
  return new ReducerGenerator({interactorStore}).all();
}

export function connectInteractors(component, interactorNames) {
  return connector.connectInteractors(component, interactorNames);
}

export function createConventionalReduxRootReducer(reducers, combineReducersFunc = combineReducers) {
  return new RootReducerGenerator({interactorStore}).root(reducers, combineReducersFunc);
}

export const registerInteractors = interactorStore.registerInteractors.bind(interactorStore)
export const registerInteractor = interactorStore.registerInteractor.bind(interactorStore)
export const replaceDynamicInteractors = interactorStore.replaceDynamicInteractors.bind(interactorStore)
export const removeDynamicInteractors = interactorStore.removeDynamicInteractors.bind(interactorStore)
export const setRecreateReducerFunction = interactorStore.setRecreateReducerFunction.bind(interactorStore)
