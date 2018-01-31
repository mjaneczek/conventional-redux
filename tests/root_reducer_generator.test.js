import { fromJS } from 'immutable';
import Store from '~/store';
import RootReducerGenerator from '~/root_reducer_generator';
import FakeInteractor from './stubs/fake_interactor';

describe('root reducer generator', () => {
  const fakeReducersHash = { route: () => 'state' }
  const fakeInteractor = new FakeInteractor();
  const exampleState = { route: 'home', users: [], outdated: true };
  let interactorStore, generator, reducers, reduce, combineReducersFunc, combinedReducer;

  beforeEach(() => {
    combinedReducer = jest.fn().mockReturnValue(exampleState)
    combineReducersFunc = jest.fn().mockReturnValue(combinedReducer)

    interactorStore = new Store();
    interactorStore.registerInteractor('users', fakeInteractor);
    generator = new RootReducerGenerator({interactorStore: interactorStore});
    reduce = generator.root(fakeReducersHash, combineReducersFunc);
  });

  test('passes action and state to combined reducers', () => {
    reduce(exampleState, 'NOT_EXISTING_ACTION')
    expect(combinedReducer.mock.calls[0][0]).toEqual(exampleState);
  });

  test('generates root reducer including covnetional reducers', () => {
    expect(Object.keys(combineReducersFunc.mock.calls[0][0])).toEqual(['route', 'users']);
  });

  test('removes dynamic part of the state (state without reducer) on redux init action', () => {
    reduce(exampleState, { type: '@@redux/INIT' })
    expect(combinedReducer.mock.calls[0][0]).toEqual({route: 'home', users: []});
  });

  test('works with immutablejs state', () => {
    reduce(fromJS(exampleState), { type: '@@redux/INIT' })
    expect(combinedReducer.mock.calls[0][0]).toEqual(fromJS({route: 'home', users: []}));
  });
});
