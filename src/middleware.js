import { getProperty, defineStateGetter } from '~/utils';

class Middleware {
  actionName = null;
  args = null;
  interactorName = null;
  interactorMethod = null;

  constructor({interactorStore, store, next, action}) {
    this.interactorStore = interactorStore;
    this.store = store;
    this.next = next;
    this.action = action;
  }

  perform() {
    if(this._isActionStringOrArray() == false) {
      return this.next(this.action);
    }

    this._parseAction();
    this._handleInteractorAction();

    const result = this.next(this._conventionalActionHash());
    this._handleComputedActions()

    return result;
  }

  _handleInteractorAction() {
    const interactor = this.interactorStore.get(this.interactorName);

    if(interactor == null) {
      console.warn(`No interactor registered as ${this.interactorName}!`)
    } else {
      this._defineInteractorMethods(interactor);
      this._callInteractorAction(interactor);
    }
  }

  _defineInteractorMethods(interactor) {
    interactor._storeState = this.store.getState();
    interactor._dispatch = this.store.dispatch;

    defineStateGetter(interactor, interactor._storeState[this.interactorName]);

    interactor.dispatch = (actionName, ...args) => {
      return interactor._dispatch([actionName].concat(args));
    }

    interactor.d = interactor.dispatch;

    interactor.property = (propertyString) => {
      return getProperty(interactor._storeState, propertyString);
    };

    interactor.p = interactor.property;
  }

  _callInteractorAction(interactor) {
    if(interactor[this.interactorMethod]) {
      const actionResult = interactor[this.interactorMethod].apply(interactor, this.args);

      if (this._isPromise(actionResult)) {
        this._autoDispatchPromise(actionResult);
      }
    }
  }

  _handleComputedActions() {
    const computedActions = this.interactorStore.computedActionHash[this.actionName];
    if(!computedActions) {
      return
    }

    computedActions.forEach((computedAction) => {
      const currentState = this.store.getState();
      this.store.dispatch([computedAction.dispatch].concat(computedAction.with.map((p) => getProperty(currentState, p))));
    })
  }

  _autoDispatchPromise(promise) {
    promise.then((data) => {
      this.store.dispatch([this.actionName + 'Success', data])
    }, (error) => {
      this.store.dispatch([this.actionName + 'Error', error])
    })
  }

  _conventionalActionHash() {
    return {
      type: 'CONV_REDUX/' + this.actionName,
      args: this.args
    };
  }

  _parseAction() {
    if(this.action instanceof Array) {
      this.actionName = this.action[0];
      this.args = this.action.slice(1);
    } else {
      this.actionName = this.action;
    }

    [this.interactorName, this.interactorMethod] = this.actionName.split(':');
  }

  _isActionStringOrArray() {
    return typeof this.action === 'string' || this.action instanceof String || this.action instanceof Array;
  }

  _isPromise(object) {
    return (object && 'function' === typeof object.then);
  }
}

export default Middleware
