import { getProperty } from '~/utils';

class Connector {
  constructor({connectFunc}) {
    this.connectFunc = connectFunc;
  }

  connectInteractors(component, interactorNames) {
    let reactFunctionalComponent = (props, context) => {
      const property = (propertyString) => getProperty(props, propertyString);
      const dispatch = (actionName, ...args) => props.dispatch([actionName].concat(args));

      return component(property, dispatch);
    }

    if(interactorNames) {
      return this.connectFunc((state) => this._connectHash(interactorNames, state))(reactFunctionalComponent);
    } else {
      return this.connectFunc((state) => state)(reactFunctionalComponent);
    }
  }

  _connectHash(interactorNames, state) {
    let connectHash = {};
    interactorNames.forEach(interactorName => connectHash[interactorName] = state[interactorName]);
    return connectHash;
  }
}

export default Connector
