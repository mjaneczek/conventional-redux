export default class FakeInteractor {
  all() {
    this.dispatch('123');
  }

  fetch = jest.fn();

  create(param) {
    return new Promise((resolve, reject) => {
      param == 'fail' ? reject(param) : resolve(param);
    });
  }

  createSuccess = jest.fn();

  createError = jest.fn();
}
