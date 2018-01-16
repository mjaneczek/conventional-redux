export default class Store {
  registeredInteractors = {};
  dynamicInteractorKeys = [];
  recreateReducerFunction = null;

  interactors() {
    return this.registeredInteractors;
  }

  registerInteractor(name, interactor, options = {}) {
    if(options['dynamic']) {
      this.dynamicInteractorKeys.push(name)
    }

    this.registeredInteractors[name] = interactor;
  }

  registerInteractors(interactors, options = {}) {
    for (const name in interactors) {
      this.registerInteractor(name, interactors[name], options);
    }
  }

  removeDynamicInteractors() {
    this.dynamicInteractorKeys.forEach(key => {
      delete this.registeredInteractors[key]
    })
  }

  setRecreateReducerFunction(func) {
    this.recreateReducerFunction = func;
  }

  replaceDynamicInteractors(interactors) {
    this.removeDynamicInteractors();
    this.registerInteractors(interactors, { dynamic: true });

    if(this.recreateReducerFunction) {
      this.recreateReducerFunction();
    }
  }
}
