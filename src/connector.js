import { getProperty } from '~/utils';

class Connector {
  constructor({connectFunc}) {
    this.connectFunc = connectFunc;
  }

  connectInteractors(component, interactorNames) {
    let wrappedComponent;

    if(this._isFunctionComponent(component)) {
      wrappedComponent = (props, context) => {
        const property = (propertyString) => getProperty(props, propertyString);
        const dispatch = (actionName, ...args) => props.dispatch([actionName].concat(args));

        return component(property, dispatch);
      }
    } else {
      wrappedComponent = component;

      wrappedComponent.prototype.property = function(propertyString) {
        return getProperty(this.props, propertyString)
      };

      wrappedComponent.prototype.p = wrappedComponent.prototype.property;

      wrappedComponent.prototype.dispatch = function(actionName, ...args) {
        return this.props.dispatch([actionName].concat(args));
      };

      wrappedComponent.prototype.d = wrappedComponent.prototype.dispatch;
    }

    if(interactorNames) {
      return this.connectFunc((state) => this._connectHash(interactorNames, state))(wrappedComponent);
    } else {
      return this.connectFunc((state) => state)(wrappedComponent);
    }
  }

  _isFunctionComponent(Component) {
    return !Component.prototype.render;
  }

  _connectHash(interactorNames, state) {
    let connectHash = {};
    interactorNames.forEach(interactorName => connectHash[interactorName] = state[interactorName]);
    return connectHash;
  }
}

export default Connector
