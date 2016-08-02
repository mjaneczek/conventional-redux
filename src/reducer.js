import { interactors } from '../lib/index'

export function conventionalReducers() {
  var conventionalReducersHash = {};

  for (const name in interactors){
    conventionalReducersHash[name] = conventionalReducer(name);
  }

  return conventionalReducersHash;
}

export function conventionalReducer(name) {
  var interactor = interactors[name];

  return (state = interactor.state, action) => {
    interactor.state = state;

    if(action.type.startsWith("CONV_REDUX/" + name + ':')) {
      var reduceMethodName = getReduceMethodName(action);

      if (interactor[reduceMethodName]) {
        interactor.state = interactor[reduceMethodName].apply(interactor, action.args);
      }
    }

    if(interactor.externalDependencies && interactor.externalDependencies[action.type]) {
      interactor.state = interactor.externalDependencies[action.type].apply(interactor, action.args);
    }

    return interactor.state;
  }
}

function getReduceMethodName(action) {
  var methodName = action.type.replace('CONV_REDUX/', '').split(':').pop();
  return 'on' + methodName.charAt(0).toUpperCase() + methodName.slice(1);
}
