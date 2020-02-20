const Post = require('../../models/Post');
const postFactory = require('../factories/postFactory');

jest.mock('../../models/User', () => ({  
  findByToken: jest.fn().mockReturnValue(require('../factories/userFactory')())
}));

describe('Post model', () => {
  describe('validations', () => {
    let callback;

    beforeEach(() => {
      callback = {
        onError: jest.fn(),
        onStored: jest.fn()
      }
    });

    const requiredFields = ['title', 'content'];

    requiredFields.forEach(field => {
      describe(`when has no ${field}`, () => {
        const props = { [field]: undefined };
        const token = 'token';
        const post = postFactory(props)

        it('calls callback.onError', async () => {
          await Post.store(token, post, callback);

          expect(callback.onError).toBeCalled();
        });

        it('does not call callback.onStored', async () => {
          await Post.store(token, post, callback);

          expect(callback.onStored).not.toBeCalled();
        });
      });
    });
  });
});
