import Store from '~/store';
import Middleware from '~/middleware';
import FakeInteractor from './stubs/fake_interactor';

describe('interactor middleware', () => {
  let interactorStore;
  let middleware, nextMock, action;

  beforeEach(() => {
    nextMock = jest.fn();

    interactorStore = new Store();
    interactorStore.registerInteractor('users', new FakeInteractor());
  });

  test('calls next with action for standard actions', () => {
    action = {type: 'EXAMPLE', payload: [1,2,3]};
    middleware = new Middleware({interactorStore: interactorStore, store: null, next: nextMock, action: action});
    middleware.perform();

    expect(nextMock.mock.calls.length).toEqual(1);
    expect(nextMock.mock.calls[0][0]).toEqual(action);
  });

  test('calls next with conv redux hash if action format matches', () => {
    middleware = new Middleware({interactorStore: interactorStore, store: null, next: nextMock, action: 'users:fetch' });
    middleware.perform();

    expect(nextMock.mock.calls.length).toEqual(1);
    expect(nextMock.mock.calls[0][0]).toEqual({type: 'CONV_REDUX/users:fetch', args: null});
  });

  test('calls interactor action if defined', () => {
    middleware = new Middleware({interactorStore: interactorStore, store: null, next: nextMock, action: ['users:fetch', 'fake-user-id'] });
    middleware.perform();

    const interactor = interactorStore.interactors()['users'];
    expect(interactor.fetch.mock.calls.length).toEqual(1);
    expect(interactor.fetch.mock.calls[0][0]).toEqual('fake-user-id');
  });


});
