import ReducerGenerator from '~/reducer_generator';
import StateAdapter from '~/state_adapter';

class RootReducerGenerator {
  constructor({interactorStore}) {
    this.interactorStore = interactorStore;
    this.reducersGenerator = new ReducerGenerator({interactorStore: interactorStore})
  }

  root(appReducers, combineReducersFunc) {
    const reducers = {
      ...appReducers,
      ...this.reducersGenerator.all()
    }

    const reducerKeys = Object.keys(reducers);
    const appReducer = combineReducersFunc(reducers)

    return (state, action) => {
      if(action.type == "@@redux/INIT") {
        state = new StateAdapter(state).clear(this.interactorStore.removedDynamicInteractors)
      }

      return appReducer(state, action)
    }
  }
}

export default RootReducerGenerator
