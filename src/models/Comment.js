const User = require('./User');
const Post = require('./Post');
const CommentSchema = require('../schemas/CommentSchema');

const store = async (token, comment, postId, callback) => {
  const user = await User.findByToken(token);
  const post = await Post.findById(postId);

  if (!user) return callback.onError('Invalid token');
  if (!post) return callback.onNotFound();
  if (!hasRequiredFields(comment)) return callback.onError('Required: content');

  const serializedComment = serializeComment(comment, user, post);

  return persist(serializedComment, callback);
}

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
  store
}
