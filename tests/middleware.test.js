import Store from '~/store';
import Middleware from '~/middleware';
import FakeStore from './stubs/fake_store';
import FakeInteractor from './stubs/fake_interactor';

describe('interactor middleware', () => {
  let interactorStore, middleware, nextMock, action, store;

  beforeEach(() => {
    nextMock = jest.fn();
    store = new FakeStore();

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

  test('delegates native _dispatch function from the store to interactors', () => {
    action = 'users:all';
    buildMiddleware().perform();

    expect(store.dispatch.mock.calls.length).toEqual(1);
    expect(store.dispatch.mock.calls[0][0]).toEqual(['users:fetch', 'all']);
  });

  test('defines easier dispatch method (and alias d) in interactors', () => {
    action = 'users:update';
    buildMiddleware().perform();

    expect(store.dispatch.mock.calls.length).toEqual(2);
    expect(store.dispatch.mock.calls[0][0]).toEqual(['users:update', {id: 1}]);
    expect(store.dispatch.mock.calls[1][0]).toEqual(['users:update', {id: 1}]);
  });

  test('defines property method (and alias p) in interactors', () => {
    action = 'users:logout';
    buildMiddleware().perform();

    expect(store.dispatch.mock.calls.length).toEqual(1);
    expect(store.dispatch.mock.calls[0][0]).toEqual(['users:put', {action: 'logout', user: 'fake-current-user-id'}]);
  });

  test('defines readonly state property in interactor', () => {
    action = 'users:logout';
    buildMiddleware().perform();

    const interactor = interactorStore.get('users');
    expect(interactor.state).toEqual(store.getState()['users']);
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

