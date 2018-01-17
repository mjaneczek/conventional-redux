import Store from '~/store';
import Middleware from '~/middleware';
import FakeInteractor from './stubs/fake_interactor';

describe('interactor middleware', () => {
  let interactorStore, middleware, nextMock, action, store;

  beforeEach(() => {
    nextMock = jest.fn();
    store = { dispatch: jest.fn() };

    interactorStore = new Store();
    interactorStore.registerInteractor('users', new FakeInteractor());
  });

  test('calls next with action for standard actions', () => {
    action = {type: 'EXAMPLE', payload: [1,2,3]};
    middleware = new Middleware({interactorStore: interactorStore, store: store, next: nextMock, action: action});
    middleware.perform();

    expect(nextMock.mock.calls.length).toEqual(1);
    expect(nextMock.mock.calls[0][0]).toEqual(action);
  });

  test('calls next with conv redux hash if action format matches', () => {
    middleware = new Middleware({interactorStore: interactorStore, store: store, next: nextMock, action: 'users:fetch' });
    middleware.perform();

    expect(nextMock.mock.calls.length).toEqual(1);
    expect(nextMock.mock.calls[0][0]).toEqual({type: 'CONV_REDUX/users:fetch', args: null});
  });

  test('calls interactor action if defined', () => {
    middleware = new Middleware({interactorStore: interactorStore, store: store, next: nextMock, action: ['users:fetch', 'fake-user-id'] });
    middleware.perform();

    const interactor = interactorStore.interactors()['users'];
    expect(interactor.fetch.mock.calls.length).toEqual(1);
    expect(interactor.fetch.mock.calls[0][0]).toEqual('fake-user-id');
  });

  test('does not call interactor action if not defined', () => {
    middleware = new Middleware({interactorStore: interactorStore, store: store, next: nextMock, action: ['users:delete', 'fake-user-id'] });
    middleware.perform();
  });

  test('throw error if interactor not defined', () => {
    middleware = new Middleware({interactorStore: interactorStore, store: store, next: nextMock, action: ['invalid-interactor-name:delete', 'fake-user-id'] });
    expect(() => middleware.perform()).toThrowError('No interactor registered as invalid-interactor-name!');
  });

  test('delegates dispatch function from the store to interactors', () => {
    middleware = new Middleware({interactorStore: interactorStore, store: store, next: nextMock, action: 'users:all'});
    middleware.perform();

    expect(store.dispatch.mock.calls.length).toEqual(1);
  });

  test('dispatches a promise returned from the interactor action', (done) => {
    middleware = new Middleware({interactorStore: interactorStore, store: store, next: nextMock, action: ['users:create', 'success']});
    middleware.perform();

    middleware = new Middleware({interactorStore: interactorStore, store: store, next: nextMock, action: ['users:create', 'fail']});
    middleware.perform();

    setTimeout(() => {
      expect(store.dispatch.mock.calls.length).toEqual(2);
      expect(store.dispatch.mock.calls[0][0]).toEqual(["users:createSuccess", 'success']);
      expect(store.dispatch.mock.calls[1][0]).toEqual(["users:createError", 'fail']);
      done();
    }, 100);
  });
});
