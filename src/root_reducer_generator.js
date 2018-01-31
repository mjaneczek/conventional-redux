import ReducerGenerator from '~/reducer_generator';

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
        Object.keys(state)
          .filter(key => !reducerKeys.includes(key))
          .forEach(key => delete state[key]);
      }

      return appReducer(state, action)
    }
  }
}

export default RootReducerGenerator
