class MutableStateAdapter {
  constructor(state) {
    this.state = state
  }

  get(property) {
    return this.state[property]
  }

  clear(outdatedReducerKeys) {
    Object.keys(this.state)
      .filter(key => outdatedReducerKeys.includes(key))
      .forEach(key => delete this.state[key]);

    return this.state;
  }

  mapToProps() {
    return this.state;
  }
}

export default MutableStateAdapter
