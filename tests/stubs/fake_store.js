export default class FakeStore {
  dispatch = jest.fn();

  getState() {
    return {
      users: {
        ids: [1,2,3],
        state: 'confirmed',
        current_user_id: 'fake-current-user-id'
      },
      projects: {
        ids: [9,8,7],
        state: 'published'
      }
    }
  }
}
