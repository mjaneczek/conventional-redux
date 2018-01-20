import Store from '~/store';
import ReducerGenerator from '~/reducer_generator';
import FakeInteractor from './stubs/fake_interactor';

describe('reducer generator', () => {
  const fakeInteractor = new FakeInteractor();
  const exampleState = {currentUserId: 'fake-current-user-id'};
  let interactorStore, generator, reducers, reduce;

  beforeEach(() => {
    interactorStore = new Store();
    interactorStore.registerInteractor('users', fakeInteractor);
    generator = new ReducerGenerator({interactorStore: interactorStore});

    reducers = generator.all();
    reduce = reducers['users'];
  });

  test('generates reducer that do nothing', () => {
    expect(Object.keys(reducers)).toEqual(['users']);
    expect(reduce(exampleState, 'NOT_EXISTING_ACTION')).toEqual(exampleState);
  });

  test('defines readonly state property in interactor', () => {
    reduce(exampleState, 'NOT_EXISTING_ACTION');

    expect(fakeInteractor.state).toEqual(exampleState);
    expect(() => fakeInteractor.state = "NEW_STATE").toThrowError('Cannot modify readonly property state!');
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
});
