import Store from '~/store';
import ReducerGenerator from '~/reducer_generator';
import FakeInteractor from './stubs/fake_interactor';
import FakeInteractorWithoutDefaultState from './stubs/fake_interactor_without_default_state';

describe('reducer generator', () => {
  const fakeInteractor = new FakeInteractor();
  const exampleState = {currentUserId: 'fake-current-user-id'};
  let interactorStore, generator, reducers, reduce;

  beforeEach(() => {
    interactorStore = new Store();
    interactorStore.registerInteractors({users: fakeInteractor, nostate: new FakeInteractorWithoutDefaultState()});
    generator = new ReducerGenerator({interactorStore: interactorStore});

    reducers = generator.all();
    reduce = reducers['users'];
  });

  test('generates reducer that do nothing', () => {
    expect(Object.keys(reducers)).toEqual(['users', 'nostate']);
    expect(reduce(exampleState, 'NOT_EXISTING_ACTION')).toEqual(exampleState);
  });

  test('defines readonly state property in interactor', () => {
    reduce(exampleState, 'NOT_EXISTING_ACTION');

    expect(fakeInteractor.state).toEqual(exampleState);
    expect(() => fakeInteractor.state = "NEW_STATE").toThrowError('Cannot modify readonly property state!');
  });

  test('checks if default reducer state is nulll', () => {
    reduce = reducers['nostate'];
    expect(reduce(null, 'NOT_EXISTING_ACTION')).toEqual(null);
  });

  test('uses default state from interactor method', () => {
    expect(reduce(null, 'NOT_EXISTING_ACTION')).toEqual(fakeInteractor.defaultState());
  });

  test('uses interactor reduce method for conv redux actions', () => {
    expect(reduce(exampleState, { 
      type: 'CONV_REDUX/users:follow',
      args: [1] }
    )).toEqual(Object.assign({}, exampleState, {followedUser: 1}));
  });

  test('calls additional reducer for external action types', () => {
    expect(reduce(exampleState, {
      type: 'LOGOUT',
      args: ['now'] }
    )).toEqual({currentUserId: null, logoutTime: 'now'});
  });

  test('calls additional reducer for external conventional action types', () => {
    expect(reduce(exampleState, {
      type: 'CONV_REDUX/users:logout',
      args: ['now'] }
    )).toEqual({currentUserId: null, logoutTime: 'now'});
  });
});
