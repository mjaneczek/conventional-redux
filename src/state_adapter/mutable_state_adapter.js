class MutableStateAdapter {
  constructor(state) {
    this.state = state
  }

  get(property) {
    return this.state[property]
  }

  clear(currentReducerKeys) {
    Object.keys(this.state)
      .filter(key => !currentReducerKeys.includes(key))
      .forEach(key => delete this.state[key]);

    return this.state;
  }
}

export default MutableStateAdapter
