import Store from '~/store';
import RootReducerGenerator from '~/root_reducer_generator';
import FakeInteractor from './stubs/fake_interactor';

describe('root reducer generator', () => {
  const fakeInteractor = new FakeInteractor();
  const exampleState = {route: 'home', users: [], outdated: true};
  let interactorStore, generator, reducers, reduce, combineReducersFunc, combinedReducer;

  beforeEach(() => {
    combinedReducer = jest.fn().mockReturnValue(exampleState)
    combineReducersFunc = jest.fn().mockReturnValue(combinedReducer)

    interactorStore = new Store();
    interactorStore.registerInteractor('users', fakeInteractor);
    generator = new RootReducerGenerator({interactorStore: interactorStore});
  });

  test('passes action to combined reducers', () => {
    reduce = generator.root({}, combineReducersFunc);
    expect(reduce(exampleState, 'NOT_EXISTING_ACTION')).toEqual(exampleState);
  });

  test('generates root reducer including covnetional reducers', () => {
    const fakeReducersHash = { route: true }
    reduce = generator.root(fakeReducersHash, combineReducersFunc);

    expect(Object.keys(combineReducersFunc.mock.calls[0][0])).toEqual(['route', 'users']);
  });

  test('removes dynamic part of the state (state without reducer) on redux init action', () => {
    const fakeReducersHash = { route: true }
    reduce = generator.root(fakeReducersHash, combineReducersFunc);

    expect(reduce(exampleState, { type: '@@redux/INIT' })).toEqual({route: 'home', users: []});
  });
});
