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

      this._defineStateGetter(interactor, state);

      if(action.type && action.type.startsWith("CONV_REDUX/" + name + ':')) {
        const reduceMethodName = this._getReduceMethodName(action);

        if (interactor[reduceMethodName]) {
          return interactor[reduceMethodName].apply(interactor, action.args);
        }
      }

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

  _defineStateGetter(interactor, state) {
    Object.defineProperty(interactor, 'state', {
      get() { return state; },
      set(_) { throw new Error('Cannot modify readonly property state!') },
      configurable: true
    });
  }
}

export default ReducerGenerator
