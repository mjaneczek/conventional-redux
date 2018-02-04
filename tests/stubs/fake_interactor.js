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

  onFollow(userId) {
    return { ...this.state, followedUser: userId };
  }

  defaultState() {
    return { defaultState: true };
  }

  externalDependencies() {
    return [
      { on: ['LOGOUT'], call: 'onClear' },
      { on: ['users:logout'], call: 'onClear' },
      { on: ['users:makeAdmin', 'users:makeSuperAdmin'], call: 'onSetAdmin' },
    ]
  }

  onClear(logoutTime) {
    return {currentUserId: null, logoutTime: logoutTime};
  }

  computedActions() {
    return [
      { after: ['users:computed_1', 'users:computed_2'], dispatch: 'users:computedAction', with: ['users.current_user_id'] },
      { after: ['users:computed_1'], dispatch: 'users:secondComputedAction', with: ['users.state'] },
    ]
  }
}
