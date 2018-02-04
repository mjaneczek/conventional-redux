import StateAdapter from '~/state_adapter'
import { getProperty } from '~/utils'

class Connector {
  constructor({connectFunc}) {
    this.connectFunc = connectFunc
  }

  connectInteractors(component, interactorNames) {
    let wrappedComponent

    if(this._isFunctionComponent(component)) {
      wrappedComponent = (props, context) => {
        const property = (propertyString) => getProperty(props, propertyString)
        const dispatch = (actionName, ...args) => props.dispatch([actionName].concat(args))

        return component(property, dispatch)
      }

      wrappedComponent.displayName = component.name
    } else {
      wrappedComponent = component

      wrappedComponent.prototype.property = function(propertyString) {
        return getProperty(this.props, propertyString)
      }

      wrappedComponent.prototype.p = wrappedComponent.prototype.property

      wrappedComponent.prototype.dispatch = function(actionName, ...args) {
        return this.props.dispatch([actionName].concat(args))
      }

      wrappedComponent.prototype.d = wrappedComponent.prototype.dispatch
    }

    if(interactorNames) {
      return this.connectFunc((state) => this._connectHash(interactorNames, state))(wrappedComponent)
    } else {
      return this.connectFunc((state) => new StateAdapter(state).mapToProps())(wrappedComponent)
    }
  }

  _isFunctionComponent(Component) {
    return !Component.prototype.render
  }

  _connectHash(interactorNames, state) {
    let connectHash = {}
    const stateAdapter = new StateAdapter(state)

    interactorNames.forEach(interactorName => connectHash[interactorName] = stateAdapter.get(interactorName))
    return connectHash
  }
}

export default Connector
