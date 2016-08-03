import { connect } from 'react-redux'
import { interactors } from './index';

export function connectAllInteractors(klass) {
  return connectInteractors(klass, Object.keys(interactors));
}

export function connectInteractors(klass, interactorNames) {
  if(isString(interactorNames)) { interactorNames = [interactorNames] }

  class ConnectedComponent extends klass {
    connectedInteractors = () => interactorNames;
    __touchedProperties = [];
    __actionsHash = {};

    p(propertyKeysChain) {
      if(!this.__touchedProperties.includes(propertyKeysChain)) {
        this.__touchedProperties.push(propertyKeysChain);
      }
      return getProperty(this.props, propertyKeysChain)
    }
  }

  defineActionProperties(ConnectedComponent, interactorNames);

  if(!klass.prototype.shouldComponentUpdate) {
    defineShouldComponentUpdate(ConnectedComponent);
  }

  return connect((state) => connectHash(interactorNames, state))(ConnectedComponent);
}

function defineActionProperties(klass, interactorNames) {
  interactorNames.forEach(interactorName => {
    Object.defineProperty(klass.prototype, interactorName, {
      get: function () {
        if(!this.__actionsHash[interactorName]) {
          this.__actionsHash[interactorName] = interactorActionHash(interactorName, this);
        }
        return this.__actionsHash[interactorName]
      }
    });
  });
}

function defineShouldComponentUpdate(klass) {
  klass.prototype.shouldComponentUpdate = function(nextProps, nextState) {
    if(this.connectedInteractors().some(interactorName => typeof nextProps[interactorName] == 'undefined')) {
      return false;
    }

    let result = this.__touchedProperties.some((propertyKeyChain) => {
      const currentValue = getProperty(this.props, propertyKeyChain);
      const newValue = getProperty(nextProps, propertyKeyChain);
      return currentValue != newValue
    });

    if(result) {
      this.__touchedProperties = [];
    }

    return result
  };
}

function interactorActionHash(interactorName, component) {
  let actionHash = {};

  actionNames(interactors[interactorName]).forEach(methodName => actionHash[methodName] = function() {
    var args = Array.prototype.slice.call(arguments);
    return component.props.dispatch([interactorName + ':' + methodName].concat(args))
  });

  return actionHash;
}

function actionNames(interactor, actionNamesList = []) {
  if(!interactor) { return [] }

  for (let name of Object.getOwnPropertyNames(Object.getPrototypeOf(interactor))) {
    let method = interactor[name];

    if (!(method instanceof Function) || method === interactor.constructor) continue;

    if(name.startsWith('on')) {
      name = name.replace('on', '');
      name = name.charAt(0).toLowerCase() + name.slice(1);
    }

    if(!actionNamesList.includes(name)) {
      actionNamesList.push(name);
    }
  }

  if(Object.getPrototypeOf(Object.getPrototypeOf(interactor)).constructor.name != 'Object') {
    return actionNames(Object.getPrototypeOf(interactor), actionNamesList);
  } else {
    return actionNamesList;
  }
}

function connectHash(interactorNames, state) {
  let connectHash = {};

  interactorNames.forEach(interactorName => connectHash[interactorName] = state[interactorName]);

  return connectHash;
}

function getProperty(object, keyChain) {
  return keyChain.split('.').reduce((o,i)=> {
    if(!o) { return null }
    return o[i]
  }, object);
}

function isString(object) {
  return typeof object === 'string' || object instanceof String;
}