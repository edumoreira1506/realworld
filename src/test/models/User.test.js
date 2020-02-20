const User = require('../../models/User');
const userFactory = require('../factories/userFactory');

jest.mock('../../schemas/UserSchema', () => ({  
  findOne: jest.fn().mockReturnValue(require('../factories/userFactory')())
}));

describe('User model', () => {
  describe('validations', () => {
    let callback;

    beforeEach(() => {
      callback = {
        onError: jest.fn(),
        onStored: jest.fn()
      }
    });

    const requiredFields = ['username', 'password', 'email', 'confirmPassword'];

    requiredFields.forEach(field => {
      describe(`when has no ${field}`, () => {
        const props = { [field]: undefined };
        const user = userFactory(props)

        it('calls callback.onError', () => {
          User.store(user, callback);

          expect(callback.onError).toBeCalled();
        });

        it('does not call callback.onStored', () => {
          User.store(user, callback);

          expect(callback.onStored).not.toBeCalled();
        });
      });
    });
  });
});
