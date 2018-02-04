import Store from '~/store';
import FakeInteractor from './stubs/fake_interactor';

describe('interactor store', () => {
  const fakeInteractor = new FakeInteractor();
  let store, fakeRecreateReducerFunction;

  beforeEach(() => {
    store = new Store();
    fakeRecreateReducerFunction = jest.fn();
  });

  test('no interactors by default', () => {
    expect(store.interactors()).toEqual({});
  });

  test('registers an interactor', () => {
    store.registerInteractors({projects: fakeInteractor});
    expect(store.interactors()['projects']).toEqual(fakeInteractor);
  });

  test('registers many interactors', () => {
    store.registerInteractors({projects: fakeInteractor, users: fakeInteractor});

    expect(Object.keys(store.interactors())).toEqual(['projects', 'users']);
    expect(store.get('projects')).toEqual(fakeInteractor);
    expect(store.get('users')).toEqual(fakeInteractor);
  });

  test('gets interactor by name', () => {
    store.registerInteractors({projects: fakeInteractor});
    expect(store.get('projects')).toEqual(fakeInteractor);
  });

  test('generates computed actions hash', () => {
    store.registerInteractors({projects: fakeInteractor});

    expect(store.computedActionHash).toEqual({
      'users:computed_1': [{ dispatch: 'users:computedAction', with: ['users.current_user_id'] }, { dispatch: 'users:secondComputedAction', with: ['users.state'] }],
      'users:computed_2': [{ dispatch: 'users:computedAction', with: ['users.current_user_id'] }],
    });
  });

  describe('dynamic option', () => {
    test('registers a dynamic interactor', () => {
      store.registerInteractors({projects: fakeInteractor}, { dynamic: true });
      expect(store.get('projects')).toEqual(fakeInteractor);
    });

    test('registers many dynamic interactor', () => {
      store.registerInteractors({projects: fakeInteractor, users: fakeInteractor}, { dynamic: true });

      expect(Object.keys(store.interactors())).toEqual(['projects', 'users']);
      expect(store.get('projects')).toEqual(fakeInteractor);
      expect(store.get('users')).toEqual(fakeInteractor);
    });

    test('removes all dynamic interactors', () => {
      store.registerInteractors({projects: fakeInteractor, users: fakeInteractor }, { dynamic: true });

      store.removeDynamicInteractors();
      expect(store.interactors()).toEqual({});
    });

    test('sets recreate reducer function', () => {
      store.setRecreateReducerFunction(fakeRecreateReducerFunction);
      store.replaceDynamicInteractors({});

      expect(fakeRecreateReducerFunction.mock.calls.length).toEqual(1);
    });

    test('replaces dynamic interactors', () => {
      store.registerInteractors({projects: fakeInteractor, users: fakeInteractor}, { dynamic: true });
      store.setRecreateReducerFunction(fakeRecreateReducerFunction);
      store.replaceDynamicInteractors({clients: fakeInteractor});

      expect(Object.keys(store.interactors())).toEqual(['clients']);
      expect(store.get('clients')).toEqual(fakeInteractor);
    });

    test('throws error when no recreate reducer function passed', () => {
      expect(() => store.replaceDynamicInteractors({})).toThrowError(/need to set recreate reducer function/);
    });
  });
});
