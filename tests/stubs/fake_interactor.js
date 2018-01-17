export default class FakeInteractor {
  fetch = jest.fn();
  createSuccess = jest.fn();
  createError = jest.fn();

  all() {
    this.dispatch('123');
  }

  create(param) {
    return new Promise((resolve, reject) => {
      param == 'fail' ? reject(param) : resolve(param);
    });
  }
}
