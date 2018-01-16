import Store from '~/store';
import FakeInteractor from './stubs/fake_interactor';

describe('interactor store', () => {
  let store;

  beforeEach(() => {
    store = new Store();
  });

  test('no interactors by default', () => {
    expect(store.interactors()).toEqual({});
  });

  test('registers an interactor', () => {
    const projectsInteractor = new FakeInteractor();

    store.registerInteractor('projects', projectsInteractor);
    expect(store.interactors()['projects']).toEqual(projectsInteractor);
  });

  test('registers many interactors', () => {
    const projectsInteractor = new FakeInteractor();
    const usersInteractor = new FakeInteractor();

    store.registerInteractors({projects: projectsInteractor, users: usersInteractor});

    expect(store.interactors()['projects']).toEqual(projectsInteractor);
    expect(store.interactors()['users']).toEqual(usersInteractor);
  });

  describe('dynamic option', () => {
    test('registers a dynamic interactor', () => {
      const projectsInteractor = new FakeInteractor();

      store.registerInteractor('projects', projectsInteractor, { dynamic: true });
      expect(store.interactors()['projects']).toEqual(projectsInteractor);
    });

    test('registers many dynamic interactor', () => {
      const projectsInteractor = new FakeInteractor();
      const usersInteractor = new FakeInteractor();

      store.registerInteractors({projects: projectsInteractor, users: usersInteractor}, { dynamic: true });

      expect(store.interactors()['projects']).toEqual(projectsInteractor);
      expect(store.interactors()['users']).toEqual(usersInteractor);
    });

    test('removes all dynamic interactors', () => {
      const projectsInteractor = new FakeInteractor();
      const usersInteractor = new FakeInteractor();

      store.registerInteractor('projects', projectsInteractor, { dynamic: true });
      store.registerInteractors({users: usersInteractor}, { dynamic: true });

      store.removeDynamicInteractors();
      expect(store.interactors()).toEqual({});
    });

    test('replaces dynamic interactors', () => {
      const projectsInteractor = new FakeInteractor();
      const usersInteractor = new FakeInteractor();

      store.registerInteractors({projects: projectsInteractor, users: usersInteractor}, { dynamic: true });

      const clientsInteractor = new FakeInteractor();
      store.replaceDynamicInteractors({clients: clientsInteractor});

      expect(Object.keys(store.interactors())).toEqual(['clients']);
    });

    test('sets recreate reducer function', () => {
      const mockCallback = jest.fn();

      store.setRecreateReducerFunction(mockCallback);
      store.replaceDynamicInteractors({});

      expect(mockCallback.mock.calls.length).toBe(1);
    });
  });
});
