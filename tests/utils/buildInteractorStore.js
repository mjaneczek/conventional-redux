import Store from '~/store';

export default function(interactors, dynamic = false) {
  const interactorStore = new Store();

  interactorStore.registerInteractors(interactors, { dynamic: dynamic });
  interactorStore.setRecreateReducerFunction(()=>true);

  return interactorStore;
}
