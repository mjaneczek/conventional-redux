class ImmutableStateAdapter {
  constructor(state) {
    this.state = state
  }

  get(property) {
    return this.state.get(property)
  }

  clear(outdatedReducerKeys) {
    return this.state.filter((value, key) => !outdatedReducerKeys.includes(key))
  }
}

export default ImmutableStateAdapter
