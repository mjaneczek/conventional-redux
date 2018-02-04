import { fromJS } from 'immutable';
import buildInteractorStore from '../utils/buildInteractorStore';
import RootReducerGenerator from '~/root_reducer_generator';
import FakeInteractor from '../stubs/fake_interactor';

describe('immutablejs: root reducer generator', () => {
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

  test('works with immutablejs state', () => {
    interactorStore.replaceDynamicInteractors({})
    reduce(fromJS(exampleState), { type: '@@redux/INIT' })

    expect(combinedReducer.mock.calls[0][0]).toEqual(fromJS({route: 'home'}));
  });
});
