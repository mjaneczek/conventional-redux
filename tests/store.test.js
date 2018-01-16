import Store from '~/store';

test('no interactors by default', () => {
  const store = new Store();
  expect(store.interactors()).toEqual([]);
});
