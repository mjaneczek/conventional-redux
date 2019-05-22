import buildInteractorStore from './utils/buildInteractorStore';
import Middleware from '~/middleware';
import FakeStore from './stubs/fake_store';
import FakeInteractor from './stubs/fake_interactor';

describe('interactor middleware', () => {
  let interactorStore, middleware, nextMock, store;

  beforeEach(() => {
    nextMock = jest.fn();
    store = new FakeStore();
    interactorStore = buildInteractorStore({users: new FakeInteractor()});
  });

  test('calls next with action for standard actions', () => {
    const action = {type: 'EXAMPLE', payload: [1,2,3]};
    buildMiddleware(action).perform();

    expect(nextMock.mock.calls.length).toEqual(1);
    expect(nextMock.mock.calls[0][0]).toEqual(action);
  });

  test('calls next with conv redux hash if action format matches', () => {
    buildMiddleware('users:fetch').perform();

    expect(nextMock.mock.calls.length).toEqual(1);
    expect(nextMock.mock.calls[0][0]).toEqual({type: 'CONV_REDUX/users:fetch', args: null});
  });

  test('calls interactor action if defined', () => {
    buildMiddleware(['users:fetch', 'fake-user-id']).perform();

    const interactor = interactorStore.get('users');
    expect(interactor.fetch.mock.calls.length).toEqual(1);
    expect(interactor.fetch.mock.calls[0][0]).toEqual('fake-user-id');
  });

  test('works (do nothing) if action not defined', () => {
    buildMiddleware(['users:delete', 'fake-user-id']).perform();
  });

  test('works when interactor not defined', () => {
    const action = ['invalid-interactor-name:delete', 'fake-user-id']
    buildMiddleware(action).perform();
  });

  test('delegates native _dispatch function from the store to interactors', () => {
    buildMiddleware('users:all').perform();

    expect(store.dispatch.mock.calls.length).toEqual(1);
    expect(store.dispatch.mock.calls[0][0]).toEqual(['users:fetch', 'all']);
  });

  test('defines easier dispatch method (and alias d) in interactors', () => {
    buildMiddleware('users:update').perform();

    expect(store.dispatch.mock.calls.length).toEqual(2);
    expect(store.dispatch.mock.calls[0][0]).toEqual(['users:update', {id: 1}]);
    expect(store.dispatch.mock.calls[1][0]).toEqual(['users:update', {id: 1}]);
  });

  test('defines property method (and alias p) in interactors', () => {
    buildMiddleware('users:logout').perform();

    expect(store.dispatch.mock.calls.length).toEqual(1);
    expect(store.dispatch.mock.calls[0][0]).toEqual(['users:put', {action: 'logout', user: 'fake-current-user-id'}]);
  });

  test('defines readonly state property in interactor', () => {
    buildMiddleware('users:logout').perform();

    const interactor = interactorStore.get('users');
    expect(interactor.state).toEqual(store.getState()['users']);
  });

  test('dispatches a promise returned from the interactor action', (done) => {
    buildMiddleware(['users:create', 'success']).perform();
    buildMiddleware(['users:create', 'fail']).perform();

    setTimeout(() => {
      expect(store.dispatch.mock.calls.length).toEqual(2);
      expect(store.dispatch.mock.calls[0][0]).toEqual(["users:createSuccess", 'success']);
      expect(store.dispatch.mock.calls[1][0]).toEqual(["users:createError", 'fail']);

      done();
    }, 50);
  });

  test('handles computed actions', () => {
    buildMiddleware(['users:computed_1', 1]).perform();
    buildMiddleware(['users:computed_2', 2]).perform();

    expect(store.dispatch.mock.calls.length).toEqual(3);
    expect(store.dispatch.mock.calls[0][0]).toEqual(['users:computedAction', 'fake-current-user-id']);
    expect(store.dispatch.mock.calls[1][0]).toEqual(['users:secondComputedAction', 'confirmed']);
    expect(store.dispatch.mock.calls[2][0]).toEqual(['users:computedAction', 'fake-current-user-id']);
  });

  function buildMiddleware(action) {
    return new Middleware({interactorStore: interactorStore, store: store, next: nextMock, action: action});
  }
});

