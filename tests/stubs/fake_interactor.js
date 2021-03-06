export default class FakeInteractor {
  fetch = jest.fn();
  createSuccess = jest.fn();
  createError = jest.fn();

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

  computedActions() {
    return [
      { after: ['users:computed_1', 'users:computed_2'], dispatch: 'users:computedAction', with: ['users.current_user_id'] },
      { after: ['users:computed_1'], dispatch: 'users:secondComputedAction', with: ['users.state'] },
    ]
  }

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

  create(param) {
    return new Promise((resolve, reject) => {
      param == 'fail' ? reject(param) : resolve(param);
    });
  }

  onFollow(userId) {
    return { ...this.state, followedUser: userId };
  }

  onClear(logoutTime) {
    return {currentUserId: null, logoutTime: logoutTime};
  }
}
