class Store {
  registeredInteractors = {};
  dynamicInteractorNames = [];
  recreateReducerFunction = null;

  interactors() {
    return this.registeredInteractors;
  }

  registerInteractor(name, interactor, options = {}) {
    if(options['dynamic']) {
      this.dynamicInteractorNames.push(name)
    }

    this.registeredInteractors[name] = interactor;
  }

  registerInteractors(interactors, options = {}) {
    for (const name in interactors) {
      this.registerInteractor(name, interactors[name], options);
    }
  }

  replaceDynamicInteractors(interactors) {
    this.removeDynamicInteractors();
    this.registerInteractors(interactors, { dynamic: true });

    if(this.recreateReducerFunction) {
      this.recreateReducerFunction();
    }
  }

  removeDynamicInteractors() {
    this.dynamicInteractorNames.forEach(name => {
      delete this.registeredInteractors[name]
    })
  }

  setRecreateReducerFunction(func) {
    this.recreateReducerFunction = func;
  }
}

export default Store
