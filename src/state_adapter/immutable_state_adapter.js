class ImmutableStateAdapter {
  constructor(state) {
    this.state = state
  }

  get(property) {
    return this.state.get(property)
  }

  clear(currentReducerKeys) {
    return this.state.filter((value, key) => currentReducerKeys.includes(key))
  }
}

export default ImmutableStateAdapter
