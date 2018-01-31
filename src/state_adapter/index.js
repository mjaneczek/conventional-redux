import MutableStateAdapter from './mutable_state_adapter';
import ImmutableStateAdapter from './immutable_state_adapter';

class StateAdapter {
  constructor(state) {
    this.state = state
    this.adapter = this._adapterInit();
  }

  get(property) {
    return this.adapter.get(property);
  }

  clear(currentReducerKeys) {
    return this.adapter.clear(currentReducerKeys);
  }

  _adapterInit() {
    if(this.state.get) {
      return new ImmutableStateAdapter(this.state);
    } else {
      return new MutableStateAdapter(this.state);
    }
  }
}

export default StateAdapter
