const User = require('./User');
const Post = require('./Post');
const CommentSchema = require('../schemas/CommentSchema');
const ObjectId = require('mongoose').Types.ObjectId;

const store = async (token, comment, postId, callback) => {
  const user = await User.findByToken(token);
  const post = await Post.findById(postId);

  if (!user) return callback.onError('Invalid token');
  if (!post) return callback.onNotFound();
  if (!hasRequiredFields(comment)) return callback.onError('Required: content');

  const serializedComment = serializeComment(comment, user, post);

  return persist(serializedComment, callback);
}

const find = async (id, callback) => {
  const post = await Post.findById(id);

  if (!post) return callback.onNotFound();

  const comments = await findByPost(post);

  return callback.onFind(await withUser(comments));
}

const withUser = async (comments) => await Promise.all(comments.map(async (comment) => {
  const user = await User.findById(comment.user);

  return {
    content: comment.content,
    createdAt: comment.createdAt,
    updatedAt: comment.updatedAt,
    user: {
      image: user.image,
      username: user.username
    }
  }
}));

const remove = async (id, token, callback) => {
  const user = await User.findByToken(token);
  const comment = await findById(id);

  if (!comment) return callback.onNotFound();
  if (!user) return callback.onError('Invalid token');
  if (User.isSameId(user, { _id: comment.user })) return await deleteById(id, callback);

  return callback.onNotAllowed();
}

const deleteById = async (id, callback) => await CommentSchema.deleteOne({
  _id: new ObjectId(id)
}, error => error ? callback.onError(error) : callback.onDeleted());

const findByPost = async (post) =>
  await CommentSchema.find({ post: new ObjectId(post._id) }).sort({ createdAt: 'desc' });

const findById = async (id) => await CommentSchema.findOne({ _id: new ObjectId(id) });

const serializeComment = (comment, user, post) => ({
  content: comment.content,
  user: user._id,
  post: post._id
});

const persist = async (comment, callback) =>
  CommentSchema.create(comment, (error, small) =>
    error ? callback.onError(error) : callback.onStored(small)
  );

const hasRequiredFields = comment => Boolean(comment.content);

module.exports = {
  store,
  find,
  remove
}
