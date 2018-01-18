export default class FakeInteractor {
  all() {
    this._dispatch(['users:fetch', 'all']);
  }

  update() {
    this.dispatch('users:update', {id: 1});
    this.d('users:update', {id: 1});
  }

  logout() {
    const userId = this.p('users.current_user_id');
    this.d('users:put', {action: 'logout', user: userId});
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
