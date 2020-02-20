const User = require('./User');
const PostSchema = require('../schemas/PostSchema');
const ObjectId = require('mongoose').Types.ObjectId;

const store = async (token, post, callback) => {
  const user = await User.findByToken(token);

  if (!user) return callback.onError('User does not exist');
  if (!hasRequiredFields(post)) return callback.onError('Required: title and content');

  const serializedPost = serializePost(post, user);

  return persist(serializedPost, callback);
};

const find = async (id, callback) => {
  const post = await findById(id);

  if (post) return callback.onFind({
    title: post.title,
    content: post.content,
    updatedAt: user.updatedAt,
    createdAt: user.createdAt
  });

  return callback.onNotFound();
}

const serializePost = (post, user) => ({
  title: post.title,
  content: post.content,
  user: user._id
});

const hasRequiredFields = post => (
  post.title && post.content
);

const findById = async (id) => await PostSchema.findOne({ _id: new ObjectId(id) });

const persist = async (post, callback) =>
  PostSchema.create(post, (error, small) =>
    error ? callback.onError(error) : callback.onStored(small)
  );

module.exports = {
  store,
  find
}
