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
    buildMiddleware().perform();

    expect(nextMock.mock.calls.length).toEqual(1);
    expect(nextMock.mock.calls[0][0]).toEqual(action);
  });

  test('calls next with conv redux hash if action format matches', () => {
    action = 'users:fetch'
    buildMiddleware().perform();

    expect(nextMock.mock.calls.length).toEqual(1);
    expect(nextMock.mock.calls[0][0]).toEqual({type: 'CONV_REDUX/users:fetch', args: null});
  });

  test('calls interactor action if defined', () => {
    action = ['users:fetch', 'fake-user-id']
    buildMiddleware().perform();

    const interactor = interactorStore.get('users');
    expect(interactor.fetch.mock.calls.length).toEqual(1);
    expect(interactor.fetch.mock.calls[0][0]).toEqual('fake-user-id');
  });

  test('does not call interactor action if not defined', () => {
    action = ['users:delete', 'fake-user-id']
    buildMiddleware().perform();
  });

  test('throw error if interactor not defined', () => {
    action = ['invalid-interactor-name:delete', 'fake-user-id']
    expect(() => buildMiddleware().perform()).toThrowError('No interactor registered as invalid-interactor-name!');
  });

  test('delegates dispatch function from the store to interactors', () => {
    action = 'users:all';
    buildMiddleware().perform();

    expect(store.dispatch.mock.calls.length).toEqual(1);
  });

  test('dispatches a promise returned from the interactor action', (done) => {
    action = ['users:create', 'success']
    buildMiddleware().perform();

    action = ['users:create', 'fail']
    buildMiddleware().perform();

    setTimeout(() => {
      expect(store.dispatch.mock.calls.length).toEqual(2);
      expect(store.dispatch.mock.calls[0][0]).toEqual(["users:createSuccess", 'success']);
      expect(store.dispatch.mock.calls[1][0]).toEqual(["users:createError", 'fail']);
      done();
    }, 50);
  });

  function buildMiddleware() {
    return new Middleware({interactorStore: interactorStore, store: store, next: nextMock, action: action});
  }
});

