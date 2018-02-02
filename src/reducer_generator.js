import { defineStateGetter } from '~/utils';

class ReducerGenerator {
  constructor({interactorStore}) {
    this.interactorStore = interactorStore;
  }

  all() {
    let conventionalReducersHash = {};

    for (const name in this.interactorStore.interactors()) {
      conventionalReducersHash[name] = this._generateConventionalReducer(name);
    }

    return conventionalReducersHash;
  }

  _generateConventionalReducer(name) {
    const interactor = this.interactorStore.get(name);

    return (state, action) => {
      if(state == null)
        state = this._getDefaultState(interactor);

      defineStateGetter(interactor, state);

      state = this._handleConventionalAction(name, action, interactor, state);
      state = this._handleExternalDependencies(action, interactor, state);

      return state;
    }
  }

  _handleConventionalAction(name, action, interactor, state) {
    if(action.type && action.type.startsWith(`CONV_REDUX/${name}:`)) {
      const reduceMethodName = this._getReduceMethodName(action);

      if (interactor[reduceMethodName]) {
        return interactor[reduceMethodName].apply(interactor, action.args);
      }
    } else {
      return state;
    }
  }

  _handleExternalDependencies(action, interactor, state) {
    if(interactor.externalDependencies && action.type) {

      let newState = state;

      interactor.externalDependencies().forEach((externalDependency) => {
        if(externalDependency.on == action.type || action.type.replace('CONV_REDUX/', '') == externalDependency.on ||
          (Array.isArray(externalDependency.on) && externalDependency.on.includes(action.type)) || (Array.isArray(externalDependency.on) && externalDependency.on.includes(action.type.replace('CONV_REDUX/', '')))) {
          newState = externalDependency.call.apply(interactor, action.args)
        }
      });

      return newState;

    } else {
      return state;
    }
  }

  _getDefaultState(interactor) {
    if(interactor['defaultState']) {
      return interactor.defaultState();
    } else {
      return null;
    }
  }

  _getReduceMethodName(action) {
    const methodName = action.type.replace('CONV_REDUX/', '').split(':').pop();
    return 'on' + methodName.charAt(0).toUpperCase() + methodName.slice(1);
  }
}

export default ReducerGenerator
