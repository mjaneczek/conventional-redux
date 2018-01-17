import Store from '~/store';
import FakeInteractor from './stubs/fake_interactor';

describe('interactor store', () => {
  const fakeInteractor = new FakeInteractor();
  let store;

  beforeEach(() => {
    store = new Store();
  });

  test('no interactors by default', () => {
    expect(store.interactors()).toEqual({});
  });

  test('registers an interactor', () => {
    store.registerInteractor('projects', fakeInteractor);
    expect(store.interactors()['projects']).toEqual(fakeInteractor);
  });

  test('registers many interactors', () => {
    store.registerInteractors({projects: fakeInteractor, users: fakeInteractor});

    expect(Object.keys(store.interactors())).toEqual(['projects', 'users']);
    expect(store.interactors()['projects']).toEqual(fakeInteractor);
    expect(store.interactors()['users']).toEqual(fakeInteractor);
  });

  describe('dynamic option', () => {
    test('registers a dynamic interactor', () => {
      store.registerInteractor('projects', fakeInteractor, { dynamic: true });
      expect(store.interactors()['projects']).toEqual(fakeInteractor);
    });

    test('registers many dynamic interactor', () => {
      store.registerInteractors({projects: fakeInteractor, users: fakeInteractor}, { dynamic: true });

      expect(Object.keys(store.interactors())).toEqual(['projects', 'users']);
      expect(store.interactors()['projects']).toEqual(fakeInteractor);
      expect(store.interactors()['users']).toEqual(fakeInteractor);
    });

    test('removes all dynamic interactors', () => {
      store.registerInteractor('projects', fakeInteractor, { dynamic: true });
      store.registerInteractors({users: fakeInteractor}, { dynamic: true });

      store.removeDynamicInteractors();
      expect(store.interactors()).toEqual({});
    });

    test('replaces dynamic interactors', () => {
      store.registerInteractors({projects: fakeInteractor, users: fakeInteractor}, { dynamic: true });
      store.replaceDynamicInteractors({clients: fakeInteractor});

      expect(Object.keys(store.interactors())).toEqual(['clients']);
      expect(store.interactors()['clients']).toEqual(fakeInteractor);
    });

    test('sets recreate reducer function', () => {
      const mockCallback = jest.fn();

      store.setRecreateReducerFunction(mockCallback);
      store.replaceDynamicInteractors({});

      expect(mockCallback.mock.calls.length).toEqual(1);
    });
  });
});
