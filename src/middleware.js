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
    if(this._isActionStringOrArray()) {
      this._parseAction();
      const interactor = this.interactorStore.interactors()[this.interactorName];
      interactor[this.interactorMethod].apply(interactor, this.args);

      return this.next(this._conventionalActionHash());
    }

    return this.next(this.action);
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
}

export default Middleware
