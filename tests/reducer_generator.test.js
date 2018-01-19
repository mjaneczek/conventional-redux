import Store from '~/store';
import ReducerGenerator from '~/reducer_generator';
import FakeInteractor from './stubs/fake_interactor';

describe('reducer generator', () => {
  const fakeInteractor = new FakeInteractor();
  let interactorStore, generator;

  beforeEach(() => {
    interactorStore = new Store();
    interactorStore.registerInteractor('users', fakeInteractor);
    generator = new ReducerGenerator({interactorStore: interactorStore});
  });

  test('generates reducer that do nothing', () => {
    const reducers = generator.all();
    const reduce = reducers['users'];

    expect(Object.keys(reducers)).toEqual(['users']);

    const exampleState = {location: 'home'};
    expect(reduce(exampleState, 'NOT_EXISTING_ACTION')).toEqual(exampleState);
  });

  test('defines readonly state property in interactor', () => {
    const reducers = generator.all();
    const reduce = reducers['users'];
    const exampleState = {location: 'home'};

    reduce(exampleState, 'NOT_EXISTING_ACTION');
    expect(fakeInteractor.state).toEqual(exampleState);
    expect(() => fakeInteractor.state = "NEW_STATE").toThrowError('Cannot modify readonly property state!');
  });

  test('uses default state from interactor method', () => {
    const reducers = generator.all();
    const reduce = reducers['users'];

    expect(reduce(null, 'NOT_EXISTING_ACTION')).toEqual({defaultState: true});
  });

  test('uses interactor reduce method for conv redux actions', () => {
    const reducers = generator.all();
    const reduce = reducers['users'];
    const exampleState = {location: 'home'};

    expect(reduce(exampleState, { type: 'CONV_REDUX/users:follow', args: [1] })).toEqual({location: 'home', followedUser: 1});
  });
});
