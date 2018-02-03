class Store {
  registeredInteractors = {};
  dynamicInteractorNames = [];
  recreateReducerFunction = null;
  removedDynamicInteractors = [];
  computedActionHash = {};

  get(name) {
    return this.registeredInteractors[name];
  }

  interactors() {
    return this.registeredInteractors;
  }

  registerInteractors(interactors, options = {}) {
    for (const name in interactors) {
      this._registerInteractor(name, interactors[name], options);
    }

    this._generateComputedActionHash()
  }

  replaceDynamicInteractors(interactors) {
    this.removeDynamicInteractors();
    this.registerInteractors(interactors, { dynamic: true });
    this._generateComputedActionHash()

    if(!this.recreateReducerFunction) {
      throw new Error('You need to set recreate reducer function in order to replace dynamic interactors!');
    }

    this.recreateReducerFunction();
  }

  removeDynamicInteractors() {
    this.removedDynamicInteractors = []

    this.dynamicInteractorNames.forEach(name => {
      this.removedDynamicInteractors.push(name)
      delete this.registeredInteractors[name]
    })
  }

  setRecreateReducerFunction(func) {
    this.recreateReducerFunction = func;
  }

  _registerInteractor(name, interactor, options = {}) {
    if(options['dynamic']) {
      this.dynamicInteractorNames.push(name)
    }

    this.registeredInteractors[name] = interactor;
  }

  _generateComputedActionHash() {
    const interactors = Object.values(this.registeredInteractors);
    let result = {};

    interactors.forEach((interactor) => {
      const computedActions = interactor.computedActions ? interactor.computedActions() : [];
      computedActions.forEach((computedAction) => {
        const afterActions = computedAction.after;
        afterActions.forEach((action) => {
          if(result[action] == null) {
            result[action] = []
          }

          result[action].push({ dispatch: computedAction.dispatch, with: computedAction.with })
        });
      })
    })

    this.computedActionHash = result;
  }
}

export default Store
