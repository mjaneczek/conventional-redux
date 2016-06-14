import { interactors } from '../lib/index'

export function conventionalReducers() {
  var conventionalReducersHash = {};

  for (const name in interactors){
    conventionalReducersHash[name] = conventionalReducer(name);
  }

  return conventionalReducersHash;
}

export function conventionalReducer(name) {
  return (state, action) => {
    if(action.type.startsWith("CONV_REDUX/" + name)) {
      var reduceMethodName = getReduceMethodName(action);
      var interactor = interactors[name];

      if (interactor[reduceMethodName]) {
        interactor.state = interactor[reduceMethodName].apply(interactor, action.args);
      }

      return interactor.state;
    }

    return interactors[name].state;
  }
}

function getReduceMethodName(action) {
  var methodName = action.type.replace('CONV_REDUX/', '').split(':').pop();
  return 'on' + methodName.charAt(0).toUpperCase() + methodName.slice(1);
}
