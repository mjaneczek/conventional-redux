import StateAdapter from '~/state_adapter'
import { getProperty } from '~/utils'
import { settings } from '~/settings'

class Connector {
  constructor({connectFunc}) {
    this.connectFunc = connectFunc
  }

  connectInteractors(component, interactorNames) {
    const wrappedComponent = this._wrapComponent(component)

    if(interactorNames) {
      return this.connectFunc((state) => this._connectHash(interactorNames, state))(wrappedComponent)
    } else {
      return this.connectFunc((state) => new StateAdapter(state).mapToProps())(wrappedComponent)
    }
  }

  _wrapComponent(component) {
    if(this._isFunctionComponent(component)) {
      return this._wrapFunctionComponent(component)
    } else {
      return this._wrapClassComponent(component)
    }
  }

  _wrapFunctionComponent(component) {
    const wrappedComponent = (props, context) => {
      const property = (propertyString) => getProperty(props, propertyString)
      const dispatch = (actionName, ...args) => props.dispatch([actionName].concat(args))

      return component(settings.useNativeProps ? props : property, dispatch)
    }

    wrappedComponent.displayName = component.name
    return wrappedComponent
  }

  _wrapClassComponent(component) {
    component.prototype.property = function(propertyString) {
      return getProperty(this.props, propertyString)
    }

    component.prototype.p = component.prototype.property

    component.prototype.dispatch = function(actionName, ...args) {
      return this.props.dispatch([actionName].concat(args))
    }

    component.prototype.d = component.prototype.dispatch
    return component
  }

  _isFunctionComponent(Component) {
    return !Component.prototype.render
  }

  _connectHash(interactorNames, state) {
    const stateAdapter = new StateAdapter(state)

    let connectHash = {}
    interactorNames.forEach(interactorName => connectHash[interactorName] = stateAdapter.get(interactorName))
    return connectHash
  }
}

export default Connector
