import buildInteractorStore from './utils/buildInteractorStore';
import RootReducerGenerator from '~/root_reducer_generator';
import FakeInteractor from './stubs/fake_interactor';

describe('root reducer generator', () => {
  const fakeReducersHash = { route: () => 'state' }
  const fakeInteractor = new FakeInteractor();
  const exampleState = { route: 'home', users: [] };
  let interactorStore, generator, reduce, combineReducersFunc, combinedReducer;

  beforeEach(() => {
    combinedReducer = jest.fn().mockReturnValue(exampleState)
    combineReducersFunc = jest.fn().mockReturnValue(combinedReducer)

    interactorStore = buildInteractorStore({users: fakeInteractor}, true)
    generator = new RootReducerGenerator({interactorStore: interactorStore});

    reduce = generator.root(fakeReducersHash, combineReducersFunc);
  });

  test('generates root reducer including covnetional reducers', () => {
    expect(Object.keys(combineReducersFunc.mock.calls[0][0])).toEqual(['route', 'users']);
  });

  test('passes action and state to combined reducers', () => {
    reduce(exampleState, 'NOT_EXISTING_ACTION')
    expect(combinedReducer.mock.calls[0][0]).toEqual(exampleState);
  });

  test('removes dynamic part of the state (dynamic interactors state) on redux init action', () => {
    interactorStore.replaceDynamicInteractors({})

    reduce(exampleState, { type: '@@redux/INIT' })
    expect(combinedReducer.mock.calls[0][0]).toEqual({route: 'home'});
  });
});
